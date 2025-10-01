"""
Test script to verify real-time updates during audio processing
"""
import requests
import asyncio
import websockets
import json
import time
import os

# API endpoint
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"
WEBSOCKET_URL = f"ws://localhost:8000"

async def test_real_time_processing():
    """Test real-time updates during audio processing"""
    file_path = "Weekly_Meeting.mp3"
    meeting_id = f"test_meeting_{int(time.time())}"
    
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
    
    print(f"Testing real-time processing with file: {file_path}")
    print(f"Meeting ID: {meeting_id}")
    
    # Connect to WebSocket for real-time updates
    websocket_uri = f"{WEBSOCKET_URL}/ws/meeting/{meeting_id}"
    print(f"Connecting to WebSocket: {websocket_uri}")
    
    try:
        async with websockets.connect(websocket_uri) as websocket:
            print("WebSocket connection established")
            
            # Start listening for messages in the background
            listen_task = asyncio.create_task(listen_for_updates(websocket))
            
            # Process the audio file
            print("Starting audio processing...")
            with open(file_path, 'rb') as audio_file:
                files = {'file': audio_file}
                data = {'meeting_id': meeting_id}
                response = requests.post(
                    f"{API_URL}/process-audio",
                    files=files,
                    data=data
                )
            
            if response.status_code == 200:
                result = response.json()
                print("Audio processing completed successfully!")
                print(f"Transcription length: {len(result['transcription'])} characters")
                if 'speaker_formatted_text' in result and result['speaker_formatted_text']:
                    print(f"Speaker-formatted text length: {len(result['speaker_formatted_text'])} characters")
                print(f"Summary: {result['summary']['summary'][:100]}...")
            else:
                print(f"Error processing audio: {response.status_code}")
                print(response.text)
            
            # Wait a bit for any remaining messages
            await asyncio.sleep(2)
            listen_task.cancel()
            
    except Exception as e:
        print(f"Error during real-time processing test: {e}")

async def listen_for_updates(websocket):
    """Listen for real-time updates from the WebSocket"""
    try:
        async for message in websocket:
            data = json.loads(message)
            print(f"Real-time update: {data}")
            
            if data.get('type') == 'progress':
                print(f"Progress: {data.get('message')}")
            elif data.get('type') == 'transcription_summary':
                print("Final results received!")
            elif data.get('type') == 'summary':
                print("Summary received!")
                
    except asyncio.CancelledError:
        print("Stopped listening for updates")
    except Exception as e:
        print(f"Error listening for updates: {e}")

if __name__ == "__main__":
    print("Meeting Minutes Real-time Processing Test")
    print("=" * 40)
    
    # Run the test
    asyncio.run(test_real_time_processing())
    
    print("\nTest completed!")