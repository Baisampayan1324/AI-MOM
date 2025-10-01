// Background service worker for the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Meeting Minutes Extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    preferredMode: 'online',
    autoSummary: true,
    speakerAlerts: true
  });
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkPermissions') {
    navigator.permissions.query({ name: 'microphone' }).then(result => {
      sendResponse({ granted: result.state === 'granted' });
    });
    return true; // Indicates async response
  }
  
  if (request.action === 'saveTranscript') {
    // Save transcript to storage
    chrome.storage.local.set({
      [`transcript_${Date.now()}`]: request.data
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['preferredMode', 'autoSummary', 'speakerAlerts'], (result) => {
      sendResponse(result);
    });
    return true;
  }
});

// Handle notifications
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: title,
    message: message
  });
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showNotification };
}
