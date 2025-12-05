# T-R-A-V-I Pipeline Overview

This document describes the complete data flow and architecture of the T-R-A-V-I engine, from terminal commands to visual output in the browser.

## High-Level Architecture

```
┌─────────────────┐
│   Termux/CLI    │  (Future: AI Agents, Terminal Commands)
│   (Android)     │
└────────┬────────┘
         │ Future
         ▼
┌─────────────────────────────────────────────────────┐
│              Backend (Python)                        │
│  ┌──────────────────────────────────────────────┐   │
│  │           WebSocket Server                    │   │
│  │            (ws_server.py)                     │   │
│  │  - Accept connections                         │   │
│  │  - Send STATE on connect                      │   │
│  │  - Broadcast EVENTs                           │   │
│  └──────────────┬────────────────────────────────┘   │
│                 │                                     │
│                 ▼                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │        Command Router                         │   │
│  │        (command_router.py)                    │   │
│  │  - Parse JSON messages                        │   │
│  │  - Route to handlers                          │   │
│  │  - Validate commands                          │   │
│  └──────────────┬────────────────────────────────┘   │
│                 │                                     │
│                 ▼                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │         World State (Authority)               │   │
│  │         (world_state.py)                      │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │  entities = {                           │ │   │
│  │  │    "id": {                              │ │   │
│  │  │      position: [x, y, z],               │ │   │
│  │  │      color: [r, g, b, a],               │ │   │
│  │  │      scale: [x, y, z]                   │ │   │
│  │  │    }                                     │ │   │
│  │  │  }                                       │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  │  - spawn_entity()                            │   │
│  │  - move_entity()                             │   │
│  │  - set_color()                               │   │
│  │  - delete_entity()                           │   │
│  └──────────────┬────────────────────────────────┘   │
│                 │                                     │
│                 ▼                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │           AI Hooks (Future)                   │   │
│  │           (ai_hooks.py)                       │   │
│  │  - Procedural generation                      │   │
│  │  - AI-driven modifications                    │   │
│  │  - System integrations                        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         │
         │ WebSocket (JSON Messages)
         │ ws://localhost:8765
         │
         ▼
┌─────────────────────────────────────────────────────┐
│              Browser Client (JavaScript)             │
│  ┌──────────────────────────────────────────────┐   │
│  │         WebSocket Client                      │   │
│  │         (ws-client.js)                        │   │
│  │  - Connect/reconnect                          │   │
│  │  - Send COMMANDs                              │   │
│  │  - Receive STATE/EVENTs                       │   │
│  └──────────────┬────────────────────────────────┘   │
│                 │                                     │
│                 ▼                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │          Message Handler                      │   │
│  │          (main.js)                            │   │
│  │  - Route messages by type                     │   │
│  │  - Update scene on STATE                      │   │
│  │  - Apply EVENTs incrementally                 │   │
│  └──────────────┬────────────────────────────────┘   │
│                 │                                     │
│                 ▼                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │        Scene Graph (Mirror)                   │   │
│  │        (scene.js)                             │   │
│  │  - Local copy of entities                     │   │
│  │  - Add/update/remove based on EVENTs          │   │
│  │  - Provide render data to engine              │   │
│  └──────────────┬────────────────────────────────┘   │
│                 │                                     │
│                 ▼                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │      WebGPU Rendering Engine                  │   │
│  │      (engine.js, webgpu-context.js)           │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │  Render Loop (60 FPS)                   │ │   │
│  │  │  1. Update camera                        │ │   │
│  │  │  2. Build vertex buffers                 │ │   │
│  │  │  3. Render each entity                   │ │   │
│  │  │  4. requestAnimationFrame()              │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  │  - Hardware-accelerated GPU rendering         │   │
│  │  - Perspective projection + depth buffer      │   │
│  └──────────────┬────────────────────────────────┘   │
│                 │                                     │
│                 ▼                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │          Debug UI Overlay                     │   │
│  │          (debug-ui.js)                        │   │
│  │  - Connection status                          │   │
│  │  - Entity count                               │   │
│  │  - Event log                                  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Display/GPU   │  (3D rendered scene)
│   (WebGPU)      │
└─────────────────┘
```

## Message Flow

### 1. Client Connection

```
Client                                    Server
  │                                         │
  ├─── WebSocket Connect ─────────────────▶│
  │                                         │
  │                                         ├─ Add to clients list
  │                                         ├─ Get full world state
  │                                         │
  │◀──── STATE message (full snapshot) ────┤
  │      { type: "STATE",                   │
  │        entities: {...} }                │
  │                                         │
  ├─ Parse STATE                            │
  ├─ Clear local scene                      │
  ├─ Rebuild scene from STATE               │
  ├─ Start rendering                        │
  │                                         │
```

