import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.config import (
    ENABLE_MONGODB_DIARIZATION_STORAGE,
    MONGODB_DATABASE,
    MONGODB_DIARIZATION_COLLECTION,
    MONGODB_URI,
)

logger = logging.getLogger(__name__)

try:
    from pymongo import MongoClient
except Exception:  # pragma: no cover - optional dependency
    MongoClient = None


class MongoDiarizationStore:
    def __init__(self) -> None:
        self.enabled = bool(ENABLE_MONGODB_DIARIZATION_STORAGE and MONGODB_URI and MongoClient)
        self._client = None
        self._collection = None

        if not self.enabled:
            if ENABLE_MONGODB_DIARIZATION_STORAGE and not MongoClient:
                logger.warning("MongoDB diarization storage enabled, but pymongo is not installed.")
            return

        try:
            self._client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
            self._client.admin.command("ping")
            self._collection = self._client[MONGODB_DATABASE][MONGODB_DIARIZATION_COLLECTION]
            logger.info("MongoDB diarization storage initialized")
        except Exception as exc:
            logger.warning(f"MongoDB diarization storage unavailable: {exc}")
            self.enabled = False
            self._client = None
            self._collection = None

    def save_session(
        self,
        *,
        session_id: str,
        transcript: str,
        speaker_count: int,
        segments: List[Dict[str, Any]],
        source: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        if not self.enabled or self._collection is None:
            return

        document = {
            "session_id": session_id,
            "transcript": transcript,
            "speaker_count": speaker_count,
            "segments": segments,
            "source": source,
            "metadata": metadata or {},
            "created_at": datetime.utcnow(),
        }

        try:
            self._collection.insert_one(document)
        except Exception as exc:
            logger.warning(f"Failed to persist diarization session to MongoDB: {exc}")
