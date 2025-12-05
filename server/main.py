"""T-R-A-V-I Engine Server - Main Entry Point"""
import asyncio
import logging
from ws_server import WebSocketServer


def setup_logging():
    """Configure logging for the server"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )


def main():
    """Start the T-R-A-V-I engine server"""
    setup_logging()
    logger = logging.getLogger(__name__)
    
    logger.info("Initializing T-R-A-V-I Engine Server...")
    
    # Create and start WebSocket server
    server = WebSocketServer(host="localhost", port=8765)
    
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise


if __name__ == "__main__":
    main()
