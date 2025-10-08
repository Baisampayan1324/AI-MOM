from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websockets.exceptions import ConnectionClosedError
import json
import logging
import numpy as np
from app.services.multi_api_processor import MultiAPIProcessor
from app.services.audio_processor import AudioProcessor
from app.services.user_profile import UserProfileService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
multi_processor = MultiAPIProcessor()
audio_processor = AudioProcessor()
user_profile_service = UserProfileService()

@router.websocket("/ws/audio")
async def websocket_audio(websocket: WebSocket):
    """
    WebSocket endpoint for real-time audio processing.
    """
    await websocket.accept()
    logger.info("WebSocket connection established")

    try:
        while True:
            # Receive audio data
            data = await websocket.receive_json()

            if data.get("type") == "audio_chunk":
                audio_data_list = data.get("audio_data")
                sample_rate = data.get("sample_rate", 16000)  # Default to 16kHz if not provided
                
                # Convert list of int16 values back to bytes
                if isinstance(audio_data_list, list):
                    # Frontend sends Int16Array values directly
                    audio_array = np.array(audio_data_list, dtype=np.int16)
                    audio_data = audio_array.tobytes()
                else:
                    audio_data = audio_data_list

                # Process chunk with optimized single model for real-time speed
                result = await multi_processor.process_realtime_chunk(audio_data, sample_rate)

                # Only send back transcription if there's actual text
                if result['transcription'] and result['transcription'].strip():
                    # Check for speaker alerts
                    alerts = user_profile_service.check_for_alerts(result['transcription'])

                    # Send back transcription
                    await websocket.send_json({
                        "type": "transcription",
                        "text": result['transcription'],
                        "speaker_id": result.get('speaker_id'),
                        "confidence": result.get('confidence', 0.0),
                        "timestamp": data.get("timestamp")
                    })

                    # Send alerts if any
                    for alert in alerts:
                        await websocket.send_json({
                            "type": "speaker_alert",
                            "alert_type": alert.alert_type,
                            "message": f"Alert triggered: {alert.triggered_text}",
                            "confidence": alert.confidence,
                            "timestamp": alert.timestamp.isoformat()
                        })

            elif data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info("WebSocket connection closed by client")
    except ConnectionClosedError:
        logger.info("WebSocket connection closed unexpectedly")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except Exception:
            # Connection might already be closed
            logger.error("Failed to send error message - connection already closed")
    finally:
        logger.info("Audio WebSocket session ended")

@router.websocket("/ws/progress")
async def websocket_progress(websocket: WebSocket):
    """
    WebSocket for processing progress updates.
    """
    await websocket.accept()

    try:
        while True:
            # This would be used for file processing progress
            data = await websocket.receive_json()

            if data.get("type") == "start_processing":
                file_path = data.get("file_path")

                # Simulate progress updates
                for progress in range(0, 101, 10):
                    await websocket.send_json({
                        "type": "progress",
                        "percentage": progress,
                        "message": f"Processing... {progress}%"
                    })
                    # In real implementation, this would be based on actual processing

                await websocket.send_json({
                    "type": "complete",
                    "message": "Processing completed"
                })

    except WebSocketDisconnect:
        logger.info("Progress WebSocket closed by client")
    except ConnectionClosedError:
        logger.info("Progress WebSocket connection closed unexpectedly")
    except Exception as e:
        logger.error(f"Progress WebSocket error: {str(e)}")
    finally:
        logger.info("Progress WebSocket session ended")