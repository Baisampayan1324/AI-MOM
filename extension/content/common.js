// Common utilities for all content scripts
console.log('🔧 Common utilities loaded');

// Shared utilities that all content scripts can use
window.UnifiedUtils = {
    // Generate unique IDs
    generateId: function(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    },
    
    // Debounce function calls
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Check if element is visible
    isElementVisible: function(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Wait for element to appear
    waitForElement: function(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    },
    
    // Platform detection
    detectPlatform: function() {
        const url = window.location.href;
        if (url.includes('meet.google.com')) return 'google-meet';
        if (url.includes('zoom.us')) return 'zoom';
        if (url.includes('youtube.com')) return 'youtube';
        if (url.includes('teams.microsoft.com')) return 'teams';
        return 'unknown';
    },
    
    // Get meeting title from various platforms
    getMeetingTitle: function(platform) {
        const selectors = {
            'google-meet': [
                '[data-meeting-title]',
                '.google-material-icons + span',
                '[jscontroller="kAPMuc"] h1'
            ],
            'zoom': [
                '.meeting-title',
                '[class*="meeting-title"]',
                '.zm-modal-header-title'
            ],
            'youtube': [
                'h1.title',
                '.watch-title',
                '#container h1'
            ],
            'teams': [
                '[data-tid="meeting-title"]',
                '.ts-calling-screen-header'
            ]
        };
        
        const platformSelectors = selectors[platform] || [];
        
        for (const selector of platformSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        return document.title || 'Meeting Session';
    },
    
    // Get participant list from various platforms
    getParticipants: function(platform) {
        const participants = [];
        
        const selectors = {
            'google-meet': [
                '[data-participant-id]',
                '.participant-name',
                '[jscontroller="NQNWd"] span'
            ],
            'zoom': [
                '.participants-item-name',
                '[class*="participant"]',
                '.zm-video-participant-name'
            ],
            'teams': [
                '[data-tid="participant-name"]',
                '.roster-list-item-name'
            ]
        };
        
        const platformSelectors = selectors[platform] || [];
        
        for (const selector of platformSelectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                const name = el.textContent?.trim();
                if (name && !participants.includes(name) && name.length > 1) {
                    participants.push(name);
                }
            });
        }
        
        // If no participants found, add current user
        if (participants.length === 0) {
            participants.push('Current User');
        }
        
        return participants;
    },
    
    // Check if currently in a meeting
    isInMeeting: function(platform) {
        switch (platform) {
            case 'google-meet':
                const meetingContainer = document.querySelector('[data-meeting-title]') || 
                                       document.querySelector('[jscontroller="kAPMuc"]');
                const videoElements = document.querySelectorAll('video');
                const meetingControls = document.querySelector('[data-is-muted]');
                return !!(meetingContainer && videoElements.length > 0 && meetingControls);
                
            case 'zoom':
                const zoomApp = document.querySelector('#zoom-ui-frame, .zoom-app, [id*="zoom"]');
                const videoContainer = document.querySelector('[class*="video"], [class*="participant"]');
                return !!(zoomApp || videoContainer);
                
            case 'youtube':
                const videoPlayer = document.querySelector('video');
                const playerContainer = document.querySelector('#movie_player, .html5-video-player');
                return !!(videoPlayer && playerContainer);
                
            case 'teams':
                const callingContainer = document.querySelector('[data-tid="calling-screen"]');
                const meetingStage = document.querySelector('.ts-calling-stage');
                return !!(callingContainer || meetingStage);
                
            default:
                return false;
        }
    },
    
    // Storage helpers
    storage: {
        set: async function(key, value) {
            try {
                await chrome.storage.local.set({ [key]: value });
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },
        
        get: async function(key, defaultValue = null) {
            try {
                const result = await chrome.storage.local.get({ [key]: defaultValue });
                return result[key];
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },
        
        remove: async function(key) {
            try {
                await chrome.storage.local.remove(key);
                return true;
            } catch (error) {
                console.error('Storage remove error:', error);
                return false;
            }
        }
    },
    
    // Message helpers
    messaging: {
        sendToBackground: function(message) {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });
        },
        
        sendToTab: function(tabId, message) {
            return new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tabId, message, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });
        }
    },
    
    // Audio utilities
    audio: {
        // Check if audio context is available
        isAudioContextAvailable: function() {
            return !!(window.AudioContext || window.webkitAudioContext);
        },
        
        // Create silent audio for testing
        createSilentAudio: function(duration = 1) {
            if (!this.isAudioContextAvailable()) return null;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const sampleRate = audioContext.sampleRate;
            const numChannels = 1;
            const length = sampleRate * duration;
            
            const buffer = audioContext.createBuffer(numChannels, length, sampleRate);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            
            return { audioContext, source };
        }
    },
    
    // DOM utilities
    dom: {
        // Create element with attributes
        createElement: function(tag, attributes = {}, textContent = '') {
            const element = document.createElement(tag);
            
            for (const [key, value] of Object.entries(attributes)) {
                if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else {
                    element.setAttribute(key, value);
                }
            }
            
            if (textContent) {
                element.textContent = textContent;
            }
            
            return element;
        },
        
        // Remove element safely
        removeElement: function(element) {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        },
        
        // Add CSS styles to head
        addStyles: function(css) {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.textContent = css;
            document.head.appendChild(style);
            return style;
        }
    }
};

// Make utilities available globally
window.addEventListener('load', () => {
    console.log('✅ Common utilities ready');
});