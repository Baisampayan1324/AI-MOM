# AI MOM - Frontend


> A modern React-based web application for real-time meeting transcription, speaker identification, and AI-powered summarization.A modern web interface for real-time meeting transcription, speaker alerts, and AI-powered summarization.



[![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react)](https://react.dev)## 🌟 Features

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)

[![Vite](https://img.shields.io/badge/Vite-5.4.19-646cff?logo=vite)](https://vitejs.dev)- **Real-time Audio Capture** with live transcription

[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?logo=tailwindcss)](https://tailwindcss.com)- **Audio File Processing** for pre-recorded meetings

- **Speaker Alerts** for personalized notifications

---- **Auto-Summary Generation** with key points and action items

- **Speaker Diarization** with visual speaker identification

## 📋 Table of Contents- **User Profile Management** for customized experiences

- **Session Persistence** with automatic data saving

- [Overview](#overview)- **Responsive Design** optimized for all devices

- [Features](#features)

- [Technology Stack](#technology-stack)## 📋 Prerequisites

- [Project Structure](#project-structure)

- [Quick Start](#quick-start)Before using the frontend, ensure you have:

- [Development](#development)

- [Building](#building)- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

- [Backend Integration](#backend-integration)- **Microphone Access** (for real-time transcription)

- [Troubleshooting](#troubleshooting)- **Backend Server Running** on `http://localhost:8000`

- **HTTPS** (required for microphone access in production)

---

## 🚀 Quick Start

## 🌟 Overview

### 1. Start Backend Server

The AI Meeting Minutes frontend is a sophisticated React application that provides an intuitive interface for:

First, ensure the backend is running:

- **Real-time Audio Capture** with live transcription

- **Audio File Processing** for pre-recorded meetings```bash

- **Speaker Diarization** with visual identificationcd backend

- **AI-Powered Summarization** with key points and action itemspython main.py

- **User Profile Management** for personalized alerts```



This application integrates seamlessly with the FastAPI backend to deliver a complete meeting management solution.Server should be accessible at `http://localhost:8000`



---### 2. Open Frontend



## ✨ FeaturesSimply open any of the HTML files in your web browser:



### 🎙️ Real-time Capture```bash

- Live audio recording with microphone access# For real-time transcription

- Real-time transcription streaming via WebSocketopen frontend/realtime_capture.html

- Speaker identification with color coding

- Live audio visualization# For audio file processing

- Automatic session managementopen frontend/audio_processing.html

- Real-time keyword alerts

# For profile settings

### 📁 File Processingopen frontend/profile_settings.html

- Drag & drop audio file upload (MP3, WAV, M4A)```

- Progress tracking with visual indicators

- Speaker-formatted transcriptionOr access via the backend server:

- Automatic AI summary generation- `http://localhost:8000/frontend/realtime_capture.html`

- Export transcripts and summaries- `http://localhost:8000/frontend/audio_processing.html`

- `http://localhost:8000/frontend/profile_settings.html`

### 🤖 AI-Powered Summaries

- Automatic key point extraction## 📱 Application Interfaces

- Action item identification

- Meeting highlights### 1. Real-time Audio Capture (`realtime_capture.html`)

- Contextual summarization using Groq LLM

**Purpose**: Live meeting transcription with real-time speaker alerts

### 👤 Profile Settings

- User profile management**Key Features**:

- Custom alert keywords- Live audio capture and transcription

- Notification preferences- Real-time speaker identification

- Language settings- Personalized speaker alerts

- Automatic summary generation

### 🎨 User Experience- Session data persistence

- Modern gradient-based UI

- Fully responsive (mobile-first)**Usage**:

- Smooth animations1. Enter meeting ID and select language

- Toast notifications2. Click "Connect to Meeting"

- Accessible components (WCAG 2.1)3. Click "Start Recording"

4. Speak into microphone

---5. View live transcription and alerts

6. Stop recording to generate summary

## 🛠 Technology Stack

### 2. Audio File Processing (`audio_processing.html`)

| Technology | Version | Purpose |

|------------|---------|---------|**Purpose**: Process pre-recorded audio files

| **React** | 18.3.1 | UI framework |

| **TypeScript** | 5.8.3 | Type safety |**Key Features**:

| **Vite** | 5.4.19 | Build tool |- Upload audio files (MP3, WAV, M4A)

| **Tailwind CSS** | 3.4.17 | Styling |- Batch transcription processing

| **React Router** | 6.30.1 | Routing |- Speaker-formatted output

| **Shadcn UI** | Latest | UI components (40+) |- AI-powered summarization

| **TanStack Query** | 5.83.0 | Server state |- Progress tracking

| **React Hook Form** | 7.61.1 | Form management |

| **Zod** | 3.25.76 | Validation |**Usage**:

| **Sonner** | 1.7.4 | Notifications |1. Click "Choose File" or drag & drop audio

2. Enter meeting ID (optional)

---3. Select language (optional)

4. Click "Process Audio"

## 📁 Project Structure5. View transcription and summary results



```### 3. Profile Settings (`profile_settings.html`)

frontend/

├── src/                          # Source code**Purpose**: Customize personal information for targeted alerts

│   ├── components/              # React components

│   │   ├── ui/                 # Shadcn UI (40+ components)**Key Features**:

│   │   ├── AudioVisualizer.tsx- Personal information management

│   │   ├── Navigation.tsx- Custom keyword tracking

│   │   ├── SummaryDisplay.tsx- Alert preferences

│   │   └── TranscriptDisplay.tsx- Data persistence

│   ├── pages/                   # Application pages

│   │   ├── Index.tsx           # Landing page**Usage**:

│   │   ├── RealtimeCapture.tsx1. Fill in personal details:

│   │   ├── FileProcessing.tsx   - Full name

│   │   ├── ProfileSettings.tsx   - Role/title

│   │   └── NotFound.tsx   - Team/department

│   ├── hooks/                   # Custom hooks   - Projects

│   ├── lib/                     # Utilities   - Skills

│   ├── App.tsx                  # Main app   - Custom keywords

│   └── main.tsx                 # Entry point2. Click "Save Profile"

│3. Data is automatically used in other interfaces

├── public/                       # Static assets

├── tests/                        # Test utilities## ⚙️ Configuration

├── standalone/                   # Legacy HTML apps

├── index.html                    # Vite entry### Backend Connection

├── package.json

├── vite.config.ts               # Vite configIf your backend runs on a different host/port, update the configuration:

└── tailwind.config.ts           # Tailwind config

``````javascript

// In each HTML file, update the backendUrl

---const backendUrl = "http://your-backend-host:port";

```

## 🚀 Quick Start

### Audio Settings

### 1. Install Dependencies

Modify audio capture settings in `realtime_capture.html`:

```bash

cd frontend```javascript

npm install// Audio processing configuration

```const CHUNK_SIZE = 16384;      // Audio buffer size

const SAMPLE_RATE = 16000;     // Audio sample rate

### 2. Start Backend Serverconst CHUNK_DURATION = 5;      // Seconds per chunk

```

In a separate terminal:

### Real-time Settings

```bash

cd backendAdjust real-time transcription behavior:

python main.py

``````javascript

// Speaker detection settings

Backend runs at: `http://localhost:8000`const SPEAKER_CHANGE_THRESHOLD = 8000;  // ms between speakers

const MAX_SESSION_ENTRIES = 10;         // Max transcription entries

### 3. Start Development Serverconst ALERT_KEYWORDS = ['question', 'please', 'can you'];

```

```bash

npm run dev## 🎨 User Interface Guide

```

### Real-time Transcription Interface

Frontend runs at: `http://localhost:8080`

#### Control Panel

### 4. Open in Browser- **Meeting ID**: Unique identifier for the session

- **Language**: Target language for transcription

Navigate to: **http://localhost:8080**- **Connect Button**: Establishes WebSocket connection

- **Record Button**: Starts/stops audio capture

---

#### Live Display Areas

## 💻 Development- **Real-time Transcription**: Shows live speech-to-text results

- **Speaker Alerts**: Notifications when you're mentioned

### Available Scripts- **Transcription History**: Complete session history

- **Audio Level**: Visual microphone input indicator

| Command | Description |

|---------|-------------|#### Summary Section (Auto-generated)

| `npm run dev` | Start dev server (port 8080) |- **Meeting Summary**: AI-generated overview

| `npm run build` | Build for production |- **Key Points**: Important discussion points

| `npm run preview` | Preview production build |- **Action Items**: Tasks and next steps

| `npm run lint` | Run ESLint |

### Audio Processing Interface

### Backend Proxy

#### Upload Section

Vite automatically proxies API requests:- **File Selector**: Choose audio files

- **Drag & Drop**: Alternative upload method

```typescript- **Progress Bar**: Shows processing status

// vite.config.ts

proxy: {#### Results Display

  '/api': 'http://localhost:8000',  // API requests- **Transcription**: Color-coded speaker text

  '/ws': 'ws://localhost:8000',     // WebSocket- **Speaker-Formatted**: Organized by speaker

}- **Summary**: AI-generated insights

```- **Key Points**: Extracted highlights

- **Action Items**: Identified tasks

---

### Profile Settings Interface

## 🏗️ Building

#### Personal Information

### Production Build- **Name**: Your full name for alerts

- **Role**: Job title or position

```bash- **Team**: Department or team name

npm run build- **Contact**: Email and phone (optional)

```

#### Professional Details

Output in `dist/` folder. Deploy to:- **Projects**: Current projects for context

- Backend static folder- **Skills**: Your expertise areas

- Nginx/Apache- **Keywords**: Custom terms to track

- Vercel/Netlify

- AWS S3 + CloudFront#### Alert Preferences

- **Notification Types**: Choose alert categories

### Preview Build- **Sensitivity**: Adjust alert frequency

- **Display Options**: Customize alert appearance

```bash

npm run preview## 🔧 Advanced Features

```

### Session Data Persistence

---

The frontend automatically saves and restores:

## 🔌 Backend Integration- Meeting transcriptions

- User profile data

### API Endpoints- Processing results

- Session preferences

#### Health Check

```http**Storage Locations**:

GET /health```javascript

```// Data stored in browser localStorage

localStorage.setItem('meetingMinutesSession', data);

#### TranscriptionlocalStorage.setItem('userProfile', profile);

```httplocalStorage.setItem('audioProcessingResults', results);

POST /api/transcribe```

Content-Type: multipart/form-data

```**Manual Data Management**:

- "Clear Session Data" button resets current session

#### Full Processing- "Clear Saved Results" button removes stored data

```http- Data automatically expires after 24 hours

POST /api/process-audio

Content-Type: multipart/form-data### Real-time Features

```

#### WebSocket Communication

#### Summarization```javascript

```http// Connection to backend

POST /api/summarizeconst socket = new WebSocket(`ws://localhost:8000/ws/meeting/${meetingId}`);

Content-Type: application/json

```// Message handling

socket.onmessage = function(event) {

#### Profile  const data = JSON.parse(event.data);

```http  handleRealTimeUpdate(data);

GET/POST/PUT/DELETE /api/profile};

``````



### WebSocket#### Audio Processing

```javascript

```javascript// Web Audio API integration

const ws = new WebSocket('ws://localhost:8000/ws/meeting-123');navigator.mediaDevices.getUserMedia({ audio: true })

  .then(stream => {

ws.onmessage = (event) => {    // Process audio stream

  const data = JSON.parse(event.data);    setupAudioProcessing(stream);

  // Handle transcript, summary, alert  });

};```

```

### Speaker Alert System

---

#### Alert Types

## 🐛 Troubleshooting- **Personal Alerts** 🚨: Your name mentioned

- **General Alerts** ⚠️: Questions or keywords

### Port Already in Use

#### Trigger Patterns

```bash```javascript

# Use different port// Personal triggers

PORT=3000 npm run devconst personalTriggers = [userName, userRole, userTeam];



# Or kill process (Windows)// General triggers

netstat -ano | findstr :8080const generalTriggers = ['can you', 'please', 'question', 'thoughts'];

taskkill /PID <PID> /F```

```

#### Custom Keywords

### Backend Connection FailedAdd custom keywords in profile settings for specialized alerts.



Check:## 🎯 Usage Examples

- ✅ Backend running: `http://localhost:8000/health`

- ✅ CORS enabled### Example 1: Team Meeting

- ✅ Firewall settings

- ✅ Proxy config in `vite.config.ts````

1. Open realtime_capture.html

### Dependencies Issue2. Set Meeting ID: "team-standup-2024-01-15"

3. Enter your name: "John Doe"

```bash4. Click "Connect to Meeting"

# Clear and reinstall5. Start recording

npm cache clean --force6. Speak: "Good morning team, let's start our standup"

rm -rf node_modules package-lock.json7. System shows: "Speaker 1: Good morning team, let's start our standup"

npm install8. When someone says "John", you get a personal alert

```9. Stop recording to get auto-summary

```

### Microphone Access Denied

### Example 2: Audio File Processing

- Check browser permissions

- Use HTTPS in production```

- Check browser console for errors1. Open audio_processing.html

2. Drag & drop: meeting-recording.wav

---3. Set Meeting ID: "client-call-2024-01-15"

4. Select Language: English

## 📚 Additional Resources5. Click "Process Audio"

6. Wait for transcription and summary

### Documentation7. Review speaker-formatted results

- [React Docs](https://react.dev)8. Check key points and action items

- [Vite Guide](https://vitejs.dev/guide/)```

- [Tailwind CSS](https://tailwindcss.com/docs)

- [Shadcn UI](https://ui.shadcn.com)### Example 3: Profile Setup



### Project Docs```

- `SETUP.md` - Setup instructions1. Open profile_settings.html

- `PROJECT_STRUCTURE.md` - Architecture2. Fill in details:

- `backend/README.md` - Backend docs   - Name: "Sarah Johnson"

   - Role: "Product Manager"

---   - Team: "Engineering"

   - Projects: ["Mobile App", "API v2"]

## 🎯 Quick Reference   - Skills: ["Agile", "User Research"]

   - Keywords: ["roadmap", "sprint", "deadline"]

### Start Development3. Save profile

```bash4. Use other interfaces with personalized alerts

cd frontend```

npm install

npm run dev## 🔍 Troubleshooting

```

### Common Issues

### Build Production

```bash#### 1. Microphone Not Working

npm run build```

```Error: Microphone access denied

```

### Key URLs**Solutions**:

- **Frontend**: http://localhost:8080- Grant microphone permissions in browser

- **Backend**: http://localhost:8000- Check browser security settings

- **API Docs**: http://localhost:8000/docs- Ensure HTTPS in production

- Test microphone in system settings

---

#### 2. WebSocket Connection Failed

**Made with ❤️ using React, TypeScript, and Vite**```

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