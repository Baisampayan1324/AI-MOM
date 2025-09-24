# AI Meeting Minutes - Frontend

A modern web interface for real-time meeting transcription, speaker alerts, and AI-powered summarization.

## 🌟 Features

- **Real-time Audio Capture** with live transcription
- **Audio File Processing** for pre-recorded meetings
- **Speaker Alerts** for personalized notifications
- **Auto-Summary Generation** with key points and action items
- **Speaker Diarization** with visual speaker identification
- **User Profile Management** for customized experiences
- **Session Persistence** with automatic data saving
- **Responsive Design** optimized for all devices

## 📋 Prerequisites

Before using the frontend, ensure you have:

- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **Microphone Access** (for real-time transcription)
- **Backend Server Running** on `http://localhost:8000`
- **HTTPS** (required for microphone access in production)

## 🚀 Quick Start

### 1. Start Backend Server

First, ensure the backend is running:

```bash
cd backend
python main.py
```

Server should be accessible at `http://localhost:8000`

### 2. Open Frontend

Simply open any of the HTML files in your web browser:

```bash
# For real-time transcription
open frontend/realtime_capture.html

# For audio file processing
open frontend/audio_processing.html

# For profile settings
open frontend/profile_settings.html
```

Or access via the backend server:
- `http://localhost:8000/frontend/realtime_capture.html`
- `http://localhost:8000/frontend/audio_processing.html`
- `http://localhost:8000/frontend/profile_settings.html`

## 📱 Application Interfaces

### 1. Real-time Audio Capture (`realtime_capture.html`)

**Purpose**: Live meeting transcription with real-time speaker alerts

**Key Features**:
- Live audio capture and transcription
- Real-time speaker identification
- Personalized speaker alerts
- Automatic summary generation
- Session data persistence

**Usage**:
1. Enter meeting ID and select language
2. Click "Connect to Meeting"
3. Click "Start Recording"
4. Speak into microphone
5. View live transcription and alerts
6. Stop recording to generate summary

### 2. Audio File Processing (`audio_processing.html`)

**Purpose**: Process pre-recorded audio files

**Key Features**:
- Upload audio files (MP3, WAV, M4A)
- Batch transcription processing
- Speaker-formatted output
- AI-powered summarization
- Progress tracking

**Usage**:
1. Click "Choose File" or drag & drop audio
2. Enter meeting ID (optional)
3. Select language (optional)
4. Click "Process Audio"
5. View transcription and summary results

### 3. Profile Settings (`profile_settings.html`)

**Purpose**: Customize personal information for targeted alerts

**Key Features**:
- Personal information management
- Custom keyword tracking
- Alert preferences
- Data persistence

**Usage**:
1. Fill in personal details:
   - Full name
   - Role/title
   - Team/department
   - Projects
   - Skills
   - Custom keywords
2. Click "Save Profile"
3. Data is automatically used in other interfaces

## ⚙️ Configuration

### Backend Connection

If your backend runs on a different host/port, update the configuration:

```javascript
// In each HTML file, update the backendUrl
const backendUrl = "http://your-backend-host:port";
```

### Audio Settings

Modify audio capture settings in `realtime_capture.html`:

```javascript
// Audio processing configuration
const CHUNK_SIZE = 16384;      // Audio buffer size
const SAMPLE_RATE = 16000;     // Audio sample rate
const CHUNK_DURATION = 5;      // Seconds per chunk
```

### Real-time Settings

Adjust real-time transcription behavior:

```javascript
// Speaker detection settings
const SPEAKER_CHANGE_THRESHOLD = 8000;  // ms between speakers
const MAX_SESSION_ENTRIES = 10;         // Max transcription entries
const ALERT_KEYWORDS = ['question', 'please', 'can you'];
```

## 🎨 User Interface Guide

### Real-time Transcription Interface

#### Control Panel
- **Meeting ID**: Unique identifier for the session
- **Language**: Target language for transcription
- **Connect Button**: Establishes WebSocket connection
- **Record Button**: Starts/stops audio capture

#### Live Display Areas
- **Real-time Transcription**: Shows live speech-to-text results
- **Speaker Alerts**: Notifications when you're mentioned
- **Transcription History**: Complete session history
- **Audio Level**: Visual microphone input indicator

