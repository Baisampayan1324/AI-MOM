// Unified Screen Capture Content Script
console.log('🚀 Unified Screen Capture Content Script Loaded');

// Prevent multiple declarations
if (window.unifiedScreenCaptureInstance) {
    console.log('⚠️ Screen capture already initialized, skipping...');
} else {
    // Global flag to indicate this script is available
    window.screenCaptureAvailable = true;

class UnifiedScreenCapture {
    constructor() {
        this.isActive = false;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.stream = null;
        this.backendUrl = 'http://localhost:8000';
        this.meetingId = this.generateMeetingId();
        this.overlayElement = null;
        this.floatingIcon = null;
        this.websocket = null;
        this.transcriptionText = '';
        this.wordCount = 0;
        this.startTime = null;
        this.currentPlatform = this.detectPlatform();
        
        // Initialize hybrid audio router for robust audio handling
        this.hybridRouter = null;
        this.useHybridRouter = true; // Flag to enable hybrid router
        
        // Audio processing queue and throttling (fallback)
        this.audioProcessingQueue = [];
        this.isProcessingAudio = false;
        this.lastProcessTime = 0;
        this.processingThrottleMs = 100;
        this.audioContextErrors = 0;
        this.maxAudioContextErrors = 5;
        
        this.init();
    }
    
    async init() {
        console.log(`🎯 Unified screen capture initialized for ${this.currentPlatform}`);
        
        // Listen for messages from background script and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async
        });
        
        // Setup platform-specific monitoring
        this.setupPlatformMonitoring();
        
        console.log('✅ Screen capture content script ready');
    }
    
    generateMeetingId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `unified_${timestamp}_${random}`;
    }
    
    detectPlatform() {
        const url = window.location.href;
        if (url.includes('meet.google.com')) return 'google-meet';
        if (url.includes('zoom.us')) return 'zoom';
        if (url.includes('youtube.com')) return 'youtube';
        return 'unknown';
    }
    
    setupPlatformMonitoring() {
        // Monitor for meeting state changes
        if (this.currentPlatform === 'google-meet') {
            this.monitorGoogleMeetState();
        } else if (this.currentPlatform === 'zoom') {
            this.monitorZoomState();
        }
    }
    
    monitorGoogleMeetState() {
        // Check for Google Meet specific elements
        const checkMeetingState = () => {
            const meetingContainer = document.querySelector('[data-meeting-title]') || 
                                   document.querySelector('[jscontroller="kAPMuc"]');
            const videoElements = document.querySelectorAll('video');
            const meetingControls = document.querySelector('[data-is-muted]');
            
            const inMeeting = !!(meetingContainer && videoElements.length > 0 && meetingControls);
            
            if (inMeeting && !this.isActive) {
                console.log('📱 Google Meet session detected');
            }
        };
        
        // Check periodically
        setInterval(checkMeetingState, 3000);
        
        // Also observe DOM changes
        const observer = new MutationObserver(checkMeetingState);
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    monitorZoomState() {
        // Monitor for Zoom meeting indicators
        const checkZoomState = () => {
            const zoomApp = document.querySelector('#zoom-ui-frame, .zoom-app, [id*="zoom"]');
            const videoContainer = document.querySelector('[class*="video"], [class*="participant"]');
            
            if (zoomApp || videoContainer) {
                console.log('📱 Zoom session detected');
            }
        };
        
        setInterval(checkZoomState, 3000);
    }
    
    handleMessage(message, sender, sendResponse) {
        console.log('📨 Screen capture received message:', message);
        
        switch (message.action) {
            case 'START_SCREEN_CAPTURE':
                this.startScreenCapture(message.settings).then(result => {
                    sendResponse(result);
                }).catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
                return true; // Keep message channel open
                
            case 'STOP_SCREEN_CAPTURE':
                this.stopScreenCapture().then(result => {
                    sendResponse(result);
                }).catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
                return true;
                
            case 'SHOW_START_DIALOG':
                this.showAutoStartDialog();
                sendResponse({ success: true });
                break;
                
            case 'TOGGLE_OVERLAY':
                this.toggleOverlay();
                sendResponse({ success: true });
                break;
                
            case 'checkMicrophoneAccess':
                this.checkMicrophoneAccess().then(hasAccess => {
                    sendResponse({ hasAccess: hasAccess });
                }).catch(error => {
                    sendResponse({ hasAccess: false, error: error.message });
                });
                return true;
                
            case 'openSidebar':
                this.createFloatingOverlay();
                sendResponse({ success: true });
                break;
                
            case 'PING':
                sendResponse({ success: true, platform: this.currentPlatform });
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }
    
    startScreenCapture(settings) {
        return new Promise((resolve, reject) => {
            try {
                console.log('🖥️ Starting screen capture with settings:', settings);

                // Use the browser's screen capture API
                navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                }).then(stream => {
                    console.log('✅ Screen capture stream obtained');
                    console.log('📹 Video tracks:', stream.getVideoTracks().length);
                    console.log('🔊 Audio tracks:', stream.getAudioTracks().length);
                    
                    // Store the stream and start recording
                    this.stream = stream;
                    this.isActive = true;
                    this.startTime = Date.now();
                    
                    // Listen for stream end (user stops sharing)
                    stream.getVideoTracks()[0].addEventListener('ended', () => {
                        console.log('📺 Screen sharing ended by user');
                        this.stopScreenCapture();
                    });
                    
                    // Show recording overlay
                    this.showRecordingOverlay();
                    
                    // Always start audio processing for transcription
                    if (settings && settings.backendUrl) {
                        this.backendUrl = settings.backendUrl;
                    }
                    
                    // Start audio processing
                    this.startAudioProcessing();
                    
                    resolve({ success: true, stream });
                }).catch(error => {
                    console.error('❌ Failed to obtain screen capture stream:', error);
                    
                    // Provide user-friendly error messages
                    let errorMessage = 'Screen capture failed';
                    
                    if (error.name === 'NotAllowedError') {
                        errorMessage = 'Screen sharing permission denied. Please allow screen sharing and try again.';
                    } else if (error.name === 'NotSupportedError') {
                        errorMessage = 'Screen sharing is not supported in this browser.';
                    } else if (error.name === 'AbortError') {
                        errorMessage = 'Screen sharing was cancelled. Please try again.';
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    
                    reject(new Error(errorMessage));
                });
            } catch (error) {
                console.error('❌ Error in startScreenCapture:', error);
                reject(new Error('Screen capture initialization error: ' + error.message));
            }
        });
    }
    
    async stopScreenCapture() {
        try {
            console.log('⏹️ Stopping unified screen capture...');
            
            this.isActive = false;
            
            // Stop hybrid router if active
            if (this.hybridRouter) {
                console.log('🔄 Stopping hybrid audio router...');
                this.hybridRouter.stop();
                this.hybridRouter = null;
            }
            
            // Clear legacy audio processing queue
            if (this.audioProcessingQueue) {
                this.audioProcessingQueue.length = 0;
            }
            this.isProcessingAudio = false;
            
            // Stop media recorder
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }
            
            // Stop all tracks
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                    console.log(`🛑 Stopped track: ${track.kind} - ${track.label}`);
                });
                this.stream = null;
            }
            
            // Close WebSocket
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.close();
                this.websocket = null;
            }
            
            // Close AudioContext
            if (this.audioContext && this.audioContext.state !== 'closed') {
                await this.audioContext.close();
                this.audioContext = null;
            }
            
            // End backend session
            // Note: Session tracking endpoints not implemented yet
            // await this.endBackendSession();
            
            // Update UI and hide overlay
            this.hideRecordingOverlay();
            
            // Update badge
            chrome.runtime.sendMessage({ 
                action: 'UPDATE_BADGE', 
                status: '' 
            });
            
            console.log('✅ Screen capture stopped successfully');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error stopping screen capture:', error);
            return { success: false, error: error.message };
        }
    }
    
    showRecordingOverlay() {
        // Remove existing overlay if present
        this.hideRecordingOverlay();
        
        // Create overlay element
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'ai-mom-recording-overlay';
        this.overlayElement.innerHTML = `
            <div class="recording-header">
                <div class="recording-indicator">
                    <div class="recording-dot"></div>
                    <span class="recording-text">AI MOM Recording</span>
                </div>
                <div class="recording-duration" id="recording-duration">00:00:00</div>
            </div>
            <div class="live-transcript" id="live-transcript">
                <div class="transcript-placeholder">Listening for speech...</div>
            </div>
            <div class="overlay-actions">
                <button class="overlay-btn" id="minimize-overlay">Minimize</button>
                <button class="overlay-btn danger" id="stop-recording-overlay">Stop</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(this.overlayElement);
        
        // Add event listeners
        document.getElementById('minimize-overlay')?.addEventListener('click', () => {
            this.minimizeOverlay();
        });
        
        document.getElementById('stop-recording-overlay')?.addEventListener('click', () => {
            this.stopScreenCapture();
        });
        
        // Start duration timer
        this.startDurationTimer();
        
        console.log('📺 Recording overlay shown');
    }
    
    hideRecordingOverlay() {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
        this.stopDurationTimer();
    }
    
    minimizeOverlay() {
        if (this.overlayElement) {
            this.overlayElement.style.display = 'none';
            this.showMinimizedIndicator();
        }
    }
    
    showMinimizedIndicator() {
        // Create a small indicator that can be clicked to restore
        const indicator = document.createElement('div');
        indicator.className = 'ai-mom-minimized-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            background: var(--danger);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            font-family: Inter, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        indicator.innerHTML = '🔴 Recording';
        
        indicator.addEventListener('click', () => {
            if (this.overlayElement) {
                this.overlayElement.style.display = 'block';
            }
            indicator.remove();
        });
        
        document.body.appendChild(indicator);
    }
    
    startDurationTimer() {
        this.durationTimer = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            const timeString = `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
            
            const durationElement = document.getElementById('recording-duration');
            if (durationElement) {
                durationElement.textContent = timeString;
            }
        }, 1000);
    }
    
    stopDurationTimer() {
        if (this.durationTimer) {
            clearInterval(this.durationTimer);
            this.durationTimer = null;
        }
    }
    
    updateLiveTranscript(text) {
        const transcriptElement = document.getElementById('live-transcript');
        if (transcriptElement && text.trim()) {
            const timestamp = new Date().toLocaleTimeString();
            
            // Remove placeholder if present
            const placeholder = transcriptElement.querySelector('.transcript-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            
            // Add new transcript item
            const item = document.createElement('div');
            item.className = 'transcript-item';
            item.innerHTML = `
                <div class="transcript-text">${text}</div>
                <div class="transcript-timestamp">${timestamp}</div>
            `;
            
            transcriptElement.appendChild(item);
            
            // Scroll to bottom
            transcriptElement.scrollTop = transcriptElement.scrollHeight;
            
            // Keep only last 10 items
            const items = transcriptElement.querySelectorAll('.transcript-item');
            if (items.length > 10) {
                items[0].remove();
            }
        }
    }
    
    async startAudioProcessing() {
        try {
            console.log('🎵 Starting audio processing...');
            
            // Test backend connection first
            await this.testBackendConnection();
            
            // Connect to WebSocket for real-time transcription
            await this.connectWebSocket();
            
            // Use hybrid router if enabled, otherwise fall back to legacy approach
            if (this.useHybridRouter) {
                await this.initializeHybridRouter();
            } else {
                this.setupMediaRecorder();
            }
            
            console.log('✅ Audio processing started successfully');
        } catch (error) {
            console.error('❌ Failed to start audio processing:', error);
            this.showNotification(
                'Audio Processing Failed',
                `Failed to connect to backend: ${error.message}\n\nPlease ensure:\n1. Backend server is running on ${this.backendUrl}\n2. WebSocket connection is available`,
                'error'
            );
        }
    }

    async initializeHybridRouter() {
        try {
            console.log('🔄 Initializing hybrid audio router...');
            
            // Check if HybridAudioRouter is available (should be loaded via manifest)
            if (typeof HybridAudioRouter === 'undefined') {
                throw new Error('HybridAudioRouter class not available');
            }
            
            // Initialize the hybrid router
            this.hybridRouter = new HybridAudioRouter();
            this.hybridRouter.backendUrl = this.backendUrl;
            this.hybridRouter.websocket = this.websocket;
            
            // Initialize with existing stream if available
            if (this.stream) {
                await this.hybridRouter.initializeWithStream(this.stream);
            } else {
                await this.hybridRouter.initialize();
            }
            
            console.log('✅ Hybrid audio router initialized successfully');
            this.updateOverlayStatus('Hybrid audio router active');
            
        } catch (error) {
            console.warn('⚠️ Hybrid router failed, falling back to legacy audio processing:', error);
            this.useHybridRouter = false;
            this.setupMediaRecorder();
        }
    }
    
    async testBackendConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (!response.ok) {
                throw new Error(`Backend health check failed: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
            
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            throw new Error('Cannot connect to transcription backend. Please ensure the backend server is running on ' + this.backendUrl);
        }
    }
    
    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            const wsUrl = `${this.backendUrl.replace('http', 'ws')}/ws/audio`;
            console.log('🔗 Connecting to WebSocket:', wsUrl);
            
            // Close existing connection if any
            if (this.websocket && this.websocket.readyState !== WebSocket.CLOSED) {
                this.websocket.close();
            }
            
            this.websocket = new WebSocket(wsUrl);
            
            // Add connection timeout
            const connectionTimeout = setTimeout(() => {
                if (this.websocket.readyState !== WebSocket.OPEN) {
                    this.websocket.close();
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 10000);
            
            this.websocket.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log('✅ WebSocket connected');
                this.updateOverlayStatus('Connected to backend');
                
                // Send initial ping to test connection
                this.websocket.send(JSON.stringify({
                    type: 'ping',
                    timestamp: Date.now()
                }));
                
                resolve();
            };
            
            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('❌ Failed to parse WebSocket message:', error);
                }
            };
            
            this.websocket.onerror = (error) => {
                clearTimeout(connectionTimeout);
                console.error('❌ WebSocket error:', error);
                this.updateOverlayStatus('WebSocket connection error');
                reject(new Error('WebSocket connection failed'));
            };
            
            this.websocket.onclose = (event) => {
                clearTimeout(connectionTimeout);
                console.log('🔗 WebSocket disconnected:', event.code, event.reason);
                
                if (this.isActive) {
                    this.updateOverlayStatus('Connection lost - retrying...');
                    // Try to reconnect after 3 seconds, but only if not intentionally closed
                    if (event.code !== 1000) {
                        setTimeout(() => {
                            if (this.isActive) {
                                console.log('🔄 Attempting to reconnect WebSocket...');
                                this.connectWebSocket().catch(error => {
                                    console.error('❌ WebSocket reconnection failed:', error);
                                    this.updateOverlayStatus('Connection failed');
                                });
                            }
                        }, 3000);
                    }
                }
            };
        });
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'transcription':
                this.addTranscriptionText(data.text, data.timestamp);
                // Update live overlay transcript
                if (data.text && data.text.trim()) {
                    this.updateLiveTranscript(data.text.trim());
                }
                break;
            case 'summary':
                this.updateSummary(data.summary);
                break;
            case 'word_count':
                this.wordCount = data.count;
                this.updateOverlayWordCount();
                break;
            case 'status':
                this.updateOverlayStatus(data.message);
                break;
            case 'error':
                console.error('❌ Backend error:', data.message);
                this.updateOverlayStatus('Error: ' + data.message);
                break;
        }
    }
    
    setupMediaRecorder() {
        try {
            // Use audio track from screen capture
            const audioTracks = this.stream.getAudioTracks();
            if (audioTracks.length === 0) {
                console.warn('⚠️ No audio track available for recording');
                this.mediaRecorder = null; // Explicitly set to null
                this.showNotification(
                    'No Audio Detected', 
                    'Screen capture is active but no audio is being captured. To capture audio:\n\n1. Stop current capture\n2. Start again\n3. Check "Share system audio" or "Share tab audio" in the share dialog'
                );
                return;
            }
            
            console.log('🎵 Setting up MediaRecorder with', audioTracks.length, 'audio tracks');
            
            // Create audio-only stream for processing
            const audioStream = new MediaStream(audioTracks);
            
            // Add audio processing throttling
            this.audioProcessingQueue = [];
            this.isProcessingAudio = false;
            this.lastProcessTime = 0;
            this.processingThrottleMs = 100; // Minimum time between processing attempts
            
            // Try different MIME types in order of preference
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4',
                '' // Let browser choose
            ];
            
            let selectedMimeType = '';
            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType) || mimeType === '') {
                    selectedMimeType = mimeType;
                    console.log('✅ Selected MIME type:', mimeType || 'browser default');
                    break;
                }
            }
            
            // Create MediaRecorder with optimal settings
            const recorderOptions = {
                audioBitsPerSecond: 64000 // Lower bitrate for more stable encoding
            };
            
            if (selectedMimeType) {
                recorderOptions.mimeType = selectedMimeType;
            }
            
            this.mediaRecorder = new MediaRecorder(audioStream, recorderOptions);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && this.isActive) {
                    console.log('🎵 Audio chunk received:', event.data.size, 'bytes, type:', event.data.type);
                    
                    // Validate chunk before processing
                    if (event.data.size < 100) {
                        console.warn('⚠️ Skipping very small audio chunk:', event.data.size, 'bytes');
                        return;
                    }
                    
                    this.queueAudioProcessing(event.data);
                }
            };
            
            this.mediaRecorder.onerror = (error) => {
                console.error('❌ MediaRecorder error:', error);
                
                // Try to restart with different settings
                if (this.isActive) {
                    console.log('🔄 Attempting to restart MediaRecorder...');
                    setTimeout(() => {
                        if (this.isActive) {
                            this.restartMediaRecorder();
                        }
                    }, 1000);
                }
            };
            
            this.mediaRecorder.onstart = () => {
                console.log('✅ MediaRecorder started with options:', recorderOptions);
            };
            
            this.mediaRecorder.onstop = () => {
                console.log('⏹️ MediaRecorder stopped');
            };
            
            // Start recording with 1.5 second chunks (longer chunks = more stable)
            this.mediaRecorder.start(1500);
            console.log('🎙️ Media recorder setup complete and started');
            
        } catch (error) {
            console.error('❌ Failed to setup media recorder:', error);
            this.mediaRecorder = null; // Ensure it's null on error
            
            // Show user-friendly error message
            this.showNotification(
                'Audio Recording Failed',
                'Failed to set up audio recording. This may be due to:\n\n1. Unsupported audio format\n2. No audio permission\n3. Browser compatibility issue\n\nTrying fallback mode...'
            );
        }
    }

    restartMediaRecorder() {
        try {
            console.log('🔄 Restarting MediaRecorder with fallback settings...');
            
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }
            
            // Use more conservative settings for restart
            const audioTracks = this.stream.getAudioTracks();
            if (audioTracks.length === 0) return;
            
            const audioStream = new MediaStream(audioTracks);
            
            // Use most basic settings for compatibility
            this.mediaRecorder = new MediaRecorder(audioStream, {
                audioBitsPerSecond: 32000 // Even lower bitrate
            });
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && this.isActive) {
                    console.log('🎵 Restarted audio chunk received:', event.data.size, 'bytes');
                    this.queueAudioProcessing(event.data);
                }
            };
            
            this.mediaRecorder.onerror = (error) => {
                console.error('❌ Restarted MediaRecorder error:', error);
            };
            
            // Start with longer chunks for stability
            this.mediaRecorder.start(2000);
            console.log('✅ MediaRecorder restarted successfully');
            
        } catch (restartError) {
            console.error('❌ Failed to restart MediaRecorder:', restartError);
        }
    }

    queueAudioProcessing(audioBlob) {
        // Add to queue
        this.audioProcessingQueue.push(audioBlob);
        
        // Process queue if not already processing
        if (!this.isProcessingAudio) {
            this.processAudioQueue();
        }
    }

    async processAudioQueue() {
        if (this.isProcessingAudio || this.audioProcessingQueue.length === 0) {
            return;
        }
        
        this.isProcessingAudio = true;
        
        try {
            while (this.audioProcessingQueue.length > 0 && this.isActive) {
                const audioBlob = this.audioProcessingQueue.shift();
                
                // Throttle processing to prevent overwhelming the system
                const now = Date.now();
                const timeSinceLastProcess = now - this.lastProcessTime;
                
                if (timeSinceLastProcess < this.processingThrottleMs) {
                    await new Promise(resolve => 
                        setTimeout(resolve, this.processingThrottleMs - timeSinceLastProcess)
                    );
                }
                
                await this.processAudioChunk(audioBlob);
                this.lastProcessTime = Date.now();
                
                // If queue is getting too long, skip some items to prevent memory issues
                if (this.audioProcessingQueue.length > 10) {
                    console.warn('⚠️ Audio queue too long, skipping some chunks');
                    this.audioProcessingQueue.splice(0, this.audioProcessingQueue.length - 5);
                }
            }
        } catch (error) {
            console.error('❌ Error processing audio queue:', error);
        } finally {
            this.isProcessingAudio = false;
            
            // Process any remaining items that were added while processing
            if (this.audioProcessingQueue.length > 0) {
                setTimeout(() => this.processAudioQueue(), 100);
            }
        }
    }
    
    async processAudioChunk(audioBlob) {
        // HYBRID ROUTER APPROACH - Multiple fallback strategies to prevent DOMException errors
        try {
            console.log('🎵 Processing audio chunk with hybrid approach:', audioBlob.size, 'bytes');
            
            // === VALIDATION PHASE ===
            if (!audioBlob || audioBlob.size === 0) {
                console.warn('⚠️ Empty audio blob received');
                return;
            }
            
            if (!(audioBlob instanceof Blob)) {
                console.warn('⚠️ Invalid audio blob type');
                return;
            }
            
            if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
                console.warn('⚠️ WebSocket not connected, skipping audio chunk');
                return;
            }
            
            // === STRATEGY 1: DIRECT WEBSOCKET SEND (FASTEST) ===
            if (this.audioContextErrors >= this.maxAudioContextErrors) {
                console.log('🔄 Using direct WebSocket strategy (AudioContext disabled)');
                await this.sendAudioDirect(audioBlob);
                return;
            }
            
            // === STRATEGY 2: AUDIOCONTEXT WITH ENHANCED ERROR HANDLING ===
            try {
                await this.processWithAudioContext(audioBlob);
                return; // Success, no need for fallback
            } catch (audioContextError) {
                console.warn('⚠️ AudioContext strategy failed:', audioContextError.name);
                this.audioContextErrors++;
                
                // Fall through to strategy 3
            }
            
            // === STRATEGY 3: BASE64 FALLBACK ===
            console.log('🔄 Using base64 fallback strategy');
            await this.processAudioChunkFallback(audioBlob);
            
        } catch (error) {
            // === STRATEGY 4: SILENT SKIP (LAST RESORT) ===
            if (error.name === 'DOMException') {
                console.warn('⚠️ DOMException encountered, skipping chunk silently');
            } else {
                console.error('❌ Unexpected audio processing error:', error.name, error.message);
            }
            
            // Don't let errors stop the entire process
            return;
        }
    }

    async sendAudioDirect(audioBlob) {
        try {
            // Send blob directly without processing
            const reader = new FileReader();
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Direct send timeout'));
                }, 3000);
                
                reader.onload = () => {
                    clearTimeout(timeout);
                    try {
                        const arrayBuffer = reader.result;
                        const uint8Array = new Uint8Array(arrayBuffer);
                        
                        // Send raw audio data
                        this.websocket.send(JSON.stringify({
                            type: 'audio_chunk_raw',
                            data: Array.from(uint8Array),
                            format: 'webm',
                            size: audioBlob.size,
                            timestamp: Date.now(),
                            strategy: 'direct'
                        }));
                        
                        console.log('📨 Sent raw audio chunk:', uint8Array.length, 'bytes');
                        resolve();
                    } catch (sendError) {
                        clearTimeout(timeout);
                        reject(sendError);
                    }
                };
                
                reader.onerror = (error) => {
                    clearTimeout(timeout);
                    reject(error);
                };
                
                reader.readAsArrayBuffer(audioBlob);
            });
        } catch (error) {
            console.warn('⚠️ Direct send failed:', error.message);
            throw error;
        }
    }

    async processWithAudioContext(audioBlob) {
        // Enhanced AudioContext processing with strict error handling
        
        // Initialize AudioContext if needed
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000,
                latencyHint: 'interactive'
            });
        }
        
        // Check AudioContext state
        if (this.audioContext.state === 'closed') {
            throw new Error('AudioContext closed');
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        // Convert blob to array buffer with timeout
        const arrayBuffer = await Promise.race([
            audioBlob.arrayBuffer(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('ArrayBuffer timeout')), 2000)
            )
        ]);
        
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
            throw new Error('Empty array buffer');
        }
        
        // Validate audio data before decoding to prevent EncodingError
        if (arrayBuffer.byteLength < 44) { // Minimum size for audio header
            throw new Error('Audio data too small');
        }
        
        // Check for valid audio data patterns
        const uint8View = new Uint8Array(arrayBuffer);
        const hasValidHeader = this.validateAudioHeader(uint8View);
        
        if (!hasValidHeader) {
            console.warn('⚠️ Invalid audio header detected, using fallback');
            throw new Error('Invalid audio format');
        }
        
        // Decode audio data with timeout and specific error handling
        let audioBuffer;
        try {
            audioBuffer = await Promise.race([
                this.audioContext.decodeAudioData(arrayBuffer.slice()),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Decode timeout')), 2000)
                )
            ]);
        } catch (decodeError) {
            // Handle specific audio decoding errors
            if (decodeError.name === 'EncodingError') {
                console.warn('⚠️ Audio encoding error - data format unsupported');
                throw new Error('Audio encoding not supported');
            } else if (decodeError.name === 'DOMException') {
                console.warn('⚠️ DOMException during audio decoding');
                throw new Error('Audio decoding failed');
            } else {
                console.warn('⚠️ Unknown audio decoding error:', decodeError.name);
                throw decodeError;
            }
        }
        
        if (!audioBuffer || audioBuffer.length === 0) {
            throw new Error('Empty decoded audio buffer');
        }
        
        // Validate audio buffer properties
        if (audioBuffer.sampleRate <= 0 || audioBuffer.numberOfChannels === 0) {
            throw new Error('Invalid audio buffer properties');
        }
        
        // Convert to PCM with validation
        const channelData = audioBuffer.getChannelData(0);
        const audioData = new Int16Array(channelData.length);
        
        let validSamples = 0;
        let silentSamples = 0;
        
        for (let i = 0; i < channelData.length; i++) {
            const sample = channelData[i];
            if (isNaN(sample) || !isFinite(sample)) {
                audioData[i] = 0; // Replace invalid samples
            } else {
                const convertedSample = Math.max(-32768, Math.min(32767, sample * 32768));
                audioData[i] = convertedSample;
                validSamples++;
                
                // Count silent samples to detect empty audio
                if (Math.abs(convertedSample) < 100) {
                    silentSamples++;
                }
            }
        }
        
        // Only send if we have sufficient valid samples and not all silent
        if (validSamples < channelData.length * 0.5) {
            throw new Error('Too many invalid samples');
        }
        
        // Skip if audio is mostly silent (likely no actual audio content)
        if (silentSamples > channelData.length * 0.95) {
            console.log('🔇 Skipping mostly silent audio chunk');
            return; // Don't throw error, just skip silently
        }
        
        // Send to backend
        this.websocket.send(JSON.stringify({
            type: 'audio_chunk',
            audio_data: Array.from(audioData),
            sample_rate: audioBuffer.sampleRate,
            timestamp: Date.now(),
            strategy: 'audiocontext',
            valid_samples: validSamples,
            total_samples: channelData.length,
            silent_samples: silentSamples
        }));
        
        console.log('📨 Sent AudioContext processed chunk:', audioData.length, 'samples,', validSamples, 'valid,', silentSamples, 'silent');
    }

    validateAudioHeader(uint8Array) {
        // Check for common audio format headers
        const header = uint8Array.slice(0, 12);
        
        // WebM header check
        if (header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3) {
            return true; // WebM format
        }
        
        // OGG header check
        if (header[0] === 0x4F && header[1] === 0x67 && header[2] === 0x67 && header[3] === 0x53) {
            return true; // OGG format
        }
        
        // WAV header check
        if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
            return true; // WAV format
        }
        
        // If no known header is found, still allow processing but with caution
        console.warn('⚠️ Unknown audio format header, proceeding with caution');
        return true; // Allow unknown formats to proceed
    }

    async processAudioChunkFallback(audioBlob) {
        try {
            console.log('🔄 Using fallback audio processing for blob size:', audioBlob.size);
            
            // Validate blob before processing
            if (!audioBlob || audioBlob.size === 0) {
                console.warn('⚠️ Invalid blob for fallback processing');
                return;
            }
            
            // Skip if WebSocket is not connected
            if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
                console.warn('⚠️ WebSocket not connected, skipping fallback processing');
                return;
            }
            
            // Convert blob to base64 as fallback
            const reader = new FileReader();
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('FileReader timeout'));
                }, 5000);
                
                reader.onload = () => {
                    clearTimeout(timeout);
                    try {
                        const arrayBuffer = reader.result;
                        
                        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                            console.warn('⚠️ Empty array buffer in fallback');
                            resolve();
                            return;
                        }
                        
                        // Convert to base64 with chunking for large files
                        const uint8Array = new Uint8Array(arrayBuffer);
                        let base64Audio = '';
                        
                        // Process in chunks to avoid string length limits
                        const chunkSize = 8192;
                        for (let i = 0; i < uint8Array.length; i += chunkSize) {
                            const chunk = uint8Array.slice(i, i + chunkSize);
                            base64Audio += String.fromCharCode.apply(null, chunk);
                        }
                        
                        const finalBase64 = btoa(base64Audio);
                        
                        // Only send if we have data and connection is still open
                        if (finalBase64.length > 0 && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                            this.websocket.send(JSON.stringify({
                                type: 'audio_chunk_base64',
                                data: finalBase64,
                                format: 'webm',
                                sample_rate: 16000,
                                timestamp: Date.now(),
                                fallback: true
                            }));
                            
                            console.log('📨 Sent fallback audio chunk to backend:', finalBase64.length, 'chars');
                        }
                        resolve();
                    } catch (sendError) {
                        clearTimeout(timeout);
                        console.warn('⚠️ Failed to send fallback audio:', sendError.message);
                        reject(sendError);
                    }
                };
                
                reader.onerror = (error) => {
                    clearTimeout(timeout);
                    console.warn('⚠️ FileReader error in fallback:', error);
                    reject(error);
                };
                
                // Read the blob as ArrayBuffer
                try {
                    reader.readAsArrayBuffer(audioBlob);
                } catch (readError) {
                    clearTimeout(timeout);
                    console.warn('⚠️ Failed to read blob in fallback:', readError.message);
                    reject(readError);
                }
            });
            
        } catch (error) {
            console.warn('⚠️ Fallback audio processing failed:', error.message);
            // Don't throw here to prevent cascading errors
        }
    }
    
    async checkMicrophoneAccess() {
        try {
            // For screen capture, we don't need direct microphone access
            // We get audio from the screen share
            return true;
        } catch (error) {
            console.error('❌ Error checking microphone access:', error);
            return false;
        }
    }
    
    showAutoStartDialog() {
        // Enhanced start dialog with screen capture emphasis
        if (document.getElementById('unified-start-dialog')) return; // Already shown
        
        const dialog = document.createElement('div');
        dialog.id = 'unified-start-dialog';
        dialog.className = 'unified-start-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <span class="dialog-icon">🎤</span>
                    <span class="dialog-title">AI Meeting Transcription</span>
                </div>
                <div class="dialog-body">
                    <p>Start real-time transcription for this ${this.currentPlatform} session?</p>
                    <div class="feature-highlight">
                        <div class="feature-item">
                            <span class="feature-icon">📺</span>
                            <span>Screen capture with system audio</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🎯</span>
                            <span>Real-time transcription</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">💡</span>
                            <span>AI-powered summaries</span>
                        </div>
                    </div>
                    <div class="dialog-actions">
                        <button id="start-capture-btn" class="dialog-btn primary">
                            📺 Start Screen Capture
                        </button>
                        <button id="dismiss-dialog-btn" class="dialog-btn secondary">
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Add event listeners
        document.getElementById('start-capture-btn').addEventListener('click', () => {
            this.startScreenCapture();
            dialog.remove();
        });
        
        document.getElementById('dismiss-dialog-btn').addEventListener('click', () => {
            dialog.remove();
        });
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.remove();
            }
        }, 15000);
    }
    
    createFloatingOverlay() {
        // Remove existing overlay
        if (this.overlayElement) {
            this.overlayElement.remove();
        }
        
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'unified-transcription-overlay';
        this.overlayElement.className = 'unified-transcription-overlay';
        this.overlayElement.innerHTML = `
            <div class="overlay-header">
                <div class="overlay-title">
                    <span class="overlay-icon">🎤</span>
                    <span class="overlay-text">AI Transcription</span>
                    <span class="overlay-status" id="overlay-status">Active</span>
                </div>
                <div class="overlay-controls">
                    <button id="minimize-overlay" class="overlay-btn" title="Minimize">➖</button>
                    <button id="stop-capture" class="overlay-btn" title="Stop">⏹️</button>
                </div>
            </div>
            <div class="overlay-content" id="overlay-content">
                <div class="transcription-area">
                    <div class="transcription-header">
                        <span>📝 Live Transcription</span>
                        <span class="word-count" id="word-count">0 words</span>
                    </div>
                    <div class="transcription-text" id="transcription-text">
                        Listening for audio...
                    </div>
                </div>
                <div class="summary-area" id="summary-area" style="display: none;">
                    <div class="summary-header">💡 Key Points</div>
                    <div class="summary-content" id="summary-content"></div>
                </div>
            </div>
        `;
        
        this.makeDraggable(this.overlayElement);
        document.body.appendChild(this.overlayElement);
        
        // Add event listeners
        document.getElementById('minimize-overlay').addEventListener('click', () => {
            this.minimizeOverlay();
        });
        
        document.getElementById('stop-capture').addEventListener('click', () => {
            this.stopScreenCapture();
        });
        
        console.log('📱 Floating overlay created');
    }
    
    minimizeOverlay() {
        if (this.overlayElement) {
            this.overlayElement.style.display = 'none';
        }
        
        // Create floating icon
        this.createFloatingIcon();
    }
    
    createFloatingIcon() {
        if (this.floatingIcon) return;
        
        this.floatingIcon = document.createElement('div');
        this.floatingIcon.id = 'unified-floating-icon';
        this.floatingIcon.className = 'unified-floating-icon';
        this.floatingIcon.innerHTML = '🎤';
        this.floatingIcon.title = 'AI Transcription Active - Click to expand';
        
        this.floatingIcon.addEventListener('click', () => {
            this.showOverlay();
        });
        
        document.body.appendChild(this.floatingIcon);
    }
    
    showOverlay() {
        if (this.overlayElement) {
            this.overlayElement.style.display = 'block';
        }
        if (this.floatingIcon) {
            this.floatingIcon.remove();
            this.floatingIcon = null;
        }
    }
    
    hideFloatingOverlay() {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
        if (this.floatingIcon) {
            this.floatingIcon.remove();
            this.floatingIcon = null;
        }
    }
    
    toggleOverlay() {
        if (this.overlayElement && this.overlayElement.style.display !== 'none') {
            this.minimizeOverlay();
        } else {
            this.showOverlay();
        }
    }
    
    makeDraggable(element) {
        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        
        const header = element.querySelector('.overlay-header');
        
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.overlay-controls')) return;
            
            isDragging = true;
            initialX = e.clientX - element.offsetLeft;
            initialY = e.clientY - element.offsetTop;
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        });
        
        function drag(e) {
            if (!isDragging) return;
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            element.style.left = currentX + 'px';
            element.style.top = currentY + 'px';
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        }
    }
    
    addTranscriptionText(text, timestamp) {
        const transcriptionElement = document.getElementById('transcription-text');
        if (!transcriptionElement) return;
        
        // Add new text with timestamp
        const time = new Date(timestamp * 1000).toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'transcription-entry';
        entry.innerHTML = `
            <span class="entry-time">[${time}]</span>
            <span class="entry-text">${text}</span>
        `;
        
        transcriptionElement.appendChild(entry);
        
        // Auto-scroll to bottom
        transcriptionElement.scrollTop = transcriptionElement.scrollHeight;
        
        // Keep only last 50 entries to prevent memory issues
        const entries = transcriptionElement.querySelectorAll('.transcription-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
        
        // Update full transcript
        this.transcriptionText += `[${time}] ${text}\n`;
    }
    
    updateOverlayStatus(status) {
        const statusElement = document.getElementById('overlay-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
        console.log('📊 Status:', status);
    }
    
    updateOverlayWordCount() {
        const wordCountElement = document.getElementById('word-count');
        if (wordCountElement) {
            wordCountElement.textContent = `${this.wordCount} words`;
        }
    }
    
    updateSummary(summary) {
        const summaryArea = document.getElementById('summary-area');
        const summaryContent = document.getElementById('summary-content');
        
        if (summaryArea && summaryContent && summary) {
            summaryArea.style.display = 'block';
            summaryContent.innerHTML = `
                <div class="summary-item">
                    <strong>Key Points:</strong>
                    <ul>
                        ${summary.key_points ? summary.key_points.map(point => `<li>${point}</li>`).join('') : '<li>Processing...</li>'}
                    </ul>
                </div>
                <div class="summary-item">
                    <strong>Action Items:</strong>
                    <ul>
                        ${summary.action_items ? summary.action_items.map(item => `<li>${item}</li>`).join('') : '<li>None identified yet</li>'}
                    </ul>
                </div>
            `;
        }
    }
    
    showNotification(title, message, type = 'warning') {
        // Create in-page notification
        const notification = document.createElement('div');
        notification.className = `unified-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" aria-label="Close">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'notificationSlideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
        
        // Auto-remove after 8 seconds (longer for important messages)
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 8000);
    }
}

// Initialize the unified screen capture
if (!window.unifiedScreenCaptureInstance) {
    window.unifiedScreenCaptureInstance = new UnifiedScreenCapture();
    console.log('✅ Screen capture instance created');
}

} // End of conditional block