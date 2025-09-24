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
        raise ValueError(f"{key} environment variable not set")
    return value

# Pre-load critical environment variables
GROQ_API_KEY = get_env_var("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
HOST = os.getenv("HOST", "localhost")
PORT = int(os.getenv("PORT", "8000"))