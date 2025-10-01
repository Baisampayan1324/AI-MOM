# AI Meeting Assistant Browser Extension - Installation & Testing Guide

## 🚀 Quick Start

### 1. Install the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `browser-extension` folder from your project: `p:\AI_MOM\browser-extension`
5. The extension should now appear in your extensions list
6. **Pin the extension**: Click the puzzle piece icon (🧩) in the toolbar and pin "AI Meeting Assistant"

### 2. Start the Backend Server

Make sure your FastAPI backend is running:

```bash
cd p:\AI_MOM\backend
python main.py
```

The server should be accessible at `http://localhost:8000`

### 3. Test the Extension

#### Option A: Use the Test Page
1. Open `p:\AI_MOM\browser-extension\test.html` in Chrome
2. Click the AI Meeting Assistant extension icon
3. The sidebar should open on the right
4. Follow the testing checklist on the page

#### Option B: Test on Google Meet
1. Join any Google Meet meeting
2. Click the AI Meeting Assistant extension icon
3. Grant microphone permissions if prompted
4. Click "Start Recording" in the sidebar

## 🔧 Features

### ✅ Fixed Issues
- **Extension context invalidation**: Now shows user-friendly error messages and prompts to refresh
- **Iframe microphone permissions**: Moved microphone access to content script (main page context)
- **Permission inheritance**: Automatically detects and inherits Google Meet microphone permissions
- **Real-time transcription**: Audio chunks are processed and transcribed in real-time
- **WebSocket communication**: Bidirectional communication with backend for live updates

### 🎯 Current Capabilities
- ✅ Sidebar interface with recording controls
- ✅ Microphone permission detection and request
- ✅ Real-time audio streaming to backend
- ✅ Live transcription display
- ✅ Extension context validation
- ✅ Google Meet integration
- ✅ Floating minimize/restore functionality

## 🐛 Troubleshooting

### Common Issues and Solutions

#### "Extension context invalidated"
- **Cause**: Extension was reloaded or updated while page was open
- **Solution**: Refresh the page and try again
- **Prevention**: The extension now detects this and shows helpful error messages

#### "Permissions policy violation: microphone is not allowed"
- **Cause**: Browser security prevents iframe microphone access
- **Solution**: We've moved microphone access to the content script (fixed automatically)

#### "Microphone access denied"
- **Cause**: User denied microphone permission or browser blocked it
- **Solutions**:
  1. Click the microphone icon in Chrome's address bar and allow access
  2. Go to Chrome Settings → Privacy → Site Settings → Microphone → Allow
  3. Make sure the site isn't blocked in microphone settings

#### "Backend connection failed"
- **Cause**: FastAPI server isn't running or wrong port
- **Solutions**:
  1. Start the backend server: `cd backend && python main.py`
  2. Check if localhost:8000 is accessible
  3. Check firewall settings

#### No transcription appears
- **Possible causes and solutions**:
  1. **No audio input**: Speak clearly and check microphone levels
  2. **Backend processing**: Check backend logs for transcription errors
  3. **WebSocket disconnected**: Check connection status in sidebar

## 📋 Testing Checklist

Use this checklist to verify everything works:

- [ ] Extension loads without errors in chrome://extensions/
- [ ] Extension icon appears in browser toolbar
- [ ] Clicking icon opens sidebar on the right
- [ ] Sidebar shows "Microphone access available" or requests permission
- [ ] "Start Recording" button is enabled
- [ ] Clicking "Start Recording" grants microphone access
- [ ] Connection status shows "Connected to backend"
- [ ] Recording status shows "Recording..."
- [ ] Speaking produces real-time transcription
- [ ] "Stop Recording" button works
- [ ] Extension works on Google Meet
- [ ] No console errors

## 🔍 Advanced Testing

### Manual Testing Steps

1. **Basic functionality**:
   ```
   1. Load extension → Should appear in toolbar
   2. Click icon → Sidebar opens
   3. Check microphone status → Should be available or request permission
   4. Start recording → Should begin immediately
   5. Speak → Transcription should appear
   6. Stop recording → Should stop cleanly
   ```

2. **Google Meet integration**:
   ```
   1. Join Google Meet → Extension should inherit permissions
   2. Open extension → Should work without additional permission requests
   3. Record during meeting → Should capture meeting audio
   4. Check transcription → Should include meeting participants
   ```

3. **Error recovery**:
   ```
   1. Start recording → Works normally
   2. Reload extension (chrome://extensions/) → Context becomes invalid
   3. Try to record → Should show friendly error message
   4. Refresh page → Should work normally again
   ```

### Console Debugging

Open Chrome DevTools (F12) and check for:

1. **No error messages** in Console tab
2. **WebSocket connection** in Network tab
3. **Extension messages** with `[AI Meeting Assistant]` prefix
4. **Audio chunks** being sent to backend

### Backend Verification

Check the backend terminal for:
```
INFO: WebSocket connection established for browser extension
INFO: Audio chunk received: X bytes
INFO: Transcription: [actual spoken text]
```

## 📁 File Structure

```
browser-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js               # Popup logic and permission handling
├── content.js             # Injected script for microphone access
├── sidebar.html           # Sidebar interface
├── sidebar.js             # Sidebar logic and WebSocket communication
├── background.js          # Background service worker
├── test.html              # Testing page
└── icons/                 # Extension icons
```

## 🔗 Integration Points

### Backend Endpoints
- `ws://localhost:8000/ws/browser-extension` - WebSocket for real-time communication
- `POST /upload-audio` - Audio chunk upload endpoint

### Message Passing Architecture
1. **Sidebar → Content Script**: `requestMicrophoneAccess`, `startRecordingWithStream`, `stopRecording`
2. **Content Script → Sidebar**: `microphoneAccessGranted`, `microphoneAccessDenied`, `audioChunkReady`
3. **Popup → Extension**: Permission checks and Google Meet detection

## 🚨 Important Notes

1. **Chrome Extension Permissions**: The extension needs microphone access, which is separate from website permissions
2. **Google Meet Integration**: Permissions are inherited when possible, but may still require explicit granting
3. **Iframe Limitations**: Microphone access must be in main page context, not iframe
4. **Extension Context**: Becomes invalid when extension is reloaded - always refresh pages after updating
5. **WebSocket Connection**: Backend must be running for real-time features to work

## 📈 Next Steps

If everything works correctly, you can:
1. Package the extension for distribution
2. Add more meeting platform integrations
3. Enhance transcription accuracy with custom models
4. Add speaker identification features
5. Implement meeting summaries and action items

For any issues not covered here, check the browser console and backend logs for specific error messages.