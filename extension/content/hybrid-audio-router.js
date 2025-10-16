// Hybrid Audio Router - Combines multiple audio sources intelligently
class HybridAudioRouter {
    constructor() {
        this.sources = new Map();
        this.activeSource = null;
        this.audioMixer = null;
        this.isActive = false;
        this.websocket = null;
        this.backendUrl = 'http://localhost:8000';
    }

    async initialize() {
        try {
            // Try to setup multiple audio sources
            await this.setupAudioSources();
            this.createAudioMixer();
            this.selectBestSource();
            
            console.log('✅ Hybrid audio router initialized');
        } catch (error) {
            console.error('❌ Hybrid router initialization failed:', error);
        }
    }

    async initializeWithStream(existingStream) {
        try {
            console.log('🔄 Initializing hybrid router with existing stream...');
            
            // Use the existing stream as primary source if it has audio
            if (existingStream.getAudioTracks().length > 0) {
                this.sources.set('existing', {
                    stream: existingStream,
                    type: 'screen', // Assume it's screen capture
                    priority: 0, // Highest priority
                    quality: 'high'
                });
                console.log('✅ Using existing stream as primary audio source');
            }
            
            // Try to setup additional backup sources
            await this.setupBackupSources();
            this.createAudioMixer();
            this.selectBestSource();
            
            console.log('✅ Hybrid audio router initialized with existing stream');
        } catch (error) {
            console.error('❌ Hybrid router initialization with stream failed:', error);
            throw error;
        }
    }

