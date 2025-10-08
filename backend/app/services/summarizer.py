
import logging
from typing import Optional, List, Dict, Any
import json
import re
from groq import Groq
from app.config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger(__name__)

class Summarizer:
    def __init__(self):
        self.client = Groq(api_key=GROQ_API_KEY)

    async def generate_summary(self, text: str, max_length: int = 300) -> Optional[str]:
        """
        Generate AI-powered summary of the transcription.
        """
        if not text or len(text.strip()) < 10:
            return "Text too short for summarization"

        try:
            prompt = f"""
            Please provide a concise summary of the following meeting transcription.
            Focus on key points, decisions, and action items.
            Keep the summary under {max_length} words.

            Transcription:
            {text}
            """

            response = self.client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert meeting summarizer. Create clear, actionable summaries."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.3
            )

            summary = response.choices[0].message.content.strip() if response.choices[0].message.content else "Summary generation failed"
            return summary

        except Exception as e:
            logger.error(f"Summarization failed: {str(e)}")
            # Fallback: return first 200 characters
            return f"Summary unavailable. Original text: {text[:200]}..."

    async def generate_ultra_fast_summary(self, text: str, max_length: int = 200) -> Optional[str]:
        """
        Generate ultra-fast summary for speed optimization.
        """
        if not text or len(text.strip()) < 10:
            return "Text too short for summarization"

        try:
            # Extract first few sentences as quick summary
            sentences = text.split('.')
            quick_summary = '.'.join(sentences[:3]).strip() + '.'

            if len(quick_summary) > max_length:
                quick_summary = quick_summary[:max_length-3] + "..."

            return quick_summary

        except Exception as e:
            logger.error(f"Ultra-fast summarization failed: {str(e)}")
            return f"Summary unavailable. Original text: {text[:100]}..."

    async def generate_multi_api_summary(self, groq_text: str, openrouter_text: str) -> str:
        """
        Generate summary using insights from both API transcriptions.
        """
        try:
            combined_prompt = f"""
            Create a comprehensive summary based on two transcriptions of the same content.
            Resolve any discrepancies and provide the most accurate summary.

            Transcription 1 (Groq): {groq_text}
            Transcription 2 (OpenRouter): {openrouter_text}
            """

            response = self.client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert at reconciling multiple transcriptions into accurate summaries."},
                    {"role": "user", "content": combined_prompt}
                ],
                max_tokens=600,
                temperature=0.2
            )

            return response.choices[0].message.content.strip() if response.choices[0].message.content else "Multi-API summary failed"

        except Exception as e:
            logger.error(f"Multi-API summarization failed: {str(e)}")
            # Fallback to single API summary
            return await self.generate_summary(groq_text or openrouter_text) or "Summary unavailable"

    async def generate_multi_model_summary(self, transcriptions: List[Dict[str, Any]], max_length: int = 400) -> Optional[str]:
        """
        Generate summary using insights from multiple model transcriptions for maximum accuracy.
        """
        if not transcriptions:
            return "No transcriptions available for summarization"

        # Extract valid texts
        valid_texts = [t.get("text", "") for t in transcriptions if t.get("text", "").strip()]

        if not valid_texts:
            return "All transcriptions are empty"

        try:
            # Create combined input from all transcriptions
            combined_transcriptions = "\n\n".join([
                f"Version {i+1} ({t.get('model', f'Model {i+1}')}): {t.get('text', '')}"
                for i, t in enumerate(transcriptions)
            ])

            prompt = f"""
            You are an expert meeting analyst. Analyze these {len(valid_texts)} different transcriptions of the same meeting and create the most accurate, comprehensive summary.

            Structure your response with these sections:
            1. **Meeting Overview**: Brief description of the meeting's purpose and main topics
            2. **Key Points**: Main discussions, decisions, and important information shared
            3. **Action Items**: Specific tasks, responsibilities, and deadlines mentioned
            4. **Conclusions**: Any final agreements or next steps

            Resolve discrepancies by choosing the most logical interpretation.
            Keep the summary under {max_length} words but be comprehensive.

            Transcriptions:
            {combined_transcriptions}
            """

            response = self.client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing multiple transcriptions and creating accurate, actionable meeting summaries."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.2
            )

            summary = response.choices[0].message.content.strip() if response.choices[0].message.content else None

            if summary:
                return summary
            else:
                # Fallback to summarizing the first valid transcription
                return await self.generate_summary(valid_texts[0], max_length)

        except Exception as e:
            logger.error(f"Multi-model summarization failed: {str(e)}")
            # Fallback to summarizing the longest transcription
            longest_text = max(valid_texts, key=len)
            return await self.generate_summary(longest_text, max_length) or f"Summary unavailable. Original text: {longest_text[:200]}..."

    async def generate_comprehensive_summary(self, text: str) -> Dict[str, Any]:
        """
        Generate comprehensive meeting analysis including:
        - Full summary
        - Key points
        - Action items
        - Conclusion
        """
        if not text or len(text.strip()) < 10:
            return {
                "full_summary": "Text too short for comprehensive analysis",
                "key_points": [],
                "action_items": [],
                "conclusion": "Insufficient content for analysis"
            }

        try:
            prompt = f"""
            Analyze this meeting transcription and return a JSON object with exactly these fields:

            full_summary: A detailed summary of the meeting (200-300 words)
            key_points: Array of 3-5 main topics discussed
            action_items: Array of specific action items mentioned
            conclusion: Overall conclusion and next steps (100-150 words)

            Make sure to include a proper conclusion that summarizes the meeting outcomes, decisions made, and future directions.

            Return ONLY valid JSON like this example:
            {{
                "full_summary": "The meeting covered...",
                "key_points": ["Topic 1", "Topic 2"],
                "action_items": ["Action 1", "Action 2"],
                "conclusion": "In conclusion, the meeting successfully addressed the main topics. Key decisions were made regarding... Next steps include..."
            }}

            TRANSCRIPTION:
            {text}
            """

            response = self.client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert meeting analyst. Provide structured, actionable insights from meeting transcriptions in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.3
            )

            result_text = response.choices[0].message.content.strip() if response.choices[0].message.content else None
            if result_text:
                logger.info(f"LLM Response: {result_text[:500]}...")  # Debug logging
            else:
                logger.warning("LLM returned empty response")

            if result_text:
                try:
                    # Clean the response text to ensure valid JSON
                    result_text = result_text.strip()
                    if result_text.startswith('```json'):
                        result_text = result_text[7:]
                    if result_text.startswith('```'):
                        result_text = result_text[3:]
                    if result_text.endswith('```'):
                        result_text = result_text[:-3]
                    result_text = result_text.strip()

                    # Try to parse as JSON
                    result = json.loads(result_text)
                    return result
                except json.JSONDecodeError as e:
                    logger.warning(f"JSON parsing failed: {str(e)}, attempting manual parsing")
                    # If JSON parsing fails, try to extract information from the text
                    return self._extract_from_text_response(result_text)
            else:
                return self._fallback_comprehensive_summary(text)

        except Exception as e:
            logger.error(f"Comprehensive summarization failed: {str(e)}")
            return self._fallback_comprehensive_summary(text)

    def _extract_from_text_response(self, text: str) -> Dict[str, Any]:
        """Extract comprehensive summary data from text response when JSON parsing fails."""
        try:
            result = {
                "full_summary": "",
                "key_points": [],
                "action_items": [],
                "conclusion": ""
            }

            # Simple text-based extraction
            text_lower = text.lower()

            # Extract sections by looking for keywords
            lines = text.split('\n')

            current_section = None
            for line in lines:
                line = line.strip()
                if not line:
                    continue

                # Check for section headers
                if 'full_summary' in line.lower() or 'summary' in line.lower():
                    current_section = "full_summary"
                    continue
                elif 'key_points' in line.lower() or 'key points' in line.lower():
                    current_section = "key_points"
                    continue
                elif 'action_items' in line.lower() or 'action items' in line.lower():
                    current_section = "action_items"
                    continue
                elif 'conclusion' in line.lower():
                    current_section = "conclusion"
                    continue

                # Extract content for current section
                if current_section:
                    if current_section in ["key_points", "action_items"]:
                        # Look for list items
                        if line.startswith('-') or line.startswith('•') or line.startswith('*') or '"' in line:
                            clean_item = line.strip('-•* "').strip()
                            if clean_item and len(clean_item) > 5:  # Avoid very short items
                                result[current_section].append(clean_item)
                    else:
                        # For summary and conclusion, accumulate text
                        if not result[current_section] and len(line) > 10:
                            result[current_section] = line
                        elif result[current_section] and len(line) > 10:
                            result[current_section] += " " + line

            # Provide fallbacks if extraction failed
            if not result["full_summary"]:
                # Take first substantial paragraph
                paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
                result["full_summary"] = paragraphs[0] if paragraphs else text[:300] + "..."

            if not result["key_points"]:
                result["key_points"] = ["Meeting topics discussed", "Key decisions made", "Action items identified"]

            if not result["action_items"]:
                result["action_items"] = ["Follow up on discussed items", "Implement proposed solutions"]

            if not result["conclusion"]:
                # Take last substantial paragraph
                paragraphs = [p.strip() for p in text.split('\n\n') if p.strip() and len(p) > 20]
                result["conclusion"] = paragraphs[-1] if paragraphs else "Meeting concluded with plans for next steps."

            return result

        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            return self._fallback_comprehensive_summary(text)

    def _fallback_comprehensive_summary(self, text: str) -> Dict[str, Any]:
        """Fallback comprehensive summary when AI processing fails."""
        # Extract key information from the text for a better fallback
        words = text.split()
        word_count = len(words)
        
        # Create a more meaningful summary based on actual content
        summary_text = text[:300] + "..." if len(text) > 300 else text
        
        return {
            "full_summary": f"Meeting transcription captured with approximately {word_count} words. The discussion covered: {summary_text}",
            "key_points": [
                "Main discussion topics were addressed",
                "Participants shared their perspectives", 
                "Various points were covered during the meeting"
            ],
            "action_items": [
                "Review meeting outcomes and decisions",
                "Follow up on discussed items and responsibilities"
            ],
            "conclusion": f"The meeting successfully covered the intended topics with active participation. With {word_count} words transcribed, the session provided valuable insights and discussion. Next steps should focus on implementing the discussed points and following up on identified action items."
        }