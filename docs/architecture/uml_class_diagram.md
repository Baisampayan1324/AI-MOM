# AI Meeting Minutes - UML Class Diagram

```mermaid
classDiagram
    %% Backend Package
    namespace Backend {
        %% Models Package
        class UserProfile {
            +String name
            +String email
            +String role
            +String team
            +List~String~ projects
            +List~String~ skills
            +List~String~ keywords
            +getAlertKeywords() List~String~
            +updateProfile(**kwargs) UserProfile
        }

        class AudioFileRequest {
            +String filename
            +String language
        }

        class TranscriptionResponse {
            +String text
            +String language
        }

        class SummaryRequest {
            +String text
            +String meeting_id
        }

        class SummaryResponse {
            +String summary
            +List~String~ key_points
            +List~String~ action_items
        }

        class MeetingUpdate {
            +String meeting_id
            +String text
            +Float timestamp
        }

        %% Services Package
        class AudioProcessor {
            -WhisperModel model
            -String device
            +transcribeAudioFile(String file_path, String? language) Dict
            +transcribeAudioChunk(bytes audio_data, String? language) Dict
            -loadModel(String model_size) void
            -preprocessAudio(bytes audio_data) np.ndarray
        }

        class RealtimeTranscriber {
            -GroqClient client
            -String model
            -String last_transcription
            +transcribeAudioChunk(bytes audio_data, String? language) Dict
            +processTranscriptionResult(Dict result) Dict
            -validateAudioData(bytes audio_data) Boolean
        }

        class Summarizer {
            -GroqClient client
            -String model
            +summarizeText(String text, String meeting_id) Dict
            -createSummaryPrompt(String text) String
            -parseSummaryResponse(String response) Dict
        }

        class UserProfileService {
            -String profile_file
            -UserProfile? profile
            +loadProfile() Boolean
            +saveProfile(UserProfile profile) Boolean
            +createProfile(String name, **kwargs) UserProfile
            +updateProfile(**kwargs) UserProfile?
            +getProfile() UserProfile?
            +getAlertKeywords() List~String~
        }

        %% API Package
        class ConnectionManager {
            -Dict~String, List~WebSocket~~ active_connections
            +connect(WebSocket websocket, String meeting_id) void
            +disconnect(WebSocket websocket, String meeting_id) void
            +sendPersonalMessage(String message, WebSocket websocket) void
            +broadcast(String meeting_id, Dict message) void
        }

        class APIRouter {
            +post("/transcribe") TranscriptionResponse
            +post("/summarize") SummaryResponse
            +post("/process-audio") Dict
            +websocket("/ws/meeting/{meeting_id}") void
        }
    }

    %% Frontend Package
    namespace Frontend {
        class AudioCaptureService {
            -MediaRecorder mediaRecorder
            -AudioContext audioContext
            -WebSocket websocket
            +startRecording() void
            +stopRecording() void
            +processAudioChunk(Blob chunk) void
            +connectWebSocket(String meeting_id) void
            -setupAudioContext() void
        }

        class TranscriptionDisplay {
            -HTMLElement transcriptContainer
            -HTMLElement summaryContainer
            +appendTranscription(String text, String speaker) void
            +updateSummary(Dict summary) void
            +clearDisplay() void
            +highlightSpeaker(String speaker) void
        }

        class AlertSystem {
            -HTMLElement alertContainer
            -List~String~ userKeywords
            +checkForAlerts(String text) List~String~
            +showAlert(String message, String type) void
            +dismissAlert(String alertId) void
        }
    }

    %% Extension Package
    namespace Extension {
        class ExtensionBackground {
            +onActionClicked(Tab tab) void
            +injectContentScript(Number tabId) void
            -handleExtensionEvents() void
        }

        class ExtensionContent {
            -HTMLElement bubble
            -HTMLElement panel
            -Boolean isRecording
            +createUI() void
            +togglePanel() void
            +startTranscription() void
            +stopTranscription() void
            +handleDrag(MouseEvent event) void
        }
    }

    %% Interfaces
    class ITranscriptionService {
        <<interface>>
        +transcribe(bytes audio) Dict
    }

    class ISummaryService {
        <<interface>>
        +summarize(String text) Dict
    }

    class IAlertService {
        <<interface>>
        +checkAlerts(String text) List~String~
    }

    class IWebSocketManager {
        <<interface>>
        +broadcast(String meeting_id, Dict data) void
        +connect(String meeting_id) WebSocket
    }

    %% Relationships
    %% Backend Dependencies
    AudioProcessor ..|> ITranscriptionService : implements
    RealtimeTranscriber ..|> ITranscriptionService : implements
    Summarizer ..|> ISummaryService : implements
    AlertSystem ..|> IAlertService : implements
    ConnectionManager ..|> IWebSocketManager : implements

    UserProfileService --> UserProfile : manages
    APIRouter --> AudioProcessor : uses
    APIRouter --> Summarizer : uses
    APIRouter --> UserProfileService : uses
    APIRouter --> ConnectionManager : uses

    %% Frontend Dependencies
    AudioCaptureService --> WebSocket : communicates
    TranscriptionDisplay --> AudioCaptureService : displays
    AlertSystem --> UserProfileService : uses keywords

    %% Extension Dependencies
    ExtensionBackground --> ExtensionContent : injects
    ExtensionContent --> AudioCaptureService : uses

    %% Cross-component Communication
    ExtensionContent --> APIRouter : API calls
    AudioCaptureService --> APIRouter : API calls
    TranscriptionDisplay --> ConnectionManager : WebSocket updates
```

## Class Diagram Overview

### Backend Package Structure

#### Models Package
Contains Pydantic data models for API requests/responses and internal data structures.

#### Services Package
Core business logic classes handling audio processing, AI services, and data management.

#### API Package
FastAPI router classes managing HTTP endpoints and WebSocket connections.

### Frontend Package Structure

#### AudioCaptureService
Handles browser audio recording and real-time streaming to backend.

#### TranscriptionDisplay
Manages UI updates for live transcription and summary display.

#### AlertSystem
Processes and displays user notifications based on transcription content.

### Extension Package Structure

#### ExtensionBackground
Chrome extension service worker handling extension lifecycle and content script injection.

#### ExtensionContent
Content script managing the floating UI overlay and audio capture on web pages.

### Interface Segregation

The system uses interfaces to decouple components and enable testability:

- **ITranscriptionService**: Abstracts speech-to-text functionality
- **ISummaryService**: Abstracts AI summarization capabilities
- **IAlertService**: Abstracts alert detection logic
- **IWebSocketManager**: Abstracts real-time communication

### Key Relationships

- **Composition**: Services contain and manage model instances
- **Dependency**: UI components depend on backend services
- **Realization**: Concrete classes implement abstract interfaces
- **Association**: Cross-component communication via APIs and WebSockets

### Design Patterns Used

- **Service Layer Pattern**: Backend services encapsulate business logic
- **Repository Pattern**: Data access abstracted through service classes
- **Observer Pattern**: WebSocket broadcasting for real-time updates
- **Strategy Pattern**: Multiple transcription implementations via interface
- **Factory Pattern**: Service instantiation and configuration management