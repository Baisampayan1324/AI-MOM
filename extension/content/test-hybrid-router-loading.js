// Quick test script to verify hybrid router loading
console.log('🧪 Testing Hybrid Router Loading...');

// Test 1: Check if HybridAudioRouter is defined
if (typeof HybridAudioRouter !== 'undefined') {
    console.log('✅ HybridAudioRouter class is available');
    
    // Test 2: Try to instantiate
    try {
        const testRouter = new HybridAudioRouter();
        console.log('✅ HybridAudioRouter instantiation successful');
        
        // Test 3: Check methods
        const methods = ['initialize', 'processAudioChunk', 'stop', 'selectBestSource'];
        methods.forEach(method => {
            if (typeof testRouter[method] === 'function') {
                console.log(`✅ Method ${method} exists`);
            } else {
                console.log(`❌ Method ${method} missing`);
            }
        });
        
    } catch (error) {
        console.error('❌ HybridAudioRouter instantiation failed:', error);
    }
} else {
    console.error('❌ HybridAudioRouter class not found');
    console.log('📋 Available globals:', Object.keys(window).filter(key => key.includes('Audio') || key.includes('Router')));
}

// Test 4: Check browser audio capabilities
console.log('🔊 Browser Audio Capabilities:');
console.log('- AudioContext:', typeof AudioContext !== 'undefined' ? '✅' : '❌');
console.log('- webkitAudioContext:', typeof webkitAudioContext !== 'undefined' ? '✅' : '❌');
console.log('- MediaRecorder:', typeof MediaRecorder !== 'undefined' ? '✅' : '❌');
console.log('- getUserMedia:', !!navigator.mediaDevices?.getUserMedia ? '✅' : '❌');
console.log('- getDisplayMedia:', !!navigator.mediaDevices?.getDisplayMedia ? '✅' : '❌');

// Test 5: Check supported MIME types
if (typeof MediaRecorder !== 'undefined') {
    const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
    ];
    
    console.log('🎵 Supported Audio MIME Types:');
    mimeTypes.forEach(type => {
        const supported = MediaRecorder.isTypeSupported(type);
        console.log(`- ${type}: ${supported ? '✅' : '❌'}`);
    });
}

console.log('🧪 Hybrid router loading test complete');