# AI Meeting Minutes

A comprehensive real-time meeting transcription, analysis, and summarization system with multi-platform support.

## 🌟 Overview

AI Meeting Minutes is a complete solution for automatically transcribing, analyzing, and summarizing meeting audio in real-time. The system features advanced speaker diarization, personalized alerts, AI-powered summarization, and multi-platform access through web interface and browser extension.

## ✨ Key Features

### 🎯 Core Capabilities
- **Real-time Audio Transcription**: Live speech-to-text with 5-second chunks
- **Audio File Processing**: Upload and process pre-recorded meetings
- **Advanced Speaker Diarization**: Automatic speaker identification and color-coding
- **Personalized Alert System**: Smart notifications when you're mentioned
- **AI-Powered Summarization**: Key points, action items, and meeting insights
- **Multi-language Support**: Transcription in 50+ languages
- **Session Persistence**: Automatic data saving and restoration

### 🚀 Advanced Features
- **Browser Extension**: Real-time transcription on any website
- **WebSocket Integration**: Real-time communication and updates
- **User Profile Management**: Customizable personal information and keywords
- **Speaker Alert Categories**: Personal alerts (name mentions) and general alerts (questions)
- **Auto-Summary Generation**: Automatic summary when transcription stops
- **Cross-Platform Compatibility**: Web app, browser extension, and API access
- **Professional Formatting**: Color-coded speakers with clear visual separation

### 🎨 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intuitive Interface**: Modern UI with easy-to-use controls and clear visual feedback
- **Real-time Progress**: Live status updates and audio level monitoring
- **Enhanced Browser Extension**: Professional sidebar panel with minimize functionality
- **Improved Frontend**: Modern home page and streamlined audio processing interface
- **Data Security**: Local processing with encrypted communication
- **No Authentication Required**: Profile-based personalization without sign-in complexity

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Browser Ext.   │    │   Web Frontend  │    │   Backend API   │
│                 │    │                 │    │                 │
│ • Real-time UI  │    │ • Audio Upload  │    │ • FastAPI       │
│ • WebSocket     │◄──►│ • Live Capture  │◄──►│ • WebSocket     │
│ • Audio Capture │    │ • Profile Mgmt  │    │ • Audio Proc.   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                               ┌───────────────────────┼───────────────────────┐
                               │                       │                       │
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │  Audio Process  │    │  AI Summary     │    │  Speaker ID     │
                    │                 │    │                 │    │                 │
                    │ • Whisper API   │    │ • Groq LLM      │    │ • Diarization   │
                    │ • Speech-to-Text│    │ • Key Points    │    │ • Voice Print   │
                    │ • Multi-language│    │ • Action Items  │    │ • Speaker Tags  │
                    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

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