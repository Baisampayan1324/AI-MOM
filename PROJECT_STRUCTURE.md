# Project Structure

This document summarizes the current repository layout and the role of each part. It reflects the actual files and folders in this workspace.

```
AI_MOM@
├── README.md                     # Project overview (this repository)
├── FIXES_SUMMARY.md              # Summary of applied fixes/changes
├── start_backend.bat             # Windows script to start the backend server
├── start_frontend.bat            # Windows script to open the frontend
├── user_profile.json             # Example user profile data (runtime)
├── user_profile.json.example     # Template for user profile data
│
├── audio/                        # Sample audio files
│   ├── sample1.mp3
│   ├── sample2.mp3
│   └── sample3.mp3
│
├── backend/                      # FastAPI backend
│   ├── main.py                   # Backend entry point (invokes app.main)
│   ├── requirements.txt          # Backend Python dependencies
│   ├── pytest.ini                # Pytest configuration
│   ├── README.md                 # Backend documentation
│   ├── user_profile.json(.example)
│   └── app/
│       ├── main.py               # FastAPI app factory
│       ├── config.py             # Configuration/env handling
│       ├── api/                  # API and WebSocket endpoints
│       │   ├── routes.py
│       │   └── websocket.py
│       ├── services/             # Core business logic
│       │   ├── audio_processor.py
│       │   ├── multi_api_processor.py   # Transcription + diarization + AI fusion
│       │   ├── summarizer.py
│       │   └── user_profile.py
│       └── models/               # Schemas and data models
│           ├── schemas.py
│           └── user_profile.py
│
├── frontend/                     # Static web UI
│   ├── index.html                # Landing page
│   ├── real.html                 # Real-time capture UI
│   ├── file.html                 # File upload + processing UI
│   ├── profile.html              # Profile management
│   ├── privacy.html, terms.html  # Legal pages
│   ├── README.md                 # Frontend documentation
│   ├── css/
│   ├── js/
│   └── assets/
│
├── extension/                    # Chrome extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js             # Service worker
│   ├── content/                  # Platform-specific content scripts
│   ├── overlay/                  # In-meeting overlay
│   ├── popup/                    # Extension popup UI
│   └── README.md
│
├── docs/                         # Structured documentation
│   ├── setup/                    # Setup guides and quick start
│   │   └── PYANNOTE_SETUP_GUIDE.md
│   ├── configuration/            # Configuration references
│   │   └── ENV_VARIABLES_REFERENCE.md
│   ├── api/
│   │   └── API_COSTS_README.md
│   ├── architecture/
│   │   └── AI_MOM_Comprehensive_Analysis_Report.md
│   ├── technical/
│   │   ├── SPEAKER_DIARIZATION_UPDATE.md
│   │   └── HYBRID_ROUTER_IMPLEMENTATION.md
│   └── user-guides/
│
└── test/                         # Convenience scripts and integration checks
    ├── check_system.bat          # Environment/system checks (Windows)
    ├── test_backend.bat          # Runs backend tests
    └── test_integration.html     # Manual integration test page
```

## How to Run

- Backend: `start_backend.bat` or `python backend/main.py`
- Frontend: `start_frontend.bat` or open `frontend/index.html`

## Where to Start

- Quick Start: `docs/setup/QUICK_START.md` (Windows-focused)
- Env Reference: `docs/configuration/ENV_VARIABLES_REFERENCE.md`
- Backend details: `backend/README.md`
- Extension details: `extension/README.md`
