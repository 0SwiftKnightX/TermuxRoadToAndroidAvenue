# T-R-A-V-I Engine Specification

**TermuxRoadToAndroidAvenue – Core Engine Architecture**

**Codename:** T-R-A-V-I

**Purpose:** A modular, extensible game engine where:
- The **game is the editor** and the **editor is the game**
- An AI assistant can modify code, assets, and world state
- Worlds, avatars, entities, and environments are **procedural and data-driven**
- Everything runs on **Android (Termux)** + **Browser (WebGPU)** using a live WebSocket bridge

This file defines the **minimum stable structure** the engine must follow.

---

# 1. Runtime Overview

## 1.1 Backend (Termux – Python)

Responsibilities:
- WebSocket server
- World state authority
- Command handling
- Entity lifecycle management
- Procedural generation hooks
- Future AI agent integration

## 1.2 Client (Browser – WebGPU)

Responsibilities:
- Rendering
- Scene management
- Input capture
- Sync with backend state
- Editor overlays
- Procedural graphics hooks

## 1.3 Communication Layer

Backend ↔ Client via WebSocket JSON. Backend owns truth; client mirrors it.

---

# 2. Project Structure 
server/ init.py main.py ws_server.py command_router.py world_state.py messages.py ai_hooks.py
client/ index.html main.js ws-client.js engine.js webgpu-context.js scene.js avatar.js debug-ui.js
docs/ engine_spec.md setup_termux.md pipeline_overview.md
README.md
--- # 3. Core Loop ## 3.1 Backend Loop (Python) 
while server_running: receive WS messages parse → route → apply to world_state broadcast updates to clients
## 3.2 Client Loop (Browser) 
requestAnimationFrame(frame): apply incoming updates update scene logic render via WebGPU
--- # 4. Data Model ## 4.1 Entity Representation Backend stores entities as dictionaries: ```json { "entity_id": "cube_1", "type": "cube", "position": [0, 1, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1], "color": [1, 0, 0, 1], "meta": {} } 
More complex entity types (avatars, props, terrain) will extend this schema.
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
debug-ui.js must display:
• connection status
• error messages
• recent commands
• selected entity data
Backend must log:
• bad messages
• unknown commands
• state mutations
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