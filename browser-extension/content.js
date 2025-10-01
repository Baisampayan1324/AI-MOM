let sidebarIframe = null;
let floatingIcon = null;
let currentMediaStream = null;
let currentMediaRecorder = null;

// Listen for messages from popup and sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidebar') {
    if (!sidebarIframe) {
      createSidebar();
    } else {
      showSidebar();
    }
    sendResponse({ success: true });
  }
  
  if (request.action === 'checkMicrophoneAccess') {
    checkMicrophoneAccess().then(hasAccess => {
      sendResponse({ hasAccess });
    }).catch(error => {
      sendResponse({ hasAccess: false, error: error.message });
    });
    return true; // Indicates async response
  }
  
  return true;
});

// Listen for messages from sidebar iframe
window.addEventListener('message', async (event) => {
  if (event.data.action === 'minimizeSidebar') {
    hideSidebar();
    createFloatingIcon();
  } else if (event.data.action === 'requestMicrophoneAccess') {
    await handleMicrophoneRequest(event.data.config);
  } else if (event.data.action === 'startRecordingWithStream') {
    startRecordingWithStream(event.data.chunkInterval);
  } else if (event.data.action === 'stopRecording') {
    stopRecording();
  } else if (event.data.action === 'checkMicrophoneAccess') {
    // Check microphone access and send result back to sidebar
    const hasAccess = await checkMicrophoneAccess();
    sidebarIframe.contentWindow.postMessage({
      action: 'microphoneAccessStatus',
      hasAccess: hasAccess
    }, '*');
  }
});

async function handleMicrophoneRequest(config = {}) {
  try {
    console.log('Requesting microphone access from content script...');
    
    // Check if we're on Google Meet and try alternative approaches
    const isGoogleMeet = window.location.hostname.includes('meet.google.com');
    
    if (isGoogleMeet) {
      console.log('Detected Google Meet - trying specialized access methods...');
      
      // Strategy 1: Try to get audio from existing Meet streams
      console.log('Strategy 1: Attempting Meet audio capture...');
      const meetAudioStream = await tryCaptureMeetAudio();
      if (meetAudioStream) {
        currentMediaStream = meetAudioStream;
        console.log('✅ Successfully captured Google Meet audio');
        
        // Don't send stream through postMessage - just notify success
        sidebarIframe.contentWindow.postMessage({
          action: 'microphoneAccessGranted',
          source: 'meet-capture'
        }, '*');
        return;
      }
      
      // Strategy 2: Try direct microphone with Meet-optimized settings
      console.log('Strategy 2: Attempting direct microphone access...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false, // Let Meet handle audio processing
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 48000,
            channelCount: 1
          }
        });
        
        currentMediaStream = stream;
        console.log('✅ Direct microphone access granted for Google Meet');

        // Don't send stream through postMessage - just notify success
        sidebarIframe.contentWindow.postMessage({
          action: 'microphoneAccessGranted',
          source: 'direct-meet'
        }, '*');
        return;
        
      } catch (meetError) {
        console.log('❌ Direct Meet access failed:', meetError.message);
      }
      
      // Strategy 3: Offer desktop audio capture as fallback
      console.log('Strategy 3: Offering desktop audio capture...');
      try {
        const desktopStream = await tryDesktopAudioCapture();
        if (desktopStream) {
          currentMediaStream = desktopStream;
          console.log('✅ Desktop audio capture successful');
          
          // Don't send stream through postMessage - just notify success
          sidebarIframe.contentWindow.postMessage({
            action: 'microphoneAccessGranted',
            source: 'desktop-audio'
          }, '*');
          return;
        }
      } catch (desktopError) {
        console.log('❌ Desktop audio capture failed:', desktopError.message);
      }
      
      // If all Google Meet strategies fail, throw a specific error
      throw new Error('Google Meet blocks microphone access. Please try desktop audio sharing or use the extension on other meeting platforms.');
    }
    
    // Standard microphone access for non-Meet sites
    console.log('Attempting standard microphone access...');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: config.echoCancellation ?? true,
        noiseSuppression: config.noiseSuppression ?? true,
        sampleRate: config.sampleRate || 16000
      }
    });

    currentMediaStream = stream;
    console.log('✅ Standard microphone access granted');

    // Don't send stream through postMessage - just notify success
    sidebarIframe.contentWindow.postMessage({
      action: 'microphoneAccessGranted',
      source: 'standard'
    }, '*');

  } catch (error) {
    console.error('❌ Microphone access denied:', error);
    
    // Provide detailed error information and solutions
    let errorMessage = 'Microphone access denied';
    let suggestion = '';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Microphone permission denied by user or browser';
      suggestion = 'Click the microphone icon in the address bar and allow access';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No microphone device found';
      suggestion = 'Please check if a microphone is connected to your computer';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Microphone is being used by another application';
      suggestion = 'Close other apps using the microphone, or try desktop audio sharing';
    } else if (error.message && error.message.includes('Google Meet')) {
      errorMessage = 'Google Meet blocks external microphone access';
      suggestion = 'Try: 1) Desktop audio sharing, 2) Use extension on Zoom/Teams instead, 3) Record meeting with Meet built-in recorder';
    } else {
      errorMessage = `Audio access failed: ${error.message}`;
      suggestion = 'Try refreshing the page and allowing microphone permission';
    }
    
    sidebarIframe.contentWindow.postMessage({
      action: 'microphoneAccessDenied',
      error: errorMessage,
      suggestion: suggestion,
      originalError: error.message,
      isGoogleMeet: window.location.hostname.includes('meet.google.com')
    }, '*');
  }
}

