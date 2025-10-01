from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, WebSocket
from fastapi.responses import JSONResponse
import os
import tempfile
import uuid
import json
import time
import asyncio
from typing import Optional
from app.models.schemas import AudioFileRequest, TranscriptionResponse, SummaryRequest, SummaryResponse
from app.models.user_profile import UserProfile
from app.services.audio_processor import AudioProcessor
from app.services.summarizer import Summarizer
from app.services.user_profile import UserProfileService
from app.services.realtime_transcriber import RealtimeTranscriber
from app.api.websocket import manager

# Initialize services with Whisper base model for optimal real-time performance
audio_processor = AudioProcessor(model_size="base")  # Local CPU-based Whisper base model
summarizer = Summarizer()
user_profile_service = UserProfileService()
realtime_transcriber = RealtimeTranscriber()  # Groq-based real-time transcription

# Create router
router = APIRouter()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio_file(file: UploadFile = File(...), language: str = Form(None)):
    """
    Transcribe an uploaded audio file using local CPU Whisper base model.
    
    Args:
        file: Audio file to transcribe
        language: Language of the audio (optional)
        
    Returns:
        Transcription result
    """
    # Create a temporary file to save the uploaded audio
    file_extension = os.path.splitext(file.filename or "audio.wav")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name
    
    try:
        # Use local CPU Whisper small model only
        print(f"[DEBUG] Using local CPU Whisper small model for file transcription")
        result = audio_processor.transcribe_audio_file(temp_file_path, language)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        return JSONResponse(content={
            "text": result["text"],
            "language": result["language"],
            "source": result.get("source", "unknown"),
            "model": result.get("model", "unknown")
        })
    except Exception as e:
        # Clean up temporary file in case of error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@router.post("/summarize", response_model=SummaryResponse)
async def summarize_text(request: SummaryRequest):
    """
    Summarize text and extract key points using Groq.
    
    Args:
        request: Summary request containing text and meeting ID
        
    Returns:
        Summary result
    """
    try:
        # Generate summary using Groq
        result = summarizer.summarize_text(request.text, request.meeting_id)
        
        # Broadcast the summary to all connected clients in the meeting
        await manager.broadcast(request.meeting_id, {
            "type": "summary",
            "meeting_id": request.meeting_id,
            "data": result
        })
        
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

@router.post("/process-audio")
async def process_audio_and_summarize(file: UploadFile = File(...), language: str = Form(None), meeting_id: str = Form(...)):
    """
    Process an audio file and generate summary with progress tracking.
    Optimized for 5-minute audio processing with real-time progress updates.

    Args:
        file: Audio file to process
        language: Language of the audio (optional)
        meeting_id: ID of the meeting

    Returns:
        Combined transcription and summary result
    """
    # Create a temporary file to save the uploaded audio
    file_extension = os.path.splitext(file.filename or "audio.wav")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name

    try:
        # Send initial progress update
        await manager.broadcast(meeting_id, {
            "type": "progress",
            "meeting_id": meeting_id,
            "status": "starting",
            "message": "Initializing audio processing...",
            "progress": 0
        })

        # Define progress callback for long audio processing
        async def progress_callback(message: str):
            await manager.broadcast(meeting_id, {
                "type": "progress",
                "meeting_id": meeting_id,
                "status": "processing",
                "message": message,
                "progress": 50  # Mid-point progress
            })

        # Process the audio file with progress tracking
        transcription_result = audio_processor.transcribe_audio_file(
            file_path=temp_file_path,
            language=language,
            progress_callback=progress_callback
        )

        # Send progress update - transcription complete
        await manager.broadcast(meeting_id, {
            "type": "progress",
            "meeting_id": meeting_id,
            "status": "transcribed",
            "message": "Audio transcription complete. Generating summary...",
            "progress": 75
        })

        # Generate summary using Groq
        summary_result = summarizer.summarize_text(transcription_result["text"], meeting_id)

        # Send progress update - summary complete
        await manager.broadcast(meeting_id, {
            "type": "progress",
            "meeting_id": meeting_id,
            "status": "summarized",
            "message": "Summary generation complete.",
            "progress": 100
        })

        # Clean up temporary file
        os.unlink(temp_file_path)

        # Broadcast the result to all connected clients in the meeting
        await manager.broadcast(meeting_id, {
            "type": "transcription_summary",
            "meeting_id": meeting_id,
            "transcription": transcription_result["text"],
            "speaker_formatted_text": transcription_result.get("speaker_formatted_text", ""),
            "summary": summary_result,
            "processing_method": transcription_result.get("processing_method", "standard"),
            "total_chunks": transcription_result.get("total_chunks", 1)
        })

        return JSONResponse(content={
            "transcription": transcription_result["text"],
            "speaker_formatted_text": transcription_result.get("speaker_formatted_text", ""),
            "summary": summary_result,
            "language": transcription_result["language"],
            "processing_method": transcription_result.get("processing_method", "standard"),
            "total_chunks": transcription_result.get("total_chunks", 1)
        })

    except Exception as e:
        # Clean up temporary file in case of error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

        # Send error progress update
        await manager.broadcast(meeting_id, {
            "type": "progress",
            "meeting_id": meeting_id,
            "status": "error",
            "message": f"Processing failed: {str(e)}",
            "progress": 0
        })

        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.post("/process-audio-chunk")
