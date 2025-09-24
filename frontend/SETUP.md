# Frontend-Backend Integration Setup

## Quick Start Guide

### 1. Backend Setup (Already Running)
Your backend is already running on `http://localhost:8000`. You can verify this by checking:
- Health endpoint: http://localhost:8000/health
- API docs: http://localhost:8000/docs

### 2. Frontend Access
Since these are static HTML files, you can open them directly in your browser:

**Method 1: File Protocol (Basic)**
- Navigate to `p:\AI_MOM\frontend\` in Windows Explorer
- Double-click on `index.html` to open in your default browser

**Method 2: Local Server (Recommended for CORS)**
If you encounter CORS issues, serve the files through a local HTTP server:

```powershell
# Navigate to frontend directory
cd p:\AI_MOM\frontend

# Option A: Python HTTP server (if Python is installed)
python -m http.server 3000

# Option B: Node.js http-server (if Node.js is installed)
npx http-server -p 3000

# Option C: VS Code Live Server extension
# Install Live Server extension in VS Code and right-click index.html > "Open with Live Server"
```

Then access: http://localhost:3000

### 3. Integration Test Workflow

1. **Start with the Homepage**
   - Open `index.html` 
   - Check the "System Status" - it should show "Backend server is online and ready"

2. **Run Integration Tests**
   - Click "Integration Test" or navigate to `integration_test.html`
   - Run each test to verify:
     - ✅ Health Check
     - ✅ WebSocket Connection  
     - ✅ User Profile Endpoints
     - ✅ Audio Chunk Processing Structure
     - ✅ File Upload Structure

3. **Test Audio File Processing**
   - Navigate to `audio_processing.html`
   - Upload an audio file
   - Enter a meeting ID
   - Click "Process Audio File"
   - Monitor real-time updates

4. **Test Real-time Capture**
   - Navigate to `realtime_capture.html`
   - Enter a meeting ID
   - Click "Connect to Meeting"
   - Click "Start Recording" (requires microphone permission)
   - Speak to test real-time transcription

5. **Configure Profile Settings**
   - Navigate to `profile_settings.html`
   - Set up your profile with alert keywords
   - Save profile for personalized alerts

### 4. Expected Behavior

**Working Features:**
- ✅ WebSocket real-time communication
- ✅ File upload structure
- ✅ User profile management
- ✅ Navigation between pages
- ✅ Status monitoring

**Features requiring audio processing setup:**
- 🔧 Actual audio transcription (requires Whisper/OpenAI API)
- 🔧 Text summarization (requires Groq API)
- 🔧 Speaker diarization
- 🔧 Real-time audio chunk processing

### 5. Troubleshooting

**CORS Issues:**
- Use a local HTTP server instead of file:// protocol
- Ensure backend CORS middleware is properly configured (it is)

**WebSocket Connection Failed:**
- Verify backend is running on port 8000
- Check firewall settings
- Ensure no other service is using port 8000

**Audio Processing Errors:**
- Expected if audio processing services aren't configured
- Integration test will show endpoint structure works

### 6. API Endpoints Summary

The frontend is configured to connect to these backend endpoints:

- `GET /health` - Health check
- `GET /` - Root endpoint
- `POST /api/process-audio` - Full audio file processing
- `POST /api/process-audio-chunk` - Real-time audio chunks
- `POST /api/user-profile` - Create/update user profile
- `GET /api/user-profile` - Get user profile
- `WebSocket /ws/meeting/{meeting_id}` - Real-time communication

All endpoints use `http://localhost:8000` as the base URL.

### 7. Next Steps

1. Open `frontend/index.html` in your browser
2. Verify backend connectivity (green status indicator)
3. Run the integration tests
4. Test each feature systematically
5. Configure audio processing services if needed for full functionality

The integration is now complete and ready for testing!