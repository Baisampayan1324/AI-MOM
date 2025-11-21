# PyAnnote Speaker Diarization Setup Guide

## Overview

This guide will help you set up pyannote-audio for advanced speaker diarization in your AI MOM application.

## Prerequisites

- Python 3.8 or higher
- PyTorch (will be installed with requirements)
- HuggingFace account (free)

## Step 1: Get HuggingFace Access Token

1. Create a free account at https://huggingface.co/join
2. Go to your settings: https://huggingface.co/settings/tokens
3. Click "New token" and create a token with **read** access
4. Copy your token (it looks like `hf_xxxxxxxxxxxxxxxxxxxxxxxxxx`)

## Step 2: Accept Model License

The pyannote speaker diarization model requires accepting a license:

1. Visit: https://huggingface.co/pyannote/speaker-diarization-3.1
2. Click "Agree and access repository"
3. Also visit and accept: https://huggingface.co/pyannote/segmentation-3.0

## Step 3: Install Dependencies

Navigate to your backend directory and install the updated requirements:

```powershell
cd P:\AI_MOM@\backend
pip install -r requirements.txt
```

This will install:

- `pyannote.audio` - Main diarization library
- `torchaudio` - Audio processing for PyTorch
- `soundfile` - Audio file I/O

**Note:** Installation may take 5-10 minutes depending on your internet connection.

## Step 4: Configure Environment Variables

Add your HuggingFace token to your backend `.env` file:

```env
# Add this to backend/.env
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

Optional tuning parameters:

```env
# Minimum seconds of audio before running diarization (default: 10.0)
DIARIZATION_MIN_SECONDS=10.0

# Real-time transcription buffer settings
REALTIME_MIN_SECONDS=1.0
REALTIME_MAX_SECONDS=3.5
REALTIME_SILENCE_THRESHOLD=4e-5
REALTIME_SILENCE_TAIL=0.3
```

## Step 5: Test the Setup

1. Start your backend:

```powershell
cd P:\AI_MOM@
.\start_backend.bat
```

2. Check the logs for these messages:
   - `✅ pyannote.audio is available for speaker diarization`
   - `🔄 Loading pyannote speaker diarization pipeline...`
   - `✅ Diarization pipeline loaded on CPU` (or GPU if available)

If pyannote is not available, you'll see:

- `⚠️ pyannote.audio not available, using simple speaker detection`

## Step 6: Test Speaker Diarization

1. Open the frontend: http://localhost:5500/frontend/real.html
2. Click "Connect to Backend"
3. Click "Start Recording"
4. Have 2-3 people speak (or use different voices yourself)
5. Watch the transcript - each speaker should be labeled correctly

### What to Expect

**With PyAnnote (Advanced):**

- More accurate speaker separation
- Better handling of overlapping speech
- Speakers labeled as: Speaker 1, Speaker 2, Speaker 3, etc.
- Processes in batches (every 10 seconds by default)

**Fallback Mode (Simple):**

- Basic voice signature matching
- Real-time, no batching
- Less accurate but faster
- Still works if pyannote fails to load

## Troubleshooting

### Issue: "HUGGINGFACE_TOKEN not set"

**Solution:** Make sure you added the token to `backend/.env` file.

### Issue: "Failed to load pyannote pipeline"

**Solutions:**

- Check that you accepted the model licenses (Step 2)
- Verify your HuggingFace token is valid
- Try reinstalling: `pip install --upgrade pyannote.audio`

### Issue: "Import 'pyannote.audio' could not be resolved"

**Solution:** This is a VS Code lint warning and can be ignored. The backend will work if the package is installed.

### Issue: GPU/CUDA errors

**Solution:** PyAnnote will automatically fall back to CPU if GPU is not available. For faster processing, ensure PyTorch with CUDA is installed.

### Issue: Slow diarization

**Solutions:**

- Increase `DIARIZATION_MIN_SECONDS` to process less frequently
- Use GPU acceleration (requires CUDA-enabled PyTorch)
- Consider using the simple fallback for real-time needs

## Performance Notes

### CPU Performance

- ~2-3 seconds processing time per 10 seconds of audio
- Suitable for most use cases
- May lag slightly behind real-time

### GPU Performance (CUDA)

- ~0.5-1 second processing time per 10 seconds of audio
- Near real-time performance
- Recommended for production use

## Features Implemented

### Backend

✅ PyAnnote pipeline integration with HuggingFace token
✅ Automatic fallback to simple speaker detection
✅ GPU acceleration support (when available)
✅ Batched diarization processing
✅ Speaker segment mapping

### Frontend

✅ Dynamic speaker labeling (Speaker 1, 2, 3, ...)
✅ Accurate speaker display from backend
✅ Auto-disconnect after summary generation
✅ Enhanced connection state logging
✅ Proper speaker continuity (appends to same speaker)

## Connection Handling

The system now automatically:

1. Connects to backend when you click "Connect"
2. Enables recording when connected
3. Transcribes in real-time with speaker labels
4. Generates summary when you stop recording
5. **Auto-disconnects 2 seconds after summary is complete**
6. Ready for next session (reconnect for new recording)

## Logs to Watch

### Backend Logs (Terminal)

```
✅ pyannote.audio is available for speaker diarization
🔄 Loading pyannote speaker diarization pipeline...
✅ Diarization pipeline loaded on CPU
🎤 Running pyannote diarization on 10.2s of audio...
✅ Diarization complete: 8 segments, 2 speakers
```

### Frontend Logs (Browser Console - F12)

```
✅ WebSocket connected to backend
🔗 Backend connection established at ws://localhost:8000/ws/audio
🎙️ Starting real-time recording session...
📡 Sent 16000 samples as base64 (1.00s of audio)
📩 Received from backend: {type: "transcription", text: "...", speaker_id: 2}
🎤 Speaker: Speaker 2 (Color: 2)
🔌 Auto-disconnecting after summary generation...
✅ Disconnecting backend connection
```

## Next Steps

Once setup is complete:

1. Test with multiple speakers
2. Check accuracy of speaker separation
3. Tune `DIARIZATION_MIN_SECONDS` if needed
4. Consider GPU setup for better performance
5. Monitor logs for any errors

## Support

If you encounter issues:

1. Check backend terminal logs
2. Check browser console (F12)
3. Verify all steps in this guide
4. Ensure backend is running on port 8000
5. Confirm HuggingFace token is valid

---

**Ready to test!** Start your backend and frontend, then try recording with multiple speakers to see the improved diarization in action! 🎤🎉
