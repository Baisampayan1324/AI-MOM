import asyncio
import time
import logging
from typing import Dict, Any, List, Optional
import aiohttp
from groq import Groq
import openai
import numpy as np
import whisper
from app.config import (
    GROQ_API_KEY, OPENROUTER_API_KEY,
    GROQ_MODEL, OPENROUTER_MODEL,
    GROQ_MODEL_2, OPENROUTER_MODEL_2, OPENROUTER_MODEL_3
)
from app.config import TRANSCRIPTION_LANGUAGE
from app.services.audio_processor import AudioProcessor

logger = logging.getLogger(__name__)

class MultiAPIProcessor:
    def __init__(self):
        # Initialize Groq clients with different models
        self.groq_client = Groq(api_key=GROQ_API_KEY)
        self.groq_client_2 = Groq(api_key=GROQ_API_KEY)  # Same key, different model

        # Initialize OpenRouter clients with different models
        self.openai_client = openai.OpenAI(
            api_key=OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1"
        )
        self.openai_client_2 = openai.OpenAI(
            api_key=OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1"
        )
        self.openai_client_3 = openai.OpenAI(
            api_key=OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1"
        )

        self.audio_processor = AudioProcessor()
        # Initialize Whisper model - using 'large-v3' for maximum accuracy
        self.whisper_model = whisper.load_model("large-v3")
        self.min_audio_length = 0.5  # Minimum 0.5 seconds of audio before processing
        self.audio_buffer = []  # Buffer for accumulating audio chunks

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

    async def process_transcription_2_model(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """
        2-model parallel processing: Run Groq Llama 3.3 and OpenRouter GPT-4o Mini in parallel.
        Target: ~20 seconds processing time with improved accuracy.
        """
        start_time = time.time()

        # Step 1: Get Whisper transcription first (fast baseline)
        logger.info("🎯 Step 1: Fast Whisper transcription")
        whisper_result = self.whisper_model.transcribe(audio_data, fp16=True, language="en")
        whisper_text = str(whisper_result.get("text", "")).strip()
        logger.info(f"📝 Whisper transcription: {len(whisper_text)} characters")

        # Step 2: Run 2 LLM improvements in parallel on the Whisper text
        logger.info("🚀 Step 2: Parallel 2-model LLM improvements")

        improvement_tasks = [
            self._improve_with_groq_llama33(whisper_text),
            self._improve_with_openrouter_gpt4o(whisper_text),
        ]

        improvement_results = await asyncio.gather(*improvement_tasks, return_exceptions=True)

        # Extract successful results
        successful_results = []
        for i, result in enumerate(improvement_results):
            if isinstance(result, dict) and result.get("text"):
                successful_results.append(result)
                logger.info(f"✅ Model {i+1} successful: {len(result['text'])} chars")
            else:
                logger.warning(f"❌ Model {i+1} failed: {str(result) if not isinstance(result, Exception) else str(result)}")

        # Step 3: Combine results
        if successful_results:
            if len(successful_results) == 1:
                # Only one successful result
                final_transcription = successful_results[0]["text"]
            else:
                # Combine multiple results using simple selection (fastest approach)
                final_transcription = successful_results[0]["text"]  # Use first successful result
        else:
            # Fallback to Whisper only
            logger.warning("⚠️ All LLM improvements failed, using Whisper only")
            final_transcription = whisper_text

        processing_time = time.time() - start_time
        logger.info(".2f")

        return {
            "transcription": final_transcription,
            "processing_time": processing_time,
            "method": "2_model_parallel",
            "whisper_text_length": len(whisper_text),
            "llm_improvements_successful": len(successful_results),
            "transcription_length": len(final_transcription)
        }

    async def process_transcription_ultra_fast(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """
        Ultra-fast processing: Audio chunking + parallel Whisper + parallel LLMs.
        Target: 5 seconds or less for most audio files.
        """
        start_time = time.time()

        # Step 1: Chunk audio into 20-second segments for better parallel processing
        logger.info("🎯 Step 1: Audio chunking for parallel processing")
        audio_chunks = self._chunk_audio_data(audio_data, chunk_duration=20.0)  # 20-second chunks
        logger.info(f"📦 Split audio into {len(audio_chunks)} chunks")

        # Step 2: Process all audio chunks in parallel with Whisper
        logger.info("🚀 Step 2: Parallel Whisper transcription")
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
        full_transcription = self._combine_chunk_transcriptions(chunk_transcriptions)
        logger.info(f"� Combined transcription length: {len(full_transcription)} characters")

        # Step 4: Single ultra-fast LLM improvement (instead of chunked)
        logger.info("⚡ Step 4: Single LLM improvement for speed")
        improved_transcription = await self._ultra_fast_improve_transcription(full_transcription)

        processing_time = time.time() - start_time
        logger.info(".2f")

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
        logger.info(".2f")

        return {
            "transcription": full_transcription,
            "processing_time": processing_time,
            "method": "ultra_fast_v3",
            "whisper_model": "large-v3",
            "improvements_applied": 0,
            "transcription_length": len(full_transcription)
        }

    async def _improve_text_quality(self, text: str) -> str:
        """Fast quality improvement."""
        try:
            response = self.groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Keep it natural."},
                    {"role": "user", "content": text}
                ],
                max_tokens=400,
                temperature=0.2
            )
            return (response.choices[0].message.content or text).strip()
        except Exception as e:
            logger.warning(f"Quality improvement failed: {str(e)}")
            return text

    async def _improve_text_grammar(self, text: str) -> str:
        """Fast grammar improvement."""
        try:
            response = self.openai_client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[
                    {"role": "system", "content": "Fix grammar and punctuation in this transcription. Keep it natural."},
                    {"role": "user", "content": text}
                ],
                max_tokens=400,
                temperature=0.2
            )
            return (response.choices[0].message.content or text).strip()
        except Exception as e:
            logger.warning(f"Grammar improvement failed: {str(e)}")
            return text

    async def _improve_with_groq_llama33(self, text: str) -> Dict[str, Any]:
        """Improve transcription using Groq Llama 3.3 70B."""
        try:
            response = self.groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Fix any errors and make it more natural."},
                    {"role": "user", "content": text}
                ],
                max_tokens=600,  # Reduced for speed
                temperature=0.1  # Lower temperature for speed
            )

            improved_text = response.choices[0].message.content or text
            return {
                "text": improved_text.strip(),
                "model": "groq_llama33_70b",
                "provider": "Groq",
                "original_length": len(text),
                "improved_length": len(improved_text.strip())
            }
        except Exception as e:
            logger.error(f"Groq Llama33 improvement failed: {str(e)}")
            return {"text": text, "error": str(e), "model": "groq_llama33_70b"}

    async def _improve_with_openrouter_gpt4o(self, text: str) -> Dict[str, Any]:
        """Improve transcription using OpenRouter GPT-4o Mini."""
        try:
            response = self.openai_client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[
                    {"role": "system", "content": "Improve this transcription for clarity and accuracy. Fix any errors and make it more natural."},
                    {"role": "user", "content": text}
                ],
                max_tokens=1000,
                temperature=0.3
            )

            improved_text = response.choices[0].message.content or text
            return {
                "text": improved_text.strip(),
                "model": "openrouter_gpt4o_mini",
                "provider": "OpenRouter",
                "original_length": len(text),
                "improved_length": len(improved_text.strip())
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

    async def _ultra_fast_improve_transcription(self, transcription: str) -> str:
        """Ultra-fast single LLM improvement for the entire transcription."""
        if len(transcription.strip()) < 10:
            return transcription

        try:
            # Use the fastest available model (Groq Llama 3.3)
            # IMPORTANT: Only fix grammar/punctuation, don't rewrite content!
            response = self.groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are a transcription corrector. Fix ONLY grammar, punctuation, and obvious typos. Do NOT rewrite, summarize, or change the meaning. Return ONLY the corrected transcription with no extra commentary."},
                    {"role": "user", "content": f"Fix grammar and punctuation only:\n\n{transcription}"}
                ],
                max_tokens=2000,  # Increased to handle longer transcripts
                temperature=0.1  # Lower temperature for consistency and speed
            )

            improved = response.choices[0].message.content
            
            # If Groq added commentary, try to extract just the transcription
            if improved and not improved.startswith("Here"):
                return improved.strip()
            else:
                # Groq added commentary, return original
                logger.warning("Groq added commentary instead of correcting, returning original")
                return transcription

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

    async def _improve_chunk_with_groq_llama33(self, chunk: str) -> Dict[str, Any]:
        """Quick improvement using Groq Llama 3.3."""
        try:
            response = self.groq_client.chat.completions.create(
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

    async def _improve_chunk_with_openrouter_gpt4o(self, chunk: str) -> Dict[str, Any]:
        """Quick improvement using OpenRouter GPT-4o Mini."""
        try:
            response = self.openai_client.chat.completions.create(
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

    async def _improve_chunk_with_openrouter_claude(self, chunk: str) -> Dict[str, Any]:
        """Quick improvement using OpenRouter Claude Haiku."""
        try:
            response = self.openai_client_2.chat.completions.create(
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

    async def _transcribe_with_groq_llama33(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """Transcribe using Whisper + Groq Llama 3.3 70B."""
        try:
            result = self.whisper_model.transcribe(audio_data, fp16=False)
            whisper_text = result["text"]

            response = self.groq_client.chat.completions.create(
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

    async def _transcribe_with_groq_llama31(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """Transcribe using Whisper + Groq Llama 3.1 70B."""
        try:
            result = self.whisper_model.transcribe(audio_data, fp16=False)
            whisper_text = result["text"]

            response = self.groq_client_2.chat.completions.create(
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

    async def _transcribe_with_openrouter_gpt4o(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """Transcribe using Whisper + OpenRouter GPT-4o Mini."""
        try:
            result = self.whisper_model.transcribe(audio_data, fp16=False)
            whisper_text = result["text"]

            response = self.openai_client.chat.completions.create(
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

    async def _transcribe_with_openrouter_claude(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """Transcribe using Whisper + OpenRouter Claude Haiku."""
        try:
            result = self.whisper_model.transcribe(audio_data, fp16=False)
            whisper_text = result["text"]

            response = self.openai_client_2.chat.completions.create(
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
        """Process real-time audio chunk with optimized multi-API approach."""
        # Convert bytes to numpy
        audio_array = self.audio_processor.process_audio_chunk(audio_data, sample_rate)

        # For real-time, use Whisper directly for speed with aggressive filtering
        try:
            # Use optimized Whisper settings for real-time processing
            # Use provided language if set, otherwise fall back to configured default
            _language = language or TRANSCRIPTION_LANGUAGE
            result = self.whisper_model.transcribe(
                audio_array,
                fp16=False,
                language=_language,
                no_speech_threshold=0.6,  # Higher threshold to avoid false positives
                beam_size=1,  # Fastest beam search
                best_of=1,    # Don't try multiple candidates
                temperature=0.0,  # Most deterministic output
                condition_on_previous_text=False,  # Don't use context from previous transcriptions
                word_timestamps=False,  # Skip word-level timestamps for speed
                compression_ratio_threshold=2.4  # Avoid repetitive text
            )
            
            transcription = str(result.get("text", "")).strip()
            
            # Aggressive filtering to prevent false additions
            if transcription:
                # Remove common filler phrases that Whisper often adds incorrectly
                false_phrases = [
                    "thank you", "see you", "bye", "goodbye", "thanks", 
                    "you know", "um", "uh", "like", "so", "well",
                    "okay", "ok", "right", "yeah", "yes", "no"
                ]
                
                # Check if transcription is likely just noise or filler
                transcription_lower = transcription.lower().strip()
                
                # Skip if it's just punctuation or very short
                if len(transcription_lower) <= 2 or transcription_lower in [".", ",", "!", "?"]:
                    return {
                        "transcription": "",
                        "confidence": 0.0,
                        "speaker_id": None
                    }
                
                # Skip if it's just common filler words that might be false
                words = transcription_lower.split()
                if all(word.strip(".,!?") in false_phrases for word in words):
                    return {
                        "transcription": "",
                        "confidence": 0.0,
                        "speaker_id": None
                    }
                
                # Only return transcription if there's meaningful content
                if len(transcription) > 3 and len(words) > 0:
                    return {
                        "transcription": transcription,
                        "confidence": 0.8,
                        "speaker_id": 0
                    }

            # No meaningful speech detected, return empty
            return {
                "transcription": "",
                "confidence": 0.0,
                "speaker_id": None
            }
            
        except Exception as e:
            logger.error(f"Real-time processing failed: {str(e)}")
            return {
                "transcription": "",
                "confidence": 0.0,
                "speaker_id": None
            }