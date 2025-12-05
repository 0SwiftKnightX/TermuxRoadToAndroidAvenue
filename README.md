# TermuxRoadToAndroidAvenue (T-R-A-V-I)

A Termux-based development project creating a live terminal-to-browser bridge for controlling and editing a 3D world in real time. 

**Internal project codename:** T-R-A-V-I  
**Visibility:** Public

## Overview

T-R-A-V-I is a modular, extensible game engine where:
- The **game is the editor** and the **editor is the game**
- An AI assistant can modify code, assets, and world state
- Worlds, avatars, entities, and environments are **procedural and data-driven**
- Everything runs on **Android (Termux)** + **Browser (WebGPU)** using a live WebSocket bridge

## Architecture

### Backend (Python)
- WebSocket server
- World state authority
- Command handling
- Entity lifecycle management
- Future AI agent integration

### Client (JavaScript/WebGPU)
- Hardware-accelerated 3D rendering
- Real-time sync with backend
- Scene management
- Interactive controls
- Debug UI

## Quick Start

### 1. Start the Backend Server

```bash
cd server
pip install -r requirements.txt
python3 main.py
```

The server will start on `localhost:8765`.

### 2. Start the Client

```bash
cd client
python3 -m http.server 8000
```

Open your browser to `http://localhost:8000` (requires WebGPU-compatible browser).

### 3. Interact with the Engine

Use the browser console to spawn and manipulate entities:

```javascript
// Spawn a red cube
TRAVI.spawnCube("cube1", 0, 1, 0, [1, 0, 0, 1]);

// Move it
TRAVI.moveCube("cube1", 2, 1, 0);

// Change color to green
TRAVI.setColor("cube1", 0, 1, 0, 1);
```

## Project Structure

```
.
├── server/          # Python backend
│   ├── main.py
│   ├── ws_server.py
│   ├── world_state.py
│   ├── messages.py
│   ├── command_router.py
│   └── ai_hooks.py
├── client/          # WebGPU frontend
│   ├── index.html
│   ├── main.js
│   ├── engine.js
│   ├── webgpu-context.js
│   ├── scene.js
│   ├── ws-client.js
│   └── debug-ui.js
├── docs/            # Documentation
│   └── engine_spec.md
└── README.md
```

## Features (Phase 1 MVP)

- ✅ WebSocket server/client communication
- ✅ Real-time entity synchronization
- ✅ WebGPU 3D rendering
- ✅ Command system (spawn, move, color, delete)
- ✅ Debug UI overlay
- ✅ Extensible architecture

## Requirements

### Backend
- Python 3.8+
- websockets library

### Client
- Modern browser with WebGPU support (Chrome 113+, Edge 113+)

## Documentation

- [Engine Specification](docs/engine_spec.md) - Complete technical specification
- [Server Documentation](server/README.md) - Backend setup and API
- [Client Documentation](client/README.md) - Frontend setup and usage

## Development

This is the Phase 1 MVP implementation. Future phases will add:
- Universal Interaction Engine
- Procedural Anatomy System
- Chaos & Magic Systems
- Universal Material Hierarchy
- Class & Bloodline Systems
- Multiserver/Metaplanet Architecture
- Weather Engine
- Terrain Destruction Engine
- Advanced Weapon Systems

See [docs/engine_spec.md](docs/engine_spec.md) for complete architecture details.

## License

Public project - see repository settings for license details.
