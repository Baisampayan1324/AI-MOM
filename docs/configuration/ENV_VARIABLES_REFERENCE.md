# Environment Variables Reference

## Required for PyAnnote Speaker Diarization

```env
# HuggingFace authentication token
# Get from: https://huggingface.co/settings/tokens
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Optional Tuning Parameters

### Speaker Diarization

```env
# Minimum seconds of audio to buffer before running diarization
# Higher = more accurate but less frequent updates
# Lower = more frequent but may be less accurate
# Default: 10.0
DIARIZATION_MIN_SECONDS=10.0
```

### Real-time Transcription

```env
# Whisper model for real-time transcription
# Options: tiny, tiny.en, base, base.en, small, small.en
# Recommendation: base.en (good balance of speed and accuracy)
# Default: base.en
REALTIME_WHISPER_MODEL=base.en

# Minimum seconds to buffer before first transcription
# Default: 1.0
REALTIME_MIN_SECONDS=1.0

# Maximum seconds to buffer (force flush)
# Default: 3.5
REALTIME_MAX_SECONDS=3.5

# Energy threshold for silence detection
# Lower = more sensitive to quiet audio
# Higher = only detect louder speech
# Default: 4e-5
REALTIME_SILENCE_THRESHOLD=4e-5

# Seconds of tail to check for silence
# Default: 0.3
REALTIME_SILENCE_TAIL=0.3

# Use FP16 for faster Whisper processing (requires GPU)
# 0 = disabled (default), 1 = enabled
# Default: 0
REALTIME_WHISPER_FP16=0
```

### File Upload Transcription

```env
# Whisper model for file uploads (can be larger/more accurate)
# Options: tiny, base, small, medium, large
# Recommendation: base or small
# Default: base
FILE_WHISPER_MODEL=base

# Auto-detect language (don't force English)
# Leave blank or set to specific language code
TRANSCRIPTION_LANGUAGE=
```

## Complete Example .env File

```env
# ===================================
# API Keys (Required)
# ===================================
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxx

# ===================================
# PyAnnote Speaker Diarization
# ===================================
DIARIZATION_MIN_SECONDS=10.0

# ===================================
# Real-time Transcription (Whisper)
# ===================================
REALTIME_WHISPER_MODEL=base.en
REALTIME_MIN_SECONDS=1.0
REALTIME_MAX_SECONDS=3.5
REALTIME_SILENCE_THRESHOLD=4e-5
REALTIME_SILENCE_TAIL=0.3
REALTIME_WHISPER_FP16=0

# ===================================
# File Upload Transcription
# ===================================
FILE_WHISPER_MODEL=base
TRANSCRIPTION_LANGUAGE=

# ===================================
# LLM Models (Groq)
# ===================================
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MODEL_2=llama-3.1-70b-versatile

# ===================================
# LLM Models (OpenRouter)
# ===================================
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_MODEL_2=anthropic/claude-3-haiku
OPENROUTER_MODEL_3=google/gemini-flash-1.5
```

## Performance Tuning Tips

### For Maximum Accuracy

```env
REALTIME_WHISPER_MODEL=base.en
DIARIZATION_MIN_SECONDS=15.0
REALTIME_MIN_SECONDS=2.0
REALTIME_MAX_SECONDS=5.0
```

### For Maximum Speed

```env
REALTIME_WHISPER_MODEL=tiny.en
DIARIZATION_MIN_SECONDS=5.0
REALTIME_MIN_SECONDS=0.5
REALTIME_MAX_SECONDS=2.0
REALTIME_WHISPER_FP16=1
```

### Balanced (Recommended)

```env
REALTIME_WHISPER_MODEL=base.en
DIARIZATION_MIN_SECONDS=10.0
REALTIME_MIN_SECONDS=1.0
REALTIME_MAX_SECONDS=3.5
```

## Troubleshooting

### PyAnnote not working?

1. Check `HUGGINGFACE_TOKEN` is set
2. Verify token has read access
3. Confirm model licenses accepted
4. Check backend logs for errors

### Transcription too slow?

1. Lower `REALTIME_MIN_SECONDS` to 0.5
2. Use `tiny.en` model
3. Enable `REALTIME_WHISPER_FP16=1` (if GPU available)

### Missing words in transcription?

1. Increase `REALTIME_MIN_SECONDS` to 2.0
2. Increase `REALTIME_MAX_SECONDS` to 5.0
3. Lower `REALTIME_SILENCE_THRESHOLD` to 2e-5
4. Use `base` or `small` model

### Speaker detection inaccurate?

1. Increase `DIARIZATION_MIN_SECONDS` to 15.0
2. Ensure `HUGGINGFACE_TOKEN` is set (for PyAnnote)
3. Check backend logs for PyAnnote status
4. Test with clearly distinct voices

## Environment Setup Checklist

- [ ] `HUGGINGFACE_TOKEN` - Get from HuggingFace
- [ ] `GROQ_API_KEY` - Get from Groq Console
- [ ] `OPENROUTER_API_KEY` - Get from OpenRouter
- [ ] Model licenses accepted at HuggingFace
- [ ] `.env` file in `backend/` directory
- [ ] No quotes around values in `.env`
- [ ] No spaces around `=` in `.env`

## Quick Test

After setting up `.env`, test with:

```powershell
cd backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('HF Token:', 'SET' if os.getenv('HUGGINGFACE_TOKEN') else 'NOT SET')"
```

Should output: `HF Token: SET`

---

**Need help?** See `PYANNOTE_SETUP_GUIDE.md` for detailed setup instructions.
