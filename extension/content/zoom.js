// Zoom specific content script
console.log('💼 Zoom integration loaded');

class ZoomIntegration {
    constructor() {
        this.platform = 'zoom';
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
        console.log('🚀 Setting up Zoom integration');
        
        // Monitor meeting state
        this.monitorMeetingState();
        
        // Add platform-specific styles
        this.addZoomStyles();
        
        // Setup Zoom-specific event listeners
        this.setupZoomEventListeners();
    }
    
    monitorMeetingState() {
        const checkMeetingState = () => {
            // Check for Zoom meeting indicators
            const zoomApp = document.querySelector('#zoom-ui-frame, .zoom-app, [id*="zoom"]');
            const videoContainer = document.querySelector('[class*="video"], [class*="participant"]');
            const meetingControls = document.querySelector('[class*="meeting-control"], [aria-label*="mute"], [aria-label*="video"]');
            
            const inMeeting = !!(zoomApp || (videoContainer && meetingControls));
            
            if (inMeeting !== this.isInMeeting) {
                this.isInMeeting = inMeeting;
                this.onMeetingStateChange(inMeeting);
            }
            
            // Update meeting title
            const newTitle = UnifiedUtils.getMeetingTitle(this.platform);
            if (newTitle !== this.meetingTitle) {
                this.meetingTitle = newTitle;
                console.log('📝 Zoom meeting title updated:', newTitle);
            }
        };
        
        // Check immediately
        checkMeetingState();
        
        // Check periodically
        setInterval(checkMeetingState, 3000);
        
        // Also observe DOM changes
        const observer = new MutationObserver(UnifiedUtils.debounce(checkMeetingState, 1000));
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    onMeetingStateChange(isInMeeting) {
        console.log(`📱 Zoom state changed: ${isInMeeting ? 'In meeting' : 'Not in meeting'}`);
        
        if (isInMeeting) {
            // Position overlay for Zoom
            this.positionOverlayForZoom();
            
            // Auto-show start dialog
            setTimeout(() => {
                this.maybeShowAutoStartDialog();
            }, 3000);
        } else {
            // Stop transcription if active
            if (window.unifiedScreenCapture && window.unifiedScreenCapture.isActive) {
                window.unifiedScreenCapture.stopScreenCapture();
            }
        }
    }
    
    positionOverlayForZoom() {
        const updateOverlayPosition = () => {
            const overlay = document.getElementById('unified-transcription-overlay');
            if (!overlay) return;
            
            // Position to avoid Zoom UI
            overlay.style.right = '20px';
            overlay.style.top = '20px';
            overlay.style.zIndex = '2147483647';
        };
        
        updateOverlayPosition();
        window.addEventListener('resize', UnifiedUtils.debounce(updateOverlayPosition, 250));
    }
    
    maybeShowAutoStartDialog() {
        // Only show if not already shown and not currently recording
        if (document.getElementById('unified-start-dialog')) return;
        if (window.unifiedScreenCapture && window.unifiedScreenCapture.isActive) return;
        
        // Show the dialog
        if (window.unifiedScreenCapture) {
            window.unifiedScreenCapture.showAutoStartDialog();
        }
    }
    
    addZoomStyles() {
        const styles = `
            .unified-transcription-overlay.zoom {
                border-left: 4px solid #2D8CFF;
            }
            
            .unified-start-dialog .dialog-header .dialog-icon {
                color: #2D8CFF;
            }
            
            /* Ensure overlay appears above Zoom UI */
            .unified-transcription-overlay {
                z-index: 2147483647 !important;
            }
            
            .unified-floating-icon {
                z-index: 2147483646 !important;
            }
        `;
        
        UnifiedUtils.dom.addStyles(styles);
    }
    
    setupZoomEventListeners() {
        // Listen for Zoom-specific events
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+T to toggle transcription
            if (event.ctrlKey && event.shiftKey && event.key === 'T') {
                event.preventDefault();
                this.toggleTranscription();
            }
        });
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
    
    getMeetingInfo() {
        return {
            platform: this.platform,
            title: this.meetingTitle,
            participants: UnifiedUtils.getParticipants(this.platform),
            participantCount: this.participantCount,
            isInMeeting: this.isInMeeting,
            url: window.location.href
        };
    }
}

// Initialize Zoom integration
const zoomIntegration = new ZoomIntegration();

// Make it available globally
window.zoomIntegration = zoomIntegration;