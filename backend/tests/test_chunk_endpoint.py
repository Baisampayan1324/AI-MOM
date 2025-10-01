"""
Test script to verify the process-audio-chunk endpoint
"""
import requests
import io

# API endpoint
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

def test_process_audio_chunk():
    """Test the process-audio-chunk endpoint"""
    print("Testing process-audio-chunk endpoint...")
    
    # Create a simple test audio chunk (just some dummy data)
    # In a real scenario, this would be actual audio data
    audio_data = b"test audio data"
    
    # Create a file-like object
    audio_file = io.BytesIO(audio_data)
    
    # Prepare the form data
    files = {'chunk': ('test_chunk.wav', audio_file, 'audio/wav')}
    data = {
        'meeting_id': 'test_meeting_123',
        'language': 'en'
    }
    
    try:
        # Send the request
        response = requests.post(
            f"{API_URL}/process-audio-chunk",
            files=files,
            data=data
        )
        
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Exception occurred: {e}")

if __name__ == "__main__":
    test_process_audio_chunk()