#### Summary Section (Auto-generated)
- **Meeting Summary**: AI-generated overview
- **Key Points**: Important discussion points
- **Action Items**: Tasks and next steps

### Audio Processing Interface

#### Upload Section
- **File Selector**: Choose audio files
- **Drag & Drop**: Alternative upload method
- **Progress Bar**: Shows processing status

#### Results Display
- **Transcription**: Color-coded speaker text
- **Speaker-Formatted**: Organized by speaker
- **Summary**: AI-generated insights
- **Key Points**: Extracted highlights
- **Action Items**: Identified tasks

### Profile Settings Interface

#### Personal Information
- **Name**: Your full name for alerts
- **Role**: Job title or position
- **Team**: Department or team name
- **Contact**: Email and phone (optional)

#### Professional Details
- **Projects**: Current projects for context
- **Skills**: Your expertise areas
- **Keywords**: Custom terms to track

#### Alert Preferences
- **Notification Types**: Choose alert categories
- **Sensitivity**: Adjust alert frequency
- **Display Options**: Customize alert appearance

## 🔧 Advanced Features

### Session Data Persistence

The frontend automatically saves and restores:
- Meeting transcriptions
- User profile data
- Processing results
- Session preferences

**Storage Locations**:
```javascript
// Data stored in browser localStorage
localStorage.setItem('meetingMinutesSession', data);
localStorage.setItem('userProfile', profile);
localStorage.setItem('audioProcessingResults', results);
```

**Manual Data Management**:
- "Clear Session Data" button resets current session
- "Clear Saved Results" button removes stored data
- Data automatically expires after 24 hours

### Real-time Features

#### WebSocket Communication
```javascript
// Connection to backend
const socket = new WebSocket(`ws://localhost:8000/ws/meeting/${meetingId}`);

// Message handling
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  handleRealTimeUpdate(data);
};
```

#### Audio Processing
```javascript
// Web Audio API integration
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    // Process audio stream
    setupAudioProcessing(stream);
  });
```

### Speaker Alert System

#### Alert Types
- **Personal Alerts** 🚨: Your name mentioned
- **General Alerts** ⚠️: Questions or keywords

#### Trigger Patterns
```javascript
// Personal triggers
const personalTriggers = [userName, userRole, userTeam];

// General triggers
const generalTriggers = ['can you', 'please', 'question', 'thoughts'];
```

#### Custom Keywords
Add custom keywords in profile settings for specialized alerts.

## 🎯 Usage Examples

### Example 1: Team Meeting

```
1. Open realtime_capture.html
2. Set Meeting ID: "team-standup-2024-01-15"
3. Enter your name: "John Doe"
4. Click "Connect to Meeting"
5. Start recording
6. Speak: "Good morning team, let's start our standup"
7. System shows: "Speaker 1: Good morning team, let's start our standup"
8. When someone says "John", you get a personal alert
9. Stop recording to get auto-summary
```

### Example 2: Audio File Processing

```
1. Open audio_processing.html
2. Drag & drop: meeting-recording.wav
3. Set Meeting ID: "client-call-2024-01-15"
4. Select Language: English
5. Click "Process Audio"
6. Wait for transcription and summary
7. Review speaker-formatted results
8. Check key points and action items
```

### Example 3: Profile Setup

```
1. Open profile_settings.html
2. Fill in details:
   - Name: "Sarah Johnson"
   - Role: "Product Manager"
   - Team: "Engineering"
   - Projects: ["Mobile App", "API v2"]
   - Skills: ["Agile", "User Research"]
   - Keywords: ["roadmap", "sprint", "deadline"]
3. Save profile
4. Use other interfaces with personalized alerts
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Microphone Not Working
```
Error: Microphone access denied
```
**Solutions**:
- Grant microphone permissions in browser
- Check browser security settings
- Ensure HTTPS in production
- Test microphone in system settings

#### 2. WebSocket Connection Failed
```
Error: WebSocket connection to 'ws://localhost:8000' failed
```
**Solutions**:
- Verify backend server is running
- Check backend URL configuration
- Disable browser extensions blocking WebSocket
- Check firewall settings

#### 3. Audio Upload Issues
```
Error: File type not supported
```
**Solutions**:
- Use supported formats: MP3, WAV, M4A
- Check file size (max 50MB)
- Ensure file is not corrupted
- Try converting to WAV format

