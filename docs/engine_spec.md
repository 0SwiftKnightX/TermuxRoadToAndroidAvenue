Got you.
I’m going to rewrite the spec cleanly so Phase 1 is fully locked in and everything we talked about is in there, professionally structured.

You can copy-paste this whole thing as your new docs/engine_spec.md and it will be your authoritative Phase 1 spec.


---

# T-R-A-V-I Engine Specification

**TermuxRoadToAndroidAvenue – Core Engine Architecture**

**Codename:** T-R-A-V-I

**Purpose:** A modular, extensible game engine where:
- The **game is the editor** and the **editor is the game**
- An AI assistant can modify code, assets, and world state
- Worlds, avatars, entities, and environments are **procedural and data-driven**
- Everything runs on **Android (Termux)** + **Browser (WebGPU)** using a live WebSocket bridge

This file defines the **minimum stable structure for Phase 1 (MVP)**.

Phase 1 goal:

> Start a Python backend in Termux → open a browser client → move a cube in 3D space in real time via commands, with a visible Debug UI and a clean message protocol.

---

# 1. Runtime Overview

## 1.1 Backend (Termux – Python)

**Language:** Python 3  
**Responsibilities:**

- Start and manage a **WebSocket server**
- Act as **world state authority**
- Maintain **entity registry**
- Handle **commands** from:
  - Terminal (CLI tools, future)
  - Browser client
  - Future AI agents
- Apply changes to world state
- Broadcast updates to all connected clients
- Expose hooks for:
  - Procedural systems (PEFS, avatars, etc. – future)
  - AI assistants (`ai_hooks.py` – future)

## 1.2 Client (Browser – WebGPU, plain JS)

**Language:** JavaScript (ES modules, no build tools)  
**Responsibilities:**

- Connect to backend via WebSocket
- Maintain a local mirror of **world state** (entities only in Phase 1)
- Implement a minimal **engine loop**:
  - apply incoming updates
  - update scene
  - render via WebGPU
- Manage **camera** and **basic scene graph**
- Expose hooks for:
  - Procedural avatar rendering (placeholder)
  - Future editor overlay
  - Debug UI overlay

## 1.3 Communication Layer

- **Transport:** WebSocket
- **Format:** JSON messages
- **Authority:** Backend is source of truth  
  Clients are **mirrors** that send commands and display results.

---

# 2. Project Structure

The repository MUST contain at minimum:

