#!/usr/bin/env python3
"""
Demo script for testing the new_backend multi-API processing.
This shows how to use the file path endpoint for testing.
"""

import requests
import json
import os

def test_api_endpoint():
    """Test the process-audio endpoint with a file path."""

    # For demo purposes, we'll use a dummy file path
    # In real usage, replace with actual audio file path
    test_file_path = "P:\\back\\backend\\Weekly Meeting.mp3"  # Replace with real path

    if not os.path.exists(test_file_path):
        print(f"⚠️  Test file '{test_file_path}' not found.")
        print("   For actual testing, provide a real audio file path.")
        print("   Example: test_file_path = 'path/to/your/meeting_audio.wav'")
        return

    try:
        print("🚀 Testing Multi-API Audio Processing...")
        print(f"📁 Processing file: {test_file_path}")

        # Make request to the API
        response = requests.post(
            "http://localhost:8000/api/process-audio",
            params={"file_path": test_file_path},  # Send as query parameter
            timeout=300  # 5 minutes timeout for processing
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ Processing successful!")
            print("\n" + "="*50)
            print("🎯 RESULTS:")
            print("="*50)
            print(f"📝 Transcription: {result.get('transcription', 'N/A')}")
            
            # Display comprehensive analysis
            full_summary = result.get('full_summary')
            if full_summary:
                print(f"\n📄 Full Summary: {full_summary}")
            
            key_points = result.get('key_points', [])
            if key_points:
                print(f"\n🔑 Key Points:")
                for i, point in enumerate(key_points, 1):
                    print(f"  {i}. {point}")
            
            action_items = result.get('action_items', [])
            if action_items:
                print(f"\n✅ Action Items:")
                for i, item in enumerate(action_items, 1):
                    print(f"  {i}. {item}")
            
            conclusion = result.get('conclusion')
            if conclusion:
                print(f"\n🎯 Conclusion: {conclusion}")
            
            print(f"\n⚡ Processing Time: {result.get('processing_time', 'N/A')} seconds")
            print(f"🔧 API Used: {result.get('api_used', 'N/A')}")
            
            # Display speaker information
            speaker_count = result.get('speaker_count', 0)
            speakers = result.get('speakers', [])
            print(f"🎤 Speakers Detected: {speaker_count}")
            
            if speakers:
                print("📊 Speaker Segments:")
                for speaker in speakers:
                    start_time = speaker.get('start', 0)
                    end_time = speaker.get('end', 0)
                    duration = speaker.get('duration', 0)
                    speaker_id = speaker.get('speaker', 0)
                    print(f"  • Speaker {speaker_id}: {start_time:.1f}s - {end_time:.1f}s ({duration:.1f}s)")
            
            print("="*50)
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        print("💡 Make sure the server is running: python main.py")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def show_usage():
    """Show usage instructions."""
    print("\n" + "="*60)
    print("🎵 MULTI-API AUDIO PROCESSING DEMO")
    print("="*60)
    print()
    print("This demo shows how the new_backend processes audio using:")
    print("• OpenAI Whisper for initial transcription")
    print("• Groq API for improvement")
    print("• OpenRouter API for additional enhancement")
    print("• AI-powered combination for best results")
    print()
    print("USAGE:")
    print("1. Start the server: python main.py")
    print("2. Run this demo: python demo.py")
    print("3. Provide a real audio file path in the script")
    print()
    print("The system will:")
    print("• Load and process your audio file")
    print("• Generate transcriptions from multiple APIs")
    print("• Combine results for improved accuracy")
    print("• Return enhanced transcription + comprehensive analysis")
    print("• Include key points, action items, and conclusion")
    print()
    print("="*60)

if __name__ == "__main__":
    show_usage()
    test_api_endpoint()