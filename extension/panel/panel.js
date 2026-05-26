const backendUrlInput = document.getElementById('backend-url');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const statusDetail = document.getElementById('status-detail');
const saveBtn = document.getElementById('save-btn');
const testBtn = document.getElementById('test-btn');

function normalizeUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function setStatus(kind, title, detail) {
  statusDot.className = 'status-dot';
  if (kind) {
    statusDot.classList.add(kind);
  }
  statusText.textContent = title;
  statusDetail.textContent = detail;
}

async function loadSettings() {
  const { backendUrl = 'http://localhost:8000' } = await chrome.storage.sync.get({
    backendUrl: 'http://localhost:8000'
  });

  backendUrlInput.value = backendUrl;
}

async function saveSettings() {
  const backendUrl = normalizeUrl(backendUrlInput.value) || 'http://localhost:8000';
  await chrome.storage.sync.set({ backendUrl });
  backendUrlInput.value = backendUrl;
  setStatus('warn', 'Saved', 'Settings stored locally. Run a health check next.');
}

async function testBackend() {
  const backendUrl = normalizeUrl(backendUrlInput.value) || 'http://localhost:8000';
  setStatus('warn', 'Checking...', `Testing ${backendUrl}/health`);
  testBtn.disabled = true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));
    setStatus('ok', 'Connected', data.status ? `Backend says: ${data.status}` : 'Backend health check passed.');
    await chrome.storage.sync.set({ backendUrl });
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'Request timed out. Is the backend running?'
      : error.message || 'Unable to reach backend.';
    setStatus('warn', 'Offline', message);
  } finally {
    testBtn.disabled = false;
  }
}

saveBtn.addEventListener('click', () => {
  saveSettings().catch((error) => {
    setStatus('warn', 'Save failed', error.message || 'Could not store settings.');
  });
});

testBtn.addEventListener('click', () => {
  testBackend().catch((error) => {
    setStatus('warn', 'Check failed', error.message || 'Could not test backend.');
  });
});

backendUrlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    saveSettings();
  }
});

(async () => {
  await loadSettings();
  setStatus('warn', 'Ready', 'Save the backend URL or run a health check.');
})();