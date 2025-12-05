# backend/protocol.py
import json
from enum import Enum

class MessageType(str, Enum):
    HELLO = "hello"
    WORLD_STATE = "world_state"
    CLIENT_INPUT = "client_input"
    PING = "ping"
    PONG = "pong"
    ERROR = "error"

def encode_message(msg_type: MessageType, payload: dict | None = None) -> str:
    return json.dumps({
        "type": msg_type,
        "payload": payload or {}
    })

def decode_message(raw: str) -> dict:
    """
    Returns dict with keys: type (str), payload (dict)
    """
    data = json.loads(raw)
    return {
        "type": data.get("type"),
        "payload": data.get("payload") or {}
    }
