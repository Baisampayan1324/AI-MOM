// Unified Transcription Overlay
class UnifiedTranscriptionOverlay {
    constructor() {
        this.isVisible = false;
        this.isRecording = false;
        this.transcriptionData = [];
        this.overlay = null;
        this.floatingIcon = null;
        this.platform = this.detectPlatform();
        this.websocket = null;
        this.userName = 'John'; // Default, will be loaded from storage
        this.audioContext = null;
        this.analyser = null;
        this.audioLevelInterval = null;
        
        this.init();
    }

    init() {
        this.createFloatingIcon();
        this.setupEventListeners();
        this.connectWebSocket();
    }

    detectPlatform() {
        const hostname = window.location.hostname;
        if (hostname.includes('meet.google.com')) return 'google-meet';
        if (hostname.includes('zoom.us')) return 'zoom';
        if (hostname.includes('youtube.com')) return 'youtube';
        if (hostname.includes('teams.microsoft.com')) return 'microsoft-teams';
        if (hostname.includes('meeting.zoho.com')) return 'zoho-meeting';
        return 'general';
    }

    createFloatingIcon() {
        this.floatingIcon = document.createElement('div');
        this.floatingIcon.className = 'unified-floating-icon';
        this.floatingIcon.innerHTML = '🎤';
        this.floatingIcon.title = 'Click to start transcription';
        
        this.floatingIcon.addEventListener('click', () => {
            this.toggleOverlay();
        });

        document.body.appendChild(this.floatingIcon);
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = `unified-transcription-overlay ${this.platform}`;
        
        this.overlay.innerHTML = `
            <!-- Background Orbs -->
            <div class="overlay-orb orb-1"></div>
            <div class="overlay-orb orb-2"></div>
            
            <!-- Header -->
            <div class="overlay-header">
                <div class="overlay-title">
                    <div class="overlay-icon">🎤</div>
                    <span class="overlay-text">Live Transcription</span>
                    <span class="overlay-status">Recording</span>
                </div>
                <div class="overlay-controls">
                    <button class="overlay-btn" id="minimize-btn" title="Minimize">
                        <span>−</span>
                    </button>
                    <button class="overlay-btn" id="close-btn" title="Close">
                        <span>×</span>
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="overlay-content">
                <div class="transcription-area">
                    <div class="transcription-header">
                        <span>Live Transcription</span>
                        <span class="word-count">0 words</span>
                    </div>
                    <div class="transcription-text" id="transcription-output">
                        <div class="transcription-empty">
                            <div class="empty-icon">🎙️</div>
                            <div class="empty-title">Ready to transcribe</div>
                            <div class="empty-description">
                                Start speaking and your words will appear here in real-time.
                            </div>
                        </div>
                    </div>
                </div>

                <div class="summary-area" style="display: none;">
                    <div class="summary-header">📝 Summary</div>
                    <div class="summary-content" id="summary-output">
                        Summary will appear here after the meeting.
                    </div>
                </div>
            </div>

            <!-- Audio Controls -->
            <div class="audio-controls">
                <div class="audio-levels">
                    <div class="audio-bar" data-level="1"></div>
                    <div class="audio-bar" data-level="2"></div>
                    <div class="audio-bar" data-level="3"></div>
                    <div class="audio-bar" data-level="4"></div>
                    <div class="audio-bar" data-level="5"></div>
                </div>
                <button class="control-btn start" id="start-btn">
                    <span>▶️</span> Start
                </button>
                <button class="control-btn pause" id="pause-btn" disabled>
                    <span>⏸️</span> Pause
                </button>
                <button class="control-btn stop" id="stop-btn" disabled>
                    <span>⏹️</span> Stop
                </button>
                <div class="volume-control">
                    <span>🔊</span>
                    <input type="range" class="volume-slider" min="0" max="100" value="80" id="volume-slider">
                    <span id="volume-value">80%</span>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);
        this.setupOverlayControls();
        this.makeDraggable();
    }

    setupOverlayControls() {
        // Close button
        document.getElementById('close-btn').addEventListener('click', () => {
            this.hideOverlay();
        });

        // Minimize button
        document.getElementById('minimize-btn').addEventListener('click', () => {
            this.minimizeOverlay();
        });

        // Control buttons
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pauseRecording();
        });

        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopRecording();
        });

        // Volume slider
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        
        volumeSlider.addEventListener('input', (e) => {
            volumeValue.textContent = e.target.value + '%';
            this.updateVolume(e.target.value);
        });
    }

    makeDraggable() {
        const header = this.overlay.querySelector('.overlay-header');
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                this.overlay.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'move';
        });
    }

    toggleOverlay() {
        if (this.isVisible) {
            this.hideOverlay();
        } else {
            this.showOverlay();
        }
    }

    showOverlay() {
        if (!this.overlay) {
            this.createOverlay();
        }
        
        this.overlay.style.display = 'block';
        this.isVisible = true;
        this.floatingIcon.style.display = 'none';
    }

    hideOverlay() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        this.isVisible = false;
        this.floatingIcon.style.display = 'flex';
    }

    minimizeOverlay() {
        this.hideOverlay();
        this.showNotification('Transcription minimized', 'Click the floating icon to restore');
    }

    startRecording() {
        this.isRecording = true;
        
        // Update button states
        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
        document.getElementById('stop-btn').disabled = false;
        
        // Update status
        const status = this.overlay.querySelector('.overlay-status');
        status.textContent = 'Recording';
        status.style.background = 'rgba(34, 197, 94, 0.2)';
        
        // Clear empty state
        const output = document.getElementById('transcription-output');
        output.innerHTML = '';
        
        // Start audio level animation
        this.startAudioLevelAnimation();
        
        // Start audio capture and transcription
        this.initializeAudioCapture();
        this.showNotification('Recording started', 'Transcription is now active');
    }

    pauseRecording() {
        this.isRecording = false;
        
        // Update button states
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        
        // Update status
        const status = this.overlay.querySelector('.overlay-status');
        status.textContent = 'Paused';
        status.style.background = 'rgba(251, 191, 36, 0.2)';
        
        this.showNotification('Recording paused', 'Click start to resume');
    }

    stopRecording() {
        this.isRecording = false;
        
        // Reset button states
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('stop-btn').disabled = true;
        
        // Stop audio level animation
        this.stopAudioLevelMonitoring();
        
        // Update status
        const status = this.overlay.querySelector('.overlay-status');
        status.textContent = 'Stopped';
        status.style.background = 'rgba(239, 68, 68, 0.2)';
        
        // Show summary
        this.generateSummary();
        this.showNotification('Recording stopped', 'Summary generated successfully');
    }

    addTranscriptionEntry(text, speaker = 'Speaker', timestamp = new Date()) {
        const output = document.getElementById('transcription-output');
        const entry = document.createElement('div');
        entry.className = 'transcription-entry';
        
        entry.innerHTML = `
            <span class="entry-time">${timestamp.toLocaleTimeString()}</span>
            <div class="entry-text">${text}</div>
        `;
        
        output.appendChild(entry);
        output.scrollTop = output.scrollHeight;
        
        // Update word count
        this.updateWordCount();
        
        // Check for speaker alerts
        this.checkSpeakerAlerts(text, speaker);
        
        // Store data
        this.transcriptionData.push({
            text,
            speaker,
            timestamp: timestamp.toISOString()
        });
    }

    updateWordCount() {
        const totalWords = this.transcriptionData.reduce((count, entry) => {
            return count + entry.text.split(' ').length;
        }, 0);
        
        document.querySelector('.word-count').textContent = `${totalWords} words`;
    }

    checkSpeakerAlerts(text, speaker) {
        const lowerText = text.toLowerCase();
        const lowerName = this.userName.toLowerCase();
        
        if (lowerText.includes(lowerName) && speaker !== 'You') {
            this.showAlert('Personal Mention', text, 'personal');
        } else if (lowerText.includes('can someone') || lowerText.includes('does anyone') || lowerText.includes('?')) {
            this.showAlert('Question Asked', text, 'question');
        }
    }

    showAlert(title, message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `speaker-alert ${type}`;
        alert.innerHTML = `
            <div class="alert-icon">${type === 'personal' ? '👤' : '❓'}</div>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-message">${message}</div>
            </div>
            <button class="alert-close">×</button>
        `;
        
        // Add to overlay
        this.overlay.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
        
        // Close button
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.remove();
        });
    }

    startAudioLevelAnimation() {
        this.audioLevelInterval = setInterval(() => {
            const bars = this.overlay.querySelectorAll('.audio-bar');
            bars.forEach((bar, index) => {
                const height = 10 + Math.random() * 60; // Random height between 10-70%
                bar.style.height = `${height}%`;
                if (height > 40) {
                    bar.classList.add('active');
                } else {
                    bar.classList.remove('active');
                }
            });
        }, 200);
    }

    stopAudioLevelMonitoring() {
        if (this.audioLevelInterval) {
            clearInterval(this.audioLevelInterval);
            this.audioLevelInterval = null;
        }
        
        // Reset bars
        const bars = this.overlay.querySelectorAll('.audio-bar');
        bars.forEach(bar => {
            bar.classList.remove('active');
            bar.style.height = '10%';
        });
    }

    generateSummary() {
        const summaryArea = this.overlay.querySelector('.summary-area');
        const summaryOutput = document.getElementById('summary-output');
        
        if (this.transcriptionData.length > 0) {
            const summary = this.createSummary();
            summaryOutput.innerHTML = summary;
            summaryArea.style.display = 'block';
        }
    }

    createSummary() {
        const totalEntries = this.transcriptionData.length;
        const totalWords = this.transcriptionData.reduce((count, entry) => {
            return count + entry.text.split(' ').length;
        }, 0);
        
        const duration = this.transcriptionData.length > 0 ? 
            new Date(this.transcriptionData[this.transcriptionData.length - 1].timestamp) - 
            new Date(this.transcriptionData[0].timestamp) : 0;
        
        return `
            <div class="summary-item">
                <strong>Session Statistics:</strong>
                <ul>
                    <li>Total entries: ${totalEntries}</li>
                    <li>Total words: ${totalWords}</li>
                    <li>Duration: ${Math.round(duration / 60000)} minutes</li>
                    <li>Platform: ${this.platform}</li>
                </ul>
            </div>
            <div class="summary-item">
                <strong>Key Points:</strong>
                <ul>
                    <li>Meeting transcribed successfully</li>
                    <li>All audio captured and processed</li>
                    <li>Ready for export or sharing</li>
                </ul>
            </div>
        `;
    }

    initializeAudioCapture() {
        // This would integrate with the main extension's audio capture
        // For now, simulate with demo data
        if (this.isRecording) {
            setTimeout(() => {
                if (this.isRecording) {
                    this.addTranscriptionEntry("Welcome to the meeting. Let's get started with today's agenda.");
                    
                    setTimeout(() => {
                        if (this.isRecording) {
                            this.addTranscriptionEntry("Thank you for joining us today. We have several important topics to discuss.");
                        }
                    }, 3000);
                }
            }, 1000);
        }
    }

    connectWebSocket() {
        // WebSocket connection for real-time transcription
        try {
            this.websocket = new WebSocket('ws://localhost:8000/ws/audio');
            
            this.websocket.onopen = () => {
                console.log('Transcription WebSocket connected');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'transcription' && this.isRecording) {
                    this.addTranscriptionEntry(data.text, data.speaker_id || 'Speaker 1');
                }
            };
            
            this.websocket.onerror = (error) => {
                console.warn('WebSocket error:', error);
            };
        } catch (error) {
            console.warn('WebSocket connection failed:', error);
        }
    }

    updateVolume(value) {
        // Update audio volume
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'volume',
                value: parseInt(value)
            }));
        }
    }

    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'unified-notification';
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    setupEventListeners() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'showOverlay':
                    this.showOverlay();
                    break;
                case 'hideOverlay':
                    this.hideOverlay();
                    break;
                case 'addTranscription':
                    this.addTranscriptionEntry(request.text, request.speaker);
                    break;
                case 'updateStatus':
                    this.updateRecordingStatus(request.status);
                    break;
            }
        });
    }

    updateRecordingStatus(status) {
        const statusElement = this.overlay?.querySelector('.overlay-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    // Export functionality
    exportTranscription(format = 'txt') {
        const data = this.transcriptionData.map(entry => 
            `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`
        ).join('\n');
        
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcription-${Date.now()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    destroy() {
        if (this.overlay) {
            this.overlay.remove();
        }
        if (this.floatingIcon) {
            this.floatingIcon.remove();
        }
        if (this.websocket) {
            this.websocket.close();
        }
    }
}

// Initialize overlay when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.unifiedOverlay = new UnifiedTranscriptionOverlay();
    });
} else {
    window.unifiedOverlay = new UnifiedTranscriptionOverlay();
}

// Export for use in other scripts
window.UnifiedTranscriptionOverlay = UnifiedTranscriptionOverlay;