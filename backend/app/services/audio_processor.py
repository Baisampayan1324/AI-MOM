import torch
import numpy as np
import pydub
try:
    import ffmpeg  # type: ignore
except ImportError:
    ffmpeg = None
import io
import logging
from typing import Tuple, Optional, Dict, List
import psutil
from scipy import signal
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")

        # Initialize Pyannote pipeline if token is available
        self.pyannote_pipeline = None
        try:
            import os
            hf_token = os.getenv("HF_TOKEN")
            if hf_token:
                try:
                    import torchaudio # type: ignore
                    if not hasattr(torchaudio, 'set_audio_backend'):
                        torchaudio.set_audio_backend = lambda x: None
                    if not hasattr(torchaudio, 'get_audio_backend'):
                        torchaudio.get_audio_backend = lambda: 'soundfile'
                except ImportError:
                    pass

                from pyannote.audio import Pipeline
                from huggingface_hub import login
                login(token=hf_token)
                # Load the pipeline
                self.pyannote_pipeline = Pipeline.from_pretrained(
                    "pyannote/speaker-diarization-3.1"
                )
                if self.pyannote_pipeline is not None:
                    self.pyannote_pipeline.to(torch.device(self.device))
                logger.info("Successfully loaded Pyannote diarization pipeline")
            else:
                logger.warning("HF_TOKEN not found, Pyannote diarization disabled")
        except Exception as e:
            logger.error(f"Failed to load Pyannote pipeline: {e}")

    @staticmethod
    def _build_speaker_segments(speaker_count: int) -> List[Dict[str, object]]:
        speaker_count = max(0, min(5, int(speaker_count)))
        return [
            {
                "speaker_id": speaker_id,
                "speaker_label": f"Speaker {speaker_id}",
            }
            for speaker_id in range(1, speaker_count + 1)
        ]

    def check_gpu(self) -> bool:
        """Check if GPU is available."""
        return torch.cuda.is_available()

    def load_audio(self, file_path: str) -> Tuple[np.ndarray, int]:
        """
        Load audio from file path using pydub/ffmpeg.
        Returns: (audio_array, sample_rate)
        """
        try:
            # Use pydub for format handling
            audio = pydub.AudioSegment.from_file(file_path)

            # Convert to mono if stereo
            if audio.channels > 1:
                audio = audio.set_channels(1)

            # Convert to 16kHz
            audio = audio.set_frame_rate(16000)

            # Get raw audio data
            raw_data = audio.raw_data
            sample_rate = audio.frame_rate

            # Convert to numpy array
            audio_array = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32) / 32768.0

            logger.info(f"Loaded audio: {len(audio_array)} samples at {sample_rate}Hz")
            return audio_array, sample_rate

        except Exception as e:
            logger.error(f"Error loading audio: {str(e)}")
            raise

    def process_audio_chunk(self, audio_data: bytes, sample_rate: int = 16000) -> np.ndarray:
        """
        Process raw audio chunk data with optimizations for real-time processing.
        Handles both raw PCM and encoded formats (webm, ogg, etc.)
        """
        # First, try to detect if this is encoded audio (webm, ogg, etc.)
        # by checking for common file signatures
        if self._is_encoded_audio(audio_data):
            try:
                audio_array = self._decode_encoded_audio(audio_data, sample_rate)
                if audio_array is not None and len(audio_array) > 0:
                    return audio_array
            except Exception as decode_err:
                logger.debug(f"Encoded audio decode failed, trying raw PCM: {decode_err}")
        
        # Ensure buffer size is valid for int16 (2 bytes per sample)
        if len(audio_data) % 2 != 0:
            # Pad with zero byte if odd length
            audio_data = audio_data + b'\x00'
        
        # Skip empty or too small buffers
        if len(audio_data) < 2:
            logger.debug("Audio buffer too small, skipping")
            return np.array([], dtype=np.float32)
        
        try:
            # Convert bytes to numpy array - optimized for speed
            audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32, copy=False) / 32768.0
        except ValueError as e:
            logger.warning(f"Buffer conversion failed: {e}, buffer size: {len(audio_data)}")
            return np.array([], dtype=np.float32)

        # Skip resampling if already at target rate for speed
        if sample_rate == 16000:
            return audio_array
        
        # Only resample if necessary (costs processing time)
        if sample_rate != 16000:
            # Use faster resampling for real-time processing
            audio_array = self._fast_resample_audio(audio_array, sample_rate, 16000)

        return audio_array

    def _is_encoded_audio(self, audio_data: bytes) -> bool:
        """
        Check if audio data is in an encoded format (webm, ogg, etc.)
        by looking for common file signatures.
        """
        if len(audio_data) < 4:
            return False
        
        # WebM/Matroska signature: 0x1A 0x45 0xDF 0xA3
        if audio_data[:4] == b'\x1a\x45\xdf\xa3':
            return True
        
        # OGG signature: 'OggS'
        if audio_data[:4] == b'OggS':
            return True
        
        # RIFF/WAV signature
        if audio_data[:4] == b'RIFF':
            return True
        
        # MP3 frame sync: 0xFF 0xFB, 0xFF 0xFA, 0xFF 0xF3, 0xFF 0xF2
        if len(audio_data) >= 2 and audio_data[0] == 0xFF and (audio_data[1] & 0xE0) == 0xE0:
            return True
        
        # Check for ID3 header (MP3 with ID3 tag)
        if audio_data[:3] == b'ID3':
            return True
        
        return False

    def _decode_encoded_audio(self, audio_data: bytes, target_sample_rate: int = 16000) -> Optional[np.ndarray]:
        """
        Decode encoded audio (webm, ogg, mp3, etc.) to raw PCM samples.
        """
        try:
            # Use pydub to decode the audio
            audio_io = io.BytesIO(audio_data)
            
            # Try to detect format and decode
            try:
                audio_segment = pydub.AudioSegment.from_file(audio_io)
            except Exception:
                # Try specific formats
                audio_io.seek(0)
                try:
                    audio_segment = pydub.AudioSegment.from_file(audio_io, format="webm")
                except Exception:
                    audio_io.seek(0)
                    try:
                        audio_segment = pydub.AudioSegment.from_file(audio_io, format="ogg")
                    except Exception:
                        logger.debug("Could not decode audio with pydub")
                        return None
            
            # Convert to mono if stereo
            if audio_segment.channels > 1:
                audio_segment = audio_segment.set_channels(1)
            
            # Resample to target rate
            audio_segment = audio_segment.set_frame_rate(target_sample_rate)
            
            # Get raw samples
            samples = np.frombuffer(audio_segment.raw_data, dtype=np.int16)
            audio_array = samples.astype(np.float32) / 32768.0
            
            logger.debug(f"Decoded {len(audio_data)} bytes to {len(audio_array)} samples")
            return audio_array
            
        except Exception as e:
            logger.debug(f"Audio decode failed: {e}")
            return None

    def _fast_resample_audio(self, audio: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
        """Fast audio resampling optimized for real-time processing."""
        if orig_sr == target_sr:
            return audio
            
        # Use scipy for faster resampling
        try:
            from scipy import signal
            ratio = target_sr / orig_sr
            new_length = int(len(audio) * ratio)
            # Use faster interpolation method - ensure we only get the resampled signal
            resampled = signal.resample(audio, new_length)
            # Handle case where scipy might return a tuple
            if isinstance(resampled, tuple):
                return resampled[0]  # Return only the signal part
            return resampled
        except ImportError:
            # Fallback to simple interpolation if scipy not available
            return self._resample_audio(audio, orig_sr, target_sr)

    def _resample_audio(self, audio: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
        """Simple audio resampling."""
        ratio = target_sr / orig_sr
        new_length = int(len(audio) * ratio)
        return np.interp(
            np.linspace(0, len(audio) - 1, new_length),
            np.arange(len(audio)),
            audio
        )

    def get_audio_info(self, file_path: str) -> Dict:
        """Get audio file information."""
        try:
            audio = pydub.AudioSegment.from_file(file_path)
            return {
                "duration": len(audio) / 1000.0,  # seconds
                "sample_rate": audio.frame_rate,
                "channels": audio.channels,
                "bit_depth": audio.sample_width * 8
            }
        except Exception as e:
            logger.error(f"Error getting audio info: {str(e)}")
            return {}

    def optimize_for_realtime(self) -> Dict:
        """Get optimization settings for real-time processing."""
        gpu_available = self.check_gpu()
        cpu_count = psutil.cpu_count()

        return {
            "device": "cuda" if gpu_available else "cpu",
            "gpu_memory": torch.cuda.get_device_properties(0).total_memory if gpu_available else 0,
            "cpu_cores": cpu_count,
            "recommended_chunk_size": 1.0 if gpu_available else 2.0,  # seconds
            "max_concurrent_processes": min(cpu_count or 4, 4)
        }

    def detect_voice_activity(self, audio: np.ndarray, sample_rate: int, frame_length: int = 1024, hop_length: int = 512) -> np.ndarray:
        """
        Detect voice activity using energy-based method.
        Returns: Boolean array indicating voice activity for each frame.
        """
        # Calculate energy for each frame
        energy = np.array([
            np.sum(audio[i:i+frame_length]**2)
            for i in range(0, len(audio) - frame_length, hop_length)
        ])

        # Normalize energy
        energy = (energy - np.min(energy)) / (np.max(energy) - np.min(energy) + 1e-10)

        # Simple threshold for voice activity
        threshold = np.percentile(energy, 50)  # Adaptive threshold
        vad = energy > threshold

        return vad

    def extract_speaker_features(self, audio: np.ndarray, sample_rate: int, vad: np.ndarray) -> np.ndarray:
        """
        Extract basic features for speaker clustering.
        """
        features = []

        # Split audio into voiced segments
        voiced_segments = []
        start_idx = None

        for i, is_voice in enumerate(vad):
            if is_voice and start_idx is None:
                start_idx = i
            elif not is_voice and start_idx is not None:
                end_idx = i
                segment = audio[start_idx * 512:end_idx * 512]  # hop_length = 512
                if len(segment) > sample_rate:  # At least 1 second
                    voiced_segments.append(segment)
                start_idx = None

        # Extract features from each voiced segment
        for segment in voiced_segments:
            if len(segment) < sample_rate // 2:  # Skip very short segments
                continue

            # Basic features: mean, std, zero-crossing rate, spectral centroid
            mean_val = np.mean(segment)
            std_val = np.std(segment)
            zcr = np.sum(np.abs(np.diff(np.sign(segment)))) / len(segment)

            # Spectral features
            freqs, psd = signal.welch(segment, fs=sample_rate, nperseg=min(1024, len(segment)))
            spectral_centroid = np.sum(freqs * psd) / np.sum(psd)

            features.append([mean_val, std_val, zcr, spectral_centroid])

        return np.array(features) if features else np.array([])

    def perform_speaker_diarization_fast(self, audio: np.ndarray, sample_rate: int) -> Dict:
        """
        Fast speaker diarization - simplified for speed.
        Returns basic speaker count estimation.
        """
        try:
            logger.info("Fast speaker diarization...")

            # Simple voice activity detection
            vad = self.detect_voice_activity(audio, sample_rate)

            # Estimate speakers based on voice activity patterns
            # This is a very basic estimation for speed
            voice_frames = np.sum(vad)
            total_frames = len(vad)

            if voice_frames / total_frames < 0.1:  # Less than 10% voice activity
                speaker_count = 0
            elif voice_frames / total_frames < 0.3:  # Less than 30% voice activity
                speaker_count = 1
            else:
                # Rough estimation: more voice activity suggests more speakers
                # In practice, this would be much more sophisticated
                speaker_count = min(5, max(1, int((voice_frames / total_frames) * 5)))

            if speaker_count > 0:
                speaker_count = min(5, speaker_count)

            logger.info(f"Estimated {speaker_count} speakers")

            return {
                "speaker_count": speaker_count,
                "segments": self._build_speaker_segments(speaker_count),
                "method": "fast_estimation"
            }

        except Exception as e:
            logger.error(f"Fast speaker diarization failed: {str(e)}")
            return {"speaker_count": 1, "segments": self._build_speaker_segments(1), "method": "fallback"}

    def perform_pyannote_diarization(self, audio: np.ndarray, sample_rate: int) -> Dict:
        """
        Accurate speaker diarization using Pyannote.audio.
        Returns detailed speaker segments with start/end times.
        """
        if not self.pyannote_pipeline:
            logger.warning("Pyannote not available, falling back to fast diarization")
            return self.perform_speaker_diarization_fast(audio, sample_rate)
            
        try:
            logger.info("Starting accurate Pyannote diarization...")
            # Pyannote expects a PyTorch tensor with shape (channels, samples)
            tensor = torch.from_numpy(audio).unsqueeze(0).to(self.device)
            
            # Run the pipeline
            diarization = self.pyannote_pipeline({"waveform": tensor, "sample_rate": sample_rate})
            
            # Process results into segments
            segments = []
            speakers_found = set()
            
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                try:
                    # Extract the number from "SPEAKER_00", "SPEAKER_01" -> 1, 2
                    speaker_id = int(speaker.split('_')[-1]) + 1
                except:
                    # Fallback if label format is different
                    speaker_id = (hash(speaker) % 10) + 1
                    
                speakers_found.add(speaker_id)
                
                segments.append({
                    "start": turn.start,
                    "end": turn.end,
                    "speaker_id": speaker_id,
                    "speaker_label": f"Speaker {speaker_id}"
                })
                
            return {
                "speaker_count": len(speakers_found),
                "segments": segments,
                "method": "pyannote"
            }
            
        except Exception as e:
            logger.error(f"Pyannote diarization failed: {e}")
            return self.perform_speaker_diarization_fast(audio, sample_rate)