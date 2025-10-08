from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class AudioProcessRequest(BaseModel):
    audio_data: bytes
    sample_rate: Optional[int] = 16000
    channels: Optional[int] = 1
    timestamp: Optional[datetime] = None

class ProcessResponse(BaseModel):
    transcription: str
    full_summary: Optional[str] = None
    key_points: Optional[List[str]] = None
    action_items: Optional[List[str]] = None
    conclusion: Optional[str] = None
    processing_time: float
    api_used: str
    confidence: Optional[float] = None
    speaker_count: Optional[int] = None
    speakers: Optional[List[Dict]] = None

class MultiAPIResult(BaseModel):
    groq_result: Dict[str, Any]
    openrouter_result: Dict[str, Any]
    combined_text: str
    processing_time: float
    confidence_score: float

class UserProfile(BaseModel):
    name: str
    role: Optional[str] = None
    keywords: List[str] = []
    projects: List[str] = []

class SpeakerAlert(BaseModel):
    speaker_id: int
    alert_type: str  # 'name', 'role', 'keyword', 'project'
    triggered_text: str
    confidence: float
    timestamp: datetime

class SystemInfo(BaseModel):
    gpu_available: bool
    apis_status: Dict[str, bool]
    version: str