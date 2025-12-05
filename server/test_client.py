#!/usr/bin/env python3
"""Simple test client for the T-R-A-V-I server"""
import asyncio
import json
import websockets


async def test_client():
    uri = "ws://localhost:8765"
    
    print("Connecting to server...")
    async with websockets.connect(uri) as websocket:
        print("Connected!")
        
        # Receive initial state
        response = await websocket.recv()
        state = json.loads(response)
        print(f"Received STATE: {state}")
        
        # Test spawn_entity command
        print("\nSending spawn_entity command...")
        spawn_cmd = {
            "type": "COMMAND",
            "payload": {
                "command": "spawn_entity",
                "params": {
                    "entity_id": "test_cube_1",
                    "type": "cube",
                    "position": [0, 1, 0],
                    "color": [1, 0, 0, 1]
                }
            }
        }
        await websocket.send(json.dumps(spawn_cmd))
        
        # Receive response
        response = await websocket.recv()
        event = json.loads(response)
        print(f"Received EVENT: {event}")
        
        # Test move_entity command
        print("\nSending move_entity command...")
        move_cmd = {
            "type": "COMMAND",
            "payload": {
                "command": "move_entity",
                "params": {
                    "entity_id": "test_cube_1",
                    "position": [2, 1, 0]
                }
            }
        }
        await websocket.send(json.dumps(move_cmd))
        
        # Receive response
        response = await websocket.recv()
        event = json.loads(response)
        print(f"Received EVENT: {event}")
        
        # Test set_color command
        print("\nSending set_color command...")
        color_cmd = {
            "type": "COMMAND",
            "payload": {
                "command": "set_color",
                "params": {
                    "entity_id": "test_cube_1",
                    "color": [0, 1, 0, 1]
                }
            }
        }
        await websocket.send(json.dumps(color_cmd))
        
        # Receive response
        response = await websocket.recv()
        event = json.loads(response)
        print(f"Received EVENT: {event}")
        
        print("\n✓ All tests passed!")


if __name__ == "__main__":
    asyncio.run(test_client())
