// --- UI Creation ---
const bubble = document.createElement("div");
bubble.id = "ai-mom-bubble";
bubble.innerHTML = "🎤";
document.body.appendChild(bubble);

const panel = document.createElement("div");
panel.id = "ai-mom-panel";
panel.innerHTML = `
  <div class="panel-body">
    <h2>AI MOM Assistant</h2>
    <h3>Live Transcript</h3>
    <div id="transcript-feed" style="max-height:300px;overflow:auto;"></div>
    <h3>Summary</h3>
    <div id="summary-feed">Waiting for summary...</div>
  </div>
`;
document.body.appendChild(panel);

// --- State ---
let panelOpen = true;
panel.classList.add("open");

// --- Bubble Behavior ---
bubble.onclick = () => {
  panelOpen = !panelOpen;
  panel.classList.toggle("open", panelOpen);
};

// --- Dragging ---
let isDragging = false, offsetX, offsetY;

bubble.onmousedown = (e) => {
  isDragging = true;
  offsetX = e.clientX - bubble.offsetLeft;
  offsetY = e.clientY - bubble.offsetTop;
};

document.onmousemove = (e) => {
  if (isDragging) {
    bubble.style.left = e.clientX - offsetX + "px";
    bubble.style.top = e.clientY - offsetY + "px";
  }
};

document.onmouseup = () => (isDragging = false);

// --- Deactivate on Right-Click ---
bubble.oncontextmenu = (e) => {
  e.preventDefault();
  panel.remove();
  bubble.remove();
  if (socket) socket.close();
};

// --- WebSocket Connection ---
const WS_URL = "ws://localhost:8000/audio"; // Replace with backend URL
let socket;

function connectWebSocket() {
  socket = new WebSocket(WS_URL + "?meeting_id=" + Date.now());

  socket.onopen = () => console.log("Connected to AI MOM backend");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Append transcripts
    if (data.text) {
      const feed = document.getElementById("transcript-feed");
      const line = document.createElement("div");
      line.textContent = `[${data.speaker || "User"}]: ${data.text}`;
      feed.appendChild(line);
      feed.scrollTop = feed.scrollHeight;
    }

    // Show summary
    if (data.summary) {
      document.getElementById("summary-feed").textContent = data.summary;
    }
  };

  socket.onerror = (err) => console.error("WebSocket error:", err.type, err);
  socket.onclose = (event) => {
    console.log("Disconnected from AI MOM backend", event.code, event.reason);
    // Retry connection after 5 seconds
    setTimeout(connectWebSocket, 5000);
  };
}

connectWebSocket();

// --- Mic Capture & Stream (PCM) ---
async function startMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext({ sampleRate: 16000 });
    await audioContext.audioWorklet.addModule(chrome.runtime.getURL('audio-worklet.js'));
    const source = audioContext.createMediaStreamSource(stream);
    const processor = new AudioWorkletNode(audioContext, 'audio-processor');

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.port.onmessage = (event) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };
  } catch (error) {
    console.error("Audio setup failed:", error);
  }
}

startMic();
