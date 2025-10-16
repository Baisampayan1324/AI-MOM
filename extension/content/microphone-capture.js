// Direct Microphone Capture - Most reliable for audio
class MicrophoneCapture {
    constructor() {
        this.audioStream = null;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.analyser = null;
        this.isActive = false;
        this.websocket = null;
    }

    async startMicrophoneCapture() {
        try {
            // Request microphone access
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000,
                    channelCount: 1
                }
            });

            this.setupAudioAnalysis();
            this.setupRecording();
            
            console.log('✅ Microphone capture started');
        } catch (error) {
            console.error('❌ Microphone access denied:', error);
            throw new Error('Microphone access required for transcription');
        }
    }

    setupAudioAnalysis() {
        this.audioContext = new AudioContext({ sampleRate: 16000 });
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        source.connect(this.analyser);

        // Monitor audio levels
        this.monitorAudioLevels();
    }

    monitorAudioLevels() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        const checkLevels = () => {
            if (!this.isActive) return;
            
            this.analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            
            // Only process when there's actual audio
            if (average > 10) { // Threshold for silence detection
                this.updateVolumeIndicator(average);
            }
            
            requestAnimationFrame(checkLevels);
        };
        
        checkLevels();
    }

    setupRecording() {
        this.mediaRecorder = new MediaRecorder(this.audioStream, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 48000
        });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && this.isActive) {
                this.processAudioChunk(event.data);
            }
        };

        this.mediaRecorder.start(1000); // 1 second chunks
        this.isActive = true;
    }

    async processAudioChunk(audioBlob) {
        try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Convert to mono if needed
            const channelData = audioBuffer.numberOfChannels > 1 
                ? this.convertToMono(audioBuffer)
                : audioBuffer.getChannelData(0);
            
            const audioData = new Int16Array(channelData.length);
            
            for (let i = 0; i < channelData.length; i++) {
                audioData[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
            }

            // Send to backend
            if (this.websocket?.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'audio_chunk',
                    audio_data: Array.from(audioData),
                    sample_rate: audioBuffer.sampleRate,
                    timestamp: Date.now(),
                    source: 'microphone'
                }));
            }
        } catch (error) {
            console.error('❌ Microphone audio processing error:', error);
        }
    }

    convertToMono(audioBuffer) {
        const channels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length;
        const monoData = new Float32Array(length);
        
        for (let i = 0; i < length; i++) {
            let sum = 0;
            for (let channel = 0; channel < channels; channel++) {
                sum += audioBuffer.getChannelData(channel)[i];
            }
            monoData[i] = sum / channels;
        }
        
        return monoData;
    }

    updateVolumeIndicator(level) {
        // Update UI volume indicator
        const indicator = document.getElementById('volume-indicator');
        if (indicator) {
            indicator.style.height = `${Math.min(level / 2, 100)}%`;
        }
    }

    stop() {
        this.isActive = false;
        
        if (this.mediaRecorder?.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.audioContext?.state !== 'closed') {
            this.audioContext.close();
        }
    }
}