```text
server/
  __init__.py
  main.py              # Backend entry point (starts WS server)
  ws_server.py         # WebSocket server setup (asyncio or websockets)
  command_router.py    # Routes incoming messages to handler functions
  world_state.py       # In-memory world model (entities, regions, fields hooks)
  messages.py          # Shared message helpers / validation / constants
  ai_hooks.py          # Placeholder for future AI integration (no-op in Phase 1)

client/
  index.html           # Main HTML shell, loads JS modules
  main.js              # Client entry point, bootstraps everything
  ws-client.js         # WebSocket client: connect, send, receive, reconnect
  engine.js            # Game/engine loop (update + render)
  webgpu-context.js    # WebGPU setup: adapter, device, context, pipeline
  scene.js             # Scene graph / object registry, tied to backend entities
  avatar.js            # Placeholder for procedural avatar logic (Phase 2+)
  debug-ui.js          # On-screen debug overlay for Phase 1

docs/
  engine_spec.md       # This file
  setup_termux.md      # How to run backend in Termux (Python, deps, commands)
  pipeline_overview.md # Diagram & description of Terminal → Backend → Client

README.md              # Overview & quickstart for the repo

2.1 File Responsibilities (Phase 1)

server/main.py

Parse config/env (port)

Initialize WorldState

Start WebSocket server (ws_server.start(world_state))


server/ws_server.py

Accept WebSocket connections

For each message:

parse JSON

pass to command_router.handle_message(...)


On connect:

send full STATE snapshot


On world updates:

broadcast appropriate messages



server/command_router.py

Interpret message envelopes

Dispatch to handlers:

handle_spawn_entity

handle_move_entity

handle_set_color

handle_delete_entity

handle_ping


Return responses/errors in standard format


server/world_state.py

Maintain:

self.entities = {}  # entity_id -> entity dict
# Phase 1: PEFS hooks only, no heavy logic yet:
self.regions = {}   # region scaffolding (future)
self.fields = {}    # field layers (pressure/chaos/etc., future)

Provide methods:

spawn_entity(...)

move_entity(...)

set_color(...)

delete_entity(...)

get_snapshot()



server/messages.py

Define constants for message types:

COMMAND, EVENT, STATE, ERROR, PING


Provide helpers:

make_command(name, payload)

make_event(name, payload)

make_state(world_state_dict)

make_error(message, code)



server/ai_hooks.py

Stub functions for future AI integration:

def on_world_update(world_state):
    pass

def on_command_received(cmd):
    pass


client/main.js

Entry point:

Import ws-client.js, engine.js, debug-ui.js

Initialize WebSocket client

Initialize engine & scene

Initialize debug UI



client/ws-client.js

Connect to backend WS

Reconnect on failure

Expose:

sendMessage(msg)

event/onmessage callback hooks



client/engine.js

Owns main loop:

update(dt) – applies new state

render() – WebGPU draw


Manages camera and calls into scene.js


client/webgpu-context.js

Initialize WebGPU:

request adapter/device

configure context/swapchain

create render pipeline & depth buffer


Expose:

initWebGPU(canvas)

drawFrame(sceneObjects)



client/scene.js

Maintain local scene objects:

id -> { transform, color, meshType }


Sync from backend:

on full STATE: replace entities

on EVENT updates: patch entities


Expose:

applyState(statePayload)

applyEvent(eventPayload)

getSceneObjects()



client/avatar.js

Phase 1: stub

export function createAvatarFromParameters(params) {
  return {
    mesh: "capsule",
    transform: { position: [0,1,0], rotation: [0,0,0], scale: [1,1,1] },
    material: { color: [1,1,1,1] },
    meta: params
  };
}


client/debug-ui.js

Renders overlay showing:

connection status

recent commands/events

selected entity data

errors





---

3. Core Loop

3.1 Backend Loop (Python)

High-level:

while server_running:
    # handled by asyncio or websockets library
    # for each message from any client:
    msg = await websocket.recv()
    parsed = parse_json(msg)
    response_messages = command_router.handle_message(parsed, world_state)
    for resp in response_messages:
        await broadcast(resp)

Responsibilities in Phase 1:

Parse JSON messages

Validate envelope and payload

Route commands to world_state

Generate:

STATE snapshots

EVENT updates

ERROR reports


Broadcast to all connected clients


3.2 Client Loop (Browser)

High-level:

function frame(timestamp) {
  const dt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  engine.update(dt);   // apply world updates & animations
  engine.render();     // WebGPU render pass

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

Responsibilities in Phase 1:

Apply incoming STATE and EVENT messages to scene.js

Push logs/data into Debug UI

Render a cube (or cubes) at positions given by backend



---

4. Data Model

4.1 Entity Representation (Phase 1)

Backend stores entities as simple dictionaries:

{
  "entity_id": "cube_1",
  "type": "cube",
  "position": [0, 1, 0],
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "color": [1, 0, 0, 1],
  "meta": {}
}

Phase 1 requires only "cube" type.

Future types:

"player", "pet", "npc", "prop", "terrain" will extend this schema.



4.2 Player & Pet Entity Models (Phase 2+ forward-compatible)

Even though Phase 1 does not implement full players/pets, the schema is reserved to keep the engine future-proof.

Player Model (Schema)

{
  "entity_id": "player_001",
  "type": "player",
  "position": [0, 1, 0],
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "color": [1, 1, 1, 1],

  "stats": {
    "health": 100,
    "stamina": 100,
    "mana": 50,
    "level": 1,
    "experience": 0
  },

  "movement": {
    "speed": 5.0,
    "jump_strength": 1.5
  },

  "inventory": [],

  "meta": {
    "player_name": "",
    "class": "none",
    "race": "none"
  }
}

Pet Model (Schema)

{
  "entity_id": "pet_001",
  "type": "pet",
  "position": [0, 1, 0],
  "rotation": [0, 0, 0],
  "scale": [0.8, 0.8, 0.8],

  "stats": {
    "health": 50,
    "loyalty": 100
  },

  "behavior": {
    "mode": "follow",
    "target_id": "player_001"
  },

  "meta": {
    "species": "wolf",
    "abilities": []
  }
}

Phase 1 requirement: engine must not break if these appear, but is not required to spawn them. They are future-facing.

4.3 World State Container (Phase 1)

WorldState (backend) must at least contain:

self.entities = {}  # entity_id -> entity dict

# Hooks for future PEFS/regions (no heavy logic in Phase 1):
self.regions = {}   # region_id -> region dict
self.fields = {}    # field_name -> field data (pressure/chaos/etc.)

Phase 1 only actively uses entities, but the structure must exist for future PEFS integration.


---

5. Message Protocol (WebSocket JSON)

5.1 Envelope

Every message MUST follow this envelope:

{
  "type": "COMMAND" | "EVENT" | "STATE" | "ERROR" | "PING",
  "payload": {}
}

5.2 Phase 1 Commands (Backend must support)

1. spawn_entity



{
  "type": "COMMAND",
  "payload": {
    "command": "spawn_entity",
    "entity_type": "cube",
    "entity_id": "cube_1",    // optional; backend may auto-generate
    "position": [0, 1, 0],
    "color": [1, 0, 0, 1]
  }
}

2. move_entity



{
  "type": "COMMAND",
  "payload": {
    "command": "move_entity",
    "entity_id": "cube_1",
    "delta": [1, 0, 0]
  }
}

3. set_color



{
  "type": "COMMAND",
  "payload": {
    "command": "set_color",
    "entity_id": "cube_1",
    "color": [0, 1, 0, 1]
  }
}

4. delete_entity



{
  "type": "COMMAND",
  "payload": {
    "command": "delete_entity",
    "entity_id": "cube_1"
  }
}

5. ping (connectivity check)



{
  "type": "PING",
  "payload": {
    "timestamp": 1234567890
  }
}

Backend must respond with a PONG or EVENT echo.

5.3 Phase 1 Events

1. entity_spawned



{
  "type": "EVENT",
  "payload": {
    "event": "entity_spawned",
    "entity": { /* full entity dict */ }
  }
}

2. entity_updated



{
  "type": "EVENT",
  "payload": {
    "event": "entity_updated",
    "entity_id": "cube_1",
    "data": {
      "position": [1, 1, 0],
      "color": [0, 1, 0, 1]
    }
  }
}

3. entity_deleted



{
  "type": "EVENT",
  "payload": {
    "event": "entity_deleted",
    "entity_id": "cube_1"
  }
}

5.4 Full State Snapshot

Sent when:

client first connects

client requests full sync

backend decides a resync is needed


{
  "type": "STATE",
  "payload": {
    "entities": {
      "cube_1": {
        "type": "cube",
        "position": [0, 1, 0],
        "rotation": [0, 0, 0],
        "scale": [1, 1, 1],
        "color": [1, 0, 0, 1],
        "meta": {}
      }
    }
  }
}

5.5 Error Format

{
  "type": "ERROR",
  "payload": {
    "message": "Unknown command: explode_universe",
    "code": "UNKNOWN_COMMAND",
    "original": { /* optional echo of offending payload */ }
  }
}


---

6. Rendering Layer (WebGPU MVP)

6.1 Requirements

webgpu-context.js must:

Request WebGPU adapter and device

Configure canvas context and swapchain

Create:

render pipeline (vertex + fragment shaders)

depth buffer

uniform buffers for transforms (model-view-projection)


Handle window resize

Expose:

initWebGPU(canvas): Promise<WebGPUContext>

drawFrame(sceneObjects, cameraData)



6.2 Scene Graph (Phase 1)

scene.js maintains a simple object list:

{
  "cube_1": {
    type: "cube",
    position: [0, 1, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: [1, 0, 0, 1],
    meta: {}
  }
}

Responsibilities:

applyState(statePayload) – set all entities

applyEvent(eventPayload) – patch single entities

getSceneObjects() – return array of render-ready objects



---

7. Procedural Hooks (Phase 1 Stubs)

7.1 Procedural Avatar Stub

avatar.js MUST export:

export function createAvatarFromParameters(params) {
  return {
    mesh: "capsule",
    transform: {
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    material: {
      color: [1, 1, 1, 1]
    },
    meta: params
  };
}

No full avatar system required in Phase 1, only this stub.

7.2 PEFS Hooks (Procedural Environment & Field System – Future)

Phase 1 must reserve space for PEFS but not implement heavy logic.

world_state.py includes:

regions dict

fields dict



Future specs will define:

region refresh rules

field layers (pressure, heat, chaos, magic, etc.)

digging / reshuffle logic



---

8. Editor Hooks

8.1 In-World Editing (Future)

Phase 1 does not need in-world editing UI, but must plan for:

selecting entities

moving/rotating/scaling entities

spawning/deleting entities

editing parameters via UI


8.2 Terminal Editing (Phase 1 Concept)

Phase 1 expects a mapping from terminal commands to backend actions, even if only tested via raw WebSocket tools for now.

Example desired future format:

travi spawn cube_1 x=0 y=1 z=0 color=red
travi move cube_1 dx=1 dy=0 dz=0

Phase 1 requirement: backend command router must be written in a way that future CLI ↔ WS mapping is easy.


---

9. Debugging System (Minimum)

debug-ui.js is required in Phase 1.

It must:

Render an overlay on top of the 3D canvas

Show at least:

connection status

recent commands

recent events

selected entity data

errors (client + backend reported)



9.1 Debug UI Specification

The Debug UI (debug-ui.js) provides real-time visibility into engine activity.

UI Responsibilities (Phase 1)

Must display:

WebSocket connection status:

CONNECTED | DISCONNECTED | RECONNECTING | ERROR

Last N commands sent (at least 10–20)
Display:

{ "timestamp": 0, "command": "spawn_entity", "params": { ... } }

Last N events received
Display:

{ "timestamp": 0, "event": "entity_updated", "payload": { ... } }

Selected entity inspector
When an entity is clicked/selected (Phase 2+), use this format:

{
  "entity_id": "",
  "type": "",
  "position": [],
  "rotation": [],
  "scale": [],
  "color": [],
  "meta": {}
}

Error stream
A scrolling list of errors.


Backend Logging Format (Phase 1)

Backend logs should use standard prefixes:

[WS-IN]  <timestamp> <raw_message>
[WS-OUT] <timestamp> <raw_message>
[STATE]  <timestamp> entity <id> mutated <field>
[ERROR]  <timestamp> <description>

Debug UI Hooks

Debug UI module must be able to subscribe to callbacks from:

onWebSocketMessage(msg) – raw incoming WS messages

onWorldStateUpdate(full_state) – when full STATE snapshot applied

onEntitySelected(entity_id) – for future editor features

onCommandSent(cmd) – when client sends a command


In Phase 1, not all hooks need to be wired, but the design must account for them.


---

10. AI Integration Hooks

ai_hooks.py (backend) defines no-op functions that will be used later.

Phase 1:

def on_world_update(world_state):
    # called after each successful world mutation
    pass

def on_command_received(cmd):
    # called before or after command application
    pass

No AI calls are required in Phase 1; only the functions and call sites must exist.


---

11. Phase 1 MVP Success Criteria

Phase 1 is considered successfully implemented when all of the following are true:

1. Backend runs in Termux:

cd server
python3 main.py

WebSocket server starts on the configured port (e.g. 8765)

Logs show new connections and messages



2. Client runs in browser:

cd client
python3 -m http.server 8000

http://localhost:8000 loads index.html

WebGPU initializes and clears screen



3. WebSocket connection is established:

Client connects to backend

Debug UI shows CONNECTED

On disconnect, shows DISCONNECTED and attempts reconnect



4. Entities sync correctly:

On connect, client receives a STATE message

On spawn_entity command:

Backend updates world_state

Emits entity_spawned or updated STATE

Client renders new cube


On move_entity:

Backend updates entity position

Emits entity_updated

Client moves cube




5. Terminal/Console commands work (at least via JS console for Phase 1):

From browser console, calling something like:

sendCommand({
  command: "spawn_entity",
  entity_type: "cube",
  position: [0,1,0],
  color: [1,0,0,1]
});

spawns a visible cube.



6. Debug UI works:

Shows connection status

Shows list of recent commands/events

Shows any ERROR messages

Does not crash the engine



7. Engine can recover from desync by STATE snapshot:

When client requests or receives a full STATE, the local scene resets to match backend.




If all of the above are true, Phase 1 is complete, and the engine is ready for:

Player movement

Camera modes (Hero/RTS)

NPCs

In-world editor



---

12. Future Expansion Reference (Not Implemented in Phase 1)

These systems are part of the long-term T-R-A-V-I vision, but not implemented in Phase 1. Specs will be defined in separate documents:

Universal Interaction Engine

Procedural Anatomy System

PEFS (Procedural Environment & Field System)

Regions, fields (pressure/heat/chaos/magic), digging, regrowth, reshuffling


Chaos & Magic Systems

Universal Material Hierarchy

Class & Bloodline Systems

Multiserver / Metaplanet Architecture

Weather Engine

Terrain Destruction Engine

Weapon System (8-layer)


Phase 1 defines the architecture and the minimal live loop only.


---

End of engine_spec.md

---

There you go.  
That spec now has **all the Phase 1 pieces we talked about**, in a professional structure:

- Files  
- Loops  
- WorldState  
- Message protocol  
- Debug UI  
- AI hooks  
- Phase 1 success criteria  

You can paste this straight into `docs/engine_spec.md` in your repo and then tell Copilot:

> “Use docs/engine_spec.md as the spec and scaffold the initial backend and client for Phase 1.”## 3.2 Client Loop (Browser) 
requestAnimationFrame(frame): apply incoming updates update scene logic render via WebGPU
--- # 4. Data Model ## 4.1 Entity Representation Backend stores entities as dictionaries: ```json { "entity_id": "cube_1", "type": "cube", "position": [0, 1, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1], "color": [1, 0, 0, 1], "meta": {} } 
More complex entity types (avatars, props, terrain) will extend this schema.

