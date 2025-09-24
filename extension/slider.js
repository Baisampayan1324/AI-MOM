// AI Meeting Minutes Extension - Enhanced Dual-Mode Interface
const backendUrl = "http://127.0.0.1:8000";

class MeetingMinutesApp {
    constructor() {
        this.isRecording = false;
        this.isConnected = false;
        this.currentMode = 'online';
        this.socket = null;
        this.mediaRecorder = null;
        this.audioStream = null;
        this.transcriptionBuffer = [];
        this.progressiveSummaryTimer = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.loadUserPreferences();
        this.switchMode('online'); // Fixed: using switchMode instead of setActiveMode
        
        // Check for Google Meet environment
        this.checkGoogleMeetEnvironment();
    }
    
    checkGoogleMeetEnvironment() {
        const isGoogleMeet = this.detectRestrictedEnvironment();
        const warningDiv = document.getElementById('googleMeetWarning');
        
        if (isGoogleMeet) {
            console.log('[DEBUG] Google Meet environment detected');
            warningDiv.style.display = 'block';
            
            // Add click handler for new tab button
            const openNewTabBtn = document.getElementById('openNewTabBtn');
            openNewTabBtn.addEventListener('click', () => {
                this.openExtensionInNewTab();
            });
            
            // Disable recording button in Google Meet
            const recordBtn = document.getElementById('recordBtn');
            recordBtn.disabled = true;
            recordBtn.title = 'Recording not available in Google Meet - use new tab';
        } else {
            warningDiv.style.display = 'none';
        }
    }