async def process_audio_chunk(chunk: UploadFile = File(...), meeting_id: str = Form(...), language: str = Form(None)):
    """
    Process a real-time audio chunk using local CPU Whisper base model.
    
    Args:
        chunk: Audio chunk to process
        meeting_id: ID of the meeting
        language: Language of the audio (optional)
        
    Returns:
        Transcription result for the chunk
    """
    try:
        print(f"[DEBUG] Processing audio chunk for meeting {meeting_id}")
        print(f"[DEBUG] Using Local CPU Whisper base model")
        print(f"[DEBUG] Chunk filename: {chunk.filename}")
        print(f"[DEBUG] Chunk content-type: {chunk.content_type}")
        
        # Read the audio chunk
        audio_data = await chunk.read()
        print(f"[DEBUG] Audio chunk size: {len(audio_data)} bytes")
        
        # Additional debug info about the audio data
        if len(audio_data) > 0:
            print(f"[DEBUG] First 10 bytes: {audio_data[:10]}")
            print(f"[DEBUG] Last 10 bytes: {audio_data[-10:]}")
        
        # Use local CPU Whisper small model only
        print(f"[DEBUG] Calling audio_processor.transcribe_chunk...")
        result = audio_processor.transcribe_chunk(audio_data, language, chunk.content_type)
        
        print(f"[DEBUG] Transcription result: {result}")
        
        # If we have meaningful transcription, broadcast it
        if result["text"].strip():
            print(f"[DEBUG] Broadcasting transcription: {result['text']}")
            # Broadcast the transcription to all connected clients in the meeting
            await manager.broadcast(meeting_id, {
                "type": "transcription",
                "meeting_id": meeting_id,
                "text": result["text"],
                "timestamp": result["timestamp"],
                "source": result.get("source", "unknown"),
                "model": result.get("model", "unknown")
            })
            
            # Check for speaker-specific keywords that might require alerts
            check_for_speaker_alerts(result["text"], meeting_id)
        else:
            print("[DEBUG] No meaningful transcription found - empty or whitespace only")
        
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] Error processing audio chunk: {e}")
        import traceback
        print(f"[ERROR] Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Chunk processing failed: {str(e)}")

@router.post("/user-profile")
async def create_user_profile(profile: UserProfile):
    """
    Create or update user profile.
    
    Args:
        profile: User profile data
        
    Returns:
        Updated user profile
    """
    try:
        if user_profile_service.save_profile(profile):
            return JSONResponse(content=profile.dict())
        else:
            raise HTTPException(status_code=500, detail="Failed to save profile")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile creation failed: {str(e)}")

@router.get("/user-profile")
async def get_user_profile():
    """
    Get current user profile.
    
    Returns:
        Current user profile
    """
    profile = user_profile_service.get_profile()
    if profile:
        return JSONResponse(content=profile.dict())
    else:
        raise HTTPException(status_code=404, detail="Profile not found")

@router.get("/transcription-info")
async def get_transcription_info():
    """
    Get information about available transcription methods.
    
    Returns:
        Information about local and API transcription options
    """
    return JSONResponse(content={
        "local_whisper": {
            "model": audio_processor.model_size,
            "device": audio_processor.device,
            "available": True,
            "default": True
        }
    })

