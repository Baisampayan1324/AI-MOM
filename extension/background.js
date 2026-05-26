const STORAGE_KEY = 'enabledTabs';
const enabledTabs = new Set();
let stateLoaded = false;

async function loadEnabledTabs() {
  if (stateLoaded) return;
  try {
    const stored = await chrome.storage.session.get(STORAGE_KEY);
    const list = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
    enabledTabs.clear();
    list.forEach((id) => enabledTabs.add(id));
  } catch (error) {
    console.warn('Failed to load enabled tabs from session storage:', error);
  }
  stateLoaded = true;
}

async function persistEnabledTabs() {
  try {
    await chrome.storage.session.set({ [STORAGE_KEY]: Array.from(enabledTabs) });
  } catch (error) {
    console.warn('Failed to persist enabled tabs:', error);
  }
}

async function enablePanelForTab(tabId) {
  try {
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: true,
      path: 'panel/panel.html'
    });
  } catch (error) {
    console.warn('enablePanelForTab failed:', error);
  }
  enabledTabs.add(tabId);
  await persistEnabledTabs();
}

async function disablePanelForTab(tabId) {
  try {
    await chrome.sidePanel.setOptions({ tabId, enabled: false });
  } catch (error) {
    // Tab might already be gone — ignore
  }
  if (enabledTabs.delete(tabId)) {
    await persistEnabledTabs();
  }
}

async function applyPanelBehavior() {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  } catch (error) {
    console.warn('Failed to set panel behavior:', error);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({
    backendUrl: 'http://localhost:8000',
    autoOpenSidebar: true
  });
  await applyPanelBehavior();
});

chrome.runtime.onStartup.addListener(() => {
  loadEnabledTabs();
  applyPanelBehavior();
});
loadEnabledTabs();
applyPanelBehavior();

chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id || tab.windowId == null) return;
  const tabId = tab.id;
  const windowId = tab.windowId;

  // Fire open() synchronously with windowId — does NOT require prior per-tab enable,
  // so first click works without the 2x-click bug.
  try {
    const opening = chrome.sidePanel.open({ windowId });
    if (opening && typeof opening.catch === 'function') {
      opening.catch((error) => console.error('Failed to open side panel:', error));
    }
  } catch (error) {
    console.error('sidePanel.open threw:', error);
  }

  // Background work: register this tab as enabled with our path.
  (async () => {
    await loadEnabledTabs();
    await enablePanelForTab(tabId);
  })().catch((error) => console.error('Failed to configure side panel:', error));
});

chrome.tabs.onCreated.addListener(async (tab) => {
  if (!tab?.id) return;
  await loadEnabledTabs();
  if (enabledTabs.has(tab.id)) return;
  try {
    await chrome.sidePanel.setOptions({ tabId: tab.id, enabled: false });
  } catch (error) {
    // Some special tabs reject setOptions — ignore.
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await loadEnabledTabs();
  try {
    if (enabledTabs.has(tabId)) {
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: true,
        path: 'panel/panel.html'
      });
    } else {
      await chrome.sidePanel.setOptions({ tabId, enabled: false });
    }
  } catch (error) {
    // Some tabs (chrome://, devtools) reject setOptions — safe to ignore.
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await loadEnabledTabs();
  if (enabledTabs.delete(tabId)) {
    await persistEnabledTabs();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === 'openSidePanel') {
    const tabId = sender?.tab?.id;
    if (!tabId) {
      sendResponse({ success: false, error: 'No active tab found' });
      return true;
    }
    loadEnabledTabs()
      .then(() => enablePanelForTab(tabId))
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message?.action === 'closeSidePanel') {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
      const tabId = tabs?.[0]?.id;
      if (!tabId) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      try {
        await loadEnabledTabs();
        await disablePanelForTab(tabId);
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    return true;
  }

  if (message?.action === 'ping') {
    sendResponse({ success: true, timestamp: Date.now() });
  }
});
