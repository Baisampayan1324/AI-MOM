from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional
import os
import tempfile
import shutil
import logging
import uuid
from datetime import datetime
from app.services.multi_api_processor import MultiAPIProcessor
from app.services.audio_processor import AudioProcessor
from app.services.summarizer import Summarizer
from app.models.schemas import ProcessResponse, AudioProcessRequest, UserProfile
from app.services.user_profile import UserProfileService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
multi_processor = MultiAPIProcessor()
audio_processor = AudioProcessor()
summarizer = Summarizer()
user_profile_service = UserProfileService()

@router.post("/process-audio", response_model=ProcessResponse)
async def process_audio_file(
    background_tasks: BackgroundTasks,
    file_path: Optional[str] = None,
    file: Optional[UploadFile] = File(None)
):
    """
    Process audio file using multi-API approach.
    Can accept either a file path or uploaded file.
    """
    try:
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
            transcription_result = await multi_processor.process_transcription_2_model(audio_data)

            # Generate comprehensive summary with key points, action items, and conclusion
            comprehensive_summary = await summarizer.generate_comprehensive_summary(transcription_result['transcription'])

            return ProcessResponse(
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

                transcription_result = await multi_processor.process_transcription_ultra_fast(audio_data)
                
                # Generate comprehensive summary
                comprehensive_summary = await summarizer.generate_comprehensive_summary(transcription_result['transcription'])

                # Cleanup immediately after processing (don't wait for background task)
                try:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                        logger.info(f"Cleaned up temp file: {temp_path}")
                except Exception as cleanup_error:
                    logger.warning(f"Failed to cleanup temp file: {cleanup_error}")

                return ProcessResponse(
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
        # Process chunk
        result = await multi_processor.process_realtime_chunk(request.audio_data)

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