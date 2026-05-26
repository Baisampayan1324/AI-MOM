from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.responses import JSONResponse
from typing import Optional, Dict
import os
import re
import tempfile
import shutil
import logging
import uuid
from pathlib import Path
from datetime import datetime
from pydantic import BaseModel
from app.services.multi_api_processor import MultiAPIProcessor
from app.services.audio_processor import AudioProcessor
from app.services.summarizer import Summarizer
from app.services.mongo_store import MongoDiarizationStore
from app.models.schemas import ProcessResponse, AudioProcessRequest, UserProfile
from app.services.user_profile import UserProfileService
from app.api.websocket import send_progress_update

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
multi_processor = MultiAPIProcessor()
audio_processor = AudioProcessor()
summarizer = Summarizer()
user_profile_service = UserProfileService()
mongo_diarization_store = MongoDiarizationStore()

@router.post("/process-audio", response_model=ProcessResponse)
async def process_audio_file(
    background_tasks: BackgroundTasks,
    file_path: Optional[str] = None,
    file: Optional[UploadFile] = File(None),
    session_id: Optional[str] = None,
    groq_api_key: Optional[str] = Form(None),
    openrouter_api_key: Optional[str] = Form(None)
):
    """
    Process audio file using multi-API approach.
    Can accept either a file path or uploaded file.
    """
    # Create progress callback if session_id provided
    async def progress_callback(percentage: int, message: str, step: int):
        if session_id:
            await send_progress_update(session_id, percentage, message, step)
    
    try:
        session_record_id = session_id or uuid.uuid4().hex

        if file_path:
            # Process from file path
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found")

            logger.info(f"Processing audio from path: {file_path}")

            # Extract audio features
            audio_data, sample_rate = audio_processor.load_audio(file_path)

            # Perform fast speaker diarization
            diarization_result = audio_processor.perform_speaker_diarization_fast(audio_data, sample_rate)

            # Get transcription using 2-model parallel approach (~20 seconds)
            transcription_result = await multi_processor.process_transcription_2_model(
                audio_data, 
                groq_api_key=groq_api_key, 
                openrouter_api_key=openrouter_api_key
            )

            # Generate comprehensive summary with key points, action items, and conclusion
            comprehensive_summary = await summarizer.generate_comprehensive_summary(
                transcription_result['transcription'],
                api_key=groq_api_key
            )

            response = ProcessResponse(
                transcription=transcription_result['transcription'],
                full_summary=comprehensive_summary.get('full_summary'),
                key_points=comprehensive_summary.get('key_points', []),
                action_items=comprehensive_summary.get('action_items', []),
                conclusion=comprehensive_summary.get('conclusion'),
                processing_time=transcription_result['processing_time'],
                api_used="fast_multi_api",
                speaker_count=diarization_result.get('speaker_count', 1),
                speakers=diarization_result.get('segments', [])
            )

            mongo_diarization_store.save_session(
                session_id=session_record_id,
                transcript=transcription_result['transcription'],
                speaker_count=diarization_result.get('speaker_count', 1),
                segments=diarization_result.get('segments', []),
                source=file_path,
                metadata={"filename": os.path.basename(file_path), "mode": "file_path"},
            )

            return response

        elif file:
            # Process uploaded file
            filename = file.filename or "uploaded_audio.mp3"
            logger.info(f"Processing uploaded file: {filename}")

            # Create a unique temporary file to avoid conflicts
            temp_dir = tempfile.gettempdir()
            # Add timestamp and UUID to ensure uniqueness
            file_extension = os.path.splitext(filename)[1] or '.mp3'
            unique_filename = f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
            temp_path = os.path.join(temp_dir, unique_filename)
            
            try:
                # Save uploaded file
                with open(temp_path, "wb") as buffer:
                    content = await file.read()
                    buffer.write(content)
                
                logger.info(f"File saved to: {temp_path} (original: {filename})")

                # Process
                audio_data, sample_rate = audio_processor.load_audio(temp_path)

                # Perform fast speaker diarization
                diarization_result = audio_processor.perform_speaker_diarization_fast(audio_data, sample_rate)

                transcription_result = await multi_processor.process_transcription_ultra_fast(
                    audio_data, 
                    progress_callback,
                    groq_api_key=groq_api_key
                )
                
                # Generate comprehensive summary
                comprehensive_summary = await summarizer.generate_comprehensive_summary(
                    transcription_result['transcription'],
                    api_key=groq_api_key
                )

                # Cleanup immediately after processing (don't wait for background task)
                try:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                        logger.info(f"Cleaned up temp file: {temp_path}")
                except Exception as cleanup_error:
                    logger.warning(f"Failed to cleanup temp file: {cleanup_error}")

                response = ProcessResponse(
                    transcription=transcription_result['transcription'],
                    full_summary=comprehensive_summary.get('full_summary'),
                    key_points=comprehensive_summary.get('key_points', []),
                    action_items=comprehensive_summary.get('action_items', []),
                    conclusion=comprehensive_summary.get('conclusion'),
                    processing_time=transcription_result['processing_time'],
                    api_used="fast_multi_api",
                    speaker_count=diarization_result.get('speaker_count', 1),
                    speakers=diarization_result.get('segments', [])
                )

                mongo_diarization_store.save_session(
                    session_id=session_record_id,
                    transcript=transcription_result['transcription'],
                    speaker_count=diarization_result.get('speaker_count', 1),
                    segments=diarization_result.get('segments', []),
                    source=filename,
                    metadata={"temp_path": temp_path, "mode": "upload"},
                )

                return response
            
            except Exception as file_error:
                # Cleanup on error
                try:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                        logger.info(f"Cleaned up temp file after error: {temp_path}")
                except:
                    pass
                raise file_error

        else:
            raise HTTPException(status_code=400, detail="Either file_path or file must be provided")

    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.post("/process-realtime-chunk")
