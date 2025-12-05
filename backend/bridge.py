# backend/bridge.py
import asyncio
import time
import logging
from typing import Set
import websockets
from websockets.exceptions import ConnectionClosedOK, ConnectionClosedError

from state import WorldState
from protocol import MessageType, encode_message, decode_message

logging.basicConfig(level=logging.INFO)
LOGGER = logging.getLogger("bridge")

HOST = "0.0.0.0"
PORT = 8765
TICK_RATE = 30.0  # Hz

world = WorldState()
clients: Set[websockets.WebSocketServerProtocol] = set()

async def send_world_state(client: websockets.WebSocketServerProtocol) -> None:
    msg = encode_message(MessageType.WORLD_STATE, world.to_dict())
    await client.send(msg)

async def broadcast_world_state() -> None:
    if not clients:
        return
    msg = encode_message(MessageType.WORLD_STATE, world.to_dict())
    await asyncio.gather(
        *(c.send(msg) for c in clients),
        return_exceptions=True
    )

async def handle_client(ws: websockets.WebSocketServerProtocol) -> None:
    clients.add(ws)
    LOGGER.info("Client connected. total=%d", len(clients))

    # Send initial hello + state
    await ws.send(encode_message(MessageType.HELLO, {"msg": "Welcome to T-R-A-V-I core"}))
    await send_world_state(ws)

    try:
        async for raw in ws:
            try:
                msg = decode_message(raw)
            except Exception as e:
                LOGGER.exception("Decode error: %s", e)
                await ws.send(encode_message(MessageType.ERROR, {"reason": "bad_json"}))
                continue

            msg_type = msg["type"]
            payload = msg["payload"]

            if msg_type == MessageType.PING:
                await ws.send(encode_message(MessageType.PONG, {"ts": time.time()}))

            elif msg_type == MessageType.CLIENT_INPUT:
                # Forward to world state
                world.apply_input(payload)

            else:
                LOGGER.info("Unhandled message type from client: %s", msg_type)

    except (ConnectionClosedOK, ConnectionClosedError):
        LOGGER.info("Client disconnected.")
    finally:
        clients.discard(ws)
        LOGGER.info("Client removed. total=%d", len(clients))

async def game_loop() -> None:
    last = time.time()
    while True:
        now = time.time()
        dt = now - last
        last = now

        world.update(dt)
        await broadcast_world_state()

        await asyncio.sleep(max(0.0, (1.0 / TICK_RATE) - (time.time() - now)))

async def main() -> None:
    LOGGER.info("Starting WebSocket server on %s:%d", HOST, PORT)
    async with websockets.serve(handle_client, HOST, PORT):
        await game_loop()

if __name__ == "__main__":
    asyncio.run(main())
