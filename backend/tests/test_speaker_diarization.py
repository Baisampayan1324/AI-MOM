"""
Test script for speaker diarization feature
"""
import requests
import os

# API endpoint
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

def test_speaker_diarization():
    """Test speaker diarization with sample audio file"""
    file_path = "Weekly_Meeting.mp3"
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        # Try to find similar files
        files = [f for f in os.listdir('.') if f.endswith('.mp3')]
        if files:
            print(f"Available MP3 files: {files}")
            file_path = files[0]  # Use the first available MP3 file
            print(f"Using file: {file_path}")
        else:
            print("No MP3 files found in current directory")
            return
    
    if not os.path.exists(file_path):
        print(f"File still not found: {file_path}")
        return
    
    print(f"Processing file with speaker diarization: {file_path}")
    
    try:
        # Test combined processing endpoint with speaker diarization
        with open(file_path, 'rb') as audio_file:
            files = {'file': audio_file}
            data = {'meeting_id': 'speaker_diarization_test'}
            response = requests.post(
                f"{API_URL}/process-audio",
                files=files,
                data=data
            )
            
        if response.status_code == 200:
            result = response.json()
            print("Processing successful!")
            print(f"Language: {result.get('language', 'N/A')}")
            print("\n--- Standard Transcription ---")
            print(result['transcription'])
            
            if 'speaker_formatted_text' in result and result['speaker_formatted_text']:
                print("\n--- Speaker-Formatted Transcription ---")
                print(result['speaker_formatted_text'])
                print("\n(Speaker-formatted text shows who said what with Speaker 0, Speaker 1 labels)")
            
            if 'summary' in result and result['summary']:
                print("\n--- Summary ---")
                print(result['summary']['summary'])
            
            return result
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"Exception occurred: {e}")
        return None

if __name__ == "__main__":
    print("Meeting Minutes Speaker Diarization Test")
    print("=" * 40)
    
    # Test speaker diarization
    result = test_speaker_diarization()
    
    if result:
        print("\n✅ Speaker diarization test completed!")
        print("\nSpeaker diarization features:")
        print("- Automatic speaker separation in multi-participant meetings")
        print("- Speaker labels (Speaker 0, Speaker 1, etc.) for clarity")
        print("- Integration with transcription for context-aware alerts")
    else:
        print("\n❌ Speaker diarization test failed!")