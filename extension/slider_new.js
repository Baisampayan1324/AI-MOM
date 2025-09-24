// AI Meeting Minutes Extension - Enhanced Dual-Mode Interface
const backendUrl = "http://127.0.0.1:8000";

// Global state management
let currentMode = 'online';
let socket = null;
let mediaRecorder = null;
let audioStream = null;
let isRecording = false;
let isConnected = false;
let progressiveSummaryTimer = null;
let transcriptionBuffer = [];

// DOM Elements - Common
const onlineTab = document.getElementById('onlineTab');
const offlineTab = document.getElementById('offlineTab');
const onlineMode = document.getElementById('onlineMode');
const offlineMode = document.getElementById('offlineMode');
const connectionStatus = document.getElementById('connectionStatus');

// DOM Elements - Online Mode
const meetingIdInput = document.getElementById('meetingId');
const userNameInput = document.getElementById('userName');
const connectBtn = document.getElementById('connectBtn');
const recordBtn = document.getElementById('recordBtn');
const audioMeter = document.getElementById('audioMeter');
const liveTranscription = document.getElementById('liveTranscription');
const speakerAlerts = document.getElementById('speakerAlerts');
const progressiveSummary = document.getElementById('progressiveSummary');
const finalSummary = document.getElementById('finalSummary');

// DOM Elements - Offline Mode
const uploadArea = document.getElementById('uploadArea');
const audioFileInput = document.getElementById('audioFileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const processFileBtn = document.getElementById('processFileBtn');
const processingSection = document.getElementById('processingSection');
const fileProgress = document.getElementById('fileProgress');
const fileProgressText = document.getElementById('fileProgressText');
const offlineResults = document.getElementById('offlineResults');
const fileTranscription = document.getElementById('fileTranscription');
const speakerDetails = document.getElementById('speakerDetails');
const fileSummary = document.getElementById('fileSummary');
const keyPoints = document.getElementById('keyPoints');
const actionItems = document.getElementById('actionItems');

// Initialize Extension
document.addEventListener('DOMContentLoaded', function() {
    initializeExtension();
    setupEventListeners();
    loadUserPreferences();
});

function initializeExtension() {
    updateConnectionStatus('Ready', 'ready');
    setActiveMode('online');
    
    // Load user preferences
    const savedUserName = localStorage.getItem('aiMeetingMinutes_userName');
    const savedMeetingId = localStorage.getItem('aiMeetingMinutes_meetingId');
    
    if (savedUserName) userNameInput.value = savedUserName;
    if (savedMeetingId) meetingIdInput.value = savedMeetingId;
}

function setupEventListeners() {
    // Mode switching
    onlineTab.addEventListener('click', () => setActiveMode('online'));
    offlineTab.addEventListener('click', () => setActiveMode('offline'));
    
    // Online mode events
    connectBtn.addEventListener('click', handleConnect);
    recordBtn.addEventListener('click', handleRecording);
    
    // Offline mode events
    uploadArea.addEventListener('click', () => audioFileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleFileDrop);
    audioFileInput.addEventListener('change', handleFileSelect);
    processFileBtn.addEventListener('click', handleFileProcessing);
    
    // Save user preferences
    userNameInput.addEventListener('input', saveUserPreferences);
    meetingIdInput.addEventListener('input', saveUserPreferences);
}

// ===============================
// MODE MANAGEMENT
// ===============================

function setActiveMode(mode) {
    currentMode = mode;
    
    // Update tab states
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (mode === 'online') {
        onlineTab.classList.add('active');
        onlineMode.classList.add('active');
    } else {
        offlineTab.classList.add('active');
        offlineMode.classList.add('active');
    }
    
    // Reset states when switching modes
    if (isRecording && mode === 'offline') {
        stopRecording();
    }
}

// ===============================
// ONLINE MODE FUNCTIONS
// ===============================

async function handleConnect() {
    const meetingId = meetingIdInput.value.trim();
    const userName = userNameInput.value.trim();
    
    if (!meetingId) {
        showAlert('Please enter a meeting ID', 'error');
        return;
    }
    
    if (isConnected) {
        disconnectFromMeeting();
        return;
    }
    
    try {
        updateConnectionStatus('Connecting...', 'connecting');
        connectBtn.disabled = true;
        
        await connectToWebSocket(meetingId, userName);
        
        isConnected = true;
        updateConnectionStatus('Connected', 'connected');
        connectBtn.textContent = 'Disconnect';
        connectBtn.disabled = false;
        recordBtn.disabled = false;
        
        saveUserPreferences();
        
    } catch (error) {
        console.error('Connection failed:', error);
        updateConnectionStatus('Connection Failed', 'error');
        connectBtn.disabled = false;
        showAlert('Failed to connect to backend server', 'error');
    }
}

function connectToWebSocket(meetingId, userName) {
    return new Promise((resolve, reject) => {
        const wsUrl = `ws://127.0.0.1:8000/ws/meeting/${meetingId}`;
        socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
            console.log('WebSocket connected');
            resolve();
        };
        
        socket.onmessage = (event) => {
            handleWebSocketMessage(JSON.parse(event.data));
        };
        
        socket.onclose = () => {
            console.log('WebSocket disconnected');
            if (isConnected) {
                updateConnectionStatus('Disconnected', 'error');
                isConnected = false;
                connectBtn.textContent = 'Connect to Meeting';
                recordBtn.disabled = true;
            }
        };
        
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        };
        
        // Timeout after 5 seconds
        setTimeout(() => {
            if (socket.readyState !== WebSocket.OPEN) {
                reject(new Error('Connection timeout'));
            }
        }, 5000);
    });
}

