// File processing with real backend integration
function splitTranscriptForSpeakers(text) {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim();

    if (!cleaned) {
        return [];
    }

    const sentenceParts = cleaned
        .split(/(?<=[.!?])\s+|[\r\n]+/)
        .map(part => part.trim())
        .filter(Boolean);

    if (sentenceParts.length > 1) {
        return sentenceParts;
    }

    const clauseParts = cleaned
        .split(/(?<=[,;:])\s+/)
        .map(part => part.trim())
        .filter(Boolean);

    return clauseParts.length > 1 ? clauseParts : [cleaned];
}

function buildSpeakerTranscript(text, speakerCount, speakers = []) {
    const count = Math.max(1, Math.min(5, Number(speakerCount) || 1));
    const speakerLabels = speakers.length
        ? speakers.map((speaker, index) => speaker.speaker_label || speaker.speaker_name || `Speaker ${index + 1}`)
        : Array.from({ length: count }, (_, index) => `Speaker ${index + 1}`);
    const segments = splitTranscriptForSpeakers(text);
    const segmentGroups = Math.max(1, Math.min(count, segments.length));

    if (segmentGroups === 1) {
        return [{ speaker: speakerLabels[0], text: segments.join(' ') }];
    }

    const chunkSize = Math.ceil(segments.length / segmentGroups);
    const result = [];

    for (let index = 0; index < segments.length; index += chunkSize) {
        const chunkIndex = Math.floor(index / chunkSize);
        const speakerLabel = speakerLabels[chunkIndex % speakerLabels.length];
        result.push({
            speaker: speakerLabel,
            text: segments.slice(index, index + chunkSize).join(' ')
        });
    }

    return result;
}

// Function to process audio file and return results
function processAudioFile(file, callbacks) {
    const { onProgress, onComplete, onError } = callbacks;

    if (!file) {
        onError(new Error('No file provided'));
        return;
    }

    // Generate unique session ID for this processing session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Open a WebSocket to receive backend progress updates
    let progressSocket = null;
    try {
        const progressSocketUrl = (window.AI_MOM_RUNTIME && window.AI_MOM_RUNTIME.buildWsUrl('/ws/progress')) || 'ws://localhost:8000/ws/progress';
        progressSocket = new WebSocket(progressSocketUrl);
        progressSocket.onopen = () => {
            try {
                // Notify backend to start progress tracking with session ID
                progressSocket.send(JSON.stringify({ 
                    type: 'start_processing', 
                    file_path: file.name,
                    session_id: sessionId
                }));
            } catch (e) {
                console.warn('Failed to initiate progress socket message:', e);
            }
        };
        progressSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'progress') {
                    // Forward structured progress to UI
                    if (onProgress) onProgress({ percentage: data.percentage, message: data.message, step: data.step });
                } else if (data.type === 'ready') {
                    console.log('Progress WebSocket ready:', data.session_id);
                }
            } catch (e) {
                console.warn('Progress socket parse error:', e);
            }
        };
        progressSocket.onerror = () => {
            // Non-fatal: UI can still continue without live progress
            console.warn('Progress WebSocket error. Falling back to HTTP-only updates.');
        };
    } catch (e) {
        console.warn('Progress WebSocket unavailable:', e);
    }

    // Upload to backend with session_id
    const processAudioUrl = (window.AI_MOM_RUNTIME && window.AI_MOM_RUNTIME.buildApiUrl('/process-audio')) || 'http://localhost:8000/api/process-audio';
    fetch(`${processAudioUrl}?session_id=${sessionId}`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (onProgress) onProgress({ percentage: 100, message: 'Processing complete' });

            console.log('Backend response:', data);

            // Process backend response
            const speakerCount = Number(data.speaker_count || 1);
            const transcriptText = data.transcription || '';
            const speakerTranscript = buildSpeakerTranscript(transcriptText, speakerCount, data.speakers || []);

            const result = {
                transcription: speakerTranscript,
                transcript: transcriptText,
                summary: data.full_summary || '',
                key_points: data.key_points || [],
                action_items: data.action_items || [],
                conclusions: data.conclusions || [data.conclusion || ''],
                participants: `Speaker count: ${speakerCount}`,
                processing_time: data.processing_time,
                api_used: data.api_used
            };

            setTimeout(() => onComplete(result), 500);
        })
        .catch(error => {
            console.error('Error processing file:', error);
            const errorMessage = error.message || 'An error occurred while processing the file';
            showAlert(errorMessage, 'error');
            onError(error);
        })
        .finally(() => {
            try {
                if (progressSocket && progressSocket.readyState === WebSocket.OPEN) {
                    progressSocket.close();
                }
            } catch (e) {
                // swallow
            }
        });
}

// Make function globally available
window.processAudioFile = processAudioFile;
console.log('✅ File-processing.js loaded - Ready for backend integration');

// Notification system function
function showAlert(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Get icon and title based on type
    let icon, title;
    switch (type) {
        case 'error':
            icon = '❌';
            title = 'Error';
            break;
        case 'success':
            icon = '✅';
            title = 'Success';
            break;
        case 'warning':
            icon = '⚠️';
            title = 'Warning';
            break;
        default:
            icon = 'ℹ️';
            title = 'Info';
    }

    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">×</button>
    `;

    container.appendChild(notification);

    // Close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });

    // Auto remove after 2 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 2000);
}

function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.classList.add('removing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }
}

// Make functions globally available
window.showAlert = showAlert;
