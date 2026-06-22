"""
Environment configuration loader.
This module ensures environment variables are loaded before any other imports.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Get the backend directory (parent of app directory)
backend_dir = Path(__file__).parent.parent
env_file = backend_dir / ".env"

# Load environment variables from .env file in backend directory
load_dotenv(dotenv_path=env_file)

from typing import Optional

def get_env_var(key: str, default: Optional[str] = None) -> str:
    """Get environment variable with optional default."""
    value = os.getenv(key, default)
    if value is None:
        # For development/testing, provide dummy values
        if key == "GROQ_API_KEY":
            return "dummy_groq_key"
        elif key == "OPENROUTER_API_KEY":
            return "dummy_openrouter_key"
        else:
            raise ValueError(f"{key} environment variable not set")
    return value

# Pre-load critical environment variables
GROQ_API_KEY = get_env_var("GROQ_API_KEY")
OPENROUTER_API_KEY = get_env_var("OPENROUTER_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
# Additional models for multi-API
GROQ_MODEL_2 = os.getenv("GROQ_MODEL_2", "llama-3.1-70b-versatile")
OPENROUTER_MODEL_2 = os.getenv("OPENROUTER_MODEL_2", "anthropic/claude-3-haiku")
OPENROUTER_MODEL_3 = os.getenv("OPENROUTER_MODEL_3", "google/gemini-flash-1.5")
HOST = os.getenv("HOST", "localhost")
PORT = int(os.getenv("PORT", "8000"))
# Default transcription language used by real-time processing (e.g. 'en')
TRANSCRIPTION_LANGUAGE = os.getenv("TRANSCRIPTION_LANGUAGE", "en")

# ========== Model safety and tuning ===========
# Lower temperatures reduce creative output and hallucinations. Values 0.0-0.5 recommended.
MODEL_TEMPERATURE = float(os.getenv("MODEL_TEMPERATURE", "0.2"))
# Minimum similarity ratio (0.0-1.0) between original Whisper text and LLM-improved text
# below which the LLM result is rejected and Whisper is used instead. Default 0.75
MIN_IMPROVEMENT_SIMILARITY = float(os.getenv("MIN_IMPROVEMENT_SIMILARITY", "0.75"))
# Confidence threshold from multiple-model agreement below which we avoid aggressive rewriting
MIN_AGREEMENT_CONFIDENCE = float(os.getenv("MIN_AGREEMENT_CONFIDENCE", "0.65"))


def _parse_csv_env(key: str, default: str) -> list[str]:
    raw_value = os.getenv(key, default)
    return [item.strip() for item in raw_value.split(",") if item.strip()]


def _parse_bool_env(key: str, default: str = "false") -> bool:
    return os.getenv(key, default).strip().lower() in {"1", "true", "yes", "on"}


FRONTEND_ORIGINS = ["*"]
FRONTEND_ORIGIN_REGEX = None

# ===================================
# MongoDB Speaker Diarization Storage
# ===================================
MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "ai_mom")
MONGODB_DIARIZATION_COLLECTION = os.getenv("MONGODB_DIARIZATION_COLLECTION", "speaker_diarization")
ENABLE_MONGODB_DIARIZATION_STORAGE = _parse_bool_env("ENABLE_MONGODB_DIARIZATION_STORAGE", "false")