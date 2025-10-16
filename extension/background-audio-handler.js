// Background Service Worker Audio Handler
// This approach moves audio processing to the background service worker

class BackgroundAudioHandler {
    constructor() {
        this.isActive = false;
        this.connections = new Map();
        this.websocketUrl = 'ws://localhost:8000/ws/audio';
        this.activeTabId = null;
    }

    async initialize() {
        // Listen for messages from content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open
        });

        // Listen for tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        console.log('✅ Background audio handler initialized');
    }

    async handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'startAudioCapture':
                await this.startAudioCapture(sender.tab.id, message.options);
                sendResponse({ success: true });
                break;

            case 'stopAudioCapture':
                await this.stopAudioCapture(sender.tab.id);
                sendResponse({ success: true });
                break;

            case 'audioChunk':
                await this.processAudioChunk(message.data, sender.tab.id);
                sendResponse({ success: true });
                break;

            case 'requestTabCapture':
                const stream = await this.setupTabCapture(sender.tab.id, message.options);
                sendResponse({ success: !!stream, stream });
                break;
        }
    }

    async startAudioCapture(tabId, options = {}) {
        try {
            // Setup tab capture in background
            const stream = await this.setupTabCapture(tabId, {
                audio: true,
                video: options.includeVideo || false
            });

            if (stream) {
                this.connections.set(tabId, {
                    stream,
                    websocket: await this.createWebSocketConnection(tabId),
                    mediaRecorder: this.createMediaRecorder(stream, tabId)
                });

                this.activeTabId = tabId;
                console.log(`✅ Audio capture started for tab ${tabId}`);
                return true;
            }
        } catch (error) {
            console.error('❌ Background audio capture failed:', error);
            return false;
        }
    }

    async setupTabCapture(tabId, options) {
        return new Promise((resolve) => {
            chrome.tabCapture.capture(options, (stream) => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Tab capture error:', chrome.runtime.lastError);
                    resolve(null);
                } else {
                    console.log('✅ Tab capture successful');
                    resolve(stream);
                }
            });
        });
    }

    async createWebSocketConnection(tabId) {
        try {
            const websocket = new WebSocket(this.websocketUrl);
            
            websocket.onopen = () => {
                console.log(`✅ WebSocket connected for tab ${tabId}`);
            };

            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.forwardToContentScript(tabId, data);
            };

            websocket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };

            websocket.onclose = () => {
                console.log(`🔌 WebSocket closed for tab ${tabId}`);
            };

            return websocket;
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            return null;
        }
    }

    createMediaRecorder(stream, tabId) {
        try {
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 64000
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.processAudioChunk(event.data, tabId);
                }
            };

            mediaRecorder.start(1000); // 1 second chunks
            return mediaRecorder;
        } catch (error) {
            console.error('❌ MediaRecorder setup failed:', error);
            return null;
        }
    }

    async processAudioChunk(audioBlob, tabId) {
        const connection = this.connections.get(tabId);
        if (!connection || !connection.websocket) return;

        try {
            // Convert blob to array buffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            
            // Create offline audio context for processing
            const offlineContext = new OfflineAudioContext(1, 8000, 16000);
            const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);
            
            // Convert to Int16Array
            const channelData = audioBuffer.getChannelData(0);
            const audioData = new Int16Array(channelData.length);
            
            for (let i = 0; i < channelData.length; i++) {
                audioData[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
            }

            // Send to backend via WebSocket
            if (connection.websocket.readyState === WebSocket.OPEN) {
                connection.websocket.send(JSON.stringify({
                    type: 'audio_chunk',
                    audio_data: Array.from(audioData),
                    sample_rate: 16000,
                    timestamp: Date.now(),
                    tab_id: tabId,
                    source: 'background'
                }));
            }
        } catch (error) {
            console.error('❌ Background audio processing error:', error);
        }
    }

    forwardToContentScript(tabId, data) {
        // Forward WebSocket messages to content script
        chrome.tabs.sendMessage(tabId, {
            action: 'websocketMessage',
            data: data
        }).catch(error => {
            console.log('Content script not available:', error);
        });
    }

    async stopAudioCapture(tabId) {
        const connection = this.connections.get(tabId);
        if (!connection) return;

        try {
            // Stop media recorder
            if (connection.mediaRecorder?.state !== 'inactive') {
                connection.mediaRecorder.stop();
            }

            // Stop stream tracks
            if (connection.stream) {
                connection.stream.getTracks().forEach(track => track.stop());
            }

            // Close WebSocket
            if (connection.websocket) {
                connection.websocket.close();
            }

            this.connections.delete(tabId);
            console.log(`✅ Audio capture stopped for tab ${tabId}`);
        } catch (error) {
            console.error('❌ Error stopping audio capture:', error);
        }
    }

    handleTabUpdate(tabId, changeInfo, tab) {
        // Handle tab changes (navigation, close, etc.)
        if (changeInfo.status === 'loading' && this.connections.has(tabId)) {
            // Tab is navigating, stop capture
            this.stopAudioCapture(tabId);
        }
    }

    cleanup() {
        // Stop all active captures
        for (const tabId of this.connections.keys()) {
            this.stopAudioCapture(tabId);
        }
    }
}

// Initialize the background handler
const backgroundAudioHandler = new BackgroundAudioHandler();
backgroundAudioHandler.initialize();