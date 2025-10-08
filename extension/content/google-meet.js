// Google Meet specific content script
console.log('🎯 Google Meet integration loaded');

class GoogleMeetIntegration {
    constructor() {
        this.platform = 'google-meet';
        this.isInMeeting = false;
        this.participantCount = 0;
        this.meetingTitle = '';
        
        this.init();
    }
    
    async init() {
        // Wait for page to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        console.log('🚀 Setting up Google Meet integration');
        
        // Monitor meeting state
        this.monitorMeetingState();
        
        // Monitor participants
        this.monitorParticipants();
        
        // Add platform-specific styles
        this.addGoogleMeetStyles();
        
        // Listen for Meet-specific events
        this.setupMeetEventListeners();
    }
    
    monitorMeetingState() {
        const checkMeetingState = () => {
            const meetingContainer = document.querySelector('[data-meeting-title]') || 
                                   document.querySelector('[jscontroller="kAPMuc"]') ||
                                   document.querySelector('div[data-allocation-index]');
            
            const videoElements = document.querySelectorAll('video');
            const meetingControls = document.querySelector('[data-is-muted]') ||
                                  document.querySelector('div[jscontroller="U1kXOc"]') ||
                                  document.querySelector('[role="button"][aria-label*="microphone"]');
            
            const inMeeting = !!(meetingContainer && videoElements.length > 0 && meetingControls);
            
            if (inMeeting !== this.isInMeeting) {
                this.isInMeeting = inMeeting;
                this.onMeetingStateChange(inMeeting);
            }
            
            // Update meeting title
            const newTitle = UnifiedUtils.getMeetingTitle(this.platform);
            if (newTitle !== this.meetingTitle) {
                this.meetingTitle = newTitle;
                console.log('📝 Meeting title updated:', newTitle);
            }
        };
        
        // Check immediately
        checkMeetingState();
        
        // Check periodically
        setInterval(checkMeetingState, 2000);
        
        // Also observe DOM changes
        const observer = new MutationObserver(UnifiedUtils.debounce(checkMeetingState, 500));
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-is-muted', 'aria-label']
        });
    }
    
    monitorParticipants() {
        const updateParticipants = () => {
            const participants = UnifiedUtils.getParticipants(this.platform);
            if (participants.length !== this.participantCount) {
                this.participantCount = participants.length;
                console.log(`👥 Participants updated: ${this.participantCount} people`);
                
                // Notify screen capture if active
                if (window.unifiedScreenCapture && window.unifiedScreenCapture.isActive) {
                    // Update backend with participant info
                    this.updateBackendParticipants(participants);
                }
            }
        };
        
        // Check periodically
        setInterval(updateParticipants, 5000);
        
        // Observe participant area changes
        const observeParticipants = () => {
            const participantArea = document.querySelector('[jscontroller="NQNWd"]') ||
                                   document.querySelector('.google-material-icons + span')?.parentElement;
            
            if (participantArea) {
                const observer = new MutationObserver(UnifiedUtils.debounce(updateParticipants, 1000));
                observer.observe(participantArea, {
                    childList: true,
                    subtree: true
                });
            }
        };
        
        // Try to observe participants area
        setTimeout(observeParticipants, 3000);
    }
    
    onMeetingStateChange(isInMeeting) {
        console.log(`📱 Google Meet state changed: ${isInMeeting ? 'In meeting' : 'Not in meeting'}`);
        
        if (isInMeeting) {
            // Position overlay for Google Meet
            this.positionOverlayForGoogleMeet();
            
            // Auto-show start dialog if not already shown
            setTimeout(() => {
                this.maybeShowAutoStartDialog();
            }, 5000);
        } else {
            // Stop transcription if active
            if (window.unifiedScreenCapture && window.unifiedScreenCapture.isActive) {
                window.unifiedScreenCapture.stopScreenCapture();
            }
        }
    }
    
    positionOverlayForGoogleMeet() {
        // Position overlay to avoid Google Meet UI elements
        const updateOverlayPosition = () => {
            const overlay = document.getElementById('unified-transcription-overlay');
            if (!overlay) return;
            
            // Check for right panel (chat, participants, etc.)
            const rightPanel = document.querySelector('[data-tab-id="2"]') || // Chat panel
                              document.querySelector('div[jscontroller="d3FMOc"]') || // Activities panel
                              document.querySelector('[role="complementary"]');
            
            if (rightPanel && rightPanel.offsetWidth > 0) {
                // Position next to the right panel
                overlay.style.right = `${rightPanel.offsetWidth + 20}px`;
                overlay.style.top = '20px';
            } else {
                // Default position
                overlay.style.right = '20px';
                overlay.style.top = '80px'; // Below Meet header
            }
        };
        
        // Update position initially and when window resizes
        updateOverlayPosition();
        window.addEventListener('resize', UnifiedUtils.debounce(updateOverlayPosition, 250));
        
        // Also update when Meet UI changes
        const observer = new MutationObserver(UnifiedUtils.debounce(updateOverlayPosition, 500));
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    maybeShowAutoStartDialog() {
        // Only show if not already shown and not currently recording
        if (document.getElementById('unified-start-dialog')) return;
        if (window.unifiedScreenCapture && window.unifiedScreenCapture.isActive) return;
        
        // Check if user has dismissed this session
        const sessionKey = `dismissed_${window.location.pathname}`;
        const dismissed = sessionStorage.getItem(sessionKey);
        if (dismissed) return;
        
        // Show the dialog
        if (window.unifiedScreenCapture) {
            window.unifiedScreenCapture.showAutoStartDialog();
        }
    }
    
    addGoogleMeetStyles() {
        // Add Google Meet specific styles
        const styles = `
            .unified-transcription-overlay.google-meet {
                border-left: 4px solid #4285f4;
            }
            
            .unified-start-dialog .dialog-header .dialog-icon {
                background: linear-gradient(135deg, #4285f4, #34a853);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            /* Avoid Meet UI elements */
            .unified-transcription-overlay {
                z-index: 2147483647 !important;
            }
            
            .unified-floating-icon {
                z-index: 2147483646 !important;
            }
        `;
        
        UnifiedUtils.dom.addStyles(styles);
    }
    
    setupMeetEventListeners() {
        // Listen for Meet-specific keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+T to toggle transcription
            if (event.ctrlKey && event.shiftKey && event.key === 'T') {
                event.preventDefault();
                this.toggleTranscription();
            }
        });
        
        // Listen for Meet UI changes that might affect transcription
        this.observeMeetUIChanges();
    }
    
    observeMeetUIChanges() {
        // Observe for fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                console.log('📺 Google Meet entered fullscreen');
                // Adjust overlay position for fullscreen
                this.adjustOverlayForFullscreen(true);
            } else {
                console.log('📺 Google Meet exited fullscreen');
                this.adjustOverlayForFullscreen(false);
            }
        });
        
        // Observe for picture-in-picture
        document.addEventListener('enterpictureinpicture', () => {
            console.log('📺 Google Meet entered picture-in-picture');
        });
        
        document.addEventListener('leavepictureinpicture', () => {
            console.log('📺 Google Meet left picture-in-picture');
        });
    }
    
    adjustOverlayForFullscreen(isFullscreen) {
        const overlay = document.getElementById('unified-transcription-overlay');
        if (!overlay) return;
        
        if (isFullscreen) {
            overlay.style.position = 'fixed';
            overlay.style.top = '20px';
            overlay.style.right = '20px';
            overlay.style.zIndex = '2147483647';
        } else {
            // Reset to normal positioning
            this.positionOverlayForGoogleMeet();
        }
    }
    
    toggleTranscription() {
        if (window.unifiedScreenCapture) {
            if (window.unifiedScreenCapture.isActive) {
                window.unifiedScreenCapture.stopScreenCapture();
            } else {
                window.unifiedScreenCapture.startScreenCapture({
                    platform: this.platform,
                    meetingTitle: this.meetingTitle,
                    participants: UnifiedUtils.getParticipants(this.platform)
                });
            }
        }
    }
    
    async updateBackendParticipants(participants) {
        try {
            if (!window.unifiedScreenCapture || !window.unifiedScreenCapture.websocket) return;
            
            const message = {
                type: 'participants_update',
                participants: participants,
                count: participants.length,
                timestamp: Date.now()
            };
            
            window.unifiedScreenCapture.websocket.send(JSON.stringify(message));
            console.log('👥 Sent participants update to backend');
            
        } catch (error) {
            console.error('❌ Failed to update backend participants:', error);
        }
    }
    
    // Get Google Meet specific meeting info
    getMeetingInfo() {
        return {
            platform: this.platform,
            title: this.meetingTitle,
            participants: UnifiedUtils.getParticipants(this.platform),
            participantCount: this.participantCount,
            isInMeeting: this.isInMeeting,
            url: window.location.href,
            meetingId: this.extractMeetingId()
        };
    }
    
    extractMeetingId() {
        // Extract meeting ID from Google Meet URL
        const match = window.location.pathname.match(/\/([a-zA-Z0-9-_]+)$/);
        return match ? match[1] : 'unknown';
    }
}

// Initialize Google Meet integration
const googleMeetIntegration = new GoogleMeetIntegration();

// Make it available globally
window.googleMeetIntegration = googleMeetIntegration;