function disconnectFromMeeting() {
    if (socket) {
        socket.close();
        socket = null;
    }
    
    if (isRecording) {
        stopRecording();
    }
    
    isConnected = false;
    updateConnectionStatus('Disconnected', 'ready');
    connectBtn.textContent = 'Connect to Meeting';
    connectBtn.disabled = false;
    recordBtn.disabled = true;
    recordBtn.textContent = '🎙 Start Recording';
}

async function handleRecording() {
    if (!isConnected) {
        showAlert('Please connect to meeting first', 'error');
        return;
    }
    
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        // Get microphone access
        audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true
            } 
        });
        
        // Setup audio processing
        setupAudioProcessing();
        
        // Update UI
        isRecording = true;
        recordBtn.textContent = '⏹ Stop Recording';
        recordBtn.classList.add('recording');
        audioMeter.style.display = 'block';
        
        // Clear previous results
        clearLiveResults();
        
        // Start progressive summary timer
        startProgressiveSummaryTimer();
        
        updateConnectionStatus('Recording...', 'recording');
        
    } catch (error) {
        console.error('Failed to start recording:', error);
        showAlert('Failed to access microphone', 'error');
    }
}

function stopRecording() {
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    
    isRecording = false;
    recordBtn.textContent = '🎙 Start Recording';
    recordBtn.classList.remove('recording');
    audioMeter.style.display = 'none';
    
    updateConnectionStatus('Connected', 'connected');
    
    // Stop progressive summary timer
    if (progressiveSummaryTimer) {
        clearInterval(progressiveSummaryTimer);
        progressiveSummaryTimer = null;
    }
    
    // Generate final summary
    if (transcriptionBuffer.length > 0) {
        generateFinalSummary();
    }
}

function setupAudioProcessing() {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(audioStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (event) => {
        if (!isRecording) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Update audio level meter
        updateAudioLevel(inputData);
        
        // Convert to PCM and send to backend
        const pcmData = convertToPCM(inputData);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(pcmData);
        }
    };
    
    source.connect(processor);
    processor.connect(audioContext.destination);
}

function convertToPCM(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        int16Array[i] = Math.max(-32768, Math.min(32767, float32Array[i] * 32768));
    }
    return int16Array.buffer;
}

function updateAudioLevel(inputData) {
    // Calculate RMS level
    let sum = 0;
    for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
    }
    const rms = Math.sqrt(sum / inputData.length);
    const level = Math.min(5, Math.floor(rms * 50));
    
    // Update meter bars
    const meterBars = document.querySelectorAll('.meter-bar');
    meterBars.forEach((bar, index) => {
        if (index < level) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    });
}

function handleWebSocketMessage(data) {
    if (data.type === 'transcription') {
        handleLiveTranscription(data);
    } else if (data.type === 'speaker_alert') {
        handleSpeakerAlert(data);
    }
}

function handleLiveTranscription(data) {
    // Add to transcription buffer
    transcriptionBuffer.push(data);
    
    // Update live transcription display
    const transcriptionText = data.text || data.transcription;
    const speaker = data.speaker || 'Speaker';
    
    const transcriptionElement = document.createElement('div');
    transcriptionElement.className = 'transcription-item';
    transcriptionElement.innerHTML = `
        <span class="speaker-label">${speaker}:</span>
        <span class="transcription-text">${transcriptionText}</span>
    `;
    
    liveTranscription.appendChild(transcriptionElement);
    liveTranscription.scrollTop = liveTranscription.scrollHeight;
    
    // Keep only last 10 items
    while (liveTranscription.children.length > 10) {
        liveTranscription.removeChild(liveTranscription.firstChild);
    }
}

