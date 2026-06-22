import asyncio
import time
import logging
import os
import sys
from typing import Dict, Any, List, Optional, Callable, Awaitable
import difflib
import aiohttp
from groq import Groq
import openai
import numpy as np
import whisper
import torch
from app.config import (
    GROQ_API_KEY, OPENROUTER_API_KEY,
    GROQ_MODEL, OPENROUTER_MODEL,
    GROQ_MODEL_2, OPENROUTER_MODEL_2, OPENROUTER_MODEL_3
)
from app.config import TRANSCRIPTION_LANGUAGE
from app.config import MODEL_TEMPERATURE, MIN_IMPROVEMENT_SIMILARITY, MIN_AGREEMENT_CONFIDENCE
from app.services.audio_processor import AudioProcessor

logger = logging.getLogger(__name__)

# Speaker diarization functionality has been removed for better real-time performance
# All audio is processed as single-speaker by default

class MultiAPIProcessor:
    def __init__(self):
        self.audio_processor = AudioProcessor()
        # Initialize default keys
        self.default_groq_key = GROQ_API_KEY
        self.default_openrouter_key = OPENROUTER_API_KEY
        
        # Initialize default clients
        self.groq_client = Groq(api_key=self.default_groq_key) if self.default_groq_key else None
        self.groq_client_2 = Groq(api_key=self.default_groq_key) if self.default_groq_key else None

        self.openai_client = openai.OpenAI(
            api_key=self.default_openrouter_key,
            base_url="https://openrouter.ai/api/v1"
        ) if self.default_openrouter_key else None
        self.openai_client_2 = openai.OpenAI(
            api_key=self.default_openrouter_key,
            base_url="https://openrouter.ai/api/v1"
        ) if self.default_openrouter_key else None
        self.openai_client_3 = openai.OpenAI(
            api_key=self.default_openrouter_key,
            base_url="https://openrouter.ai/api/v1"
        ) if self.default_openrouter_key else None

        self.audio_processor = AudioProcessor()
        # Initialize Whisper model for offline/file accuracy tasks (configurable)
        self.whisper_model = whisper.load_model(os.getenv("FILE_WHISPER_MODEL", "base"))

        # Load a smaller/faster model for real-time low-latency transcription.
        # Configurable via env var `REALTIME_WHISPER_MODEL`. Default to tiny English-only model.
        realtime_model_name = os.getenv("REALTIME_WHISPER_MODEL", "large-v3")  # Prefer base.en for accuracy + reasonable speed
        try:
            self.realtime_whisper_model = whisper.load_model(realtime_model_name)
            logger.info(f"Loaded realtime Whisper model: {realtime_model_name}")
        except Exception as e:
            # Fallback to the main model if tiny model fails to load
            logger.warning(f"Failed to load realtime model '{realtime_model_name}', falling back to main model: {str(e)}")
            self.realtime_whisper_model = self.whisper_model
        self.min_audio_length = 0.5  # Minimum 0.5 seconds of audio before processing
        self.audio_buffer = []  # Buffer for accumulating audio chunks

        # Realtime buffering state
        self.rt_buffer: List[np.ndarray] = []
        self.rt_total_samples: int = 0
        self.rt_last_text: str = ""  # last full transcription sent to client
        self.rt_sample_rate: int = 16000
        
        # Tunable parameters via environment
        self.rt_min_secs: float = float(os.getenv("REALTIME_MIN_SECONDS", "0.6"))  # minimum buffered audio before first decode
        self.rt_max_secs: float = float(os.getenv("REALTIME_MAX_SECONDS", "2.0"))  # force flush upper bound
        self.rt_silence_threshold: float = float(os.getenv("REALTIME_SILENCE_THRESHOLD", "4e-5"))  # energy threshold for silence
        self.rt_silence_tail_secs: float = float(os.getenv("REALTIME_SILENCE_TAIL", "0.2"))  # tail length to test for silence
        
        logger.info(f"Realtime params: min={self.rt_min_secs}s max={self.rt_max_secs}s silence_thr={self.rt_silence_threshold} tail={self.rt_silence_tail_secs}s")
        logger.info("ℹ️ Single-speaker mode active (Speaker 1 for all speech)")

    # --- Utility: similarity and validation helpers ---
    def _similarity_ratio(self, a: str, b: str) -> float:
        if not a and not b:
            return 1.0
        try:
            return difflib.SequenceMatcher(None, a, b).ratio()
        except Exception:
            return 0.0

    def _validate_improvement(self, base: str, improved: str) -> bool:
        """Return True if the improved text is acceptably similar to base text.

        This prevents LLMs from inventing content that deviates significantly
        from the original transcription.
        """
        if not improved:
            return False
        ratio = self._similarity_ratio(base, improved)
        if ratio < MIN_IMPROVEMENT_SIMILARITY:
            logger.warning(f"Rejecting LLM improvement due to low similarity ({ratio:.2f})")
            return False
        return True

    def _get_groq_client(self, api_key: Optional[str] = None):
        """Get a Groq client, using provided key or default."""
        key = api_key or self.default_groq_key
        if not key:
            raise ValueError("Groq API key is required but not provided")
        return Groq(api_key=key)

    def _get_openrouter_client(self, api_key: Optional[str] = None):
        """Get an OpenRouter client, using provided key or default."""
        key = api_key or self.default_openrouter_key
        if not key:
            raise ValueError("OpenRouter API key is required but not provided")
        return openai.OpenAI(
            api_key=key,
            base_url="https://openrouter.ai/api/v1"
        )

    async def check_apis(self) -> Dict[str, bool]:
        """Check if all APIs and models are accessible."""
        results = {}

        # Check Groq models
        try:
            self.groq_client.models.list()
            results["groq_llama33_70b"] = True
        except Exception as e:
            logger.error(f"Groq API check failed: {str(e)}")
            results["groq_llama33_70b"] = False

        try:
            self.groq_client_2.models.list()
            results["groq_llama31_70b"] = True
        except Exception as e:
            logger.error(f"Groq API 2 check failed: {str(e)}")
            results["groq_llama31_70b"] = False

        # Check OpenRouter models
        try:
            self.openai_client.models.list()
            results["openrouter_gpt4o_mini"] = True
        except Exception as e:
            logger.error(f"OpenRouter API check failed: {str(e)}")
            results["openrouter_gpt4o_mini"] = False

        try:
            self.openai_client_2.models.list()
            results["openrouter_claude_haiku"] = True
        except Exception as e:
            logger.error(f"OpenRouter API 2 check failed: {str(e)}")
            results["openrouter_claude_haiku"] = False

        try:
            self.openai_client_3.models.list()
            results["openrouter_gemini_flash"] = True
        except Exception as e:
            logger.error(f"OpenRouter API 3 check failed: {str(e)}")
            results["openrouter_gemini_flash"] = False

        return results

    async def process_transcription_2_model(
        self,
        audio_data: np.ndarray,
        progress_callback: Optional[Callable[[int, str, int], Awaitable[None]]] = None,
        groq_api_key: Optional[str] = None,
        openrouter_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        2-model parallel processing: Run Groq Llama 3.3 and OpenRouter GPT-4o Mini in parallel.
        Target: ~20 seconds processing time with improved accuracy.
        """
        start_time = time.time()

        # Step 1: Get Whisper transcription first (fast baseline)
        logger.info("🎯 Step 1: Fast Whisper transcription")
        if progress_callback:
            await progress_callback(10, "Starting Whisper transcription", 1)
        whisper_result = self.whisper_model.transcribe(audio_data, fp16=True, language="en")
        whisper_text = str(whisper_result.get("text", "")).strip()
        logger.info(f"📝 Whisper transcription: {len(whisper_text)} characters")
        if progress_callback:
            await progress_callback(40, "Whisper transcription complete", 1)

        # Step 2: Run 2 LLM improvements in parallel on the Whisper text
        logger.info("🚀 Step 2: Parallel 2-model LLM improvements")
        if progress_callback:
            await progress_callback(50, "Enhancing transcription with AI models", 2)

        improvement_tasks = [
            self._improve_with_groq_llama33(whisper_text, api_key=groq_api_key),
            self._improve_with_openrouter_gpt4o(whisper_text, api_key=openrouter_api_key),
        ]

        improvement_results = await asyncio.gather(*improvement_tasks, return_exceptions=True)
        if progress_callback:
            await progress_callback(80, "AI enhancement complete", 2)

        # Extract successful and non-rejected results
        successful_results = []
        for i, result in enumerate(improvement_results):
            if isinstance(result, dict) and result.get("text"):
                # If the model explicitly rejected (too divergent), skip
                if result.get("rejected"):
                    logger.warning(f"⚠️ Model {i+1} result rejected due to low similarity")
                    continue
                successful_results.append(result)
                logger.info(f"✅ Model {i+1} successful: {len(result['text'])} chars")
            else:
                logger.warning(f"❌ Model {i+1} failed: {str(result) if not isinstance(result, Exception) else str(result)}")

        # Step 3: Combine results conservatively
        if progress_callback:
            await progress_callback(90, "Finalizing transcription", 3)
        if successful_results:
            if len(successful_results) == 1:
                # Only one trustworthy model result
                final_transcription = successful_results[0]["text"]
            else:
                # Compute pairwise agreement confidence; if low, fallback to Whisper
                confidence = self._calculate_multi_confidence(successful_results)
                logger.info(f"Models agreement confidence: {confidence:.2f}")
                if confidence < MIN_AGREEMENT_CONFIDENCE:
                    logger.warning("Model agreement low — falling back to Whisper transcription to avoid hallucination")
                    final_transcription = whisper_text
                else:
                    # Use Groq combination for conservative merging
                    final_transcription = await self._combine_multiple_transcriptions(successful_results)
        else:
            # Fallback to Whisper only
            logger.warning("⚠️ All LLM improvements failed, using Whisper only")
            final_transcription = whisper_text
        if progress_callback:
            await progress_callback(100, "Transcription complete", 3)

        processing_time = time.time() - start_time
        logger.info(f"✅ 2-model processing completed in {processing_time:.2f}s")

        return {
            "transcription": final_transcription,
            "processing_time": processing_time,
            "method": "2_model_parallel",
            "whisper_text_length": len(whisper_text),
            "llm_improvements_successful": len(successful_results),
            "transcription_length": len(final_transcription)
        }

    async def process_transcription_ultra_fast(
        self,
        audio_data: np.ndarray,
        progress_callback=None,
        groq_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Ultra-fast processing: Audio chunking + parallel Whisper + parallel LLMs.
        Target: 5 seconds or less for most audio files.
        """
        start_time = time.time()

        # Step 1: Chunk audio into 20-second segments for better parallel processing
        logger.info("🎯 Step 1: Audio chunking for parallel processing")
        if progress_callback:
            await progress_callback(15, "Audio chunking for parallel processing", 1)
        
        audio_chunks = self._chunk_audio_data(audio_data, chunk_duration=20.0)  # 20-second chunks
        logger.info(f"📦 Split audio into {len(audio_chunks)} chunks")

        # Step 2: Process all audio chunks in parallel with Whisper
        logger.info("🚀 Step 2: Parallel Whisper transcription")
        if progress_callback:
            await progress_callback(35, "Whisper transcription in progress", 2)
        
        whisper_tasks = [
            self._transcribe_audio_chunk(chunk) for chunk in audio_chunks
        ]
        whisper_results = await asyncio.gather(*whisper_tasks, return_exceptions=True)

        # Extract successful transcriptions
        chunk_transcriptions = []
        for i, result in enumerate(whisper_results):
            if isinstance(result, dict) and result.get("text"):
                chunk_transcriptions.append({
                    "text": result["text"],
                    "chunk_id": i,
                    "start_time": i * 10.0
                })

        logger.info(f"📝 Got {len(chunk_transcriptions)} successful chunk transcriptions")

        # Step 3: Combine all chunk transcriptions
        if progress_callback:
            await progress_callback(60, "Combining transcriptions", 3)
            
        full_transcription = self._combine_chunk_transcriptions(chunk_transcriptions)
        logger.info(f"📋 Combined transcription length: {len(full_transcription)} characters")
        if progress_callback:
            await progress_callback(70, "Transcription combined", 3)

        # Step 4: Single ultra-fast LLM improvement (instead of chunked)
        logger.info("⚡ Step 4: Single LLM improvement for speed")
        if progress_callback:
            await progress_callback(80, "Enhancing with AI", 4)
            
        improved_transcription = await self._ultra_fast_improve_transcription(full_transcription, api_key=groq_api_key)

        if progress_callback:
            await progress_callback(95, "Finalizing transcription", 4)

        processing_time = time.time() - start_time
        logger.info(f"✅ Ultra-fast processing completed in {processing_time:.2f} seconds")

        if progress_callback:
            await progress_callback(100, "Processing complete", 4)

        return {
            "transcription": improved_transcription,
            "processing_time": processing_time,
            "method": "ultra_fast_chunked",
            "audio_chunks": len(audio_chunks),
            "whisper_chunks_successful": len(chunk_transcriptions),
            "transcription_length": len(improved_transcription)
        }

    async def process_transcription_ultra_fast_v3(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """
        Ultra-fast v3: Single fast Whisper + minimal/no LLM improvement.
        Target: 5 seconds or less - prioritize speed over quality.
        """
        start_time = time.time()

        # Step 1: Single Whisper transcription with optimized settings
        logger.info("🎯 Step 1: Single fast Whisper transcription (optimized)")
        audio_duration = len(audio_data) / 16000  # Assuming 16kHz sample rate
        logger.info(f"🎵 Audio duration: {audio_duration:.1f} seconds")
        whisper_result = self.whisper_model.transcribe(audio_data, fp16=True, language="en", beam_size=1)
        full_transcription = str(whisper_result.get("text", "")).strip()
        logger.info(f"📝 Whisper transcription length: {len(full_transcription)} characters")

        # Step 2: Skip LLM improvement for maximum speed
        logger.info("🚀 Step 2: Skipping LLM improvement for speed")

        processing_time = time.time() - start_time
        logger.info(f"✅ Ultra-fast v3 completed in {processing_time:.2f}s")

        return {
            "transcription": full_transcription,
            "processing_time": processing_time,
            "method": "ultra_fast_v3",
            "whisper_model": "large-v3",
            "improvements_applied": 0,
            "transcription_length": len(full_transcription)
        }

    async def _improve_text_quality(self, text: str, api_key: Optional[str] = None) -> str:
        """Fast quality improvement."""
        try:
            client = self._get_groq_client(api_key)
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Keep it natural."},
                    {"role": "user", "content": text}
                ],
                max_tokens=400,
                temperature=float(os.getenv('MODEL_TEMPERATURE', MODEL_TEMPERATURE))
            )
            improved = (response.choices[0].message.content or text).strip()
            # Validate similarity; if poor, return original text
            if not self._validate_improvement(text, improved):
                return text
            return improved
        except Exception as e:
            logger.warning(f"Quality improvement failed: {str(e)}")
            return text

    async def _improve_text_grammar(self, text: str, api_key: Optional[str] = None) -> str:
        """Fast grammar improvement."""
        try:
            client = self._get_openrouter_client(api_key)
            response = client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[
                    {"role": "system", "content": "Fix grammar and punctuation in this transcription. Keep it natural."},
                    {"role": "user", "content": text}
                ],
                max_tokens=400,
                temperature=float(os.getenv('MODEL_TEMPERATURE', MODEL_TEMPERATURE))
            )
            improved = (response.choices[0].message.content or text).strip()
            if not self._validate_improvement(text, improved):
                return text
            return improved
        except Exception as e:
            logger.warning(f"Grammar improvement failed: {str(e)}")
            return text

    async def _old_improve_with_groq_llama33(self, text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Improve transcription using Groq Llama 3.3 70B."""
        try:
            client = self._get_groq_client(api_key)
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Fix any errors and make it more natural. Do NOT invent new facts."},
                    {"role": "user", "content": text}
                ],
                max_tokens=600,
                temperature=float(os.getenv('MODEL_TEMPERATURE', MODEL_TEMPERATURE))
            )

            improved_text = response.choices[0].message.content or text
            improved_text = improved_text.strip()
            # Validate similarity to avoid hallucinations
            if not self._validate_improvement(text, improved_text):
                logger.warning("Groq improvement rejected due to low similarity")
                return {"text": text, "model": "groq_llama33_70b", "provider": "Groq", "rejected": True}

            return {
                "text": improved_text,
                "model": "groq_llama33_70b",
                "provider": "Groq",
                "original_length": len(text),
                "improved_length": len(improved_text)
            }
        except Exception as e:
            logger.error(f"Groq Llama33 improvement failed: {str(e)}")
            return {"text": text, "error": str(e), "model": "groq_llama33_70b"}

    async def _old_improve_with_openrouter_gpt4o(self, text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Improve transcription using OpenRouter GPT-4o Mini."""
        try:
            client = self._get_openrouter_client(api_key)
            response = client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Fix any errors and make it more natural. Do NOT add content or summarize."},
                    {"role": "user", "content": text}
                ],
                max_tokens=1000,
                temperature=float(os.getenv('MODEL_TEMPERATURE', MODEL_TEMPERATURE))
            )

            improved_text = (response.choices[0].message.content or text).strip()
            if not self._validate_improvement(text, improved_text):
                logger.warning("OpenRouter GPT-4o improvement rejected due to low similarity")
                return {"text": text, "model": "openrouter_gpt4o_mini", "provider": "OpenRouter", "rejected": True}

            return {
                "text": improved_text,
                "model": "openrouter_gpt4o_mini",
                "provider": "OpenRouter",
                "original_length": len(text),
                "improved_length": len(improved_text)
            }
        except Exception as e:
            logger.error(f"OpenRouter GPT-4o improvement failed: {str(e)}")
            return {"text": text, "error": str(e), "model": "openrouter_gpt4o_mini"}

    def _chunk_audio_data(self, audio_data: np.ndarray, chunk_duration: float = 10.0, sample_rate: int = 16000) -> List[np.ndarray]:
        """Split audio data into chunks of specified duration."""
        chunk_samples = int(chunk_duration * sample_rate)
        chunks = []

        for i in range(0, len(audio_data), chunk_samples):
            chunk = audio_data[i:i + chunk_samples]
            if len(chunk) >= sample_rate:  # At least 1 second
                chunks.append(chunk)

        return chunks

    async def _transcribe_audio_chunk(self, audio_chunk: np.ndarray) -> Dict[str, Any]:
        """Transcribe a single audio chunk with Whisper."""
        try:
            # Use main whisper model for chunked offline transcription path
            result = self.whisper_model.transcribe(audio_chunk, fp16=False)
            return {
                "text": str(result.get("text", "")).strip(),
                "success": True
            }
        except Exception as e:
            logger.warning(f"Chunk transcription failed: {str(e)}")
            return {"text": "", "success": False, "error": str(e)}

    def _combine_chunk_transcriptions(self, chunk_transcriptions: List[Dict]) -> str:
        """Combine multiple chunk transcriptions into coherent text."""
        if not chunk_transcriptions:
            return ""

        # Sort by chunk_id to maintain order
        sorted_chunks = sorted(chunk_transcriptions, key=lambda x: x["chunk_id"])

        # Simple concatenation with spacing
        combined = " ".join([chunk["text"] for chunk in sorted_chunks])

        # Clean up extra spaces
        import re
        combined = re.sub(r'\s+', ' ', combined).strip()

        return combined

    async def _ultra_fast_improve_transcription(self, transcription: str, api_key: Optional[str] = None) -> str:
        """Ultra-fast single LLM improvement for the entire transcription."""
        if len(transcription.strip()) < 10:
            return transcription

        try:
            # Use the fastest available model (Groq Llama 3.3)
            # IMPORTANT: Only fix grammar/punctuation, don't rewrite content!
            client = self._get_groq_client(api_key)
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are a transcription corrector. Fix ONLY grammar, punctuation, and obvious typos. Do NOT rewrite, summarize, or change the meaning. Return ONLY the corrected transcription with no extra commentary."},
                    {"role": "user", "content": f"Fix grammar and punctuation only:\n\n{transcription}"}
                ],
                max_tokens=2000,
                temperature=float(os.getenv('MODEL_TEMPERATURE', MODEL_TEMPERATURE))
            )

            improved = (response.choices[0].message.content or "").strip()
            # Validate improvement - if it deviates too much, keep original
            if not self._validate_improvement(transcription, improved):
                logger.warning("Ultra-fast improvement rejected due to low similarity; returning original")
                return transcription

            return improved

        except Exception as e:
            logger.warning(f"Ultra-fast improvement failed: {str(e)}")
            return transcription

    def _chunk_transcription_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split transcription text into manageable chunks."""
        words = text.split()
        chunks = []
        current_chunk = []

        for word in words:
            current_chunk.append(word)
            if len(' '.join(current_chunk)) >= chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = []

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks if chunks else [text]

    async def _improve_chunk_with_groq_llama33(self, chunk: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Quick improvement using Groq Llama 3.3."""
        try:
            client = self._get_groq_client(api_key)
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "Quickly improve this text for clarity and grammar. Keep it concise."},
                    {"role": "user", "content": chunk}
                ],
                max_tokens=300,  # Reduced for speed
                temperature=0.3  # Lower temperature for consistency
            )
            return {
                "text": (response.choices[0].message.content or chunk).strip(),
                "model": "groq_llama33_70b",
                "chunk": chunk[:50] + "..." if len(chunk) > 50 else chunk
            }
        except Exception as e:
            logger.warning(f"Groq improvement failed: {str(e)}")
            return {"text": chunk, "error": str(e)}

    async def _improve_chunk_with_openrouter_gpt4o(self, chunk: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Quick improvement using OpenRouter GPT-4o Mini."""
        try:
            client = self._get_openrouter_client(api_key)
            response = client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[
                    {"role": "system", "content": "Quickly improve this text for clarity and grammar. Keep it concise."},
                    {"role": "user", "content": chunk}
                ],
                max_tokens=300,
                temperature=0.3
            )
            return {
                "text": (response.choices[0].message.content or chunk).strip(),
                "model": "openrouter_gpt4o_mini",
                "chunk": chunk[:50] + "..." if len(chunk) > 50 else chunk
            }
        except Exception as e:
            logger.warning(f"OpenRouter GPT-4o improvement failed: {str(e)}")
            return {"text": chunk, "error": str(e)}

    async def _improve_chunk_with_openrouter_claude(self, chunk: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Quick improvement using OpenRouter Claude Haiku."""
        try:
            client = self._get_openrouter_client(api_key)
            response = client.chat.completions.create(
                model=OPENROUTER_MODEL_2,
                messages=[
                    {"role": "system", "content": "Quickly improve this text for clarity and grammar. Keep it concise."},
                    {"role": "user", "content": chunk}
                ],
                max_tokens=300,
                temperature=0.3
            )
            return {
                "text": (response.choices[0].message.content or chunk).strip(),
                "model": "openrouter_claude_haiku",
                "chunk": chunk[:50] + "..." if len(chunk) > 50 else chunk
            }
        except Exception as e:
            logger.warning(f"OpenRouter Claude improvement failed: {str(e)}")
            return {"text": chunk, "error": str(e)}

    def _quick_combine_improvements(self, improvements: List[Dict], fallback_text: str) -> str:
        """Quick combination of improved chunks."""
        if not improvements:
            return fallback_text

        # For speed, just use the first successful improvement as the main text
        # In production, you might want more sophisticated combination
        best_improvement = max(improvements, key=lambda x: len(x.get("text", "")))
        return best_improvement.get("text", fallback_text)

    async def _improve_with_groq_llama33(self, whisper_text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Improve transcription using Groq Llama 3.3 70B."""
        try:
            client = self._get_groq_client(api_key)
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Fix any errors."},
                    {"role": "user", "content": f"Original transcription: {whisper_text}"}
                ],
                max_tokens=1000
            )
            return {
                "text": response.choices[0].message.content or whisper_text,
                "model": "groq_llama33_70b",
                "provider": "Groq",
                "original_whisper": whisper_text
            }
        except Exception as e:
            logger.error(f"Groq Llama33 transcription failed: {str(e)}")
            return {"text": "", "error": str(e), "model": "groq_llama33_70b"}

    async def _improve_with_groq_llama31(self, whisper_text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Improve transcription using Groq Llama 3.1 70B."""
        try:
            client = self._get_groq_client(api_key)
            response = client.chat.completions.create(
                model=GROQ_MODEL_2,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Fix any errors."},
                    {"role": "user", "content": f"Original transcription: {whisper_text}"}
                ],
                max_tokens=1000
            )
            return {
                "text": response.choices[0].message.content or whisper_text,
                "model": "groq_llama31_70b",
                "provider": "Groq",
                "original_whisper": whisper_text
            }
        except Exception as e:
            logger.error(f"Groq Llama31 transcription failed: {str(e)}")
            return {"text": "", "error": str(e), "model": "groq_llama31_70b"}

    async def _improve_with_openrouter_gpt4o(self, whisper_text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Improve transcription using OpenRouter GPT-4o Mini."""
        try:
            client = self._get_openrouter_client(api_key)
            response = client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Fix any errors."},
                    {"role": "user", "content": f"Original transcription: {whisper_text}"}
                ],
                max_tokens=1000
            )
            return {
                "text": response.choices[0].message.content or whisper_text,
                "model": "openrouter_gpt4o_mini",
                "provider": "OpenRouter",
                "original_whisper": whisper_text
            }
        except Exception as e:
            logger.error(f"OpenRouter GPT-4o transcription failed: {str(e)}")
            return {"text": "", "error": str(e), "model": "openrouter_gpt4o_mini"}

    async def _improve_with_openrouter_claude(self, whisper_text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Improve transcription using OpenRouter Claude Haiku."""
        try:
            client = self._get_openrouter_client(api_key)
            response = client.chat.completions.create(
                model=OPENROUTER_MODEL_2,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Fix any errors."},
                    {"role": "user", "content": f"Original transcription: {whisper_text}"}
                ],
                max_tokens=1000
            )
            return {
                "text": response.choices[0].message.content or whisper_text,
                "model": "openrouter_claude_haiku",
                "provider": "OpenRouter",
                "original_whisper": whisper_text
            }
        except Exception as e:
            logger.error(f"OpenRouter Claude transcription failed: {str(e)}")
            return {"text": "", "error": str(e), "model": "openrouter_claude_haiku"}

    async def _transcribe_with_openrouter_gemini(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """Transcribe using Whisper + OpenRouter Gemini Flash."""
        try:
            result = self.whisper_model.transcribe(audio_data, fp16=False)
            whisper_text = result["text"]

            response = self.openai_client_3.chat.completions.create(
                model=OPENROUTER_MODEL_3,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Fix any errors."},
                    {"role": "user", "content": f"Original transcription: {whisper_text}"}
                ],
                max_tokens=1000
            )

            return {
                "text": response.choices[0].message.content or whisper_text,
                "model": "openrouter_gemini_flash",
                "provider": "OpenRouter",
                "original_whisper": whisper_text
            }
        except Exception as e:
            logger.error(f"OpenRouter Gemini transcription failed: {str(e)}")
            return {"text": "", "error": str(e), "model": "openrouter_gemini_flash"}

    async def _combine_transcriptions(self, groq_result: Dict[str, Any], openrouter_result: Dict[str, Any]) -> str:
        """Combine transcriptions from both APIs using AI for improvement."""
        groq_text = groq_result.get("text", "")
        openrouter_text = openrouter_result.get("text", "")

        if not groq_text and not openrouter_text:
            return "Transcription failed for both APIs"

        if groq_text and not openrouter_text:
            return groq_text
        if openrouter_text and not groq_text:
            return openrouter_text

        # Use Groq to combine and improve
        try:
            response = self.groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "Combine these two transcriptions into the most accurate version. Resolve conflicts and improve clarity."},
                    {"role": "user", "content": f"Transcription 1: {groq_text}\nTranscription 2: {openrouter_text}"}
                ],
                max_tokens=1500
            )
            return response.choices[0].message.content or "Combination failed"
        except Exception as e:
            logger.error(f"Combination failed: {str(e)}")
            # Fallback: return longer transcription
            return groq_text if len(groq_text) > len(openrouter_text) else openrouter_text

    def _calculate_confidence(self, result1: Dict[str, Any], result2: Dict[str, Any]) -> float:
        """Calculate confidence score based on agreement between APIs."""
        text1 = result1.get("text", "").strip()
        text2 = result2.get("text", "").strip()

        if not text1 or not text2:
            return 0.0

        # Simple similarity score
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())

        intersection = words1.intersection(words2)
        union = words1.union(words2)

        if not union:
            return 0.0

        return len(intersection) / len(union)

    async def _combine_multiple_transcriptions(self, results: List[Dict[str, Any]]) -> str:
        """Combine transcriptions from multiple models using AI for intelligent merging."""
        if not results:
            return "No transcriptions available"

        if len(results) == 1:
            return results[0].get("text", "")

        # Extract all texts
        texts = [result.get("text", "") for result in results if result.get("text")]

        if not texts:
            return "All transcriptions failed"

        # Use the most capable model (Groq Llama 3.3) to combine all results
        try:
            combined_input = "\n\n".join([f"Transcription {i+1}: {text}" for i, text in enumerate(texts)])

            response = self.groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": """You are an expert transcription editor. Combine these multiple transcriptions into the most accurate, clear, and complete version. 

