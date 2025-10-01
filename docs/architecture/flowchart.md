# AI Meeting Minutes - System Flowchart

```mermaid
flowchart TD
    A[User Initiates Meeting] --> B{Recording Method?}
    B -->|Browser Extension| C[Capture Real-time Audio]
    B -->|Web Upload| D[User Uploads Audio File]

    C --> E[Audio Chunking<br/>5-second chunks]
    D --> E

    E --> F[Send to Transcription Service<br/>Whisper API]

    F --> G[Speech-to-Text Conversion<br/>Multi-language support]

    G --> H[Speaker Diarization<br/>Identify speakers<br/>Assign colors]

    H --> I[Format Transcription<br/>Speaker tags & colors]

    I --> J[Real-time Updates<br/>WebSocket broadcast]

    J --> K[Display Live Transcription<br/>Extension & Web UI]

    I --> L[Alert System Check<br/>Keywords & mentions]

    L --> M{Alert Detected?}
    M -->|Yes| N[Send Notifications<br/>Personal & general alerts]
    M -->|No| O[Continue Processing]

    N --> O
    O --> P{Meeting Ongoing?}

    P -->|Yes| Q[Next Audio Chunk]
    Q --> E

    P -->|No| R[Generate Final Summary<br/>AI Summarization]

    R --> S[Extract Key Points<br/>Action Items<br/>Meeting Insights]

    S --> T[Data Persistence<br/>Save session data]

    T --> U[Display Complete<br/>Meeting Minutes]

    K --> P
    N --> P
```

## Process Description

1. **Audio Input**: Users can start recording via browser extension or upload pre-recorded files
2. **Chunking**: Audio is split into 5-second chunks for real-time processing
3. **Transcription**: Each chunk is sent to Whisper API for speech-to-text conversion
4. **Speaker Identification**: AI identifies different speakers and assigns color coding
5. **Real-time Display**: Live transcription updates are sent via WebSocket to UI
6. **Alert System**: Monitors for user mentions, questions, and custom keywords
7. **Summarization**: When meeting ends, AI generates comprehensive summary with key points and action items
8. **Persistence**: All data is saved for future reference