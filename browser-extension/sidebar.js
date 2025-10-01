// State management
let currentMode = 'online';
let isRecording = false;
let isConnected = false;
let ws = null;
let mediaRecorder = null;

// DOM Elements
const closeBtn = document.getElementById('closeBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const onlineMode = document.getElementById('onlineMode');
const offlineMode = document.getElementById('offlineMode');
const startRecordingBtn = document.getElementById('startRecording');
const stopRecordingBtn = document.getElementById('stopRecording');
const visualizer = document.getElementById('visualizer');
const transcript = document.getElementById('transcript');
const summary = document.getElementById('summary');
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const processBtn = document.getElementById('processBtn');
const progressBar = document.getElementById('progressBar');
const connectionStatus = document.getElementById('connectionStatus');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check for microphone access status on load
  checkMicrophoneAccessStatus();
  
  // Validate extension context periodically
  setInterval(() => {
    validateExtensionContext();
  }, 5000); // Check every 5 seconds
});

// Function to check microphone access status
function checkMicrophoneAccessStatus() {
  // Send message to content script to check microphone access
  window.parent.postMessage({
    action: 'checkMicrophoneAccess'
  }, '*');
}

// Close button - minimize sidebar
closeBtn.addEventListener('click', () => {
  window.parent.postMessage({ action: 'minimizeSidebar' }, '*');
});

// Mode toggle
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    switchMode(mode);
  });
});

function switchMode(mode) {
  currentMode = mode;
  
  modeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  
  if (mode === 'online') {
    onlineMode.classList.remove('hidden');
    offlineMode.classList.add('hidden');
  } else {
    onlineMode.classList.add('hidden');
    offlineMode.classList.remove('hidden');
  }
}

// Function to validate extension context
function validateExtensionContext() {
  if (!chrome.runtime?.id) {
    // Extension context is invalid
    const message = 'Extension was reloaded or updated. Please refresh this page to continue using the AI Meeting assistant.';
    
    // Show user-friendly error message
    connectionStatus.classList.add('error');
    connectionStatus.querySelector('.status-text').textContent = 'Extension needs refresh';
    
    // Disable recording button
    startRecordingBtn.disabled = true;
    startRecordingBtn.textContent = 'Refresh Page Required';
    
    // Show alert to user
    alert(message);
    
    return false;
  }
  return true;
}

// Online Mode - Recording
startRecordingBtn.addEventListener('click', async () => {
  try {
    // Check extension context first
    if (!validateExtensionContext()) {
      return;
    }

    connectionStatus.querySelector('.status-text').textContent = 'Requesting microphone access...';
    
    // Send message to content script to handle microphone access
    window.parent.postMessage({
      action: 'requestMicrophoneAccess',
      config: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000
      }
    }, '*');

  } catch (error) {
    console.error('Failed to start recording:', error);
    connectionStatus.classList.add('error');
    connectionStatus.querySelector('.status-text').textContent = 'Failed to start recording';
  }
});

