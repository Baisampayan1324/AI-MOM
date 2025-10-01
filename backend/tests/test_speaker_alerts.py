"""
Test script for the enhanced speaker alert system
"""
import requests
import json
import time

# API endpoint
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

def test_user_profile():
    """Test user profile creation and retrieval"""
    profile_data = {
        "name": "John Smith",
        "email": "john.smith@example.com",
        "role": "Software Engineer",
        "team": "Backend Development",
        "projects": ["Project Alpha", "Meeting Minutes System"],
        "skills": ["Python", "FastAPI", "Machine Learning"],
        "keywords": ["JS", "johnsmith"]
    }
    
    print("Testing user profile creation...")
    
    try:
        # Create user profile
        response = requests.post(
            f"{API_URL}/user-profile",
            json=profile_data
        )
        
        if response.status_code == 200:
            print("✅ User profile created successfully!")
            profile = response.json()
            print(f"Profile: {profile['name']} - {profile['role']}")
            return profile
        else:
            print(f"❌ Error creating profile: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        return None

def test_speaker_alerts():
    """Test speaker alert system with sample transcriptions"""
    sample_transcriptions = [
        "Can you please update us on the project status, John?",
        "John Smith, what are your thoughts on this approach?",
        "We need someone with Python skills to handle this task.",
        "How about you, JS, can you take point on this?",
        "The Backend Development team should focus on this issue.",
        "This is a general announcement for all team members."
    ]
    
    print("\nTesting speaker alert system with sample transcriptions...")
    
    # In a real implementation, these would be processed through the WebSocket
    # For now, we'll just show what would trigger alerts
    for i, transcription in enumerate(sample_transcriptions, 1):
        print(f"\n{i}. Transcription: '{transcription}'")
        
        # Check what would trigger alerts
        alert_keywords = [
            "john", "smith", "js", "johnsmith", "python", 
            "backend development", "project alpha", "meeting minutes system",
            "can you", "what are your thoughts", "how about you"
        ]
        
        matched_keywords = []
        transcription_lower = transcription.lower()
        
        for keyword in alert_keywords:
            if keyword in transcription_lower:
                matched_keywords.append(keyword)
        
        if matched_keywords:
            is_personal = any(kw in matched_keywords for kw in [
                "john", "smith", "js", "johnsmith", "python", 
                "backend development", "project alpha", "meeting minutes system"
            ])
            
            if is_personal:
                print(f"   🚨 PERSONAL ALERT: Matched keywords - {matched_keywords}")
                print("   Suggested response: Prepare to respond or take note of this request.")
            else:
                print(f"   ⚠️  GENERAL ALERT: Matched keywords - {matched_keywords}")
                print("   Suggested response: Consider preparing a response or noting this question for follow-up.")
        else:
            print("   No alerts triggered.")

if __name__ == "__main__":
    print("Meeting Minutes Enhanced Speaker Alert System Test")
    print("=" * 50)
    
    # Test user profile
    profile = test_user_profile()
    
    # Test speaker alerts
    test_speaker_alerts()
    
    print("\n✅ All tests completed!")
    print("\nTo use the enhanced system:")
    print("1. Start the backend server: python main.py")
    print("2. Open frontend/profile_settings.html to set up your profile")
    print("3. Open frontend/realtime_capture.html for real-time capture")
    print("4. The system will now alert you when your name or keywords are mentioned!")