### 2. Command Execution

```
Client                                    Server
  │                                         │
  ├─ User action (console command)          │
  │                                         │
  ├─── COMMAND message ───────────────────▶│
  │    { type: "COMMAND",                   │
  │      name: "spawn_entity",              ├─ Receive command
  │      payload: {...} }                   ├─ Route to handler
  │                                         ├─ Validate parameters
  │                                         ├─ Update world_state
  │                                         │
  │◀──── EVENT broadcast (to all) ─────────┤
  │      { type: "EVENT",                   ├─ Broadcast to all clients
  │        name: "entity_spawned",          │
  │        payload: {...} }                 │
  │                                         │
  ├─ Apply event to scene                   │
  ├─ Update rendering                       │
  │                                         │
```

### 3. Error Handling

```
Client                                    Server
  │                                         │
  ├─── COMMAND (invalid) ────────────────▶│
  │                                         │
  │                                         ├─ Validation fails
  │                                         │
  │◀──── ERROR message (to sender only) ───┤
  │      { type: "ERROR",                   │
  │        message: "...",                  │
  │        code: 400 }                      │
  │                                         │
  ├─ Log error                              │
  ├─ Display in debug UI                    │
  │                                         │
```

## Message Protocol

### Message Types

All messages are JSON with an envelope structure:

```json
{
  "type": "MESSAGE_TYPE",
  "name": "specific_action",
  "payload": { /* type-specific data */ },
  "timestamp": 1234567890
}
```

### COMMAND (Client → Server)

Requests from client to modify world state:

```javascript
{
  "type": "COMMAND",
  "name": "spawn_entity",
  "payload": {
    "entity_id": "cube1",
    "position": [0, 1, 0],
    "color": [1, 0, 0, 1],
    "scale": [1, 1, 1]
  }
}
```

**Supported Commands:**
- `spawn_entity` - Create new entity
- `move_entity` - Update position
- `set_color` - Change color
- `delete_entity` - Remove entity

### EVENT (Server → All Clients)

Broadcasts changes to all connected clients:

```javascript
{
  "type": "EVENT",
  "name": "entity_spawned",
  "payload": {
    "entity_id": "cube1",
    "position": [0, 1, 0],
    "color": [1, 0, 0, 1],
    "scale": [1, 1, 1]
  }
}
```

**Supported Events:**
- `entity_spawned` - New entity created
- `entity_updated` - Entity modified (position/color/scale)
- `entity_deleted` - Entity removed

### STATE (Server → Client on Connect)

Complete world snapshot sent when client connects:

```javascript
{
  "type": "STATE",
  "entities": {
    "cube1": {
      "position": [0, 1, 0],
      "color": [1, 0, 0, 1],
      "scale": [1, 1, 1]
    },
    "cube2": {
      "position": [2, 1, 0],
      "color": [0, 1, 0, 1],
      "scale": [1, 1, 1]
    }
  }
}
```

### ERROR (Server → Specific Client)

Error response for invalid commands:

```javascript
{
  "type": "ERROR",
  "message": "Entity 'nonexistent' not found",
  "code": 404
}
```

**Error Codes:**
- `400` - Bad request (invalid command/payload)
- `404` - Entity not found
- `500` - Server error

## Data Flow Examples

### Example 1: Spawning a Cube

1. **User Action:** Developer opens browser console
2. **Console Command:** `TRAVI.spawnCube("cube1", 0, 1, 0, [1, 0, 0, 1])`
3. **main.js:** Creates COMMAND message, sends via WebSocket
4. **ws_server.py:** Receives message, passes to command_router
5. **command_router.py:** Validates, calls `world_state.spawn_entity()`
6. **world_state.py:** Adds entity to `self.entities` dictionary
7. **ws_server.py:** Broadcasts EVENT message to all clients
8. **ws-client.js:** Receives EVENT, passes to message handler
9. **main.js:** Calls `scene.addEntity()`
10. **scene.js:** Adds entity to local scene graph
11. **engine.js:** Next frame renders the new cube
12. **Result:** Cube appears in 3D scene

### Example 2: Moving an Existing Cube

1. **Console Command:** `TRAVI.moveCube("cube1", 5, 1, 0)`
2. **COMMAND sent:** `{ type: "COMMAND", name: "move_entity", ... }`
3. **Backend:** Updates `entities["cube1"]["position"]`
4. **EVENT broadcast:** `{ type: "EVENT", name: "entity_updated", ... }`
5. **Frontend:** Updates scene graph position
6. **Next frame:** Cube renders at new position

### Example 3: Multi-Client Synchronization

