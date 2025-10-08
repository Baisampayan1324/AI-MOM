// Microsoft Teams specific content script
console.log('🔷 Microsoft Teams integration loaded');

class MicrosoftTeamsIntegration {
    constructor() {
        this.platform = 'microsoft-teams';
        this.isInMeeting = false;
        this.participantCount = 0;
        this.meetingTitle = '';
        this.meetingId = '';
        
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
        console.log('🚀 Setting up Microsoft Teams integration');
        
        // Monitor meeting state
        this.monitorMeetingState();
        
        // Add platform-specific styles
        this.addTeamsStyles();
        
        // Setup Teams-specific event listeners
        this.setupTeamsEventListeners();
    }
    
    monitorMeetingState() {
        const checkMeetingState = () => {
            // Check for Teams meeting indicators
            const teamsApp = document.querySelector('[data-tid="app-bar"], .ts-calling-screen, [class*="calling-stage"]');
            const videoContainer = document.querySelector('[class*="video"], [data-tid*="video"], [class*="participant"]');
            const meetingControls = document.querySelector('[data-tid*="microphone"], [data-tid*="camera"], [class*="calling-controls"]');
            const callingIndicator = document.querySelector('[class*="calling"], [data-tid*="calling"]');
            
            // Teams meeting detection
            const inMeeting = !!(
                (teamsApp && (videoContainer || meetingControls)) ||
                callingIndicator ||
                document.querySelector('[aria-label*="meeting"], [aria-label*="call"]')
            );
            
            if (inMeeting !== this.isInMeeting) {
                this.isInMeeting = inMeeting;
                this.onMeetingStateChange(inMeeting);
            }
            
            // Update meeting title and participant count
            const newTitle = this.getMeetingTitle();
            const newParticipantCount = this.getParticipantCount();
            
            if (newTitle !== this.meetingTitle) {
                this.meetingTitle = newTitle;
                console.log('📝 Teams meeting title updated:', newTitle);
            }
            
            if (newParticipantCount !== this.participantCount) {
                this.participantCount = newParticipantCount;
                console.log('👥 Teams participant count updated:', newParticipantCount);
            }
        };
        
        // Check immediately
        checkMeetingState();
        
        // Check periodically (Teams is SPA)
        setInterval(checkMeetingState, 3000);
        
        // Also observe DOM changes
        const observer = new MutationObserver(UnifiedUtils.debounce(checkMeetingState, 1000));
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    onMeetingStateChange(isInMeeting) {
        console.log(`🔷 Teams state changed: ${isInMeeting ? 'In meeting/call' : 'Not in meeting'}`);
        
        if (isInMeeting) {
            // Position overlay for Teams
            this.positionOverlayForTeams();
            
            // Auto-show start dialog
            setTimeout(() => {
                this.maybeShowAutoStartDialog();
            }, 4000); // Teams takes longer to load
        } else {
            // Stop transcription if active
            if (window.unifiedScreenCapture && window.unifiedScreenCapture.isActive) {
                window.unifiedScreenCapture.stopScreenCapture();
            }
        }
    }
    
    positionOverlayForTeams() {
        const updateOverlayPosition = () => {
            const overlay = document.getElementById('unified-transcription-overlay');
            if (!overlay) return;
            
            // Teams specific positioning to avoid UI conflicts
            const teamsRightPanel = document.querySelector('[class*="right-rail"], [class*="sidebar"]');
            const teamsControls = document.querySelector('[class*="calling-controls"], [data-tid*="controls"]');
            
            let rightOffset = '20px';
            let topOffset = '20px';
            
            // Avoid right panel if present
            if (teamsRightPanel) {
                const panelRect = teamsRightPanel.getBoundingClientRect();
                if (panelRect.width > 0) {
                    rightOffset = (panelRect.width + 40) + 'px';
                }
            }
            
            // Avoid bottom controls
            if (teamsControls) {
                const controlsRect = teamsControls.getBoundingClientRect();
                if (controlsRect.height > 0) {
                    topOffset = '80px'; // Move down to avoid controls
                }
            }
            
            overlay.style.right = rightOffset;
            overlay.style.top = topOffset;
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
    
    addTeamsStyles() {
        const styles = `
            .unified-transcription-overlay.microsoft-teams {
                border-left: 4px solid #6264A7;
                background: rgba(0, 0, 0, 0.92);
            }
            
            .unified-start-dialog .dialog-header .dialog-icon {
                color: #6264A7;
            }
            
            /* Ensure overlay appears above Teams UI */
            .unified-transcription-overlay {
                z-index: 2147483647 !important;
            }
            
            .unified-floating-icon {
                z-index: 2147483646 !important;
            }
            
            /* Teams responsive adjustments */
            @media screen and (max-width: 1200px) {
                .unified-transcription-overlay.microsoft-teams {
                    max-width: 250px;
                    font-size: 13px;
                }
            }
        `;
        
        UnifiedUtils.dom.addStyles(styles);
    }
    
    setupTeamsEventListeners() {
        // Listen for Teams-specific events
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+M to toggle transcription
            if (event.ctrlKey && event.shiftKey && event.key === 'M') {
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
                    meetingId: this.meetingId,
                    participants: this.getParticipants(),
                    participantCount: this.participantCount
                });
            }
        }
    }
    
    getMeetingTitle() {
        // Try multiple selectors for meeting title
        const titleSelectors = [
            '[data-tid="meeting-title"]',
            '[class*="meeting-title"]',
            '.ts-calling-thread-header h2',
            '[aria-label*="meeting"] h1',
            '[aria-label*="meeting"] h2',
            '.calling-title'
        ];
        
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        return 'Microsoft Teams Meeting';
    }
    
    getParticipantCount() {
        // Try to get participant count from various Teams UI elements
        const participantIndicators = [
            '[data-tid*="participant"] [data-tid*="count"]',
            '[class*="participant-count"]',
            '[aria-label*="participant"]'
        ];
        
        for (const selector of participantIndicators) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent || element.getAttribute('aria-label') || '';
                const match = text.match(/(\d+)/);
                if (match) {
                    return parseInt(match[1], 10);
                }
            }
        }
        
        // Fallback: count visible video elements
        const videoElements = document.querySelectorAll('[class*="video"], [data-tid*="video"]');
        return Math.max(1, videoElements.length);
    }
    
    getParticipants() {
        const participants = [];
        
        // Try to extract participant names
        const participantElements = document.querySelectorAll(
            '[data-tid*="participant-name"], [class*="participant-name"], [class*="displayName"]'
        );
        
        participantElements.forEach((element, index) => {
            const name = element.textContent.trim();
            if (name && !participants.includes(name)) {
                participants.push(name);
            }
        });
        
        return participants.length > 0 ? participants : [`Participant ${this.participantCount}`];
    }
    
    getMeetingInfo() {
        return {
            platform: this.platform,
            title: this.meetingTitle,
            meetingId: this.meetingId,
            participants: this.getParticipants(),
            participantCount: this.participantCount,
            isInMeeting: this.isInMeeting,
            url: window.location.href
        };
    }
}

// Initialize Microsoft Teams integration
const microsoftTeamsIntegration = new MicrosoftTeamsIntegration();

// Make it available globally
window.microsoftTeamsIntegration = microsoftTeamsIntegration;