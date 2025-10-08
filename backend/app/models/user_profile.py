import json
import os
from typing import Dict, List, Optional
from app.models.schemas import UserProfile

class UserProfileManager:
    def __init__(self, profile_path: str = "user_profile.json"):
        self.profile_path = profile_path
        self._ensure_profile_exists()

    def _ensure_profile_exists(self):
        if not os.path.exists(self.profile_path):
            default_profile = {
                "name": "User",
                "role": "",
                "keywords": [],
                "projects": []
            }
            with open(self.profile_path, 'w') as f:
                json.dump(default_profile, f, indent=2)

    def load_profile(self) -> UserProfile:
        with open(self.profile_path, 'r') as f:
            data = json.load(f)
        return UserProfile(**data)

    def save_profile(self, profile: UserProfile):
        with open(self.profile_path, 'w') as f:
            json.dump(profile.dict(), f, indent=2)

    def get_alert_keywords(self) -> List[str]:
        profile = self.load_profile()
        keywords = [profile.name.lower()]
        if profile.role:
            keywords.append(profile.role.lower())
        keywords.extend([k.lower() for k in profile.keywords])
        keywords.extend([p.lower() for p in profile.projects])
        return list(set(keywords))  # Remove duplicates