async def process_realtime_chunk(request: AudioProcessRequest):
    """
    Process real-time audio chunk with multi-API optimization.
    """
    try:
        # Process chunk (pass language hint if provided)
        language = getattr(request, 'language', None)
        result = await multi_processor.process_realtime_chunk(
            request.audio_data,
            request.sample_rate or 16000,
            language=language
        )

        return {
            "transcription": result['transcription'],
            "speaker_id": result.get('speaker_id'),
            "confidence": result.get('confidence', 0.0)
        }

    except Exception as e:
        logger.error(f"Error processing chunk: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chunk processing failed: {str(e)}")

@router.post("/user-profile")
async def create_or_update_user_profile(profile: UserProfile):
    """
    Create or update user profile for personalized experiences.
    """
    try:
        user_profile_service.update_profile(profile)
        return {"message": "Profile updated successfully", "profile": profile}
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")

@router.post("/generate-summary")
async def generate_summary(request: dict):
    """
    Generate comprehensive AI summary from transcription text.
    Used by real-time recording when the user stops the live session.
    """
    try:
        transcription = request.get("transcription", "")
        speaker_stats = request.get("speaker_stats") or []  # [{speaker, turns, words}]

        if not transcription or len(transcription.strip()) < 10:
            raise HTTPException(status_code=400, detail="Transcription text is required and must be at least 10 characters")

        logger.info(f"Generating summary for transcription ({len(transcription)} chars)")

        comprehensive_summary = await summarizer.generate_comprehensive_summary(transcription)

        speaker_participation = comprehensive_summary.get('speaker_participation') or []
        if speaker_stats and not speaker_participation:
            speaker_participation = [
                {
                    "speaker": item.get("speaker", f"Speaker {idx + 1}"),
                    "contribution": f"{item.get('turns', 0)} turn(s), {item.get('words', 0)} word(s)",
                }
                for idx, item in enumerate(speaker_stats)
            ]

        logger.info("Summary generated successfully")

        return {
            "full_summary": comprehensive_summary.get('full_summary'),
            "key_points": comprehensive_summary.get('key_points', []),
            "key_decisions": comprehensive_summary.get('key_decisions', []),
            "action_items": comprehensive_summary.get('action_items', []),
            "speaker_participation": speaker_participation,
            "speaker_count": len(speaker_stats) if speaker_stats else None,
            "conclusion": comprehensive_summary.get('conclusion'),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")

@router.get("/user-profile")
async def get_user_profile():
    """
    Get current user profile.
    """
    try:
        profile = user_profile_service.get_profile()
        return profile
    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profile retrieval failed: {str(e)}")

@router.get("/system-info")
async def get_system_info():
    """
    Get system information and API status.
    """
    return {
        "gpu_available": audio_processor.check_gpu(),
        "apis_status": await multi_processor.check_apis(),
        "version": "2.0.0"
    }


class ApiKeysPayload(BaseModel):
    groq_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    huggingface_token: Optional[str] = None


_ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"


def _update_env_file(updates: Dict[str, str]) -> None:
    """Write or replace keys in backend/.env, preserving other lines."""
    lines = []
    if _ENV_PATH.exists():
        lines = _ENV_PATH.read_text(encoding="utf-8").splitlines()

    remaining = dict(updates)
    for idx, raw in enumerate(lines):
        stripped = raw.lstrip()
        if not stripped or stripped.startswith("#"):
            continue
        match = re.match(r"^([A-Z0-9_]+)\s*=", stripped)
        if not match:
            continue
        key = match.group(1)
        if key in remaining:
            lines[idx] = f"{key}={remaining.pop(key)}"

    if remaining:
        if lines and lines[-1].strip() != "":
            lines.append("")
        for key, value in remaining.items():
            lines.append(f"{key}={value}")

    _ENV_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


@router.get("/keys/status")
async def get_keys_status():
    """Return whether real API keys are configured (no values leaked)."""
    groq = os.getenv("GROQ_API_KEY", "")
    openrouter = os.getenv("OPENROUTER_API_KEY", "")

    def _configured(value: str) -> bool:
        return bool(value) and not value.startswith("dummy_")

    return {
        "groq_configured": _configured(groq),
        "openrouter_configured": _configured(openrouter),
        "huggingface_configured": bool(os.getenv("HUGGINGFACE_TOKEN", "")),
    }


@router.post("/keys")
async def set_api_keys(payload: ApiKeysPayload):
    """Persist BYOK API keys into backend/.env and refresh in-process env vars."""
    updates: Dict[str, str] = {}
    if payload.groq_api_key:
        updates["GROQ_API_KEY"] = payload.groq_api_key.strip()
    if payload.openrouter_api_key:
        updates["OPENROUTER_API_KEY"] = payload.openrouter_api_key.strip()
    if payload.huggingface_token:
        updates["HUGGINGFACE_TOKEN"] = payload.huggingface_token.strip()

    if not updates:
        raise HTTPException(status_code=400, detail="At least one API key must be provided")

    try:
        _update_env_file(updates)
    except Exception as exc:
        logger.error(f"Failed to update .env: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to write .env: {exc}")

    # Update in-process env + processor clients so live transcription works immediately.
    for key, value in updates.items():
        os.environ[key] = value

    try:
        from groq import Groq
        import openai
        if "GROQ_API_KEY" in updates:
            multi_processor.default_groq_key = updates["GROQ_API_KEY"]
            multi_processor.groq_client = Groq(api_key=updates["GROQ_API_KEY"])
            multi_processor.groq_client_2 = Groq(api_key=updates["GROQ_API_KEY"])
        if "OPENROUTER_API_KEY" in updates:
            multi_processor.default_openrouter_key = updates["OPENROUTER_API_KEY"]
            base_url = "https://openrouter.ai/api/v1"
            multi_processor.openai_client = openai.OpenAI(api_key=updates["OPENROUTER_API_KEY"], base_url=base_url)
            multi_processor.openai_client_2 = openai.OpenAI(api_key=updates["OPENROUTER_API_KEY"], base_url=base_url)
            multi_processor.openai_client_3 = openai.OpenAI(api_key=updates["OPENROUTER_API_KEY"], base_url=base_url)
    except Exception as exc:
        logger.warning(f"Refreshed env but failed to rebuild API clients: {exc}")

    return {"success": True, "updated": list(updates.keys())}