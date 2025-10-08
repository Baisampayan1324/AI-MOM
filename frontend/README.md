# 🎨 AI MOM Frontend - Intelligent Meeting Management Interface# AI MOM Frontend - Intelligent Meeting Management System



<div align="center">> **AI-Powered Meeting Minutes & Transcription Platform**

> Transform your meetings into actionable insights with real-time transcription, speaker identification, and AI-generated summaries.

![Frontend Banner](https://img.shields.io/badge/Frontend-Meeting%20Management%20UI-4CAF50?style=for-the-badge&logo=javascript&logoColor=white)

[![Status](https://img.shields.io/badge/status-active-success.svg)]()

[![Status](https://img.shields.io/badge/status-active-success.svg)](https://github.com/Baisampayan1324/AI-MOM)[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Baisampayan1324/AI-MOM)

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)---



**Modern, professional web application for AI-powered meeting transcription, real-time audio processing, and intelligent analysis**## 🎯 Overview



[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Pages](#-application-pages) • [🎨 UI Components](#-ui-components) • [🔌 Integration](#-backend-integration)**AI MOM (AI Minutes of Meeting)** is a modern, professional web application that revolutionizes meeting management through intelligent audio processing, real-time transcription, and AI-powered analysis. Built with vanilla JavaScript, HTML5, and CSS3, it offers a seamless, responsive experience across all devices.



</div>### What Makes AI MOM Special?



---- 🎙️ **Real-Time Capture**: Live audio transcription with speaker diarization

- 📁 **File Processing**: Upload and process pre-recorded audio files

## 📋 Table of Contents- 🤖 **AI Summaries**: Automatic generation of key points, action items, and conclusions

- 👥 **Speaker Identification**: Visual color coding for multiple participants

- [Overview](#-overview)- 💾 **Smart Downloads**: Export transcripts and summaries in multiple formats

- [Features](#-features)- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations

- [Application Pages](#-application-pages)- 🔐 **Secure Authentication**: Complete user management system

- [Quick Start](#-quick-start)## 🚀 Quick Start

- [File Structure](#-file-structure)

- [UI Components](#-ui-components)

- [Backend Integration](#-backend-integration)

- [Authentication](#-authentication-system)---### 1. Launch the Application

- [Real-Time Features](#-real-time-features)

- [File Processing](#-file-processing)

- [User Profile](#-user-profile-management)

- [Customization](#-customization)## ✨ Features

- [Browser Support](#-browser-support)

- [Troubleshooting](#-troubleshooting)### Core Functionality



---#### 🎤 Real-Time Meeting Capture (`real.html`)

- **Live Audio Streaming**: Real-time microphone input processing

## 🎯 Overview- **Dynamic Transcription**: Instant text conversion with timestamps

- **Speaker Diarization**: Automatic speaker detection and color coding

**AI MOM Frontend** is a modern, professional web application built with vanilla JavaScript, HTML5, and CSS3. It provides a seamless, responsive interface for managing meetings through intelligent audio processing, real-time transcription, and AI-powered analysis.- **Speaker Alerts**: Personalized notifications when you're mentioned

- **Personalized Notifications**: Custom alerts for keywords and names

### What Makes This Frontend Special?- **Session Management**: Save and restore meeting sessions

- **Meeting Controls**:

- 🎨 **Beautiful Design**: Modern, clean UI with smooth animations and responsive layouts  - Connect/Disconnect to meeting

- 📱 **Mobile-Friendly**: Fully responsive design works on all devices  - Start/Stop recording

- ⚡ **Real-Time**: WebSocket integration for instant transcription updates  - Clear transcript

- 🎙️ **Audio Capture**: Browser-based microphone recording with live processing  - Save session locally

- 📁 **File Upload**: Drag-and-drop interface with progress visualization- **Export Options**:

- 👥 **Speaker Recognition**: Visual color coding for multiple participants  - Download transcript as `.txt`

- 🔐 **Secure Auth**: Complete authentication system with social login  - Download AI summary as `.txt`

- 💾 **Smart Storage**: LocalStorage-based session management

- 🎯 **Zero Dependencies**: Pure vanilla JavaScript - no frameworks needed#### 📁 Audio File Processing (`file.html`)

- 🚀 **Fast Load**: Optimized assets and minimal footprint- **Enhanced Drag-and-Drop**: Intuitive file upload interface

- **Click-to-Upload**: Traditional file browser integration

---- **Format Support**: MP3, WAV, M4A, AAC, OGG, FLAC

- **File Validation**:

## ✨ Features  - Type checking (audio files only)

  - Size limit enforcement (100MB max)

### 🎯 Core Capabilities  - Extension verification

- **Processing Pipeline**:

#### 1. Real-Time Meeting Capture (`real.html`)  - Progress visualization

**Live audio transcription with instant AI analysis**  - Real-time status updates

  - Error handling and recovery

- **🎙️ Microphone Recording**- **AI-Powered Analysis**:

  - Browser-based audio capture  - Meeting overview generation

  - Real-time streaming to backend  - Key points extraction

  - Visual audio level indicator  - Action items identification

  - Automatic sample rate conversion (16kHz)  - Conclusions summary

  - Participant tracking

- **👥 Speaker Diarization**

  - Automatic speaker detection#### 🤖 AI Summary Generation

  - Visual color coding (8 distinct colors)Automatically generates structured summaries with:

  - Speaker labels (SPEAKER_00, SPEAKER_01, etc.)- **📋 Meeting Overview**: High-level summary of discussion

  - Timeline view with timestamps- **🔑 Key Points**: Important topics and decisions

- **✅ Action Items**: Tasks and responsibilities assigned

- **🔔 Smart Notifications**- **🎯 Conclusions**: Final outcomes and next steps

  - Personalized alerts when your name is mentioned- **👥 Participants**: List of meeting attendees

  - Custom keyword monitoring

  - Browser notifications (with permission)#### 🔐 Authentication System

  - Visual highlights in transcript

**Sign In Page (`signin.html`)**:

- **💾 Session Management**- Email/password authentication

  - Save meeting sessions locally- Social login integration (Google, GitHub, Microsoft)

  - Restore previous sessions- Toggle between sign-in and sign-up modes

  - Export transcript as text file- Form validation and error handling

  - Clear transcript functionality- Password visibility toggle

- Responsive design

- **⚙️ Meeting Controls**

  - Connect/Disconnect to backend**Session Management**:

  - Start/Stop recording- Secure localStorage-based authentication

  - Pause/Resume (via backend)- Persistent user sessions

  - Volume monitoring- Auto-login for returning users

- Logout confirmation modal

#### 2. Audio File Processing (`file.html`)- Session timeout handling

**Upload and process pre-recorded audio files**

#### 👤 User Management

- **📁 Enhanced Upload Interface**

  - Drag-and-drop zone with visual feedback**Profile Page (`profile.html`)**:

  - Click-to-browse traditional upload- Personal information management

  - File type validation (audio/* only)- Avatar upload and preview

  - Size limit enforcement (100MB max)- Email and name updates

  - Extension verification- Account settings

- Session history

- **🎵 Supported Formats**

  - MP3 (MPEG Audio)**Settings Page (`setting.html`)**:

  - WAV (Waveform Audio)- Theme customization (Dark/Light)

  - M4A (MPEG-4 Audio)- Accent color selection

  - AAC (Advanced Audio Coding)- Language preferences

  - OGG (Ogg Vorbis)- Notification settings

  - FLAC (Free Lossless Audio Codec)- Privacy controls

- Account management

- **📊 Processing Visualization**

  - Real-time progress bar#### � UI/UX Excellence

  - Status messages (Uploading → Processing → Complete)

  - Processing time display**Design Features**:

  - Error handling with user-friendly messages- Modern gradient backgrounds

- Smooth animations and transitions

- **🤖 AI Analysis Display**- Glass-morphism effects

  - Meeting overview section- Responsive navigation

  - Key points extraction- User avatar system

  - Action items with checkboxes- Dropdown menus

  - Conclusions summary- Modal dialogs

  - Participant list- Loading states

  - Full transcript with speaker labels- Error displays



#### 3. AI-Powered Summaries**Navigation System**:

**Intelligent meeting analysis with structured output**- Sticky top navigation bar

- Logo with circular icon design

- **📋 Meeting Overview**- Page links (Home, Live, File Upload)

  - High-level summary of discussion topics- User menu dropdown

  - Meeting context and purpose- Authentication status indicator

  - Overall tone and sentiment- Mobile-responsive hamburger menu



- **🔑 Key Points**- Email/password authentication

  - Important topics discussed

  - Critical decisions made#### 🔐 Authentication System- Social login buttons (Google, GitHub, Microsoft)

  - Significant insights shared

  - Numbered list format- Sign-up and sign-in form switching



- **✅ Action Items****Sign In Page (`signin.html`)**:- Modern UI with gradient backgrounds

  - Tasks identified during meeting

  - Responsibilities assigned- Email/password authentication- Form validation and error handling

  - Deadlines mentioned

  - Interactive checklist format- Social login integration (Google, GitHub, Microsoft)



- **🎯 Conclusions**- Toggle between sign-in and sign-up modes### 📁 File Upload (`file.html`)

  - Final outcomes and agreements

  - Next steps and follow-ups- Form validation and error handling**Purpose**: Audio file processing with enhanced drag-and-drop

  - Unresolved issues

- Password visibility toggle

- **👥 Participants**

  - Detected speakers from audio- Responsive design**Features**:

  - Speaker contribution analysis

  - Name identification (when available)- **Improved Drag-and-Drop**: Complete rewrite with better event handling



#### 4. User Profile Management (`profile.html`)**Session Management**:- **File Validation**: Supports MP3, WAV, M4A, AAC, OGG, FLAC formats

**Personalize your meeting experience**

- Secure localStorage-based authentication- **Visual Feedback**: Drag states with color changes and animations

- **👤 Personal Information**

  - Full name- Persistent user sessions- **Progress Tracking**: Upload progress with real-time updates

  - Email address

  - Role/Position (dropdown selection)- Auto-login for returning users- **Transcript Output**: Formatted results with speaker identification

  - Company/Organization

  - Department- Logout confirmation modal- **Download Options**: Export transcripts as TXT files



- **🎯 Professional Context**- Session timeout handling

  - **Role Selection**:

    - Developer / Engineer### 🎙️ Real-time Capture (`real.html`)

    - Project Manager

    - Product Manager#### 👤 User Management**Purpose**: Live meeting transcription and recording

    - Designer / UX

    - Business Analyst

    - Executive / C-Level

    - Sales / Marketing**Profile Page (`profile.html`)**:**Features**:

    - HR / Recruiter

    - Other- Personal information management- Simulated real-time audio capture



- **📊 Project Tracking**- Avatar upload and preview- Live transcript streaming with speaker colors

  - Current projects list

  - Add/remove projects dynamically- Email and name updates- Session management and controls

  - Used for contextual AI analysis

- Account settings- Real-time summary generation

- **🔑 Keyword Monitoring**

  - Custom keywords to track- Session history- Export capabilities for meeting data

  - Personalized alerts

  - Important terms for your role- Professional recording interface



- **⚙️ Preferences****Settings Page (`setting.html`)**:

  - Language preference (auto-detect or specific)

  - Notification settings- Theme customization (Dark/Light)### ⚙️ Settings (`setting.html`)

  - Display options

  - Export formats- Accent color selection**Purpose**: Comprehensive application customization



#### 5. Authentication System- Language preferences

**Secure user management with multiple login options**

- Notification settings**Features**:

- **🔐 Sign In / Sign Up (`signin.html`)**

  - Email and password authentication- Privacy controls- **Advanced Theme System**: Dark/light modes with multiple accent colors

  - Toggle between sign-in and sign-up modes

  - Form validation with error messages- Account management- **Theme Options**: Blue, Purple, Green, Orange, Pink, Red accent colors

  - Password visibility toggle

  - Remember me functionality- **Language Selection**: Multiple language options for transcription



- **🌐 Social Login Integration**#### 🎨 UI/UX Excellence- **Audio Settings**: Chunk duration and processing preferences

  - Google OAuth

  - GitHub OAuth- **Notification Settings**: Email alerts and speaker notifications

  - Microsoft OAuth

  - One-click social authentication**Design Features**:- **Data Management**: Clear all user data option



- **💾 Session Management**- Modern gradient backgrounds

  - LocalStorage-based user sessions

  - Persistent login state- Smooth animations and transitions### 👤 Profile (`profile.html`)

  - Automatic token refresh

  - Secure logout with confirmation- Glass-morphism effects**Purpose**: User account and profile management



#### 6. Landing Page (`index.html`)- Responsive navigation

**Professional introduction to AI MOM**

- User avatar system**Features**:

- **🎨 Modern Hero Section**

  - Animated gradient background- Dropdown menus- Personal information editing (name, email, role, team)

  - Feature highlights

  - Call-to-action buttons- Modal dialogs- Avatar upload with real-time preview

  - Responsive design

- Loading states- Account settings and preferences

- **📱 Feature Showcase**

  - Real-time transcription demo- Error displays- User ID and account details display

  - File processing capabilities

  - AI analysis examples- Profile data persistence

  - Browser extension info

**Navigation System**:

- **📊 Statistics & Benefits**

  - Time saved metrics- Sticky top navigation bar## ⚙️ Technical Implementation

  - Accuracy statistics

  - Cost savings- Logo with circular icon design

  - User testimonials

- Page links (Home, Live, File Upload)### File Architecture

- **🚀 Quick Start Guide**

  - Step-by-step instructions- User menu dropdown

  - Visual walkthrough

  - Video tutorials- Authentication status indicator```

  - Documentation links

- Mobile-responsive hamburger menufrontend/

---

├── index.html              # Main homepage with navigation

## 📖 Application Pages

---├── signin.html             # Authentication page with social login

### 1. **index.html** - Landing Page

**Professional introduction and feature showcase**├── file.html               # Enhanced file upload processing



- **Purpose**: Main entry point, marketing, and onboarding## 📁 Project Structure

- **Sections**:

  - Hero with animated background```

  - Feature highlightsfrontend/

  - How it works├── index.html              # Main landing page and dashboard

  - Pricing (if applicable)├── signin.html             # Authentication page (login/signup)

  - FAQ├── real.html               # Real-time audio capture interface

  - Footer with links├── file.html               # Audio file upload and processing

- **Actions**: Navigate to Real-time, File Upload, or Sign In├── profile.html            # User profile management

├── setting.html            # Application settings and preferences

### 2. **real.html** - Real-Time Meeting Capture├── privacy.html            # Privacy policy page

**Live audio transcription and analysis**├── terms.html              # Terms of service page

├── README.md               # This file

- **Purpose**: Capture ongoing meetings with microphone input│

- **Features**:├── assets/

  - Microphone access and recording│   └── favicon.svg         # Application favicon

  - WebSocket connection to backend│

  - Live transcription display├── css/

  - Speaker identification with colors│   ├── landing.css         # Landing page specific styles

  - Personalized notifications│   └── styles.css          # Global styles and common components

  - Session save/restore│

  - Export capabilities└── js/

- **Use Case**: Record meetings, interviews, presentations in real-time    ├── auth.js             # Authentication logic and session management

    ├── avatar-manager.js   # User avatar handling and display

### 3. **file.html** - Audio File Processing    ├── common.js           # Shared utilities and helper functions

**Upload and process pre-recorded audio**    ├── file-processing.js  # Audio file upload and processing logic

    ├── landing-animations.js # Homepage animations and interactions

- **Purpose**: Analyze audio files after meetings    ├── realtime.js         # Real-time capture functionality

- **Features**:    └── settings.js         # Settings page logic

  - Drag-and-drop file upload```

  - Multi-format support

  - Progress tracking### Files Overview

  - AI summary generation

  - Transcript display| File/Folder | Purpose | Status |

  - Export options|-------------|---------|--------|

- **Use Case**: Process recorded meetings, podcasts, interviews| `index.html` | Main landing page | ✅ Active |

| `signin.html` | User authentication | ✅ Active |

### 4. **profile.html** - User Profile| `real.html` | Real-time audio capture | ✅ Active |

**Manage personal information and preferences**| `file.html` | File upload & processing | ✅ Active |

| `profile.html` | User profile management | ✅ Active |

- **Purpose**: Customize AI analysis and notifications| `setting.html` | App settings & preferences | ✅ Active |

- **Features**:| `privacy.html` | Privacy policy | ✅ Active |

  - Personal info editing| `terms.html` | Terms of service | ✅ Active |

  - Role selection| `css/` | Stylesheets directory | ✅ Active |

  - Project management| `js/` | JavaScript modules | ✅ Active |

  - Keyword tracking| `assets/` | Images & icons | ✅ Active |

  - Preference settings

- **Use Case**: Get personalized meeting insights**Note**: All backup files (e.g., `file-backup.html`) have been removed. Only production-ready files remain.



### 5. **signin.html** - Authentication    └── settings.js         # Settings page logic**Type**: Complete authentication flow with social login options

**User login and registration**

```**Storage**: Secure localStorage with session management

- **Purpose**: Secure user authentication

- **Features**:**Features**:

  - Email/password login

  - Social OAuth integration### Files Overview- Sign-in and sign-up with email/password

  - Sign up form

  - Password recovery- Social login integration (Google, GitHub, Microsoft)

  - Session management

- **Use Case**: User account access| File/Folder | Purpose | Status |- Form validation and error handling



### 6. **settings.html** - Application Settings|-------------|---------|--------|- Session persistence across browser sessions

**Configure application behavior**

| `index.html` | Main landing page | ✅ Active |- Secure logout with confirmation modal

- **Purpose**: Customize app settings

- **Features**:| `signin.html` | User authentication | ✅ Active |- Protected route access control

  - Backend URL configuration

  - Language preferences| `real.html` | Real-time audio capture | ✅ Active |

  - Notification settings

  - Audio quality options| `file.html` | File upload & processing | ✅ Active |### Theme System

  - Export format selection

  - Theme customization (if implemented)| `profile.html` | User profile management | ✅ Active |

- **Use Case**: Adjust app behavior to your needs

| `setting.html` | App settings & preferences | ✅ Active |**Implementation**: CSS variables with JavaScript theme switching

### 7. **privacy.html** & **terms.html** - Legal Pages

**Privacy policy and terms of service**| `privacy.html` | Privacy policy | ✅ Active |**Options**:



- **Purpose**: Legal compliance and user transparency| `terms.html` | Terms of service | ✅ Active |- **Modes**: Light and Dark themes

- **Content**: Standard legal documentation

| `css/` | Stylesheets directory | ✅ Active |- **Accent Colors**: Blue, Purple, Green, Orange, Pink, Red

---

| `js/` | JavaScript modules | ✅ Active |- **Persistence**: Settings saved in localStorage

## 🚀 Quick Start

| `assets/` | Images & icons | ✅ Active |- **Scope**: Applied across all pages consistently

### Prerequisites



- **Modern Web Browser**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

- **Backend Server**: AI MOM Backend running on `http://localhost:8000`**Note**: All backup files (e.g., `file-backup.html`) have been removed. Only production-ready files remain.**CSS Variables**:

- **Microphone**: For real-time recording (browser will request permission)

```css

### Installation

-----bg-primary: Theme background color

**No installation required!** This is a pure HTML/CSS/JavaScript application.

--text-primary: Main text color

### Running the Frontend

## 🚀 Getting Started--accent-primary: Primary accent color

#### Option 1: Direct File Open

```bash--accent-secondary: Secondary accent color

# Navigate to frontend folder

cd frontend### Prerequisites--border-color: Border and divider colors



# Open in default browser (Windows)```

start index.html

Before running the application, ensure you have:

# macOS

open index.html### Enhanced Features



# Linux- ✅ **Modern Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

xdg-open index.html

```- ✅ **Microphone Access**: Required for real-time capture features#### 🎨 Logo Design



#### Option 2: Local Web Server (Recommended)- ✅ **JavaScript Enabled**: Essential for all interactive features- **Circular Avatar Icons**: Modern SVG-based user icons

```bash

# Using Python- ✅ **localStorage Support**: For authentication and settings persistence- **Gradient Backgrounds**: Beautiful color transitions

cd frontend

python -m http.server 8080- **Consistent Branding**: Applied across all pages

# Visit: http://localhost:8080

### Installation- **Scalable Design**: Vector-based for all screen sizes

# Using Node.js

npx http-server frontend -p 8080



# Using PHP**Option 1: Direct Browser Access**#### 📤 File Upload System

php -S localhost:8080 -t frontend

``````bash- **Complete Rewrite**: Enhanced drag-and-drop functionality



#### Option 3: Use Launcher Script# Simply open index.html in your browser- **Better Event Handling**: Proper drag event management

```bash

# From project rootopen index.html- **Visual Feedback**: Drag states with smooth transitions

start_frontend.bat  # Windows

```# or double-click the file- **File Validation**: Format checking with user feedback



### First-Time Setup```- **Error Handling**: Comprehensive error management



1. **Start Backend**:

   ```bash

   cd backend**Option 2: Python HTTP Server (Recommended)**#### 🚪 Logout Confirmation

   python main.py

   # Wait for: "Uvicorn running on http://localhost:8000"```bash- **Beautiful Modal**: Glass-morphism design with blur effects

   ```

# Navigate to the frontend folder- **Smooth Animations**: Fade-in/out with scale transitions

2. **Open Frontend**:

   - Navigate to `frontend/index.html`cd p:/frontback/frontend- **User-Friendly**: Prevents accidental logouts

   - Or visit `http://localhost:8080` if using web server

- **Consistent Implementation**: Applied across all pages

3. **Test Connection**:

   - Go to `real.html` or `file.html`# Start server on port 8080

   - Click "Test Connection" button

   - Should show "Connected ✅"python -m http.server 8080#### 🎭 Social Login



4. **Configure Settings** (Optional):- **Multiple Providers**: Google, GitHub, Microsoft integration

   - Go to `settings.html`

   - Set backend URL: `http://localhost:8000`# Open browser to http://localhost:8080- **Modern UI**: Beautiful button designs with brand colors

   - Choose language preference

   - Save settings```- **SVG Icons**: High-quality social media icons



5. **Create Profile** (Optional):- **Responsive**: Adapts to different screen sizes

   - Go to `profile.html`

   - Fill in your information**Option 3: Node.js HTTP Server**

   - Add projects and keywords

   - Save profile```bash### Performance Optimizations



---# Install http-server globally (one time)



## 📁 File Structurenpm install -g http-server- **Efficient Event Handling**: Proper event delegation and cleanup



```- **Optimized Animations**: GPU-accelerated CSS transforms

frontend/

├── index.html              # Landing page# Navigate to the frontend folder- **Lazy Loading**: Components loaded as needed

├── real.html               # Real-time capture interface

├── file.html               # File upload interfacecd p:/frontback/frontend- **Minimal Dependencies**: Pure vanilla JavaScript implementation

├── profile.html            # User profile management

├── signin.html             # Authentication page- **Compressed Assets**: Optimized SVG icons and images

├── settings.html           # App settings

├── privacy.html            # Privacy policy# Start server

├── terms.html              # Terms of service

│http-server -p 8080### Browser Compatibility

├── css/

│   ├── styles.css          # Main stylesheet (shared across pages)

│   └── landing.css         # Landing page specific styles

│# Open browser to http://localhost:8080- **Chrome**: 90+ ✅

├── js/

│   ├── auth.js             # Authentication logic```- **Firefox**: 88+ ✅

│   ├── avatar-manager.js   # User avatar management

│   ├── common.js           # Shared utilities- **Safari**: 14+ ✅

│   ├── file-processing.js  # File upload and processing

│   ├── realtime.js         # Real-time capture logic**Option 4: VS Code Live Server**- **Edge**: 90+ ✅

│   ├── settings.js         # Settings management

│   └── landing-animations.js  # Landing page animations```bash- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+ ✅

│

├── assets/# Install "Live Server" extension in VS Code

│   └── favicon.svg         # App icon

│# Right-click on index.html## 🎯 User Experience

└── README.md               # This file

```# Select "Open with Live Server"



### JavaScript Modules```### Navigation Flow



#### **auth.js** - Authentication Management1. **Landing**: Welcome page with authentication status

```javascript

// Functions:### First Run2. **Sign In**: Authentication with multiple options

- handleSignIn(email, password)

- handleSignUp(email, password, name)3. **Dashboard**: Access to all main features

- handleSocialLogin(provider)

- logout()1. **Open the Application**: Navigate to `http://localhost:8080` (or your chosen port)4. **Feature Pages**: Specialized interfaces for each function

- checkAuthState()

- isAuthenticated()2. **Sign In/Sign Up**: 5. **Settings**: Comprehensive customization options

```

   - Use any email/password for demo mode6. **Profile**: Personal account management

#### **common.js** - Shared Utilities

```javascript   - Or create a new account via the sign-up form

// Functions:

- formatTimestamp(seconds)3. **Explore Features**:### Design Principles

- formatDuration(seconds)

- showNotification(message, type)   - **Home**: Overview and navigation- **Consistency**: Unified design language across all pages

- testBackendConnection()

- getSpeakerColor(speakerId)   - **Live**: Real-time audio capture- **Accessibility**: Proper contrast ratios and keyboard navigation

- downloadTextFile(content, filename)

```   - **File Upload**: Process audio files- **Responsiveness**: Optimal experience on all devices



#### **realtime.js** - Real-Time Capture   - **Settings**: Customize your experience- **Performance**: Fast loading and smooth interactions

```javascript

// Functions:- **User-Centric**: Intuitive navigation and clear feedback

- initializeWebSocket()

- startRecording()---

- stopRecording()

- sendAudioChunk(audioData)### Visual Hierarchy

- handleTranscription(data)

- updateTranscriptDisplay()## 📄 Pages & Functionality- **Clear Navigation**: Prominent top navigation bar

- saveSession()

- restoreSession()- **Logical Grouping**: Related features grouped together

```

### 🏠 Homepage (`index.html`)- **Visual Feedback**: Hover states and loading indicators

#### **file-processing.js** - File Upload

```javascript- **Error Handling**: Clear error messages and recovery options

// Functions:

- handleFileSelect(file)**Purpose**: Main entry point and navigation hub

- validateFile(file)

- uploadFile(file)## 🔧 Customization

- displayProgress(percentage)

- processResponse(data)**Key Features**:

- displaySummary(summary)

- displayTranscript(transcript)- Welcome message and application introduction### Theme Customization

```

- Quick access to all major featuresUsers can customize the application appearance through the Settings page:

---

- User authentication status display

## 🎨 UI Components

- Responsive navigation bar1. **Theme Mode**: Toggle between Light and Dark modes

### Design System

- Feature highlights and benefits2. **Accent Colors**: Choose from 6 different color schemes

#### Color Palette

```css- Call-to-action buttons3. **Persistence**: All settings automatically saved

/* Primary Colors */

--primary-color: #2196F3;        /* Blue - Main actions */4. **Real-time Preview**: Changes applied immediately

--primary-dark: #1976D2;         /* Dark Blue - Hover states */

--primary-light: #BBDEFB;        /* Light Blue - Backgrounds */**Navigation Elements**:



/* Secondary Colors */- Logo with circular icon design### Feature Configuration

--secondary-color: #4CAF50;      /* Green - Success */

--accent-color: #FF9800;         /* Orange - Warnings */- Page links (Home, Live, File Upload)- **Language Settings**: Transcription language preferences

--danger-color: #F44336;         /* Red - Errors */

- User menu dropdown (Profile, Settings, Logout)- **Audio Processing**: Chunk duration and quality settings

/* Speaker Colors (8 distinct colors for speaker diarization) */

--speaker-0: #2196F3;  /* Blue */- Authentication buttons (Sign In/Sign Up)- **Notifications**: Email alerts and speaker notifications

--speaker-1: #4CAF50;  /* Green */

--speaker-2: #FF9800;  /* Orange */- **Data Management**: Export and clear data options

--speaker-3: #9C27B0;  /* Purple */

--speaker-4: #F44336;  /* Red */---

--speaker-5: #00BCD4;  /* Cyan */

--speaker-6: #FFEB3B;  /* Yellow */## 📊 Features Summary

--speaker-7: #795548;  /* Brown */

### 🔐 Sign In Page (`signin.html`)

/* Neutral Colors */

--background: #F5F5F5;| Feature | Status | Description |

--surface: #FFFFFF;

--text-primary: #212121;**Purpose**: User authentication and account management|---------|--------|-------------|

--text-secondary: #757575;

--border: #E0E0E0;| 🏠 Homepage Navigation | ✅ Complete | Modern navigation with user menu |

```

**Authentication Methods**:| 🔐 Authentication System | ✅ Complete | Sign-in/up with social login options |

#### Typography

```css1. **Email/Password Login**| 📁 File Upload | ✅ Enhanced | Improved drag-and-drop with validation |

/* Font Family */

font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;   - Email validation| 🎙️ Real-time Capture | ✅ Complete | Live transcription simulation |



/* Font Sizes */   - Password visibility toggle| ⚙️ Advanced Settings | ✅ Complete | Theme system with multiple options |

--font-xs: 12px;

--font-sm: 14px;   - Remember me option| 👤 Profile Management | ✅ Complete | User information and avatar upload |

--font-md: 16px;

--font-lg: 18px;   - Error handling| 🚪 Logout Confirmation | ✅ Complete | Beautiful modal confirmation system |

--font-xl: 24px;

--font-2xl: 32px;| 🎨 Logo Design | ✅ Complete | Consistent branding throughout |

--font-3xl: 48px;

```2. **Social Login** (UI Demo)| 📱 Responsive Design | ✅ Complete | Mobile-optimized interfaces |



#### Spacing   - Google Sign-In| 🎭 Social Login UI | ✅ Complete | Google, GitHub, Microsoft buttons |

```css

/* Spacing Scale (8px base) */   - GitHub Authentication

--space-xs: 4px;

--space-sm: 8px;   - Microsoft Account## 🚀 Getting Started Guide

--space-md: 16px;

--space-lg: 24px;

--space-xl: 32px;

--space-2xl: 48px;**Features**:### For Users

```

- Toggle between sign-in and sign-up modes1. Open the application in a modern web browser

### Reusable Components

- Form validation with real-time feedback2. Sign in with any email/password or use social login

#### Buttons

```html- Secure password handling3. Explore the navigation menu for different features

<!-- Primary Button -->

<button class="btn btn-primary">Start Recording</button>- Responsive design for all devices4. Customize your experience in Settings



<!-- Secondary Button -->- Beautiful gradient backgrounds5. Upload audio files or use real-time capture

<button class="btn btn-secondary">Cancel</button>

- Smooth transitions and animations6. Manage your profile and preferences

<!-- Danger Button -->

<button class="btn btn-danger">Delete</button>



<!-- Icon Button -->**User Flow**:### For Developers

<button class="btn btn-icon">

  <i class="icon-play"></i>```1. Clone or download the project files

</button>

```Landing Page → Sign In → Authentication → Dashboard2. Serve the files using a local HTTP server



#### Cards     ↓3. No build process required - pure HTML/CSS/JS

```html

<div class="card">  Sign Up → Account Creation → Auto Sign-In → Dashboard4. Modify themes using CSS variables

  <div class="card-header">

    <h3>Card Title</h3>```5. Extend functionality with additional JavaScript modules

  </div>

  <div class="card-body">6. Test across different browsers and devices

    <p>Card content goes here</p>

  </div>---

  <div class="card-footer">

    <button class="btn btn-primary">Action</button>---

  </div>

</div>### 🎙️ Real-Time Capture (`real.html`)

```

**AI MOM Frontend** - A comprehensive meeting assistant with modern UI/UX and professional features. Built with vanilla web technologies for maximum compatibility and performance.

#### Input Fields

```html**Purpose**: Live audio transcription and meeting management```

<div class="form-group">

  <label for="input-id">Label</label>

  <input type="text" id="input-id" class="form-control" placeholder="Enter text">

  <span class="form-help">Helper text</span>**Interface Components**:### 2. Test with Demo Account

</div>

```



#### Notifications1. **Connection Panel**Use the pre-configured demo account:

```html

<div class="notification notification-success">   - Meeting ID input

  <i class="icon-check"></i>

  <span>Success message!</span>   - Language selection dropdown```

</div>

   - Connect/Disconnect buttonEmail: admin@example.com

<div class="notification notification-error">

  <i class="icon-alert"></i>   - Connection status indicatorPassword: admin123

  <span>Error message!</span>

</div>```

```

2. **Recording Controls**

---

   - Start/Stop recording buttonThis account is automatically created when you first load any page.

## 🔌 Backend Integration

   - Microphone level visualization

### WebSocket Connection (Real-Time)

   - Recording status display### 3. Explore Features

#### Connecting

```javascript   - Timer display

// In realtime.js

const ws = new WebSocket('ws://localhost:8000/ws/audio');- **Home Page**: `index.html` (simple) or `landing.html` (enhanced with animations)



ws.onopen = () => {3. **Transcript Display**- **Real-time Capture**: `realtime.html` (requires login)

  console.log('WebSocket connected');

  updateConnectionStatus('connected');   - Live transcript feed- **File Upload**: `file-processing.html` (requires login)

};

   - Speaker identification- **Settings**: `settings.html` (theme toggle, preferences)

ws.onmessage = (event) => {

  const data = JSON.parse(event.data);   - Timestamp for each entry- **Profile**: `profile.html` (avatar upload, user info)

  handleMessage(data);

};   - Auto-scroll to latest



ws.onerror = (error) => {   - Color-coded speakersOr access via the backend server:

  console.error('WebSocket error:', error);

  updateConnectionStatus('error');- `http://localhost:8000/frontend/realtime_capture.html`

};

4. **Action Buttons**- `http://localhost:8000/frontend/audio_processing.html`

ws.onclose = () => {

  console.log('WebSocket closed');   - Clear transcript- `http://localhost:8000/frontend/profile_settings.html`

  updateConnectionStatus('disconnected');

};   - Save session locally

```

   - Download transcript## 📱 Application Pages

#### Sending Audio

```javascript   - Download AI summary

// Convert Float32Array to Int16Array

function convertFloat32ToInt16(buffer) {### 1. Landing Page (`landing.html`) ⭐ NEW

  const int16 = new Int16Array(buffer.length);

  for (let i = 0; i < buffer.length; i++) {**Audio Processing**:

    const s = Math.max(-1, Math.min(1, buffer[i]));

    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;- Real-time audio stream capture**Purpose**: Enhanced home page with scroll animations

  }

  return int16;- Speaker diarization

}

- Timestamp synchronization**Key Features**:

// Send audio chunk

function sendAudioChunk(audioBuffer) {- Session persistence- Hero section with gradient background and parallax effect

  const int16Data = convertFloat32ToInt16(audioBuffer);

  const base64Data = btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)));- 2 large feature cards that slide in from left/right on scroll

  

  ws.send(JSON.stringify({**Export Formats**:- 6 grid feature cards with alternating slide animations

    type: 'audio',

    data: base64Data,- Plain text transcripts with timestamps- Smooth hover effects and 3D tilt

    format: 'int16',

    sampleRate: 16000- AI-generated summaries with sections- Call-to-action sections

  }));

}- Enhanced footer with branding

```

---

#### Receiving Transcription

```javascript**Animations**:

function handleMessage(data) {

  if (data.type === 'transcription') {### 📁 File Processing (`file.html`)- Real-time Capture card slides from LEFT

    // Display transcription

    addTranscriptSegment({- Audio Processing card slides from RIGHT

      speaker: data.speaker,

      text: data.text,**Purpose**: Upload and process pre-recorded audio files- Grid cards alternate: left, right, left, right, left, right

      timestamp: data.timestamp,

      isFinal: data.is_final- Icons have gentle float and bounce effects

    });

  } else if (data.type === 'summary') {**Upload Methods**:- 3D tilt on hover for large cards

    // Display AI summary

    displaySummary(data.summary);

  } else if (data.type === 'error') {

    // Handle error1. **Drag-and-Drop**### 2. Home Page (`index.html`)

    showNotification(data.message, 'error');

  }   - Visual feedback on drag-over

}

```   - Drop zone highlighting**Purpose**: Simple, clean home page



### REST API (File Upload)   - File validation on drop



#### Upload File   - Error messages for invalid files**Key Features**:

```javascript

async function uploadFile(file) {- Quick overview of features

  const formData = new FormData();

  formData.append('file', file);2. **Click-to-Upload**- Direct access to main functions

  

  try {   - Traditional file browser- Minimal design

    const response = await fetch('http://localhost:8000/api/process-audio', {

      method: 'POST',   - File type filtering- Fast loading

      body: formData

    });   - Multiple format support

    

    if (!response.ok) {### 3. Real-time Capture (`realtime.html`) 🔒

      throw new Error(`HTTP error! status: ${response.status}`);

    }**Supported Formats**:

    

    const data = await response.json();- MP3 (MPEG Audio)**Purpose**: Live meeting transcription with real-time speaker alerts

    processResponse(data);

    - WAV (Waveform Audio)

  } catch (error) {

    console.error('Upload error:', error);- M4A (MPEG-4 Audio)**Key Features**:

    showNotification('Failed to upload file', 'error');

  }- AAC (Advanced Audio Coding)- Live audio capture and transcription (demo mode)

}

```- OGG (Ogg Vorbis)- Real-time speaker identification with color coding



#### Process Response- FLAC (Free Lossless Audio Codec)- Simulated transcript streaming

```javascript

function processResponse(data) {- Download transcript as TXT/JSON

  // Display transcript

  displayTranscript(data.transcript, data.speakers);**Processing Pipeline**:- Session data persistence

  

  // Display AI summary- **Protected Route**: Requires authentication

  if (data.summary) {

    displaySummary(data.summary);```

  }

  File Upload → Validation → Processing → Transcription → AI Analysis → Results**Demo Mode**:

  // Show statistics

  showStats({```- Simulates live transcription with random speakers

    wordCount: data.word_count,

    processingTime: data.processing_time,- Color-coded speaker segments

    speakerCount: Object.keys(data.speakers).length

  });**Processing Steps**:- Auto-scrolling transcript view

}

```1. **File Validation**



---   - Type checking### 4. File Upload Processing (`file-processing.html`) 🔒



## 🔐 Authentication System   - Size verification (100MB max)



### LocalStorage-Based Session Management   - Extension validation**Purpose**: Process pre-recorded audio files



```javascript

// Sign In

async function handleSignIn(email, password) {2. **Upload Simulation****Key Features**:

  try {

    const response = await fetch('http://localhost:8000/api/auth/signin', {   - Progress bar visualization- Drag & drop file upload interface

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },   - Status text updates- Simulated file processing with progress bar

      body: JSON.stringify({ email, password })

    });   - Error handling- Speaker-formatted transcript output

    

    const data = await response.json();- Download results as TXT/JSON

    

    if (data.success) {3. **Transcription Display**- **Protected Route**: Requires authentication

      // Store user session

      localStorage.setItem('user', JSON.stringify({   - Speaker-separated transcript

        email: data.user.email,

        name: data.user.name,   - Color-coded speakers**Demo Mode**:

        token: data.token,

        loginTime: Date.now()   - Formatted text blocks- Accepts any audio file

      }));

      - Shows realistic upload progress

      // Redirect to dashboard

      window.location.href = 'index.html';4. **AI Summary Generation**- Generates sample transcript

    }

  } catch (error) {   - Meeting overview

    showNotification('Sign in failed', 'error');

  }   - Key points extraction### 5. Profile Management (`profile.html`)

}

   - Action items list

// Check Auth State

function checkAuthState() {   - Conclusions summary**Purpose**: User profile customization

  const user = localStorage.getItem('user');

     - Participant identification

  if (!user) {

    // Redirect to sign in**Key Features**:

    if (!window.location.pathname.includes('signin.html')) {

      window.location.href = 'signin.html';**Download Options**:- Avatar upload with preview

    }

    return false;- Full transcript (.txt)- Personal information (name, email, role, team)

  }

  - AI summary (.txt)- User ID display

  const userData = JSON.parse(user);

  - Data saved to localStorage

  // Check if session expired (24 hours)

  const sessionDuration = Date.now() - userData.loginTime;**Backend Integration Points**:- Real-time navbar avatar update

  if (sessionDuration > 24 * 60 * 60 * 1000) {

    localStorage.removeItem('user');```javascript

    window.location.href = 'signin.html';

    return false;// Ready for backend API integration### 6. Settings (`settings.html`)

  }

  // Replace demo data with actual API calls:

  return true;

}**Purpose**: Application preferences and customization



// Logout// Example structure for backend response

function logout() {

  if (confirm('Are you sure you want to log out?')) {{**Key Features**:

    localStorage.removeItem('user');

    window.location.href = 'signin.html';  "transcript": [- **Dark Mode Toggle** with instant theme switching

  }

}    { "speaker": "Speaker 1", "text": "...", "timestamp": "00:00:12" }- Language selection (English, Spanish, French, German, etc.)

```

  ],- Chunk duration for transcription

---

  "summary": {- Speaker alerts ON/OFF

## 📱 Browser Support

    "overview": "Meeting summary...",- Auto-summary generation toggle

### Fully Supported

    "keyPoints": ["Point 1", "Point 2"],- Email notifications toggle

| Browser | Version | Notes |

|---------|---------|-------|    "actionItems": ["Action 1", "Action 2"],- **Clear All User Data** button

| **Chrome** | 90+ | ✅ Full support, recommended |

| **Edge** | 90+ | ✅ Full support (Chromium-based) |    "conclusions": ["Conclusion 1"],- All settings persist in localStorage

| **Firefox** | 88+ | ✅ Full support |

| **Safari** | 14+ | ✅ Full support with WebRTC |    "participants": ["Name 1", "Name 2"]

| **Opera** | 76+ | ✅ Full support |

  }## ⚙️ Technical Details

### Required Browser Features

}

- ✅ **WebSocket API** - For real-time communication

- ✅ **MediaRecorder API** - For audio recording```### File Structure

- ✅ **getUserMedia API** - For microphone access

- ✅ **FileReader API** - For file upload

- ✅ **LocalStorage API** - For session management

- ✅ **Fetch API** - For HTTP requests---```

- ✅ **ES6+ JavaScript** - Modern JavaScript features

frontend/

### Mobile Support

### 👤 Profile Page (`profile.html`)├── index.html              # Simple home page

- **iOS Safari 14+**: Partial support (WebRTC limitations)

- **Chrome Android 90+**: Full support├── landing.html            # Enhanced home page with animations ⭐

- **Firefox Android 88+**: Full support

**Purpose**: Manage user information and settings├── realtime.html           # Real-time capture (protected)

**Note**: Real-time recording requires microphone permissions on mobile devices.

├── file-processing.html    # File upload (protected)

---

**Features**:├── settings.html           # User preferences

## 🔧 Customization

- **Personal Information**├── profile.html            # User profile management

### Changing Backend URL

  - Full name editing├── css/

**In JavaScript files (common.js, realtime.js, file-processing.js):**

```javascript  - Email address display/edit│   ├── styles.css          # Main design system

// Find and replace

const BACKEND_URL = 'http://localhost:8000';  - Phone number (optional)│   └── landing.css         # Animation styles ⭐



// Change to your backend URL  - Bio/description├── js/

const BACKEND_URL = 'https://your-backend.example.com';

│   ├── common.js           # Auth, theme, shared utilities

// For WebSocket

const WS_URL = 'ws://localhost:8000/ws/audio';- **Avatar Management**│   ├── landing-animations.js  # Scroll animations ⭐

// Change to

const WS_URL = 'wss://your-backend.example.com/ws/audio';  - Upload profile picture│   ├── realtime.js         # Real-time demo logic

```

  - Avatar preview│   ├── file-processing.js  # Upload demo logic

### Customizing Colors

  - Default initial-based avatar│   └── settings.js         # Settings persistence

**In styles.css:**

```css  - Delete avatar option└── assets/

:root {

  /* Change primary color */    └── favicon.svg         # App icon

  --primary-color: #yourcolor;

  - **Account Statistics**```

  /* Change speaker colors */

  --speaker-0: #yourcolor;  - Total meetings processed

  --speaker-1: #yourcolor;

  /* ... etc */  - Audio files uploaded### Technologies Used

}

```  - Storage usage



### Adding New Pages  - Member since date- **HTML5** - Semantic markup



1. **Create HTML file** in `frontend/` folder- **CSS3** - Modern styling with animations

2. **Link CSS**:

   ```html- **Data Management**- **Vanilla JavaScript** - No frameworks, pure ES6+

   <link rel="stylesheet" href="css/styles.css">

   ```  - Export user data- **localStorage** - Client-side data persistence

3. **Include common JS**:

   ```html  - Delete account option- **Intersection Observer API** - Efficient scroll animations

   <script src="js/common.js"></script>

   ```  - Privacy settings link- **CSS Transforms & Transitions** - GPU-accelerated animations

4. **Add navigation** in header

5. **Update menu** in other pages- **Flexbox & Grid** - Responsive layouts



------



## 🐛 Troubleshooting### Authentication System



### Common Issues### ⚙️ Settings Page (`setting.html`)



#### 1. "WebSocket connection failed"- **Type**: Modal-based (centered popup)



**Symptoms**: Real-time page shows disconnected status**Purpose**: Customize application behavior and appearance- **Storage**: localStorage with password hashing (btoa)



**Solutions**:- **Demo Account**: Auto-created admin@example.com / admin123

1. Check backend is running: `curl http://localhost:8000/health`

2. Verify WebSocket URL in `realtime.js` is correct**Settings Categories**:- **Protected Routes**: realtime.html, file-processing.html

3. Check browser console for errors

4. Try changing `localhost` to `127.0.0.1`- **Features**:

5. Check firewall settings

1. **Appearance**  - Sign in / Sign up with inline validation

#### 2. "Microphone access denied"

   - Theme selection (Dark/Light)  - Email format validation

**Symptoms**: Cannot start recording

   - Accent color picker  - Password strength check (min 6 chars)

**Solutions**:

1. Click browser's address bar microphone icon   - Font size adjustment  - Password confirmation matching

2. Allow microphone access

3. Reload page and try again   - Layout preferences  - Auto-login after signup

4. Check browser settings → Site permissions

5. Ensure using HTTPS (required by some browsers) or localhost  - Avatar dropdown menu



#### 3. "File upload fails"2. **Audio Settings**  - Logout redirects to home page



**Symptoms**: Error when uploading audio file   - Microphone selection



**Solutions**:   - Audio quality settings### Theme System

1. Check file format is supported (MP3, WAV, M4A, etc.)

2. Verify file size is under 100MB   - Noise reduction toggle

3. Check backend is running and accessible

4. Check browser console for errors   - Volume controls- **Light Mode** (default): Clean white backgrounds

5. Try with different file

- **Dark Mode**: Professional dark gray (#0b1020)

#### 4. "No transcription appearing"

3. **Transcription**- **Toggle Location**: Settings page

**Symptoms**: Audio uploads but no text shows

   - Default language- **Persistence**: Saved in localStorage

**Solutions**:

1. Check backend logs for errors   - Auto-save options- **Scope**: All pages support both themes

2. Verify audio file has audible speech

3. Try with different audio file   - Speaker diarization settings- **Fixed Issues**: 

4. Check network tab in browser DevTools

5. Ensure backend has API keys configured   - Timestamp format  - ✅ No white border in dark mode



#### 5. "Styles not loading"  - ✅ Theme persists after login/signup



**Symptoms**: Page looks unstyled4. **Notifications**



**Solutions**:   - Email notifications### Animation System ⭐

1. Check CSS file paths are correct

2. Clear browser cache (Ctrl+Shift+Delete)   - Browser notifications

3. Check browser console for 404 errors

4. Verify `css/styles.css` exists   - Sound alerts- **Library**: None (pure CSS + vanilla JS)

5. Try hard reload (Ctrl+Shift+R)

   - Notification frequency- **Trigger**: Intersection Observer API

---

- **Performance**: GPU-accelerated transforms

## 🚀 Performance Optimization

5. **Privacy & Security**- **Animations**:

### Best Practices

   - Session timeout duration  - **Large Feature Cards**: Slide from left/right (60px, 0.5s)

1. **Audio Quality**:

   - Use 16kHz sample rate for real-time (optimal for Whisper)   - Auto-logout settings  - **Grid Cards**: Alternating slide left/right (40px, 0.4s)

   - Compress large files before upload

   - Use MP3 or M4A for smaller file sizes   - Data retention preferences  - **Icons**: Float (12px, 4s) and Bounce (6px, 3s)



2. **WebSocket**:   - Analytics opt-in/out  - **Hero**: Parallax background (0.3x scroll speed)

   - Send audio chunks every 1-2 seconds

   - Don't send too frequently (causes overhead)  - **Hover**: 3D tilt (±1.5deg) and lift effects

   - Handle connection drops gracefully

6. **Account**- **Observer Settings**:

3. **File Upload**:

   - Show progress indicator   - Change password  - Threshold: 0.15 (15% visible)

   - Implement chunked upload for large files

   - Validate files before upload   - Email preferences  - Root margin: -80px



4. **Browser Performance**:   - Delete account  - Staggered delays: 100-120ms

   - Limit transcript history (clear old messages)

   - Use virtual scrolling for large transcripts   - Export data  - Unobserve after animation for performance

   - Debounce rapid updates



---

---### Color Palette

## 📚 Additional Resources



### Documentation

- **Main README**: [../README.md](../README.md)### 📜 Legal Pages**Primary Colors:**

- **Backend Docs**: [../backend/README.md](../backend/README.md)

- **Extension Docs**: [../extension/README.md](../extension/README.md)- Indigo 500: `#6366f1`



### Web APIs**Privacy Policy (`privacy.html`)**:- Violet 500: `#8b5cf6`

- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)- Data collection practices- Purple 500: `#a855f7`

- [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

- Usage of personal information- Green (success): `#22c55e`

---

- Cookie policy- Red (danger): `#ef4444`

<div align="center">

- Third-party services

**Built with ❤️ using vanilla JavaScript**

- User rights**Backgrounds:**

[⬆ Back to Top](#-ai-mom-frontend---intelligent-meeting-management-interface)

- Contact information- Light mode: `#f7f8fb`

</div>

- Dark mode: `#0b1020`

**Terms of Service (`terms.html`)**:- Cards (light): `#ffffff`

- Acceptable use policy- Cards (dark): `#151c35`

- User responsibilities

- Service limitations**Gradients:**

- Intellectual property- Hero: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)`

- Liability disclaimers- CTA: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`

- Termination conditions- Footer: `linear-gradient(180deg, #1e293b 0%, #0f172a 100%)`



---## 🎨 UI/UX Features



## 🛠️ Technologies Used### Scroll Animations (landing.html)



### Frontend Stack**Large Feature Cards (2 cards):**

1. **Real-time Capture** - Slides from left with green gradient icon

**Core Technologies**:2. **Audio Processing** - Slides from right with red gradient icon

- **HTML5**: Semantic markup and structure

- **CSS3**: Modern styling with animations**Grid Cards (6 cards with alternating slides):**

- **JavaScript (ES6+)**: Interactive functionality1. AI Summaries (LEFT) ⬅️

2. Speaker Diarization (RIGHT) ➡️

**CSS Features**:3. Session Persistence (LEFT) ⬅️

- CSS Grid & Flexbox for layouts4. Smart Alerts (RIGHT) ➡️

- CSS Variables for theming5. Analytics Dashboard (LEFT) ⬅️

- CSS Animations & Transitions6. 100% Free & Secure (RIGHT) ➡️

- Media queries for responsiveness

- Glass-morphism effects**Visual Effects:**

- Gradient backgrounds- Smooth slide animations on scroll

- 3D tilt effect on hover

**JavaScript Features**:- Floating icon animations

- ES6+ syntax (arrow functions, template literals, destructuring)- Parallax hero background

- DOM manipulation- Gentle bounce on icons

- Event handling

- LocalStorage API### Protected Routes

- File API for uploads

- Drag and Drop API**Real-time Capture & File Upload require authentication:**

- Promises and async/await ready- Clicking these links shows sign-in modal if not logged in

- Direct navigation to URLs also triggers auth check

**Browser APIs Used**:- After login, user is taken to requested page

- `localStorage` - Session and settings persistence- Logout redirects to home page (not reload current page)

- `File API` - Audio file handling

- `Drag and Drop API` - Enhanced upload UX### Modal Authentication

- `MediaRecorder API` - Real-time audio capture (ready)

- `Fetch API` - Backend communication (ready)**Centered Popup Design:**

- Smooth fade-in animation

---- Backdrop blur effect

- Tab switching (Sign in / Sign up)

---

## � Advanced Features

### WebRTC & Real-Time Audio Processing

**Audio Capture Implementation**:
```javascript
// Web Audio API integration for real-time processing
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    
    // Real-time audio analysis
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Continuous audio level monitoring
    function updateAudioLevels() {
      analyser.getByteFrequencyData(dataArray);
      // Update visual indicators
      requestAnimationFrame(updateAudioLevels);
    }
    updateAudioLevels();
  });
```

**WebSocket Communication**:
```javascript
// Real-time transcription via WebSocket
const ws = new WebSocket(`${config.WS_URL}/meeting/${meetingId}`);

ws.onopen = () => {
  console.log('Connected to transcription service');
  ws.send(JSON.stringify({ 
    type: 'start', 
    meetingId: meetingId,
    language: 'en' 
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'transcript') {
    addTranscriptLine(data.speaker, data.text, data.timestamp);
    checkForAlerts(data.text); // Trigger speaker alerts
  }
};
```

### Speaker Alerts System

**Alert Types**:
- **Personal Alerts** 🚨: When your name is mentioned
- **Keyword Alerts** ⚠️: Custom keywords from profile
- **Question Alerts** ❓: When questions are asked
- **Action Alerts** ✅: When action items are mentioned

**Implementation**:
```javascript
// Speaker alert detection
function checkForAlerts(transcriptText) {
  const userProfile = getUserProfile();
  const alertTriggers = [
    ...userProfile.name.split(' '), // Name parts
    ...userProfile.keywords,        // Custom keywords
    'question', 'please', 'can you', 'thoughts'
  ];
  
  const lowerText = transcriptText.toLowerCase();
  const triggeredAlerts = alertTriggers.filter(trigger => 
    lowerText.includes(trigger.toLowerCase())
  );
  
  if (triggeredAlerts.length > 0) {
    showAlertNotification(triggeredAlerts[0], transcriptText);
  }
}

// Visual alert display
function showAlertNotification(trigger, context) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'speaker-alert';
  alertDiv.innerHTML = `
    <div class="alert-icon">🚨</div>
    <div class="alert-content">
      <strong>Mentioned:</strong> "${trigger}"
      <div class="alert-context">${context}</div>
    </div>
  `;
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => alertDiv.remove(), 5000);
  document.body.appendChild(alertDiv);
}
```

### Advanced UI Animations

**Theme Transitions**:
```css
/* Smooth theme switching */
:root {
  --theme-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  transition: var(--theme-transition);
}

/* Theme-specific overrides */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #333333;
}
```

**Micro-Interactions**:
```css
/* Button hover effects */
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Loading animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Progress bar animations */
.progress-bar {
  transition: width 0.3s ease;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}
```

**Glass-Morphism Effects**:
```css
/* Logout confirmation modal */
.modal-glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### Performance Optimizations

**Efficient Event Handling**:
```javascript
// Debounced scroll handler
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized scroll listener
window.addEventListener('scroll', debounce(() => {
  // Handle scroll animations
  updateScrollAnimations();
}, 16)); // ~60fps
```

**Memory Management**:
```javascript
// Clean up event listeners
function cleanup() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
  
  if (audioContext) {
    audioContext.close();
  }
  
  // Remove all event listeners
  elements.forEach(el => {
    el.replaceWith(el.cloneNode(true)); // Removes all listeners
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
```

---

## 📂 File Architecture

- Email format checking

### HTML Files- Password strength (min 6 chars)

- Password confirmation matching

| File | Purpose | Key Features |- Close on backdrop click or X button

|------|---------|--------------|

| `index.html` | Landing page | Navigation, authentication, feature showcase |### Avatar System

| `signin.html` | Authentication | Login, signup, social auth |

| `real.html` | Live capture | Real-time transcription, recording controls |**Profile Picture Upload:**

| `file.html` | File processing | Upload, drag-drop, AI analysis |- Click avatar area to upload image

| `profile.html` | User profile | Personal info, avatar, account stats |- Preview before saving

| `setting.html` | Settings | Preferences, themes, privacy |- Stored as Data URL in localStorage

| `privacy.html` | Privacy policy | Legal information, data practices |- Updates navbar avatar in real-time

| `terms.html` | Terms of service | Usage terms, agreements |- Default: User initials in circle



### CSS Files## 🧪 Demo Mode



**`css/styles.css`** (Global Styles)Since this is a frontend-only demo, all backend features are simulated:

```css

/* Contains: */### Real-time Transcription Demo

- Reset and base styles- Simulates WebSocket connection

- Typography system- Generates random speaker segments

- Color variables- Auto-scrolls transcript view

- Common components (buttons, forms, cards)- Shows realistic timing delays

- Utility classes- Color-coded speakers (4 colors)

- Responsive breakpoints- Download as TXT/JSON

- Animation definitions

```### File Upload Demo

- Accepts any audio file

**`css/landing.css`** (Homepage Specific)- Shows realistic progress bar (0-100%)

```css- Generates sample transcript after "processing"

/* Contains: */- Simulates speaker diarization

- Hero section styles- Download results as TXT/JSON

- Feature grid layouts

- Call-to-action sections### Data Persistence

- Landing page animations- All data stored in localStorage

- Homepage-specific components- Survives page refresh

```- Cleared only when user clicks "Clear All User Data"

- No server communication required

### JavaScript Files

## 🔧 localStorage Data Structure

**`js/common.js`** - Shared Utilities

```javascript**Authentication:**

// Storage wrapper for localStorage```javascript

const storage = {{

  get: (key, defaultValue) => { /* ... */ },  "authUser": {

  set: (key, value) => { /* ... */ },    "name": "Admin",

  remove: (key) => { /* ... */ }    "email": "admin@example.com",

};    "avatar": null

  },

// Theme management  "users": [

// Event bus for pub/sub    {

// Common helper functions      "name": "Admin",

```      "email": "admin@example.com",

      "passwordHash": "YWRtaW4xMjM="

**`js/auth.js`** - Authentication Logic    }

```javascript  ]

// Login/logout functionality}

// Session management```

// User state handling

// Token management (ready for backend)**User Profile:**

// Social auth integration points```javascript

```{

  "userProfile": {

**`js/avatar-manager.js`** - Avatar System    "fullName": "John Doe",

```javascript    "email": "john@example.com",

class AvatarManager {    "role": "Developer",

  // Upload avatar    "team": "Engineering",

  // Display user initials    "keywords": "question, please, can you",

  // Handle avatar changes    "pref": {

  // Default avatar generation      "speakerAlerts": true,

}      "autoSummary": false,

```      "email": false,

      "darkTheme": false

**`js/file-processing.js`** - File Upload Logic    }

```javascript  }

// File validation}

// Drag-and-drop handlers

// Upload progress tracking**Manual Data Management**:

// Error handling- "Clear Session Data" button resets current session

// Backend integration points- "Clear Saved Results" button removes stored data

```- Data automatically expires after 24 hours



**`js/realtime.js`** - Live Capture### Real-time Features

```javascript

// Audio stream handling#### WebSocket Communication

// Real-time transcription simulation```javascript

// Speaker diarization// Connection to backend

// Session managementconst socket = new WebSocket(`ws://localhost:8000/ws/meeting/${meetingId}`);

// WebSocket integration (ready)

```// Message handling

socket.onmessage = function(event) {

**`js/settings.js`** - Settings Management  const data = JSON.parse(event.data);

```javascript  handleRealTimeUpdate(data);

// Theme switching};

// Preference storage```

// Settings form handling

// Export/import settings#### Audio Processing

``````javascript

// Web Audio API integration

**`js/landing-animations.js`** - Homepage Animationsnavigator.mediaDevices.getUserMedia({ audio: true })

```javascript  .then(stream => {

// Scroll animations    // Process audio stream

// Hero section effects    setupAudioProcessing(stream);

// Feature showcase animations  });

// Intersection observers```

```

### Speaker Alert System

---

#### Alert Types

## ⚙️ Configuration- **Personal Alerts** 🚨: Your name mentioned

- **General Alerts** ⚠️: Questions or keywords

### LocalStorage Schema

#### Trigger Patterns

The application uses localStorage for client-side data persistence:```javascript

// Personal triggers

```javascriptconst personalTriggers = [userName, userRole, userTeam];

// Authentication

localStorage.setItem('userSession', JSON.stringify({// General triggers

  userId: 'user-id',const generalTriggers = ['can you', 'please', 'question', 'thoughts'];

  email: 'user@example.com',```

  name: 'User Name',

  token: 'auth-token',#### Custom Keywords

  loginTime: '2025-01-06T10:00:00Z'Add custom keywords in profile settings for specialized alerts.

}));

## 🎯 Usage Examples

// User Settings

localStorage.setItem('appSettings', JSON.stringify({### Example 1: Team Meeting

  theme: 'dark',

  accentColor: '#667eea',```

  language: 'en',1. Open realtime_capture.html

  autoSave: true,2. Set Meeting ID: "team-standup-2024-01-15"

  notifications: true3. Enter your name: "John Doe"

}));4. Click "Connect to Meeting"

5. Start recording

// Meeting Sessions6. Speak: "Good morning team, let's start our standup"

localStorage.setItem('meetingMinutesSession', JSON.stringify([7. System shows: "Speaker 1: Good morning team, let's start our standup"

  {8. When someone says "John", you get a personal alert

    meetingId: 'meeting-123',9. Stop recording to get auto-summary

    language: 'en',```

    lines: [/* transcript lines */],

    savedAt: '2025-01-06T10:00:00Z'### Example 2: Audio File Processing

  }

]));```

1. Open audio_processing.html

// Audio Processing Results2. Drag & drop: meeting-recording.wav

localStorage.setItem('audioProcessingResults', JSON.stringify([3. Set Meeting ID: "client-call-2024-01-15"

  {4. Select Language: English

    name: 'meeting-audio.mp3',5. Click "Process Audio"

    processedAt: '2025-01-06T10:00:00Z',6. Wait for transcription and summary

    transcript: [/* ... */],7. Review speaker-formatted results

    summary: {/* ... */}8. Check key points and action items

  }```

]));

```### Example 3: Profile Setup



### Environment Variables (For Backend Integration)```

1. Open profile_settings.html

Create a `config.js` file for backend configuration:2. Fill in details:

   - Name: "Sarah Johnson"

```javascript   - Role: "Product Manager"

const config = {   - Team: "Engineering"

  API_BASE_URL: 'http://localhost:8000',  // Your backend URL   - Projects: ["Mobile App", "API v2"]

  WS_URL: 'ws://localhost:8000/ws',       // WebSocket endpoint   - Skills: ["Agile", "User Research"]

  MAX_FILE_SIZE: 100 * 1024 * 1024,      // 100MB   - Keywords: ["roadmap", "sprint", "deadline"]

  SUPPORTED_FORMATS: [3. Save profile

    'audio/mpeg',4. Use other interfaces with personalized alerts

    'audio/wav',```

    'audio/mp4',

    'audio/aac',## 🔍 Troubleshooting

    'audio/ogg',

    'audio/flac'### Common Issues

  ],

  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,   // 24 hours#### 1. Animations Not Working

  AUTO_SAVE_INTERVAL: 30000                // 30 seconds```

};Problem: Scroll animations not triggering

``````

**Solutions**:

---- Make sure you're on `landing.html` (not `index.html`)

- Scroll slowly to trigger Intersection Observer

## 🔌 Integration with Backend- Check browser console for JavaScript errors

- Clear browser cache and reload

The frontend is designed to easily integrate with your backend API. Here are the integration points:- Ensure JavaScript is enabled



### Authentication Endpoints#### 2. Dark Mode White Line

```

```javascriptProblem: White line visible at footer in dark mode

// POST /api/auth/login```

async function login(email, password) {**Solutions**:

  const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {- ✅ FIXED in latest version

    method: 'POST',- Footer border-top now transparent in dark mode

    headers: { 'Content-Type': 'application/json' },- Clear cache and hard reload (Ctrl+Shift+R)

    body: JSON.stringify({ email, password })

  });#### 3. Theme Reverts After Login

  return response.json();```

}Problem: Dark mode resets to light after signing in

```

// POST /api/auth/signup**Solutions**:

async function signup(userData) {- ✅ FIXED in latest version

  const response = await fetch(`${config.API_BASE_URL}/api/auth/signup`, {- Theme now persists after login/signup

    method: 'POST',- 100ms delay added before reload to sync localStorage

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify(userData)#### 4. Auth Modal Not Appearing

  });```

  return response.json();Problem: Protected routes don't show login modal

}```

```**Solutions**:

- Clear localStorage: `localStorage.clear()`

### File Processing Endpoints- Refresh page

- Try incognito/private browsing mode

```javascript- Check browser console for errors

// POST /api/process/file- Ensure common.js is loaded

async function processAudioFile(file) {

  const formData = new FormData();#### 5. Demo Account Not Working

  formData.append('audio', file);```

  Problem: Can't login with admin@example.com

  const response = await fetch(`${config.API_BASE_URL}/api/process/file`, {```

    method: 'POST',**Solutions**:

    headers: {- Password must be exactly: `admin123`

      'Authorization': `Bearer ${getAuthToken()}`- Email must be exactly: `admin@example.com`

    },- Check for extra spaces

    body: formData- Try clearing localStorage and reload

  });- Demo account auto-creates on page load

  - Ensure file is not corrupted

  return response.json();### Browser Console Commands

}

```Useful commands for testing and debugging:



### Real-Time WebSocket```javascript

// Check if logged in

```javascriptJSON.parse(localStorage.getItem('authUser'))

// WebSocket connection for real-time transcription

const ws = new WebSocket(config.WS_URL);// Check all users

JSON.parse(localStorage.getItem('users'))

ws.onopen = () => {

  console.log('Connected to transcription service');// Force logout

  ws.send(JSON.stringify({ type: 'start', meetingId: 'meeting-123' }));localStorage.removeItem('authUser'); location.reload();

};

// Check current theme

ws.onmessage = (event) => {JSON.parse(localStorage.getItem('userProfile')).pref.darkTheme

  const data = JSON.parse(event.data);

  if (data.type === 'transcript') {// Toggle theme manually

    addTranscriptLine(data.speaker, data.text, data.timestamp);const profile = JSON.parse(localStorage.getItem('userProfile'));

  }profile.pref.darkTheme = !profile.pref.darkTheme;

};localStorage.setItem('userProfile', JSON.stringify(profile));

```location.reload();



### Summary Generation// Clear all data

localStorage.clear(); location.reload();

```javascript```

// POST /api/summary/generate

async function generateSummary(transcriptData) {## 📱 Browser Compatibility

  const response = await fetch(`${config.API_BASE_URL}/api/summary/generate`, {

    method: 'POST',### Desktop Browsers

    headers: {- ✅ Chrome 90+ (Recommended)

      'Content-Type': 'application/json',- ✅ Firefox 88+

      'Authorization': `Bearer ${getAuthToken()}`- ✅ Safari 14+

    },- ✅ Edge 90+

    body: JSON.stringify({ transcript: transcriptData })- ❌ Internet Explorer (not supported)

  });

  ### Mobile Browsers

  return response.json();- ✅ iOS Safari 14+

}- ✅ Android Chrome 90+

```- ✅ Samsung Internet

- ⚠️ Mobile Firefox (limited animations)

---

### Required Browser Features

## 🌐 Browser Support- CSS Grid & Flexbox

- Intersection Observer API

### Fully Supported Browsers- localStorage

- ES6+ JavaScript

| Browser | Minimum Version | Recommended Version |- CSS Transforms & Transitions

|---------|----------------|---------------------|

| Google Chrome | 90+ | Latest |### Mobile-Specific Notes

| Mozilla Firefox | 88+ | Latest |- Touch-optimized interface

| Safari | 14+ | Latest |- Responsive breakpoints at 1024px and 768px

| Microsoft Edge | 90+ | Latest |- Animations disabled on low-end devices (optional)

| Opera | 76+ | Latest |- Reduced motion support



### Required Browser Features## 🔒 Security & Privacy



- ✅ ES6+ JavaScript support### Data Storage

- ✅ CSS Grid & Flexbox- **Client-side only**: All data in localStorage

- ✅ CSS Custom Properties (variables)- **No server communication**: Pure frontend demo

- ✅ LocalStorage API- **Password hashing**: btoa encoding (demo only, use bcrypt in production)

- ✅ File API- **Session management**: Token-free localStorage auth

- ✅ Drag and Drop API- **No tracking**: Zero analytics or cookies

- ✅ MediaRecorder API (for real-time capture)

- ✅ WebSocket API (for live transcription)### Privacy Features

- Local-only data storage (never leaves browser)

### Known Limitations- No external API calls

- No user tracking

- **Internet Explorer**: Not supported (use Edge instead)- Data cleared with browser history

- **Older Mobile Browsers**: May have limited functionality- Incognito mode supported

- **Private/Incognito Mode**: LocalStorage may be disabled- User-controlled data retention

- Clear data options available

---

### HTTPS Requirements

## 🐛 Troubleshooting

### Common Issues

#### File Upload Not Working

**Problem**: Drag-and-drop or click upload doesn't respond

**Solutions**:
1. Hard refresh the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check browser console for JavaScript errors (F12)
3. Ensure file size is under 100MB
4. Verify file format is supported (MP3, WAV, M4A, AAC, OGG, FLAC)
5. Try using a different browser

#### Authentication Issues

**Problem**: Can't sign in or session expires immediately

**Solutions**:
1. Clear localStorage: Open console and run `localStorage.clear()`
2. Disable browser extensions that block storage
3. Check if cookies/localStorage are enabled
4. Try in a different browser or private window

#### Microphone Not Working (Real-Time Capture)

**Problem**: No audio input detected

**Solutions**:
1. Grant microphone permissions when prompted
2. Check browser microphone settings
3. Verify microphone is not used by another application
4. Test microphone in browser settings
5. Use HTTPS (required for mic access on some browsers)

#### AI Summary Not Generating

**Problem**: Processing completes but no summary appears

**Solutions**:
1. Check browser console for errors
2. Verify transcript data is present
3. Wait a few seconds (simulated delay)
4. Refresh page and try again
5. Check if JavaScript is enabled

#### Page Styling Broken

**Problem**: CSS not loading properly

**Solutions**:
1. Hard refresh: `Ctrl+Shift+R`
2. Check if CSS files are in correct location (`css/` folder)
3. Verify file paths in HTML `<link>` tags
4. Clear browser cache
5. Check browser developer tools for 404 errors

#### WebSocket Connection Failed

**Problem**: Real-time transcription not working

**Solutions**:
1. Verify backend server is running on port 8000
2. Check WebSocket URL configuration
3. Disable browser extensions blocking WebSocket
4. Check firewall settings for port 8000
5. Try connecting from a different network

#### Audio Processing Lag

**Problem**: Delayed transcription results

**Solutions**:
1. Check internet connection stability
2. Reduce audio quality in settings
3. Close other browser tabs
4. Restart browser and reconnect
5. Use wired microphone for better quality

#### Speaker Alerts Not Working

**Problem**: No notifications when mentioned

**Solutions**:
1. Update profile with your name and keywords
2. Check profile settings are saved
3. Verify microphone permissions
4. Test with different trigger words
5. Check browser notification settings

### Debug Mode

Enable debug logging in browser console:

```javascript
// Add to any page for detailed logs
localStorage.setItem('debugMode', 'true');

// Check console for detailed logs
console.log('Debug mode enabled');
```

### Performance Issues

#### For Better Real-time Performance:
- Close unnecessary browser tabs
- Use Chrome or Edge for best WebRTC support
- Ensure stable internet connection
- Use wired microphone for better audio quality

#### For File Processing:
- Convert large files to compressed formats
- Process files in smaller chunks
- Use modern browser with good JavaScript performance

### HTTPS Requirements

For production deployment:
- HTTPS required for microphone access
- Secure WebSocket connections (WSS)
- Certificate validation
- CORS configuration



#### Microphone Not Working (Real-Time Capture)### Styling



**Problem**: No audio input detectedModify the CSS variables in each file:



**Solutions**:```css

1. Grant microphone permissions when prompted:root {

2. Check browser microphone settings  --primary-color: #667eea;

3. Verify microphone is not used by another application  --secondary-color: #764ba2;

4. Test microphone in browser settings  --success-color: #2ecc71;

5. Use HTTPS (required for mic access on some browsers)  --warning-color: #f39c12;

  --error-color: #e74c3c;

#### AI Summary Not Generating}

```

**Problem**: Processing completes but no summary appears

### Layout

**Solutions**:

1. Check browser console for errors## 🛠️ Customization

2. Verify transcript data is present

3. Wait a few seconds (simulated delay)### Styling

4. Refresh page and try again

5. Check if JavaScript is enabledModify colors and themes in `css/styles.css`:



#### Page Styling Broken```css

:root {

**Problem**: CSS not loading properly  --primary: #6366f1;    /* Change primary color */

  --secondary: #8b5cf6;  /* Change secondary color */

**Solutions**:  --bg: #f7f8fb;         /* Background color */

1. Hard refresh: `Ctrl+Shift+R`  --text: #0f172a;       /* Text color */

2. Check if CSS files are in correct location (`css/` folder)}

3. Verify file paths in HTML `<link>` tags```

4. Clear browser cache

5. Check browser developer tools for 404 errors### Animation Speed



---Adjust animation timing in `css/landing.css`:



## 🔧 Development```css

.feature-card-large {

### Adding New Features  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  /* Change 0.5s to faster/slower speed */

1. **Create Feature Branch**}

   ```bash```

   git checkout -b feature/your-feature-name

   ```### Observer Threshold



2. **Follow Code Structure**Modify scroll trigger point in `js/landing-animations.js`:

   - HTML: Semantic, accessible markup

   - CSS: Follow BEM methodology```javascript

   - JavaScript: ES6+ with clear commentsconst observerOptions = {

  threshold: 0.15,  // 0-1, lower = triggers earlier

3. **Test Thoroughly**  rootMargin: '0px 0px -80px 0px'  // Adjust offset

   - Multiple browsers};

   - Different screen sizes```

   - Error scenarios

   - Edge cases## 📊 Recent Updates (October 2025)



4. **Commit Changes**### Version 2.0 - Enhanced Landing Page ⭐

   ```bash

   git add .**New Features:**

   git commit -m "Add: Your feature description"- ✅ Enhanced landing page with scroll animations

   git push origin feature/your-feature-name- ✅ 2 large feature cards (Real-time, Audio Processing)

   ```- ✅ 6 grid cards with alternating slide animations

- ✅ Smooth parallax hero background

### Code Style Guidelines- ✅ 3D tilt hover effects

- ✅ Floating and bouncing icon animations

**HTML**:

```html**Bug Fixes:**

<!-- Use semantic tags -->- ✅ Fixed white line in dark mode footer

<section class="feature-section">- ✅ Fixed theme revert after login/signup

  <h2 class="section-title">Title</h2>- ✅ Removed Profile Settings large card per user request

  <article class="feature-card">

    <!-- Content -->**Improvements:**

  </article>- ✅ More subtle animations (60px slide instead of 100px)

</section>- ✅ Professional color palette (indigo/violet)

```- ✅ Better animation timing and easing

- ✅ Optimized Intersection Observer performance

**CSS**:- ✅ Reduced animation sizes for better balance

```css- ✅ GPU-accelerated transforms

/* Use BEM naming convention */

.feature-section {**Files Added:**

  padding: 2rem;- `landing.html` - Enhanced home page

}- `css/landing.css` - Animation styles

- `js/landing-animations.js` - Scroll animation controller

.feature-section__title {- `FIXES_APPLIED.md` - Detailed fix documentation

  font-size: 2rem;- `BEFORE_AFTER.md` - Visual comparison guide

  color: var(--primary-color);- `ALL_FIXES_SUMMARY.md` - Complete summary

}

## 🆘 Support & Documentation

.feature-section__card--highlighted {

  background: var(--accent-color);### Additional Documentation

}- **DEMO_ACCOUNT.md** - Testing guide with demo credentials

```- **LATEST_UPDATES.md** - Recent changes and features

- **ANIMATION_GUIDE.md** - Animation reference and timing

**JavaScript**:- **FIXES_APPLIED.md** - Recent bug fixes

```javascript- **BEFORE_AFTER.md** - Visual comparison of changes

// Use descriptive names and comments

function processAudioFile(file) {### Getting Help

  // Validate file before processing

  if (!isValidAudioFile(file)) {**Browser Console Commands:**

    return showError('Invalid file format');See "Browser Console Commands" section above for debugging

  }

  **Common Issues:**

  // Process fileSee "Troubleshooting" section for solutions to frequent problems

  return performProcessing(file);

}**Demo Account:**

```- Email: admin@example.com

- Password: admin123

---- Auto-created on first page load



## 📊 Performance Optimization### Testing Checklist



### Best Practices Implemented- [ ] Landing page animations work

- [ ] Dark mode has no white lines

1. **Lazy Loading**: Images and non-critical resources- [ ] Theme persists after login

2. **CSS Optimization**: Minified in production- [ ] Protected routes show auth modal

3. **JavaScript Bundling**: Ready for webpack/rollup- [ ] Demo account login works

4. **LocalStorage Caching**: Reduce API calls- [ ] Avatar upload works

5. **Debouncing**: On scroll and resize events- [ ] Settings save correctly

6. **Efficient DOM Updates**: Minimal reflows- [ ] Logout redirects to home



### Performance Metrics## 🎓 Learning Resources



- **First Contentful Paint**: < 1.5s### Understanding the Code

- **Time to Interactive**: < 3s

- **Lighthouse Score**: 90+**HTML Structure:**

- Semantic HTML5 markup

---- Accessible ARIA labels

- SEO-friendly structure

## 🚀 Deployment

**CSS Architecture:**

### Production Checklist- CSS custom properties (variables)

- BEM-like naming conventions

- [ ] Minify CSS files- Mobile-first responsive design

- [ ] Minify JavaScript files- GPU-accelerated animations

- [ ] Optimize images

- [ ] Enable compression (gzip/brotli)**JavaScript Patterns:**

- [ ] Configure caching headers- Vanilla ES6+ (no frameworks)

- [ ] Update API endpoints to production URLs- Module pattern for organization

- [ ] Test all features in production environment- Event delegation

- [ ] Set up error monitoring- localStorage API

- [ ] Configure analytics- Intersection Observer API

- [ ] Enable HTTPS

### Best Practices Implemented

### Deployment Options

- ✅ Progressive enhancement

**Static Hosting**:- ✅ Graceful degradation

- Netlify- ✅ Responsive images

- Vercel- ✅ Performance optimization

- GitHub Pages- ✅ Accessibility features

- AWS S3 + CloudFront- ✅ SEO optimization

- ✅ Clean, maintainable code

**Traditional Hosting**:

- Apache server## 📄 License & Credits

- Nginx server

- IIS (Windows)### License

This project is open source and available for educational purposes.

---

### Credits

## 📝 Contributing- **Design System**: Custom color palette based on Tailwind CSS

- **Icons**: Emoji and custom SVG gradients

We welcome contributions! Please follow these steps:- **Fonts**: Google Fonts - Inter family

- **Animations**: Pure CSS with Intersection Observer API

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/AmazingFeature`)### Acknowledgments

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)- Built with ❤️ using vanilla HTML, CSS, and JavaScript

4. Push to the branch (`git push origin feature/AmazingFeature`)- No frameworks or dependencies required

5. Open a Pull Request- Optimized for modern browsers



### Contribution Guidelines---



- Follow existing code style## 🚀 Quick Reference

- Write clear commit messages

- Add comments for complex logic### File Pages

- Test on multiple browsers| Page | URL | Auth Required | Purpose |

- Update documentation as needed|------|-----|---------------|---------|

| Enhanced Landing | `landing.html` | ❌ | Home with animations |

---| Simple Home | `index.html` | ❌ | Basic home page |

| Real-time Capture | `realtime.html` | ✅ | Live transcription demo |

## 📞 Support| File Upload | `file-processing.html` | ✅ | Audio file processing |

| Profile | `profile.html` | ❌ | User profile & avatar |

For questions, issues, or feature requests:| Settings | `settings.html` | ❌ | Theme & preferences |



- **Email**: support@aimom.com### Demo Credentials

- **Documentation**: See this README```

- **Issues**: GitHub Issues (when repository is public)Email: admin@example.com

Password: admin123

---```



## 📜 License### Key Directories

```

This project is licensed under the MIT License - see the LICENSE file for details.css/       - Stylesheets (styles.css, landing.css)

js/        - JavaScript (common.js, landing-animations.js, etc.)

---assets/    - Images and icons (favicon.svg)

```

## � Roadmap & Future Features

### Planned Enhancements

#### 🔄 Real-Time Features
- [ ] **Video Meeting Support**: Screen sharing and video transcription
- [ ] **Multi-Language Support**: Real-time translation for global teams
- [ ] **Advanced Speaker Diarization**: Voice fingerprinting and identification
- [ ] **Meeting Recording**: Cloud storage integration for recordings
- [ ] **Live Collaboration**: Multiple users in same meeting session

#### 🤖 AI & Analytics
- [ ] **Sentiment Analysis**: Meeting mood and engagement tracking
- [ ] **Action Item Extraction**: Automatic task assignment and tracking
- [ ] **Meeting Insights**: Productivity metrics and recommendations
- [ ] **Custom AI Models**: Fine-tuned models for specific industries
- [ ] **Meeting Summaries**: Automated follow-up emails and reports

#### 📱 Mobile & Cross-Platform
- [ ] **Progressive Web App**: Installable mobile experience
- [ ] **Mobile Apps**: React Native iOS/Android applications
- [ ] **Browser Extensions**: Chrome/Firefox extensions for quick access
- [ ] **Desktop App**: Electron-based desktop application
- [ ] **API Integrations**: Slack, Teams, Zoom integrations

#### 🔧 Technical Improvements
- [ ] **Offline Mode**: Local processing without internet
- [ ] **Advanced Audio Processing**: Noise cancellation and echo removal
- [ ] **Real-Time Translation**: Live language translation
- [ ] **Meeting Analytics**: Detailed usage and performance metrics
- [ ] **Custom Branding**: White-label solutions for enterprises

#### 🎨 UI/UX Enhancements
- [ ] **Advanced Themes**: More color schemes and customization
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Dark Mode Improvements**: Better contrast and readability
- [ ] **Animation Library**: More micro-interactions and transitions
- [ ] **Voice Commands**: Hands-free meeting control

#### 🔒 Security & Privacy
- [ ] **End-to-End Encryption**: Secure audio and data transmission
- [ ] **GDPR Compliance**: Enhanced privacy controls
- [ ] **Audit Logs**: Meeting access and modification tracking
- [ ] **Data Retention**: Configurable data storage policies
- [ ] **SSO Integration**: Enterprise authentication support

### Development Priorities

**Phase 1 (Next 3 Months)**:
- Backend integration completion
- Mobile PWA implementation
- Advanced AI features

**Phase 2 (6 Months)**:
- Multi-language support
- Video meeting integration
- Enterprise features

**Phase 3 (12 Months)**:
- Advanced analytics
- API marketplace
- White-label solutions

---

## �🙏 Acknowledgments

### Quick Commands

- **Design Inspiration**: Modern SaaS applications```bash

- **Icons**: SVG icons and emoji# Start local server

- **Fonts**: System font stack for optimal performancepython -m http.server 8000

- **Color Scheme**: Carefully crafted for accessibility

# Open in browser

---http://localhost:8000/landing.html



## 📈 Roadmap# Clear all data (browser console)

localStorage.clear(); location.reload();

### Planned Features```



- [ ] Multi-language support (i18n)---

- [ ] Video meeting transcription

- [ ] Team collaboration features**Made with 🎙️ AI MOM - Transform your meetings into actionable insights!**

- [ ] Cloud storage integration

- [ ] Mobile app (React Native)*Last Updated: October 4, 2025*
- [ ] Browser extension
- [ ] Slack/Teams integration
- [ ] Advanced search and filtering
- [ ] Meeting analytics dashboard
- [ ] AI-powered meeting insights

---

## 🔒 Security

### Security Measures

- Input validation and sanitization
- XSS prevention
- CSRF protection (when backend integrated)
- Secure session management
- HTTPS enforcement
- Content Security Policy headers

### Reporting Security Issues

Please report security vulnerabilities to: security@aimom.com

---

## 📚 Additional Resources

### Documentation Links

- [HTML5 Specification](https://html.spec.whatwg.org/)
- [CSS3 Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [JavaScript ES6+ Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

### Related Projects

- **AI MOM Backend**: Python/FastAPI backend service
- **AI MOM Mobile**: React Native mobile application
- **AI MOM Desktop**: Electron desktop application

---

## � Acknowledgments

### Special Thanks

**Development Team**
- **Lead Developer**: For architecting the real-time audio processing pipeline
- **UI/UX Designer**: For creating the intuitive and beautiful interface
- **AI/ML Engineer**: For implementing the advanced summarization algorithms

**Open Source Libraries**
- **WebRTC Community**: For enabling real-time audio communication
- **Web Audio API**: For powerful audio processing capabilities
- **WebSocket Protocol**: For reliable real-time data transmission

**Inspiration & Design**
- **Modern SaaS Applications**: For UI/UX design patterns
- **Accessibility Guidelines**: For inclusive design principles
- **Performance Best Practices**: For optimal user experience

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

**Ways to Contribute:**
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation
- 🌟 Star the repository

### Support

- 📧 **Email**: support@aimom.com
- 💬 **Discord**: [Join our community](https://discord.gg/aimom)
- 📖 **Documentation**: [Full docs](https://docs.aimom.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/aimom/frontend/issues)

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## �📅 Version History

### Version 1.0.0 (Current)
- Initial release
- Real-time capture functionality
- File upload and processing
- AI summary generation
- User authentication
- Profile management
- Settings customization

---

<div align="center">

**Made with ❤️ by the AI MOM Team**

[Homepage](https://aimom.com) • [Documentation](https://docs.aimom.com) • [Support](mailto:support@aimom.com)

---

*Transforming meetings into actionable insights, one conversation at a time.*

</div>