    bindEvents() {
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchMode(e.target.dataset.mode);
            });
        });

        document.getElementById('connectBtn').addEventListener('click', () => {
            this.toggleConnection();
        });

        document.getElementById('recordBtn').addEventListener('click', () => {
            this.toggleRecording();
        });

        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('audioFileInput');

        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadZone.addEventListener('drop', this.handleFileDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        document.getElementById('closeBtn').addEventListener('click', () => {
            this.closeExtension();
        });

        document.getElementById('userName').addEventListener('input', this.saveUserPreferences.bind(this));
        document.getElementById('meetingId').addEventListener('input', this.saveUserPreferences.bind(this));
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        document.getElementById('onlineMode').style.display = mode === 'online' ? 'block' : 'none';
        document.getElementById('offlineMode').style.display = mode === 'offline' ? 'block' : 'none';

        if (this.isRecording && mode === 'offline') {
            this.stopRecording();
        }
    }

    async toggleConnection() {
        if (this.isConnected) {
            this.disconnectFromMeeting();
        } else {
            await this.connectToMeeting();
        }
    }

    async testAudioCapabilities() {
        console.log('[DEBUG] Testing audio capabilities...');
        
        const capabilities = {
            mediaDevicesSupported: !!navigator.mediaDevices,
            getUserMediaSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            mediaRecorderSupported: !!window.MediaRecorder,
            webSocketSupported: !!window.WebSocket,
            audioContextSupported: !!(window.AudioContext || window.webkitAudioContext),
            fileReaderSupported: !!window.FileReader
        };

        console.log('[DEBUG] Browser capabilities:', capabilities);

        // Test MIME type support
        const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/wav',
            'audio/mp4',
            'audio/ogg'
        ];

        const supportedMimeTypes = mimeTypes.filter(type => MediaRecorder.isTypeSupported(type));
        console.log('[DEBUG] Supported MIME types:', supportedMimeTypes);

        // Test microphone enumeration
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            console.log('[DEBUG] Available audio input devices:', audioInputs.map(device => ({
                deviceId: device.deviceId,
                label: device.label || 'Unnamed device',
                groupId: device.groupId
            })));
        } catch (error) {
            console.warn('[DEBUG] Could not enumerate devices:', error);
        }

        return {
            ...capabilities,
            supportedMimeTypes,
            allCapabilitiesOk: Object.values(capabilities).every(Boolean) && supportedMimeTypes.length > 0
        };
    }

    async connectToMeeting() {
        const meetingId = document.getElementById('meetingId').value.trim();
        const userName = document.getElementById('userName').value.trim();

        if (!meetingId) {
            this.showNotification('Please enter a meeting ID', 'error');
            return;
        }

        try {
            this.updateConnectionStatus('Connecting...', 'connecting');
            document.getElementById('connectBtn').disabled = true;

            // Test audio capabilities before connecting
            console.log('[DEBUG] Testing browser capabilities...');
            const capabilities = await this.testAudioCapabilities();
            
            if (!capabilities.allCapabilitiesOk) {
                console.warn('[DEBUG] Some capabilities missing:', capabilities);
                const missingFeatures = Object.entries(capabilities)
                    .filter(([key, value]) => key !== 'allCapabilitiesOk' && key !== 'supportedMimeTypes' && !value)
                    .map(([key]) => key);
                
                if (missingFeatures.length > 0) {
                    this.showNotification(`Browser missing features: ${missingFeatures.join(', ')}. Recording may not work properly.`, 'warning');
                }
            } else {
                console.log('[DEBUG] All browser capabilities are supported');
            }

            await this.connectToWebSocket(meetingId, userName);

            this.isConnected = true;
            this.updateConnectionStatus('Connected', 'connected');
            this.updateUI();
            this.showNotification('Connected to meeting!', 'success');
            this.saveUserPreferences();

        } catch (error) {
            console.error('Connection failed:', error);
            this.updateConnectionStatus('Connection Failed', 'error');
            this.showNotification('Failed to connect to backend server', 'error');
        } finally {
            document.getElementById('connectBtn').disabled = false;
        }
    }

    connectToWebSocket(meetingId, userName) {
        return new Promise((resolve, reject) => {
            const wsUrl = `ws://127.0.0.1:8000/ws/meeting/${meetingId}`;
            console.log('[DEBUG] Connecting to WebSocket:', wsUrl);
            this.socket = new WebSocket(wsUrl);

            // Add connection timeout
            const connectionTimeout = setTimeout(() => {
                if (this.socket.readyState !== WebSocket.OPEN) {
                    console.log('[DEBUG] WebSocket connection timeout');
                    this.socket.close();
                    reject(new Error('Connection timeout'));
                }
            }, 10000); // 10 seconds

            this.socket.onopen = () => {
                console.log('[DEBUG] WebSocket connected successfully');
                clearTimeout(connectionTimeout);
                resolve();
            };

            this.socket.onmessage = (event) => {
                console.log('[DEBUG] WebSocket message received:', event.data);
                this.handleWebSocketMessage(JSON.parse(event.data));
            };

            this.socket.onclose = (event) => {
                console.log('[DEBUG] WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
                clearTimeout(connectionTimeout);
                // Only auto-disconnect if we were previously connected
                if (this.isConnected && !event.wasClean) {
                    this.disconnectFromMeeting();
                }
            };

            this.socket.onerror = (error) => {
                console.error('[DEBUG] WebSocket error:', error);
                clearTimeout(connectionTimeout);
                reject(error);
            };
        });
    }

    disconnectFromMeeting() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        if (this.isRecording) {
            this.stopRecording();
        }

        this.isConnected = false;
        this.updateConnectionStatus('Disconnected', 'ready');
        this.updateUI();
        this.showNotification('Disconnected from meeting', 'warning');
    }

    async toggleRecording() {
            console.log('[DEBUG] toggleRecording called. isConnected:', this.isConnected, 'isRecording:', this.isRecording);
            if (!this.isConnected) {
                this.showNotification('Please connect to meeting first', 'error');
                console.log('[DEBUG] Not connected, cannot start recording.');
                return;
            }

            if (this.isRecording) {
                console.log('[DEBUG] Stopping recording...');
                this.stopRecording();
            } else {
                console.log('[DEBUG] Starting recording...');
                await this.startRecording();
            }
    }

    async getAudioStreamWithFallback() {
        console.log('[DEBUG] Attempting to get audio stream with fallback methods...');
        
        // Check if we're in a restricted environment first
        const isRestrictedEnv = this.detectRestrictedEnvironment();
        
        if (isRestrictedEnv) {
            console.log('[DEBUG] In restricted environment, trying screen capture first...');
            
            // Try screen capture first in restricted environments
            if (navigator.mediaDevices.getDisplayMedia) {
                try {
                    console.log('[DEBUG] Attempting screen capture with audio...');
                    const screenStream = await navigator.mediaDevices.getDisplayMedia({
                        video: false,
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }
                    });
                    
                    if (screenStream.getAudioTracks().length > 0) {
                        console.log('[DEBUG] Screen audio capture successful');
                        this.showNotification('Using screen audio capture due to Google Meet restrictions', 'info');
                        return screenStream;
                    }
                } catch (error) {
                    console.warn('[DEBUG] Screen audio capture failed:', error);
                }
            }
            
            // If screen capture fails, suggest opening in new tab
            this.showNotification(
                'Recording blocked by Google Meet. Click the "🔗" button to open in a new tab where recording will work.',
                'warning'
            );
            
            throw new Error('Recording blocked by Google Meet security policy. Please use the extension in a new tab.');
        }
        
        // Method 1: Try standard getUserMedia with different constraints
        const standardConstraints = [
            {
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            },
            {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            },
            { audio: true }
        ];

        for (let i = 0; i < standardConstraints.length; i++) {
            try {
                console.log(`[DEBUG] Trying standard constraint ${i + 1}:`, standardConstraints[i]);
                const stream = await navigator.mediaDevices.getUserMedia(standardConstraints[i]);
                console.log('[DEBUG] Standard getUserMedia successful');
                return stream;
            } catch (error) {
                console.warn(`[DEBUG] Standard constraint ${i + 1} failed:`, error);
            }
        }

        // Method 2: Try to capture system audio or screen with audio
        if (navigator.mediaDevices.getDisplayMedia) {
            try {
                console.log('[DEBUG] Attempting screen capture with audio as fallback...');
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: false,
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true
                    }
                });
                
                if (screenStream.getAudioTracks().length > 0) {
                    console.log('[DEBUG] Screen audio capture successful');
                    return screenStream;
                }
            } catch (error) {
                console.warn('[DEBUG] Screen audio capture failed:', error);
            }
        }

        // Method 3: Last resort - try legacy webkit getUserMedia
        if (navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
            try {
                console.log('[DEBUG] Trying legacy getUserMedia...');
                const legacyGetUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                
                return new Promise((resolve, reject) => {
                    legacyGetUserMedia.call(navigator, 
                        { audio: true },
                        resolve,
                        reject
                    );
                });
            } catch (error) {
                console.warn('[DEBUG] Legacy getUserMedia failed:', error);
            }
        }

        throw new Error('All audio capture methods failed. Please check microphone permissions and try refreshing the page.');
    }

    async startRecording() {
            try {
                console.log('[DEBUG] Checking microphone permission...');
                const hasPermission = await this.checkMicrophonePermission();
                console.log('[DEBUG] Microphone permission:', hasPermission);
                if (!hasPermission) {
                    console.log('[DEBUG] Microphone permission denied.');
                    return;
                }

                console.log('[DEBUG] Requesting audio stream with fallback methods...');
                this.audioStream = await this.getAudioStreamWithFallback();
                
                // Log detailed stream information
                console.log('[DEBUG] Audio stream details:', {
                    tracks: this.audioStream.getTracks().map(track => ({
                        kind: track.kind,
                        enabled: track.enabled,
                        readyState: track.readyState,
                        settings: track.getSettings ? track.getSettings() : 'N/A'
                    })),
                    constraints: this.audioStream.getTracks()[0]?.getConstraints ? this.audioStream.getTracks()[0].getConstraints() : 'N/A'
                });

                this.setupAudioProcessing();
                console.log('[DEBUG] Audio processing set up.');

                this.isRecording = true;
                this.updateUI();
                this.clearLiveResults();
                this.startProgressiveSummaryTimer();
                this.updateConnectionStatus('Recording...', 'recording');
                localStorage.setItem('aiMeetingMinutes_hasRecorded', 'true');
                this.showNotification('Recording started!', 'success');

            } catch (error) {
                console.error('[DEBUG] Failed to start recording:', error);
                
                // Provide specific error messages based on error type
                let errorMessage = 'Failed to access microphone.';
                let errorDetails = '';

                switch (error.name) {
                    case 'NotAllowedError':
                        errorMessage = 'Microphone access denied.';
                        errorDetails = 'Please allow microphone permissions and refresh the page.';
                        break;
                    case 'NotFoundError':
                        errorMessage = 'No microphone found.';
                        errorDetails = 'Please check that a microphone is connected to your device.';
                        break;
                    case 'NotReadableError':
                        errorMessage = 'Microphone is busy.';
                        errorDetails = 'The microphone may be in use by another application.';
                        break;
                    case 'OverconstrainedError':
                        errorMessage = 'Microphone constraints not supported.';
                        errorDetails = 'Your device may not support the required audio settings.';
                        break;
                    case 'SecurityError':
                        errorMessage = 'Microphone access blocked.';
                        errorDetails = 'This may be due to browser security restrictions.';
                        break;
                    default:
                        errorMessage = 'Microphone setup failed.';
                        errorDetails = error.message || 'Unknown error occurred.';
                }

                console.error('[DEBUG] Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });

                this.showNotification(`${errorMessage} ${errorDetails}`, 'error');
                this.updateConnectionStatus('Error', 'error');
            }
    }

    stopRecording() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        this.isRecording = false;
        this.updateUI();
        this.updateConnectionStatus('Generating Summary...', 'processing');
        
        // Show processing indicator in the Action Items section
        const actionItems = document.getElementById('actionItems');
        actionItems.querySelector('.live-content').innerHTML = `
            <div class="summary-processing">
                <div class="loading-spinner"></div>
                <p>Processing final summary...</p>
                <p class="processing-tip">Analyzing meeting data and generating insights</p>
            </div>
        `;

        if (this.progressiveSummaryTimer) {
            clearInterval(this.progressiveSummaryTimer);
            this.progressiveSummaryTimer = null;
        }

        if (this.transcriptionBuffer.length > 0) {
            this.generateFinalSummary();
            this.showNotification('Recording stopped. Generating comprehensive summary...', 'info');
        } else {
            this.showNotification('Recording stopped. No audio was detected.', 'warning');
            this.updateConnectionStatus('Connected', 'connected');
        }
    }

    setupAudioProcessing() {
        console.log('[DEBUG] Setting up MediaRecorder...');
        
        // Try different MIME types for better compatibility
        const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/wav',
            'audio/mp4',
            'audio/ogg'
        ];

        let selectedMimeType = null;
        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                selectedMimeType = mimeType;
                console.log('[DEBUG] Selected MIME type:', mimeType);
                break;
            }
        }

        if (!selectedMimeType) {
            console.warn('[DEBUG] No supported MIME types found, using default');
            selectedMimeType = 'audio/webm';
        }

        const options = {
            mimeType: selectedMimeType,
            audioBitsPerSecond: 128000
        };

        console.log('[DEBUG] Creating MediaRecorder with options:', options);
        this.mediaRecorder = new MediaRecorder(this.audioStream, options);

        this.mediaRecorder.ondataavailable = (event) => {
            console.log('[DEBUG] MediaRecorder data available:', event.data.size, 'bytes');
            if (event.data.size > 0 && this.socket && this.socket.readyState === WebSocket.OPEN) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    console.log('[DEBUG] Sending audio chunk to server, size:', base64.length);
                    this.socket.send(JSON.stringify({
                        type: 'audio_chunk',
                        data: base64,
                        user_name: document.getElementById('userName').value,
                        mimeType: selectedMimeType
                    }));
                };
                reader.onerror = (error) => {
                    console.error('[DEBUG] FileReader error:', error);
                };
                reader.readAsDataURL(event.data);
            } else {
                console.warn('[DEBUG] Cannot send audio chunk:', {
                    dataSize: event.data.size,
                    socketState: this.socket ? this.socket.readyState : 'null',
                    expectedState: WebSocket.OPEN
                });
            }
        };

        this.mediaRecorder.onerror = (event) => {
            console.error('[DEBUG] MediaRecorder error:', event.error);
        };

        this.mediaRecorder.onstart = () => {
            console.log('[DEBUG] MediaRecorder started successfully');
        };

        this.mediaRecorder.onstop = () => {
            console.log('[DEBUG] MediaRecorder stopped');
        };

        this.mediaRecorder.start(5000); // Send chunks every 5 seconds
        console.log('[DEBUG] MediaRecorder started with 5-second intervals');
        
        this.setupAudioLevelMonitoring(this.audioStream);
        console.log('[DEBUG] Audio level monitoring set up.');
    }
    
    setupAudioLevelMonitoring(stream) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const visualizerBars = document.querySelectorAll('.visualizer-bar');

        const updateAudioLevels = () => {
            if (!this.isRecording) {
                visualizerBars.forEach(bar => bar.style.height = '10px');
                return;
            }
            
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            
            visualizerBars.forEach((bar, index) => {
                const height = (dataArray[index] / 255) * 50 + 10;
                bar.style.height = `${height}px`;
            });
            
            requestAnimationFrame(updateAudioLevels);
        }
        
        updateAudioLevels();
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'transcription':
                this.handleLiveTranscription(data);
                break;
            case 'speaker_alert':
                this.handleSpeakerAlert(data);
                break;
            case 'progressive_summary':
                this.updateProgressiveSummary(data.summary);
                break;
            case 'final_summary':
                this.displayFinalSummary(data);
                break;
            case 'error':
                this.showNotification(data.message, 'error');
                break;
        }
    }

    handleLiveTranscription(data) {
        this.transcriptionBuffer.push(data);
        const liveTranscription = document.getElementById('liveTranscription');
        
        const transcriptionElement = document.createElement('div');
        transcriptionElement.className = 'transcription-item';
        transcriptionElement.innerHTML = `
            <span class="speaker-label">${data.speaker}:</span>
            <span class="transcription-text">${data.text}</span>
        `;
        
        liveTranscription.querySelector('.live-content').appendChild(transcriptionElement);
        liveTranscription.querySelector('.live-content').scrollTop = liveTranscription.querySelector('.live-content').scrollHeight;
    }

    handleSpeakerAlert(data) {
        const speakerAlerts = document.getElementById('speakerAlerts');
        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${data.type === 'personal' ? 'personal-alert' : 'general-alert'}`;
        alertElement.innerHTML = `
            <div class="alert-icon">${data.type === 'personal' ? '🚨' : '⚠️'}</div>
            <div class="alert-content">
                <div class="alert-text">${data.text}</div>
                <div class="alert-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        speakerAlerts.querySelector('.live-content').appendChild(alertElement);
        speakerAlerts.querySelector('.live-content').scrollTop = speakerAlerts.querySelector('.live-content').scrollHeight;
    }

    startProgressiveSummaryTimer() {
        this.progressiveSummaryTimer = setInterval(() => {
            if (this.transcriptionBuffer.length > 0 && this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: 'generate_summary',
                    summary_type: 'progressive',
                    meeting_id: document.getElementById('meetingId').value
                }));
            }
        }, 120000); // 2 minutes
    }

    generateFinalSummary() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'generate_summary',
                summary_type: 'comprehensive',
                meeting_id: document.getElementById('meetingId').value
            }));
        }
    }

    updateProgressiveSummary(summary) {
        const progressiveSummary = document.getElementById('progressiveSummary');
        progressiveSummary.querySelector('.live-content').innerHTML = `<p>${summary}</p>`;
    }

    displayFinalSummary(result) {
        // Update status to show we're done processing
        this.updateConnectionStatus('Summary Ready', 'connected');
        
        const actionItems = document.getElementById('actionItems');
        actionItems.querySelector('.live-content').innerHTML = `
            <div class="final-summary-content">
                <div class="summary-complete-banner">
                    <div class="summary-complete-icon">✅</div>
                    <div class="summary-complete-text">Summary Complete</div>
                </div>
                
                <div class="summary-section fade-in">
                    <h4><span class="summary-icon">📝</span> Meeting Overview</h4>
                    <p>${result.summary}</p>
                </div>
                
                ${result.key_points ? `
                    <div class="summary-section fade-in" style="animation-delay: 0.2s">
                        <h4><span class="summary-icon">🎯</span> Key Points</h4>
                        <ul class="key-points-list">
                            ${result.key_points.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${result.action_items ? `
                    <div class="summary-section fade-in" style="animation-delay: 0.4s">
                        <h4><span class="summary-icon">✓</span> Action Items</h4>
                        <ul class="action-items-list">
                            ${result.action_items.map(item => `
                                <li class="action-item-entry">
                                    <span class="action-checkbox"></span>
                                    <span>${typeof item === 'string' ? item : item.text || ''}</span>
                                    ${item.assignee ? `<span class="action-assignee">@${item.assignee}</span>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="summary-actions fade-in" style="animation-delay: 0.6s">
                    <button class="btn btn-primary summary-action-btn" id="copySummaryBtn">
                        📋 Copy Summary
                    </button>
                    <button class="btn btn-secondary summary-action-btn" id="printSummaryBtn">
                        🖨️ Print
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners for action buttons
        document.getElementById('copySummaryBtn').addEventListener('click', () => {
            const summaryText = `
# Meeting Summary
${result.summary}

## Key Points
${result.key_points ? result.key_points.map(point => `- ${point}`).join('\n') : 'None'}

## Action Items
${result.action_items ? result.action_items.map(item => {
    if (typeof item === 'string') return `- ${item}`;
    return `- ${item.text || item.task || item}${item.assignee ? ` (Assigned to: ${item.assignee})` : ''}`;
}).join('\n') : 'None'}
            `;
            
            navigator.clipboard.writeText(summaryText).then(() => {
                this.showNotification('Summary copied to clipboard!', 'success');
            });
        });
        
        document.getElementById('printSummaryBtn').addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>Meeting Summary</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                        h2 { color: #444; margin-top: 30px; }
                        ul { padding-left: 20px; }
                        li { margin-bottom: 8px; }
                        .summary { background: #f9f9f9; padding: 15px; border-radius: 5px; }
                        .assigned { font-weight: bold; color: #667eea; }
                    </style>
                </head>
                <body>
                    <h1>Meeting Summary</h1>
                    <div class="summary">${result.summary.replace(/\n/g, '<br>')}</div>
                    
                    ${result.key_points ? `
                        <h2>Key Points</h2>
                        <ul>
                            ${result.key_points.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    ${result.action_items ? `
                        <h2>Action Items</h2>
                        <ul>
                            ${result.action_items.map(item => {
                                if (typeof item === 'string') return `<li>${item}</li>`;
                                return `<li>${item.text || item.task || item}${item.assignee ? ` <span class="assigned">(Assigned to: ${item.assignee})</span>` : ''}</li>`;
                            }).join('')}
                        </ul>
                    ` : ''}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 500);
        });
        
        // Mark the first summary section as highlighted
        setTimeout(() => {
            const firstSection = actionItems.querySelector('.summary-section');
            if (firstSection) {
                firstSection.classList.add('highlight-card');
            }
        }, 1000);
        
        // Show success notification
        this.showNotification('Summary generated successfully!', 'success');
        
        // Add special highlighting effect to the summary card
        const summaryCard = actionItems.closest('.result-card');
        if (summaryCard) {
            summaryCard.classList.add('highlight-card');
            setTimeout(() => summaryCard.classList.remove('highlight-card'), 2000);
        }
    }

    clearLiveResults() {
        document.getElementById('liveTranscription').querySelector('.live-content').innerHTML = '<div class="empty-state">🎤 Recording started, speak to see transcription...</div>';
        document.getElementById('speakerAlerts').querySelector('.live-content').innerHTML = '<div class="empty-state">No alerts yet. Alerts appear when you\'re mentioned.</div>';
        document.getElementById('progressiveSummary').querySelector('.live-content').innerHTML = '<div class="empty-state">Progressive summary will appear during recording...</div>';
        document.getElementById('actionItems').querySelector('.live-content').innerHTML = '<div class="empty-state">Complete summary will appear when recording stops.</div>';
        this.transcriptionBuffer = [];
    }

    closeExtension() {
        if (this.isRecording) {
            this.stopRecording();
        }
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }
        this.saveUserPreferences();
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ action: 'closeSidebar' }, '*');
        } else {
            window.close();
        }
    }

    async checkMicrophonePermission() {
        try {
            console.log('[DEBUG] Checking microphone permission status...');
            
            // Check if we're in a restricted environment (like Google Meet)
            const isRestrictedEnv = this.detectRestrictedEnvironment();
            if (isRestrictedEnv) {
                console.log('[DEBUG] Detected restricted environment, using alternative approach');
                return await this.handleRestrictedEnvironment();
            }
            
            // First try to get permission status
            const permission = await navigator.permissions.query({ name: 'microphone' });
            console.log('[DEBUG] Permission state:', permission.state);
            
            if (permission.state === 'granted') {
                console.log('[DEBUG] Microphone permission already granted');
                return true;
            }
            
            if (permission.state === 'prompt' || permission.state === 'denied') {
                console.log('[DEBUG] Requesting microphone access...');
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        audio: {
                            sampleRate: 16000,
                            channelCount: 1,
                            echoCancellation: true,
                            noiseSuppression: true
                        }
                    });
                    console.log('[DEBUG] Microphone access granted');
                    stream.getTracks().forEach(track => track.stop());
                    return true;
                } catch (err) {
                    console.error('[DEBUG] Microphone access denied:', err);
                    this.showNotification('Microphone access denied. Please allow microphone access in browser settings.', 'error');
                    return false;
                }
            }
            
            return false;
        } catch (error) {
            console.error('[DEBUG] Microphone permission error:', error);
            // Fallback: try direct access
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                return true;
            } catch (err) {
                console.error('[DEBUG] Fallback microphone access failed:', err);
                this.showNotification('Unable to access microphone. Please check browser permissions.', 'error');
                return false;
            }
        }
    }

    detectRestrictedEnvironment() {
        try {
            // Check if we're in Google Meet or similar restricted environment
            const hostname = window.top?.location.hostname || window.location.hostname;
            const isGoogleMeet = hostname.includes('meet.google.com');
            const isInIframe = window !== window.top;
            
            console.log('[DEBUG] Environment check:', {
                hostname,
                isGoogleMeet,
                isInIframe,
                userAgent: navigator.userAgent
            });
            
            return isGoogleMeet && isInIframe;
        } catch (error) {
            console.warn('[DEBUG] Could not detect environment:', error);
            return true; // Assume restricted if we can't check
        }
    }

    async handleRestrictedEnvironment() {
        console.log('[DEBUG] Handling restricted environment...');
        
        // Show user guidance for Google Meet
        this.showNotification(
            'Google Meet detected. For recording to work, please:\n' +
            '1. Open extension in new tab, OR\n' +
            '2. Use the recording debug tool', 
            'warning'
        );
        
        // Try to open the extension in a new tab
        const shouldOpenNewTab = await this.promptUserForNewTab();
        if (shouldOpenNewTab) {
            this.openExtensionInNewTab();
            return false;
        }
        
        // Try screen capture as alternative
        return await this.tryScreenAudioCapture();
    }

    async promptUserForNewTab() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.7); z-index: 10000;
                    display: flex; align-items: center; justify-content: center;
                ">
                    <div style="
                        background: white; padding: 2rem; border-radius: 12px;
                        max-width: 400px; text-align: center;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    ">
                        <h3 style="margin: 0 0 1rem 0; color: #333;">Recording Restricted</h3>
                        <p style="margin: 0 0 1.5rem 0; color: #666; line-height: 1.5;">
                            Google Meet blocks microphone access for extensions. 
                            Would you like to open the recorder in a new tab where it will work properly?
                        </p>
                        <div style="display: flex; gap: 1rem; justify-content: center;">
                            <button id="openNewTabBtn" style="
                                background: #4f46e5; color: white; border: none;
                                padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;
                            ">Open New Tab</button>
                            <button id="stayHereBtn" style="
                                background: #6b7280; color: white; border: none;
                                padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;
                            ">Stay Here</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('#openNewTabBtn').onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };
            
            modal.querySelector('#stayHereBtn').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
        });
    }

    openExtensionInNewTab() {
        const standaloneUrl = chrome.runtime.getURL('standalone.html');
        window.open(standaloneUrl, '_blank', 'width=900,height=900,scrollbars=yes,resizable=yes');
        this.showNotification('Extension opened in new tab where recording will work!', 'success');
    }

    async tryScreenAudioCapture() {
        try {
            console.log('[DEBUG] Attempting screen audio capture...');
            
            if (!navigator.mediaDevices.getDisplayMedia) {
                console.warn('[DEBUG] Screen capture not supported');
                return false;
            }
            
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: false,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            if (stream.getAudioTracks().length > 0) {
                console.log('[DEBUG] Screen audio capture successful');
                stream.getTracks().forEach(track => track.stop()); // Just testing
                this.showNotification('Screen audio capture available as fallback', 'info');
                return true;
            }
            
            return false;
        } catch (error) {
            console.warn('[DEBUG] Screen audio capture failed:', error);
            return false;
        }
    }

    updateConnectionStatus(status, type) {
        const statusEl = document.getElementById('connectionStatus');
        statusEl.textContent = status;
        statusEl.className = `status-dot ${type}`;
        
        // Update the status badge appearance based on the status type
        const statusBadge = document.querySelector('.status-badge');
        statusBadge.className = 'status-badge'; // Reset classes
        
        if (type === 'processing') {
            statusBadge.classList.add('processing');
        } else if (type === 'recording') {
            statusBadge.classList.add('recording-active');
        } else if (type === 'connected') {
            statusBadge.classList.add('connected');
        } else if (type === 'error') {
            statusBadge.classList.add('error');
        }
    }

    saveUserPreferences() {
        localStorage.setItem('aiMeetingMinutes_userName', document.getElementById('userName').value);
        localStorage.setItem('aiMeetingMinutes_meetingId', document.getElementById('meetingId').value);
    }

    loadUserPreferences() {
        const savedUserName = localStorage.getItem('aiMeetingMinutes_userName');
        const savedMeetingId = localStorage.getItem('aiMeetingMinutes_meetingId');
        if (savedUserName) document.getElementById('userName').value = savedUserName;
        if (savedMeetingId) document.getElementById('meetingId').value = savedMeetingId;
        else {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('meetingId').value = `meeting_${today}`;
        }
    }

    // ===============================
    // OFFLINE MODE FUNCTIONS
    // ===============================

    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('uploadZone').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('uploadZone').classList.remove('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        document.getElementById('uploadZone').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
          this.processFile(files[0]);
        }
    }

    async processFile(file) {
        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
          this.showNotification('Please select an audio or video file', 'error');
          return;
        }

        document.getElementById('uploadZone').style.display = 'none';
        document.getElementById('fileProcessing').style.display = 'block';

        const formData = new FormData();
        formData.append('audio_file', file);
        formData.append('meeting_id', `offline_${Date.now()}`);

        try {
            const response = await fetch(`${backendUrl}/api/process-audio`, {
                method: 'POST',
                body: formData,
                // Add progress tracking if needed
            });

            if (!response.ok) {
                throw new Error('Failed to process audio file');
            }

            const result = await response.json();
            this.showFileResults(result);

        } catch (error) {
            console.error('File processing failed:', error);
            this.showNotification('Failed to process audio file', 'error');
            document.getElementById('uploadZone').style.display = 'block';
            document.getElementById('fileProcessing').style.display = 'none';
        }
    }

    showFileResults(result) {
        document.getElementById('fileProcessing').style.display = 'none';
        
        document.getElementById('liveTranscription').innerHTML = `<div class="live-content">${this.formatTranscriptionText(result.transcription)}</div>`;
        document.getElementById('speakerAlerts').innerHTML = `<div class="live-content">${this.displaySpeakerDetails(result.speaker_info)}</div>`;
        document.getElementById('progressiveSummary').innerHTML = `<div class="live-content"><p>${result.summary}</p></div>`;
        document.getElementById('actionItems').innerHTML = `<div class="live-content">${this.displayActionItems(result.action_items)}</div>`;

        this.showNotification('File processed successfully!', 'success');
        
        setTimeout(() => {
          document.getElementById('uploadZone').style.display = 'block';
          document.getElementById('audioFileInput').value = '';
        }, 3000);
    }

    formatTranscriptionText(transcription) {
        const speakers = {};
        let speakerCount = 0;
        const colors = ['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        
        return transcription.split('\n').map(line => {
            const match = line.match(/^(Speaker \d+): (.+)$/);
            if (match) {
                const speaker = match[1];
                const text = match[2];
                
                if (!speakers[speaker]) {
                    speakers[speaker] = colors[speakerCount % colors.length];
                    speakerCount++;
                }
                
                return `
                    <div class="speaker-line">
                        <span class="speaker-label" style="color: ${speakers[speaker]}">${speaker}:</span>
                        <span class="speaker-text">${text}</span>
                    </div>
                `;
            }
            return `<div class="speaker-line">${line}</div>`;
        }).join('');
    }

    displaySpeakerDetails(speakerInfo) {
        if (!speakerInfo) return '';
        return Object.entries(speakerInfo).map(([speaker, info]) => `
            <div class="speaker-item">
                <div class="speaker-avatar">${speaker.charAt(speaker.length - 1)}</div>
                <div class="speaker-info">
                    <div class="speaker-name">${speaker}</div>
                    <div class="speaker-stats">
                        ${info.word_count || 0} words • ${info.duration || '0:00'} speaking time
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayActionItems(actionItems) {
        if (!actionItems) return '';
        return actionItems.map(item => `
            <div class="action-item">
                <div class="action-checkbox"></div>
                <div class="action-content">
                    <div class="action-text">${item.text || item}</div>
                    ${item.assignee ? `<div class="action-meta">Assigned to: ${item.assignee}</div>` : ''}
                    ${item.deadline ? `<div class="action-meta">Due: ${item.deadline}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    updateUI() {
        const connectBtn = document.getElementById('connectBtn');
        const recordBtn = document.getElementById('recordBtn');
        
        connectBtn.textContent = this.isConnected ? '🔌 Disconnect' : '🔗 Connect to Meeting';
        connectBtn.className = this.isConnected ? 'btn btn-record' : 'btn btn-primary';
        
        recordBtn.disabled = !this.isConnected;
        
        // Enhanced button text with animation
        if (this.isRecording) {
            recordBtn.innerHTML = '<span class="recording-icon">⏹️</span> Stop Recording';
            recordBtn.setAttribute('title', 'Stop recording and generate summary');
        } else {
            recordBtn.innerHTML = '<span class="mic-icon">🎙️</span> Start Recording';
            recordBtn.setAttribute('title', 'Start recording the meeting');
        }
        
        recordBtn.classList.toggle('recording', this.isRecording);
        
        // Show audio visualizer when recording
        const audioVisualizer = document.getElementById('audioVisualizer');
        audioVisualizer.style.display = this.isRecording ? 'block' : 'none';
        
        // Add recording status indicator to header
        const statusBadge = document.querySelector('.status-badge');
        if (this.isRecording) {
            statusBadge.classList.add('recording-active');
        } else {
            statusBadge.classList.remove('recording-active');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
          <div style="
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            backdrop-filter: blur(20px);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
          ">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span>${this.getNotificationIcon(type)}</span>
              <span>${message}</span>
            </div>
          </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.animation = 'slideOutRight 0.3s ease-in';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }, 3000);
    }

    getNotificationColor(type) {
        const colors = {
          success: 'linear-gradient(135deg, #10b981, #34d399)',
          error: 'linear-gradient(135deg, #ef4444, #f87171)',
          warning: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          info: 'linear-gradient(135deg, #6366f1, #818cf8)'
        };
        return colors[type] || colors.info;
    }

    getNotificationIcon(type) {
        const icons = {
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're in an iframe (extension sidebar) to apply blur effects to parent
  if (window !== window.top) {
    document.documentElement.classList.add('in-iframe');
    // Send message to parent to add blur effect
    window.parent.postMessage({ action: 'applyBackgroundBlur' }, '*');
  }
  
  new MeetingMinutesApp();
});

// This space is intentionally left blank. The duplicate code has been removed.
