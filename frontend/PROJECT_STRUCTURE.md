# AI Meeting Minutes - Project Structure

This project contains two main components: a web-based frontend and a browser extension.

## Directory Structure

```
.
├── src/                          # Frontend React Application
│   ├── components/              # Reusable React components
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── AudioVisualizer.tsx
│   │   ├── Navigation.tsx
│   │   ├── SummaryDisplay.tsx
│   │   └── TranscriptDisplay.tsx
│   ├── pages/                   # Application pages
│   │   ├── Index.tsx           # Landing page
│   │   ├── RealtimeCapture.tsx # Live recording interface
│   │   ├── FileProcessing.tsx  # Audio file upload
│   │   ├── ProfileSettings.tsx # User settings
│   │   └── NotFound.tsx        # 404 page
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   ├── App.tsx                  # Main app component
│   ├── index.css                # Global styles & design system
│   └── main.tsx                 # Application entry point
│
├── browser-extension/           # Chrome Extension
│   ├── manifest.json           # Extension configuration
│   ├── popup.html              # Extension popup
│   ├── popup.js                # Popup logic
│   ├── sidebar.html            # Main sidebar interface
│   ├── sidebar.css             # Sidebar styles
│   ├── sidebar.js              # Sidebar functionality
│   ├── content.js              # Content script
│   ├── content.css             # Content styles
│   ├── background.js           # Background service worker
│   ├── icons/                  # Extension icons (need to be created)
│   └── README.md               # Extension documentation
│
├── public/                      # Static assets
├── index.html                   # HTML entry point
├── tailwind.config.ts          # Tailwind configuration
├── vite.config.ts              # Vite configuration
└── PROJECT_STRUCTURE.md        # This file
```

## Frontend Application

### Technology Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **React Router** - Navigation
- **Sonner** - Toast notifications

### Key Features
1. **Real-time Capture** - Live meeting transcription with speaker identification
2. **File Processing** - Upload and process pre-recorded audio files
3. **Profile Settings** - Manage user preferences and alert keywords
4. **Responsive Design** - Works on all device sizes

### Design System
The design system is defined in `src/index.css` and uses:
- **Colors**: Blue/purple gradient palette with HSL values
- **Gradients**: Primary, subtle, and hero gradients
- **Shadows**: Elegant, glow, and card shadows
- **Animations**: Smooth transitions and recording pulse effects

## Browser Extension

### Technology Stack
- **Manifest V3** - Chrome extension format
- **Vanilla JavaScript** - No framework dependencies
- **WebSocket** - Real-time communication
- **Chrome APIs** - Browser integration

### Key Features
1. **Dual Mode Interface** - Online (real-time) and Offline (file upload)
2. **Sidebar Panel** - Professional slide-in interface
3. **Minimize to Icon** - Float icon for quick access
4. **Live Transcription** - Real-time speech-to-text
5. **Audio Visualization** - 5-bar audio level display
6. **File Processing** - Drag & drop audio file support

### Required Icons
You need to create three icon sizes in the `browser-extension/icons/` directory:
- `icon16.png` - 16x16px
- `icon48.png` - 48x48px
- `icon128.png` - 128x128px

These should feature the microphone (🎙️) symbol with the gradient colors from the design system.

## Backend Connection

Both the frontend and extension connect to a backend server at:
- **Frontend**: `http://localhost:8000`
- **Extension**: `ws://localhost:8000` (WebSocket)

The backend should provide:
- WebSocket endpoint for real-time transcription
- File upload endpoint for audio processing
- Transcript and summary generation
- Speaker diarization

## Development

### Frontend Development
```bash
npm install
npm run dev
```
Access at `http://localhost:8080`

### Extension Development
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. Make changes and click refresh on the extension card

## GitHub Repository Setup

To create separate repositories:

### Option 1: Monorepo (Recommended)
Keep both in one repository with clear folder structure:
```
ai-meeting-minutes/
├── frontend/          # Move src/ and config files here
├── browser-extension/ # Already in place
└── README.md         # Main project README
```

### Option 2: Separate Repositories
Create two repositories:
1. `ai-meeting-minutes-frontend` - For the React app
2. `ai-meeting-minutes-extension` - For the browser extension

## Next Steps

1. **Create Extension Icons** - Generate the 16x16, 48x48, and 128x128 icons
2. **Setup Backend** - Implement the backend server with WebSocket support
3. **Test Integration** - Verify frontend and extension work with backend
4. **Add Authentication** - Implement user login and session management
5. **Deploy Frontend** - Host on Vercel, Netlify, or similar
6. **Publish Extension** - Submit to Chrome Web Store

## License

[Your chosen license]
