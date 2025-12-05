"""WebSocket server for T-R-A-V-I engine"""
import asyncio
import websockets
import logging
from typing import Set
from websockets.server import WebSocketServerProtocol
from world_state import WorldState
from command_router import CommandRouter
from messages import (
    parse_message, create_state_message, create_error_message,
    MessageType
)

logger = logging.getLogger(__name__)


class WebSocketServer:
    """Manages WebSocket connections and message routing"""
    
    def __init__(self, host: str = "localhost", port: int = 8765):
        self.host = host
        self.port = port
        self.clients: Set[WebSocketServerProtocol] = set()
        self.world_state = WorldState()
        self.command_router = CommandRouter(self.world_state)
        
    async def register(self, websocket: WebSocketServerProtocol):
        """Register a new client and send initial state"""
        self.clients.add(websocket)
        logger.info(f"Client connected. Total clients: {len(self.clients)}")
        
        # Send current world state to new client
        state_msg = create_state_message(self.world_state.get_all_entities())
        await websocket.send(state_msg)
        
    async def unregister(self, websocket: WebSocketServerProtocol):
        """Unregister a disconnected client"""
        self.clients.discard(websocket)
        logger.info(f"Client disconnected. Total clients: {len(self.clients)}")
        
    async def broadcast(self, message: str):
        """Broadcast a message to all connected clients"""
        if self.clients:
            await asyncio.gather(
                *[client.send(message) for client in self.clients],
                return_exceptions=True
            )
            
    async def handle_client(self, websocket: WebSocketServerProtocol):
        """Handle messages from a single client"""
        await self.register(websocket)
        
        try:
            async for message in websocket:
                await self.process_message(message)
        except websockets.exceptions.ConnectionClosed:
            logger.info("Client connection closed")
        finally:
            await self.unregister(websocket)
            
    async def process_message(self, raw_message: str):
        """Process incoming message and broadcast updates"""
        try:
            msg = parse_message(raw_message)
            msg_type = msg["type"]
            payload = msg["payload"]
            
            if msg_type == MessageType.COMMAND:
                command = payload.get("command")
                params = payload.get("params", {})
                
                if command:
                    event_msg = self.command_router.route_command(command, params)
                    if event_msg:
                        await self.broadcast(event_msg)
                    else:
                        logger.warning(f"Command failed or unknown: {command}")
                        
            elif msg_type == MessageType.PING:
                # Simple ping/pong for connection health
                pass
                
        except ValueError as e:
            logger.error(f"Invalid message received: {e}")
            error_msg = create_error_message(str(e))
            # Note: We'd need to track which client sent the message to respond directly
            # For now, just log the error
            
    async def start(self):
        """Start the WebSocket server"""
        logger.info(f"Starting WebSocket server on {self.host}:{self.port}")
        async with websockets.serve(self.handle_client, self.host, self.port):
            logger.info("WebSocket server is running")
            await asyncio.Future()  # Run forever