#### 4. Real-time Transcription Lag
```
Issue: Delayed transcription results
```
**Solutions**:
- Check internet connection stability
- Reduce audio quality in settings
- Close other browser tabs
- Restart browser and reconnect

#### 5. Summary Generation Failed
```
Error: Failed to generate summary
```
**Solutions**:
- Ensure backend has valid Groq API key
- Check if transcription completed successfully
- Verify internet connection
- Try with shorter transcription text

### Debug Mode

Enable debug logging in browser console:

```javascript
// Add to any page
localStorage.setItem('debugMode', 'true');

// Check console for detailed logs
console.log('Debug mode enabled');
```

### Performance Optimization

#### For Better Real-time Performance:
- Close unnecessary browser tabs
- Use Chrome or Edge for best WebRTC support
- Ensure stable internet connection
- Use wired microphone for better audio quality

#### For File Processing:
- Convert large files to compressed formats
- Process files in smaller chunks
- Use modern browser with good JavaScript performance

## 📱 Mobile Support

### Mobile Browser Compatibility
- **iOS Safari**: Supported with limitations
- **Android Chrome**: Full support
- **Mobile Firefox**: Basic support

### Mobile-Specific Features
- Touch-optimized interface
- Responsive design
- Mobile microphone access
- Offline capability (limited)

### Mobile Limitations
- Background processing restrictions
- Battery usage considerations
- Limited concurrent audio processing

## 🔒 Security & Privacy

### Data Handling
- Audio processed locally in browser
- No audio data stored permanently
- Profile data stored in browser localStorage
- Session data encrypted in transit

### Privacy Features
- Local-only data storage
- No tracking or analytics
- User-controlled data retention
- Clear data options available

### HTTPS Requirements
For production deployment:
- HTTPS required for microphone access
- Secure WebSocket connections (WSS)
- Certificate validation
- CORS configuration

## 📦 Dependencies

### Core Technologies
- **HTML5**: Modern web standards
- **CSS3**: Responsive styling
- **JavaScript ES6+**: Modern JavaScript features
- **Web Audio API**: Real-time audio processing
- **WebSocket API**: Real-time communication
- **Fetch API**: HTTP requests

### Browser APIs Used
- **MediaDevices**: Microphone access
- **WebRTC**: Real-time communication
- **localStorage**: Data persistence
- **File API**: File upload handling
- **Blob API**: Audio data processing

## 🎨 Customization

### Styling

Modify the CSS variables in each file:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #2ecc71;
  --warning-color: #f39c12;
  --error-color: #e74c3c;
}
```

### Layout

Adjust the responsive breakpoints:

```css
@media (max-width: 768px) {
  .container {
    padding: 20px;
  }
}
```

### Functionality

Add custom features by extending the JavaScript:

```javascript
// Custom alert handler
function handleCustomAlert(data) {
  // Your custom logic here
}

// Custom audio processing
function processCustomAudio(audioData) {
  // Your custom processing here
}
```

## 🤝 Integration

### With Other Systems

The frontend can be integrated with:
- **CRM Systems**: Export meeting data
- **Calendar Apps**: Link with meeting schedules
- **Note-taking Apps**: Export summaries
- **Team Chat**: Share transcriptions

### API Integration

```javascript
// Export data to external systems
async function exportToSystem(data) {
  const response = await fetch('https://your-api.com/meetings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
```

## 📊 Analytics

### Usage Tracking

Monitor frontend usage:

```javascript
// Track user interactions
function trackUsage(action, data) {
  console.log(`Action: ${action}`, data);
  // Send to analytics service
}
```

### Performance Metrics

```javascript
// Measure performance
const startTime = performance.now();
// ... operation ...
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);
```

## 🆘 Support

### Getting Help
1. Check browser console for errors
2. Verify backend connectivity
3. Test with different audio sources
4. Review network tab in developer tools
5. Check microphone permissions

### Reporting Issues
When reporting issues, include:
- Browser version and type
- Error messages from console
- Steps to reproduce
- Audio file details (if applicable)
- Network connectivity status

### Documentation
- **User Guide**: See main README.md
- **API Reference**: Backend documentation
- **Video Tutorials**: Coming soon
- **FAQ**: Check GitHub issues