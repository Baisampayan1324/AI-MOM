document.getElementById('openSidebar').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' }, (response) => {
    if (chrome.runtime.lastError) {
      document.getElementById('status').textContent = 'Please refresh the page first';
      document.getElementById('status').style.background = 'rgba(255,100,100,0.2)';
    } else {
      window.close();
    }
  });
});

// Auto-check permissions when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = 'Auto-checking permissions...';
  statusDiv.style.background = 'rgba(255,200,100,0.2)';
  
  // Trigger automatic permission check
  setTimeout(() => {
    document.getElementById('checkPermissions').click();
  }, 500);
});

document.getElementById('checkPermissions').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = 'Checking permissions...';
  statusDiv.style.background = 'rgba(255,200,100,0.2)';

  try {
    // First, check if we're on Google Meet
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isGoogleMeet = tab.url && (
      tab.url.includes('meet.google.com') || 
      tab.url.includes('meet.google.com') ||
      tab.url.includes('hangouts.google.com')
    );

    if (isGoogleMeet) {
      // If on Google Meet, try to inherit permissions by requesting microphone access
      try {
        // Send message to content script to check/request permissions
        chrome.tabs.sendMessage(tab.id, { action: 'checkMicrophoneAccess' }, async (response) => {
          if (chrome.runtime.lastError) {
            // Content script not loaded, fallback to direct permission check
            await fallbackPermissionCheck(statusDiv);
          } else if (response && response.hasAccess) {
            statusDiv.textContent = '✅ Microphone access inherited from Google Meet';
            statusDiv.style.background = 'rgba(100,255,100,0.2)';
            
            // Store permission state
            chrome.storage.local.set({ microphonePermissionGranted: true });
          } else {
            // Google Meet doesn't have permission, prompt user
            await requestMicrophonePermission(statusDiv);
          }
        });
      } catch (error) {
        await fallbackPermissionCheck(statusDiv);
      }
    } else {
      // Not on Google Meet, check permissions normally
      await fallbackPermissionCheck(statusDiv);
    }
  } catch (error) {
    statusDiv.textContent = 'Unable to check permissions: ' + error.message;
    statusDiv.style.background = 'rgba(255,100,100,0.2)';
  }
});

async function fallbackPermissionCheck(statusDiv) {
  try {
    const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
    
    if (permissionStatus.state === 'granted') {
      statusDiv.textContent = '✅ Microphone access granted';
      statusDiv.style.background = 'rgba(100,255,100,0.2)';
      chrome.storage.local.set({ microphonePermissionGranted: true });
    } else if (permissionStatus.state === 'prompt') {
      await requestMicrophonePermission(statusDiv);
    } else {
      statusDiv.textContent = '❌ Microphone access denied - Please allow in browser settings';
      statusDiv.style.background = 'rgba(255,100,100,0.2)';
    }
  } catch (error) {
    statusDiv.textContent = 'Unable to check permissions';
    statusDiv.style.background = 'rgba(255,100,100,0.2)';
  }
}

async function requestMicrophonePermission(statusDiv) {
  try {
    statusDiv.textContent = 'Click "Allow" when prompted for microphone access';
    statusDiv.style.background = 'rgba(255,200,100,0.2)';
    
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // If successful, stop the stream and update status
    stream.getTracks().forEach(track => track.stop());
    
    statusDiv.textContent = '✅ Microphone permission granted! You can now start recording.';
    statusDiv.style.background = 'rgba(100,255,100,0.2)';
    chrome.storage.local.set({ microphonePermissionGranted: true });
    
    // Auto-close popup after success
    setTimeout(() => {
      window.close();
    }, 2000);
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      statusDiv.textContent = '❌ Please click "Allow" to enable microphone access';
      statusDiv.style.background = 'rgba(255,100,100,0.2)';
    } else if (error.name === 'NotFoundError') {
      statusDiv.textContent = '❌ No microphone found on this device';
      statusDiv.style.background = 'rgba(255,100,100,0.2)';
    } else {
      statusDiv.textContent = '❌ Error accessing microphone: ' + error.message;
      statusDiv.style.background = 'rgba(255,100,100,0.2)';
    }
  }
}
