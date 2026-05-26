const setupOverlay = document.getElementById('setup-overlay');
const setupBackendInput = document.getElementById('setup-backend');
const setupGroqInput = document.getElementById('setup-groq');
const setupOpenRouterInput = document.getElementById('setup-openrouter');
const setupHfInput = document.getElementById('setup-hf');
const setupSaveBtn = document.getElementById('setup-save');
const setupSkipBtn = document.getElementById('setup-skip');
const setupStatus = document.getElementById('setup-status');

const mainShell = document.getElementById('main-shell');
const backendUrlInput = document.getElementById('backend-url');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const statusDetail = document.getElementById('status-detail');
const saveBtn = document.getElementById('save-btn');
const testBtn = document.getElementById('test-btn');
const shareBtn = document.getElementById('share-btn');
const stopShareBtn = document.getElementById('stop-share-btn');
const uploadBtn = document.getElementById('upload-btn');
const toggleBtn = document.getElementById('toggle-btn');
const resetKeysBtn = document.getElementById('reset-keys-btn');
const clearTranscriptBtn = document.getElementById('clear-transcript-btn');
const liveState = document.getElementById('live-state');
const recordPill = document.getElementById('record-pill');
const fileInput = document.getElementById('audio-file');
const transcriptList = document.getElementById('transcript-list');
const fileName = document.getElementById('file-name');

const TARGET_SAMPLE_RATE = 16000;
const PCM_CHUNK_SAMPLES = 4096;
const SPEAKER_TURN_GAP_MS = 2500;
const MAX_SPEAKER = 5;

let audioSocket = null;
let captureStream = null;
let audioContext = null;
let audioWorkletSource = null;
let audioWorkletNode = null;
let silentGain = null;
let passthroughGain = null;
let currentSpeakerId = 1;
let lastUtteranceTs = 0;
let lastEntryNode = null;
let lastEntrySpeaker = null;
let sessionTurns = [];
let sessionInProgress = false;

function normalizeUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getBackendUrl() {
  return normalizeUrl(backendUrlInput.value) || 'http://localhost:8000';
}

function getWsUrl() {
  return getBackendUrl().replace(/^http/, 'ws') + '/ws/audio';
}

function setStatus(kind, title, detail) {
  statusDot.className = 'status-dot';
  if (kind) {
    statusDot.classList.add(kind);
  }
  statusText.textContent = title;
  statusDetail.textContent = detail;
}

function setLiveState(text, tone = 'ready') {
  liveState.textContent = text;
  liveState.className = `live-state ${tone}`;
}

function setRecordPill(state) {
  recordPill.className = `pill ${state}`;
  recordPill.textContent = state === 'live' ? 'Live' : state === 'paused' ? 'Paused' : 'Idle';
}

function clearTranscript() {
  transcriptList.innerHTML = '<div class="transcript-empty">No transcriptions yet. Start recording to see speaker turns.</div>';
  lastEntryNode = null;
  lastEntrySpeaker = null;
  currentSpeakerId = 1;
  lastUtteranceTs = 0;
  sessionTurns = [];
}

function resolveSpeakerId(rawId) {
  const now = Date.now();
  const gap = lastUtteranceTs ? now - lastUtteranceTs : 0;
  let speakerId;

  if (typeof rawId === 'number' && rawId > 0 && rawId <= MAX_SPEAKER) {
    speakerId = rawId;
  } else if (lastUtteranceTs && gap > SPEAKER_TURN_GAP_MS) {
    // After long pause, rotate to the next speaker number for visual variety.
    currentSpeakerId = (currentSpeakerId % MAX_SPEAKER) + 1;
    speakerId = currentSpeakerId;
  } else {
    speakerId = currentSpeakerId;
  }

  currentSpeakerId = speakerId;
  lastUtteranceTs = now;
  return speakerId;
}