```
Client A                Server                Client B
   │                      │                      │
   ├─ spawn_entity ──────▶│                      │
   │                      ├─ Update state        │
   │                      ├─ Broadcast EVENT ───▶│
   │◀─── EVENT ───────────┤                      │
   │                      │                      ├─ Add to scene
   ├─ Add to scene        │                      ├─ Render cube
   ├─ Render cube         │                      │
```

Both clients see the same entity in real-time.

## Rendering Pipeline

### WebGPU Render Loop

```
┌─────────────────────────────────────────────┐
│  requestAnimationFrame()                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  1. Update Camera                            │
│     - Increment rotation angle               │
│     - Calculate view matrix (lookAt)         │
│     - Calculate projection matrix            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  2. Collect Entities from Scene              │
│     - scene.getEntities()                    │
│     - Get position, color, scale             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  3. Build Geometry                           │
│     - Generate cube vertices                 │
│     - Apply transformations (position/scale) │
│     - Apply colors to vertices               │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  4. GPU Upload                               │
│     - Create/update vertex buffer            │
│     - Create/update uniform buffer (MVP)     │
│     - device.queue.writeBuffer()             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  5. Render Pass                              │
│     - Begin render pass                      │
│     - Set pipeline                           │
│     - Set bind groups (uniforms)             │
│     - Set vertex buffer                      │
│     - Draw call (vertices)                   │
│     - End render pass                        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  6. Present                                  │
│     - Submit command buffer                  │
│     - Present to screen                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
            Loop repeats (60 FPS)
```

## Key Design Principles

### 1. Backend is Authority

- All state changes happen server-side first
- Clients never modify state directly
- Commands go up, events come down

### 2. Client is a Mirror

- Client scene is a reflection of server state
- STATE message ensures perfect sync on connect
- EVENTs keep clients updated incrementally

### 3. Eventual Consistency

- Network lag is handled gracefully
- All clients eventually see the same state
- No client-side prediction in Phase 1 (future enhancement)

### 4. Extensibility

- Command routing is modular (easy to add new commands)
- World state can grow (regions, fields, etc.)
- AI hooks ready for integration
- Scene graph can support complex hierarchies

## Performance Characteristics

### Backend

- **Async/Await:** Non-blocking I/O for WebSocket operations
- **Broadcast:** O(n) where n = number of connected clients
- **State Lookup:** O(1) dictionary access for entities
- **Memory:** ~1KB per entity in Phase 1

### Frontend

- **WebGPU Rendering:** 60 FPS with hundreds of entities
- **Scene Updates:** O(1) for add/update/delete
- **State Sync:** O(n) where n = number of entities (on connect only)
- **Memory:** ~2KB per entity (GPU buffers + scene data)

### Network

- **Message Size:** ~100-500 bytes per command/event
- **Latency:** Depends on network (~10-100ms typical)
- **Reconnect:** Automatic with exponential backoff
- **Bandwidth:** ~1-10KB/s per active client

## Future Enhancements

### Phase 2+

1. **Terminal Integration**
   - CLI commands to control the engine
   - Real-time code editing from terminal
   - AI agent integration

2. **Advanced Rendering**
   - Procedural avatars (avatar.js)
   - Lighting and shadows
   - Post-processing effects

3. **Complex World State**
   - Regions (spatial partitioning)
   - Fields (pressure, chaos, magic)
   - Weather and environment

4. **Multi-Server Architecture**
   - Server-to-server communication
   - Load balancing
   - Persistent world storage

## Debugging Tools

### Backend Logging

The server logs all major operations:
```
[2025-12-05 13:30:00] Client connected: ws://localhost:8765
[2025-12-05 13:30:01] Command: spawn_entity -> cube1
[2025-12-05 13:30:02] Broadcasting entity_spawned to 1 clients
```

### Client Debug UI

Real-time overlay showing:
- **Connection Status:** Connected/Disconnected
- **Entity Count:** Number of entities in scene
- **Event Log:** Last 20 events with timestamps

### Browser Console

The `TRAVI` global object provides:
```javascript
TRAVI.spawnCube(id, x, y, z, color)
TRAVI.moveCube(id, x, y, z)
TRAVI.setColor(id, r, g, b, a)
TRAVI.deleteCube(id)
```

All commands log their actions to the console.

## Conclusion

The T-R-A-V-I pipeline is designed as a clean, extensible foundation for real-time 3D editing. The Phase 1 MVP demonstrates:

- **Real-time synchronization** between backend and browser
- **Command-driven architecture** ready for AI integration
- **Hardware-accelerated rendering** using WebGPU
- **Modular design** for future expansion

This architecture supports the vision of "the game is the editor" where every element can be modified in real-time, with changes immediately visible across all connected clients.

---

**Next Steps:**
- Explore [setup_termux.md](setup_termux.md) to run on Android
- Read [engine_spec.md](engine_spec.md) for complete technical details
- Check the [main README](../README.md) for quick start guide
