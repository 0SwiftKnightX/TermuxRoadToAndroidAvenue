# T-R-A-V-I Engine Server

Python backend for the T-R-A-V-I engine.

## Requirements

- Python 3.8+
- websockets library

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python3 main.py
```

The server will start on `localhost:8765` by default.

## Architecture

- **main.py** - Entry point for the server
- **ws_server.py** - WebSocket server implementation
- **world_state.py** - World state management
- **messages.py** - Message protocol definitions
- **command_router.py** - Command handling and routing
- **ai_hooks.py** - Placeholder for future AI integration

## Supported Commands

The server supports the following commands via WebSocket:

### spawn_entity
Spawns a new entity in the world.

```json
{
  "type": "COMMAND",
  "payload": {
    "command": "spawn_entity",
    "params": {
      "entity_id": "cube_1",
      "type": "cube",
      "position": [0, 1, 0],
      "color": [1, 0, 0, 1]
    }
  }
}
```

### move_entity
Moves an existing entity.

```json
{
  "type": "COMMAND",
  "payload": {
    "command": "move_entity",
    "params": {
      "entity_id": "cube_1",
      "position": [2, 1, 0]
    }
  }
}
```

### set_color
Changes an entity's color.

```json
{
  "type": "COMMAND",
  "payload": {
    "command": "set_color",
    "params": {
      "entity_id": "cube_1",
      "color": [0, 1, 0, 1]
    }
  }
}
```

### delete_entity
Removes an entity from the world.

```json
{
  "type": "COMMAND",
  "payload": {
    "command": "delete_entity",
    "params": {
      "entity_id": "cube_1"
    }
  }
}
```

## Message Protocol

All messages follow this envelope structure:

```json
{
  "type": "COMMAND" | "EVENT" | "STATE" | "ERROR" | "PING",
  "payload": {}
}
```

### Message Types

- **COMMAND** - Client sends command to server
- **EVENT** - Server broadcasts entity changes
- **STATE** - Server sends full world state (on connect)
- **ERROR** - Server reports error
- **PING** - Keep-alive message

## Testing

Run the test client:

```bash
python3 test_client.py
```

This will test all basic commands and verify the server is working correctly.
