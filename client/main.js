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
  tick: 0,
  cube_angle: 0,
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

    // For now, we ignore cube_angle; future: rotate geometry, camera, etc.
    renderTriangle(device, context, pipeline);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

start();
            debugUI.log('Connected to server');
        };
        
        this.wsClient.onDisconnect = () => {
            console.log('Disconnected from server');
            debugUI.setConnectionStatus(false);
            debugUI.log('Disconnected from server');
        };
        
        this.wsClient.connect();
    }
    
    handleMessage(message) {
        const { type, payload } = message;
        
        switch (type) {
            case 'STATE':
                this.handleState(payload);
                break;
                
            case 'EVENT':
                this.handleEvent(payload);
                break;
                
            case 'ERROR':
                this.handleError(payload);
                break;
                
            default:
                console.warn('Unknown message type:', type);
        }
    }
    
    handleState(payload) {
        console.log('Received state:', payload);
        debugUI.log('Received full state');
        
        // Update scene from state
        this.engine.scene.updateFromState(payload.entities);
        
        // Update debug UI
        const entityCount = Object.keys(payload.entities).length;
        debugUI.setEntityCount(entityCount);
    }
    
    handleEvent(payload) {
        const { event_type, data } = payload;
        console.log('Received event:', event_type, data);
        debugUI.log(`Event: ${event_type}`);
        
        switch (event_type) {
            case 'entity_spawned':
                this.engine.scene.onEntitySpawned(data);
                debugUI.setEntityCount(this.engine.scene.entities.size);
                break;
                
            case 'entity_updated':
                this.engine.scene.onEntityUpdated(data);
                break;
                
            case 'entity_deleted':
                this.engine.scene.onEntityDeleted(data.entity_id);
                debugUI.setEntityCount(this.engine.scene.entities.size);
                break;
                
            default:
                console.warn('Unknown event type:', event_type);
        }
    }
    
    handleError(payload) {
        console.error('Server error:', payload.message);
        debugUI.log(`Server error: ${payload.message}`, 'error');
    }
    
    // Expose API for testing/debugging from console
    spawnCube(id, x, y, z, color = [1, 0, 0, 1]) {
        this.wsClient.sendCommand('spawn_entity', {
            entity_id: id,
            type: 'cube',
            position: [x, y, z],
            color: color
        });
    }
    
    moveCube(id, x, y, z) {
        this.wsClient.sendCommand('move_entity', {
            entity_id: id,
            position: [x, y, z]
        });
    }
    
    setColor(id, r, g, b, a = 1) {
        this.wsClient.sendCommand('set_color', {
            entity_id: id,
            color: [r, g, b, a]
        });
    }
    
    deleteCube(id) {
        this.wsClient.sendCommand('delete_entity', {
            entity_id: id
        });
    }
}

// Initialize app when DOM is ready
const app = new TRAVIApp();

// Start initialization
app.initialize().catch(error => {
    console.error('Fatal error:', error);
    debugUI.log(`FATAL: ${error.message}`, 'error');
});

// Expose app to global scope for console debugging
window.TRAVI = app;

console.log('T-R-A-V-I client loaded. Use window.TRAVI for debugging.');
console.log('Example: TRAVI.spawnCube("test1", 0, 1, 0, [1, 0, 0, 1])');