function appendSpeakerTurn(text, speakerId, meta = '') {
  const emptyState = transcriptList.querySelector('.transcript-empty');
  if (emptyState) emptyState.remove();

  const time = new Date().toLocaleTimeString();

  if (sessionInProgress) {
    sessionTurns.push({ speaker: speakerId, text, ts: Date.now() });
  }

  if (lastEntryNode && lastEntrySpeaker === speakerId) {
    // Append to current speaker bubble.
    const textNode = lastEntryNode.querySelector('.transcript-text');
    textNode.textContent = `${textNode.textContent} ${text}`.trim();
    const timeNode = lastEntryNode.querySelector('.speaker-time');
    if (timeNode) timeNode.textContent = `${time}${meta ? ` • ${meta}` : ''}`;
    return;
  }

  const entry = document.createElement('div');
  entry.className = `transcript-entry speaker-${speakerId}`;

  const header = document.createElement('div');
  header.className = 'speaker-header';

  const tag = document.createElement('span');
  tag.className = `speaker-tag speaker-${speakerId}`;
  tag.textContent = `Speaker ${speakerId}`;
  header.appendChild(tag);

  const timeEl = document.createElement('span');
  timeEl.className = 'speaker-time';
  timeEl.textContent = `${time}${meta ? ` • ${meta}` : ''}`;
  header.appendChild(timeEl);

  const body = document.createElement('div');
  body.className = 'transcript-text';
  body.textContent = text;

  entry.appendChild(header);
  entry.appendChild(body);

  transcriptList.insertBefore(entry, transcriptList.firstChild);

  lastEntryNode = entry;
  lastEntrySpeaker = speakerId;
}

function appendStructuredOutput(title, items) {
  const emptyState = transcriptList.querySelector('.transcript-empty');
  if (emptyState) emptyState.remove();

  const entry = document.createElement('div');
  entry.className = 'transcript-entry transcript-structured';

  const titleNode = document.createElement('div');
  titleNode.className = 'speaker-header';
  const tag = document.createElement('span');
  tag.className = 'speaker-tag speaker-1';
  tag.textContent = title;
  titleNode.appendChild(tag);
  const timeEl = document.createElement('span');
  timeEl.className = 'speaker-time';
  timeEl.textContent = new Date().toLocaleTimeString();
  titleNode.appendChild(timeEl);
  entry.appendChild(titleNode);

  const list = document.createElement('ol');
  list.className = 'summary-list';
  items.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    list.appendChild(listItem);
  });
  entry.appendChild(list);

  transcriptList.insertBefore(entry, transcriptList.firstChild);
  lastEntryNode = null;
  lastEntrySpeaker = null;
}

function appendMeetingSummary(data) {
  const summary = [];
  if (data.speaker_count != null) summary.push(`Speaker count: ${data.speaker_count}`);
  if (Array.isArray(data.key_points) && data.key_points.length > 0) {
    summary.push(`Key points: ${data.key_points.join(' | ')}`);
  }
  if (Array.isArray(data.action_items) && data.action_items.length > 0) {
    summary.push(`Action items: ${data.action_items.join(' | ')}`);
  }
  if (data.conclusion) summary.push(`Conclusion: ${data.conclusion}`);
  if (summary.length > 0) appendStructuredOutput('Meeting summary', summary);
}

