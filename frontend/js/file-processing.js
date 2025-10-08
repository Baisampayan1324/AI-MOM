// File processing with real backend integration
// Function to process audio file and return results
function processAudioFile(file, callbacks) {
    const { onProgress, onComplete, onError } = callbacks;

    if (!file) {
        onError(new Error('No file provided'));
        return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 90) {
            onProgress(progress);
        }
    }, 150);

    // Upload to backend
    fetch('http://localhost:8000/api/process-audio', {
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
        clearInterval(progressInterval);
        onProgress(100);
        
        console.log('Backend response:', data);
        
        // Process backend response
        const result = {
            transcription: [],
            transcript: data.transcription || '',
            summary: data.full_summary || '',
            key_points: data.key_points || [],
            action_items: data.action_items || [],
            conclusions: data.conclusions || [data.conclusion || ''],
            participants: `Speaker count: ${data.speaker_count || 1}`,
            processing_time: data.processing_time,
            api_used: data.api_used
        };

        // Parse transcription into speaker format if it's a string
        if (typeof result.transcript === 'string') {
            const lines = result.transcript.split('\n').filter(l => l.trim());
            result.transcription = lines.map((line, index) => {
                const speakerMatch = line.match(/^(Speaker \d+):\s*(.+)$/);
                if (speakerMatch) {
                    return { speaker: speakerMatch[1], text: speakerMatch[2] };
                } else {
                    return { speaker: `Speaker ${(index % 2) + 1}`, text: line };
                }
            });
        }

        setTimeout(() => onComplete(result), 500);
    })
    .catch(error => {
        clearInterval(progressInterval);
        console.error('Error processing file:', error);
        onError(error);
    });
}

// Make function globally available
window.processAudioFile = processAudioFile;
console.log('✅ File-processing.js loaded - Ready for backend integration');
