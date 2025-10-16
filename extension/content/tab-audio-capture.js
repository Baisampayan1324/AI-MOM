// Tab Audio Capture - Lighter alternative to screen capture
class TabAudioCapture {
    constructor() {
        this.audioStream = null;
        this.mediaRecorder = null;
        this.isActive = false;
        this.websocket = null;
        this.backendUrl = 'http://localhost:8000';
    }

    async startTabAudioCapture() {
        try {
            // Use chrome.tabCapture API for tab audio only
            chrome.runtime.sendMessage({
                action: 'startTabCapture',
                options: {
                    audio: true,
                    video: false // Audio only
                }
            }, (response) => {
                if (response.success) {
                    this.setupAudioProcessing(response.stream);
                }
            });
        } catch (error) {
            console.error('❌ Tab audio capture failed:', error);
        }
    }

    async setupAudioProcessing(stream) {
        this.audioStream = stream;
        
        // Setup MediaRecorder for audio chunks
        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 64000 // Lower bitrate for efficiency
        });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.processAudioChunk(event.data);
            }
        };

        this.mediaRecorder.start(500); // 500ms chunks for faster response
        this.isActive = true;
    }

    async processAudioChunk(audioBlob) {
        // Same PCM processing as before but optimized
        try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            
            // Use OfflineAudioContext for better performance
            const offlineContext = new OfflineAudioContext(1, 8000, 16000);
            const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);
            
            // Convert to Int16Array
            const channelData = audioBuffer.getChannelData(0);
            const audioData = new Int16Array(channelData.length);
            
            for (let i = 0; i < channelData.length; i++) {
                audioData[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
            }

            // Send to backend
            if (this.websocket?.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'audio_chunk',
                    audio_data: Array.from(audioData),
                    sample_rate: 16000, // Fixed sample rate
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            console.error('❌ Audio processing error:', error);
        }
    }
}