function renderSummarySection(title, items, options = {}) {
  if (!items || items.length === 0) return '';
  const ordered = options.ordered ? 'ol' : 'ul';
  return `
    <div class="summary-section">
      <h3 class="summary-title">${title}</h3>
      <${ordered} class="summary-list">
        ${items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join('')}
      </${ordered}>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderSpeakerParticipation(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  const rows = list.map((entry) => {
    const speaker = escapeHtml(entry.speaker || 'Speaker');
    const contribution = escapeHtml(entry.contribution || '');
    const speakerMatch = /Speaker\s+(\d+)/i.exec(entry.speaker || '');
    const idx = speakerMatch ? Math.min(parseInt(speakerMatch[1], 10), MAX_SPEAKER) : 1;
    return `
      <li class="participation-row">
        <span class="speaker-tag speaker-${idx}">${speaker}</span>
        <span class="participation-text">${contribution}</span>
      </li>
    `;
  }).join('');
  return `
    <div class="summary-section">
      <h3 class="summary-title">Speaker participation</h3>
      <ul class="participation-list">${rows}</ul>
    </div>
  `;
}

function computeSpeakerStats() {
  const stats = new Map();
  sessionTurns.forEach((turn) => {
    const key = `Speaker ${turn.speaker}`;
    const wordCount = (turn.text || '').trim().split(/\s+/).filter(Boolean).length;
    const cur = stats.get(key) || { speaker: key, turns: 0, words: 0 };
    cur.turns += 1;
    cur.words += wordCount;
    stats.set(key, cur);
  });
  return Array.from(stats.values());
}

function buildSpeakerLabelledTranscript() {
  let buffer = '';
  let currentSpeaker = null;
  sessionTurns.forEach((turn) => {
    if (turn.speaker !== currentSpeaker) {
      if (buffer) buffer += '\n';
      buffer += `Speaker ${turn.speaker}: ${turn.text}`;
      currentSpeaker = turn.speaker;
    } else {
      buffer += ` ${turn.text}`;
    }
  });
  return buffer.trim();
}

function appendSummaryCard(data, speakerStats) {
  const emptyState = transcriptList.querySelector('.transcript-empty');
  if (emptyState) emptyState.remove();

  const entry = document.createElement('div');
  entry.className = 'transcript-entry summary-card';

  const speakerCount = data.speaker_count || speakerStats.length || 0;
  const time = new Date().toLocaleTimeString();

  const fullSummary = data.full_summary ? `<p class="summary-body">${escapeHtml(data.full_summary)}</p>` : '';
  const conclusion = data.conclusion ? `
    <div class="summary-section">
      <h3 class="summary-title">Conclusion</h3>
      <p class="summary-body">${escapeHtml(data.conclusion)}</p>
    </div>
  ` : '';

  entry.innerHTML = `
    <div class="summary-card-head">
      <span class="speaker-tag speaker-1">Meeting Summary</span>
      <span class="speaker-time">${time}${speakerCount ? ` • ${speakerCount} speaker(s)` : ''}</span>
    </div>
    ${fullSummary}
    ${renderSummarySection('Key points', data.key_points || [])}
    ${renderSummarySection('Key decisions', data.key_decisions || [])}
    ${renderSummarySection('Action items', data.action_items || [], { ordered: true })}
    ${renderSpeakerParticipation(data.speaker_participation || [])}
    ${conclusion}
  `;

  transcriptList.insertBefore(entry, transcriptList.firstChild);
  lastEntryNode = null;
  lastEntrySpeaker = null;
}

async function requestSummaryForSession() {
  const transcript = buildSpeakerLabelledTranscript();
  if (!transcript || transcript.length < 20) {
    setStatus('warn', 'No transcript', 'Recording was too short to summarize.');
    return;
  }

  setStatus('warn', 'Summarizing', 'Generating meeting summary...');
  setLiveState('Generating summary...', 'ready');

  const speakerStats = computeSpeakerStats();

  try {
    const response = await fetch(`${getBackendUrl()}/api/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcription: transcript,
        speaker_stats: speakerStats,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`HTTP ${response.status}: ${detail}`);
    }
    const data = await response.json();
    appendSummaryCard(data, speakerStats);
    setStatus('ok', 'Summary ready', 'Meeting summary generated.');
    setLiveState('Summary ready.', 'ready');
  } catch (error) {
    setStatus('warn', 'Summary failed', error.message || 'Could not generate summary.');
    setLiveState('Summary failed.', 'ready');
  }
}

function updateToggleButton(isOpen) {
  toggleBtn.textContent = isOpen ? '−' : '+';
  toggleBtn.title = isOpen ? 'Close sidebar' : 'Reopen sidebar';
}


async function loadStoredSettings() {
  const stored = await chrome.storage.sync.get({
    backendUrl: 'http://localhost:8000',
    keysConfigured: false,
  });
  backendUrlInput.value = stored.backendUrl;
  setupBackendInput.value = stored.backendUrl;
  return stored;
}

async function saveBackendSetting() {
  const backendUrl = getBackendUrl();
  await chrome.storage.sync.set({ backendUrl });
  backendUrlInput.value = backendUrl;
  setStatus('warn', 'Saved', 'Backend URL stored locally.');
}

/* ============ BYOK setup ============ */
function showSetup(message) {
  setupOverlay.hidden = false;
  mainShell.hidden = true;
  if (message) {
    setupStatus.textContent = message;
    setupStatus.className = 'setup-status muted';
  }
}

function hideSetup() {
  setupOverlay.hidden = true;
  mainShell.hidden = false;
}

