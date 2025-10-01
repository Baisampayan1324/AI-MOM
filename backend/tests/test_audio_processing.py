"""
Test script for processing audio files with the meeting minutes system
"""
import requests
import os
import json
import time
import websockets
import asyncio

# API endpoint
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

def test_audio_transcription():
    """Test audio file transcription"""
    file_path = "Weekly_Meeting.mp3"
    
    # Check if file exists with exact name
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        # Try to find similar files
        files = [f for f in os.listdir('.') if f.endswith('.mp3')]
        if files:
            print(f"Available MP3 files: {files}")
            file_path = files[0]  # Use the first available MP3 file
            print(f"Using file: {file_path}")
        else:
            return
    
    if not os.path.exists(file_path):
        print(f"File still not found: {file_path}")
        return
    
    print(f"Processing file: {file_path}")
    
    try:
        # Test transcription endpoint
        with open(file_path, 'rb') as audio_file:
            files = {'file': audio_file}
            start_time = time.time()
            response = requests.post(
                f"{API_URL}/transcribe",
                files=files
            )
            end_time = time.time()
            
        if response.status_code == 200:
            result = response.json()
            print("Transcription successful!")
            print(f"Language: {result['language']}")
            print(f"Full Text:\n{result['text']}")
            print(f"Processing time: {end_time - start_time:.2f} seconds")
            return result['text']
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"Exception occurred: {e}")
        return None

def test_audio_processing_with_summary():
    """Test audio processing with summarization and speaker diarization"""
    file_path = "Weekly_Meeting.mp3"
    
    # Check if file exists with exact name
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        # Try to find similar files
        files = [f for f in os.listdir('.') if f.endswith('.mp3')]
        if files:
            print(f"Available MP3 files: {files}")
            file_path = files[0]  # Use the first available MP3 file
            print(f"Using file: {file_path}")
        else:
            return
    
    if not os.path.exists(file_path):
        print(f"File still not found: {file_path}")
        return
    
    print(f"Processing file with summarization and speaker diarization: {file_path}")
    
    try:
        # Test combined processing endpoint
        with open(file_path, 'rb') as audio_file:
            files = {'file': audio_file}
            data = {'meeting_id': 'meeting_123'}
            start_time = time.time()
            response = requests.post(
                f"{API_URL}/process-audio",
                files=files,
                data=data
            )
            end_time = time.time()
            
        if response.status_code == 200:
            result = response.json()
            print("Processing successful!")
            print(f"Language: {result.get('language', 'N/A')}")
            print(f"Full Transcription:\n{result['transcription']}")
            
            # Display speaker-formatted text if available
            if 'speaker_formatted_text' in result and result['speaker_formatted_text']:
                print("\n--- Speaker-Formatted Transcription ---")
                print(result['speaker_formatted_text'])
                print("(This shows who said what with Speaker 0, Speaker 1 labels)")
            
            print(f"\nSummary: {result['summary']['summary']}")
            if 'key_points' in result['summary']:
                print(f"Key Points: {result['summary']['key_points']}")
            if 'action_items' in result['summary']:
                print(f"Action Items: {result['summary']['action_items']}")
            print(f"Processing time: {end_time - start_time:.2f} seconds")
            return result
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"Exception occurred: {e}")
        return None

async def test_websocket_updates():
    """Test WebSocket connection for real-time updates"""
    uri = "ws://localhost:8000/ws/meeting/meeting_123"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket")
            
            # Send a test message
            await websocket.send("Hello Server!")
            
            # Wait for a response
            response = await websocket.recv()
            print(f"Received: {response}")
            
            # Listen for updates for 30 seconds
            print("Listening for real-time updates...")
            try:
                async def listen_for_messages():
                    async for message in websocket:
                        print(f"Update received: {message}")
                        
                # Run for 30 seconds
                await asyncio.wait_for(listen_for_messages(), timeout=30.0)
            except asyncio.TimeoutError:
                print("Stopped listening (30 seconds timeout)")
                
    except Exception as e:
        print(f"WebSocket connection failed: {e}")

if __name__ == "__main__":
    print("Meeting Minutes Test Script")
    print("=" * 40)
    
    # Test 1: Simple transcription
    print("\n1. Testing audio transcription...")
    transcription = test_audio_transcription()
    
    # Test 2: Transcription with summarization and speaker diarization
    print("\n2. Testing audio processing with summarization and speaker diarization...")
    processed_result = test_audio_processing_with_summary()
    
    # Test 3: WebSocket connection
    print("\n3. Testing WebSocket connection...")
    asyncio.run(test_websocket_updates())
    
    print("\nTest script completed!")