function handleSpeakerAlert(data) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert-item ${data.type === 'personal' ? 'personal-alert' : 'general-alert'}`;
    alertElement.innerHTML = `
        <div class="alert-icon">${data.type === 'personal' ? '🚨' : '⚠️'}</div>
        <div class="alert-content">
            <div class="alert-text">${data.text}</div>
            <div class="alert-time">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    speakerAlerts.appendChild(alertElement);
    speakerAlerts.scrollTop = speakerAlerts.scrollHeight;
    
    // Keep only last 5 alerts
    while (speakerAlerts.children.length > 5) {
        speakerAlerts.removeChild(speakerAlerts.firstChild);
    }
}

function startProgressiveSummaryTimer() {
    // Generate progressive summary every 2 minutes
    progressiveSummaryTimer = setInterval(() => {
        if (transcriptionBuffer.length > 0) {
            generateProgressiveSummary();
        }
    }, 120000); // 2 minutes
}

async function generateProgressiveSummary() {
    if (transcriptionBuffer.length === 0) return;
    
    try {
        const recentTranscription = transcriptionBuffer.slice(-10).map(item => 
            `${item.speaker}: ${item.text || item.transcription}`
        ).join('\n');
        
        const response = await fetch(`${backendUrl}/api/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: recentTranscription,
                summary_type: 'progressive'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            updateProgressiveSummary(result.summary);
        }
    } catch (error) {
        console.error('Failed to generate progressive summary:', error);
    }
}

async function generateFinalSummary() {
    try {
        showLoading(finalSummary, 'Generating final summary...');
        
        const fullTranscription = transcriptionBuffer.map(item => 
            `${item.speaker}: ${item.text || item.transcription}`
        ).join('\n');
        
        const response = await fetch(`${backendUrl}/api/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: fullTranscription,
                summary_type: 'comprehensive'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            displayFinalSummary(result);
        } else {
            throw new Error('Failed to generate summary');
        }
    } catch (error) {
        console.error('Failed to generate final summary:', error);
        finalSummary.innerHTML = '<div class="error-state">Failed to generate summary</div>';
    }
}

function updateProgressiveSummary(summary) {
    const summaryElement = document.createElement('div');
    summaryElement.className = 'summary-item';
    summaryElement.innerHTML = `
        <div class="summary-time">${new Date().toLocaleTimeString()}</div>
        <div class="summary-content">${summary}</div>
    `;
    
    progressiveSummary.appendChild(summaryElement);
    progressiveSummary.scrollTop = progressiveSummary.scrollHeight;
    
    // Keep only last 3 progressive summaries
    while (progressiveSummary.children.length > 3) {
        progressiveSummary.removeChild(progressiveSummary.firstChild);
    }
}

