# AI MOM Extension - Quick User Guide

## 🎯 Getting Started

### Installation
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and select the `extension` folder
4. Pin the extension to your toolbar

### Backend Setup
1. Navigate to `backend` folder
2. Install dependencies: `pip install -r requirements.txt`
3. Start server: `python -m uvicorn app.main:app --reload`
4. Server runs on `http://localhost:8000`

---

## 📋 Recording Modes

### 🖥️ Screen Capture Mode (Recommended)
**Best for:** Google Meet, Zoom, Teams, any video conference

**How to use:**
1. Join your meeting
2. Click the extension icon
3. Select "Screen Capture" mode
4. Click "Start Recording"
5. Share your screen and **check "Share system audio"**
6. Click "Stop Recording" when done

**Features:**
- ✅ Captures system audio (all meeting participants)
- ✅ Real-time transcription
- ✅ No microphone permission needed
- ✅ Works on any platform

---

### 🎤 Microphone Mode
**Best for:** Recording yourself, podcast, voice notes

**How to use:**
1. Click the extension icon
2. Select "Microphone" mode
3. Click "Start Recording"
4. Allow microphone access when prompted
5. Click "Stop Recording" when done

**Features:**
- ✅ Records your voice only
- ✅ Real-time transcription
- ✅ Echo cancellation enabled
- ⚠️ Requires microphone permission

**Common Issues:**
- **"Permission dismissed"**: Click the 🔒 icon in address bar → Allow microphone
- **"Microphone in use"**: Close other apps using microphone
- **"No microphone found"**: Check if microphone is connected

---

### 📁 Audio Upload Mode
**Best for:** Pre-recorded meetings, audio files

**How to use:**
1. Click the extension icon
2. Select "Audio Upload" mode
3. Drag & drop audio file or click to browse
4. Click "Process Audio"
5. Wait for transcription and summary

**Supported formats:**
- MP3
- WAV
- M4A
- FLAC

**File size limit:** 500MB

**Processing time:** ~20-30 seconds per minute of audio

---

## 🛠️ Settings

### Backend URL
- Default: `http://localhost:8000`
- Change if running backend on different port/server

### Language
- Auto-detect (recommended)
- Or select specific language for better accuracy

### Display Options
- **Show floating overlay**: Display transcription overlay on page
- **Generate automatic summaries**: Create AI summaries after recording
- **Enable speaker alerts**: Get notifications for speaker changes

---

## 💡 Tips for Best Results

### Screen Capture Audio
1. **Always check "Share system audio"** in Chrome's share screen dialog
2. If you don't see the option:
   - Close all Chrome windows
   - Restart Chrome
   - Try again

### Microphone Recording
1. **Use a good quality microphone** for better accuracy
2. **Minimize background noise**
3. **Speak clearly** at normal pace
4. **Close other apps** using microphone

### Audio Upload
1. **Use high-quality audio files** (44.1kHz or higher)
2. **Avoid MP3 files < 128kbps** (quality too low)
3. **Keep files under 500MB**
4. **Wait for processing** - don't close the popup

---

## 📊 Understanding Results

### Transcription
- Shows full text of what was said
- Includes timestamps
- Speaker identification (if available)
- Word count

### Summary
- **Full Summary**: Overview of the meeting
- **Key Points**: Important topics discussed
- **Action Items**: Tasks and follow-ups
- **Conclusion**: Final remarks and next steps

### Export Options
- **Export**: Save transcript as file
- **Summary**: Generate detailed summary
- **Copy**: Copy text to clipboard

---

## ❌ Troubleshooting

### "Failed to start microphone capture: Permission dismissed"
**Solution:**
1. Click 🔒 icon in Chrome address bar
2. Find "Microphone" setting
3. Change to "Allow"
4. Refresh page and try again

### "Failed to process audio: Upload failed: 404"
**Solution:**
1. Make sure backend server is running
2. Check backend URL in settings
3. Try test connection button
4. Restart backend server if needed

### "Backend session end API not available"
**Solution:**
- This is a warning, not an error
- Core functionality still works
- Can be safely ignored

### "No audio track in screen capture"
**Solution:**
1. Stop recording
2. Start again
3. When sharing screen, **check "Share system audio"**
4. Make sure you're sharing the tab/window with audio

### Connection Status shows "Connecting..."
**Solution:**
1. Check if backend is running
2. Click "Test Connection" in settings
3. Verify backend URL is correct
4. Check browser console for errors

---

## 🎨 UI Guide

### Status Indicators
- 🟢 **Active/Ready**: System ready to record
- 🔴 **Recording**: Currently recording
- 🟡 **Processing**: Processing audio
- ⚠️ **Error**: Something went wrong
- 🔵 **Connecting**: Connecting to backend

### Notifications
- **Red**: Error - action required
- **Orange**: Warning - check but not critical
- **Green**: Success - all good!

### Progress Bar
Shows progress during:
- Audio file upload
- Audio processing
- Summary generation

---

## 📞 Support

### Check Logs
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Share with developer if needed

### Report Issues
Include:
1. Error message
2. What you were doing
3. Browser console logs
4. Backend server logs

---

## 🔐 Privacy & Security

### What is recorded?
- **Screen Capture**: System audio from your computer
- **Microphone**: Your microphone input
- **Audio Upload**: Only files you select

### Where is data sent?
- Audio is sent to your **local backend** (`localhost:8000`)
- No data sent to external servers (unless you configure it)
- All processing happens on your computer

### Data Storage
- Transcripts stored temporarily during processing
- Auto-cleaned after processing complete
- No permanent storage unless you export

---

## 🚀 Advanced Features

### Custom Backend URL
Configure for:
- Remote server deployment
- Different port
- HTTPS connection

### WebSocket Real-time
- Live transcription as you speak
- Instant word updates
- Speaker change detection

### Batch Processing
- Upload multiple files
- Process in queue
- Export all results

---

## 📝 Keyboard Shortcuts

Coming soon!

---

## 🔄 Updates

**Current Version:** v1.1.0

**What's New:**
- ✅ Fixed audio upload endpoint
- ✅ Better error messages
- ✅ Improved microphone permission handling
- ✅ Enhanced UI notifications
- ✅ Progress indicators
- ✅ Summary display improvements

**Coming Soon:**
- Real-time transcription display
- Speaker name editing
- Export to PDF/DOCX
- Keyboard shortcuts
- Dark/light theme toggle

---

## 📚 Additional Resources

- [Backend README](../backend/README.md)
- [API Documentation](http://localhost:8000/docs)
- [Source Code](https://github.com/Baisampayan1324/AI-MOM)

---

**Happy Recording! 🎙️**
