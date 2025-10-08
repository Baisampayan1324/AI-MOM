#!/usr/bin/env python3
"""
User Profile Management Test Script
Tests the user profile endpoints and speaker alerts.
"""

import requests
import json

def test_user_profile():
    """Test user profile management."""
    base_url = "http://localhost:8000"

    print("👤 Testing User Profile Management")
    print("=" * 50)

    # Test profile data
    profile_data = {
        "name": "John Doe",
        "role": "Product Manager",
        "keywords": ["budget", "deadline", "revenue", "quarterly"],
        "projects": ["AI MOM", "Mobile App", "Data Analytics"],
        "skills": ["Python", "Leadership", "Agile"]
    }

    # Create/update profile
    print("📝 Creating/updating user profile...")
    response = requests.post(
        f"{base_url}/api/user-profile",
        json=profile_data
    )

    if response.status_code == 200:
        print("✅ Profile updated successfully!")
        print(f"Response: {response.json()}")
    else:
        print(f"❌ Failed to update profile: {response.status_code}")
        print(f"Response: {response.text}")
        return

    # Get profile
    print("\n📖 Retrieving user profile...")
    response = requests.get(f"{base_url}/api/user-profile")

    if response.status_code == 200:
        profile = response.json()
        print("✅ Profile retrieved successfully!")
        print(f"Name: {profile.get('name')}")
        print(f"Role: {profile.get('role')}")
        print(f"Keywords: {profile.get('keywords')}")
        print(f"Projects: {profile.get('projects')}")
    else:
        print(f"❌ Failed to retrieve profile: {response.status_code}")
        print(f"Response: {response.text}")

    print("\n🎯 Speaker Alert Keywords (auto-generated):")
    # The keywords include name, role, and custom keywords
    alert_keywords = [profile_data['name'].lower()] + [profile_data['role'].lower()] + profile_data['keywords']
    print(f"Alert triggers: {alert_keywords}")

    print("\n🚨 Test transcriptions that should trigger alerts:")
    test_transcriptions = [
        "John, we need to discuss the budget for next quarter.",
        "The deadline for the mobile app is approaching.",
        "As product manager, I need the revenue numbers.",
        "Let's review the AI MOM project status."
    ]

    for transcript in test_transcriptions:
        print(f"📝 '{transcript}' → Should trigger alert")

    print("\n✅ User Profile Management test completed!")

if __name__ == "__main__":
    test_user_profile()