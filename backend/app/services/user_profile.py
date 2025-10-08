from app.models.user_profile import UserProfileManager
from app.models.schemas import UserProfile, SpeakerAlert
import re
import logging
from typing import List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class UserProfileService:
    def __init__(self):
        self.profile_manager = UserProfileManager()

    def get_profile(self) -> UserProfile:
        """Get current user profile."""
        return self.profile_manager.load_profile()

    def update_profile(self, profile: UserProfile):
        """Update user profile."""
        self.profile_manager.save_profile(profile)
        logger.info("User profile updated")

    def check_for_alerts(self, transcription: str) -> List[SpeakerAlert]:
        """
        Check transcription for user mentions and generate alerts.
        """
        alerts = []
        profile = self.get_profile()
        keywords = self.profile_manager.get_alert_keywords()

        transcription_lower = transcription.lower()

        for keyword in keywords:
            if keyword in transcription_lower:
                # Find the context around the keyword
                start = max(0, transcription_lower.find(keyword) - 50)
                end = min(len(transcription), transcription_lower.find(keyword) + len(keyword) + 50)
                context = transcription[start:end]

                alert = SpeakerAlert(
                    speaker_id=0,  # Would be determined by diarization
                    alert_type=self._determine_alert_type(keyword, profile),
                    triggered_text=context,
                    confidence=0.9,  # Placeholder
                    timestamp=datetime.now()
                )
                alerts.append(alert)

        return alerts

    def _determine_alert_type(self, keyword: str, profile: UserProfile) -> str:
        """Determine the type of alert triggered."""
        if keyword == profile.name.lower():
            return "name"
        if profile.role and keyword == profile.role.lower():
            return "role"
        if keyword in [k.lower() for k in profile.keywords]:
            return "keyword"
        if keyword in [p.lower() for p in profile.projects]:
            return "project"
        return "general"