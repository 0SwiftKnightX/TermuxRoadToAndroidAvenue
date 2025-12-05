# GitHub Copilot Agent Instructions

This file provides guidance for GitHub Copilot coding agents working on the T-R-A-V-I (TermuxRoadToAndroidAvenue) project.

## Project Overview

T-R-A-V-I is a modular, extensible game engine where:
- The **game is the editor** and the **editor is the game**
- An AI assistant can modify code, assets, and world state
- Worlds, avatars, entities, and environments are **procedural and data-driven**
- Everything runs on **Android (Termux)** + **Browser (WebGPU)** using a live WebSocket bridge

**Current Phase:** Phase 1 MVP - A functional real-time 3D engine with WebSocket communication

## Tech Stack

### Backend (Python)
- **Python Version:** 3.8+
- **Key Libraries:**
  - `websockets>=12.0` - WebSocket server implementation
- **Purpose:** World state authority, command handling, entity lifecycle management

### Frontend (JavaScript)
- **Runtime:** Browser (Chrome 113+, Edge 113+ with WebGPU support)
- **Style:** ES modules, vanilla JavaScript (no build tools)
- **Graphics:** WebGPU for hardware-accelerated 3D rendering
- **Purpose:** Real-time 3D visualization, client-side scene management

## Project Structure

```
.
├── .github/           # GitHub configuration and agent instructions
├── server/            # Python backend
│   ├── __init__.py
│   ├── main.py              # Backend entry point
│   ├── ws_server.py         # WebSocket server
│   ├── command_router.py    # Routes incoming messages
│   ├── world_state.py       # In-memory world model
│   ├── messages.py          # Message helpers/validation
│   ├── ai_hooks.py          # Placeholder for AI integration
│   ├── test_client.py       # Test utilities
│   ├── test_errors.py       # Error testing
│   └── requirements.txt     # Python dependencies
├── client/            # JavaScript/WebGPU frontend
│   ├── index.html           # Main HTML shell
│   ├── main.js              # Client entry point
│   ├── ws-client.js         # WebSocket client
│   ├── engine.js            # Game/engine loop
│   ├── webgpu-context.js    # WebGPU setup
│   ├── scene.js             # Scene graph/object registry
│   ├── avatar.js            # Procedural avatar logic (placeholder)
│   └── debug-ui.js          # Debug overlay
├── docs/              # Documentation
│   ├── engine_spec.md       # Complete technical specification
│   └── IMPLEMENTATION_SUMMARY.md
└── README.md          # Project overview
```

## Development Workflow

### Starting the Backend
```bash
cd server
pip install -r requirements.txt
python3 main.py
```
- Server runs on `localhost:8765`
- Uses WebSocket protocol for real-time communication

### Starting the Frontend
```bash
cd client
python3 -m http.server 8000
```
- Open browser to `http://localhost:8000`
- Requires WebGPU-compatible browser

### Testing
- Backend: Manual testing with `test_client.py` or `test_errors.py`
- Frontend: Browser console interactions using the `TRAVI` global object
- No automated test framework currently configured

Example browser console commands:
```javascript
// Spawn a red cube
TRAVI.spawnCube("cube1", 0, 1, 0, [1, 0, 0, 1]);

// Move it
TRAVI.moveCube("cube1", 2, 1, 0);

// Change color
TRAVI.setColor("cube1", 0, 1, 0, 1);
```

## Code Style Guidelines

### Python (Backend)
- Use Python 3.8+ compatible syntax
- Follow PEP 8 style guidelines
- Use async/await for WebSocket operations
- Keep functions focused and modular
- Use type hints where appropriate
- Document complex logic with inline comments

### JavaScript (Frontend)
- Use ES6+ modules
- Prefer `const` and `let` over `var`
- Use async/await for asynchronous operations
- Keep functions pure and side-effect-free where possible
- Use descriptive variable names
- Follow consistent naming conventions:
  - camelCase for functions and variables
  - PascalCase for classes
  - UPPER_CASE for constants