// Listen for messages from parent (content script)
window.addEventListener('message', async (event) => {
  if (event.data.action === 'microphoneAccessGranted') {
    try {
      // Show audio source information
      const source = event.data.source || 'standard';
      const sourceText = {
        'meet-capture': 'Google Meet audio captured',
        'direct-meet': 'Direct microphone access',
        'desktop-audio': 'Desktop audio sharing',
        'standard': 'Standard microphone'
      };
      
      connectionStatus.querySelector('.status-text').textContent = `Audio source: ${sourceText[source]}`;
      
      // Connect to WebSocket if not connected
      if (!isConnected) {
        connectionStatus.querySelector('.status-text').textContent = 'Connecting to backend...';
        
        ws = new WebSocket('ws://localhost:8000/ws/browser-extension');

        ws.onopen = () => {
          isConnected = true;
          connectionStatus.classList.add('connected');
          connectionStatus.classList.remove('error');
          connectionStatus.querySelector('.status-text').textContent = `Connected - ${sourceText[source]}`;
          
          // Now start recording (content script will handle the actual recording)
          startActualRecording();
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleTranscriptUpdate(data);
        };

        ws.onerror = () => {
          connectionStatus.classList.add('error');
          connectionStatus.querySelector('.status-text').textContent = 'Backend connection failed';
        };

        ws.onclose = () => {
          isConnected = false;
          connectionStatus.classList.remove('connected');
          connectionStatus.querySelector('.status-text').textContent = 'Disconnected';
        };
      } else {
        // Already connected, start recording directly
        startActualRecording();
      }
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      connectionStatus.classList.add('error');
      connectionStatus.querySelector('.status-text').textContent = 'Backend connection failed';
    }
  } else if (event.data.action === 'microphoneAccessDenied') {
    connectionStatus.classList.add('error');
    
    // Show detailed error message
    const errorText = event.data.error || 'Microphone access denied';
    const suggestion = event.data.suggestion || '';
    
    connectionStatus.querySelector('.status-text').textContent = errorText;
    
    // Show suggestion to user if available
    if (suggestion) {
      // Create a notification area for suggestions
      let suggestionDiv = document.getElementById('errorSuggestion');
      if (!suggestionDiv) {
        suggestionDiv = document.createElement('div');
        suggestionDiv.id = 'errorSuggestion';
        suggestionDiv.style.cssText = `
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
          font-size: 12px;
        `;
        connectionStatus.parentNode.insertBefore(suggestionDiv, connectionStatus.nextSibling);
      }
      suggestionDiv.textContent = `💡 ${suggestion}`;
    }
  } else if (event.data.action === 'audioChunkReady') {
    // Handle audio chunk from content script
    await sendAudioChunk(event.data.audioBlob);
  } else if (event.data.action === 'microphoneAccessStatus') {
    // Handle microphone access status check result
    if (event.data.hasAccess) {
      connectionStatus.classList.remove('error');
      connectionStatus.querySelector('.status-text').textContent = 'Audio access available';
      startRecordingBtn.disabled = false;
    } else {
      connectionStatus.classList.add('error');
      connectionStatus.querySelector('.status-text').textContent = 'Audio access required';
      startRecordingBtn.disabled = true;
    }
  }
});

function startActualRecording() {
  try {
    // Tell content script to start recording with the stream it already has
    window.parent.postMessage({
      action: 'startRecordingWithStream',
      chunkInterval: 5000
    }, '*');

    isRecording = true;

    // Update UI
    startRecordingBtn.classList.add('hidden');
    stopRecordingBtn.classList.remove('hidden');
    visualizer.classList.remove('hidden');
    connectionStatus.classList.add('recording');
    connectionStatus.querySelector('.status-text').textContent = 'Recording...';

    // Clear previous transcript
    transcript.innerHTML = '';

  } catch (error) {
    console.error('Failed to start actual recording:', error);
    connectionStatus.classList.add('error');
    connectionStatus.querySelector('.status-text').textContent = 'Recording setup failed';
  }
}

stopRecordingBtn.addEventListener('click', () => {
  // Send message to content script to stop recording
  window.parent.postMessage({ action: 'stopRecording' }, '*');
  
  isRecording = false;
  startRecordingBtn.classList.remove('hidden');
  stopRecordingBtn.classList.add('hidden');
  visualizer.classList.add('hidden');
  connectionStatus.classList.remove('recording');
  connectionStatus.querySelector('.status-text').textContent = 'Connected';
  
  // Generate summary (mock)
  setTimeout(() => {
    showSummary();
  }, 1000);
});

function handleTranscriptUpdate(data) {
  if (data.type === 'transcript') {
    const item = document.createElement('div');
    item.className = 'transcript-item';
    item.innerHTML = `
      <div class="speaker-info">
        <div class="speaker-badge">${data.speaker.slice(-1)}</div>
        <span class="speaker-name">${data.speaker}</span>
        <span class="timestamp">${data.timestamp}</span>
      </div>
      <p class="transcript-text">${data.text}</p>
    `;
    transcript.appendChild(item);
    transcript.scrollTop = transcript.scrollHeight;
  }
}

