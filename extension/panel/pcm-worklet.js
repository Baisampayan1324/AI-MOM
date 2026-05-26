class PCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = (options && options.processorOptions) || {};
    this.targetSamples = opts.chunkSize || 4096;
    this.buffer = new Float32Array(this.targetSamples);
    this.offset = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const channel = input[0];
    if (!channel || channel.length === 0) return true;

    let i = 0;
    while (i < channel.length) {
      const need = this.targetSamples - this.offset;
      const avail = channel.length - i;
      const n = Math.min(need, avail);
      this.buffer.set(channel.subarray(i, i + n), this.offset);
      this.offset += n;
      i += n;
      if (this.offset >= this.targetSamples) {
        const out = new Float32Array(this.buffer);
        this.port.postMessage(out, [out.buffer]);
        this.buffer = new Float32Array(this.targetSamples);
        this.offset = 0;
      }
    }
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
