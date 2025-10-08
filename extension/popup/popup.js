// Unified Popup Controller
console.log('🚀 Unified popup controller initializing...');

class UnifiedPopupController {
    constructor() {
        this.backendUrl = 'http://localhost:8000';
        this.isCapturing = false;
        this.captureStartTime = null;
        this.wordCount = 0;
        this.connectionStatus = 'offline';
        this.durationTimer = null;
        this.recordingMode = 'screen-capture'; // Default to screen-capture mode
        this.transcriptData = [];
        this.currentPlatform = 'unknown';
        this.screenCaptureEnabled = false; // Track screen capture state
        
        this.init();
    }
    
    async init() {
        console.log('✅ Initializing unified popup controller...');
        
        // Load saved settings
        await this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Test backend connection
        await this.testConnection();
        
        // Check current tab platform
        await this.checkCurrentPlatform();
        
        // Check if already capturing
        await this.checkCaptureStatus();
        
        // Update UI
        this.updateUI();
        this.updateModeUI();
        
        console.log('✅ Unified popup controller initialized');
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get({
                backendUrl: 'http://localhost:8000',
                language: 'auto',
                showOverlay: true,
                autoSummary: true,
                speakerAlerts: true,
                recordingMode: 'screen-capture' // Default to screen-capture mode
            });
            
            this.backendUrl = result.backendUrl;
            this.recordingMode = result.recordingMode; // Load saved recording mode
            
            // Update UI with loaded settings
            document.getElementById('backend-url').value = result.backendUrl;
            document.getElementById('language-select').value = result.language;
            document.getElementById('show-overlay').checked = result.showOverlay;
            document.getElementById('auto-summary').checked = result.autoSummary;
            document.getElementById('speaker-alerts').checked = result.speakerAlerts;
            
            // Update mode selector to reflect loaded mode
            document.querySelectorAll('.mode-btn').forEach(btn => {
                if (btn.dataset.mode === this.recordingMode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            console.log('💾 Settings loaded:', result);
            
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
        }
    }
    
    async saveSettings() {
        try {
            const settings = {
                backendUrl: document.getElementById('backend-url').value,
                language: document.getElementById('language-select').value,
                showOverlay: document.getElementById('show-overlay').checked,
                autoSummary: document.getElementById('auto-summary').checked,
                speakerAlerts: document.getElementById('speaker-alerts').checked,
                recordingMode: this.recordingMode // Save current recording mode
            };
            
            await chrome.storage.sync.set(settings);
            this.backendUrl = settings.backendUrl;
            
            console.log('💾 Settings saved:', settings);
            this.updatePerformanceInfo('Settings saved');
            
        } catch (error) {
            console.error('❌ Failed to save settings:', error);
        }
    }
    
    setupEventListeners() {
        // Mode selector
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.recordingMode = btn.dataset.mode;
                
                // Save the new mode to settings
                this.saveSettings();
                
                // Show/hide sections based on mode
                this.updateModeUI();
                
                console.log('📊 Recording mode changed to:', this.recordingMode);
            });
        });

        // Recording buttons
        document.getElementById('start-recording')?.addEventListener('click', () => {
            this.startRecording();
        });
        
        document.getElementById('stop-recording')?.addEventListener('click', () => {
            this.stopRecording();
        });

        // Transcript actions
        document.getElementById('export-transcript')?.addEventListener('click', () => {
            this.exportTranscript();
        });
        
        document.getElementById('generate-summary')?.addEventListener('click', () => {
            this.generateSummary();
        });
        
        document.getElementById('copy-text')?.addEventListener('click', () => {
            this.copyTranscript();
        });

        // Settings toggle
        document.getElementById('settings-toggle')?.addEventListener('click', () => {
            this.toggleSettings();
        });
        
        // Settings changes
        document.getElementById('backend-url')?.addEventListener('change', () => {
            this.saveSettings();
        });
        
        document.getElementById('language-select')?.addEventListener('change', () => {
            this.saveSettings();
        });
        
        document.getElementById('show-overlay')?.addEventListener('change', () => {
            this.saveSettings();
        });
        
        document.getElementById('auto-summary')?.addEventListener('change', () => {
            this.saveSettings();
        });

        document.getElementById('speaker-alerts')?.addEventListener('change', () => {
            this.saveSettings();
        });

        // Audio upload event listeners
        const fileUploadArea = document.getElementById('file-upload-area');
        const audioFileInput = document.getElementById('audio-file-input');
        const fileRemoveBtn = document.getElementById('file-remove');
        const processAudioBtn = document.getElementById('process-audio');
        
        if (fileUploadArea) {
            fileUploadArea.addEventListener('click', () => {
                audioFileInput.click();
            });
            
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.classList.add('drag-over');
            });
            
            fileUploadArea.addEventListener('dragleave', () => {
                fileUploadArea.classList.remove('drag-over');
            });
            
            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });
        }
        
        if (audioFileInput) {
            audioFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }
        
        if (fileRemoveBtn) {
            fileRemoveBtn.addEventListener('click', () => {
                this.clearSelectedFile();
            });
        }
        
        if (processAudioBtn) {
            processAudioBtn.addEventListener('click', () => {
                this.processAudioFile();
            });
        }

        // Help link
        document.getElementById('help-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showHelp();
        });
        
        // Diagnostics link
        document.getElementById('diagnostics-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.runDiagnostics();
        });

        // Test connection button
        document.getElementById('test-connection')?.addEventListener('click', () => {
            this.testConnectionManual();
        });

        console.log('📋 Event listeners setup complete');
    }
    
    updateModeUI() {
        const audioUploadSection = document.getElementById('audio-upload-section');
        const recordingControls = document.getElementById('recording-controls');
        const modeSelector = document.querySelector('.mode-selector');
        
        if (!audioUploadSection || !recordingControls || !modeSelector) {
            console.warn('⚠️ Some UI elements not found');
            return;
        }
        
        if (this.recordingMode === 'audio-upload') {
            // Show audio upload UI
            audioUploadSection.style.display = 'block';
            recordingControls.style.display = 'none';
            
            // Keep mode selector visible so user can switch back
            modeSelector.style.display = 'flex';
        } else {
            // Show recording controls
            audioUploadSection.style.display = 'none';
            recordingControls.style.display = 'block';
            
            // Mode selector always visible
            modeSelector.style.display = 'flex';
            
            // Reset screen capture state when switching away from screen-capture mode
            if (this.recordingMode !== 'screen-capture' && this.screenCaptureEnabled) {
                this.resetScreenCapture();
            }
        }
        
        // Update UI based on new mode
        this.updateUI();
    }
    
    resetScreenCapture() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }
        this.screenCaptureEnabled = false;
        
        const captureStatus = document.getElementById('capture-status');
        if (captureStatus) {
            captureStatus.style.display = 'none';
        }
        
        // Update UI to reflect the reset
        this.updateUI();
    }
    
    onScreenCaptureEnded() {
        console.log('🛑 Screen capture ended by user');
        this.screenCaptureEnabled = false;
        
        // Stop recording if it's active
        if (this.isCapturing) {
            this.stopRecording();
        }
        
        // Reset UI - no need to show trigger button, just reset start button
        const startBtn = document.getElementById('start-recording');
        const captureStatus = document.getElementById('capture-status');
        
        if (startBtn && !this.isCapturing) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<span class="btn-icon">⏺️</span><span>Start Recording</span>';
        }
        
        if (captureStatus) {
            captureStatus.style.display = 'none';
        }
        
        this.showWarning('Screen sharing stopped. Click "Start Recording" to share again.');
    }
    
    async startRecording() {
        try {
            console.log('🎬 Starting recording in mode:', this.recordingMode);
            
            this.updateStatus('Starting...', 'recording');
            
            if (this.recordingMode === 'screen-capture') {
                // For screen capture mode, use the simplified one-step process
                await this.enableScreenCaptureAndStart();
            } else if (this.recordingMode === 'tab-audio') {
                await this.startTabAudioCapture();
            } else {
                await this.startMicrophoneCapture();
            }
            
        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            this.showError('Failed to start recording: ' + error.message);
        }
    }
    
    async enableScreenCaptureAndStart() {
        try {
            console.log('🖥️ Starting screen capture and recording in one step...');
            
            // Update button to show we're requesting permissions
            const startBtn = document.getElementById('start-recording');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Grant Screen Permission...</span>';
            }
            
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            console.log('� Current tab:', tab.url);
            
            // Try to inject content script if not already present
            try {
                await this.ensureContentScriptLoaded(tab.id);
            } catch (injectionError) {
                console.warn('⚠️ Content script injection failed:', injectionError);
                // Continue anyway, might already be loaded
            }
            
            // Send message to content script to start screen capture (it will handle permission request)
            let response;
            try {
                response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'START_SCREEN_CAPTURE',
                    settings: {
                        backendUrl: document.getElementById('backend-url').value,
                        language: document.getElementById('language-select').value,
                        showOverlay: document.getElementById('show-overlay').checked,
                        autoSummary: document.getElementById('auto-summary').checked
                    }
                });
            } catch (messageError) {
                console.error('❌ Content script communication failed:', messageError);
                
                // Show helpful error message with reload option
                this.showContentScriptError();
                throw new Error('Content script not available. Please reload the page and try again.');
            }
            
            if (response && response.success) {
                this.isCapturing = true;
                this.captureStartTime = Date.now();
                this.screenCaptureEnabled = true;
                
                // Show capture status
                const captureStatus = document.getElementById('capture-status');
                if (captureStatus) {
                    captureStatus.style.display = 'block';
                    const statusText = captureStatus.querySelector('.status-text');
                    if (statusText) {
                        statusText.textContent = 'Screen recording active';
                    }
                    const statusDot = captureStatus.querySelector('.status-dot');
                    if (statusDot) {
                        statusDot.className = 'status-dot recording';
                    }
                }
                
                this.updateUI();
                this.startDurationTimer();
                this.updateStatus('Recording with screen capture...', 'recording');
                console.log('✅ Screen capture started successfully');
            } else {
                throw new Error(response?.error || 'Failed to start screen capture');
            }
            
        } catch (error) {
            console.error('❌ Failed to enable screen capture for recording:', error);
            
            // Reset button state
            const startBtn = document.getElementById('start-recording');
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.innerHTML = '<span class="btn-icon">⏺️</span><span>Start Recording</span>';
            }
            
            // Provide user-friendly error messages - handle DOMException properly
            let errorMessage = 'Unknown error occurred';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Screen sharing permission denied. Please allow screen sharing and try again.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Screen sharing is not supported in this browser or context.';
            } else if (error.name === 'AbortError') {
                errorMessage = 'Screen sharing was cancelled. Please try again.';
            } else if (error.name === 'InvalidStateError') {
                errorMessage = 'Screen sharing is not available in this context. Try refreshing the page.';
            } else if (error.name === 'SecurityError') {
                errorMessage = 'Security restrictions prevent screen sharing in this context.';
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.name) {
                errorMessage = `Screen sharing error: ${error.name}`;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else {
                // Last resort for DOMException objects
                errorMessage = `Screen sharing failed (${error.constructor?.name || 'Unknown error'})`;
            }
            
            // Add helpful tips for common issues
            if (!window.isSecureContext && window.location.protocol !== 'chrome-extension:') {
                errorMessage += '\n\nTip: Screen sharing requires HTTPS or localhost. Make sure you\'re on a secure site.';
            }
            
            throw new Error(errorMessage);
        }
    }
    
    async startTabAudioCapture() {
        try {
            console.log('🌐 Starting tab audio capture...');
            
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Start tab capture using callback (not Promise)
            const stream = await new Promise((resolve, reject) => {
                chrome.tabCapture.capture({
                    audio: true,
                    video: false
                }, (capturedStream) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (!capturedStream) {
                        reject(new Error('Failed to capture tab audio - no stream returned'));
                    } else {
                        resolve(capturedStream);
                    }
                });
            });
            
            this.mediaStream = stream;
            this.isCapturing = true;
            this.captureStartTime = Date.now();
            
            // Send stream to background for processing
            chrome.runtime.sendMessage({
                action: 'startCapture',
                mode: 'tab-audio',
                config: {
                    language: document.getElementById('language-select').value,
                    showOverlay: document.getElementById('show-overlay').checked
                }
            });
            
            this.updateUI();
            this.startDurationTimer();
            this.updateStatus('Recording tab audio...', 'recording');
            
            console.log('✅ Tab audio capture started');
            
        } catch (error) {
            console.error('❌ Failed to start tab audio capture:', error);
            this.showError('Failed to start tab audio capture: ' + error.message);
        }
    }
    
    async startScreenCapture() {
        try {
            console.log('🖥️ Starting screen capture from popup...');
            
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            console.log('📍 Current tab:', tab.url);
            
            // Try to inject content script if not already present
            try {
                await this.ensureContentScriptLoaded(tab.id);
            } catch (injectionError) {
                console.warn('⚠️ Content script injection failed:', injectionError);
                // Continue anyway, might already be loaded
            }
            
            // Send message to content script on the tab to start screen capture
            let response;
            try {
                response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'START_SCREEN_CAPTURE',
                    settings: {
                        backendUrl: document.getElementById('backend-url').value,
                        language: document.getElementById('language-select').value,
                        showOverlay: document.getElementById('show-overlay').checked,
                        autoSummary: document.getElementById('auto-summary').checked
                    }
                });
            } catch (messageError) {
                console.error('❌ Content script communication failed:', messageError);
                
                // Show helpful error message with reload option
                this.showContentScriptError();
                throw new Error('Content script not available. Please reload the page and try again.');
            }
            
            if (response && response.success) {
                this.isCapturing = true;
                this.captureStartTime = Date.now();
                this.updateUI();
                this.startDurationTimer();
                this.updateStatus('Recording with screen capture...', 'recording');
                console.log('✅ Screen capture started successfully');
            } else {
                throw new Error(response?.error || 'Failed to start screen capture');
            }
            
            console.log('✅ Screen capture command sent');
            
        } catch (error) {
            console.error('❌ Failed to start screen capture:', error);
            this.showError('Failed to start screen capture: ' + error.message);
        }
    }
    
    async ensureContentScriptLoaded(tabId) {
        try {
            console.log('🔧 Ensuring content script is loaded...');
            
            // Try to inject the content scripts manually
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content/common.js', 'content/screen-capture.js']
            });
            
            // Inject CSS as well
            await chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['overlay/overlay.css']
            });
            
            console.log('✅ Content script injected successfully');
            
            // Wait a bit for script to initialize
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.warn('⚠️ Manual content script injection failed:', error);
            throw error;
        }
    }
    
    async startMicrophoneCapture() {
        try {
            console.log('🎤 Starting microphone capture...');
            
            // Check if microphone permission is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Microphone API not supported in this browser');
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });
            
            this.mediaStream = stream;
            this.isCapturing = true;
            this.captureStartTime = Date.now();
            
            // Send to background for processing
            chrome.runtime.sendMessage({
                action: 'startCapture',
                mode: 'microphone',
                config: {
                    language: document.getElementById('language-select').value,
                    showOverlay: document.getElementById('show-overlay').checked
                }
            });
            
            this.updateUI();
            this.startDurationTimer();
            this.updateStatus('Recording microphone...', 'recording');
            
            console.log('✅ Microphone capture started');
            
        } catch (error) {
            console.error('❌ Failed to start microphone capture:', error);
            
            // Provide user-friendly error messages
            let errorMessage = 'Unknown error occurred';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Permission dismissed. Please allow microphone access and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No microphone found. Please connect a microphone and try again.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Microphone is already in use by another application.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = 'Microphone does not support the requested settings.';
            } else if (error.message) {
                errorMessage = error.message;
            } else {
                // Handle DOMException objects that don't convert to string properly
                errorMessage = `Microphone access error: ${error.name || 'Unknown error'}`;
            }
            
            this.showError('Failed to start microphone capture: ' + errorMessage);
            this.updateStatus('Microphone access denied', 'error');
        }
    }
    
    async stopRecording() {
        try {
            console.log('⏹️ Stopping recording...');
            
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                // Send message to content script to stop capture
                try {
                    const response = await chrome.tabs.sendMessage(tab.id, {
                        action: 'STOP_SCREEN_CAPTURE'
                    });
                    console.log('Stop capture response:', response);
                } catch (error) {
                    console.warn('Content script not responding (may already be stopped):', error.message);
                    // Don't throw error, continue with cleanup
                }
            }
            
            // Also stop any local media stream
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
                this.mediaStream = null;
            }
            
            this.isCapturing = false;
            this.stopDurationTimer();
            
            this.updateUI();
            this.updateStatus('Recording stopped', 'ready');
            
            console.log('✅ Recording stopped');
            
        } catch (error) {
            console.error('❌ Failed to stop recording:', error);
            this.showError('Failed to stop: ' + error.message);
        }
    }
    
    async checkCaptureStatus() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getCaptureStatus' });
            
            if (response && response.isCapturing) {
                this.isCapturing = true;
                this.captureStartTime = response.startTime;
                this.updateUI();
                this.startDurationTimer();
                this.updateStatus('Recording in progress...', 'recording');
            }
            
        } catch (error) {
            console.error('❌ Failed to check capture status:', error);
        }
    }
    
    async testConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/health`);
            
            if (response.ok) {
                this.connectionStatus = 'online';
                this.updateBackendStatus('Connected ✅');
            } else {
                this.connectionStatus = 'error';
                this.updateBackendStatus('Error ❌');
            }
            
        } catch (error) {
            this.connectionStatus = 'offline';
            this.updateBackendStatus('Offline ⚠️');
        }
    }
    
    updateBackendStatus(text) {
        const backendStatus = document.getElementById('backend-status');
        if (backendStatus) {
            backendStatus.textContent = `Backend: ${text}`;
        }
    }
    
    async testConnectionManual() {
        const btn = document.getElementById('test-connection');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="btn-icon">⏳</span><span>Testing...</span>';
        }
        
        await this.testConnection();
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="btn-icon">🔗</span><span>Test Connection</span>';
        }
        
        // Show result to user
        const statusMsg = this.connectionStatus === 'online' 
            ? '✅ Backend connection successful!' 
            : '❌ Cannot connect to backend. Make sure it\'s running on ' + this.backendUrl;
        
        this.showNotification(statusMsg, this.connectionStatus === 'online' ? 'success' : 'error');
    }
    
    async checkCurrentPlatform() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = new URL(tab.url);
            
            let platform = 'unknown';
            if (url.hostname.includes('meet.google.com')) {
                platform = 'google-meet';
            } else if (url.hostname.includes('zoom.us')) {
                platform = 'zoom';
            } else if (url.hostname.includes('teams.microsoft.com')) {
                platform = 'teams';
            } else if (url.hostname.includes('youtube.com')) {
                platform = 'youtube';
            } else if (url.hostname.includes('zoho.com') && url.pathname.includes('meeting')) {
                platform = 'zoho-meeting';
            } else if (url.protocol === 'file:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                platform = 'development';
            }
            
            this.currentPlatform = platform;
            this.updatePlatformInfo();
            
            console.log('🌐 Current platform:', platform, 'URL:', url.href);
            
        } catch (error) {
            console.error('❌ Failed to check platform:', error);
            this.currentPlatform = 'unknown';
            this.updatePlatformInfo();
        }
    }
    
    startDurationTimer() {
        this.durationTimer = setInterval(() => {
            const elapsed = Date.now() - this.captureStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            const timeString = `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
            
            const progressText = document.getElementById('progress-text');
            if (progressText) {
                progressText.textContent = `Recording: ${timeString}`;
            }
        }, 1000);
    }
    
    stopDurationTimer() {
        if (this.durationTimer) {
            clearInterval(this.durationTimer);
            this.durationTimer = null;
        }
    }
    
    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText && text) {
            progressText.textContent = text;
        }
    }
    
    updateUI() {
        const triggerBtn = document.getElementById('trigger-screen-capture');
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const progressSection = document.getElementById('progress-section');
        const transcriptPreview = document.getElementById('transcript-preview');
        const captureStatus = document.getElementById('capture-status');
        
        if (this.isCapturing) {
            // Recording is active
            if (triggerBtn) triggerBtn.style.display = 'none';
            if (startBtn) startBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'block';
            if (progressSection) progressSection.style.display = 'block';
            if (transcriptPreview) transcriptPreview.style.display = 'block';
            
            // Update capture status for recording
            if (captureStatus && this.screenCaptureEnabled) {
                captureStatus.style.display = 'block';
                const statusText = captureStatus.querySelector('.status-text');
                const statusDot = captureStatus.querySelector('.status-dot');
                if (statusText) statusText.textContent = 'Recording in progress...';
                if (statusDot) {
                    statusDot.className = 'status-dot recording';
                }
            }
        } else {
            // Not recording
            if (stopBtn) stopBtn.style.display = 'none';
            if (progressSection) progressSection.style.display = 'none';
            
            // Show appropriate buttons based on screen capture state
            if (this.recordingMode === 'screen-capture') {
                // Always show Start Recording button for screen capture mode
                // No separate "Enable Screen Capture" step needed
                if (triggerBtn) triggerBtn.style.display = 'none';
                if (startBtn) {
                    startBtn.style.display = 'block';
                    startBtn.disabled = false;
                    startBtn.innerHTML = '<span class="btn-icon">⏺️</span><span>Start Recording</span>';
                }
                
                // Show status if screen capture is already enabled
                if (this.screenCaptureEnabled && captureStatus) {
                    captureStatus.style.display = 'block';
                    const statusText = captureStatus.querySelector('.status-text');
                    const statusDot = captureStatus.querySelector('.status-dot');
                    if (statusText) statusText.textContent = 'Screen sharing enabled - Ready to record';
                    if (statusDot) {
                        statusDot.className = 'status-dot';
                        statusDot.style.background = 'var(--success)';
                    }
                } else if (captureStatus) {
                    captureStatus.style.display = 'none';
                }
            } else {
                // Other modes don't need screen capture - hide trigger button
                if (triggerBtn) triggerBtn.style.display = 'none';
                if (startBtn) {
                    startBtn.style.display = 'block';
                    startBtn.disabled = false;
                    startBtn.innerHTML = '<span class="btn-icon">⏺️</span><span>Start Recording</span>';
                }
                if (captureStatus) captureStatus.style.display = 'none';
            }
        }
    }
    
    updatePlatformInfo() {
        const platformText = document.getElementById('platform-text');
        if (platformText) {
            const platformName = this.formatPlatformName(this.currentPlatform);
            platformText.textContent = platformName;
        }
    }
    
    formatPlatformName(platform) {
        switch (platform) {
            case 'google-meet':
                return 'Google Meet';
            case 'zoom':
                return 'Zoom';
            case 'teams':
                return 'Microsoft Teams';
            case 'youtube':
                return 'YouTube';
            case 'zoho-meeting':
                return 'Zoho Meeting';
            case 'development':
                return 'Development/Local';
            default:
                return 'Unknown Platform';
        }
    }
    
    updateStatus(text, status = 'ready') {
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        
        if (statusText) statusText.textContent = text;
        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }
    }
    
    updatePerformanceInfo(text) {
        const performanceInfo = document.getElementById('performance-info');
        if (performanceInfo) {
            performanceInfo.textContent = text;
        }
    }
    
    toggleSettings() {
        const content = document.getElementById('settings-content');
        const toggle = document.getElementById('settings-toggle');
        
        if (!content || !toggle) {
            console.warn('⚠️ Settings elements not found');
            return;
        }
        
        const arrow = toggle.querySelector('.toggle-arrow');
        
        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            if (arrow) arrow.textContent = '▲';
        } else {
            content.style.display = 'none';
            if (arrow) arrow.textContent = '▼';
        }
    }
    
    async exportTranscript() {
        try {
            const transcript = this.transcriptData.map(item => 
                `[${item.timestamp}] ${item.speaker || 'Speaker'}: ${item.text}`
            ).join('\n');
            
            const blob = new Blob([transcript], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            console.log('📄 Transcript exported');
            this.updatePerformanceInfo('Transcript exported successfully');
            
        } catch (error) {
            console.error('❌ Failed to export transcript:', error);
            this.showError('Failed to export transcript');
        }
    }
    
    async generateSummary() {
        try {
            console.log('📝 Generating summary...');
            this.updatePerformanceInfo('Generating summary...');
            
            const response = await fetch(`${this.backendUrl}/summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transcript: this.transcriptData
                })
            });
            
            if (response.ok) {
                const summary = await response.json();
                console.log('✅ Summary generated:', summary);
                this.updatePerformanceInfo('Summary generated successfully');
                
                // Show summary in a new window or modal
                // This could be enhanced with a modal dialog
                alert(`Summary:\n\n${summary.summary}`);
            } else {
                throw new Error('Failed to generate summary');
            }
            
        } catch (error) {
            console.error('❌ Failed to generate summary:', error);
            this.showError('Failed to generate summary');
        }
    }
    
    async copyTranscript() {
        try {
            const transcript = this.transcriptData.map(item => 
                `${item.speaker || 'Speaker'}: ${item.text}`
            ).join('\n');
            
            await navigator.clipboard.writeText(transcript);
            
            console.log('📋 Transcript copied to clipboard');
            this.updatePerformanceInfo('Transcript copied to clipboard');
            
        } catch (error) {
            console.error('❌ Failed to copy transcript:', error);
            this.showError('Failed to copy transcript');
        }
    }
    
    showNotification(message, type = 'info', duration = 5000) {
        // Log appropriate message based on type
        if (type === 'error') {
            console.error('❌', message);
            this.updatePerformanceInfo(`Error: ${message}`);
        } else if (type === 'warning') {
            console.warn('⚠️', message);
            this.updatePerformanceInfo(`Warning: ${message}`);
        } else if (type === 'success') {
            console.log('✅', message);
            this.updatePerformanceInfo(message);
        } else {
            console.info('ℹ️', message);
            this.updatePerformanceInfo(message);
        }
        
        // Create styled notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Apply styles based on type
        const colors = {
            error: '#ef4444',
            warning: '#f59e0b',
            success: '#22c55e',
            info: '#6366f1'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 14px;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after specified duration
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success', 3000); // Shorter duration for success messages
    }
    
    showWarning(message) {
        this.showNotification(message, 'warning');
    }
    
    showContentScriptError() {
        // Create a more detailed error notification with reload button
        const notification = document.createElement('div');
        notification.className = 'notification notification-error enhanced-error';
        notification.innerHTML = `
            <div class="error-content">
                <div class="error-title">⚠️ Extension Setup Required</div>
                <div class="error-message">The page needs to be reloaded to enable screen capture.</div>
                <div class="error-actions">
                    <button class="reload-btn" onclick="location.reload()">🔄 Reload Page</button>
                    <button class="dismiss-btn" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ef4444;
            color: white;
            padding: 16px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 14px;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        
        // Add styles for the enhanced error content
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-error .error-content {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .enhanced-error .error-title {
                font-weight: 600;
                font-size: 15px;
            }
            .enhanced-error .error-message {
                font-size: 13px;
                opacity: 0.9;
            }
            .enhanced-error .error-actions {
                display: flex;
                gap: 8px;
                margin-top: 4px;
            }
            .enhanced-error .reload-btn {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                flex: 1;
            }
            .enhanced-error .reload-btn:hover {
                background: rgba(255,255,255,0.3);
            }
            .enhanced-error .dismiss-btn {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 6px 8px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
            }
            .enhanced-error .dismiss-btn:hover {
                background: rgba(255,255,255,0.1);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 10000);
    }
    
    handleFileSelect(file) {
        // Validate file type
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/flac', 'audio/mp4', 'audio/x-m4a'];
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|flac)$/i)) {
            this.showError('Please select a valid audio file (MP3, WAV, M4A, FLAC)');
            return;
        }
        
        // Validate file size (500MB limit)
        const maxSize = 500 * 1024 * 1024; // 500MB in bytes
        if (file.size > maxSize) {
            this.showError('File size must be less than 500MB');
            return;
        }
        
        this.selectedFile = file;
        this.updateFileInfo();
        
        console.log('📁 File selected:', file.name, `(${this.formatFileSize(file.size)})`);
    }
    
    updateFileInfo() {
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const processBtn = document.getElementById('process-audio');
        
        if (this.selectedFile) {
            fileName.textContent = this.selectedFile.name;
            fileSize.textContent = this.formatFileSize(this.selectedFile.size);
            fileInfo.style.display = 'flex';
            processBtn.disabled = false;
        } else {
            fileInfo.style.display = 'none';
            processBtn.disabled = true;
        }
    }
    
    clearSelectedFile() {
        this.selectedFile = null;
        document.getElementById('audio-file-input').value = '';
        this.updateFileInfo();
        console.log('🗑️ File cleared');
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async processAudioFile() {
        if (!this.selectedFile) {
            this.showError('No audio file selected');
            return;
        }
        
        // Validate file size (max 500MB)
        const maxSize = 500 * 1024 * 1024; // 500MB in bytes
        if (this.selectedFile.size > maxSize) {
            this.showError('File too large. Maximum size is 500MB.');
            return;
        }
        
        try {
            this.updateStatus('Processing audio file...', 'processing');
            this.updatePerformanceInfo('Uploading and processing audio...');
            
            // Show progress
            const progressSection = document.getElementById('progress-section');
            if (progressSection) {
                progressSection.style.display = 'block';
                this.updateProgress(0, 'Preparing upload...');
            }
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', this.selectedFile); // Changed from 'audio_file' to 'file'
            
            // Send to backend using the correct endpoint
            const response = await fetch(`${this.backendUrl}/api/process-audio`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }
            
            this.updateProgress(90, 'Processing results...');
            
            const result = await response.json();
            
            this.updateProgress(100, 'Complete!');
            
            // Show transcript results
            this.displayTranscriptResults(result);
            
            this.updateStatus('Audio processed successfully', 'ready');
            this.updatePerformanceInfo('Audio processing complete');
            
            // Hide progress after 2 seconds
            setTimeout(() => {
                if (progressSection) {
                    progressSection.style.display = 'none';
                }
            }, 2000);
            
            console.log('✅ Audio processed successfully:', result);
            
        } catch (error) {
            console.error('❌ Failed to process audio:', error);
            this.showError('Failed to process audio: ' + error.message);
            this.updateStatus('Processing failed', 'error');
            
            // Hide progress
            const progressSection = document.getElementById('progress-section');
            if (progressSection) {
                progressSection.style.display = 'none';
            }
        }
    }
    
    displayTranscriptResults(result) {
        const transcriptPreview = document.getElementById('transcript-preview');
        const transcriptContent = document.getElementById('transcript-content');
        const quickActions = document.getElementById('quick-actions');
        
        if (!transcriptPreview || !transcriptContent) {
            console.warn('⚠️ Transcript display elements not found');
            return;
        }
        
        // Show transcript section
        transcriptPreview.style.display = 'block';
        if (quickActions) {
            quickActions.style.display = 'flex';
        }
        
        // Clear existing content
        transcriptContent.innerHTML = '';
        
        // Handle the backend's response format
        if (result.transcription) {
            // Store the transcript data
            this.transcriptData = result;
            
            // Display the transcription text
            const transcriptItem = document.createElement('div');
            transcriptItem.className = 'transcript-item';
            
            // If there are speakers, display them
            if (result.speakers && result.speakers.length > 0) {
                result.speakers.forEach(segment => {
                    const segmentDiv = document.createElement('div');
                    segmentDiv.className = 'transcript-segment';
                    segmentDiv.innerHTML = `
                        <span class="speaker">Speaker ${segment.speaker_id || 'Unknown'}:</span>
                        <span class="text">${segment.text || ''}</span>
                        ${segment.timestamp ? `<span class="timestamp">${this.formatTime(segment.timestamp)}</span>` : ''}
                    `;
                    transcriptContent.appendChild(segmentDiv);
                });
            } else {
                // Just show the raw transcription
                transcriptItem.innerHTML = `
                    <span class="text">${result.transcription}</span>
                `;
                transcriptContent.appendChild(transcriptItem);
            }
            
            // Update word count
            const wordCount = result.transcription.split(/\s+/).filter(w => w.length > 0).length;
            const wordCountElement = document.getElementById('word-count');
            if (wordCountElement) {
                wordCountElement.textContent = `${wordCount} words`;
            }
            this.wordCount = wordCount;
            
            // Display summary if available
            if (result.full_summary || result.key_points || result.action_items) {
                const summaryDiv = document.createElement('div');
                summaryDiv.className = 'summary-section';
                summaryDiv.innerHTML = `
                    <div class="summary-header">📝 Summary</div>
                    ${result.full_summary ? `<div class="summary-text">${result.full_summary}</div>` : ''}
                    ${result.key_points && result.key_points.length > 0 ? `
                        <div class="summary-subsection">
                            <strong>Key Points:</strong>
                            <ul>${result.key_points.map(point => `<li>${point}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${result.action_items && result.action_items.length > 0 ? `
                        <div class="summary-subsection">
                            <strong>Action Items:</strong>
                            <ul>${result.action_items.map(item => `<li>${item}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${result.conclusion ? `
                        <div class="summary-subsection">
                            <strong>Conclusion:</strong>
                            <p>${result.conclusion}</p>
                        </div>
                    ` : ''}
                `;
                transcriptContent.appendChild(summaryDiv);
            }
            
        } else {
            // Fallback for unexpected format
            transcriptContent.innerHTML = '<div class="transcript-placeholder">No transcription available</div>';
        }
        
        console.log('✅ Transcript results displayed');
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    showHelp() {
        const helpMessage = `
🎯 AI MOM - Meeting Intelligence Help

📺 Screen Capture Mode:
   • Simply click "Start Recording" 
   • Grant screen sharing permission when prompted
   • Choose what to share (tab, window, or entire screen)
   • Recording starts immediately after permission granted

🎤 Microphone Mode:
   • Records audio from your microphone
   • Great for voice notes and dictation

📁 Audio Upload Mode:
   • Upload pre-recorded audio files
   • Supports MP3, WAV, M4A, FLAC
   • Maximum file size: 500MB

� Troubleshooting Screen Capture:

   1. RELOAD EXTENSION:
      • Go to chrome://extensions/
      • Find "AI MOM" and click Reload
   
   2. RELOAD THIS PAGE:
      • Refresh the current tab (Ctrl+R)
      • Wait for page to fully load
   
   3. CHECK PERMISSIONS:
      • Allow screen sharing when prompted
      • Make sure you're on HTTPS or localhost
   
   4. BROWSER REQUIREMENTS:
      • Use Chrome/Edge (latest version)
      • Enable "Use microphone" in site settings

�💡 Tips:
   • Test connection before recording
   • Enable speaker alerts for notifications
   • Auto-summaries generate key points
   • Export transcripts in multiple formats

⚙️ Settings:
   • Configure backend URL
   • Select transcription language
   • Toggle overlay and alerts
   • Test backend connection

Need more help? Check the documentation or contact support.
        `.trim();
        
        alert(helpMessage);
    }
    
    async runDiagnostics() {
        console.log('🔍 Running diagnostics...');
        
        const diagnostics = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            isSecureContext: window.isSecureContext,
            protocol: window.location.protocol,
            mediaDevices: !!navigator.mediaDevices,
            getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            chromeRuntime: !!chrome.runtime,
            chromeTabCapture: !!chrome.tabCapture,
            chromeScripting: !!chrome.scripting,
            extensionId: chrome.runtime?.id,
            recordingMode: this.recordingMode,
            screenCaptureEnabled: this.screenCaptureEnabled,
            isCapturing: this.isCapturing,
            backendUrl: this.backendUrl,
            connectionStatus: this.connectionStatus
        };
        
        console.log('📊 Diagnostics Report:', diagnostics);
        
        // Show condensed diagnostics to user
        const report = `
🔍 AI MOM Diagnostics Report

Browser: ${diagnostics.userAgent.includes('Chrome') ? 'Chrome' : 'Other'}
Security: ${diagnostics.isSecureContext ? '✅ Secure' : '❌ Not Secure'}
Screen API: ${diagnostics.getDisplayMedia ? '✅ Available' : '❌ Missing'}
Extension: ${diagnostics.chromeRuntime ? '✅ Active' : '❌ Inactive'}
Backend: ${diagnostics.connectionStatus}

${!diagnostics.isSecureContext ? '⚠️ Warning: Screen sharing requires HTTPS' : ''}
${!diagnostics.getDisplayMedia ? '⚠️ Warning: Browser doesn\'t support screen capture' : ''}
        `.trim();
        
        alert(report);
        
        return diagnostics;
    }
}

// Initialize the popup controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const popupController = new UnifiedPopupController();
});