import whisper
import torch
import os
from typing import Optional, List, Dict, Any
import time
import numpy as np
import wave
import struct
import threading
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
import tempfile
import io

class AudioProcessor:
    def __init__(self, model_size: str = "base"):
        """
        Initialize the audio processor with a Whisper model optimized for 5-minute audio processing.

        Args:
            model_size: Size of the Whisper model (tiny, base, small, medium, large)
        """
        # Use base model for optimal speed/accuracy balance for 5-minute audio
        self.model_size = "base"
        print(f"Loading Whisper {self.model_size} model optimized for 5-minute audio processing...")

        # Force CPU processing (no GPU) and suppress CUDA warnings
        self.device = "cpu"
        print("Using CPU processing for Whisper model")

        # Suppress CUDA warning
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            self.model = whisper.load_model(self.model_size, device=self.device)

        # Initialize thread pool for parallel processing
        self.executor = ThreadPoolExecutor(max_workers=4)  # 4 parallel workers for chunk processing
        self.chunk_duration = 8  # Process 8-second chunks for optimal performance
        self.overlap_duration = 1  # 1-second overlap between chunks

        print("Whisper model loaded successfully with parallel processing enabled!")

    def transcribe_audio_file(self, file_path: str, language: Optional[str] = None, progress_callback: Optional[callable] = None) -> dict:
        """
        Transcribe an audio file using optimized chunking for 5-minute audio processing.

        Args:
            file_path: Path to the audio file
            language: Language of the audio (optional)
            progress_callback: Callback function for progress updates

        Returns:
            Dictionary containing transcription result with speaker information
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        start_time = time.time()

        # Load audio file
        print(f"Loading audio file: {file_path}")
        audio = whisper.load_audio(file_path)
        duration = len(audio) / whisper.audio.SAMPLE_RATE
        print(f"Audio duration: {duration:.2f} seconds")

        if duration > 300:  # 5 minutes
            print("Audio longer than 5 minutes, using optimized chunking strategy")
            return self._transcribe_long_audio(audio, language, progress_callback)
        else:
            # For shorter audio, use standard processing
            return self._transcribe_standard(file_path, language)

    def _transcribe_long_audio(self, audio: np.ndarray, language: Optional[str] = None, progress_callback: Optional[callable] = None) -> dict:
        """
        Transcribe long audio using parallel chunking strategy optimized for 5-minute audio.

        Args:
            audio: Audio data as numpy array
            language: Language of the audio (optional)
            progress_callback: Progress callback function

        Returns:
            Transcription result
        """
        sample_rate = whisper.audio.SAMPLE_RATE  # 16000 Hz
        chunk_samples = int(self.chunk_duration * sample_rate)  # 8 seconds * 16000 = 128000 samples
        overlap_samples = int(self.overlap_duration * sample_rate)  # 1 second overlap

        # Create overlapping chunks
        chunks = []
        start_sample = 0

        while start_sample < len(audio):
            end_sample = min(start_sample + chunk_samples, len(audio))
            chunk_audio = audio[start_sample:end_sample]

            # Add padding if chunk is too short (except for the last chunk)
            if len(chunk_audio) < chunk_samples and start_sample + chunk_samples < len(audio):
                padding_needed = chunk_samples - len(chunk_audio)
                chunk_audio = np.pad(chunk_audio, (0, padding_needed), 'constant')

            chunks.append((start_sample / sample_rate, chunk_audio))
            start_sample += chunk_samples - overlap_samples

        print(f"Created {len(chunks)} chunks for parallel processing")

        # Process chunks sequentially (Whisper model is not thread-safe)
        all_segments = []

        for i, (start_time, chunk_audio) in enumerate(chunks):
            try:
                # Optimized transcription options for speed
                options = {
                    "language": language,
                    "fp16": False,  # Use float32 for CPU
                    "best_of": 1,   # Reduce for speed
                    "beam_size": 1, # Reduce for speed
                    "temperature": 0.0,  # Deterministic results
                    "word_timestamps": True,
                    "no_speech_threshold": 0.3,  # Filter out silence
                    "logprob_threshold": -1.0,   # More lenient threshold
                }

                result = self.model.transcribe(chunk_audio, **options)

                # Adjust timestamps to account for chunk position
                if result and "segments" in result and result["segments"]:
                    for segment in result["segments"]:
                        segment["start"] += start_time
                        segment["end"] += start_time
                    all_segments.extend(result["segments"])

                if progress_callback:
                    progress = (i + 1) / len(chunks) * 100
                    progress_callback(f"Processing chunk {i + 1}/{len(chunks)} ({progress:.1f}%)")

            except Exception as e:
                print(f"Error processing chunk at {start_time}: {e}")
                if progress_callback:
                    progress_callback(f"Error processing chunk {i + 1}/{len(chunks)}: {e}")

        # Sort segments by start time and merge overlapping segments
        all_segments.sort(key=lambda x: x["start"])
        merged_segments = self._merge_overlapping_segments(all_segments)

        # Process segments to add speaker information
        processed_segments = self._add_speaker_info(merged_segments)

        # Combine all text
        full_text = " ".join([seg["text"] for seg in processed_segments])

        return {
            "text": full_text,
            "language": language or "en",
            "segments": processed_segments,
            "speaker_formatted_text": self._format_speaker_text(processed_segments),
            "processing_method": "parallel_chunking",
            "total_chunks": len(chunks)
        }

    def _merge_overlapping_segments(self, segments: List[Dict]) -> List[Dict]:
        """
        Merge overlapping segments from parallel processing.

        Args:
            segments: List of segments from different chunks

        Returns:
            Merged segments
        """
        if not segments:
            return segments

        merged = []
        current = segments[0].copy()

        for segment in segments[1:]:
            # If segments overlap or are very close, merge them
            if segment["start"] <= current["end"] + 0.5:  # 0.5 second tolerance
                current["end"] = max(current["end"], segment["end"])
                current["text"] += " " + segment["text"]
                # Recalculate confidence as average
                current["confidence"] = (current.get("confidence", 0) + segment.get("confidence", 0)) / 2
            else:
                merged.append(current)
                current = segment.copy()

        merged.append(current)
        return merged

    def _transcribe_standard(self, file_path: str, language: Optional[str] = None) -> dict:
        """
        Standard transcription for shorter audio files.

        Args:
            file_path: Path to audio file
            language: Language of the audio

        Returns:
            Transcription result
        """
        # Prepare options for transcription with word-level timing
        options = {
            "language": language,
            "fp16": False,  # Use float32 instead of float16 for CPU compatibility
            "best_of": 2,   # Keep some quality for shorter audio
            "beam_size": 2, # Keep some quality for shorter audio
            "word_timestamps": True,  # Enable word-level timestamps for speaker diarization
        }

        # Transcribe the audio
        result = self.model.transcribe(file_path, **options)

        # Process segments to add speaker information
        processed_segments = self._add_speaker_info(result["segments"])

        return {
            "text": result["text"],
            "language": result["language"],
            "segments": processed_segments,
            "speaker_formatted_text": self._format_speaker_text(processed_segments)
        }

    
    def _add_speaker_info(self, segments):
        """
        Add speaker information to transcription segments.
        Improved approach that better distinguishes between speakers based on timing gaps.
        """
        if not segments:
            return segments
            
        # Enhanced speaker assignment logic
        processed_segments = []
        last_end_time = 0
        speaker_switch_threshold = 1.0  # seconds (gap threshold for speaker change)
        
        # Start with Speaker 0
        current_speaker_id = 0
        
        for i, segment in enumerate(segments):
            # If there's a significant gap since the last segment, likely a new speaker
            if segment["start"] - last_end_time > speaker_switch_threshold:
                # Switch speaker (alternate between 0 and 1 for simplicity)
                current_speaker_id = (current_speaker_id + 1) % 2
            
            # Add speaker info to segment
            segment["speaker"] = f"Speaker {current_speaker_id}"
            processed_segments.append(segment)
            last_end_time = segment["end"]
            
        return processed_segments
    
    def _format_speaker_text(self, segments):
        """
        Format text with speaker labels for easy reading, with each speaker on a new line.
        Includes color coding for different speakers using ANSI escape codes.
        """
        if not segments:
            return ""
            
        formatted_lines = []
        current_speaker = None
        
        # Define colors for different speakers (ANSI escape codes)
        speaker_colors = {
            "Speaker 0": "\033[92m",  # Green
            "Speaker 1": "\033[94m",  # Blue
            "Speaker 2": "\033[93m",  # Yellow
            "Speaker 3": "\033[95m",  # Magenta
            "Speaker 4": "\033[96m",  # Cyan
            "Speaker 5": "\033[91m",  # Red
        }
        reset_color = "\033[0m"  # Reset to default color
        
        # Format with each speaker's content on separate lines
        for segment in segments:
            speaker = segment.get("speaker", "Unknown")
            text = segment.get("text", "").strip()
            
            if speaker != current_speaker:
                # New speaker, add speaker label on a new line with color
                color = speaker_colors.get(speaker, "")
                formatted_lines.append(f"\n{color}{speaker}:{reset_color} {text}")
                current_speaker = speaker
            else:
                # Same speaker, just add text
                formatted_lines.append(text)
                
        # Join all lines and clean up extra whitespace
        result = " ".join(formatted_lines).strip()
        # Ensure there's a newline at the beginning for better formatting
        if not result.startswith('\n'):
            result = '\n' + result
        return result
    
    def transcribe_real_time(self, audio_data: np.ndarray, language: Optional[str] = None) -> dict:
        """
        Transcribe real-time audio data efficiently.
        
        Args:
            audio_data: Audio data as numpy array
            language: Language of the audio (optional)
            
        Returns:
            Transcription result
        """
        # Prepare options for fast transcription
        options = {
            "language": language,
            "fp16": False,
            "best_of": 1,
            "beam_size": 1,
            "task": "transcribe",
            "temperature": 0.0
        }
        
        # Transcribe directly from numpy array (more efficient)
        try:
            result = self.model.transcribe(audio_data, **options)
            # Handle both string and list cases for the text field
            text = result["text"]
            if isinstance(text, list):
                text = " ".join(str(item) for item in text)
            elif not isinstance(text, str):
                text = str(text)
            
            return {
                "text": text.strip(),
                "language": result["language"],
                "timestamp": time.time()
            }
        except Exception as e:
            return {
                "text": "",
                "language": language or "en",
                "timestamp": time.time(),
                "error": str(e)
            }
    
    def transcribe_chunk(self, audio_chunk: bytes, language: Optional[str] = None, content_type: Optional[str] = None) -> dict:
        """
        Transcribe a raw audio chunk.
        
        Args:
            audio_chunk: Raw audio data
            language: Language of the audio (optional)
            
        Returns:
            Transcription result
        """
        try:
            # Check if we have valid audio data
            if not audio_chunk or len(audio_chunk) == 0:
                return {
                    "text": "",
                    "language": language or "en",
                    "timestamp": time.time()
                }
            
            # For WebM and other formats, save to temp file and use whisper directly
            import tempfile
            import os
            
            # Handle different audio formats
            try:
                import io
                import numpy as np
                
                # Check if this is raw PCM audio data (16-bit signed)
                if content_type and 'pcm' in content_type.lower():
                    print(f"[DEBUG] Processing raw PCM audio data: {len(audio_chunk)} bytes")
                    
                    # Convert raw PCM bytes to numpy array
                    audio_array = np.frombuffer(audio_chunk, dtype=np.int16).astype(np.float32) / 32768.0
                    
                    # Ensure mono and correct sample rate (16kHz)
                    if len(audio_array) > 0:
                        # Whisper expects 16kHz mono audio
                        result = self.model.transcribe(audio_array, 
                                                     language=language,
                                                     fp16=False,
                                                     temperature=0.0)
                        
                        text = result["text"]
                        if isinstance(text, list):
                            text = " ".join(str(item) for item in text)
                        elif not isinstance(text, str):
                            text = str(text)
                        
                        return {
                            "text": text.strip(),
                            "language": result["language"],
                            "timestamp": time.time()
                        }
                    else:
                        print(f"[DEBUG] Empty PCM audio array")
                        return {
                            "text": "",
                            "language": language or "en",
                            "timestamp": time.time()
                        }
                
                # For WebM/encoded audio, skip processing for now
                elif (audio_chunk.startswith(b'C\xc3\x81') or 
                      (content_type and 'webm' in content_type.lower())):
                    print(f"[DEBUG] Skipping WebM encoded audio chunk - decoder needed")
                    return {
                        "text": "",
                        "language": language or "en", 
                        "timestamp": time.time(),
                        "note": "WebM audio format not supported - use PCM instead"
                    }
                
                # Try to handle other formats as raw audio
                else:
                    print(f"[DEBUG] Attempting to process as raw audio data")
                    # Try different audio format interpretations
                    audio_array = None
                    
                    try:
                        # Try 16-bit signed PCM first
                        audio_array = np.frombuffer(audio_chunk, dtype=np.int16).astype(np.float32) / 32768.0
                    except:
                        try:
                            # Try float32
                            audio_array = np.frombuffer(audio_chunk, dtype=np.float32)
                        except:
                            try:
                                # Try 8-bit unsigned
                                audio_array = np.frombuffer(audio_chunk, dtype=np.uint8).astype(np.float32) / 128.0 - 1.0
                            except Exception as e:
                                print(f"[DEBUG] Failed to parse audio data: {e}")
                                return {
                                    "text": "",
                                    "language": language or "en",
                                    "timestamp": time.time(),
                                    "error": f"Unsupported audio format: {e}"
                                }
                    
                    if audio_array is not None and len(audio_array) > 0:
                        # Ensure we have enough audio for processing (at least 0.1 seconds)
                        if len(audio_array) < 1600:  # Less than 0.1 seconds at 16kHz
                            print(f"[DEBUG] Audio chunk too short: {len(audio_array)} samples")
                            return {
                                "text": "",
                                "language": language or "en",
                                "timestamp": time.time()
                            }
                        
                        # If stereo, convert to mono
                        if len(audio_array.shape) > 1:
                            audio_array = np.mean(audio_array, axis=1)
                        
                        # Whisper transcription
                        result = self.model.transcribe(audio_array, 
                                                     language=language,
                                                     fp16=False,
                                                     temperature=0.0)
                        
                        text = result["text"]
                        if isinstance(text, list):
                            text = " ".join(str(item) for item in text)
                        elif not isinstance(text, str):
                            text = str(text)
                        
                        return {
                            "text": text.strip(),
                            "language": result["language"],
                            "timestamp": time.time()
                        }
                    
            except Exception as e:
                print(f"[DEBUG] Error processing audio: {e}")
                return {
                    "text": "",
                    "language": language or "en",
                    "timestamp": time.time(),
                    "error": str(e)
                }
            
            # Handle raw audio data (WAV, PCM, etc.)
            audio_array = None
            
            # Try to parse as WAV first (with proper header checking)
            try:
                audio_array = self._parse_wav_chunk(audio_chunk)
            except Exception as wav_error:
                # If WAV parsing fails, try direct conversion
                try:
                    # Try to convert directly assuming 16-bit PCM
                    audio_array = np.frombuffer(audio_chunk, dtype=np.int16).astype(np.float32) / 32768.0
                except Exception as conv_error:
                    # Try with different data types
                    try:
                        # Try 32-bit float
                        audio_array = np.frombuffer(audio_chunk, dtype=np.float32)
                    except Exception as float_error:
                        # Try 8-bit
                        try:
                            audio_array = np.frombuffer(audio_chunk, dtype=np.uint8).astype(np.float32) / 128.0 - 1.0
                        except Exception as final_error:
                            # If all conversion attempts fail, log the errors and return empty result
                            print(f"All audio conversion attempts failed:")
                            print(f"WAV parsing error: {wav_error}")
                            print(f"Direct conversion error: {conv_error}")
                            print(f"Float conversion error: {float_error}")
                            print(f"8-bit conversion error: {final_error}")
                            return {
                                "text": "",
                                "language": language or "en",
                                "timestamp": time.time()
                            }
            
            # Ensure we have a valid audio array
            if audio_array is None or len(audio_array) == 0:
                return {
                    "text": "",
                    "language": language or "en",
                    "timestamp": time.time()
                }
            
            # Reshape if needed (handle stereo to mono conversion)
            if len(audio_array.shape) > 1 and audio_array.shape[1] > 1:
                # Convert stereo to mono by averaging channels
                audio_array = np.mean(audio_array, axis=1)
            
            return self.transcribe_real_time(audio_array, language)
        except Exception as e:
            print(f"Error in transcribe_chunk: {e}")
            import traceback
            traceback.print_exc()
            return {
                "text": "",
                "language": language or "en",
                "timestamp": time.time(),
                "error": str(e)
            }
    
    def _parse_wav_chunk(self, audio_chunk: bytes) -> np.ndarray:
        """
        Parse WAV audio chunk and extract audio data as numpy array.
        
        Args:
            audio_chunk: Raw WAV audio data
            
        Returns:
            Audio data as numpy array
        """
        # More robust WAV parsing
        # Check minimum size
        if len(audio_chunk) < 44:  # Minimum WAV header size
            raise ValueError("Audio chunk too small to be valid WAV")
        
        # Check RIFF header
        if audio_chunk[0:4] != b'RIFF':
            raise ValueError("Not a valid WAV file - missing RIFF header")
        
        # Check WAVE header
        if audio_chunk[8:12] != b'WAVE':
            raise ValueError("Not a valid WAV file - missing WAVE header")
        
        # Find fmt chunk
        fmt_pos = audio_chunk.find(b'fmt ')
        if fmt_pos == -1:
            raise ValueError("Not a valid WAV file - missing fmt chunk")
        
        # Find data chunk
        data_pos = audio_chunk.find(b'data')
        if data_pos == -1:
            raise ValueError("Not a valid WAV file - missing data chunk")
        
        # Parse format information (skip 20 bytes to get to format data)
        if len(audio_chunk) < fmt_pos + 20:
            raise ValueError("Invalid WAV format - insufficient data")
        
        # Extract audio format parameters
        # Audio format (2 bytes at fmt_pos + 8)
        audio_format = int.from_bytes(audio_chunk[fmt_pos + 8:fmt_pos + 10], byteorder='little')
        # Number of channels (2 bytes at fmt_pos + 10)
        channels = int.from_bytes(audio_chunk[fmt_pos + 10:fmt_pos + 12], byteorder='little')
        # Sample rate (4 bytes at fmt_pos + 12)
        sample_rate = int.from_bytes(audio_chunk[fmt_pos + 12:fmt_pos + 16], byteorder='little')
        # Bits per sample (2 bytes at fmt_pos + 22)
        bits_per_sample = int.from_bytes(audio_chunk[fmt_pos + 22:fmt_pos + 24], byteorder='little')
        
        # Validate format (1 = PCM)
        if audio_format != 1:
            raise ValueError(f"Unsupported audio format: {audio_format} (only PCM supported)")
        
        # Extract data size and position
        data_size = int.from_bytes(audio_chunk[data_pos + 4:data_pos + 8], byteorder='little')
        audio_data_start = data_pos + 8
        
        # Extract audio data
        if len(audio_chunk) < audio_data_start + data_size:
            raise ValueError("Invalid WAV file - data size mismatch")
        
        audio_data = audio_chunk[audio_data_start:audio_data_start + data_size]
        
        # Convert based on bits per sample
        if bits_per_sample == 16:
            audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
        elif bits_per_sample == 8:
            audio_array = np.frombuffer(audio_data, dtype=np.uint8).astype(np.float32) / 128.0 - 1.0
        elif bits_per_sample == 32:
            audio_array = np.frombuffer(audio_data, dtype=np.float32)
        else:
            raise ValueError(f"Unsupported bits per sample: {bits_per_sample}")
        
        # Reshape for multi-channel audio
        if channels > 1:
            audio_array = audio_array.reshape((-1, channels))
            # Convert to mono by averaging channels
            audio_array = np.mean(audio_array, axis=1)
        
        return audio_array