/**
 * audioCapture.ts
 * MediaRecorder abstraction that slices audio into fixed-duration Blob chunks.
 * No React dependencies — pure browser API.
 */

type OnChunkCallback = (blob: Blob) => void;

let mediaRecorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let chunkBuffer: Blob[] = [];
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let onChunkCb: OnChunkCallback | null = null;

/**
 * Starts audio capture. Calls onChunk every intervalMs milliseconds.
 * Throws a user-friendly Error if mic access is denied.
 */
export async function startCapture(
  onChunk: OnChunkCallback,
  intervalMs: number = 30000
): Promise<void> {
  if (mediaRecorder && mediaRecorder.state !== "inactive") return;

  onChunkCb = onChunk;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err: unknown) {
    const error = err as DOMException;
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      throw new Error(
        "Microphone access denied. Please allow microphone access in your browser settings and reload the page."
      );
    }
    if (error.name === "NotFoundError") {
      throw new Error("No microphone detected. Please connect a microphone and try again.");
    }
    throw new Error(`Microphone error: ${error.message}`);
  }

  // Prefer webm/opus; fall back to whatever the browser supports
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MediaRecorder.isTypeSupported("audio/webm")
    ? "audio/webm"
    : "";

  mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  chunkBuffer = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunkBuffer.push(e.data);
    }
  };

  mediaRecorder.onerror = (e) => {
    console.error("MediaRecorder error:", e);
  };

  mediaRecorder.start(1000); // collect data every 1s for smooth flushing

  // Fire onChunk every intervalMs
  intervalHandle = setInterval(() => {
    const blob = _flush();
    if (blob) onChunkCb?.(blob);
  }, intervalMs);
}

/** Stop recording. Returns any remaining buffered audio. */
export function stopCapture(): Blob | null {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  const remaining = chunkBuffer.length > 0 ? new Blob(chunkBuffer, { type: "audio/webm" }) : null;
  chunkBuffer = [];
  mediaRecorder = null;
  return remaining;
}

/**
 * Immediately flush the current buffer and reset it.
 * Returns the accumulated audio blob (or null if buffer is empty).
 * Used for manual refresh without waiting for the timer.
 */
export function flushBuffer(): Blob | null {
  return _flush();
}

export function isCapturing(): boolean {
  return mediaRecorder !== null && mediaRecorder.state === "recording";
}

function _flush(): Blob | null {
  if (chunkBuffer.length === 0) return null;
  const blob = new Blob(chunkBuffer, { type: "audio/webm" });
  chunkBuffer = [];
  return blob;
}
