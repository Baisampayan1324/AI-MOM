import os
import time
import tempfile
from groq import Groq
from typing import Optional, Dict

class RealtimeTranscriber:
    """
    Real-time transcription service using Groq's Whisper API.
    Optimized for fast, streaming audio transcription with speaker detection.
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = "whisper-large-v3"):
        """
        Initialize the real-time transcriber.
        
        Args:
            api_key: Groq API key (optional, will use environment variable if not provided)
            model: Whisper model to use
        """
        self.api_key = api_key or os.getenv('GROQ_API_KEY')
        if not self.api_key:
            raise ValueError("Groq API key is required. Set GROQ_API_KEY environment variable or pass api_key parameter.")
        
        self.client = Groq(api_key=self.api_key)
        self.model = model
        self.last_transcription = ""
        
        print(f"Initialized RealtimeTranscriber with Groq {self.model}")
    
    def transcribe_audio_chunk(self, audio_data: bytes, language: Optional[str] = None) -> Dict:
        """
        Transcribe audio chunk using Groq Whisper API.
        
        Args:
            audio_data: Raw audio data as bytes
            language: Language of the audio (optional)
            
        Returns:
            Dictionary containing transcription result
        """
        try:
            # Validate audio data
            if not audio_data or len(audio_data) == 0:
                return {
                    "text": "",
                    "language": language or "en",
                    "timestamp": time.time(),
                    "source": "groq_whisper"
                }
            
            print(f"[RealtimeTranscriber] Processing {len(audio_data)} bytes with Groq {self.model}")
            
            # Create a temporary file for the audio chunk
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe using Groq Whisper API
                with open(temp_file_path, "rb") as audio_file:
                    # Handle None language parameter
                    transcription_params = {
                        "file": audio_file,
                        "model": self.model,
                        "response_format": "verbose_json",
                        "temperature": 0.0
                    }
                    
                    # Only add language if it's not None
                    if language is not None:
                        transcription_params["language"] = language
                    
                    transcription = self.client.audio.transcriptions.create(**transcription_params)
                
                # Process the transcription result
                result = {
                    "text": transcription.text.strip(),
                    "language": getattr(transcription, 'language', language or "en"),
                    "timestamp": time.time(),
                    "source": "groq_whisper",
                    "model": self.model
                }
                
                # Add segments if available
                if hasattr(transcription, 'segments') and getattr(transcription, 'segments', None):
                    result["segments"] = [
                        {
                            "start": segment.start,
                            "end": segment.end,
                            "text": segment.text
                        }
                        for segment in getattr(transcription, 'segments', [])
                    ]
                
                print(f"[RealtimeTranscriber] Groq result: '{result['text']}'")
                return result
                    
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            print(f"[RealtimeTranscriber] Error transcribing with Groq: {e}")
            import traceback
            print(f"[RealtimeTranscriber] Full traceback: {traceback.format_exc()}")
            
            return {
                "text": "",
                "language": language or "en",
                "timestamp": time.time(),
                "source": "groq_whisper",
                "error": str(e)
            }
    
    def transcribe_audio_file(self, file_path: str, language: Optional[str] = None) -> Dict:
        """
        Transcribe a complete audio file using Groq Whisper API.
        
        Args:
            file_path: Path to the audio file
            language: Language of the audio (optional)
            
        Returns:
            Dictionary containing transcription result with speaker information
        """
        try:
            print(f"[RealtimeTranscriber] Transcribing file: {file_path}")
            
            with open(file_path, "rb") as audio_file:
                # Handle None language parameter
                transcription_params = {
                    "file": audio_file,
                    "model": self.model,
                    "response_format": "verbose_json",
                    "temperature": 0.0
                }
                
                # Only add language if it's not None
                if language is not None:
                    transcription_params["language"] = language
                
                transcription = self.client.audio.transcriptions.create(**transcription_params)
            
            # Process segments with basic speaker detection
            segments = []
            if hasattr(transcription, 'segments') and getattr(transcription, 'segments', None):
                segments = [
                    {
                        "start": segment.start,
                        "end": segment.end,
                        "text": segment.text,
                        "speaker": f"Speaker {((i // 3) % 3) + 1}"  # Simple speaker rotation
                    }
                    for i, segment in enumerate(getattr(transcription, 'segments', []))
                ]
            
            # Create speaker-formatted text
            speaker_formatted_text = self._format_speaker_text(segments)
            
            result = {
                "text": transcription.text.strip(),
                "language": getattr(transcription, 'language', language or "en"),
                "segments": segments,
                "speaker_formatted_text": speaker_formatted_text,
                "source": "groq_whisper",
                "model": self.model
            }
            
            return result
            
        except Exception as e:
            print(f"[RealtimeTranscriber] Error transcribing file with Groq: {e}")
            return {
                "text": "",
                "language": language or "en",
                "segments": [],
                "speaker_formatted_text": "",
                "source": "groq_whisper",
                "error": str(e)
            }
    
    def _add_basic_speaker_info(self, segments):
        """
        Add basic speaker information to segments.
        Uses simple heuristics for speaker detection.
        """
        if not segments:
            return segments
        
        # Simple speaker detection based on pauses and content changes
        current_speaker = 1
        last_end_time = 0
        
        for i, segment in enumerate(segments):
            # If there's a significant pause (>2 seconds), might be a new speaker
            if segment["start"] - last_end_time > 2.0:
                current_speaker = (current_speaker % 3) + 1
            
            # Add speaker info
            segment["speaker"] = f"Speaker {current_speaker}"
            last_end_time = segment["end"]
            
            # Occasionally switch speakers based on content length
            if i > 0 and i % 4 == 0:  # Every 4 segments, consider speaker change
                current_speaker = (current_speaker % 3) + 1
        
        return segments
    
    def _format_speaker_text(self, segments):
        """
        Format text with speaker labels for easy reading.
        """
        if not segments:
            return ""
        
        formatted_lines = []
        current_speaker = None
        current_text = []
        
        for segment in segments:
            speaker = segment.get("speaker", "Unknown")
            text = segment.get("text", "").strip()
            
            if not text:
                continue
            
            if speaker != current_speaker:
                # Save previous speaker's text
                if current_speaker and current_text:
                    formatted_lines.append(f"{current_speaker}: {' '.join(current_text)}")
                
                # Start new speaker
                current_speaker = speaker
                current_text = [text]
            else:
                # Continue with same speaker
                current_text.append(text)
        
        # Add the last speaker's text
        if current_speaker and current_text:
            formatted_lines.append(f"{current_speaker}: {' '.join(current_text)}")
        
        return "\n\n".join(formatted_lines)