Rules:
1. Resolve conflicts by choosing the most logical/clear version
2. Fill in gaps where one transcription has missing information
3. Correct obvious errors and improve grammar
4. Maintain the original meaning and intent
5. If transcriptions significantly differ, create a coherent synthesis
6. Return only the final combined transcription, no explanations"""},
                    {"role": "user", "content": f"Combine these {len(texts)} transcriptions:\n\n{combined_input}"}
                ],
                max_tokens=2000
            )

            combined_text = response.choices[0].message.content
            return combined_text if combined_text else texts[0]

        except Exception as e:
            logger.error(f"Multi-transcription combination failed: {str(e)}")
            # Fallback: return the longest transcription
            return max(texts, key=len)

    def _calculate_multi_confidence(self, results: List[Dict[str, Any]]) -> float:
        """Calculate confidence score based on agreement between multiple models."""
        if len(results) < 2:
            return 0.5  # Default confidence for single result

        texts = [result.get("text", "").strip() for result in results if result.get("text")]

        if len(texts) < 2:
            return 0.5

        # Calculate pairwise similarities
        similarities = []
        for i in range(len(texts)):
            for j in range(i+1, len(texts)):
                text1, text2 = texts[i], texts[j]

                words1 = set(text1.lower().split())
                words2 = set(text2.lower().split())

                if not words1 or not words2:
                    continue

                intersection = words1.intersection(words2)
                union = words1.union(words2)

                if union:
                    similarity = len(intersection) / len(union)
                    similarities.append(similarity)

        if not similarities:
            return 0.0

        # Average similarity as confidence score
        avg_similarity = sum(similarities) / len(similarities)

        # Boost confidence based on number of agreeing models
        agreement_bonus = min(len(results) / 5.0, 1.0)  # Max bonus at 5 models

        return min(avg_similarity * (0.8 + 0.2 * agreement_bonus), 1.0)

    async def process_realtime_chunk(self, audio_data: bytes, sample_rate: int = 16000, language: Optional[str] = None) -> Dict[str, Any]:
        """Process real-time audio chunks with simple single-speaker mode."""
        try:
            array = self.audio_processor.process_audio_chunk(audio_data, sample_rate)
            
            # Skip empty arrays (decode failures or invalid data)
            if array is None or len(array) == 0:
                logger.debug("Skipping empty audio array")
                return {"transcription": "", "confidence": 0.0, "speaker_id": 1}
            
            self.rt_buffer.append(array)
            self.rt_total_samples += len(array)
            duration = self.rt_total_samples / self.rt_sample_rate

            # Determine if we should flush (transcribe now)
            flush = False
            # Force flush if exceeded max seconds
            if duration >= self.rt_max_secs:
                flush = True
            # Flush if we have min seconds and trailing silence
            if not flush and duration >= self.rt_min_secs:
                tail_samples = int(self.rt_silence_tail_secs * self.rt_sample_rate)
                concat = np.concatenate(self.rt_buffer)
                tail = concat[-tail_samples:]
                energy = float(np.mean(tail ** 2))
                if energy < self.rt_silence_threshold:
                    flush = True

            if not flush:
                return {"transcription": "", "confidence": 0.0, "speaker_id": 1}

            # Concatenate buffered audio and check OVERALL energy to prevent hallucinations on silence
            full_audio = np.concatenate(self.rt_buffer)
            overall_energy = float(np.mean(full_audio ** 2))
            
            # If buffer is mostly silence, skip transcription to prevent Whisper hallucinations
            if overall_energy < self.rt_silence_threshold * 2:  # 2x threshold - balanced detection
                logger.debug(f"Skipping transcription - buffer energy too low: {overall_energy:.2e}")
                self.rt_buffer.clear()
                self.rt_total_samples = 0
                return {"transcription": "", "confidence": 0.0, "speaker_id": 1}
            
            model_for_realtime = getattr(self, 'realtime_whisper_model', self.whisper_model)
            use_fp16 = os.getenv('REALTIME_WHISPER_FP16', '0') == '1'
            # Auto-detect language - don't force any language for multilingual support
            start = time.time()
            result = model_for_realtime.transcribe(
                full_audio,
                fp16=use_fp16,
                language=None,  # Auto-detect language
                beam_size=1,
                best_of=1,
                temperature=0.0,
                condition_on_previous_text=True,
                word_timestamps=False,
                no_speech_threshold=0.4,  # Back to original - better accuracy
                logprob_threshold=-0.7,  # Back to original - more lenient
                compression_ratio_threshold=2.4  # Keep this - catches hallucination loops
            )
            elapsed = time.time() - start
            text = str(result.get('text', '')).strip()
            
            # Always use Speaker 1 (single-speaker mode)
            speaker_id = 1
            
            logger.debug(f"Realtime flush {duration:.2f}s energy={overall_energy:.2e} speaker={speaker_id} -> transcribed {len(text)} chars in {elapsed:.3f}s")

            # Minimal hallucination filtering - only block extreme obvious false outputs
            if text:
                text_lower = text.lower()
                words = text_lower.split()
                
                # Only filter if compression ratio is EXTREMELY high (Whisper's built-in check)
                compression_ratio = result.get('compression_ratio', 0)
                try:
                    if isinstance(compression_ratio, (int, float, str)):
                        compression_ratio = float(compression_ratio)
                    else:
                        compression_ratio = 0.0
                except (ValueError, TypeError):
                    compression_ratio = 0.0
                    
                # Only filter if compression ratio is above 2.8 (hallucination loops)
                if compression_ratio > 2.8:
                    logger.warning(f"Filtering hallucination (high compression ratio {compression_ratio:.2f}): {text[:80]}...")
                    self.rt_buffer.clear()
                    self.rt_total_samples = 0
                    return {"transcription": "", "confidence": 0.0, "speaker_id": 1}
                
                # Check for common phrase repetition patterns (Whisper hallucinations)
                # Look for 2-4 word phrases repeated many times
                if len(words) > 20:  # Only check longer texts
                    for phrase_len in [2, 3, 4]:
                        if len(words) >= phrase_len * 8:  # Need at least 8 repetitions
                            for i in range(len(words) - phrase_len + 1):
                                phrase = ' '.join(words[i:i+phrase_len])
                                phrase_count = text_lower.count(phrase)
                                # If phrase appears 8+ times, it's likely a hallucination
                                if phrase_count >= 8:
                                    logger.warning(f"Filtering hallucination (phrase loop: '{phrase}' x{phrase_count}): {text[:80]}...")
                                    self.rt_buffer.clear()
                                    self.rt_total_samples = 0
                                    return {"transcription": "", "confidence": 0.0, "speaker_id": 1}
                
                # Only filter if >98% of words are identical AND text is long (extreme repetition)
                # This prevents filtering legitimate uses of "OK OK" or "yes yes"
                if len(words) > 15:  # Only check for long texts
                    word_counts = {}
                    for w in words:
                        word_counts[w] = word_counts.get(w, 0) + 1
                    max_count = max(word_counts.values()) if word_counts else 0
                    if max_count / len(words) > 0.98:  # 98% threshold - almost impossible in real speech
                        logger.warning(f"Filtering hallucination (extreme word repetition {max_count}/{len(words)}): {text[:80]}...")
                        self.rt_buffer.clear()
                        self.rt_total_samples = 0
                        return {"transcription": "", "confidence": 0.0, "speaker_id": 1}
                
                # Profanity filter - replace bad words with asterisks instead of blocking entire text
                profanity_list = [
                    'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'hell', 'crap',
                    'fucking', 'fucked', 'bullshit', 'asshole', 'dick', 'pussy', 'cock',
                    'motherfucker', 'whore', 'slut', 'nigger', 'fag', 'faggot', 'retard'
                ]
                
                # Replace profanity with asterisks (preserve word length for context)
                import re
                for profanity in profanity_list:
                    # Use word boundaries to avoid replacing parts of legitimate words
                    pattern = re.compile(r'\b' + re.escape(profanity) + r'\b', re.IGNORECASE)
                    text = pattern.sub('***', text)

            # Delta: only send new part beyond last_sent
            if text.startswith(self.rt_last_text):
                new_part = text[len(self.rt_last_text):].strip()
            else:
                # Reset if mismatch (e.g., model rewrote)
                new_part = text
            # Update state
            self.rt_last_text = text
            self.rt_buffer.clear()
            self.rt_total_samples = 0

            if not new_part:
                return {"transcription": "", "confidence": 0.0, "speaker_id": 1}

            # Final check: skip if new_part is too short or only punctuation
            if len(new_part) < 3 or new_part in ['.', ',', '!', '?', '...']:
                return {"transcription": "", "confidence": 0.0, "speaker_id": 1}

            return {"transcription": new_part, "confidence": 0.85, "speaker_id": 1}
        except Exception as e:
            logger.error(f"Realtime processing error: {str(e)}", exc_info=True)
            self.rt_buffer.clear()
            self.rt_total_samples = 0
            return {"transcription": "", "confidence": 0.0, "speaker_id": 1}