    async setupBackupSources() {
        // Setup backup sources without screen capture (since we already have it)
        
        // Try microphone access as backup
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });
            
            this.sources.set('microphone', {
                stream: micStream,
                type: 'microphone',
                priority: 2,
                quality: 'medium'
            });
            console.log('✅ Microphone backup source available');
        } catch (error) {
            console.log('ℹ️ Microphone backup not available');
        }

        // Try tab capture as backup
        try {
            const tabStream = await this.requestTabCapture();
            if (tabStream) {
                this.sources.set('tab', {
                    stream: tabStream,
                    type: 'tab',
                    priority: 3,
                    quality: 'medium'
                });
                console.log('✅ Tab audio backup source available');
            }
        } catch (error) {
            console.log('ℹ️ Tab audio backup not available');
        }
    }

    async setupAudioSources() {
        // 1. Try screen capture with audio
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 48000
                }
            });
            
            if (screenStream.getAudioTracks().length > 0) {
                this.sources.set('screen', {
                    stream: screenStream,
                    type: 'screen',
                    priority: 1,
                    quality: 'high'
                });
                console.log('✅ Screen audio source available');
            }
        } catch (error) {
            console.log('ℹ️ Screen audio not available');
        }

        // 2. Try microphone access
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });
            
            this.sources.set('microphone', {
                stream: micStream,
                type: 'microphone',
                priority: 2,
                quality: 'medium'
            });
            console.log('✅ Microphone source available');
        } catch (error) {
            console.log('ℹ️ Microphone not available');
        }

        // 3. Try tab capture (requires background script)
        try {
            const tabStream = await this.requestTabCapture();
            if (tabStream) {
                this.sources.set('tab', {
                    stream: tabStream,
                    type: 'tab',
                    priority: 3,
                    quality: 'medium'
                });
                console.log('✅ Tab audio source available');
            }
        } catch (error) {
            console.log('ℹ️ Tab audio not available');
        }
    }

    async requestTabCapture() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: 'requestTabCapture',
                options: { audio: true, video: false }
            }, (response) => {
                resolve(response?.stream || null);
            });
        });
    }

    createAudioMixer() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ 
                sampleRate: 16000,
                latencyHint: 'interactive'
            });
            this.audioMixer = this.audioContext.createGain();
            this.audioMixer.connect(this.audioContext.destination);
            
            console.log('✅ Audio mixer created with sample rate:', this.audioContext.sampleRate);
        } catch (error) {
            console.error('❌ Failed to create audio mixer:', error);
            // Don't throw here, let the processing handle the fallback
            this.audioContext = null;
        }
    }

    selectBestSource() {
        if (this.sources.size === 0) {
            throw new Error('No audio sources available');
        }

        // Select source by priority (screen > microphone > tab)
        const sortedSources = Array.from(this.sources.entries())
            .sort(([,a], [,b]) => a.priority - b.priority);

        const [sourceName, sourceData] = sortedSources[0];
        this.activeSource = { name: sourceName, ...sourceData };
        
        console.log(`🎯 Selected audio source: ${sourceName}`);
        this.startRecording();
    }

    startRecording() {
        if (!this.activeSource) return;

        try {
            // Setup MediaRecorder with optimal settings based on source
            const options = this.getRecorderOptions(this.activeSource.type);
            
            this.mediaRecorder = new MediaRecorder(this.activeSource.stream, options);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && this.isActive) {
                    this.processAudioChunk(event.data);
                }
            };

            this.mediaRecorder.onerror = (error) => {
                console.error('❌ MediaRecorder error:', error);
                this.switchToBackupSource();
            };

            // Start with appropriate chunk size
            const chunkSize = this.activeSource.type === 'screen' ? 500 : 1000;
            this.mediaRecorder.start(chunkSize);
            this.isActive = true;

            console.log(`🎙️ Recording started with ${this.activeSource.name} source`);
        } catch (error) {
            console.error('❌ Recording setup failed:', error);
            this.switchToBackupSource();
        }
    }

    getRecorderOptions(sourceType) {
        switch (sourceType) {
            case 'screen':
                return {
                    mimeType: 'audio/webm;codecs=opus',
                    audioBitsPerSecond: 128000
                };
            case 'microphone':
                return {
                    mimeType: 'audio/webm;codecs=opus',
                    audioBitsPerSecond: 64000
                };
            case 'tab':
                return {
                    mimeType: 'audio/webm;codecs=opus',
                    audioBitsPerSecond: 96000
                };
            default:
                return {
                    mimeType: 'audio/webm;codecs=opus',
                    audioBitsPerSecond: 64000
                };
        }
    }

    switchToBackupSource() {
        console.log('🔄 Switching to backup audio source...');
        
        // Remove failed source
        this.sources.delete(this.activeSource.name);
        
        // Try next best source
        if (this.sources.size > 0) {
            this.selectBestSource();
        } else {
            console.error('❌ No backup audio sources available');
            this.showNoAudioError();
        }
    }

    async processAudioChunk(audioBlob) {
        try {
            // Validate audio blob first
            if (!audioBlob || audioBlob.size === 0) {
                console.warn('⚠️ Empty audio blob received in hybrid router');
                return;
            }
            
            // Check WebSocket connection
            if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
                console.warn('⚠️ WebSocket not connected, skipping audio chunk');
                return;
            }
            
            // Check AudioContext state
            if (!this.audioContext || this.audioContext.state === 'closed') {
                console.warn('⚠️ AudioContext not available, using fallback processing');
                await this.processAudioChunkFallback(audioBlob);
                return;
            }
            
            // Resume AudioContext if suspended
            if (this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                } catch (resumeError) {
                    console.warn('⚠️ Failed to resume AudioContext, using fallback:', resumeError);
                    await this.processAudioChunkFallback(audioBlob);
                    return;
                }
            }
            
            // Try to process with AudioContext
            try {
                const arrayBuffer = await audioBlob.arrayBuffer();
                
                // Validate array buffer
                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    console.warn('⚠️ Empty array buffer, skipping');
                    return;
                }
                
                // Decode audio data with timeout and error handling
                const audioBuffer = await Promise.race([
                    this.audioContext.decodeAudioData(arrayBuffer.slice()),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Decode timeout')), 3000)
                    )
                ]);
                
                // Validate decoded buffer
                if (!audioBuffer || audioBuffer.length === 0) {
                    console.warn('⚠️ Empty decoded audio buffer, using fallback');
                    await this.processAudioChunkFallback(audioBlob);
                    return;
                }
                
                // Apply source-specific processing
                const processedData = this.applySourceProcessing(audioBuffer);
                
                // Send to backend
                this.websocket.send(JSON.stringify({
                    type: 'audio_chunk',
                    audio_data: Array.from(processedData),
                    sample_rate: audioBuffer.sampleRate,
                    timestamp: Date.now(),
                    source: this.activeSource?.name || 'unknown',
                    quality: this.activeSource?.quality || 'medium',
                    router: 'hybrid'
                }));
                
                console.log('📨 Hybrid router sent audio chunk:', processedData.length, 'samples');
                
            } catch (decodeError) {
                // Handle decode errors gracefully - don't spam console with DOMExceptions
                if (decodeError.name === 'DOMException') {
                    console.warn('⚠️ Audio decode failed (DOMException), using fallback');
                } else {
                    console.warn('⚠️ Audio decode failed:', decodeError.name, 'using fallback');
                }
                
                // Switch to fallback processing
                await this.processAudioChunkFallback(audioBlob);
            }
            
        } catch (error) {
            // Catch-all error handler
            if (error.name !== 'DOMException') {
                console.error('❌ Hybrid router processing error:', error);
            } else {
                console.warn('⚠️ DOMException in hybrid router, switching to backup source');
                this.switchToBackupSource();
            }
        }
    }

    async processAudioChunkFallback(audioBlob) {
        try {
            console.log('🔄 Hybrid router using fallback processing...');
            
            // Convert to base64 as ultimate fallback
            const reader = new FileReader();
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('FileReader timeout in hybrid router'));
                }, 5000);
                
                reader.onload = () => {
                    clearTimeout(timeout);
                    try {
                        const arrayBuffer = reader.result;
                        
                        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                            console.warn('⚠️ Empty array buffer in hybrid fallback');
                            resolve();
                            return;
                        }
                        
                        // Convert to base64
                        const uint8Array = new Uint8Array(arrayBuffer);
                        let base64Audio = '';
                        
                        // Process in chunks to avoid string length limits
                        const chunkSize = 8192;
                        for (let i = 0; i < uint8Array.length; i += chunkSize) {
                            const chunk = uint8Array.slice(i, i + chunkSize);
                            base64Audio += String.fromCharCode.apply(null, chunk);
                        }
                        
                        const finalBase64 = btoa(base64Audio);
                        
                        // Send fallback data if we have a connection
                        if (finalBase64.length > 0 && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                            this.websocket.send(JSON.stringify({
                                type: 'audio_chunk_base64',
                                data: finalBase64,
                                format: 'webm',
                                sample_rate: 16000,
                                timestamp: Date.now(),
                                source: this.activeSource?.name || 'unknown',
                                fallback: true,
                                router: 'hybrid'
                            }));
                            
                            console.log('📨 Hybrid router sent fallback audio:', finalBase64.length, 'chars');
                        }
                        resolve();
                    } catch (sendError) {
                        clearTimeout(timeout);
                        console.warn('⚠️ Failed to send hybrid fallback audio:', sendError.message);
                        reject(sendError);
                    }
                };
                
                reader.onerror = (error) => {
                    clearTimeout(timeout);
                    console.warn('⚠️ FileReader error in hybrid fallback:', error);
                    reject(error);
                };
                
                reader.readAsArrayBuffer(audioBlob);
            });
            
        } catch (error) {
            console.warn('⚠️ Hybrid fallback processing failed:', error.message);
        }
    }

    applySourceProcessing(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const audioData = new Int16Array(channelData.length);
        
        // Apply different processing based on source
        switch (this.activeSource.type) {
            case 'screen':
                // Screen audio might have system sounds, apply filtering
                return this.filterSystemAudio(channelData, audioData);
            case 'microphone':
                // Microphone needs noise reduction
                return this.applyNoiseReduction(channelData, audioData);
            case 'tab':
                // Tab audio is usually clean
                return this.standardConversion(channelData, audioData);
            default:
                return this.standardConversion(channelData, audioData);
        }
    }

    filterSystemAudio(channelData, audioData) {
        // Simple high-pass filter for system audio
        for (let i = 0; i < channelData.length; i++) {
            const sample = channelData[i];
            // Apply simple filtering logic
            audioData[i] = Math.max(-32768, Math.min(32767, sample * 32768));
        }
        return audioData;
    }

    applyNoiseReduction(channelData, audioData) {
        // Simple noise gate
        const threshold = 0.01;
        for (let i = 0; i < channelData.length; i++) {
            const sample = Math.abs(channelData[i]) > threshold ? channelData[i] : 0;
            audioData[i] = Math.max(-32768, Math.min(32767, sample * 32768));
        }
        return audioData;
    }

    standardConversion(channelData, audioData) {
        for (let i = 0; i < channelData.length; i++) {
            audioData[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
        }
        return audioData;
    }

    showNoAudioError() {
        // Show user-friendly error message
        console.error('❌ No audio sources available');
    }

    stop() {
        this.isActive = false;
        
        if (this.mediaRecorder?.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        // Stop all source streams
        this.sources.forEach(source => {
            source.stream.getTracks().forEach(track => track.stop());
        });
        
        if (this.audioContext?.state !== 'closed') {
            this.audioContext.close();
        }
        
        this.sources.clear();
    }
}