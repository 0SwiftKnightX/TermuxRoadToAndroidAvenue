// client/main.js
import {
  initWebGPU,
  resizeCanvasToDisplaySize,
  createBasicPipeline,
  renderTriangle,
} from "./webgpu-core.js";

const overlay = document.getElementById("overlay");
const canvas = document.getElementById("gfx");

// world state mirrored from backend
let worldState = {
  time: 0,
  frame_count: 0,
  entities: {}
};

let device, context, format, pipeline;

// Adjust this if you expose the device on a LAN.
// On same phone: ws://localhost:8765 is correct when backend runs in Termux.
const WS_URL = "ws://localhost:8765";

function setOverlay(text) {
  if (overlay) overlay.textContent = text;
}

function connectWebSocket() {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    setOverlay("Connected to backend.");
    ws.send(JSON.stringify({ type: "ping", payload: {} }));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const { type, payload } = msg;

      if (type === "hello") {
        setOverlay("Hello from backend.");
      } else if (type === "world_state") {
        worldState = payload;
      }
    } catch (e) {
      console.error("Bad message from server:", e);
    }
  };

  ws.onclose = () => {
    setOverlay("Disconnected. Reconnecting in 2s…");
    setTimeout(connectWebSocket, 2000);
  };

  ws.onerror = () => {
    setOverlay("WebSocket error.");
  };
}

async function start() {
  try {
    ({ device, context, format } = await initWebGPU(canvas));
    pipeline = createBasicPipeline(device, format);
  } catch (e) {
    console.error(e);
    setOverlay("WebGPU error: " + e.message);
    return;
  }

  connectWebSocket();

  function frame() {
    resizeCanvasToDisplaySize(canvas);

    // For now, we render a simple triangle
    // Future: use worldState.entities to render cubes, etc.
    renderTriangle(device, context, pipeline);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

start();