def check_for_speaker_alerts(text: str, meeting_id: str):
    """
    Check transcription for keywords that might indicate the speaker is asking a question
    or directing attention to participants.
    """
    # Get user profile for personalized alerts
    profile = user_profile_service.get_profile()
    alert_keywords = user_profile_service.get_alert_keywords() if profile else []
    
    # General alert keywords
    general_keywords = [
        "can you", "could you", "would you", 
        "what do you", "how about you", "your thoughts",
        "any questions", "questions for you", "you should",
        "i need you", "i want you", "please"
    ]
    
    # Combine all keywords
    all_keywords = general_keywords + alert_keywords
    
    text_lower = text.lower()
    
    # Check for matches
    matched_keywords = []
    for keyword in all_keywords:
        if keyword in text_lower:
            matched_keywords.append(keyword)
    
    if matched_keywords:
        # Determine alert type based on matched keywords
        is_personal = any(kw in matched_keywords for kw in alert_keywords)
        
        if is_personal:
            # Personal alert - user's name or info was mentioned
            alert_message = {
                "type": "speaker_alert",
                "alert_type": "personal",
                "meeting_id": meeting_id,
                "message": f"Speaker mentioned: {', '.join(matched_keywords)} - This may be directed at you!",
                "suggested_response": "Prepare to respond or take note of this request.",
                "matched_keywords": matched_keywords,
                "timestamp": float(int(time.time() * 1000)) / 1000
            }
        else:
            # General alert - generic question directed at participants
            alert_message = {
                "type": "speaker_alert",
                "alert_type": "general",
                "meeting_id": meeting_id,
                "message": f"Speaker may be directing a question to participants: '{matched_keywords[0]}'",
                "suggested_response": "Consider preparing a response or noting this question for follow-up.",
                "matched_keywords": matched_keywords,
                "timestamp": float(int(time.time() * 1000)) / 1000
            }
        
        # Broadcast the alert
        print(f"Broadcasting speaker alert: {alert_message}")
        asyncio.create_task(manager.broadcast(meeting_id, alert_message))

@router.get("/processing-status/{meeting_id}")
async def get_processing_status(meeting_id: str):
    """
    Get the current processing status for a meeting.
    Useful for tracking long audio processing progress.

    Args:
        meeting_id: ID of the meeting

    Returns:
        Current processing status
    """
    # For now, return a basic status. In a real implementation,
    # this could track actual processing jobs and their progress.
    return JSONResponse(content={
        "meeting_id": meeting_id,
        "status": "idle",
        "message": "No active processing",
        "progress": 0,
        "last_updated": time.time()
    })

@router.post("/process-browser-extension-chunk")
async def process_browser_extension_chunk(
    chunk: UploadFile = File(...),
    language: str = Form(None)
):
    """
    Process a real-time audio chunk from browser extension.
    Optimized for browser extension real-time transcription.

    Args:
        chunk: Audio chunk to process
        language: Language of the audio (optional)

    Returns:
        Transcription result for the chunk
    """
    try:
        print(f"[DEBUG] Processing browser extension audio chunk")
        print(f"[DEBUG] Chunk filename: {chunk.filename}")
        print(f"[DEBUG] Chunk content-type: {chunk.content_type}")

        # Read the audio chunk
        audio_data = await chunk.read()
        print(f"[DEBUG] Audio chunk size: {len(audio_data)} bytes")

        # Use local CPU Whisper small model only
        print(f"[DEBUG] Calling audio_processor.transcribe_chunk...")
        result = audio_processor.transcribe_chunk(audio_data, language, chunk.content_type)

        print(f"[DEBUG] Transcription result: {result}")

        # If we have meaningful transcription, broadcast it to browser extensions
        if result["text"].strip():
            print(f"[DEBUG] Broadcasting transcription to browser extensions: {result['text']}")
            from app.api.websocket import broadcast_to_browser_extensions
            await broadcast_to_browser_extensions({
                "type": "transcript",
                "speaker": "Speaker",  # Default speaker for browser extension
                "text": result["text"],
                "timestamp": result["timestamp"]
            })
        else:
            print("[DEBUG] No meaningful transcription found - empty or whitespace only")

        return JSONResponse(content=result)
    except Exception as e:
        print(f"[ERROR] Error processing browser extension chunk: {e}")
        import traceback
        print(f"[ERROR] Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Browser extension chunk processing failed: {str(e)}")