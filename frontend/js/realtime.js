// Real-time capture with actual backend WebSocket connection
// Compatible with real.html structure
(function () {
    // DOM elements from real.html
    const connectBtn = document.getElementById('connectBtn');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadMenu = document.getElementById('downloadMenu');
    const downloadTranscript = document.getElementById('downloadTranscript');
    const downloadSummary = document.getElementById('downloadSummary');
    const status = document.getElementById('status');
    const transcript = document.getElementById('transcript');
    const summaryContainer = document.getElementById('summaryContainer');
    const summaryGenerating = document.getElementById('summaryGenerating');
    const summaryContent = document.getElementById('summaryContent');

    // State variables
    let isConnected = false;
    let isConnecting = false;
    let isRecording = false;
    let transcriptData = [];
    let aiSummary = null;
    let websocket = null;
    let mediaRecorder = null;
    let audioContext = null;
    let audioBuffer = [];  // Buffer to accumulate audio chunks
    let bufferSize = 0;
    let lastSpeaker = null;  // Track last speaker to append text
    let lastTranscriptElement = null;  // Track last transcript DOM element
    const BUFFER_THRESHOLD = 8000;  // ~0.5 seconds at 16kHz (faster for testing)

    const BACKEND_URL = 'ws://localhost:8000/ws/audio';

    // Initialize button states
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;

    // Event listeners
    if (connectBtn) connectBtn.addEventListener('click', toggleConnection);
    if (startBtn) startBtn.addEventListener('click', startRecording);
    if (stopBtn) stopBtn.addEventListener('click', stopRecording);
    if (clearBtn) clearBtn.addEventListener('click', clearTranscript);
    if (downloadBtn) downloadBtn.addEventListener('click', toggleDownloadMenu);
    if (downloadTranscript) downloadTranscript.addEventListener('click', downloadTranscriptFile);
    if (downloadSummary) downloadSummary.addEventListener('click', downloadSummaryFile);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (downloadBtn && downloadMenu &&
            !downloadBtn.contains(e.target) && !downloadMenu.contains(e.target)) {
            downloadMenu.classList.remove('show');
        }
    });

    function toggleConnection() {
        if (isConnected) {
            disconnectFromBackend();
        } else {
            connectToBackend();
        }
    }

    function connectToBackend() {
        if (isConnecting) return;

        isConnecting = true;
        const controls = document.querySelector('.controls');

        if (connectBtn) {
            connectBtn.textContent = '🔗 Connecting...';
            connectBtn.classList.add('connecting');
            connectBtn.disabled = true;
        }

        // Add process-active class to show dotted line
        if (controls) {
            controls.classList.add('process-active');
        }

        // Create WebSocket connection
        websocket = new WebSocket(BACKEND_URL);

        websocket.onopen = () => {
            console.log('✅ WebSocket connected to backend');
            isConnected = true;
            isConnecting = false;

            if (connectBtn) {
                connectBtn.innerHTML = '<span class="btn-emoji">🔗</span> Connected';
                connectBtn.classList.remove('connecting');
                connectBtn.classList.add('connected');
                connectBtn.disabled = false;
            }

            // Add glow to start button when connected
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.classList.add('active-process');
            }

            showAlert('Successfully connected to backend!', 'success');
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📩 Received from backend:', data);

                if (data.type === 'transcription') {
                    console.log('✅ Adding transcript item:', data.text);
                    addTranscriptItem(data.text, data.speaker_id || 1);
                } else if (data.type === 'error') {
                    console.error('Backend error:', data.message);
                    showAlert('Error: ' + data.message, 'error');
                }
            } catch (error) {
                console.error('Error processing message:', error);
                console.error('Raw event data:', event.data);
            }
        };

        websocket.onclose = () => {
            console.log('WebSocket disconnected');
            handleDisconnect();
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            showAlert('Connection error. Is the backend running on port 8000?', 'error');
            handleDisconnect();
        };
    }

    function disconnectFromBackend() {
        if (isConnecting) return;

        isConnecting = true;
        if (connectBtn) {
            connectBtn.textContent = 'Disconnecting...';
            connectBtn.classList.add('disconnecting');
            connectBtn.disabled = true;
        }

        // Stop recording if active
        if (isRecording) {
            stopRecording();
        }

        // Close WebSocket
        if (websocket) {
            websocket.close();
            websocket = null;
        }

        setTimeout(() => {
            handleDisconnect();
            showAlert('Disconnected from backend.', 'info');
        }, 500);
    }

    function handleDisconnect() {
        isConnected = false;
        isConnecting = false;
        isRecording = false;
        const controls = document.querySelector('.controls');

        if (connectBtn) {
            connectBtn.innerHTML = '<span class="btn-emoji">🔗</span> Connect to Backend';
            connectBtn.classList.remove('disconnecting', 'connected', 'connecting');
            connectBtn.disabled = false;
        }
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.classList.remove('active-process');
        }
        if (stopBtn) {
            stopBtn.disabled = true;
            stopBtn.classList.remove('active-process');
        }

        // Remove process flow line
        if (controls) {
            controls.classList.remove('process-active');
        }
    }

    function startRecording() {
        if (!isConnected) {
            showAlert('Please connect to backend first.', 'info');
            return;
        }

        isRecording = true;
        const controls = document.querySelector('.controls');

        if (startBtn) {
            startBtn.disabled = true;
            startBtn.classList.add('active-process');
        }
        if (stopBtn) {
            stopBtn.disabled = false;
            stopBtn.classList.add('active-process');
        }
        if (status) status.style.display = 'flex';

        // Keep process-active class to show dotted line
        if (controls) {
            controls.classList.add('process-active');
        }

        // Hide summary when starting new recording
        if (summaryContainer) summaryContainer.style.display = 'none';

        // Reset speaker tracking for new session
        lastSpeaker = null;
        lastTranscriptElement = null;
        transcriptData = [];

        // Clear transcript and prepare for new recording
        if (transcript) {
            transcript.innerHTML = '';
            console.log('🎙️ Cleared transcript, ready to record');
        }

        console.log('🎙️ Starting recording...');
        // Start audio capture
        startAudioCapture();
    }

    function stopRecording() {
        isRecording = false;
        const controls = document.querySelector('.controls');

        if (startBtn) {
            startBtn.disabled = !isConnected;
            startBtn.classList.remove('active-process');
        }
        if (stopBtn) {
            stopBtn.disabled = true;
            stopBtn.classList.remove('active-process');
        }
        if (status) status.style.display = 'none';

        // Stop audio capture
        stopAudioCapture();

        // Show and generate AI summary if we have transcript data
        if (transcriptData.length > 0) {
            generateAISummary();
        }
    }

    function startAudioCapture() {
        // Reset buffer
        audioBuffer = [];
        bufferSize = 0;

        navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 16000
            }
        })
            .then(stream => {
                console.log('🎤 Microphone access granted');

                // Create audio context with 16kHz sample rate (standard for Whisper)
                audioContext = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: 16000
                });

                const source = audioContext.createMediaStreamSource(stream);
                const processor = audioContext.createScriptProcessor(4096, 1, 1);

                processor.onaudioprocess = (e) => {
                    if (!isRecording || !websocket || websocket.readyState !== WebSocket.OPEN) {
                        return;
                    }

                    // Get raw audio samples from the audio processing event
                    const inputData = e.inputBuffer.getChannelData(0);

                    // Convert Float32Array to Int16Array (PCM format expected by Whisper)
                    const int16Data = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        // Convert from -1.0 to 1.0 range to -32768 to 32767 range
                        const s = Math.max(-1, Math.min(1, inputData[i]));
                        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }

                    // Add to buffer
                    audioBuffer.push(int16Data);
                    bufferSize += int16Data.length;

                    // Send when we have enough data (~2 seconds for Whisper to work well)
                    if (bufferSize >= BUFFER_THRESHOLD) {
                        // Concatenate all buffers
                        const combined = new Int16Array(bufferSize);
                        let offset = 0;
                        for (const chunk of audioBuffer) {
                            combined.set(chunk, offset);
                            offset += chunk.length;
                        }

                        // Send to backend
                        try {
                            websocket.send(JSON.stringify({
                                type: 'audio_chunk',
                                audio_data: Array.from(combined),
                                sample_rate: 16000,
                                timestamp: Date.now()
                            }));

                            console.log(`📡 Sent ${bufferSize} samples (${(bufferSize / 16000).toFixed(2)}s of audio)`);
                        } catch (sendError) {
                            console.error('Error sending audio:', sendError);
                            showAlert('Failed to send audio to backend', 'error');
                        }

                        // Reset buffer
                        audioBuffer = [];
                        bufferSize = 0;
                    }
                };

                // Connect the audio graph
                source.connect(processor);
                processor.connect(audioContext.destination);

                // Store for cleanup
                mediaRecorder = { stream, processor, source };

                console.log('📡 Capturing audio (buffering 2s chunks for transcription)...');
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
                showAlert('Could not access microphone. Please check permissions.', 'error');
                isRecording = false;
                if (startBtn) startBtn.disabled = !isConnected;
                if (stopBtn) stopBtn.disabled = true;
                if (status) status.style.display = 'none';
            });
    }

    function stopAudioCapture() {
        if (mediaRecorder) {
            // Disconnect audio nodes
            if (mediaRecorder.processor) {
                mediaRecorder.processor.disconnect();
            }
            if (mediaRecorder.source) {
                mediaRecorder.source.disconnect();
            }
            // Stop all tracks
            if (mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            mediaRecorder = null;
        }
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
    }

    function addTranscriptItem(text, speakerIndex) {
        console.log('📝 addTranscriptItem called with text:', text, 'speakerIndex:', speakerIndex);

        if (!transcript) {
            console.error('❌ Transcript container not found!');
            return;
        }

        const speakerNum = (speakerIndex % 4) + 1;
        const speakerName = `Speaker ${speakerNum}`;
        const timestamp = new Date().toLocaleTimeString();

        // Check if same speaker as last time
        if (lastSpeaker === speakerName && lastTranscriptElement) {
            // APPEND to existing paragraph (continuous speech)
            console.log('➕ Appending to existing speaker');
            const textDiv = lastTranscriptElement.querySelector('.text');
            if (textDiv) {
                textDiv.textContent += ' ' + text;  // Add space and new text
            }

            // Update transcript data
            if (transcriptData.length > 0) {
                transcriptData[transcriptData.length - 1].text += ' ' + text;
            }
        } else {
            // NEW speaker or first message - create new paragraph
            console.log('🆕 Creating new speaker entry');
            const item = {
                speaker: speakerName,
                text: text,
                timestamp: timestamp
            };

            transcriptData.push(item);

            const itemEl = document.createElement('div');
            itemEl.className = `transcript-item speaker-${speakerNum}`;
            itemEl.innerHTML = `
                <div class="speaker">
                    ${item.speaker}
                    <span class="timestamp">${item.timestamp}</span>
                </div>
                <div class="text">${item.text}</div>
            `;

            transcript.appendChild(itemEl);

            // Remember this speaker and element
            lastSpeaker = speakerName;
            lastTranscriptElement = itemEl;
        }

        transcript.scrollTop = transcript.scrollHeight;
        console.log('📊 Transcript data count:', transcriptData.length);
    }

    function clearTranscript() {
        transcriptData = [];
        aiSummary = null;
        lastSpeaker = null;  // Reset speaker tracking
        lastTranscriptElement = null;  // Reset element tracking
        if (transcript) {
            transcript.innerHTML = `
                <div class="transcript-empty">
                    <div class="icon">🎙️</div>
                    <p>Click "Start Recording" to begin capturing audio</p>
                </div>
            `;
        }
        if (summaryContainer) summaryContainer.style.display = 'none';
    }

    function generateAISummary() {
        if (!summaryContainer || !summaryGenerating || !summaryContent) return;

        summaryContainer.style.display = 'block';
        summaryGenerating.style.display = 'flex';
        summaryContent.innerHTML = '';

        // Prepare transcript text for backend
        const transcriptText = transcriptData.map(item =>
            `${item.speaker}: ${item.text}`
        ).join('\n');

        // Generate summary directly without backend call (since we already have transcription)
        // We'll use local AI model approach
        summaryGenerating.style.display = 'none';

        // Create summary from transcript data
        const speakers = [...new Set(transcriptData.map(item => item.speaker))];
        const totalWords = transcriptText.split(' ').length;

        // Extract potential action items (sentences with: should, need to, will, must, have to)
        const actionWords = /\b(should|need to|will|must|have to|going to|plan to|decided to)\b/gi;
        const potentialActions = transcriptData
            .filter(item => actionWords.test(item.text))
            .map(item => item.text.split(/[.!?]/)[0])  // Get first sentence
            .filter(text => text.length > 10)  // Filter out very short items
            .slice(0, 5);  // Max 5 action items

        // Extract key points (longer sentences, typically important)
        const keyStatements = transcriptData
            .filter(item => item.text.length > 30)  // Longer statements
            .map(item => {
                const sentences = item.text.split(/[.!?]/);
                return sentences[0] + (sentences[0].endsWith('.') ? '' : '.');
            })
            .filter(text => text.length > 10)
            .slice(0, 5);  // Max 5 key points

        aiSummary = {
            overview: `Meeting captured with ${speakers.length} speaker(s), ${transcriptData.length} segments, approximately ${totalWords} words discussed.`,
            keyPoints: keyStatements.length > 0 ? keyStatements : ["Review transcript for detailed discussion"],
            actionItems: potentialActions.length > 0 ? potentialActions : ["No specific action items identified"]
        };

        displaySummary();
    }

    function displaySummary() {
        if (!summaryContent || !aiSummary) return;

        summaryContent.innerHTML = `
            <div class="summary-section">
                <h4>📋 Meeting Overview</h4>
                <p>${aiSummary.overview}</p>
            </div>
            <div class="summary-section">
                <h4>🔑 Key Points</h4>
                <ul>
                    ${aiSummary.keyPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
            <div class="summary-section">
                <h4>✅ Action Items</h4>
                <ul>
                    ${aiSummary.actionItems.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    function toggleDownloadMenu() {
        if (downloadMenu) downloadMenu.classList.toggle('show');
    }

    function downloadTranscriptFile() {
        if (transcriptData.length === 0) {
            showAlert('No transcript to download', 'warning');
            return;
        }

        let content = 'Meeting Transcript\n';
        content += '=================\n\n';
        content += `Generated: ${new Date().toLocaleString()}\n\n`;

        transcriptData.forEach(item => {
            content += `${item.speaker} [${item.timestamp}]\n`;
            content += `${item.text}\n\n`;
        });

        downloadFile(content, `transcript-${Date.now()}.txt`);
        if (downloadMenu) downloadMenu.classList.remove('show');
    }

    function downloadSummaryFile() {
        if (!aiSummary) {
            showAlert('No AI summary available. Please stop recording first to generate a summary.', 'warning');
            return;
        }

        let content = 'AI Meeting Summary\n';
        content += '=================\n\n';
        content += `Generated: ${new Date().toLocaleString()}\n\n`;

        content += `Meeting Overview:\n${aiSummary.overview}\n\n`;

        content += `Key Points:\n`;
        aiSummary.keyPoints.forEach((point, index) => {
            content += `${index + 1}. ${point}\n`;
        });
        content += '\n';

        content += `Action Items:\n`;
        aiSummary.actionItems.forEach((item, index) => {
            content += `${index + 1}. ${item}\n`;
        });
        content += '\n';

        content += `Participants: ${aiSummary.participants}\n`;

        downloadFile(content, `summary-${Date.now()}.txt`);
        if (downloadMenu) downloadMenu.classList.remove('show');
    }

    function downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function showAlert(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Get icon and title based on type
        let icon, title;
        switch (type) {
            case 'error':
                icon = '❌';
                title = 'Error';
                break;
            case 'success':
                icon = '✅';
                title = 'Success';
                break;
            case 'warning':
                icon = '⚠️';
                title = 'Warning';
                break;
            default:
                icon = 'ℹ️';
                title = 'Info';
        }

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        container.appendChild(notification);

        // Close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            removeNotification(notification);
        });

        // Auto remove after 2 seconds
        setTimeout(() => {
            removeNotification(notification);
        }, 2000);
    }

    function removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.classList.add('removing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }
    }

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (websocket) {
            websocket.close();
        }
        stopAudioCapture();
    });

    console.log('✅ Realtime.js loaded - Ready for backend connection');
})();
