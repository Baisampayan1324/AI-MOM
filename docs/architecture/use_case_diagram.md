# AI Meeting Minutes - Use Case Diagram

```mermaid
graph TD
    %% Define actors
    U[👤 User<br/>Meeting Participant]
    BE[🔌 Browser Extension]
    WF[🌐 Web Frontend<br/>Application]
    BA[⚙️ Backend API<br/>Server]
    EAS[🤖 External AI<br/>Services]

    %% User use cases
    U --> UC1[Start Real-time<br/>Meeting Recording]
    U --> UC2[Upload Pre-recorded<br/>Audio File]
    U --> UC3[View Live<br/>Transcription]
    U --> UC4[Receive Speaker<br/>Alerts]
    U --> UC5[View Meeting<br/>Summary]
    U --> UC6[Manage User<br/>Profile]
    U --> UC7[Customize Alert<br/>Preferences]

    %% Browser Extension use cases
    BE --> UC8[Capture Audio<br/>from Microphone]
    BE --> UC9[Send Audio Chunks<br/>to Backend]
    BE --> UC10[Display Real-time<br/>Transcription Overlay]
    BE --> UC11[Show Speaker<br/>Alerts]

    %% Web Frontend use cases
    WF --> UC12[Upload Audio<br/>Files]
    WF --> UC13[Display Transcription<br/>with Speaker Colors]
    WF --> UC14[Show Real-time<br/>Progress]
    WF --> UC15[Manage User<br/>Sessions]
    WF --> UC16[Display Meeting<br/>Summaries]

    %% Backend API use cases
    BA --> UC17[Process Audio<br/>Transcription]
    BA --> UC18[Perform Speaker<br/>Diarization]
    BA --> UC19[Generate AI<br/>Summaries]
    BA --> UC20[Manage WebSocket<br/>Connections]
    BA --> UC21[Handle User Profile<br/>Data]
    BA --> UC22[Process Alert<br/>Triggers]

    %% External Services use cases
    EAS --> UC23[Transcribe Audio<br/>to Text]
    EAS --> UC24[Generate AI<br/>Summaries]
    EAS --> UC25[Provide Language<br/>Detection]

    %% Relationships
    UC8 --> UC9
    UC9 --> UC17
    UC17 --> UC23
    UC18 --> UC23
    UC19 --> UC24
    UC21 --> UC22
    UC4 --> UC22
    UC11 --> UC22

    %% Include relationships
    UC1 .-> UC8 : includes
    UC3 .-> UC10 : includes
    UC3 .-> UC13 : includes
    UC5 .-> UC16 : includes

    %% Extend relationships
    UC7 .-> UC6 : extends
    UC14 .-> UC3 : extends
```

## Use Case Descriptions

### Primary User Use Cases
- **Start Real-time Meeting Recording**: User activates browser extension to begin live transcription
- **Upload Pre-recorded Audio File**: User uploads existing meeting recordings for processing
- **View Live Transcription**: Real-time display of transcribed text with speaker identification
- **Receive Speaker Alerts**: Notifications when user is mentioned or questions are asked
- **View Meeting Summary**: Access AI-generated summaries with key points and action items
- **Manage User Profile**: Update personal information, keywords, and preferences
- **Customize Alert Preferences**: Configure what triggers notifications

### Browser Extension Use Cases
- **Capture Audio from Microphone**: Access system microphone for real-time recording
- **Send Audio Chunks to Backend**: Stream 5-second audio segments for processing
- **Display Real-time Transcription Overlay**: Show live transcription on any webpage
- **Show Speaker Alerts**: Display notifications without leaving current page

### Web Frontend Use Cases
- **Upload Audio Files**: Drag-and-drop interface for audio file processing
- **Display Transcription with Speaker Colors**: Formatted view with speaker differentiation
- **Show Real-time Progress**: Audio levels, processing status, and time indicators
- **Manage User Sessions**: Save, restore, and organize meeting data
- **Display Meeting Summaries**: Comprehensive meeting insights and action items

### Backend API Use Cases
- **Process Audio Transcription**: Handle speech-to-text conversion using Whisper
- **Perform Speaker Diarization**: Identify and label different speakers
- **Generate AI Summaries**: Create intelligent meeting summaries using LLM
- **Manage WebSocket Connections**: Handle real-time communication channels
- **Handle User Profile Data**: Store and retrieve user preferences and settings
- **Process Alert Triggers**: Monitor transcription for alert-worthy content

### External AI Services Use Cases
- **Transcribe Audio to Text**: Convert speech to text with high accuracy
- **Generate AI Summaries**: Produce intelligent meeting insights
- **Provide Language Detection**: Identify and support multiple languages