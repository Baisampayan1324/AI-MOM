// Zoho Meeting specific content script
console.log('🟢 Zoho Meeting integration loaded');

class ZohoMeetingIntegration {
    constructor() {
        this.platform = 'zoho-meeting';
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
        console.log('🚀 Setting up Zoho Meeting integration');
        
        // Monitor meeting state
        this.monitorMeetingState();
        
        // Add platform-specific styles
        this.addZohoStyles();
        
        // Setup Zoho-specific event listeners
        this.setupZohoEventListeners();
    }
    
    monitorMeetingState() {
        const checkMeetingState = () => {
            // Check for Zoho Meeting indicators
            const zohoApp = document.querySelector('.zmeet-app, [class*="zoho-meeting"], [id*="zoho"]');
            const videoContainer = document.querySelector('[class*="video"], [class*="stream"], [class*="participant"]');
            const meetingControls = document.querySelector('[class*="meeting-control"], [class*="toolbar"], [aria-label*="mute"]');
            const meetingRoom = document.querySelector('[class*="meeting-room"], [class*="conference"]');
            
            // Zoho Meeting detection
            const inMeeting = !!(
                (zohoApp && (videoContainer || meetingControls)) ||
                meetingRoom ||
                document.querySelector('[class*="zmeet"], [aria-label*="meeting"]')
            );
            
            if (inMeeting !== this.isInMeeting) {
                this.isInMeeting = inMeeting;
                this.onMeetingStateChange(inMeeting);
            }
            
            // Update meeting info
            const newTitle = this.getMeetingTitle();
            const newMeetingId = this.getMeetingId();
            const newParticipantCount = this.getParticipantCount();
            
            if (newTitle !== this.meetingTitle) {
                this.meetingTitle = newTitle;
                console.log('📝 Zoho meeting title updated:', newTitle);
            }
            
            if (newMeetingId !== this.meetingId) {
                this.meetingId = newMeetingId;
                console.log('🆔 Zoho meeting ID updated:', newMeetingId);
            }
            
            if (newParticipantCount !== this.participantCount) {
                this.participantCount = newParticipantCount;
                console.log('👥 Zoho participant count updated:', newParticipantCount);
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
        console.log(`🟢 Zoho Meeting state changed: ${isInMeeting ? 'In meeting' : 'Not in meeting'}`);
        
        if (isInMeeting) {
            // Position overlay for Zoho Meeting
            this.positionOverlayForZoho();
            
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
    
    positionOverlayForZoho() {
        const updateOverlayPosition = () => {
            const overlay = document.getElementById('unified-transcription-overlay');
            if (!overlay) return;
            
            // Position to avoid Zoho Meeting UI elements
            const zohoSidebar = document.querySelector('[class*="sidebar"], [class*="panel"]');
            const zohoControls = document.querySelector('[class*="toolbar"], [class*="controls"]');
            
            let rightOffset = '20px';
            let topOffset = '20px';
            
            // Avoid sidebar if present
            if (zohoSidebar) {
                const sidebarRect = zohoSidebar.getBoundingClientRect();
                if (sidebarRect.width > 0 && sidebarRect.right > window.innerWidth * 0.7) {
                    rightOffset = (window.innerWidth - sidebarRect.left + 20) + 'px';
                }
            }
            
            // Avoid top controls
            if (zohoControls) {
                const controlsRect = zohoControls.getBoundingClientRect();
                if (controlsRect.height > 0 && controlsRect.top < 100) {
                    topOffset = (controlsRect.bottom + 20) + 'px';
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
    
    addZohoStyles() {
        const styles = `
            .unified-transcription-overlay.zoho-meeting {
                border-left: 4px solid #1C4A8C;
                background: rgba(0, 0, 0, 0.9);
            }
            
            .unified-start-dialog .dialog-header .dialog-icon {
                color: #1C4A8C;
            }
            
            /* Ensure overlay appears above Zoho UI */
            .unified-transcription-overlay {
                z-index: 2147483647 !important;
            }
            
            .unified-floating-icon {
                z-index: 2147483646 !important;
            }
            
            /* Zoho Meeting responsive adjustments */
            @media screen and (max-width: 1024px) {
                .unified-transcription-overlay.zoho-meeting {
                    max-width: 280px;
                    right: 10px !important;
                    top: 10px !important;
                }
            }
        `;
        
        UnifiedUtils.dom.addStyles(styles);
    }
    
    setupZohoEventListeners() {
        // Listen for Zoho-specific events
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+Z to toggle transcription
            if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
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
        // Try multiple selectors for Zoho meeting title
        const titleSelectors = [
            '[class*="meeting-title"]',
            '[class*="conference-title"]',
            '.zmeet-title',
            '[aria-label*="meeting"] h1',
            '[aria-label*="meeting"] h2',
            '.meeting-name',
            '.conference-name'
        ];
        
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        // Fallback to URL parsing
        const urlMatch = window.location.pathname.match(/\/meeting\/([^\/]+)/);
        if (urlMatch) {
            return `Zoho Meeting ${urlMatch[1]}`;
        }
        
        return 'Zoho Meeting';
    }
    
    getMeetingId() {
        // Extract meeting ID from URL or page elements
        const urlMatch = window.location.pathname.match(/\/meeting\/([^\/]+)/) || 
                         window.location.search.match(/meetingId=([^&]+)/);
        
        if (urlMatch) {
            return urlMatch[1];
        }
        
        // Try to find in DOM
        const idElement = document.querySelector('[data-meeting-id], [class*="meeting-id"]');
        if (idElement) {
            return idElement.textContent.trim() || idElement.getAttribute('data-meeting-id');
        }
        
        return '';
    }
    
    getParticipantCount() {
        // Try to get participant count from Zoho UI
        const participantSelectors = [
            '[class*="participant-count"]',
            '[class*="attendee-count"]',
            '[aria-label*="participant"]'
        ];
        
        for (const selector of participantSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent || element.getAttribute('aria-label') || '';
                const match = text.match(/(\d+)/);
                if (match) {
                    return parseInt(match[1], 10);
                }
            }
        }
        
        // Fallback: count video streams or participant elements
        const participantElements = document.querySelectorAll(
            '[class*="participant"], [class*="video-stream"], [class*="attendee"]'
        );
        
        return Math.max(1, participantElements.length);
    }
    
    getParticipants() {
        const participants = [];
        
        // Try to extract participant names from various Zoho elements
        const participantSelectors = [
            '[class*="participant-name"]',
            '[class*="attendee-name"]',
            '[class*="user-name"]',
            '[class*="display-name"]'
        ];
        
        participantSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const name = element.textContent.trim();
                if (name && !participants.includes(name)) {
                    participants.push(name);
                }
            });
        });
        
        // If no names found, create generic participant list
        if (participants.length === 0) {
            for (let i = 1; i <= this.participantCount; i++) {
                participants.push(`Participant ${i}`);
            }
        }
        
        return participants;
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

// Initialize Zoho Meeting integration
const zohoMeetingIntegration = new ZohoMeetingIntegration();

// Make it available globally
window.zohoMeetingIntegration = zohoMeetingIntegration;