async function checkBackendKeyStatus(backendUrl) {
  try {
    const response = await fetch(`${backendUrl}/api/keys/status`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function decideSetupVisibility() {
  const { keysConfigured, backendUrl } = await loadStoredSettings();
  const status = await checkBackendKeyStatus(backendUrl);
  const backendHasKeys = status && status.groq_configured && status.openrouter_configured;

  if (keysConfigured && backendHasKeys) {
    hideSetup();
  } else if (backendHasKeys) {
    // Backend already has keys; let user enter the app but offer reset.
    await chrome.storage.sync.set({ keysConfigured: true });
    hideSetup();
  } else {
    showSetup(status ? 'Backend reachable. Add API keys to enable transcription.' : 'Backend unreachable. Start it, then add keys.');
  }
}

async function submitApiKeys() {
  const backendUrl = normalizeUrl(setupBackendInput.value) || 'http://localhost:8000';
  const groq = setupGroqInput.value.trim();
  const openrouter = setupOpenRouterInput.value.trim();
  const hf = setupHfInput.value.trim();

  if (!groq || !openrouter) {
    setupStatus.textContent = 'Groq and OpenRouter keys are both required.';
    setupStatus.className = 'setup-status error';
    return;
  }

  setupSaveBtn.disabled = true;
  setupStatus.textContent = 'Saving keys to backend...';
  setupStatus.className = 'setup-status muted';

  try {
    const response = await fetch(`${backendUrl}/api/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groq_api_key: groq,
        openrouter_api_key: openrouter,
        huggingface_token: hf || undefined,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`HTTP ${response.status}: ${detail}`);
    }

    await chrome.storage.sync.set({
      backendUrl,
      keysConfigured: true,
    });

    backendUrlInput.value = backendUrl;
    setupStatus.textContent = 'Saved. Loading sidebar...';
    setupStatus.className = 'setup-status success';
    setTimeout(() => {
      hideSetup();
      setStatus('ok', 'Keys saved', 'Click Connect to verify the backend.');
    }, 600);
  } catch (error) {
    setupStatus.textContent = error.message || 'Failed to save keys.';
    setupStatus.className = 'setup-status error';
  } finally {
    setupSaveBtn.disabled = false;
  }
}

async function skipSetup() {
  const backendUrl = normalizeUrl(setupBackendInput.value) || 'http://localhost:8000';
  await chrome.storage.sync.set({ backendUrl, keysConfigured: true });
  backendUrlInput.value = backendUrl;
  hideSetup();
}

/* ============ Audio / WebSocket ============ */
function floatTo16BitPCM(float32) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i += 1) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function int16ToBase64(int16) {
  const bytes = new Uint8Array(int16.buffer, int16.byteOffset, int16.byteLength);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function sendPcmChunk(float32) {
  if (!audioSocket || audioSocket.readyState !== WebSocket.OPEN) return;
  if (!float32 || float32.length === 0) return;
  const int16 = floatTo16BitPCM(float32);
  const base64 = int16ToBase64(int16);
  audioSocket.send(JSON.stringify({
    type: 'audio_chunk_base64',
    data: base64,
    sample_rate: TARGET_SAMPLE_RATE,
    timestamp: Date.now(),
    language: 'en'
  }));
}

function connectWebSocket() {
  if (audioSocket && (audioSocket.readyState === WebSocket.OPEN || audioSocket.readyState === WebSocket.CONNECTING)) {
    return audioSocket;
  }

  audioSocket = new WebSocket(getWsUrl());

  audioSocket.onopen = () => {
    setStatus('ok', 'Connected', 'Ready for live transcription.');
    setLiveState('Listening for live transcription...', 'listening');
  };

  audioSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'transcription' && data.text) {
        const speakerId = resolveSpeakerId(data.speaker_id);
        const conf = data.confidence ? `${Math.round(data.confidence * 100)}% conf` : '';
        appendSpeakerTurn(data.text, speakerId, conf);
        setStatus('ok', 'Live transcription', 'Backend returned text from the live stream.');
        setLiveState('Live transcription is active.', 'listening');
      }
      if (data.type === 'control_ack' && data.status) {
        setStatus(data.status === 'stopped' ? 'warn' : 'ok', data.status === 'stopped' ? 'Stopped' : 'Recording', `Backend acknowledged ${data.action}.`);
      }
      if (data.type === 'error') {
        setStatus('warn', 'Backend error', data.message || 'Backend returned an error.');
      }
    } catch (error) {
      console.warn('Failed to parse websocket message:', error);
    }
  };

  audioSocket.onerror = () => {
    setStatus('warn', 'Offline', 'WebSocket connection failed. Start the backend first.');
  };

  audioSocket.onclose = () => {
    setLiveState('Idle', 'ready');
    setRecordPill('idle');
  };

  return audioSocket;
}

function teardownAudioGraph() {
  try {
    if (audioWorkletNode) {
      try { audioWorkletNode.port.onmessage = null; } catch (e) {}
      try { audioWorkletNode.port.close(); } catch (e) {}
      audioWorkletNode.disconnect();
    }
    if (audioWorkletSource) audioWorkletSource.disconnect();
    if (silentGain) silentGain.disconnect();
    if (passthroughGain) passthroughGain.disconnect();
    if (audioContext && audioContext.state !== 'closed') audioContext.close();
  } catch (error) {
    console.warn('Audio graph teardown error:', error);
  }
  audioWorkletNode = null;
  audioWorkletSource = null;
  silentGain = null;
  passthroughGain = null;
  audioContext = null;
}

async function buildPcmGraph(stream) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)({
    sampleRate: TARGET_SAMPLE_RATE,
    latencyHint: 'interactive'
  });

  const workletUrl = chrome.runtime.getURL('panel/pcm-worklet.js');
  await audioContext.audioWorklet.addModule(workletUrl);

  audioWorkletSource = audioContext.createMediaStreamSource(stream);
  audioWorkletNode = new AudioWorkletNode(audioContext, 'pcm-processor', {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    processorOptions: { chunkSize: PCM_CHUNK_SAMPLES }
  });
  audioWorkletNode.port.onmessage = (event) => {
    if (event.data instanceof Float32Array) {
      sendPcmChunk(event.data);
    }
  };

  // Muted sink keeps the worklet scheduled.
  silentGain = audioContext.createGain();
  silentGain.gain.value = 0;
  audioWorkletSource.connect(audioWorkletNode);
  audioWorkletNode.connect(silentGain);
  silentGain.connect(audioContext.destination);

  // Passthrough so user still hears tab audio (tabCapture mutes by default).
  passthroughGain = audioContext.createGain();
  passthroughGain.gain.value = 1.0;
  audioWorkletSource.connect(passthroughGain);
  passthroughGain.connect(audioContext.destination);
}

function getTabCaptureStreamId(targetTabId) {
  return new Promise((resolve, reject) => {
    if (!chrome.tabCapture || !chrome.tabCapture.getMediaStreamId) {
      reject(new Error('tabCapture API unavailable'));
      return;
    }
    try {
      chrome.tabCapture.getMediaStreamId({ targetTabId }, (streamId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!streamId) {
          reject(new Error('Empty streamId from tabCapture'));
          return;
        }
        resolve(streamId);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function startCapture() {
  if (captureStream) return;
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!activeTab?.id) throw new Error('No active tab found.');

    const streamId = await getTabCaptureStreamId(activeTab.id);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: false
    });

    captureStream = stream;
    connectWebSocket();
    shareBtn.disabled = true;
    stopShareBtn.disabled = false;
    sessionTurns = [];
    sessionInProgress = true;
    setRecordPill('live');
    setStatus('ok', 'Recording', 'Tab audio streaming to backend.');
    setLiveState('Listening for live transcription...', 'listening');

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      stopCapture();
      setStatus('warn', 'No audio', 'Active tab has no audio.');
      setLiveState('No audio track available.', 'ready');
      return;
    }

    await buildPcmGraph(stream);
    audioTracks[0].addEventListener('ended', stopCapture);
  } catch (error) {
    captureStream = null;
    shareBtn.disabled = false;
    stopShareBtn.disabled = true;
    setRecordPill('idle');
    setStatus('warn', 'Capture failed', error.message || 'Could not capture tab audio.');
    setLiveState('Idle', 'ready');
  }
}

function stopCapture() {
  if (!captureStream) return;
  teardownAudioGraph();
  captureStream.getTracks().forEach((track) => track.stop());
  captureStream = null;
  shareBtn.disabled = false;
  stopShareBtn.disabled = true;
  setRecordPill('idle');

  if (audioSocket && audioSocket.readyState === WebSocket.OPEN) {
    try {
      audioSocket.send(JSON.stringify({
        type: 'control',
        action: 'stop',
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to send stop control:', error);
    }
  }

  setStatus('warn', 'Recording stopped', 'Generating meeting summary...');
  setLiveState('Idle', 'ready');

  const wasInSession = sessionInProgress;
  sessionInProgress = false;
  if (wasInSession && sessionTurns.length > 0) {
    requestSummaryForSession();
  }
}

function uploadAudioFile() {
  fileInput.click();
}

async function processSelectedFile(file) {
  if (!file) return;
  fileName.textContent = file.name;
  setStatus('warn', 'Uploading', `Processing ${file.name}...`);

  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${getBackendUrl()}/api/process-audio`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const preview = data.transcription || data.full_summary || 'File processed successfully.';
    const speakerId = resolveSpeakerId(1);
    appendSpeakerTurn(preview, speakerId, 'upload');
    appendMeetingSummary(data);
    setLiveState('Upload processed.', 'ready');
    setStatus('ok', 'Processed', 'Audio file processed successfully.');
  } catch (error) {
    setStatus('warn', 'Upload failed', error.message || 'Could not upload audio file.');
  }
}

function toggleSidebar() {
  chrome.runtime.sendMessage({ action: 'closeSidePanel' }).then((response) => {
    if (!response?.success) {
      throw new Error(response?.error || 'Could not close the sidebar.');
    }
    updateToggleButton(false);
    setStatus('warn', 'Sidebar closed', 'Click the extension icon to reopen it.');
  }).catch((error) => {
    setStatus('warn', 'Close failed', error.message || 'Could not close the sidebar.');
  });
}

/* ============ Event wiring ============ */
saveBtn.addEventListener('click', () => {
  saveBackendSetting().catch((error) => {
    setStatus('warn', 'Save failed', error.message || 'Could not store settings.');
  });
});

testBtn.addEventListener('click', () => {
  const backendUrl = getBackendUrl();
  setStatus('warn', 'Connecting', 'Checking backend health...');

  // Force-close any stale socket so reconnect actually happens.
  if (audioSocket && audioSocket.readyState !== WebSocket.OPEN && audioSocket.readyState !== WebSocket.CONNECTING) {
    try { audioSocket.close(); } catch (e) {}
    audioSocket = null;
  }

  fetch(`${backendUrl}/health`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      setStatus('ok', 'Connected', `Backend says ${data.status || 'healthy'}. Opening WebSocket...`);
      connectWebSocket();
    })
    .catch((error) => {
      setStatus('warn', 'Offline', error.message || 'Backend health check failed.');
    });
});

shareBtn.addEventListener('click', startCapture);
stopShareBtn.addEventListener('click', stopCapture);
uploadBtn.addEventListener('click', uploadAudioFile);
toggleBtn.addEventListener('click', toggleSidebar);
clearTranscriptBtn.addEventListener('click', clearTranscript);

resetKeysBtn.addEventListener('click', async () => {
  await chrome.storage.sync.set({ keysConfigured: false });
  setupGroqInput.value = '';
  setupOpenRouterInput.value = '';
  setupHfInput.value = '';
  setupStatus.textContent = 'Update keys, then save to continue.';
  setupStatus.className = 'setup-status muted';
  showSetup();
});

setupSaveBtn.addEventListener('click', () => {
  submitApiKeys();
});

setupSkipBtn.addEventListener('click', () => {
  skipSetup();
});

[setupGroqInput, setupOpenRouterInput, setupHfInput].forEach((el) => {
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitApiKeys();
  });
});

fileInput.addEventListener('change', (event) => {
  const [file] = event.target.files || [];
  processSelectedFile(file);
  event.target.value = '';
});

backendUrlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') saveBackendSetting();
});

(async () => {
  updateToggleButton(true);
  setLiveState('Idle', 'ready');
  setRecordPill('idle');
  setStatus('warn', 'Ready', 'Click Connect, then Start.');
  await decideSetupVisibility();
})();