async function sendAudioChunk(audioBlob) {
  if (!isConnected) {
    console.warn('Not connected to backend, skipping chunk upload');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('chunk', audioBlob, 'chunk.webm');

    const response = await fetch('http://localhost:8000/api/process-browser-extension-chunk', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      console.error('Failed to upload audio chunk:', response.statusText);
    }
  } catch (error) {
    console.error('Error uploading audio chunk:', error);
  }
}

function showSummary() {
  summary.classList.remove('hidden');
  summary.querySelector('.summary-content').innerHTML = `
    <div class="summary-section">
      <h4>Key Points</h4>
      <ul>
        <li>Meeting objectives were clearly defined</li>
        <li>Team discussed Q1 goals and milestones</li>
        <li>Budget allocation was reviewed and approved</li>
      </ul>
    </div>
    <div class="summary-section">
      <h4>Action Items</h4>
      <ul>
        <li>John to prepare project report by Friday</li>
        <li>Sarah to schedule follow-up meeting</li>
        <li>Team to review updated documentation</li>
      </ul>
    </div>
  `;
}

// Offline Mode - File Upload
uploadZone.addEventListener('click', () => {
  fileInput.click();
});

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = '#667eea';
  uploadZone.style.background = '#f8f9fc';
});

uploadZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = '#cbd5e1';
  uploadZone.style.background = '';
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = '#cbd5e1';
  uploadZone.style.background = '';
  
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFileSelect(file);
});

function handleFileSelect(file) {
  const validTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg'];
  if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
    alert('Please select a valid audio file (MP3, WAV, or M4A)');
    return;
  }
  
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
  
  fileInfo.classList.remove('hidden');
  processBtn.classList.remove('hidden');
}

processBtn.addEventListener('click', () => {
  processBtn.classList.add('hidden');
  progressBar.classList.remove('hidden');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${progress}%`;
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        showOfflineResults();
      }, 500);
    }
  }, 300);
});

function showOfflineResults() {
  const offlineTranscript = document.getElementById('offlineTranscript');
  const offlineTranscriptContent = document.getElementById('offlineTranscriptContent');
  const offlineSummary = document.getElementById('offlineSummary');
  const offlineSummaryContent = document.getElementById('offlineSummaryContent');
  
  // Show transcript
  offlineTranscript.classList.remove('hidden');
  offlineTranscriptContent.innerHTML = `
    <div class="transcript-item">
      <div class="speaker-info">
        <div class="speaker-badge">1</div>
        <span class="speaker-name">Speaker 1</span>
        <span class="timestamp">00:00:12</span>
      </div>
      <p class="transcript-text">Welcome everyone to today's meeting. Let's review the project progress.</p>
    </div>
    <div class="transcript-item">
      <div class="speaker-info">
        <div class="speaker-badge">2</div>
        <span class="speaker-name">Speaker 2</span>
        <span class="timestamp">00:00:28</span>
      </div>
      <p class="transcript-text">Thanks for having me. I've completed the analysis and prepared the report.</p>
    </div>
    <div class="transcript-item">
      <div class="speaker-info">
        <div class="speaker-badge">1</div>
        <span class="speaker-name">Speaker 1</span>
        <span class="timestamp">00:00:42</span>
      </div>
      <p class="transcript-text">Great work! Let's go through the key findings together.</p>
    </div>
  `;
  
  // Show summary
  offlineSummary.classList.remove('hidden');
  offlineSummaryContent.innerHTML = `
    <div class="summary-section">
      <h4>Key Points</h4>
      <ul>
        <li>Project analysis completed successfully</li>
        <li>Key findings presented and discussed</li>
        <li>Team alignment on next steps</li>
      </ul>
    </div>
    <div class="summary-section">
      <h4>Action Items</h4>
      <ul>
        <li>Finalize report by end of week</li>
        <li>Schedule follow-up meeting</li>
        <li>Share findings with stakeholders</li>
      </ul>
    </div>
  `;
}

// Load saved preferences
chrome.storage.local.get(['preferredMode'], (result) => {
  if (result.preferredMode) {
    switchMode(result.preferredMode);
  }
});

// Save preferences on mode change
window.addEventListener('beforeunload', () => {
  chrome.storage.local.set({ preferredMode: currentMode });
});