## 4.2 Player & Pet Entity Models

### Player Model
```json
{
  "entity_id": "player_001",
  "type": "player",
  "position": [0,1,0],
  "rotation": [0,0,0],
  "scale": [1,1,1],
  "color": [1,1,1,1],
  "stats": {"health":100,"stamina":100,"mana":50,"level":1,"experience":0},
  "movement": {"speed":5.0,"jump_strength":1.5},
  "inventory": [],
  "meta": {"player_name":"","class":"none","race":"none"}
}
```

### Pet Model
```json
{
  "entity_id": "pet_001",
  "type": "pet",
  "position": [0,1,0],
  "rotation":[0,0,0],
  "scale":[0.8,0.8,0.8],
  "stats":{"health":50,"loyalty":100},
  "behavior":{"mode":"follow","target_id":"player_001"},
  "meta":{"species":"wolf","abilities":[]}
}
```

### Backend Requirements
- Must recognize `"type": "player"` and `"type": "pet"`
- Auto-update pet following behavior
- Broadcast state updates to clients
- Validate stat changes

### Client Requirements
- `avatar.js` generates player model
- pets render with placeholder mesh (capsule/sphere)
- scene graph attaches pets to player for follow behavior

---

5. Message Protocol (WebSocket JSON)
5.1 Envelope
{ "type": "COMMAND" | "EVENT" | "STATE" | "ERROR" | "PING", "payload": {} } 
5.2 Core Commands (MVP)
• spawn_entity
• move_entity
• set_color
• delete_entity
5.3 Core Events
• entity_spawned
• entity_updated
• entity_deleted
5.4 Full State Snapshot
Sent on client connect or desync recovery.
6. Rendering Layer (WebGPU MVP)
6.1 Requirements
• Create a device + swapchain
• Basic render pipeline
• Depth buffer
• Single cube mesh initially
• Uniform buffers for transforms
6.2 Scene Graph
scene.js maintains objects mirrored from backend state.
7. Procedural Hooks (Phase 1 Placeholders)
7.1 Procedural Avatar Stub
avatar.js exposes:
export function createAvatarFromParameters(params) { return { mesh: "capsule", transform: {...}, material: {...}, meta: params }; } 
Full system added later.
7.2 Procedural Material / Field Stubs
Engine must allow:
• material properties
• field modifiers
• noise-based generation
Full mechanics defined in Universal Interaction Engine (separate file).
8. Editor Hooks
8.1 In-World Editing (Future)
• Click to select
• Move/rotate/scale
• Spawn/delete
• Modify parameters
8.2 Terminal Editing
Terminal commands map 1:1 to backend actions.
Example:
spawn cube_1 x=0 y=1 z=0 color=red 
9. Debugging System (Minimum)

