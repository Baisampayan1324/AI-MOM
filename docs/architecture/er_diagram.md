# AI Meeting Minutes - Entity-Relationship Diagram

```mermaid
erDiagram
    %% Main Entities
    USER_PROFILE ||--o{ USER_KEYWORDS : has
    USER_PROFILE ||--o{ USER_PROJECTS : manages
    USER_PROFILE ||--o{ USER_SKILLS : possesses
    USER_PROFILE ||--o{ MEETING_SESSION : participates
    USER_PROFILE ||--o{ ALERT_EVENT : receives

    MEETING_SESSION ||--o{ AUDIO_CHUNK : contains
    MEETING_SESSION ||--o{ TRANSCRIPTION_SEGMENT : generates
    MEETING_SESSION ||--o{ SPEAKER_PROFILE : identifies
    MEETING_SESSION ||--o{ ALERT_EVENT : triggers
    MEETING_SESSION ||--o{ MEETING_SUMMARY : produces
    MEETING_SESSION ||--o{ WEBSOCKET_CONNECTION : serves

    AUDIO_CHUNK ||--o{ TRANSCRIPTION_SEGMENT : transcribes

    TRANSCRIPTION_SEGMENT ||--o{ ALERT_EVENT : generates
    TRANSCRIPTION_SEGMENT }o--|| SPEAKER_PROFILE : belongs

    MEETING_SUMMARY ||--o{ SUMMARY_KEY_POINT : contains
    MEETING_SUMMARY ||--o{ SUMMARY_ACTION_ITEM : includes

    %% Entity Definitions
    USER_PROFILE {
        string user_id PK
        string name
        string email
        string role
        string team
        datetime created_at
        datetime updated_at
    }

    USER_KEYWORDS {
        string keyword_id PK
        string user_id FK
        string keyword
        string category
        datetime created_at
    }

    USER_PROJECTS {
        string project_id PK
        string user_id FK
        string project_name
        datetime created_at
    }

    USER_SKILLS {
        string skill_id PK
        string user_id FK
        string skill_name
        datetime created_at
    }

    MEETING_SESSION {
        string meeting_id PK
        string user_id FK
        string title
        datetime start_time
        datetime end_time
        string status
        string language
        datetime created_at
    }

    AUDIO_CHUNK {
        string chunk_id PK
        string meeting_id FK
        int sequence_number
        blob audio_data
        float duration_seconds
        datetime timestamp
        boolean processed
        datetime created_at
    }

    TRANSCRIPTION_SEGMENT {
        string segment_id PK
        string meeting_id FK
        string chunk_id FK
        text text
        float start_time
        float end_time
        float confidence_score
        string language
        string speaker_id
        string speaker_color
        datetime created_at
    }

    SPEAKER_PROFILE {
        string speaker_id PK
        string meeting_id FK
        string speaker_name
        blob voice_fingerprint
        string color_code
        float total_speaking_time
        int segment_count
        datetime created_at
    }

    ALERT_EVENT {
        string alert_id PK
        string meeting_id FK
        string user_id FK
        string segment_id FK
        string alert_type
        string keyword_triggered
        text alert_message
        boolean acknowledged
        datetime created_at
    }

    MEETING_SUMMARY {
        string summary_id PK
        string meeting_id FK
        text summary_text
        datetime generated_at
        string model_used
        float processing_time_seconds
    }

    SUMMARY_KEY_POINT {
        string key_point_id PK
        string summary_id FK
        text point_text
        string priority
        int order_index
    }

    SUMMARY_ACTION_ITEM {
        string action_item_id PK
        string summary_id FK
        text action_text
        string assigned_to
        date due_date
        string status
        int order_index
    }

    WEBSOCKET_CONNECTION {
        string connection_id PK
        string meeting_id FK
        string client_type
        datetime connected_at
        datetime disconnected_at
        string user_agent
    }
```

## Entity Descriptions

### Core Entities

#### User_Profile
Represents a system user with their personal and professional information
- **Attributes**: Basic info, role, team, timestamps
- **Relationships**: Has keywords, projects, skills; participates in meetings; receives alerts

#### Meeting_Session
Represents a single meeting recording session
- **Attributes**: Session metadata, timing, status, language
- **Relationships**: Contains audio chunks, generates transcriptions, identifies speakers, triggers alerts, produces summaries

### Data Processing Entities

#### Audio_Chunk
Represents individual audio segments processed by the system
- **Attributes**: Binary audio data, timing, sequence info
- **Relationships**: Belongs to meeting, produces transcription segments

#### Transcription_Segment
Represents transcribed text segments with timing and speaker info
- **Attributes**: Text content, timing, confidence, speaker assignment
- **Relationships**: Belongs to meeting/chunk, belongs to speaker, generates alerts

#### Speaker_Profile
Represents identified speakers in a meeting
- **Attributes**: Speaker info, voice data, visual formatting, statistics
- **Relationships**: Belongs to meeting, has multiple transcription segments

### Notification & Summary Entities

#### Alert_Event
Represents notifications triggered during transcription
- **Attributes**: Alert type, trigger info, message, acknowledgment status
- **Relationships**: Belongs to meeting/user/segment

#### Meeting_Summary
Represents AI-generated meeting summaries
- **Attributes**: Summary text, generation metadata, processing time
- **Relationships**: Belongs to meeting, contains key points and action items

#### Summary_Key_Point & Summary_Action_Item
Represent structured summary components
- **Attributes**: Content, priority/order, assignment (for actions)
- **Relationships**: Belong to meeting summary

### Supporting Entities

#### User_Keywords, User_Projects, User_Skills
Represent user-specific customization data for personalization
- **Attributes**: Specific data plus user association
- **Relationships**: Belong to user profile

#### WebSocket_Connection
Represents real-time client connections for live updates
- **Attributes**: Connection metadata, client type, timing
- **Relationships**: Serves meeting sessions

## Relationship Cardinalities

- **User_Profile ||--o{ Meeting_Session**: One user can have many meeting sessions
- **Meeting_Session ||--o{ Audio_Chunk**: One meeting contains many audio chunks
- **Audio_Chunk ||--o{ Transcription_Segment**: One chunk produces one segment
- **Transcription_Segment }o--|| Speaker_Profile**: Many segments belong to one speaker
- **Meeting_Session ||--o{ Alert_Event**: One meeting can trigger many alerts
- **Meeting_Session ||--o{ Meeting_Summary**: One meeting produces one summary
- **Meeting_Summary ||--o{ Summary_Key_Point**: One summary has many key points
- **Meeting_Summary ||--o{ Summary_Action_Item**: One summary has many action items