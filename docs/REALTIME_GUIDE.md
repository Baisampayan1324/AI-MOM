# Meeting Minutes Real-time System - Real-time Processing Guide

## Real-time Features

This system provides real-time updates during audio processing through WebSocket connections. Here's how to use the real-time features:

## Audio File Processing with Real-time Updates

When processing audio files through the `audio_processing.html` interface, you'll see real-time progress updates:

1. **Progress Indicators**: As the system processes your audio file, you'll see status messages showing:
   - "Starting audio transcription..."
   - "Audio transcription complete. Generating summary..."
   - "Summary generation complete."

2. **Real-time Results**: Once processing is complete, the full transcription, speaker-formatted text, and summary will be displayed.

## Real-time Audio Capture

The real-time capture feature allows you to:
1. Record audio directly from your microphone
2. Get real-time transcriptions as you speak
3. Receive speaker alerts when your name or keywords are mentioned
4. See a history of transcriptions

### How to Use Real-time Capture:

1. Open `frontend/realtime_capture.html` in your browser
2. Enter a Meeting ID (or use the default)
3. Select your language
4. Click "Connect to Meeting"
5. Click "Start Recording" to begin capturing audio
6. Speak into your microphone
7. Real-time transcriptions will appear as you speak
8. Speaker alerts will appear when relevant keywords are detected

## How Real-time Updates Work

1. When you submit an audio file for processing, the frontend:
   - Establishes a WebSocket connection to the backend
   - Sends the audio file to the `/api/process-audio` endpoint
   - Listens for real-time updates through the WebSocket

2. The backend:
   - Processes the audio file in stages (transcription, then summarization)
   - Sends progress updates through the WebSocket as each stage completes
   - Returns the final results when processing is complete

3. For real-time capture:
   - The frontend captures audio from your microphone
   - Audio chunks are sent to `/api/process-audio-chunk` every second
   - The backend processes each chunk and sends results via WebSocket
   - Results are displayed in real-time in the browser

## WebSocket Message Types

The system sends several types of WebSocket messages during processing:

- `progress`: Status updates during processing
- `transcription`: Real-time transcription chunks
- `transcription_summary`: Final results when processing is complete
- `summary`: Summary results (if generated separately)
- `speaker_alert`: Alerts when keywords are detected

## Troubleshooting Real-time Capture

If you're not seeing real-time transcriptions:

1. **Check Microphone Permissions**: 
   - Ensure your browser has permission to access your microphone
   - Check browser settings for microphone access

2. **Verify Audio Input**:
   - Make sure your microphone is properly connected
   - Test your microphone in system settings
   - Speak clearly and at a normal volume

3. **Check Browser Console**:
   - Open developer tools (F12) and check for JavaScript errors
   - Look for WebSocket connection errors

4. **Backend Logs**:
   - Check the backend console for error messages
   - Ensure the server is running properly

5. **Network Issues**:
   - Ensure no firewall is blocking WebSocket connections
   - Verify the backend is accessible at `http://localhost:8000`

## Testing Real-time Features

To test the real-time features:

1. Start the backend server:
   ```
   python main.py
   ```

2. For audio file processing:
   - Open `frontend/audio_processing.html` in your browser
   - Select an audio file and click "Process Audio"
   - Watch the real-time progress updates

3. For real-time capture:
   - Open `frontend/realtime_capture.html` in your browser
   - Connect to a meeting and start recording
   - Speak into your microphone and watch for transcriptions

## Common Issues and Solutions

### No Transcriptions Appearing
- **Cause**: Audio chunks may be too small or silent
- **Solution**: Speak clearly and ensure your microphone is working

### WebSocket Connection Errors
- **Cause**: Server not running or network issues
- **Solution**: Verify the backend is running and accessible

### Speaker Alerts Not Working
- **Cause**: User profile not configured or keywords not matching
- **Solution**: Set up your profile in `frontend/profile_settings.html` with your name and keywords

## Performance Notes

- Real-time processing sends audio chunks every 1 second
- Transcription accuracy depends on audio quality and background noise
- Speaker alerts are checked for each transcription chunk
- The system works best in quiet environments with clear speech