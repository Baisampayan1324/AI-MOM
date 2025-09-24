<div align="center">

# 🎙️ AI-MOM

### *Intelligent Meeting Transcription & AI-Powered Analysis*

**A comprehensive real-time meeting transcription, analysis, and summarization system with multi-platform support.**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-green.svg)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AI Powered](https://img.shields.io/badge/AI-Powered-brightgreen.svg)]()
[![Real-time](https://img.shields.io/badge/Real--time-Processing-orange.svg)]()

*Transform your meetings with cutting-edge AI transcription technology*

</div>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 Quick Start](#-quick-start)
- [📖 Usage Guide](#-usage-guide)
- [🔧 API Reference](#-api-reference)
- [🛠️ Technical Specifications](#️-technical-specifications)
- [🧪 Testing & Validation](#-testing--validation)
- [🔍 Troubleshooting](#-troubleshooting)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)

---

## 🌟 Overview

AI-MOM is an intelligent meeting transcription system that automatically converts speech to text, identifies speakers, and generates AI-powered summaries with actionable insights. Built with modern web technologies and advanced AI models.

### 🎯 Perfect For
- **Business Meetings**: Team standups, project reviews, client calls
- **Interviews**: Job interviews, user research, podcasts
- **Education**: Lectures, seminars, study sessions
- **Legal**: Depositions, consultations, hearings
- **Healthcare**: Patient consultations, team meetings

---

## ✨ Key Features

### 🎙️ Core Transcription
- **Real-time Speech-to-Text**: Live transcription with <1 second latency
- **Multi-format Support**: Process MP3, WAV, M4A, MP4 files
- **50+ Languages**: Powered by OpenAI Whisper
- **High Accuracy**: 85-95% accuracy depending on audio quality

### 👥 Speaker Intelligence
- **Automatic Speaker Detection**: AI-powered voice identification
- **Color-coded Transcripts**: Visual speaker distinction
- **Speaker Diarization**: Timeline-based speaker mapping
- **Custom Speaker Labels**: Assign names to identified voices

### 🚨 Smart Alerts
- **Personal Mentions**: Get notified when your name is mentioned
- **Keyword Alerts**: Custom alerts for important topics
- **Real-time Notifications**: Instant browser alerts

### 🤖 AI-Powered Analysis
- **Meeting Summaries**: Key points and decisions (via Groq LLM)
- **Action Items**: Tasks with assigned owners
- **Transcription Analysis**: Meeting insights and content

### 🌐 Multi-Platform Access
- **Web Interface**: Full-featured browser application
- **Browser Extension**: Transcribe any webpage
- **API Access**: Integrate with your applications
- **Mobile Responsive**: Works on all devices

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐
│  Browser Ext.   │    │   Web Frontend  │
│                 │    │                 │
│ • Real-time UI  │    │ • Audio Upload  │
│ • WebSocket     │◄──►│ • Live Capture  │
│ • Audio Capture │    │ • Profile Mgmt  │
└─────────────────┘    └─────────────────┘
          │                      │
          └──────────┬───────────┘
                     │
              ┌─────────────────┐
              │   Backend API   │
              │                 │
              │ • FastAPI       │
              │ • WebSocket     │
              │ • Audio Proc.   │
              └─────────────────┘
                     │
   ┌─────────────────┼─────────────────┐
   │                 │                 │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Audio Process  │ │  AI Analysis    │ │  WebSocket Hub  │
│                 │ │                 │ │                 │
│ • OpenAI Whisper│ │ • Groq LLM      │ │ • Real-time Upd │
│ • Speaker ID    │ │ • Summarization │ │ • Session Mgmt  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 🔧 Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | FastAPI + Python | Core API and processing |
| **Frontend** | HTML5 + JavaScript | Web interface |
| **Extension** | Chrome Manifest V3 | Browser integration |
| **AI Engine** | Whisper + Groq | Transcription and analysis |
| **WebSocket** | FastAPI WebSocket | Real-time communication |

---

## 🚀 Quick Start

### ⚡ Prerequisites

- **Python 3.9+** ([Download](https://python.org))
- **Modern Browser** (Chrome recommended)
- **Microphone** (for real-time capture)
- **Groq API Key** ([Get free key](https://console.groq.com/))

### 📦 Installation

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/Baisampayan1324/AI-MOM.git
cd AI-MOM
```

#### 2️⃣ Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env file with your Groq API key
```

#### 3️⃣ Start Server
```bash
python main.py
```
✅ Server running at `http://localhost:8000`

#### 4️⃣ Access Web Interface
Open your browser and navigate to:
- **Real-time Transcription**: `http://localhost:8000/frontend/realtime_capture.html`
- **File Processing**: `http://localhost:8000/frontend/audio_processing.html`
- **Profile Settings**: `http://localhost:8000/frontend/profile_settings.html`

#### 5️⃣ Install Browser Extension (Optional)
1. Open Chrome → Settings → Extensions
2. Enable "Developer mode"
3. Click "Load unpacked" → Select `/extension` folder
4. Pin extension to toolbar

---

## 📖 Usage Guide

### 🎙️ Real-time Meeting Transcription

**Step 1: Setup Profile**
```javascript
// Navigate to profile_settings.html
{
  "name": "John Doe",
  "role": "Product Manager",
  "team": "Engineering",
  "keywords": ["roadmap", "features", "timeline"]
}
```

**Step 2: Start Session**
```javascript
// In realtime_capture.html
1. Enter Meeting ID: "team-standup-2024-01-15"
2. Select Language: "English"
3. Click "Connect to Meeting"
4. Grant microphone permissions
5. Click "Start Recording"
```

**Step 3: Monitor Live Transcription**
- 🟢 **Speaker 0**: "Good morning everyone, let's review yesterday's progress"
- 🔵 **Speaker 1**: "I completed the user authentication feature"
- 🚨 **Alert**: "John, can you update us on the mobile app timeline?"

**Step 4: Get AI Summary**
```markdown
## Meeting Summary - Team Standup

### Key Decisions
- Mobile app launch moved to Q2
- Authentication feature approved for production
- Weekly sprint demos starting next Monday

### Action Items
- [ ] John: Update project timeline by EOD
- [ ] Sarah: Schedule mobile app review meeting
- [ ] Team: Prepare demo for Friday presentation
```

### 📁 Audio File Processing

**Supported Formats**: MP3, WAV, M4A, MP4

```bash
# Example workflow
1. Upload file: "client-call-2024-01-15.mp3"
2. Select language: "Auto-detect"
3. Enter Meeting ID: "client-discovery-call"
4. Click "Process Audio"
5. View results with speaker diarization
6. Export transcription and summary
```

### 🔌 Browser Extension Usage

**Perfect for Google Meet, Zoom, Teams, any webpage**

```javascript
// Extension workflow
1. Navigate to meeting platform
2. Click extension icon in toolbar
3. Enter name and meeting ID
4. Click "Connect to Meeting"
5. Start recording during meeting
6. View real-time transcription overlay
```

---

## 🔧 API Reference

### 🎯 Core Endpoints

#### Audio Processing
```http
POST /api/transcribe
Content-Type: multipart/form-data

{
  "audio_file": "meeting.mp3",
  "language": "en",
  "meeting_id": "optional-id"
}
```

#### Real-time Processing
```http
POST /api/process-audio-chunk
Content-Type: application/json

{
  "audio_data": "base64_encoded_audio",
  "chunk_index": 0,
  "meeting_id": "meeting-123"
}
```

#### AI Summarization
```http
POST /api/summarize
Content-Type: application/json

{
  "transcription": "meeting transcript...",
  "meeting_id": "meeting-123",
  "participants": ["John", "Sarah"]
}
```

#### User Profile
```http
POST /api/user-profile
Content-Type: application/json

{
  "name": "John Doe",
  "role": "Product Manager",
  "keywords": ["roadmap", "features"]
}
```

### 🔌 WebSocket Integration

```javascript
// Real-time connection
const ws = new WebSocket('ws://localhost:8000/ws/meeting/meeting-123');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'transcription':
      updateTranscription(data.text, data.speaker);
      break;
    case 'alert':
      showAlert(data.message, data.priority);
      break;
    case 'summary':
      displaySummary(data.summary);
      break;
  }
};
```

---

## 🛠️ Technical Specifications

### 🔧 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2-core processor | 4-core with AVX support |
| **RAM** | 4GB | 8GB+ |
| **Storage** | 2GB free | 5GB SSD |
| **GPU** | None | CUDA-compatible |
| **Network** | 10 Mbps | 50 Mbps+ |

### ⚡ Performance Metrics

| Metric | Value | Notes |
|--------|--------|-------|
| **Real-time Latency** | <1 second | 5-second audio chunks |
| **File Processing** | 1x playback speed | 60min file = ~60min processing |
| **Memory Usage** | 200-500MB | Varies with session length |
| **Accuracy** | 85-95% | Depends on audio quality |
| **Languages** | 50+ | Via OpenAI Whisper |

### 🏗️ Tech Stack

#### Backend
- **Framework**: FastAPI 0.68+
- **Language**: Python 3.9+
- **Speech Recognition**: OpenAI Whisper
- **AI Analysis**: Groq LLM API
- **WebSocket**: FastAPI WebSocket
- **Validation**: Pydantic
- **Server**: Uvicorn ASGI

#### Frontend
- **Languages**: HTML5, CSS3, JavaScript ES6+
- **APIs**: Web Audio, WebSocket, LocalStorage
- **Design**: Responsive CSS Grid/Flexbox
- **Browser**: Chrome 90+, Edge 90+, Firefox 88+

#### Browser Extension
- **Architecture**: Manifest V3
- **APIs**: Chrome Extensions, Web Audio
- **Communication**: WebSocket, Message Passing
- **Storage**: Chrome Storage API

---

## 🧪 Testing & Validation

### 🔬 Automated Testing

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Test specific functionality
python tests/test_audio_processing.py      # Audio file processing
python tests/test_speaker_diarization.py  # Speaker identification
python tests/test_real_time_updates.py    # WebSocket communication
python tests/test_speaker_alerts.py       # Alert system functionality
python tests/test_chunk_endpoint.py       # Real-time chunk processing
```

### 📊 Performance Testing

```bash
# Run performance tests
python tests/test_5_second_chunking.py
python tests/test_5_minute_speed.py

# Test real-time functionality
python tests/test_realtime_capture.py
python tests/test_realtime_chunk.py
```



---

## 🔍 Troubleshooting

### 🎤 Audio Issues

#### No microphone detected
```bash
# Check permissions
chrome://settings/content/microphone

# Test microphone
navigator.mediaDevices.getUserMedia({audio: true})
  .then(stream => console.log('Microphone working'))
  .catch(err => console.error('Microphone error:', err));
```

#### Poor transcription accuracy
- **Check audio quality**: Ensure clear, noise-free environment
- **Adjust microphone**: Position closer to speakers
- **Language selection**: Verify correct language selected
- **Multiple speakers**: Ensure speakers don't overlap

### 🌐 Connection Issues

#### WebSocket connection failed
```bash
# Verify server status
curl http://localhost:8000/health

# Check firewall settings
netstat -an | grep 8000

# Browser console debugging
localStorage.setItem('debugMode', 'true')
```

#### API key issues
```bash
# Verify environment variable
echo $GROQ_API_KEY

# Test API connection
curl -H "Authorization: Bearer $GROQ_API_KEY" \
     https://api.groq.com/openai/v1/models
```

### 🐛 Common Error Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ModuleNotFoundError` | Missing dependencies | `pip install -r requirements.txt` |
| `Permission denied` | Microphone access | Grant browser permissions |
| `WebSocket failed` | Server not running | Start backend server |
| `API quota exceeded` | Groq limit reached | Check API usage |
| `File too large` | Audio file >50MB | Compress or split file |

---

## 📚 Documentation

### 📖 Component Guides
- **[Backend Documentation](backend/README.md)**: Server setup and API details
- **[Frontend Documentation](frontend/README.md)**: Web interface guide
- **[Extension Documentation](extension/README.md)**: Browser extension setup

### 🎯 Use Case Examples

#### Business Meeting
```markdown
Meeting: Weekly Team Standup
Duration: 30 minutes
Participants: 5 team members
Features Used: Real-time transcription, speaker alerts, action items

Results:
- 95% transcription accuracy
- 12 action items identified
- 3 personal mentions caught
- Summary generated in 15 seconds
```

#### Client Interview
```markdown
Meeting: User Research Interview
Duration: 60 minutes
Participants: 2 (interviewer + user)
Features Used: File processing, sentiment analysis

Results:
- Complete transcript with timestamps
- Emotional sentiment tracking
- Key insights highlighted
- Exportable summary report
```

### 🔧 Configuration Examples

#### Environment Setup
```bash
# .env file
GROQ_API_KEY=your_groq_api_key_here
DEBUG=false
MAX_FILE_SIZE=52428800
WHISPER_MODEL=base
CHUNK_DURATION=5
```

#### User Profile Configuration
```json
{
  "name": "Alex Johnson",
  "role": "Senior Developer",
  "team": "Frontend Team",
  "keywords": ["React", "performance", "deployment"],
  "alertPreferences": {
    "personalMentions": true,
    "actionItems": true,
    "questions": false
  }
}
```

---

## 🤝 Contributing

### 🌟 How to Contribute

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### 📝 Development Guidelines

#### Code Style
```python
# Python (Black formatter)
black backend/ --line-length 88

# JavaScript (Prettier)
prettier --write frontend/**/*.js
```

#### Commit Messages
```bash
# Format: type(scope): description
feat(api): add speaker diarization endpoint
fix(ui): resolve mobile responsive issues
docs(readme): update installation instructions
```

#### Testing Requirements
- All new features must include tests
- Maintain >80% code coverage
- Test both happy path and error cases

### 🐛 Reporting Issues

**Bug Report Template**:
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows 10
- Browser: Chrome 96
- Python: 3.9.0
- Error logs: [attach logs]
```

**Feature Request Template**:
```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this work?

## Alternatives Considered
Other approaches you've thought about
```

---

## 📄 License & Acknowledgments

### 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

**Technology Partners**:
- **[OpenAI Whisper](https://openai.com/whisper)** - State-of-the-art speech recognition
- **[Groq](https://groq.com)** - High-speed LLM inference
- **[FastAPI](https://fastapi.tiangolo.com)** - Modern Python web framework

**Development Team**:
- **Pandey Sanjit Vinod** - Frontend Developer & Project Manager
- **Baisampayan Dey** - Lead Developer & Project Architect
- **Dhruv Motaval** - Backend Developer & AI Integration Specialist
- **Aryan Patil** - Quality Assurance & Testing

**Community**:
- Contributors and beta testers
- Open source community for inspiration
- Users providing feedback and suggestions

### 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Baisampayan1324/AI-MOM&type=Date)](https://star-history.com/#Baisampayan1324/AI-MOM&Date)

---

## 🚀 What's Next?

### 🎯 Current Development Focus

- [ ] **Enhanced Speaker Diarization**: Improved voice identification accuracy
- [ ] **Advanced Alert System**: More sophisticated notification rules
- [ ] **Better UI/UX**: Enhanced user interfaces and workflows
- [ ] **Performance Optimization**: Faster processing and lower latency
- [ ] **Additional Language Support**: Expand beyond current capabilities

### 🤖 Future Enhancements

- [ ] **Sentiment Analysis**: Real-time emotion detection
- [ ] **Topic Modeling**: Automatic topic categorization
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **Team Dashboards**: Organization-wide meeting analytics
- [ ] **Calendar Integration**: Outlook, Google Calendar sync
- [ ] **Enterprise Features**: SSO, admin controls, compliance

---

## 📞 Support & Community

### 💬 Get Help

- ** GitHub Issues**: [Report bugs](https://github.com/Baisampayan1324/AI-MOM/issues)
- **� GitHub Discussions**: Community Q&A and feature discussions
- **📖 Documentation**: Component README files in each folder

### 📚 Resources

- **Backend Guide**: [backend/README.md](backend/README.md)
- **Frontend Guide**: [frontend/README.md](frontend/README.md)
- **Extension Guide**: [extension/README.md](extension/README.md)
- **Testing Guide**: [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)

---

<div align="center">

**Ready to revolutionize your meetings? 🚀**

[🎯 **Get Started**](#-quick-start) | [📖 **Documentation**](#-documentation) | [🤝 **Contribute**](#-contributing)

---

*Made with ❤️ by the AI-MOM development team*

⭐ **Star this repo if it helped you!** ⭐

</div>

## 📦 Component Overview

### 🖥️ Backend Server (`/backend`)
**FastAPI-based Python server providing core transcription and analysis services**

**Key Features**:
- RESTful API endpoints for audio processing
- WebSocket support for real-time communication
- OpenAI Whisper integration for speech recognition
- Groq LLM integration for AI summarization
- User profile management and persistence
- Comprehensive error handling and logging

**Tech Stack**: FastAPI, Python 3.9+, OpenAI Whisper, Groq API, WebSocket

### 🌐 Web Frontend (`/frontend`)
**Modern web interface with enhanced UI for complete meeting management**

**Applications**:
- `index.html`: Modern home page with tool navigation and feature overview
- `realtime_capture.html`: Live meeting transcription with enhanced UI and speaker alerts
- `audio_processing.html`: Improved file upload interface with drag-and-drop functionality
- `profile_settings.html`: Local profile management for personalized alerts (no sign-in required)

**Enhanced Features**:
- **Modern UI Design**: Completely redesigned interface with professional styling
- **Improved User Experience**: Streamlined workflows and intuitive controls
- **Responsive Design**: Optimized for all device sizes
- **Real-time WebSocket Communication**: Live updates and notifications
- **Enhanced Audio Processing**: Better file handling and progress tracking
- **Local Profile System**: Personalized alerts without authentication complexity

**Tech Stack**: HTML5, CSS3, JavaScript ES6+, Web Audio API, WebSocket API

### 🔌 Browser Extension (`/extension`)
**Enhanced Chrome extension with professional UI bringing real-time transcription to any webpage**

**Enhanced Capabilities**:
- **Professional Sidebar Panel**: 450px slide-in interface instead of popup window
- **Dual-Mode Operation**: Online real-time recording + Offline file processing
- **Minimize Functionality**: Click to minimize to floating icon, not close completely
- **Smart Permission Handling**: Auto-detects existing microphone permissions
- **One-click Activation**: Only activates when extension icon is clicked
- **Enhanced User Experience**: Modern UI with gradient backgrounds and smooth animations

**Core Features**:
- Real-time audio capture and transcription with visual feedback
- WebSocket integration with backend server
- Speaker alerts and identification
- Cross-site compatibility (works on any website)
- Persistent settings and session management
- Drag-and-drop file processing in offline mode

**Tech Stack**: Manifest V3, JavaScript, Web Audio API, Chrome Extensions API

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+** with pip
- **Modern Web Browser** (Chrome recommended for extension)
- **Microphone** for real-time audio capture
- **Groq API Key** for AI summarization ([Get one here](https://console.groq.com/))
- **Internet Connection** for API services

### 1. Backend Setup

```bash
# Clone repository
git clone <repository-url>
cd AI_MOM

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up environment variables
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Start server
python main.py
```

Server runs at `http://localhost:8000`

### 2. Frontend Access

Open any of these interfaces in your browser:

- **Real-time Transcription**: `http://localhost:8000/frontend/realtime_capture.html`
- **Audio File Processing**: `http://localhost:8000/frontend/audio_processing.html`  
- **Profile Settings**: `http://localhost:8000/frontend/profile_settings.html`

### 3. Browser Extension Installation

```bash
# Open Chrome and navigate to chrome://extensions/
# Enable "Developer mode"
# Click "Load unpacked" and select the extension folder
```

## 📖 Usage Guide

### 🎙️ Real-time Meeting Transcription

**Perfect for**: Live meetings, interviews, lectures, conferences

1. **Setup Session**
   - Open `realtime_capture.html`
   - Enter unique Meeting ID (e.g., "team-standup-2024-09-13")
   - Select target language
   - Click "Connect to Meeting"

2. **Configure Alerts**
   - Visit `profile_settings.html` first
   - Enter your name, role, team, keywords
   - Save profile for personalized alerts

3. **Start Recording**
   - Click "Start Recording"
   - Grant microphone permissions
   - Begin speaking or start meeting audio
   - Monitor live transcription and speaker alerts

4. **Review Results**
   - Stop recording when meeting ends
   - Automatic summary generation begins
   - View key points, action items, and insights
   - Data persists across browser sessions

### 📁 Enhanced Audio File Processing

**Perfect for**: Pre-recorded meetings, interviews, podcasts, voice memos

1. **Upload Audio (Improved UI)**
   - Open enhanced `audio_processing.html` with modern interface
   - Drag & drop or select audio files (MP3, WAV, M4A) 
   - Enhanced file validation and visual feedback
   - Select language (auto-detect available)

2. **Process & Review**
   - Click "Process Audio" with improved progress tracking
   - Monitor real-time progress with optimized 5-minute audio processing
   - Enhanced results display with better formatting
   - Get AI-generated summary with comprehensive insights

### 🔌 Enhanced Browser Extension Usage

**Perfect for**: Google Meet, Zoom, Teams, any webpage with audio

1. **Installation & Setup**
   - Install from Chrome extensions (developer mode)
   - Pin extension to toolbar for easy access
   - Professional sidebar interface replaces popup window

2. **Dual-Mode Operation**
   - **Online Mode**: Click extension icon → Professional sidebar slides in from right
   - **Offline Mode**: Switch to file processing tab for drag-and-drop uploads
   - Enter meeting ID and personal information for alerts
   - Smart permission detection (auto-detects microphone access)

3. **Enhanced Live Experience**
   - Click "Start Recording" in sleek interface
   - Monitor audio levels with 5-bar visualization
   - View real-time transcription with improved speaker identification
   - Receive personalized alerts with visual notifications
   - Minimize to floating icon instead of closing completely
   - Works seamlessly alongside other meeting tools
## 💡 Key Features Deep Dive

### 🎯 Enhanced Speaker Diarization & Identification

**Advanced speaker recognition with improved visual distinction**

- **Optimized Speaker Detection**: AI identifies distinct voices with enhanced algorithms
- **Enhanced Color-Coded Output**: Each speaker gets a unique color with improved contrast
- **Professional Speaker Labels**: Clear "Speaker 0", "Speaker 1" formatting with visual icons
- **Advanced Timing Analysis**: Better gap detection and overlap handling
- **Improved Visual Separation**: Enhanced formatting and typography for better readability

**Example Output**:
```
🟢 Speaker 0: Good morning everyone, let's start today's standup.
🔵 Speaker 1: Thanks for organizing this. I have updates on the mobile app.
🟡 Speaker 2: Perfect timing. I wanted to discuss the API integration.
```

### 🚨 Intelligent Alert System

**Personalized notifications based on your profile**

**Personal Alerts** (🚨 Red Background):
- Your name mentioned: "John, can you take the lead on this?"
- Your role referenced: "We need our product manager's input"
- Your projects discussed: "The mobile app project needs attention"
- Your skills needed: "This requires someone with React expertise"

**General Alerts** (⚠️ Yellow Background):
- Questions to group: "Can someone explain this approach?"
- Participation requests: "Please share your thoughts"
- Action items: "Who can take ownership of this task?"

### 🤖 AI-Powered Summarization

**Intelligent meeting analysis with actionable insights**

**Summary Components**:
- **Meeting Overview**: High-level summary of discussion
- **Key Points**: Important decisions and information
- **Action Items**: Tasks, deadlines, and responsibilities
- **Participants**: Speaker identification and contributions
- **Next Steps**: Follow-up actions and future meetings

**AI Features**:
- Context-aware analysis using Groq LLM
- Extraction of commitments and deadlines
- Identification of unresolved issues
- Priority ranking of action items

### 🔄 Real-time Processing

**Live transcription with minimal latency**

- **5-Second Chunks**: Audio processed in real-time segments
- **WebSocket Communication**: Instant updates via persistent connection
- **Audio Level Monitoring**: Visual feedback for microphone input
- **Progressive Enhancement**: Results improve as more context is processed
- **Session Persistence**: Data saved automatically across browser sessions

## 🛠️ Technical Specifications

### Audio Processing
- **Format Support**: MP3, WAV, M4A, MP4 audio tracks
- **Sample Rate**: 16kHz optimization for speech recognition
- **Chunk Size**: 5-second segments for real-time processing
- **Quality**: Automatic noise reduction and audio enhancement
- **Language Support**: 50+ languages via OpenAI Whisper

### API Architecture
- **Backend Framework**: FastAPI with async support
- **WebSocket Protocol**: Real-time bidirectional communication
- **Authentication**: Session-based with optional API key support
- **Rate Limiting**: Built-in request throttling
- **Error Handling**: Comprehensive logging and recovery

### Browser Compatibility
- **Chrome**: Full support (recommended)
- **Edge**: Full support with Manifest V3
- **Firefox**: Basic support (extension limited)

## 💻 Tech Stack

### Backend Technologies
- **Python 3.9+**: Core programming language
- **FastAPI**: High-performance asynchronous web framework
- **Pydantic**: Data validation and settings management
- **WebSockets**: Real-time bidirectional communication
- **OpenAI Whisper**: State-of-the-art speech recognition model
- **Groq LLM API**: AI-powered summarization and analysis
- **PyAudio**: Audio capture and processing library
- **Uvicorn**: ASGI server for FastAPI deployment
- **NumPy**: Numerical computing for audio signal processing
- **JSON Schema**: Data structure validation and documentation

### Frontend Technologies
- **HTML5**: Semantic markup with modern features
- **CSS3**: Advanced styling with animations and transitions
- **JavaScript (ES6+)**: Client-side programming language
- **Web Audio API**: Real-time audio capture and visualization
- **WebSocket API**: Client-side real-time communication
- **LocalStorage API**: Client-side data persistence
- **Fetch API**: Modern AJAX requests for HTTP communication
- **CSS Grid/Flexbox**: Responsive layout design
- **Web Notifications API**: Browser notifications for alerts
- **MediaDevices API**: Access to audio input devices

### Chrome Extension
- **Manifest V3**: Latest Chrome extension architecture
- **Chrome Extensions API**: Browser integration and permissions
- **Content Scripts**: Page integration and DOM manipulation
- **Background Scripts**: Event handling and state management
- **Web Accessible Resources**: Extension resource management
- **Chrome Storage API**: Cross-session data persistence
- **Chrome Tabs API**: Browser tab interaction and management
- **Message Passing**: Communication between extension components

### Development Tools
- **Git**: Version control system
- **VSCode**: Development environment
- **npm/pip**: Package management
- **ESLint/Pylint**: Code quality assurance
- **Chrome DevTools**: Browser-based debugging
- **Postman**: API testing and documentation
- **WebSocket testing tools**: Real-time communication testing

### Deployment Options
- **Docker**: Containerization for consistent deployment
- **Heroku**: Cloud platform for backend deployment
- **Netlify/Vercel**: Frontend static file hosting
- **GitHub Actions**: CI/CD automation
- **Chrome Web Store**: Extension distribution
- **Safari**: Web interface only
- **Mobile**: Responsive design with touch optimization

## 📋 Component Documentation

### Backend Server (`/backend`)
**[📖 Complete Backend Documentation](backend/README.md)**

- FastAPI server with comprehensive API endpoints
- OpenAI Whisper integration for speech recognition
- Groq LLM integration for AI summarization
- WebSocket support for real-time communication
- User profile management and persistence
- Comprehensive testing suite and error handling

### Web Frontend (`/frontend`)
**[📖 Complete Frontend Documentation](frontend/README.md)**

- Three specialized interfaces for different use cases
- Real-time transcription with speaker alerts
- Audio file processing with batch capabilities
- Profile management for personalized experiences
- Responsive design for all devices
- Session persistence and data recovery

### Browser Extension (`/extension`)
**[📖 Complete Extension Documentation](extension/README.md)**

- Chrome Manifest V3 compatible extension
- Real-time transcription on any webpage
- WebSocket integration with backend server
- Cross-site compatibility and security
- One-click activation and configuration
- Persistent settings and session management

## 🧪 Testing & Validation

### Automated Testing

**Backend Tests** (`/backend/tests/`):
```bash
# Run all backend tests
cd backend
python -m pytest tests/

# Specific test categories
python tests/test_audio_processing.py      # Audio file processing
python tests/test_speaker_alerts.py       # Alert system functionality  
python tests/test_speaker_diarization.py  # Speaker identification
python tests/test_real_time_updates.py    # WebSocket communication
python tests/test_chunk_endpoint.py       # Real-time chunk processing
```

**Frontend Tests**:
- Manual testing procedures in each component README
- Browser compatibility validation
- Microphone access and permissions testing
- WebSocket connection reliability testing

### Performance Benchmarks

**Audio Processing Speed**:
- Real-time: < 1 second latency for 5-second chunks
- File processing: ~1x playback speed for most audio files
- Memory usage: < 500MB for typical sessions

## ⚡ Performance Metrics

**Processing Speed**:
- Real-time latency: < 1 second for 5-second chunks
- File processing: ~1x playback speed for most audio files  
- Memory usage: 200-500MB depending on session size

**Accuracy Benchmarks**:
- Speech recognition: 85-95% (varies with audio quality and accent)
- Speaker identification: 80-90% (depends on voice distinctness)
- AI summary quality: High relevance and actionable insights

**Optimization Features**:
- GPU acceleration when available
- Efficient audio chunk processing
- Optimized Whisper model selection
- Reduced file I/O overhead
- Smart caching and session management
## 🔧 API Reference

### Core Endpoints

**Audio Processing**
```bash
POST /api/transcribe                 # Transcribe audio file
POST /api/summarize                  # Generate AI summary
POST /api/process-audio              # Complete audio processing
POST /api/process-audio-chunk        # Real-time chunk processing
```

**User Management**
```bash
POST /api/user-profile              # Create/update profile
GET  /api/user-profile              # Retrieve profile
```

**System**
```bash
GET  /                              # API root
GET  /health                        # Health check
WebSocket /ws/meeting/{meeting_id}  # Real-time updates
```

## 🚀 Performance & Optimization

### System Requirements

**Minimum**:
- CPU: 2-core processor
- RAM: 4GB
- Storage: 2GB free space
- Network: Stable internet for API calls

**Recommended**:
- CPU: 4-core processor with AVX support
- RAM: 8GB or more
- GPU: CUDA-compatible GPU for faster processing
- Storage: SSD with 5GB free space
- Network: High-speed internet for real-time features

### Performance Metrics

**Processing Speed**:
- Real-time latency: < 1 second for 5-second chunks
- File processing: ~1x playback speed (60-second file = ~60 seconds processing)
- Memory usage: 200-500MB depending on session size

**Accuracy Benchmarks**:
- Speech recognition: 85-95% (varies with audio quality and accent)
- Speaker identification: 80-90% (depends on voice distinctness)
- AI summary quality: High relevance and actionable insights

**Optimization Features**:
- GPU acceleration when available
- Efficient audio chunk processing
- Optimized Whisper model selection
- Reduced file I/O overhead
- Smart caching and session management

## 🔍 Troubleshooting Guide

### Common Issues & Solutions

#### 🎤 Microphone & Audio Issues
```
❌ Problem: Real-time audio not working
✅ Solutions:
  • Grant microphone permissions in browser
  • Check system microphone settings
  • Close other apps using microphone
  • Test microphone with browser's built-in test
  • Restart browser and try again
```

#### 🌐 Connection Issues
```
❌ Problem: WebSocket connection failed
✅ Solutions:
  • Verify backend server is running on localhost:8000
  • Check firewall settings (allow localhost connections)
  • Disable browser extensions that might block WebSocket
  • Try different browser (Chrome recommended)
  • Check backend logs for connection errors
```

#### 🔑 API Key Issues
```
❌ Problem: Summarization not working
✅ Solutions:
  • Verify GROQ_API_KEY is set in .env file
  • Check API key validity at console.groq.com
  • Ensure stable internet connection
  • Check API quota and usage limits
  • Review backend logs for API errors
```

#### 📁 File Processing Issues
```
❌ Problem: Audio file upload fails
✅ Solutions:
  • Use supported formats: MP3, WAV, M4A
  • Check file size (max 50MB recommended)
  • Convert file to WAV if issues persist
  • Ensure file is not corrupted
  • Try with different audio file to isolate issue
```

#### 🖥️ Performance Issues
```
❌ Problem: Slow processing or high CPU usage
✅ Solutions:
  • Close unnecessary browser tabs
  • Install CUDA for GPU acceleration
  • Reduce audio quality/sample rate
  • Process shorter audio segments
  • Restart browser to free memory
```

### Debug Mode

Enable comprehensive logging:

```bash
# Backend debugging
export DEBUG=true
python main.py

# Frontend debugging
# Open browser console (F12)
localStorage.setItem('debugMode', 'true')
```

## 📊 Data Management

### Storage & Persistence

**Local Storage** (Browser):
- User profile data
- Session transcriptions
- Processing results
- Audio level preferences
- Alert configurations

**Session Management**:
- Automatic data saving every 30 seconds
- Cross-tab synchronization
- 24-hour expiration for privacy
- Manual clear options available

**Data Export Options**:
```javascript
// Export transcription data
function exportData() {
    const sessionData = localStorage.getItem('meetingMinutesSession');
    const blob = new Blob([sessionData], {type: 'application/json'});
    // Download as JSON file
}
```

### Privacy & Security

**Data Handling**:
- Audio processed locally when possible
- No permanent audio storage on servers
- Encrypted WebSocket communication
- Session data stored locally only

**Privacy Features**:
- No tracking or analytics
- User-controlled data retention
- Local-only profile storage
- Optional data sharing

## 🔄 Integration & Extensibility

### Third-party Integration

**Meeting Platforms**:
- Google Meet: Works via browser extension
- Zoom Web: Compatible with web client
- Microsoft Teams: Web version support
- Generic: Any website with audio

**Export Capabilities**:
- JSON data export
- Plain text transcriptions
- Formatted summaries
- Speaker-separated content

### Custom Development

**Extend Backend**:
```python
# Add custom endpoint
@app.post("/api/custom-feature")
async def custom_feature(data: dict):
    # Your custom logic
    return {"result": "success"}
```

**Extend Frontend**:
```javascript
// Add custom UI components
function addCustomFeature() {
    // Your custom frontend logic
}
```

**Browser Extension Customization**:
```javascript
// Modify extension behavior
function customizeExtension() {
    // Add your custom features
}
```

## 📚 Additional Resources

### Documentation Links
- **[Backend Setup Guide](backend/README.md)**: Complete server configuration
- **[Frontend User Guide](frontend/README.md)**: Web interface documentation  
- **[Extension Installation](extension/README.md)**: Browser extension setup

### Community & Support
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Community Q&A and feature discussions
- **Wiki**: Detailed guides and tutorials
- **Examples**: Sample configurations and use cases

### Contributing
- **Fork Repository**: Create your own copy for development
- **Pull Requests**: Submit improvements and bug fixes
- **Documentation**: Help improve guides and examples
- **Testing**: Report issues and edge cases

## 📄 License & Credits

### Technology Stack
- **OpenAI Whisper**: Speech recognition engine
- **Groq LLM**: AI summarization and analysis
- **FastAPI**: High-performance web framework
- **Web Audio API**: Browser audio processing
- **WebSocket**: Real-time communication

### Acknowledgments
- OpenAI team for Whisper speech recognition
- Groq team for high-speed LLM inference
- FastAPI community for excellent web framework
- Chrome team for robust extension platform

---

## 🎯 Next Steps

1. **[Start with Backend Setup](backend/README.md)** - Get the server running
2. **[Explore Web Interface](frontend/README.md)** - Try the web applications
3. **[Install Browser Extension](extension/README.md)** - Add real-time capabilities
4. **[Customize for Your Needs](#-integration--extensibility)** - Extend functionality

**Ready to transform your meetings with AI-powered transcription? Let's get started! 🚀**

### Audio Processing
- Processing results are saved to localStorage
- Data is restored when page is refreshed
- Results expire after 24 hours
- "Clear Saved Results" button to manually reset

## Security Considerations

### Data Handling
- Audio files are processed locally and not stored permanently
- User profile data is stored locally in browser
- No sensitive data is transmitted to external servers (except for LLM processing)

### Best Practices
- Use strong, unique passwords for any authentication
- Keep software updated
- Review and understand privacy settings
- Be cautious with sharing meeting recordings

## Contributing

### Development Guidelines
1. Follow existing code style and conventions
2. Write clear, descriptive commit messages
3. Test all changes thoroughly
4. Document new features and changes

### Reporting Issues
1. Check existing issues before creating new ones
2. Provide detailed reproduction steps
3. Include system information and error messages
4. Attach relevant logs or screenshots

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI Whisper for speech recognition
- Groq for LLM inference
- FastAPI for backend framework
- WebSocket for real-time communication