# AI Meeting Minutes - Backend API

A FastAPI-based backend service for real-time audio transcription, speaker diarization, and AI-powered meeting summarization.

## 🚀 Features

- **Real-time Audio Transcription** using OpenAI Whisper
- **Speaker Diarization** for identifying different speakers
- **AI-Powered Summarization** using Groq LLM
- **WebSocket Support** for real-time communication
- **Speaker Alerts** for personalized notifications
- **User Profile Management** for customized experiences
- **Multi-language Support** for global accessibility

## 📋 Prerequisites

Before setting up the backend, ensure you have:

- **Python 3.8 or higher**
- **pip** (Python package installer)
- **Virtual environment** (venv or conda)
- **Groq API Key** (for AI summarization)
- **Microphone access** (for real-time features)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI_MOM/backend
```

### 2. Create Virtual Environment

```bash
# Using venv
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Server Configuration
HOST=localhost
PORT=8000

# Audio Processing
WHISPER_MODEL=base
USE_GPU=true

# WebSocket Configuration
WS_MAX_CONNECTIONS=100

# Logging
LOG_LEVEL=INFO
```

### 5. Get Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Create a new API key
4. Copy the key to your `.env` file

### 6. Start the Server

```bash
python main.py
```

The server will start on `http://localhost:8000`

## 🖥️ Server Status

Once running, you can verify the server status:

- **Health Check**: `GET http://localhost:8000/health`
- **API Documentation**: `http://localhost:8000/docs`
- **WebSocket Test**: `ws://localhost:8000/ws/meeting/test`

## 📚 API Documentation

### Core Endpoints

#### Audio Processing

```http
POST /api/transcribe
Content-Type: multipart/form-data

Parameters:
- file: Audio file (MP3, WAV, M4A)
- language: Optional language code (e.g., "en", "es")

Response:
{
  "text": "Transcribed text...",
  "language": "en",
  "speakers": [
    {
      "speaker": "Speaker 0",
      "text": "Hello everyone...",
      "start": 0.0,
      "end": 3.5
    }
  ]
}
```

```http
POST /api/process-audio-chunk
Content-Type: multipart/form-data

Parameters:
- audio_chunk: Raw PCM audio data
- meeting_id: Meeting identifier

Response:
{
  "type": "transcription",
  "data": {
    "text": "Real-time transcription...",
    "timestamp": 1634567890.123
  }
}
```

#### Summarization

```http
POST /api/summarize
Content-Type: application/json

Body:
{
  "text": "Meeting transcript...",
  "meeting_id": "meeting_123"
}

Response:
{
  "summary": "Meeting summary...",
  "key_points": [
    "Key point 1",
    "Key point 2"
  ],
  "action_items": [
    "Action item 1",
    "Action item 2"
  ]
}
```

#### User Profile

```http
POST /api/user-profile
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "role": "Product Manager",
  "team": "Engineering",
  "projects": ["Project A", "Project B"],
  "skills": ["Python", "Leadership"],
  "keywords": ["budget", "deadline"]
}

Response:
{
  "message": "Profile saved successfully",
  "profile": { ... }
}
```

```http
GET /api/user-profile

Response:
{
  "name": "John Doe",
  "role": "Product Manager",
  // ... other profile data
}
```

### WebSocket Communication

#### Connection

```javascript
const socket = new WebSocket('ws://localhost:8000/ws/meeting/meeting_123');

socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

#### Message Types

**Transcription Updates:**
```json
{
  "type": "transcription",
  "data": {
    "text": "Live transcribed text...",
    "timestamp": 1634567890.123,
    "speaker": "Speaker 1"
  }
}
```

**Speaker Alerts:**
```json
{
  "type": "speaker_alert",
  "alert_type": "personal",
  "message": "Speaker mentioned: John - This may be directed at you!",
  "suggested_response": "Prepare to respond...",
  "matched_keywords": ["john"],
  "timestamp": 1634567890.123
}
```

**Summary Updates:**
```json
{
  "type": "summary",
  "data": {
    "summary": "Generated summary...",
    "key_points": ["Point 1", "Point 2"],
    "action_items": ["Item 1", "Item 2"]
  }
}
```

## 🔧 Configuration Options

### Audio Processing

Edit `app/config.py` to modify audio settings:

```python
# Whisper Model Options
WHISPER_MODEL = "base"  # tiny, base, small, medium, large
USE_GPU = True          # Enable GPU acceleration
AUDIO_SAMPLE_RATE = 16000
CHUNK_DURATION = 5      # Seconds