## 9.1 Debug UI Specification

The Debug UI (`debug-ui.js`) provides real-time visibility into engine activity.

### UI Responsibilities
Must display:
- WebSocket connection status: `CONNECTED | DISCONNECTED | RECONNECTING | ERROR`
- Last 20 commands sent
- Last 20 events received
- Selected entity inspector
- Error stream

### Selected Entity Inspector Format
```json
{
  "entity_id": "",
  "type": "",
  "position": [],
  "rotation": [],
  "scale": [],
  "color": [],
  "meta": {}
}
```

### Backend Logging Format
```
[WS-IN]  <timestamp> <raw_message>
[WS-OUT] <timestamp> <raw_message>
[STATE]  <timestamp> entity <id> mutated <field>
[ERROR]  <timestamp> <description>
```

### Debug UI Hooks
- onWebSocketMessage(msg)
- onWorldStateUpdate(full_state)
- onEntitySelected(entity_id)
- onCommandSent(cmd)

---
10. AI Integration Hooks
ai_hooks.py placeholder API:
def on_world_update(world_state): pass def on_command_received(cmd): pass 
AI is NOT required for MVP but architecture must allow future integration.
11. MVP Success Criteria
The engine is considered “booted” when:
• Python backend runs in Termux
• WebSocket connection is established
• Browser renders a WebGPU cube
• Terminal command → cube moves in real time
• Web client action → backend updates state
• Debug UI shows events and messages
• Entities spawn / update / delete correctly
12. Future Expansion Reference (Not Implemented Here)
The following systems exist but are defined elsewhere:
• Universal Interaction Engine
• Procedural Anatomy System
• Chaos & Magic Systems
• Universal Material Hierarchy
• Class & Bloodline Systems
• Multiserver/Metaplanet Architecture
• Weather Engine
• Terrain Destruction Engine
• Weapon System (8-layer)

This file defines architecture only.

---

**End of engine_spec.md**
