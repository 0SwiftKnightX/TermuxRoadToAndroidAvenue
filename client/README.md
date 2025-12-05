# T-R-A-V-I Engine Client

WebGPU-based browser client for the T-R-A-V-I engine.

## Requirements

- Modern web browser with WebGPU support (Chrome 113+, Edge 113+)
- WebSocket connection to backend server

## Running the Client

1. Start the backend server (see `../server/README.md`)

2. Serve the client files using a web server. For example:

```bash
# Using Python's built-in server
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000
```

3. Open your browser to `http://localhost:8000`

## Architecture

- **index.html** - Main HTML page
- **main.js** - Application entry point
- **engine.js** - WebGPU rendering engine
- **webgpu-context.js** - WebGPU initialization
- **scene.js** - Scene graph management
- **ws-client.js** - WebSocket client
- **debug-ui.js** - Debug overlay UI
- **avatar.js** - Placeholder for procedural avatar system

## Usage

The client automatically connects to the WebSocket server at `ws://localhost:8765` on startup.

### Console API

You can interact with the engine from the browser console using the `window.TRAVI` object:

```javascript
// Spawn a cube
TRAVI.spawnCube("cube1", 0, 1, 0, [1, 0, 0, 1]);

// Move a cube
TRAVI.moveCube("cube1", 2, 1, 0);

// Change color (RGBA values 0-1)
TRAVI.setColor("cube1", 0, 1, 0, 1);

// Delete a cube
TRAVI.deleteCube("cube1");
```

## Features

- **WebGPU Rendering** - Hardware-accelerated 3D graphics
- **Real-time Sync** - WebSocket connection to backend
- **Debug UI** - Live connection status and event log
- **Interactive Camera** - Automatic orbit camera
- **Entity Management** - Spawn, move, color, and delete entities

## Browser Compatibility

WebGPU is currently supported in:
- Chrome/Edge 113+ (stable)
- Firefox Nightly (behind flag)
- Safari Technology Preview (experimental)

To enable WebGPU in unsupported browsers, check the browser's flags/experimental features.

## Troubleshooting

### "WebGPU not supported"
- Ensure you're using a compatible browser version
- Check that hardware acceleration is enabled
- Try enabling WebGPU in browser flags

### "WebSocket connection failed"
- Ensure the backend server is running on `localhost:8765`
- Check browser console for detailed error messages
- Verify no firewall is blocking the connection

### Debug UI
The debug overlay in the top-left corner shows:
- Connection status
- Number of entities
- Recent events and messages

Use this to monitor the engine's state and diagnose issues.