# Speaker Diarization
SPEAKER_CHANGE_THRESHOLD = 8.0  # Seconds
MAX_SPEAKERS = 6
```

### Performance Tuning

For better performance:

```python
# High Performance Setup
WHISPER_MODEL = "base"    # Balance of speed and accuracy
USE_GPU = True           # Requires CUDA
BATCH_SIZE = 16          # Increase for GPU processing
```

For accuracy over speed:

```python
# High Accuracy Setup
WHISPER_MODEL = "large"   # Best accuracy
USE_GPU = True           # Recommended for large model
BATCH_SIZE = 4           # Smaller batch for large model
```

## 🧪 Testing

### Run Unit Tests

```bash
# Run all tests
python -m pytest tests/

# Run specific test categories
python -m pytest tests/test_audio_processing.py
python -m pytest tests/test_websocket_speaker_formatting.py
python -m pytest tests/test_speaker_alerts.py
```

### Manual API Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test transcription (with audio file)
curl -X POST "http://localhost:8000/api/transcribe" \
  -F "file=@test_audio.wav" \
  -F "language=en"

# Test summarization
curl -X POST "http://localhost:8000/api/summarize" \
  -H "Content-Type: application/json" \
  -d '{"text":"Sample meeting transcript","meeting_id":"test"}'
```

### WebSocket Testing

Use the provided test script:

```bash
python tests/test_websocket_speaker_formatting.py
```

## 📊 Performance Monitoring

### Resource Usage

Monitor server performance:

```bash
# CPU and memory usage
htop

# GPU usage (if using CUDA)
nvidia-smi

# Network connections
netstat -an | grep 8000
```

### Logging

Logs are available in the console. To modify log levels:

```python
# In app/config.py
LOG_LEVEL = "DEBUG"  # DEBUG, INFO, WARNING, ERROR
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Groq API Key Issues
```
Error: 401 Unauthorized - Invalid API key
```
**Solution**: Verify your Groq API key in `.env`

#### 2. Whisper Model Loading
```
Error: Model 'large' not found
```
**Solution**: Use smaller model or ensure sufficient disk space

#### 3. GPU Issues
```
Warning: Performing inference on CPU when CUDA is available
```
**Solution**: Install CUDA-compatible PyTorch:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

#### 4. WebSocket Connection Issues
```
Error: WebSocket connection failed
```
**Solution**: Check firewall settings and ensure port 8000 is open

#### 5. Audio Processing Errors
```
Error: Audio file format not supported
```
**Solution**: Convert audio to supported format (WAV, MP3, M4A)

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set environment variable
export DEBUG=true

# Or modify main.py
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="debug"  # Add this line
    )
```

## 🔒 Security Considerations

### API Security

- **Rate Limiting**: Implement rate limiting for production
- **Authentication**: Add authentication for sensitive endpoints
- **CORS**: Configure CORS settings for production domains

### Data Privacy

- **Audio Storage**: Audio files are processed in memory and not stored
- **User Data**: Profile data is stored locally on client side
- **Logging**: Ensure sensitive data is not logged

### Production Deployment

For production deployment:

```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## 📦 Dependencies

### Core Dependencies

- **FastAPI**: Web framework for building APIs
- **Uvicorn**: ASGI server for FastAPI
- **WebSockets**: Real-time communication
- **OpenAI Whisper**: Speech-to-text processing
- **Groq**: AI-powered summarization
- **PyTorch**: Machine learning framework
- **NumPy**: Numerical computing
- **Pydantic**: Data validation

### Optional Dependencies

- **CUDA**: GPU acceleration for Whisper
- **Redis**: Session storage (for scaling)
- **PostgreSQL**: Database for user data (for scaling)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check the main README.md
- **Issues**: Create an issue on GitHub
- **Testing**: Run the test suite for debugging
- **Logs**: Check server logs for error details