function startRecordingWithStream(chunkInterval = 5000) {
  if (!currentMediaStream) {
    console.error('No media stream available');
    return;
  }

  try {
    currentMediaRecorder = new MediaRecorder(currentMediaStream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    currentMediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        // Send audio chunk to sidebar
        sidebarIframe.contentWindow.postMessage({
          action: 'audioChunkReady',
          audioBlob: event.data
        }, '*');
      }
    };

    currentMediaRecorder.start(chunkInterval);
    console.log('Recording started');

  } catch (error) {
    console.error('Failed to start recording:', error);
  }
}

function stopRecording() {
  if (currentMediaRecorder) {
    currentMediaRecorder.stop();
    currentMediaRecorder = null;
  }
  
  if (currentMediaStream) {
    currentMediaStream.getTracks().forEach(track => track.stop());
    currentMediaStream = null;
  }
  
  console.log('Recording stopped');
}

// Function to try capturing Google Meet audio streams
async function tryCaptureMeetAudio() {
  try {
    console.log('Attempting to capture Google Meet audio...');
    
    // Method 1: Look for existing audio/video elements with srcObject
    const mediaElements = document.querySelectorAll('audio, video');
    console.log(`Found ${mediaElements.length} media elements`);
    
    for (const element of mediaElements) {
      if (element.srcObject) {
        const audioTracks = element.srcObject.getAudioTracks();
        if (audioTracks.length > 0) {
          console.log('Found existing audio stream in media element');
          // Clone the stream to avoid conflicts with Meet
          const clonedStream = element.srcObject.clone();
          return clonedStream;
        }
      }
    }
    
    // Method 2: Try to access WebRTC streams through getUserMedia with specific constraints
    try {
      console.log('Trying WebRTC stream access...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      if (audioDevices.length > 0) {
        // Try the default audio device with minimal constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            deviceId: audioDevices[0].deviceId
          }
        });
        console.log('Successfully accessed audio device');
        return stream;
      }
    } catch (webrtcError) {
      console.log('WebRTC access failed:', webrtcError.message);
    }
    
    return null;
  } catch (error) {
    console.log('Meet audio capture failed:', error.message);
    return null;
  }
}

// Function to try desktop audio capture
async function tryDesktopAudioCapture() {
  try {
    console.log('Attempting desktop audio capture...');
    
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        sampleRate: 48000
      }
    });
    
    // Extract only audio track if available
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      // Create new stream with only audio
      const audioStream = new MediaStream(audioTracks);
      
      // Stop video track to save resources
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => track.stop());
      
      return audioStream;
    }
    
    return null;
  } catch (error) {
    console.log('Desktop audio capture failed:', error);
    return null;
  }
}

// Function to check if microphone access is available
async function checkMicrophoneAccess() {
  try {
    // Check if we're on Google Meet
    const isGoogleMeet = window.location.hostname.includes('meet.google.com') ||
                        window.location.hostname.includes('hangouts.google.com');
    
    if (isGoogleMeet) {
      console.log('Checking Google Meet audio access...');
      
      // Check for active media elements first (non-intrusive)
      const mediaElements = document.querySelectorAll('audio, video');
      for (const element of mediaElements) {
        if (element.srcObject && element.srcObject.getAudioTracks().length > 0) {
          console.log('Found active audio tracks in Meet');
          return true;
        }
      }
      
      // Check if Meet UI indicates microphone is active
      const micButtons = document.querySelectorAll('[data-is-muted], [aria-label*="microphone"], [aria-label*="Microphone"]');
      if (micButtons.length > 0) {
        console.log('Found microphone controls in Meet UI');
        return true; // Assume microphone capability exists
      }
      
      // For Google Meet, we'll assume desktop capture is available as fallback
      // Don't actually test it here to avoid permission prompts
      return true;
    }
    
    // Standard microphone check for non-Meet sites
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.log('Standard microphone check failed:', error);
      return false;
    }
  } catch (error) {
    console.error('Error checking microphone access:', error);
    return false;
  }
}

function createSidebar() {
  // Create sidebar iframe
  sidebarIframe = document.createElement('iframe');
  sidebarIframe.id = 'ai-meeting-sidebar';
  sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
  sidebarIframe.allow = 'microphone'; // Allow microphone access in iframe
  sidebarIframe.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    border: none;
    z-index: 999999;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  
  document.body.appendChild(sidebarIframe);
  
  // Animate in
  setTimeout(() => {
    sidebarIframe.style.transform = 'translateX(0)';
  }, 10);
}

function showSidebar() {
  if (sidebarIframe) {
    sidebarIframe.style.display = 'block';
    setTimeout(() => {
      sidebarIframe.style.transform = 'translateX(0)';
    }, 10);
  }
  if (floatingIcon) {
    floatingIcon.remove();
    floatingIcon = null;
  }
}

function hideSidebar() {
  if (sidebarIframe) {
    sidebarIframe.style.transform = 'translateX(100%)';
    setTimeout(() => {
      sidebarIframe.style.display = 'none';
    }, 300);
  }
}

function createFloatingIcon() {
  if (floatingIcon) return;

  floatingIcon = document.createElement('div');
  floatingIcon.id = 'ai-meeting-float-icon';
  floatingIcon.innerHTML = '🎙️';
  floatingIcon.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    z-index: 999998;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  `;

  floatingIcon.addEventListener('mouseenter', () => {
    floatingIcon.style.transform = 'scale(1.1)';
    floatingIcon.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
  });

  floatingIcon.addEventListener('mouseleave', () => {
    floatingIcon.style.transform = 'scale(1)';
    floatingIcon.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
  });

  floatingIcon.addEventListener('click', () => {
    showSidebar();
  });

  document.body.appendChild(floatingIcon);
}
