# AI Meeting Minutes - Browser Extension

A professional browser extension for real-time meeting transcription with AI-powered backend integration.

## Features

### Backend Integration
- **WebSocket Connection**: Real-time communication with FastAPI backend
- **Audio Chunk Processing**: 5-second audio chunks sent to Whisper AI for transcription
- **Live Transcription**: Real-time text display with speaker identification
- **Automatic Summarization**: AI-generated meeting summaries

### Dual-Mode Interface
- **Online Mode**: Real-time recording with live transcription and speaker alerts
- **Offline Mode**: Drag & drop audio file processing with comprehensive analysis

### User Experience
- Professional sidebar panel that slides in from the right
- Minimize to floating icon instead of closing completely
- Smart permission handling with auto-detection
- User preference memory across sessions

### Real-Time Capabilities
- Live audio capture with WebSocket integration
- Speaker identification with visual color coding
- Progressive summary generation
- Audio level monitoring with 5-bar visualization

### Offline Processing
- Drag & drop file upload with validation
- Support for MP3, WAV, and M4A formats
- Comprehensive transcript analysis
- Speaker analytics and statistics

## Backend Requirements

This extension requires the AI-MOM backend to be running:

```bash
cd backend
python main.py
```

The backend provides:
- WebSocket endpoint: `ws://localhost:8000/ws/browser-extension`
- Audio processing: `POST /api/process-browser-extension-chunk`
- Whisper AI transcription with Groq fallback

## Installation

### Developer Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked"
4. Select the `browser-extension` folder from this project
5. The extension will appear in your extensions list

### Usage

1. **Start Backend**: Ensure the AI-MOM backend is running on `localhost:8000`
2. **Load Extension**: Install the extension in Chrome developer mode
3. **Open Panel**: Click the extension icon and select "Open Transcription Panel"
4. **Choose Mode**: Select Online mode for real-time transcription
5. **Start Recording**:
   - Click "Start Recording" to begin live transcription
   - Allow microphone access when prompted
   - Speak into your microphone
   - Watch real-time transcription appear
   - Click "Stop Recording" to end and generate summary

## Technical Details

### Audio Processing
- **Format**: WebM with Opus codec
- **Chunk Size**: 5-second intervals
- **Transcription**: Whisper base model (CPU) with Groq fallback
- **Real-time**: Sub-second latency for transcription

### WebSocket Communication
- **Connection**: `ws://localhost:8000/ws/browser-extension`
- **Messages**: JSON format with type, speaker, text, timestamp
- **Broadcasting**: Server broadcasts transcriptions to all connected extensions

### Permissions
- `activeTab`: Access current tab for sidebar injection
- `storage`: Save user preferences and transcripts
- `notifications`: Show recording status notifications
- Host permissions for `localhost:8000` (HTTP and WebSocket)
   - View transcript and analysis

## Backend Connection

The extension connects to a backend server at `ws://localhost:8000` for real-time transcription. Make sure your backend server is running before using the Online mode.

## File Structure

```
browser-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── sidebar.html          # Main sidebar interface
├── sidebar.css           # Sidebar styles
├── sidebar.js            # Sidebar functionality
├── content.js            # Content script for page interaction
├── content.css           # Content script styles
├── background.js         # Background service worker
├── icons/                # Extension icons
└── README.md            # This file
```

## Permissions

The extension requests the following permissions:
- **activeTab**: To interact with the current page
- **storage**: To save user preferences and session data
- **notifications**: To alert users about important events

## Development

To modify the extension:
1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Notes

- Microphone access is required for Online mode
- Backend server must be running on `http://localhost:8000` for full functionality
- Session data is automatically saved to Chrome's local storage
- The sidebar can be minimized to a floating icon for easy access

## Troubleshooting

- **Microphone not working**: Check browser permissions in `chrome://settings/content/microphone`
- **Connection failed**: Ensure the backend server is running
- **Extension not loading**: Check the Console in `chrome://extensions/` for errors
