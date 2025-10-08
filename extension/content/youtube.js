// YouTube specific content script
console.log('📺 YouTube integration loaded');

class YouTubeIntegration {
    constructor() {
        this.platform = 'youtube';
        this.isWatching = false;
        this.videoTitle = '';
        this.videoId = '';
        
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
        console.log('🚀 Setting up YouTube integration');
        
        // Monitor video state
        this.monitorVideoState();
        
        // Add platform-specific styles
        this.addYouTubeStyles();
        
        // Setup YouTube-specific event listeners
        this.setupYouTubeEventListeners();
    }
    
    monitorVideoState() {
        const checkVideoState = () => {
            // Check if we're on a video page
            const isVideoPage = window.location.pathname === '/watch';
            const videoElement = document.querySelector('video.video-stream, video.html5-main-video');
            const videoTitle = document.querySelector('#container h1.title, h1.ytd-video-primary-info-renderer');
            
            const currentlyWatching = isVideoPage && !!videoElement;
            
            if (currentlyWatching !== this.isWatching) {
                this.isWatching = currentlyWatching;
                this.onVideoStateChange(currentlyWatching);
            }
            
            // Update video info
            if (currentlyWatching) {
                const newTitle = videoTitle ? videoTitle.textContent.trim() : '';
                const urlParams = new URLSearchParams(window.location.search);
                const newVideoId = urlParams.get('v') || '';
                
                if (newTitle !== this.videoTitle || newVideoId !== this.videoId) {
                    this.videoTitle = newTitle;
                    this.videoId = newVideoId;
                    console.log('📺 YouTube video updated:', newTitle);
                }
            }
        };
        
        // Check immediately
        checkVideoState();
        
        // Check on navigation (YouTube is SPA)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function() {
            originalPushState.apply(history, arguments);
            setTimeout(checkVideoState, 1000);
        };
        
        history.replaceState = function() {
            originalReplaceState.apply(history, arguments);
            setTimeout(checkVideoState, 1000);
        };
        
        window.addEventListener('popstate', () => {
            setTimeout(checkVideoState, 1000);
        });
        
        // Check periodically
        setInterval(checkVideoState, 5000);
        
        // Also observe DOM changes
        const observer = new MutationObserver(UnifiedUtils.debounce(checkVideoState, 1000));
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    onVideoStateChange(isWatching) {
        console.log(`📺 YouTube state changed: ${isWatching ? 'Watching video' : 'Not watching'}`);
        
        if (isWatching) {
            // Position overlay for YouTube
            this.positionOverlayForYouTube();
            
            // Show start dialog if needed
            setTimeout(() => {
                this.maybeShowStartDialog();
            }, 3000);
        }
    }
    
    positionOverlayForYouTube() {
        const updateOverlayPosition = () => {
            const overlay = document.getElementById('unified-transcription-overlay');
            if (!overlay) return;
            
            // Position to avoid YouTube player controls and sidebar
            const player = document.querySelector('#player, .html5-video-container');
            
            if (player) {
                const rect = player.getBoundingClientRect();
                
                // Position relative to video player
                overlay.style.right = '20px';
                overlay.style.top = Math.max(rect.top + 80, 20) + 'px';
                overlay.style.zIndex = '2000';
            } else {
                // Fallback positioning
                overlay.style.right = '20px';
                overlay.style.top = '20px';
                overlay.style.zIndex = '2000';
            }
        };
        
        updateOverlayPosition();
        window.addEventListener('resize', UnifiedUtils.debounce(updateOverlayPosition, 250));
    }
    
    maybeShowStartDialog() {
        // Only show if not already shown and not currently recording
        if (document.getElementById('unified-start-dialog')) return;
        if (window.unifiedScreenCapture && window.unifiedScreenCapture.isActive) return;
        
        // For YouTube, be less aggressive about auto-showing dialog
        const hasBeenPrompted = localStorage.getItem('unified-youtube-prompted');
        if (hasBeenPrompted && Date.now() - parseInt(hasBeenPrompted) < 24 * 60 * 60 * 1000) {
            return; // Don't show more than once per day for YouTube
        }
        
        // Show the dialog
        if (window.unifiedScreenCapture) {
            window.unifiedScreenCapture.showAutoStartDialog();
            localStorage.setItem('unified-youtube-prompted', Date.now().toString());
        }
    }
    
    addYouTubeStyles() {
        const styles = `
            .unified-transcription-overlay.youtube {
                border-left: 4px solid #FF0000;
                background: rgba(0, 0, 0, 0.9);
            }
            
            .unified-start-dialog .dialog-header .dialog-icon {
                color: #FF0000;
            }
            
            /* Position relative to YouTube layout */
            .unified-transcription-overlay {
                max-height: 300px;
                max-width: 300px;
            }
            
            /* Ensure overlay doesn't interfere with player */
            .unified-floating-icon {
                z-index: 1999 !important;
            }
            
            .unified-transcription-overlay {
                z-index: 2000 !important;
            }
            
            /* Responsive adjustments for theater mode */
            @media screen and (min-width: 1327px) {
                .unified-transcription-overlay.youtube {
                    right: 24px;
                    max-width: 280px;
                }
            }
        `;
        
        UnifiedUtils.dom.addStyles(styles);
    }
    
    setupYouTubeEventListeners() {
        // Listen for YouTube-specific events
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+Y to toggle transcription
            if (event.ctrlKey && event.shiftKey && event.key === 'Y') {
                event.preventDefault();
                this.toggleTranscription();
            }
        });
        
        // Listen for video player events
        document.addEventListener('video-data-change', () => {
            console.log('📺 YouTube video data changed');
            this.monitorVideoState();
        });
    }
    
    toggleTranscription() {
        if (window.unifiedScreenCapture) {
            if (window.unifiedScreenCapture.isActive) {
                window.unifiedScreenCapture.stopScreenCapture();
            } else {
                window.unifiedScreenCapture.startScreenCapture({
                    platform: this.platform,
                    meetingTitle: this.videoTitle,
                    videoId: this.videoId,
                    url: window.location.href
                });
            }
        }
    }
    
    getVideoInfo() {
        return {
            platform: this.platform,
            title: this.videoTitle,
            videoId: this.videoId,
            isWatching: this.isWatching,
            url: window.location.href,
            channel: this.getChannelName()
        };
    }
    
    getChannelName() {
        const channelElement = document.querySelector('#channel-name a, .ytd-channel-name a, .yt-simple-endpoint.style-scope.yt-formatted-string');
        return channelElement ? channelElement.textContent.trim() : '';
    }
}

// Initialize YouTube integration
const youtubeIntegration = new YouTubeIntegration();

// Make it available globally
window.youtubeIntegration = youtubeIntegration;