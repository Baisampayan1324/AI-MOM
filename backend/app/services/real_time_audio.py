"""
Real-time Audio Transcription Service

This service provides real-time audio transcription capabilities using
local Whisper base model with optimized performance for web applications.
Optimized for processing audio within 5 minutes with streaming capabilities.
"""

import numpy as np
import time
import threading
import queue
from typing import Optional, Dict, Callable, List
from app.services.audio_processor import AudioProcessor

class RealTimeAudioService:
    """
    Real-time audio transcription service optimized for web applications.
    Uses local Whisper base model for fast, reliable transcription.
    Optimized for 5-minute audio processing with streaming capabilities.
    """

    def __init__(self, model_size: str = "base"):
        """
        Initialize the real-time audio service.

        Args:
            model_size: Whisper model size (base for optimal speed)
        """
        # Initialize optimized AudioProcessor
        self.audio_processor = AudioProcessor(model_size=model_size)
        self.model_size = model_size

        # Streaming and buffering settings
        self.audio_buffer = queue.Queue(maxsize=1000)  # Buffer for incoming audio chunks
        self.processing_buffer = []  # Accumulate audio for batch processing
        self.buffer_duration = 5.0  # Process 5-second batches for real-time feel
        self.sample_rate = 16000  # 16kHz audio
        self.min_chunk_duration = 1.0  # Minimum chunk duration to process

        # Threading for background processing
        self.processing_thread = None
        self.is_processing = False
        self.last_processed_time = 0

        # Transcription settings
        self.last_transcription = ""
        self.transcription_callbacks = {}  # Dict to store callbacks per meeting
        self.meeting_buffers = {}  # Per-meeting audio buffers

        print(f"Initialized RealTimeAudioService with Whisper {model_size} model (5-minute optimized)")

    def start_background_processing(self, meeting_id: str):
        """
        Start background processing thread for a meeting.

        Args:
            meeting_id: Meeting ID to process
        """
        if self.processing_thread and self.processing_thread.is_alive():
            return

        self.is_processing = True
        self.processing_thread = threading.Thread(
            target=self._background_processing_loop,
            args=(meeting_id,),
            daemon=True
        )
        self.processing_thread.start()
        print(f"Started background processing for meeting {meeting_id}")

    def stop_background_processing(self, meeting_id: str):
        """
        Stop background processing for a meeting.

        Args:
            meeting_id: Meeting ID to stop processing for
        """
        self.is_processing = False
        if meeting_id in self.meeting_buffers:
            del self.meeting_buffers[meeting_id]
        print(f"Stopped background processing for meeting {meeting_id}")

    def add_audio_chunk(self, audio_data: bytes, meeting_id: str, language: Optional[str] = None):
        """
        Add audio chunk to processing queue.

        Args:
            audio_data: Raw audio data
            meeting_id: Meeting ID
            language: Language of audio
        """
        try:
            # Convert bytes to numpy array (assuming 16-bit PCM)
            if isinstance(audio_data, bytes):
                audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
            else:
                audio_array = audio_data

            # Initialize meeting buffer if needed
            if meeting_id not in self.meeting_buffers:
                self.meeting_buffers[meeting_id] = {
                    'audio_data': [],
                    'language': language,
                    'last_process_time': 0,
                    'total_duration': 0
                }

            # Add to meeting buffer
            self.meeting_buffers[meeting_id]['audio_data'].append(audio_array)
            chunk_duration = len(audio_array) / self.sample_rate
            self.meeting_buffers[meeting_id]['total_duration'] += chunk_duration

            # Start background processing if not already running
            if not self.is_processing:
                self.start_background_processing(meeting_id)

        except Exception as e:
            print(f"Error adding audio chunk: {e}")

    def _background_processing_loop(self, meeting_id: str):
        """
        Background processing loop for real-time transcription.

        Args:
            meeting_id: Meeting ID to process
        """
        while self.is_processing:
            try:
                if meeting_id not in self.meeting_buffers:
                    time.sleep(0.1)
                    continue

                meeting_buffer = self.meeting_buffers[meeting_id]
                current_time = time.time()

                # Check if we have enough audio to process (5 seconds worth)
                total_samples = sum(len(chunk) for chunk in meeting_buffer['audio_data'])
                total_duration = total_samples / self.sample_rate

                # Process if we have at least 5 seconds of audio and it's been 2+ seconds since last processing
                if (total_duration >= self.buffer_duration and
                    current_time - meeting_buffer['last_process_time'] >= 2.0):

                    # Concatenate all audio chunks
                    audio_data = np.concatenate(meeting_buffer['audio_data'])

                    # Process the audio
                    result = self._process_audio_buffer(audio_data, meeting_id, meeting_buffer['language'])

                    # Clear processed audio and update timestamp
                    meeting_buffer['audio_data'] = []
                    meeting_buffer['last_process_time'] = current_time

                    # Call callbacks if we have transcription
                    if result and result.get('text', '').strip():
                        self._call_transcription_callbacks(result, meeting_id)

                # Small delay to prevent busy waiting
                time.sleep(0.1)

            except Exception as e:
                print(f"Error in background processing loop: {e}")
                time.sleep(0.5)

    def _process_audio_buffer(self, audio_data: np.ndarray, meeting_id: str, language: Optional[str] = None) -> Dict:
        """
        Process accumulated audio buffer.

        Args:
            audio_data: Audio data to process
            meeting_id: Meeting ID
            language: Language of audio

        Returns:
            Transcription result
        """
        try:
            # Use optimized real-time transcription
            result = self.audio_processor.transcribe_real_time(audio_data, language)

            # Add meeting and processing info
            result.update({
                "meeting_id": meeting_id,
                "source": "local_whisper_realtime",
                "model": f"local_{self.model_size}",
                "buffer_duration": len(audio_data) / self.sample_rate,
                "processing_timestamp": time.time()
            })

            return result

        except Exception as e:
            print(f"Error processing audio buffer: {e}")
            return {
                "text": "",
                "language": language or "en",
                "meeting_id": meeting_id,
                "error": str(e),
                "processing_timestamp": time.time()
            }

    def _call_transcription_callbacks(self, result: Dict, meeting_id: str):
        """
        Call registered transcription callbacks.

        Args:
            result: Transcription result
            meeting_id: Meeting ID
        """
        if meeting_id in self.transcription_callbacks:
            callback = self.transcription_callbacks[meeting_id]
            if callback:
                try:
                    callback(result['text'], result)
                except Exception as callback_error:
                    print(f"Callback error for meeting {meeting_id}: {callback_error}")

    def transcribe_audio_chunk(self, audio_data: bytes, meeting_id: str, language: Optional[str] = None) -> Dict:
        """
        Transcribe audio chunk and broadcast to meeting participants.
        Now uses streaming buffer for better real-time performance.

        Args:
            audio_data: Raw audio data as bytes
            meeting_id: Meeting ID for broadcasting
            language: Language of the audio (optional)

        Returns:
            Dictionary containing transcription result
        """
        try:
            # Add to streaming buffer instead of immediate processing
            self.add_audio_chunk(audio_data, meeting_id, language)

            # Return immediate acknowledgment
            return {
                "text": "",  # Will be sent via streaming/callbacks
                "language": language or "en",
                "timestamp": time.time(),
                "source": "local_whisper_streaming",
                "meeting_id": meeting_id,
                "status": "buffered",
                "buffer_size": len(self.meeting_buffers.get(meeting_id, {}).get('audio_data', []))
            }

        except Exception as e:
            print(f"[RealTimeAudio] Error adding chunk to buffer: {e}")
            import traceback
            print(f"[RealTimeAudio] Full traceback: {traceback.format_exc()}")

            return {
                "text": "",
                "language": language or "en",
                "timestamp": time.time(),
                "source": "local_whisper",
                "meeting_id": meeting_id,
                "error": str(e)
            }

    def register_transcription_callback(self, meeting_id: str, callback: Callable):
        """
        Register a callback for transcription results.

        Args:
            meeting_id: Meeting ID
            callback: Callback function(text, result_dict)
        """
        self.transcription_callbacks[meeting_id] = callback
        print(f"Registered transcription callback for meeting {meeting_id}")

    def unregister_transcription_callback(self, meeting_id: str):
        """
        Unregister transcription callback for a meeting.

        Args:
            meeting_id: Meeting ID
        """
        if meeting_id in self.transcription_callbacks:
            del self.transcription_callbacks[meeting_id]
            print(f"Unregistered transcription callback for meeting {meeting_id}")

    def get_meeting_stats(self, meeting_id: str) -> Dict:
        """
        Get processing statistics for a meeting.

        Args:
            meeting_id: Meeting ID

        Returns:
            Statistics dictionary
        """
        if meeting_id not in self.meeting_buffers:
            return {"error": "Meeting not found"}

        buffer = self.meeting_buffers[meeting_id]
        total_samples = sum(len(chunk) for chunk in buffer['audio_data'])
        total_duration = total_samples / self.sample_rate

        return {
            "meeting_id": meeting_id,
            "buffered_chunks": len(buffer['audio_data']),
            "total_duration_seconds": total_duration,
            "last_process_time": buffer['last_process_time'],
            "is_processing": self.is_processing,
            "model": f"local_{self.model_size}"
        }
    
    def transcribe_audio_file(self, file_path: str, language: Optional[str] = None) -> Dict:
        """
        Transcribe a complete audio file using local Whisper base model.
        
        Args:
            file_path: Path to the audio file
            language: Language of the audio (optional)
            
        Returns:
            Dictionary containing transcription result with speaker information
        """
        try:
            print(f"[RealTimeAudio] Transcribing file: {file_path}")
            
            # Use audio processor for file transcription
            result = self.audio_processor.transcribe_audio_file(file_path, language)
            
            # Update source information
            result["source"] = "local_whisper"
            result["model"] = f"local_{self.model_size}"
            
            return result
            
        except Exception as e:
            print(f"[RealTimeAudio] Error transcribing file: {e}")
            return {
                "text": "",
                "language": language or "en",
                "segments": [],
                "speaker_formatted_text": "",
                "source": "local_whisper",
                "error": str(e)
            }
    
    def register_meeting_callback(self, meeting_id: str, callback: Callable[[str, Dict], None]):
        """
        Register a callback function to receive real-time transcriptions for a meeting.
        
        Args:
            meeting_id: Meeting ID
            callback: Function to call with (text, result_dict) when transcription is ready
        """
        self.transcription_callbacks[meeting_id] = callback
        print(f"[RealTimeAudio] Registered callback for meeting {meeting_id}")
    
    def unregister_meeting_callback(self, meeting_id: str):
        """
        Unregister callback for a meeting.
        
        Args:
            meeting_id: Meeting ID to unregister
        """
        if meeting_id in self.transcription_callbacks:
            del self.transcription_callbacks[meeting_id]
            print(f"[RealTimeAudio] Unregistered callback for meeting {meeting_id}")
    
    def process_continuous_audio(self, audio_array: np.ndarray, meeting_id: str, language: Optional[str] = None) -> Dict:
        """
        Process continuous audio data (from microphone or stream).
        
        Args:
            audio_array: Audio data as numpy array
            meeting_id: Meeting ID
            language: Language of the audio (optional)
            
        Returns:
            Dictionary containing transcription result
        """
        try:
            # Use audio processor's real-time transcription
            result = self.audio_processor.transcribe_real_time(audio_array, language)
            
            # Add meeting information
            result["source"] = "local_whisper_realtime"
            result["model"] = f"local_{self.model_size}"
            result["meeting_id"] = meeting_id
            
            # Get transcribed text
            transcribed_text = result.get("text", "").strip()
            
            if transcribed_text and transcribed_text != self.last_transcription:
                self.last_transcription = transcribed_text
                print(f"[RealTimeAudio] Real-time transcribed: '{transcribed_text}'")
                
                # Call any registered callbacks for this meeting
                if meeting_id in self.transcription_callbacks:
                    callback = self.transcription_callbacks[meeting_id]
                    if callback:
                        try:
                            callback(transcribed_text, result)
                        except Exception as callback_error:
                            print(f"[RealTimeAudio] Callback error: {callback_error}")
            
            return result
            
        except Exception as e:
            print(f"[RealTimeAudio] Error in continuous processing: {e}")
            return {
                "text": "",
                "language": language or "en", 
                "timestamp": time.time(),
                "source": "local_whisper_realtime",
                "meeting_id": meeting_id,
                "error": str(e)
            }

# Global instance for the application
real_time_audio_service = RealTimeAudioService(model_size="large")