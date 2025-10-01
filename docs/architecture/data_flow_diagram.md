# AI Meeting Minutes - Data Flow Diagram (Level 0)

```mermaid
flowchart TD
    %% External Entities
    U[👤 User<br/>Meeting Participant]
    BE[🔌 Browser Extension]
    WF[🌐 Web Frontend<br/>Application]
    EAS[🤖 External AI Services<br/>Whisper & Groq]

    %% Main Process
    MP[📊 AI Meeting Minutes<br/>System]

    %% Data Stores
    UPD[(💾 User Profile<br/>Database)]
    SD[(💾 Session<br/>Database)]
    AC[(💾 Audio<br/>Cache)]

    %% Data Flows
    U -->|Profile Settings| UPD
    UPD -->|User Keywords| MP

    BE -->|Audio Chunks| MP
    WF -->|Audio Files| MP
    MP -->|Audio Data| AC

    AC -->|Processed Audio| MP
    MP -->|Transcription Request| EAS
    EAS -->|Transcribed Text| MP

    MP -->|Speaker-tagged Text| SD
    SD -->|Session Data| MP

    MP -->|Real-time Updates| BE
    MP -->|Real-time Updates| WF

    MP -->|Summary Request| EAS
    EAS -->|Meeting Summary| MP
    MP -->|Summary Data| SD

    %% Trust Boundaries
    classDef external fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef process fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef datastore fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class U,BE,WF,EAS external
    class MP process
    class UPD,SD,AC datastore
```

## Data Flow Diagram (Level 1) - Process Decomposition

```mermaid
flowchart TD
    %% Parent Process
    MP[📊 AI Meeting Minutes System]

    %% Subprocesses
    AIP[🎤 Audio Ingestion<br/>Process]
    RTP[🎯 Real-time Transcription<br/>Process]
    SDP[👥 Speaker Processing<br/>Process]
    ADP[🚨 Alert Management<br/>Process]
    SP[📝 Summarization<br/>Process]
    SMP[💾 Session Management<br/>Process]

    %% Data Stores
    UPD[(💾 User Profile<br/>Database)]
    SD[(💾 Session<br/>Database)]
    AC[(💾 Audio<br/>Cache)]
    TC[(💾 Transcription<br/>Cache)]
    AQ[(💾 Alert<br/>Queue)]
    SS[(💾 Summary<br/>Storage)]

    %% External Entities
    BE[🔌 Browser Extension]
    WF[🌐 Web Frontend]
    EAS[🤖 External AI Services]

    %% Data Flows
    BE -->|Audio Stream| AIP
    WF -->|Audio Files| AIP
    AIP -->|Audio Chunks| AC

    AC -->|Processed Audio| RTP
    RTP -->|Transcription Request| EAS
    EAS -->|Raw Text| RTP
    RTP -->|Transcription Segments| TC

    TC -->|Raw Segments| SDP
    SDP -->|Speaker-tagged Text| SD

    SD -->|Tagged Text| ADP
    UPD -->|User Keywords| ADP
    ADP -->|Alert Events| AQ

    SD -->|Complete Transcription| SP
    SP -->|Summary Request| EAS
    EAS -->|AI Summary| SP
    SP -->|Summary Data| SS

    AC -->|Audio Data| SMP
    TC -->|Transcription Data| SMP
    SD -->|Speaker Data| SMP
    AQ -->|Alert Data| SMP
    SS -->|Summary Data| SMP
    SMP -->|Complete Session| SD

    %% Real-time Updates
    SDP -->|Live Updates| BE
    SDP -->|Live Updates| WF
    ADP -->|Alert Notifications| BE
    ADP -->|Alert Notifications| WF
    SP -->|Summary Updates| BE
    SP -->|Summary Updates| WF

    %% Process Grouping
    subgraph "AI Meeting Minutes System"
        AIP
        RTP
        SDP
        ADP
        SP
        SMP
    end

    %% Styling
    classDef process fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef datastore fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef external fill:#e1f5fe,stroke:#01579b,stroke-width:2px

    class AIP,RTP,SDP,ADP,SP,SMP process
    class UPD,SD,AC,TC,AQ,SS datastore
    class BE,WF,EAS external
```

## Data Flow Descriptions

### Level 0 Processes
1. **Audio Input Flow**: Users provide audio through browser extension (real-time) or web frontend (file upload)
2. **Processing Flow**: Audio chunks are transcribed, speakers identified, and text formatted
3. **Real-time Communication**: Live updates sent to connected clients via WebSocket
4. **Alert Flow**: System monitors for user mentions and triggers notifications
5. **Summarization Flow**: Complete transcriptions are analyzed to generate meeting summaries
6. **Profile Management**: User preferences and keywords stored for personalization

### Level 1 Subprocesses

#### Audio Ingestion Process
- **Input**: Raw audio streams or uploaded files
- **Processing**: Format validation, chunking (5-second segments), compression
- **Output**: Standardized audio chunks ready for transcription
- **Data Store**: Audio Cache (temporary storage)

#### Real-time Transcription Process
- **Input**: Audio chunks with meeting context
- **Processing**: API calls to Whisper, response parsing, timestamp addition
- **Output**: Raw transcribed text segments with timing
- **External**: Groq Whisper API
- **Data Store**: Transcription Cache

#### Speaker Processing Process
- **Input**: Raw transcription segments and audio data
- **Processing**: Voice pattern analysis, speaker clustering, color assignment
- **Output**: Speaker-tagged transcription with visual formatting
- **Data Store**: Session Database (speaker profiles)

#### Alert Management Process
- **Input**: Speaker-tagged text and user profile keywords
- **Processing**: Keyword matching, mention detection, alert prioritization
- **Output**: Alert events with context and trigger information
- **Data Store**: Alert Queue

#### Summarization Process
- **Input**: Complete meeting transcription
- **Processing**: LLM analysis, key point extraction, action item identification
- **Output**: Structured meeting summary with insights
- **External**: Groq LLM API
- **Data Store**: Summary Storage

#### Session Management Process
- **Input**: All processed meeting data
- **Processing**: Data aggregation, statistics calculation, persistence
- **Output**: Complete archived meeting session
- **Data Store**: Session Database (permanent storage)