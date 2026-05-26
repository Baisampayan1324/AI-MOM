chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({
    backendUrl: 'http://localhost:8000',
    autoOpenSidebar: true
  });

  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === 'openSidePanel') {
    chrome.sidePanel.open({ windowId: sender?.tab?.windowId }).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (message?.action === 'ping') {
    sendResponse({ success: true, timestamp: Date.now() });
  }
});