function displayFinalSummary(result) {
    const summary = result.summary || result;
    finalSummary.innerHTML = `
        <div class="final-summary-content">
            <div class="summary-section">
                <h4>📝 Meeting Overview</h4>
                <p>${summary}</p>
            </div>
            ${result.key_points ? `
                <div class="summary-section">
                    <h4>🎯 Key Points</h4>
                    <ul>
                        ${result.key_points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${result.action_items ? `
                <div class="summary-section">
                    <h4>✅ Action Items</h4>
                    <ul>
                        ${result.action_items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

function clearLiveResults() {
    liveTranscription.innerHTML = '<div class="empty-state">🎤 Recording started, speak to see transcription...</div>';
    speakerAlerts.innerHTML = '<div class="empty-state">No alerts yet. Alerts appear when you\'re mentioned.</div>';
    progressiveSummary.innerHTML = '<div class="empty-state">Progressive summary will appear during recording...</div>';
    finalSummary.innerHTML = '<div class="empty-state">Complete summary will appear when recording stops.</div>';
    transcriptionBuffer = [];
}

// ===============================
// OFFLINE MODE FUNCTIONS
// ===============================

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileSelection(file);
    }
}

function handleFileSelection(file) {
    // Validate file type
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg', 'audio/wav'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
        showAlert('Please select a valid audio file (MP3, WAV, M4A)', 'error');
        return;
    }
    
    // Display file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    fileInfo.style.display = 'block';
    uploadArea.style.display = 'none';
    
    // Store file for processing
    uploadArea.selectedFile = file;
}

async function handleFileProcessing() {
    const file = uploadArea.selectedFile;
    if (!file) return;
    
    try {
        // Show processing UI
        processingSection.style.display = 'block';
        processFileBtn.disabled = true;
        fileProgress.style.width = '0%';
        fileProgressText.textContent = 'Uploading file...';
        
        // Create form data
        const formData = new FormData();
        formData.append('audio_file', file);
        formData.append('meeting_id', `offline_${Date.now()}`);
        
        // Upload and process file
        const response = await fetch(`${backendUrl}/api/process-audio`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to process audio file');
        }
        
        // Show progress
        fileProgress.style.width = '50%';
        fileProgressText.textContent = 'Processing transcription...';
        
        const result = await response.json();
        
        // Complete progress
        fileProgress.style.width = '100%';
        fileProgressText.textContent = 'Processing complete!';
        
        // Display results
        setTimeout(() => {
            displayOfflineResults(result);
        }, 1000);
        
    } catch (error) {
        console.error('File processing failed:', error);
        fileProgressText.textContent = 'Processing failed. Please try again.';
        processFileBtn.disabled = false;
        showAlert('Failed to process audio file', 'error');
    }
}

function displayOfflineResults(result) {
    // Hide processing, show results
    processingSection.style.display = 'none';
    offlineResults.style.display = 'block';
    
    // Display transcription
    if (result.transcription) {
        fileTranscription.querySelector('.transcription-content').innerHTML = 
            formatTranscriptionText(result.transcription);
    }
    
    // Display speaker details
    if (result.speaker_info) {
        displaySpeakerDetails(result.speaker_info);
    }
    
    // Display summary
    if (result.summary) {
        fileSummary.querySelector('.summary-content').innerHTML = result.summary;
    }
    
    // Display key points
    if (result.key_points) {
        displayKeyPoints(result.key_points);
    }
    
    // Display action items
    if (result.action_items) {
        displayActionItems(result.action_items);
    }
}

function formatTranscriptionText(transcription) {
    // Format transcription with speaker colors
    const speakers = {};
    let speakerCount = 0;
    const colors = ['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    return transcription.split('\n').map(line => {
        const match = line.match(/^(Speaker \d+): (.+)$/);
        if (match) {
            const speaker = match[1];
            const text = match[2];
            
            if (!speakers[speaker]) {
                speakers[speaker] = colors[speakerCount % colors.length];
                speakerCount++;
            }
            
            return `
                <div class="speaker-line">
                    <span class="speaker-label" style="color: ${speakers[speaker]}">${speaker}:</span>
                    <span class="speaker-text">${text}</span>
                </div>
            `;
        }
        return `<div class="speaker-line">${line}</div>`;
    }).join('');
}

function displaySpeakerDetails(speakerInfo) {
    const container = speakerDetails.querySelector('.speaker-list');
    
    const speakersHtml = Object.entries(speakerInfo).map(([speaker, info]) => `
        <div class="speaker-item">
            <div class="speaker-avatar">${speaker.charAt(speaker.length - 1)}</div>
            <div class="speaker-info">
                <div class="speaker-name">${speaker}</div>
                <div class="speaker-stats">
                    ${info.word_count || 0} words • ${info.duration || '0:00'} speaking time
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = speakersHtml;
}

function displayKeyPoints(keyPoints) {
    const container = keyPoints.querySelector('.points-list');
    
    const pointsHtml = keyPoints.map(point => `
        <div class="point-item">
            <div class="point-bullet"></div>
            <div class="point-text">${point}</div>
        </div>
    `).join('');
    
    container.innerHTML = pointsHtml;
}

function displayActionItems(actionItems) {
    const container = actionItems.querySelector('.items-list');
    
    const itemsHtml = actionItems.map(item => `
        <div class="action-item">
            <div class="action-checkbox"></div>
            <div class="action-content">
                <div class="action-text">${item.text || item}</div>
                ${item.assignee ? `<div class="action-meta">Assigned to: ${item.assignee}</div>` : ''}
                ${item.deadline ? `<div class="action-meta">Due: ${item.deadline}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = itemsHtml;
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

function updateConnectionStatus(status, type) {
    connectionStatus.textContent = status;
    connectionStatus.className = `status-indicator ${type}`;
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Add to page
    document.body.appendChild(alert);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 3000);
}

function showLoading(element, message = 'Loading...') {
    element.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        </div>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function saveUserPreferences() {
    localStorage.setItem('aiMeetingMinutes_userName', userNameInput.value);
    localStorage.setItem('aiMeetingMinutes_meetingId', meetingIdInput.value);
}

function loadUserPreferences() {
    const savedUserName = localStorage.getItem('aiMeetingMinutes_userName');
    const savedMeetingId = localStorage.getItem('aiMeetingMinutes_meetingId');
    
    if (savedUserName) userNameInput.value = savedUserName;
    if (savedMeetingId) meetingIdInput.value = savedMeetingId;
}

// Handle extension popup close
window.addEventListener('beforeunload', () => {
    if (isRecording) {
        stopRecording();
    }
    if (socket) {
        socket.close();
    }
});