# Running T-R-A-V-I in Termux

This guide explains how to run the T-R-A-V-I backend server in Termux on Android devices.

## Prerequisites

### 1. Install Termux

Download and install Termux from:
- [F-Droid](https://f-droid.org/packages/com.termux/) (Recommended)
- [GitHub Releases](https://github.com/termux/termux-app/releases)

**Note:** The Google Play Store version is deprecated and should not be used.

### 2. Update Termux Packages

```bash
pkg update && pkg upgrade
```

### 3. Install Python

```bash
pkg install python
```

Verify installation:
```bash
python --version
```

You should see Python 3.8 or higher.

### 4. Install Git (Optional, for cloning)

```bash
pkg install git
```

## Setting Up the Backend

### 1. Clone or Transfer the Repository

**Option A: Clone from GitHub**
```bash
cd ~
git clone https://github.com/0SwiftKnightX/TermuxRoadToAndroidAvenue.git
cd TermuxRoadToAndroidAvenue
```

**Option B: Transfer files**
- Copy the project folder to your device
- Move it to Termux storage (e.g., `/storage/emulated/0/`)
- Access it from Termux:
```bash
termux-setup-storage  # Grant storage permission
cd ~/storage/shared/TermuxRoadToAndroidAvenue
```

### 2. Install Python Dependencies

```bash
cd server
pip install -r requirements.txt
```

This will install:
- `websockets>=12.0` - For WebSocket server functionality

### 3. Start the Backend Server

```bash
python main.py
```

You should see output similar to:
```
T-R-A-V-I Backend Server Starting...
WebSocket server started on ws://localhost:8765
Server ready. Waiting for clients...
```

The server is now running and listening for WebSocket connections on port 8765.

## Connecting the Client

### 1. Find Your Device's IP Address

In Termux, run:
```bash
ifconfig wlan0 | grep "inet "
```

Or:
```bash
pkg install net-tools
ifconfig
```

Look for your local IP address (typically starts with `192.168.` or `10.0.`).

### 2. Update Client Connection (if needed)

If connecting from another device, you may need to update the WebSocket URL in `client/ws-client.js`:

```javascript
const WS_URL = 'ws://YOUR_DEVICE_IP:8765';
```

### 3. Serve the Client

**Option A: On the same Android device**
- Open a new Termux session (swipe from left, tap "New Session")
- Navigate to the client directory:
```bash
cd ~/TermuxRoadToAndroidAvenue/client
python -m http.server 8000
```
- Open a browser on your device and go to `http://localhost:8000`

**Option B: On another device (PC, tablet, etc.)**
- Serve the client from your computer or another device
- Update the WebSocket URL to point to your Android device's IP
- Open the browser and connect

### 4. Verify Connection

In the browser console, you should see:
```
WebSocket connected to ws://localhost:8765
```

The debug UI overlay will show "Connected" status.

## Testing the Engine

### Using the Console API

Open the browser developer console and try these commands:

```javascript
// Spawn a red cube
TRAVI.spawnCube("cube1", 0, 1, 0, [1, 0, 0, 1]);

// Move it
TRAVI.moveCube("cube1", 2, 1, 0);

// Change to green
TRAVI.setColor("cube1", 0, 1, 0, 1);

// Delete it
TRAVI.deleteCube("cube1");
```

You should see the cube appear, move, change color, and disappear in real-time.

## Running Tests

### Backend Tests

```bash
cd server

# Test basic functionality
python test_client.py

# Test error handling
python test_errors.py
```

All tests should pass with green checkmarks.

## Troubleshooting

### Server Won't Start

**"Address already in use"**
- Kill the existing process:
```bash
pkill -f "python main.py"
```
- Or change the port in `server/main.py`

**"Module not found: websockets"**
- Reinstall dependencies:
```bash
pip install --force-reinstall -r requirements.txt
```

### Client Can't Connect

**"WebSocket connection failed"**
- Verify the server is running in Termux
- Check the WebSocket URL in `ws-client.js`
- Ensure both devices are on the same network (for remote connections)
- Check firewall settings

**"WebGPU not supported"**
- Use a modern browser: Chrome 113+, Edge 113+, or Opera 99+
- Update your browser to the latest version
- Check `chrome://gpu` to verify WebGPU support

### Performance Issues

**Server lag**
- Close other apps to free memory
- Use Termux:Boot to start the server on device boot
- Consider using a wake lock to prevent CPU throttling

**Rendering lag**
- Reduce the number of entities
- Lower browser resolution/zoom
- Close other browser tabs

## Advanced Configuration

### Changing the Server Port

Edit `server/main.py`:
```python
if __name__ == "__main__":
    asyncio.run(main(port=9000))  # Change 8765 to your port
```

### Running Server in Background

Use `tmux` or `screen` to keep the server running:

```bash
pkg install tmux
tmux new -s travi
python main.py
# Press Ctrl+B, then D to detach
```

To reattach:
```bash
tmux attach -t travi
```

### Auto-start on Boot

Install Termux:Boot from F-Droid, then create:

`~/.termux/boot/start-travi.sh`:
```bash
#!/data/data/com.termux/files/usr/bin/bash
cd ~/TermuxRoadToAndroidAvenue/server
python main.py &
```

Make it executable:
```bash
chmod +x ~/.termux/boot/start-travi.sh
```

## Resource Management

### Monitor Resource Usage

```bash
pkg install htop
htop
```

### Memory Considerations

Termux on Android has limited memory. If experiencing issues:
- Close unused apps
- Restart Termux periodically
- Avoid running too many entities simultaneously in Phase 1

## Security Notes

### Network Security

- The server binds to `localhost` by default (secure)
- To accept external connections, modify `ws_server.py` to bind to `0.0.0.0`
- **Warning:** Only do this on trusted networks
- Consider adding authentication for production use

### Storage Permissions

Termux needs storage access for some operations:
```bash
termux-setup-storage
```

Grant the permission when prompted.

## Next Steps

- Read [pipeline_overview.md](pipeline_overview.md) to understand the architecture
- Read [engine_spec.md](engine_spec.md) for the complete technical specification
- Explore the [server README](../server/README.md) for backend API details
- Explore the [client README](../client/README.md) for frontend usage

## Support

For issues and questions:
- Check the main [README.md](../README.md)
- Review the [engine specification](engine_spec.md)
- Open an issue on GitHub

---

**T-R-A-V-I Engine** - Making Android a first-class game development platform
