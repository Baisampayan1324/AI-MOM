# 🎯 AI MOM Browser Extension - Real-Time Meeting Transcription# 🎯 Unified Meeting Transcription Extension



<div align="center">A powerful browser extension that combines the best features from multiple meeting transcription tools into a single, unified solution. This extension provides real-time screen capture with audio transcription for Google### ✅ Potential Enhancements

- **📱 Mobile Support**: Progressive Web App version for mobile devices

![Extension Banner](https://img.shields.io/badge/Extension-Meeting%20Transcription-2196F3?style=for-the-badge&logo=googlechrome&logoColor=white)- **🌍 More Platforms**: Slack Huddles, Discord, WebEx, GoToMeeting support

- **🧠 AI Summaries**: Automatic meeting summaries and action items

[![Chrome](https://img.shields.io/badge/Chrome-90+-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)- **📝 Export Options**: Save transcriptions to various formats (PDF, DOCX, etc.)

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/)- **🔗 Calendar Integration**: Automatic scheduling and meeting association

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Baisampayan1324/AI-MOM)- **👥 Speaker Recognition**: Advanced speaker identification and labeling

[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)- **📊 Analytics**: Meeting insights, talk time analysis, sentiment tracking

- **🔒 Enterprise Features**: SSO integration, team management, complianceom, YouTube, and other platforms.

**Powerful Chrome extension for capturing online meetings with screen recording, system audio, and real-time AI transcription**

## 🚀 Key Features

[🚀 Features](#-key-features) • [📦 Installation](#-installation) • [🎮 Usage](#-usage-guide) • [🔧 Technical Details](#-technical-architecture) • [🐛 Troubleshooting](#-troubleshooting)

### 🔥 Core Capabilities

</div>- **🖥️ Screen Capture with Audio**: Records system audio during screen sharing for complete meeting capture

- **🎙️ Real-time Transcription**: Live audio processing with WebSocket backend integration

---- **📱 Floating Overlay**: Draggable transcription display that works on any platform

- **🎯 Multi-Platform Support**: Seamless integration with Google Meet, Zoom, and YouTube

## 📋 Table of Contents- **⚡ Smart Detection**: Automatically detects meeting state and offers to start recording

- **🎨 Professional UI**: Clean, responsive interface with platform-specific styling

- [Overview](#-overview)

- [Key Features](#-key-features)### 🛠️ Advanced Features

- [Supported Platforms](#-supported-platforms)- **🔄 Robust Error Handling**: Comprehensive error recovery and user feedback

- [Installation](#-installation)- **💾 Session Management**: Automatically saves transcription state and preferences

- [Usage Guide](#-usage-guide)- **🎛️ Flexible Controls**: Multiple ways to start/stop recording (popup, keyboard shortcuts, auto-dialogs)

- [Technical Architecture](#-technical-architecture)- **📊 Real-time Audio Visualization**: Visual feedback during recording

- [File Structure](#-file-structure)- **🌐 WebSocket Integration**: Sub-second latency for live transcription display

- [Configuration](#-configuration)- **🔒 Privacy-First**: All processing happens locally or through your own backend

- [Integration](#-backend-integration)

- [Troubleshooting](#-troubleshooting)## 🏗️ Architecture Overview

- [Development](#-development)

- [FAQ](#-faq)This unified extension merges components from two previous extensions:

- **Stable Core**: Robust service worker and messaging from the working `extension` folder

---- **Advanced Features**: Professional UI and backend integration from `browser-extension` folder

- **Enhanced Permissions**: Comprehensive permission set for screen capture and audio access

## 🎯 Overview

### 📁 File Structure

**AI MOM Browser Extension** is a professional Chrome extension that brings powerful real-time transcription capabilities to any online meeting. It combines screen capture, system audio recording, and AI-powered transcription to provide comprehensive meeting documentation without leaving your browser.```

extension/

### What This Extension Does├── manifest.json              # Unified manifest with all necessary permissions

├── background.js              # Service worker with robust error handling

1. **Captures Screen + Audio**: Records your screen and system audio simultaneously├── content/

2. **Real-Time Transcription**: Streams audio to backend for instant text conversion│   ├── screen-capture.js      # Main screen capture and floating overlay logic

3. **Floating Overlay**: Shows live transcription in a draggable, non-intrusive overlay│   ├── common.js              # Shared utilities for all platforms

4. **Multi-Platform Support**: Works seamlessly with Google Meet, Zoom, Teams, and more│   ├── google-meet.js         # Google Meet specific integration

5. **Smart Detection**: Automatically detects meeting platforms and adapts UI accordingly│   ├── zoom.js                # Zoom meeting integration

6. **WebSocket Integration**: Sub-second latency for real-time text updates│   ├── microsoft-teams.js     # Microsoft Teams integration

│   ├── zoho-meeting.js        # Zoho Meeting integration

### Why Use This Extension?│   └── youtube.js             # YouTube video transcription

├── popup/

- ✅ **No Meeting Bot**: Capture meetings without adding extra participants│   ├── popup.html             # Extension popup interface

- ✅ **System Audio**: Record computer audio, not just microphone│   ├── popup.js               # Popup controls and status display

- ✅ **Universal**: Works on any website, any meeting platform│   └── popup.css              # Professional popup styling

- ✅ **Privacy-First**: All processing happens on your backend├── overlay/

- ✅ **Professional UI**: Clean, modern interface that doesn't distract│   └── overlay.css            # Floating overlay and dialog styles

- ✅ **Free to Use**: Open-source, no subscriptions or limitations└── assets/

    └── icons/                 # Extension icons (16px, 48px, 128px, SVG)

---```



## ✨ Key Features## 🎯 Platform Support



### 🎯 Core Capabilities### ✅ Google Meet

- **Detection**: Automatic meeting state monitoring

#### 1. **Screen Capture with Audio**- **Integration**: Seamless overlay positioning

- **High-Quality Recording**: Captures screen at full resolution- **Features**: Participant tracking, meeting title extraction

- **System Audio**: Records computer audio (speakers/headphones output)- **Shortcuts**: Auto-start dialog, Extension popup controls

- **Tab Audio**: Can capture specific tab audio as backup

- **Format**: WebM with Opus codec for optimal compression### ✅ Zoom

- **Frame Rate**: Configurable (default 30fps)- **Detection**: Meeting state detection for web client

- **Integration**: UI-aware overlay positioning

#### 2. **Real-Time Transcription**- **Features**: Meeting info extraction

- **Live Processing**: Audio streams to backend via WebSocket- **Shortcuts**: `Ctrl+Shift+T` to toggle transcription

- **Instant Text**: See transcription appear in real-time

- **Speaker Detection**: Identifies different speakers (when backend supports it)### ✅ Microsoft Teams

- **Timestamps**: Every segment includes accurate timestamps- **Detection**: Teams meeting and call state monitoring

- **Error Recovery**: Automatically reconnects if connection drops- **Integration**: Teams UI-aware overlay positioning

- **Features**: Meeting details extraction, participant tracking

#### 3. **Floating Overlay**- **Shortcuts**: `Ctrl+Shift+M` to toggle transcription

- **Draggable**: Move anywhere on screen

- **Resizable**: Adjust size to your preference### ✅ Zoho Meeting

- **Minimizable**: Collapse to save screen space- **Detection**: Zoho meeting state and participant monitoring

- **Persistent Position**: Remembers where you placed it- **Integration**: Zoho interface-aware positioning

- **Platform-Aware**: Positions intelligently based on detected platform- **Features**: Meeting info and participant extraction

- **Shortcuts**: `Ctrl+Shift+Z` to toggle transcription

#### 4. **Multi-Platform Integration**

- **Google Meet**: Auto-detection, smart positioning### ✅ YouTube

- **Zoom**: Meeting state detection, UI integration- **Detection**: Video watching state monitoring

- **Microsoft Teams**: Call detection, Teams-aware overlay- **Integration**: Player-aware overlay positioning

- **Zoho Meeting**: Meeting state monitoring- **Features**: Video title and channel extraction

- **YouTube**: Video transcription for educational content- **Shortcuts**: `Ctrl+Shift+Y` to toggle transcription

- **Generic**: Works on any website with screen capture- **Smart Prompting**: Daily limit to avoid interrupting casual viewing



#### 5. **Extension Popup Control**## ⚙️ Installation & Setup

- **Connection Status**: Visual indicator (Connected/Disconnected)

- **Platform Detection**: Shows detected meeting platform### 1. Install Extension

- **Recording Controls**: Start/Stop recording1. Open Chrome and navigate to `chrome://extensions/`

- **Settings**: Configure backend URL, language, preferences2. Enable **"Developer mode"** in the top-right corner

- **Statistics**: View recording duration, word count3. Click **"Load unpacked"**

4. Select the `extension` folder: `p:\extension\extension\`

#### 6. **Smart Notifications**5. Pin the extension by clicking the puzzle piece icon (🧩) and pinning it

- **Recording Started**: Visual confirmation

- **Transcription Ready**: When text starts appearing### 2. Backend Requirements

- **Connection Issues**: Alerts if backend disconnectsThe extension requires a WebSocket backend for transcription processing:

- **Error Handling**: User-friendly error messages

```bash

---# Your backend should provide:

WebSocket endpoint: ws://localhost:8000/ws

## 🌐 Supported PlatformsAudio processing: Real-time audio chunk handling

Transcription: Whisper AI or similar speech-to-text

### ✅ Fully Integrated Platforms```



#### **Google Meet** (`https://meet.google.com/*`)Expected backend features:

- **Auto-Detection**: Recognizes when you're in a meeting- **WebSocket Server**: `ws://localhost:8000/ws` for real-time communication

- **Meeting State**: Monitors join/leave events- **Audio Processing**: Handle WebM audio chunks from `getDisplayMedia`

- **UI Integration**: Overlay positioned to avoid Meet controls- **Transcription Engine**: Whisper, Groq, or similar STT service

- **Features**:- **Response Format**: JSON messages with transcribed text and timestamps

  - Automatic platform detection

  - Meeting title extraction### 3. Permissions Setup

  - Participant count trackingThe extension will request these permissions:

  - Smart overlay positioning- **🖥️ `desktopCapture`**: For screen recording with audio

- **📱 `tabCapture`**: For browser tab audio capture  

#### **Zoom** (`https://*.zoom.us/*`)- **📝 `scripting`**: For injecting content scripts on supported platforms

- **Web Client**: Full support for Zoom web client- **💾 `storage`**: For saving preferences and session data

- **Meeting Detection**: Identifies active Zoom sessions- **🌐 `activeTab`**: For platform-specific integrations

- **UI Awareness**: Overlay avoids Zoom toolbar

- **Keyboard Shortcut**: `Ctrl+Shift+T` to toggle## 🎮 Usage Guide

- **Features**:

  - Meeting ID extraction### Method 1: Extension Popup

  - Host/participant detection1. Click the extension icon in the toolbar

  - Recording indicator awareness2. Select your platform or use "Auto-detect"

3. Click "Start Screen Capture"

#### **Microsoft Teams** (`https://teams.microsoft.com/*`)4. Choose your screen/window and ensure "Share audio" is checked

- **Calls & Meetings**: Supports both Teams calls and meetings5. Watch real-time transcription in the floating overlay

- **State Detection**: Monitors call connection state

- **UI Integration**: Teams-specific overlay positioning### Method 2: Keyboard Shortcuts

- **Keyboard Shortcut**: `Ctrl+Shift+M` to toggle- **Google Meet**: Auto-start dialog appears in meetings

- **Features**:- **Zoom**: `Ctrl+Shift+T` to toggle transcription

  - Meeting title extraction- **Microsoft Teams**: `Ctrl+Shift+M` to toggle transcription

  - Participant tracking- **Zoho Meeting**: `Ctrl+Shift+Z` to toggle transcription

  - Chat integration ready- **YouTube**: `Ctrl+Shift+Y` to toggle transcription



#### **Zoho Meeting** (`https://meeting.zoho.com/*`)### Method 3: Auto-Detection

- **Meeting Detection**: Identifies Zoho meeting sessions- Extension automatically detects when you're in supported platforms

- **Participant Monitoring**: Tracks who's in the meeting- Shows friendly start dialog when appropriate

- **UI Adaptation**: Zoho interface-aware positioning- Remembers your preferences for future sessions

- **Keyboard Shortcut**: `Ctrl+Shift+Z` to toggle

## 🔧 Technical Details

#### **YouTube** (`https://www.youtube.com/*`)

- **Video Transcription**: Transcribe educational videos### Screen Capture API

- **Player Integration**: Overlay positioned near player```javascript

- **Smart Prompting**: Daily limit to avoid interrupting casual viewing// Uses modern getDisplayMedia with audio

- **Keyboard Shortcut**: `Ctrl+Shift+Y` to togglenavigator.mediaDevices.getDisplayMedia({

- **Use Cases**: Lectures, tutorials, interviews  video: true,

  audio: {

### 🌍 Universal Support    echoCancellation: false,

    noiseSuppression: false,

**Works on any website!** The extension can capture screen and transcribe on any webpage, not just the platforms listed above. The integrations provide enhanced experiences, but basic functionality works everywhere.    sampleRate: 44100

  }

---})

```

## 📦 Installation

### Audio Processing

### Prerequisites- **Format**: WebM with Opus codec for optimal compression

- **Chunk Size**: 5-second intervals for real-time processing

- **Google Chrome**: Version 90 or higher- **Quality**: 44.1kHz sample rate with minimal processing

- **Backend Server**: AI MOM Backend running (see [Backend Documentation](../backend/README.md))- **Latency**: Sub-second transcription display

- **Operating System**: Windows, macOS, or Linux

### WebSocket Communication

### Step-by-Step Installation```javascript

// Real-time bidirectional communication

#### 1. Download Extension FilesWebSocket: ws://localhost:8000/ws

```bashMessage Format: {

# Option A: Clone repository  type: 'audio_chunk',

git clone https://github.com/Baisampayan1324/AI-MOM.git  data: base64AudioData,

cd AI-MOM/extension  timestamp: Date.now(),

  platform: 'google-meet'

# Option B: Download ZIP from GitHub}

# Extract to a folder (e.g., C:\AI_MOM\extension)```

```

### Floating Overlay

#### 2. Install in Chrome- **Positioning**: Platform-aware positioning to avoid UI conflicts

- **Draggable**: Users can reposition overlay anywhere on screen

1. **Open Chrome Extensions Page**:- **Responsive**: Adapts to different screen sizes and platform layouts

   - Navigate to `chrome://extensions/`- **Persistent**: Remembers position across sessions

   - Or click Menu (⋮) → More Tools → Extensions

## 🐛 Troubleshooting

2. **Enable Developer Mode**:

   - Toggle "Developer mode" switch in top-right corner### Common Issues



3. **Load Extension**:**❌ "Extension context invalidated"**

   - Click "Load unpacked" button- **Solution**: Refresh the page and reload the extension

   - Select the `extension` folder: `P:\AI_MOM\extension`- **Cause**: Extension was reloaded during development

   - Extension should appear in your extensions list

**❌ "Screen capture failed"**

4. **Pin Extension** (Recommended):- **Solution**: Ensure you check "Share audio" when selecting screen

   - Click Extensions icon (🧩) in Chrome toolbar- **Cause**: Audio permission not granted during screen selection

   - Find "AI MOM Meeting Intelligence"

   - Click pin icon to keep in toolbar**❌ "WebSocket connection failed"**

- **Solution**: Start your backend server at `localhost:8000`

5. **Verify Installation**:- **Cause**: Backend not running or wrong port

   - Extension icon should appear in toolbar

   - Click icon to open popup**❌ "No transcription appearing"**

   - Should see "AI MOM" popup interface- **Solution**: Check browser console for WebSocket errors

- **Cause**: Backend not processing audio chunks correctly

#### 3. Start Backend Server

**❌ "Overlay not positioning correctly"**

```bash- **Solution**: Try dragging overlay to preferred position

# Navigate to backend folder- **Cause**: Platform layout changes or responsive design

cd ../backend

### Debug Mode

# Activate virtual environment (if created)Enable debug mode by opening browser console:

venv\Scripts\activate  # Windows```javascript

source venv/bin/activate  # macOS/LinuxlocalStorage.setItem('unified-debug', 'true');

// Reload page to see detailed logging

# Start server```

python main.py

## 🔄 Development

# Wait for:

# ✅ Uvicorn running on http://localhost:8000### Making Changes

```1. Edit source files in the `extension` folder

2. Go to `chrome://extensions/`

#### 4. Test Connection3. Click the refresh icon on the extension card

4. Test changes on supported platforms

1. Click extension icon in Chrome toolbar

2. Popup should show "Connection Status"### Adding New Platforms

3. Click "Test Connection" button1. Create new content script in `content/platform-name.js`

4. Should show "Connected ✅"2. Add script to `manifest.json` content_scripts array

3. Implement platform detection and integration logic

**If shows "Disconnected ❌"**:4. Add platform-specific CSS styles in overlay.css

- Ensure backend is running

- Check backend URL in settings (should be `http://localhost:8000`)### Backend Integration

- Check browser console for errorsThe extension expects JSON WebSocket messages:

```javascript

---// Incoming transcription

{

## 🎮 Usage Guide  type: 'transcription',

  text: 'Hello world',

### Method 1: Extension Popup (Recommended)  timestamp: 1635123456789,

  speaker: 'Speaker 1',

**Most reliable way to start recording**  confidence: 0.95

}

1. **Open Meeting**:

   - Join a Google Meet, Zoom, Teams meeting// Status updates  

   - Or visit any website you want to transcribe{

  type: 'status',

2. **Click Extension Icon**:  message: 'Connected',

   - Click AI MOM icon in Chrome toolbar  level: 'info'

   - Popup opens with controls}

```

3. **Verify Connection**:

   - Check "Connection Status" shows "Connected ✅"## 📊 What's New in Unified Version

   - Platform should show detected platform (e.g., "google-meet")

### ✅ Merged Features

4. **Configure Settings** (Optional):- **Robust Architecture**: Stable service worker from working extension

   - Click ⚙️ Settings button- **Professional UI**: Polished interface from browser-extension

   - Set Backend URL: `http://localhost:8000`- **Enhanced Permissions**: Combined permission set for full functionality

   - Choose language (auto-detect recommended)- **Better Error Handling**: Comprehensive error recovery and user feedback

   - Enable/disable overlay and auto-summary- **Multi-Platform**: Unified approach works across Google Meet, Zoom, YouTube

   - Click "Save Settings"

### ✅ Improvements Over Original Extensions

5. **Start Recording**:- **Fixed Service Worker Issues**: No more DOM API usage in background script

   - Click "⏺️ Start Recording" button- **Proper Content Script Injection**: Robust injection with error handling

   - Browser shows screen picker dialog- **Unified Styling**: Consistent design across all platforms

- **Better State Management**: Shared utilities and common patterns

6. **Select Screen**:- **Enhanced User Experience**: Auto-detection, smart prompting, keyboard shortcuts

   - Choose "Entire Screen" OR specific application window OR Chrome tab

   - ✅ **CRITICAL**: Check "Share system audio" checkbox### ✅ Technical Enhancements

   - Click "Share" button- **Class-Based Architecture**: Clean, maintainable code structure

- **Modular Design**: Separate content scripts for each platform

7. **Verify Recording**:- **Shared Utilities**: Common functionality in `common.js`

   - ✅ Popup shows "Recording: 00:00:XX"- **Responsive Design**: Works on all screen sizes and platform layouts

   - ✅ Floating overlay appears on page- **Performance Optimized**: Efficient DOM querying and event handling

   - ✅ Backend console shows WebSocket connection

   - ✅ Transcription text starts appearing in overlay## 🚀 Future Possibilities



8. **Stop Recording**:### Potential Enhancements

   - Click "⏹️ Stop Recording" in popup- **📱 Mobile Support**: Progressive Web App version for mobile devices

   - OR click ⏹️ button in floating overlay- **🌍 More Platforms**: Microsoft Teams, Slack Huddles, Discord support

   - Recording stops, overlay disappears- **🧠 AI Summaries**: Automatic meeting summaries and action items

- **📝 Export Options**: Save transcriptions to various formats (PDF, DOCX, etc.)

### Method 2: Floating Overlay- **🔗 Calendar Integration**: Automatic scheduling and meeting association

- **👥 Speaker Recognition**: Advanced speaker identification and labeling

**Once recording starts from popup**- **📊 Analytics**: Meeting insights, talk time analysis, sentiment tracking

- **🔒 Enterprise Features**: SSO integration, team management, compliance

- **View Transcription**: Read live text in overlay

- **Drag Overlay**: Click and drag to reposition### Backend Improvements

- **Minimize**: Click ➖ to collapse (click again to expand)- **🏭 Scalability**: Support for multiple concurrent users

- **Stop Recording**: Click ⏹️ to end session- **☁️ Cloud Deployment**: Docker containers for easy deployment

- **🔐 Security**: Authentication, encryption, secure WebSocket connections

### Method 3: Keyboard Shortcuts (Platform-Specific)- **⚡ Performance**: GPU acceleration for faster transcription

- **🌐 API Integration**: Connect with popular meeting platforms' APIs

**Quick toggle for supported platforms**

## 📋 Testing Checklist

| Platform | Shortcut | Action |

|----------|----------|--------|### Basic Functionality

| **Zoom** | `Ctrl+Shift+T` | Toggle transcription |- [ ] Extension loads without errors in Chrome DevTools

| **Microsoft Teams** | `Ctrl+Shift+M` | Toggle transcription |- [ ] Popup opens and displays current platform

| **Zoho Meeting** | `Ctrl+Shift+Z` | Toggle transcription |- [ ] Screen capture starts successfully with audio

| **YouTube** | `Ctrl+Shift+Y` | Toggle transcription |- [ ] Floating overlay appears and is draggable

- [ ] WebSocket connection establishes to backend

**Note**: Google Meet uses popup control (no shortcut to avoid conflicts)- [ ] Real-time transcription displays in overlay

- [ ] Stop recording works and cleans up resources

---

### Platform-Specific Testing

## 🏗️ Technical Architecture- [ ] **Google Meet**: Auto-detection works, overlay positions correctly

- [ ] **Zoom**: Meeting detection works, keyboard shortcut functions

### System Overview- [ ] **Microsoft Teams**: Teams meeting detection and integration works

- [ ] **Zoho Meeting**: Meeting state detection and overlay positioning works  

```- [ ] **YouTube**: Video detection works, smart prompting respects daily limit

┌─────────────────────────────────────────────────────────────┐- [ ] **General Web**: Extension gracefully handles unsupported pages

│                     Browser (Chrome)                        │

│                                                             │### Error Handling

│  ┌─────────────┐     ┌──────────────┐     ┌─────────────┐ │- [ ] Graceful handling when backend is offline

│  │   Popup UI  │     │   Content    │     │  Background │ │- [ ] User-friendly messages for permission denials

│  │  (popup.js) │────▶│   Scripts    │◀────│   Script    │ │- [ ] Recovery from WebSocket disconnections

│  └─────────────┘     │(screen-capture)│   │(background) │ │- [ ] Proper cleanup when tab is closed

│                      └────────┬───────┘     └─────────────┘ │- [ ] Extension reload doesn't break functionality

│                               │                             │

│                      ┌────────▼────────┐                    │---

│                      │  Floating      │                    │

│                      │  Overlay       │                    │## 📜 License & Credits

│                      │  (overlay.css) │                    │

│                      └─────────────────┘                    │This unified extension combines and enhances features from multiple previous implementations, creating a comprehensive solution for meeting transcription across web platforms.

└──────────────────────────────┬──────────────────────────────┘

                               │ WebSocket**Built with modern Chrome Extension APIs and best practices for performance, security, and user experience.**
                               │ (ws://localhost:8000/ws/audio)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    AI MOM Backend Server                    │
│                                                             │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  WebSocket   │  │  Audio         │  │  Whisper AI    │ │
│  │  Handler     │─▶│  Processor     │─▶│  Transcription │ │
│  └──────────────┘  └────────────────┘  └────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI Summarizer (Groq/OpenRouter - 5 models)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### **1. Extension Popup (`popup/`)**
**Purpose**: User interface for controlling the extension

- **popup.html**: HTML structure for popup UI
- **popup.js**: Business logic and state management
- **popup.css**: Styling for popup interface

**Key Functions**:
```javascript
- startScreenCapture()    // Initiates screen capture
- stopRecording()         // Ends recording session
- testConnection()        // Checks backend connectivity
- updateConnectionStatus() // UI status updates
- saveSettings()          // Persists user preferences
```

#### **2. Content Scripts (`content/`)**
**Purpose**: Injected into web pages to interact with DOM and handle screen capture

- **screen-capture.js**: Core screen capture and WebSocket logic
- **common.js**: Shared utilities for all platforms
- **google-meet.js**: Google Meet specific integration
- **zoom.js**: Zoom specific integration
- **microsoft-teams.js**: Microsoft Teams integration
- **zoho-meeting.js**: Zoho Meeting integration
- **youtube.js**: YouTube integration

**Screen Capture Flow**:
```javascript
1. User clicks "Start Recording" in popup
2. Popup sends message to content script
3. Content script calls navigator.mediaDevices.getDisplayMedia()
4. User selects screen/window and checks "Share system audio"
5. Content script receives MediaStream
6. MediaRecorder starts recording
7. Audio chunks sent to backend via WebSocket
8. Transcription received and displayed in overlay
```

#### **3. Background Script (`background.js`)**
**Purpose**: Service worker for managing extension lifecycle

- **Message Relay**: Routes messages between popup and content scripts
- **Tab Management**: Tracks active tabs and states
- **Permission Handling**: Manages extension permissions
- **Icon Updates**: Changes extension icon based on state

**Message Protocol**:
```javascript
// Popup → Background → Content Script
chrome.tabs.sendMessage(tabId, {
  action: 'START_SCREEN_CAPTURE',
  settings: { ... }
});

// Content Script → Background → Popup
chrome.runtime.sendMessage({
  action: 'RECORDING_STARTED',
  success: true
});
```

#### **4. Floating Overlay (`overlay/`)**
**Purpose**: On-page transcription display

- **overlay.css**: Styling for floating overlay
- **Injected by**: Content script (`screen-capture.js`)
- **Features**:
  - Draggable positioning
  - Minimize/maximize
  - Auto-scroll for new text
  - Platform-aware positioning

**HTML Structure** (created dynamically):
```html
<div id="ai-mom-overlay" class="draggable">
  <div class="overlay-header">
    <span>🎤 AI Transcription</span>
    <button class="minimize-btn">➖</button>
    <button class="stop-btn">⏹️</button>
  </div>
  <div class="overlay-body">
    <div class="transcript-container">
      <!-- Transcription segments appear here -->
    </div>
  </div>
</div>
```

### Data Flow

#### **Audio Capture → Backend**

```javascript
// 1. Start screen capture
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    sampleRate: 44100
  }
});

// 2. Create MediaRecorder
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus'
});

// 3. Send audio chunks via WebSocket
mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = btoa(reader.result);
      ws.send(JSON.stringify({
        type: 'audio',
        data: base64Audio,
        format: 'webm',
        sampleRate: 44100
      }));
    };
    reader.readAsBinaryString(event.data);
  }
};

// Start recording with 5-second chunks
mediaRecorder.start(5000);
```

#### **Backend → Extension (Transcription)**

```javascript
// WebSocket message handler
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'transcription':
      // Display transcription in overlay
      addTranscriptSegment({
        speaker: data.speaker,
        text: data.text,
        timestamp: data.timestamp,
        isFinal: data.is_final
      });
      break;
      
    case 'summary':
      // Show AI summary
      displaySummary(data.summary);
      break;
      
    case 'error':
      // Handle error
      showErrorMessage(data.message);
      break;
  }
};
```

---

## 📁 File Structure

```
extension/
├── manifest.json                   # Extension manifest (Manifest V3)
├── background.js                   # Service worker
│
├── popup/                          # Extension popup UI
│   ├── popup.html                  # Popup HTML structure
│   ├── popup.js                    # Popup logic (controls)
│   └── popup.css                   # Popup styles
│
├── content/                        # Content scripts (injected into pages)
│   ├── screen-capture.js           # Core screen capture + WebSocket
│   ├── common.js                   # Shared utilities
│   ├── google-meet.js              # Google Meet integration
│   ├── zoom.js                     # Zoom integration
│   ├── microsoft-teams.js          # Microsoft Teams integration
│   ├── zoho-meeting.js             # Zoho Meeting integration
│   └── youtube.js                  # YouTube integration
│
├── overlay/                        # Floating overlay styles
│   └── overlay.css                 # Overlay CSS (draggable transcription box)
│
├── assets/                         # Extension assets
│   └── icons/                      # Extension icons
│       ├── icon.svg                # Vector icon source
│       ├── icon16.png              # 16x16 toolbar icon
│       ├── icon48.png              # 48x48 management icon
│       └── icon128.png             # 128x128 store icon
│
└── README.md                       # This file
```

### Key Files Explained

#### **manifest.json**
```json
{
  "manifest_version": 3,
  "name": "AI MOM Meeting Intelligence",
  "version": "1.0.0",
  "permissions": [
    "activeTab",           // Access current tab
    "tabCapture",          // Capture tab audio
    "desktopCapture",      // Screen capture
    "storage",             // Save settings
    "scripting",           // Inject content scripts
    "notifications"        // Show notifications
  ],
  "host_permissions": [
    "https://meet.google.com/*",
    "https://*.zoom.us/*",
    "https://teams.microsoft.com/*",
    "http://localhost:8000/*",  // Backend access
    "ws://localhost:8000/*"     // WebSocket access
  ]
}
```

#### **background.js** - Service Worker
- Manages extension lifecycle
- Routes messages between popup and content scripts
- Handles tab state tracking
- Updates extension icon based on state

#### **popup/popup.js** - Main Control Logic
- Connection status monitoring
- Settings management
- Start/stop recording commands
- UI updates and notifications

#### **content/screen-capture.js** - Core Functionality
- `startScreenCapture()`: Initiates screen + audio capture
- `connectWebSocket()`: Establishes backend connection
- `sendAudioChunk()`: Sends audio data to backend
- `handleTranscription()`: Displays received text
- `showOverlay()`: Creates floating transcription box

---

## ⚙️ Configuration

### Extension Settings

**Access**: Click extension icon → ⚙️ Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Backend URL** | WebSocket server address | `http://localhost:8000` |
| **Language** | Transcription language | Auto-detect |
| **Show Overlay** | Display floating transcription | ✅ Enabled |
| **Auto-Summary** | Generate AI summary after recording | ✅ Enabled |
| **Recording Quality** | Video quality (affects file size) | Standard |
| **Audio Sample Rate** | Audio quality (higher = better) | 44.1kHz |

### Storage (LocalStorage)

Extension stores preferences in Chrome storage:

```javascript
// Saved settings
{
  backendUrl: 'http://localhost:8000',
  language: 'auto',
  showOverlay: true,
  autoSummary: true,
  overlayPosition: { x: 20, y: 20 },
  recordingQuality: 'standard',
  sampleRate: 44100
}
```

### Permissions

| Permission | Used For | Required? |
|------------|----------|-----------|
| **tabCapture** | Capture tab audio | Yes (fallback) |
| **desktopCapture** | Screen recording with audio | Yes (primary) |
| **activeTab** | Access current tab content | Yes |
| **storage** | Save user preferences | Yes |
| **scripting** | Inject content scripts | Yes |
| **notifications** | Show status notifications | Optional |
| **host_permissions** | Access specific websites | Yes |

---

## 🔌 Backend Integration

### WebSocket Protocol

**Endpoint**: `ws://localhost:8000/ws/audio`

#### **Client → Server (Audio Data)**

```javascript
// Send audio chunk
{
  "type": "audio",
  "data": "<base64_encoded_audio>",
  "format": "webm",
  "sampleRate": 44100,
  "timestamp": 1696680000000,
  "platform": "google-meet"
}
```

#### **Server → Client (Transcription)**

```javascript
// Transcription segment
{
  "type": "transcription",
  "text": "Hello, this is a test meeting.",
  "speaker": "SPEAKER_00",
  "timestamp": "00:05:23",
  "is_final": true,
  "confidence": 0.95
}
```

#### **Server → Client (Summary)**

```javascript
// AI-generated summary
{
  "type": "summary",
  "summary": {
    "overview": "Meeting discussed project timeline...",
    "key_points": [
      "Launch date set for Q4",
      "Budget approved for $50k"
    ],
    "action_items": [
      "John to prepare mockups by Friday",
      "Sarah to schedule client call"
    ],
    "conclusions": [
      "Project greenlit, moving forward"
    ],
    "participants": ["SPEAKER_00", "SPEAKER_01"]
  }
}
```

#### **Server → Client (Error)**

```javascript
// Error message
{
  "type": "error",
  "message": "Failed to process audio",
  "code": "AUDIO_PROCESSING_ERROR"
}
```

### Connection Management

```javascript
// Connection lifecycle
const ws = new WebSocket('ws://localhost:8000/ws/audio');

ws.onopen = () => {
  console.log('✅ WebSocket connected');
  updateStatus('connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleMessage(data);
};

ws.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
  updateStatus('error');
};

ws.onclose = () => {
  console.log('🔌 WebSocket closed');
  updateStatus('disconnected');
  // Attempt reconnection after 3 seconds
  setTimeout(() => reconnect(), 3000);
};
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. "Could not establish connection"

**Symptoms**:
- Popup shows "Disconnected ❌"
- Error: "Could not establish connection. Receiving end does not exist."

**Solutions**:
1. **Reload Extension**:
   - Go to `chrome://extensions/`
   - Find "AI MOM Meeting Intelligence"
   - Click reload button (🔄)

2. **Reload Page**:
   - Refresh the meeting page (F5)
   - Content script needs to re-inject

3. **Check Backend**:
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy"}
   ```

4. **Verify URL**:
   - Extension settings → Backend URL
   - Should be: `http://localhost:8000`

#### 2. "Extension context invalidated"

**Symptoms**:
- Extension stops working mid-session
- Console error about invalid context

**Solutions**:
1. **Don't reload extension during recording**
2. **Refresh page** to restart content scripts
3. **Stop recording** before reloading extension

#### 3. "Screen capture failed" or "No audio captured"

**Symptoms**:
- Recording starts but no transcription appears
- Overlay shows "Listening for audio..." forever

**Solutions**:
1. **✅ CHECK "Share system audio"**:
   - When screen picker appears
   - Look for "Share system audio" checkbox
   - MUST be checked to record computer audio

2. **Select correct source**:
   - "Entire Screen" captures all audio
   - "Application window" captures that app's audio
   - "Chrome Tab" captures only tab audio

3. **Check audio is playing**:
   - Ensure meeting has active audio
   - Test with YouTube video first

4. **Try Tab Capture** (fallback):
   - If screen share audio doesn't work
   - Extension can capture tab audio

#### 4. "WebSocket connection failed"

**Symptoms**:
- Popup shows "Disconnected ❌"
- Browser console: "WebSocket connection to 'ws://localhost:8000/ws/audio' failed"

**Solutions**:
1. **Start Backend**:
   ```bash
   cd backend
   python main.py
   ```

2. **Check Firewall**:
   - Ensure port 8000 is not blocked
   - Allow Python through Windows Firewall

3. **Try 127.0.0.1**:
   - Change backend URL to `http://127.0.0.1:8000`
   - Some systems have localhost resolution issues

4. **Check Backend Logs**:
   - Backend console should show WebSocket connection
   - Look for errors in backend output

#### 5. Overlay not appearing

**Symptoms**:
- Recording starts but no overlay shows on page

**Solutions**:
1. **Check "Show Overlay" setting**:
   - Extension popup → Settings
   - Ensure "Show Overlay" is enabled

2. **Check browser console** (F12):
   - Look for JavaScript errors
   - Check if content script loaded

3. **Try different page**:
   - Some pages block content script injection
   - Test on google.com first

#### 6. Popup doesn't open

**Symptoms**:
- Clicking extension icon does nothing

**Solutions**:
1. **Check browser console**:
   - Right-click extension icon
   - Select "Inspect popup"
   - Look for errors in popup console

2. **Reinstall extension**:
   - Remove extension
   - Reload unpacked

3. **Clear Chrome cache**:
   - Settings → Privacy → Clear browsing data

### Debug Mode

**Enable detailed logging**:

1. Open browser console (F12)
2. Look for messages prefixed with:
   - `🚀 Unified Screen Capture`
   - `📨 Screen capture received message`
   - `✅ Screen capture started`
   - `🔗 Connecting to WebSocket`

**Check popup console**:
- Right-click extension icon → "Inspect popup"
- Console shows popup.js logs

**Check backend logs**:
- Backend terminal shows all WebSocket activity
- Look for "WebSocket connection established"

---

## 🛠️ Development

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Baisampayan1324/AI-MOM.git
cd AI-MOM/extension

# 2. Make changes to extension files
# (Edit popup/popup.js, content/screen-capture.js, etc.)

# 3. Reload extension in Chrome
# - Go to chrome://extensions/
# - Click reload button on AI MOM extension

# 4. Test changes
# - Click extension icon
# - Open browser console (F12)
# - Check for errors
```

### Building for Production

```bash
# 1. Create ZIP for Chrome Web Store
cd extension
zip -r ai-mom-extension.zip . -x "*.git*" -x "node_modules/*"

# 2. Upload to Chrome Web Store
# - Go to Chrome Developer Dashboard
# - Upload ZIP
# - Fill in store listing details
# - Submit for review
```

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and shows UI
- [ ] Backend connection successful
- [ ] Screen capture starts
- [ ] Audio is captured (system audio checkbox)
- [ ] Overlay appears on page
- [ ] Transcription text appears in overlay
- [ ] Stop recording works
- [ ] Overlay disappears after stop
- [ ] Settings save and persist
- [ ] Works on Google Meet
- [ ] Works on Zoom
- [ ] Works on Teams
- [ ] Works on generic websites

---

## ❓ FAQ

### Q: Does this work on all meeting platforms?

**A**: Yes! The extension can capture any screen/window, so it works universally. We have **enhanced integrations** for Google Meet, Zoom, Teams, Zoho Meeting, and YouTube, but basic screen capture + transcription works on **any website**.

### Q: Do I need to install a meeting bot?

**A**: No! This extension captures your screen and audio directly. Other participants won't see an extra "bot" in the meeting.

### Q: Can I use this offline?

**A**: The extension works offline for screen capture, but you need the backend running for transcription. The backend can be localhost (no internet required), but API keys for Groq/OpenRouter need internet.

### Q: Is my data secure?

**A**: Yes! All audio is processed by **your local backend**. Data only goes to AI APIs (Groq/OpenRouter) for transcription if you configured API keys. You control where data goes.

### Q: Can I record without transcription?

**A**: Currently, the extension focuses on transcription. For pure recording, use Chrome's built-in screen recorder or OBS Studio.

### Q: Why do I need to check "Share system audio"?

**A**: This checkbox tells Chrome to capture computer audio (speakers/headphones output). Without it, the extension can't hear the meeting audio, so no transcription.

### Q: Can I transcribe YouTube videos?

**A**: Yes! Visit any YouTube video, click the extension icon, start recording. It will transcribe the video audio. Great for lectures and tutorials.

### Q: How much does this cost?

**A**: The extension is **100% free**. Backend API costs depend on usage, but Groq and OpenRouter offer generous free tiers. Normal usage is essentially free.

### Q: Can I customize the overlay?

**A**: Currently, overlay styling is defined in `overlay/overlay.css`. You can edit this file to change colors, size, position, etc. We plan to add UI customization in future versions.

### Q: Does it support multiple languages?

**A**: Yes! The backend (Whisper) supports 50+ languages. In extension settings, you can select a specific language or use "Auto-detect".

---

## 📚 Additional Resources

### Documentation
- **Main README**: [../README.md](../README.md)
- **Backend Docs**: [../backend/README.md](../backend/README.md)
- **Frontend Docs**: [../frontend/README.md](../frontend/README.md)
- **Extension Integration Guide**: [../EXTENSION_POPUP_INTEGRATION.md](../EXTENSION_POPUP_INTEGRATION.md)

### Chrome APIs
- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Screen Capture API](https://developer.chrome.com/docs/extensions/reference/desktopCapture/)
- [Tab Capture API](https://developer.chrome.com/docs/extensions/reference/tabCapture/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

### Related Projects
- [OpenAI Whisper](https://github.com/openai/whisper)
- [Groq API](https://console.groq.com/docs)
- [OpenRouter](https://openrouter.ai/docs)

---

<div align="center">

**Built with ❤️ for seamless meeting transcription**

[![GitHub Stars](https://img.shields.io/github/stars/Baisampayan1324/AI-MOM?style=social)](https://github.com/Baisampayan1324/AI-MOM)

**[⭐ Star this repo](https://github.com/Baisampayan1324/AI-MOM) if you find it useful!**

[⬆ Back to Top](#-ai-mom-browser-extension---real-time-meeting-transcription)

</div>