### General Principles
- **Minimal changes:** Make the smallest possible modifications to achieve the goal
- **Preserve working code:** Don't modify unrelated working code
- **Clean code:** Write readable, maintainable code
- **Documentation:** Update documentation when making significant changes

## Boundaries and Constraints

### Never Modify
- **Secrets and credentials:** Never commit API keys, passwords, or sensitive data
- **Build artifacts:** Don't commit generated files or dependencies (e.g., `node_modules/`, `__pycache__/`)
- **Unrelated code:** Don't modify code outside the scope of the task
- **Working tests:** Don't remove or break existing passing tests

### Always Consider
- **WebGPU compatibility:** Ensure frontend changes work with WebGPU API
- **WebSocket protocol:** Maintain backward compatibility with the message protocol
- **Real-time performance:** Keep the engine loop performant
- **Browser compatibility:** Test with WebGPU-supported browsers
- **Termux compatibility:** Ensure backend works on Android/Termux environment

### Security Best Practices
- Validate all incoming WebSocket messages
- Sanitize user inputs
- Never execute arbitrary code from messages
- Keep dependencies updated
- Follow principle of least privilege

## Communication Protocol

The backend and frontend communicate via WebSocket using JSON messages. Key message types:

- **Commands:** `spawn_cube`, `move_cube`, `set_color`, `delete_entity`
- **Updates:** State synchronization from backend to clients
- **Errors:** Error messages and validation failures

All messages follow the format defined in `server/messages.py` and must maintain backward compatibility.

## Common Tasks

### Adding a New Entity Type
1. Update `server/world_state.py` to support the entity
2. Add command handlers in `server/command_router.py`
3. Update message validation in `server/messages.py`
4. Add client-side rendering in `client/scene.js` or `client/engine.js`
5. Test via browser console or test scripts

### Adding a New Command
1. Define message structure in `server/messages.py`
2. Add handler in `server/command_router.py`
3. Update `server/world_state.py` if needed
4. Add client-side method in `client/ws-client.js` or expose via `TRAVI` object
5. Test the full round-trip

### Fixing Bugs
1. Reproduce the issue
2. Identify the root cause
3. Make minimal changes to fix
4. Test the fix doesn't break existing functionality
5. Update documentation if behavior changes

### Updating Documentation
- Keep `README.md` in sync with project structure
- Update `docs/engine_spec.md` for architectural changes
- Add inline comments for complex logic
- Update this `agents.md` file if workflow changes

## Future Phases (Reference Only)

Phase 1 is the current focus. Future phases will add:
- Universal Interaction Engine
- Procedural Anatomy System
- Chaos & Magic Systems
- Universal Material Hierarchy
- Class & Bloodline Systems
- Multiserver/Metaplanet Architecture
- Weather Engine
- Terrain Destruction Engine
- Advanced Weapon Systems

**Important:** Do not implement future features unless explicitly requested. Focus on Phase 1 stability.

## Key Resources

- [Engine Specification](../docs/engine_spec.md) - Complete technical specification
- [README](../README.md) - Project overview and quick start
- [Server Requirements](../server/requirements.txt) - Python dependencies

## Agent Behavior

When working on this repository:

1. **Read the task carefully** - Understand requirements before coding
2. **Explore first** - Review relevant code before making changes
3. **Make minimal changes** - Surgical, precise modifications only
4. **Test your changes** - Run the backend and frontend to verify
5. **Maintain compatibility** - Don't break the WebSocket protocol or existing features
6. **Document as needed** - Update docs for significant changes
7. **Follow patterns** - Match existing code style and architecture
8. **Ask when uncertain** - Stop and ask for clarification rather than guessing

## Success Criteria

A successful change should:
- ✅ Solve the stated problem
- ✅ Pass manual testing (backend + frontend running together)
- ✅ Maintain WebSocket protocol compatibility
- ✅ Follow existing code style
- ✅ Not break unrelated functionality
- ✅ Include documentation updates if needed
- ✅ Be minimal and focused

Remember: The goal is Phase 1 MVP stability. Keep it simple, keep it working.
