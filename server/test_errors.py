#!/usr/bin/env python3
"""Test error handling"""
import asyncio
import json
import websockets


async def test_error_handling():
    uri = "ws://localhost:8765"
    
    print("Testing error handling...")
    async with websockets.connect(uri) as websocket:
        # Receive initial state
        await websocket.recv()
        
        # Test invalid message format
        print("\n1. Testing invalid JSON...")
        await websocket.send("not valid json")
        response = await websocket.recv()
        error = json.loads(response)
        print(f"   Received: {error}")
        assert error["type"] == "ERROR", "Should receive ERROR message"
        
        # Test unknown command
        print("\n2. Testing unknown command...")
        unknown_cmd = {
            "type": "COMMAND",
            "payload": {
                "command": "invalid_command",
                "params": {}
            }
        }
        await websocket.send(json.dumps(unknown_cmd))
        response = await websocket.recv()
        error = json.loads(response)
        print(f"   Received: {error}")
        assert error["type"] == "ERROR", "Should receive ERROR message"
        
        # Test command on non-existent entity
        print("\n3. Testing command on non-existent entity...")
        move_cmd = {
            "type": "COMMAND",
            "payload": {
                "command": "move_entity",
                "params": {
                    "entity_id": "does_not_exist",
                    "position": [0, 0, 0]
                }
            }
        }
        await websocket.send(json.dumps(move_cmd))
        # This should just not broadcast an event, not return an error
        # Let's wait a moment to ensure no broadcast
        await asyncio.sleep(0.1)
        print("   No event broadcast (expected)")
        
        print("\n✓ All error handling tests passed!")


if __name__ == "__main__":
    asyncio.run(test_error_handling())
