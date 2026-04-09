// Hybrid Audio Router - Combines multiple audio sources intelligently
class HybridAudioRouter {
    constructor() {
        this.sources = new Map();
        this.activeSource = null;
        this.audioMixer = null;
        this.isActive = false;
        this.isPaused = false;
        this.websocket = null;
        this.backendUrl = 'http://localhost:8000';
        this.supportedMimeTypes = this.detectSupportedMimeTypes();
    }

    // Detect supported mime types for MediaRecorder
    detectSupportedMimeTypes() {
        const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/mp4',
            'audio/mpeg',
            'audio/wav'
        ];

        const supported = mimeTypes.filter(type => {
            try {
                return MediaRecorder.isTypeSupported(type);
            } catch (e) {
                return false;
            }
        });

        console.log('📼 Supported audio mime types:', supported);
        return supported;
    }

    // Get best available mime type
    getBestMimeType() {
        return this.supportedMimeTypes[0] || '';
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
            .sort(([, a], [, b]) => a.priority - b.priority);

        const [sourceName, sourceData] = sortedSources[0];
        this.activeSource = { name: sourceName, ...sourceData };

        console.log(`🎯 Selected audio source: ${sourceName}`);
        this.startRecording();
    }

    startRecording() {
        if (!this.activeSource) return;

        try {
            // Validate stream has active audio tracks
            const audioTracks = this.activeSource.stream.getAudioTracks();
            if (audioTracks.length === 0) {
                console.warn('⚠️ No audio tracks in stream, switching to backup');
                this.switchToBackupSource();
                return;
            }

            // Check if tracks are active
            const activeTrack = audioTracks.find(track => track.readyState === 'live');
            if (!activeTrack) {
                console.warn('⚠️ No live audio tracks, switching to backup');
                this.switchToBackupSource();
                return;
            }

            // Setup MediaRecorder with optimal settings based on source
            const options = this.getRecorderOptions(this.activeSource.type);

            // Try to create MediaRecorder with multiple fallback strategies
            let recorderCreated = false;

            // Strategy 1: Use detected best options
            if (!recorderCreated && options.mimeType) {
                try {
                    this.mediaRecorder = new MediaRecorder(this.activeSource.stream, options);
                    recorderCreated = true;
                    console.log(`✅ MediaRecorder created with ${options.mimeType}`);
                } catch (e) {
                    console.warn(`⚠️ MediaRecorder failed with ${options.mimeType}:`, e.message);
                }
            }

            // Strategy 2: Try common mime types
            if (!recorderCreated) {
                const fallbackTypes = [
                    'audio/webm;codecs=opus',
                    'audio/webm',
                    'audio/ogg;codecs=opus',
                    'audio/mp4',
                    ''  // Empty = browser default
                ];

                for (const mimeType of fallbackTypes) {
                    try {
                        const opts = mimeType ? { mimeType } : {};
                        this.mediaRecorder = new MediaRecorder(this.activeSource.stream, opts);
                        recorderCreated = true;
                        console.log(`✅ MediaRecorder created with fallback: ${mimeType || 'browser default'}`);
                        break;
                    } catch (e) {
                        console.warn(`⚠️ Fallback ${mimeType || 'default'} failed:`, e.message);
                    }
                }
            }

            // Strategy 3: Absolute fallback - no options at all
            if (!recorderCreated) {
                try {
                    this.mediaRecorder = new MediaRecorder(this.activeSource.stream);
                    recorderCreated = true;
                    console.log('✅ MediaRecorder created with no options (browser default)');
                } catch (e) {
                    console.error('❌ All MediaRecorder strategies failed:', e);
                    throw new Error(`MediaRecorder not supported: ${e.message}`);
                }
            }

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && this.isActive && !this.isPaused) {
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
            this.isPaused = false;

            console.log(`🎙️ Recording started with ${this.activeSource.name} source (mimeType: ${this.mediaRecorder.mimeType})`);
        } catch (error) {
            console.error('❌ Recording setup failed:', error);
            this.switchToBackupSource();
        }
    }

    pauseRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            this.isPaused = true;
            console.log('⏸️ Recording paused');
            return true;
        }
        return false;
    }

    resumeRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            this.isPaused = false;
            console.log('▶️ Recording resumed');
            return true;
        }
        return false;
    }

    getRecorderOptions(sourceType) {
        const mimeType = this.getBestMimeType();

        // If no supported mime type found, return empty options (let browser decide)
        if (!mimeType) {
            console.warn('⚠️ No supported mime type found, using browser defaults');
            return {};
        }

        switch (sourceType) {
            case 'screen':
                return {
                    mimeType: mimeType,
                    audioBitsPerSecond: 128000
                };
            case 'microphone':
                return {
                    mimeType: mimeType,
                    audioBitsPerSecond: 64000
                };
            case 'tab':
                return {
                    mimeType: mimeType,
                    audioBitsPerSecond: 96000
                };
            default:
                return {
                    mimeType: mimeType,
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
            // Validate audio blob
            if (!audioBlob || audioBlob.size === 0) {
                console.warn('⚠️ Empty audio blob received, skipping');
                return;
            }

            // Check WebSocket connection
            if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
                console.warn('⚠️ WebSocket not connected, skipping audio chunk');
                return;
            }

            // ─────────────────────────────────────────────────────────────
            // CORRECT APPROACH: Send raw binary ArrayBuffer directly.
            //
            // Why NOT decodeAudioData():
            //   MediaRecorder produces streaming container chunks (webm/ogg).
            //   Only the FIRST chunk has the container header — all subsequent
            //   chunks fail with EncodingError because they're not standalone
            //   audio files. decodeAudioData() is designed for complete files,
            //   not streaming chunks.
            //
            // Why binary WebSocket:
            //   Sending the raw ArrayBuffer is exactly what streaming audio
            //   backends expect. It's faster (no base64 overhead, no client-side
            //   decode CPU cost) and error-free.
            // ─────────────────────────────────────────────────────────────
            try {
                const arrayBuffer = await audioBlob.arrayBuffer();

                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    console.warn('⚠️ Empty array buffer, skipping chunk');
                    return;
                }

                // Send a small metadata header as JSON first, then the binary blob
                // This allows the backend to know format/source before the binary frame.
                // Many backends use a framing protocol: first a JSON frame, then binary.
                // Alternatively, send ONLY the binary if your backend reads raw bytes.
                this.websocket.send(JSON.stringify({
                    type: 'audio_meta',
                    mimeType: this.mediaRecorder?.mimeType || 'audio/webm',
                    timestamp: Date.now(),
                    byteLength: arrayBuffer.byteLength,
                    source: this.activeSource?.name || 'unknown',
                    quality: this.activeSource?.quality || 'medium',
                    router: 'hybrid'
                }));

                // Send the raw binary audio data
                this.websocket.send(arrayBuffer);

                console.log(`📨 Hybrid router sent binary chunk: ${arrayBuffer.byteLength} bytes`);

            } catch (sendError) {
                // Binary send failed — fall back to base64 as last resort
                console.warn('⚠️ Binary send failed, falling back to base64:', sendError.message);
                await this.processAudioChunkFallback(audioBlob);
            }

        } catch (error) {
            console.error('❌ Hybrid router processAudioChunk error:', error);
        }
    }

    async processAudioChunkFallback(audioBlob) {
        // Last-resort fallback: base64-encode and send as JSON.
        // Only used if binary WebSocket send itself fails.
        try {
            const arrayBuffer = await audioBlob.arrayBuffer();

            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                console.warn('⚠️ Empty array buffer in fallback, skipping');
                return;
            }

            if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
                return;
            }

            // Efficient base64 conversion using Uint8Array chunks
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryStr = '';
            const chunkSize = 8192;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
                binaryStr += String.fromCharCode.apply(null, uint8Array.slice(i, i + chunkSize));
            }
            const base64Audio = btoa(binaryStr);

            this.websocket.send(JSON.stringify({
                type: 'audio_chunk_base64',
                data: base64Audio,
                mimeType: this.mediaRecorder?.mimeType || 'audio/webm',
                timestamp: Date.now(),
                source: this.activeSource?.name || 'unknown',
                fallback: true,
                router: 'hybrid'
            }));

            console.log(`📨 Hybrid router sent base64 fallback: ${base64Audio.length} chars`);

        } catch (error) {
            console.warn('⚠️ Hybrid fallback processing failed:', error.message);
        }
    }


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