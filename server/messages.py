"""Message protocol definitions for WebSocket communication"""
import json
from typing import Dict, Any


class MessageType:
    """Message type constants"""
    COMMAND = "COMMAND"
    EVENT = "EVENT"
    STATE = "STATE"
    ERROR = "ERROR"
    PING = "PING"


def create_message(msg_type: str, payload: Dict[str, Any]) -> str:
    """Create a JSON message envelope"""
    return json.dumps({
        "type": msg_type,
        "payload": payload
    })


def parse_message(data: str) -> Dict[str, Any]:
    """Parse a JSON message and return the envelope"""
    try:
        msg = json.loads(data)
        if "type" not in msg or "payload" not in msg:
            raise ValueError("Invalid message format")
        return msg
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(f"Failed to parse message: {e}")


def create_state_message(world_state: Dict[str, Any]) -> str:
    """Create a STATE message containing full world snapshot"""
    return create_message(MessageType.STATE, {
        "entities": world_state
    })


def create_event_message(event_type: str, data: Dict[str, Any]) -> str:
    """Create an EVENT message"""
    return create_message(MessageType.EVENT, {
        "event_type": event_type,
        "data": data
    })


def create_error_message(error: str) -> str:
    """Create an ERROR message"""
    return create_message(MessageType.ERROR, {
        "message": error
    })
