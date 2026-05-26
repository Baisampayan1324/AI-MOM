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

async function syncAllTabsPanelState() {
  await loadEnabledTabs();
  let tabs = [];
  try {
    tabs = await chrome.tabs.query({});
  } catch (error) {
    console.warn('Failed to query tabs:', error);
    return;
  }
  for (const tab of tabs) {
    if (!tab.id) continue;
    try {
      if (enabledTabs.has(tab.id)) {
        await chrome.sidePanel.setOptions({
          tabId: tab.id,
          enabled: true,
          path: 'panel/panel.html'
        });
      } else {
        await chrome.sidePanel.setOptions({ tabId: tab.id, enabled: false });
      }
    } catch (error) {
      // chrome://, devtools, etc. — ignore.
    }
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({
    backendUrl: 'http://localhost:8000',
    autoOpenSidebar: true
  });
  await applyPanelBehavior();
  await syncAllTabsPanelState();
});

chrome.runtime.onStartup.addListener(async () => {
  await loadEnabledTabs();
  await applyPanelBehavior();
  await syncAllTabsPanelState();
});
loadEnabledTabs().then(() => syncAllTabsPanelState());
applyPanelBehavior();

chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) return;
  const tabId = tab.id;

  try {
    chrome.sidePanel.setOptions({ tabId, enabled: true, path: 'panel/panel.html' })
      .catch((error) => console.warn('setOptions failed in click:', error));
    chrome.sidePanel.open({ tabId })
      .catch((error) => console.error('Failed to open side panel:', error));
  } catch (error) {
    console.error('sidePanel call threw:', error);
  }

  enabledTabs.add(tabId);
  loadEnabledTabs()
    .then(() => persistEnabledTabs())
    .catch((error) => console.error('Failed to persist enabled tabs:', error));

  setFloatingButtonVisibility(false, tabId);
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

async function broadcastFloatingButton(visible, tabId) {
  try {
    if (tabId != null) {
      await chrome.tabs.sendMessage(tabId, {
        action: 'setFloatingButtonVisible',
        visible
      }).catch(() => {});
      return;
    }
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id) continue;
      chrome.tabs.sendMessage(tab.id, {
        action: 'setFloatingButtonVisible',
        visible
      }).catch(() => {});
    }
  } catch (error) {
    // Ignore — content scripts may not be loaded everywhere.
  }
}

async function setFloatingButtonVisibility(visible, tabId) {
  try {
    await chrome.storage.session.set({ floatingButtonVisible: visible });
  } catch (error) {
    // Ignore.
  }
  broadcastFloatingButton(visible, tabId);
}

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

  if (message?.action === 'openSidePanelFromContent') {
    const tabId = sender?.tab?.id;
    const windowId = sender?.tab?.windowId;
    if (!tabId) {
      sendResponse({ success: false, error: 'No tab id from sender' });
      return true;
    }
    // Fire open + setOptions synchronously within the user-gesture relay.
    try {
      chrome.sidePanel.setOptions({ tabId, enabled: true, path: 'panel/panel.html' })
        .catch((error) => console.warn('setOptions failed (content):', error));
      const opening = windowId != null
        ? chrome.sidePanel.open({ tabId, windowId })
        : chrome.sidePanel.open({ tabId });
      opening
        .then(() => {
          enabledTabs.add(tabId);
          persistEnabledTabs();
          setFloatingButtonVisibility(false, tabId);
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error('open from content failed:', error);
          sendResponse({ success: false, error: error.message });
        });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
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
        await setFloatingButtonVisibility(true, tabId);
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
