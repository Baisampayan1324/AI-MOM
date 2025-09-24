class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (event) => {
      // Handle messages from main thread if needed
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      // Convert to PCM Int16
      const pcm = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        pcm[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7fff;
      }
      // Send to main thread
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);