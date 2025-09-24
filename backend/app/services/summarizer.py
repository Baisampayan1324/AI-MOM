import os
from groq import Groq
from typing import List, Dict, Optional
import json
from app.config import GROQ_API_KEY, GROQ_MODEL

class Summarizer:
    def __init__(self):
        """
        Initialize the summarizer with Groq client.
        """
        # Initialize Groq client without proxies parameter to avoid compatibility issues
        self.client = Groq(
            api_key=GROQ_API_KEY,
        )
        self.model = GROQ_MODEL
    
    def summarize_text(self, text: str, meeting_id: str) -> Dict:
        """
        Summarize the provided text using Groq's Llama model.
        
        Args:
            text: Text to summarize
            meeting_id: ID of the meeting
            
        Returns:
            Dictionary containing summary, key points, and action items
        """
        prompt = f"""
        Please analyze the following meeting transcription and provide:
        1. A concise summary of the meeting
        2. Key points discussed
        3. Action items with responsible persons if mentioned
        
        Format your response as JSON with the following structure:
        {{
            "summary": "Brief summary of the meeting",
            "key_points": ["Key point 1", "Key point 2", ...],
            "action_items": ["Action item 1", "Action item 2", ...]
        }}
        
        Meeting transcription:
        {text}
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=1024,
            )
            
            # Parse the response
            content = response.choices[0].message.content
            
            # Check if content is None
            if content is None:
                return {
                    "summary": "Summary generation failed - no content received",
                    "key_points": ["Content generation failed"],
                    "action_items": ["Please try again"]
                }
            
            # Try to parse as JSON, if it fails return as plain text
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                # If JSON parsing fails, create a structured response
                result = {
                    "summary": content[:500] + "..." if len(content) > 500 else content,
                    "key_points": ["Key points extraction failed. Please try again."],
                    "action_items": ["Action items extraction failed. Please try again."]
                }
            
            return result
            
        except Exception as e:
            return {
                "summary": f"Error generating summary: {str(e)}",
                "key_points": ["Error occurred during summarization"],
                "action_items": ["Please try again later"]
            }
    
    def extract_key_points(self, text: str) -> List[str]:
        """
        Extract key points from the provided text.
        
        Args:
            text: Text to analyze
            
        Returns:
            List of key points
        """
        prompt = f"""
        Extract the key points from the following text. Return only a list of key points:
        
        {text}
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=512,
            )
            
            content = response.choices[0].message.content
            
            # Check if content is None
            if content is None:
                return ["No key points generated - content was empty"]
            
            # Split by lines and filter out empty lines
            key_points = [line.strip() for line in content.split('\n') if line.strip()]
            return key_points[:10]  # Limit to 10 key points
            
        except Exception as e:
            return [f"Error extracting key points: {str(e)}"]