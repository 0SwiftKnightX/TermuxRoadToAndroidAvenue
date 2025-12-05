/**
 * T-R-A-V-I Engine - Main Entry Point
 */

import { Engine } from './engine.js';
import { WSClient } from './ws-client.js';
import { debugUI } from './debug-ui.js';

class TRAVIApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.engine = null;
        this.wsClient = null;
        this.wsUrl = 'ws://localhost:8765';
    }
    
    async initialize() {
        console.log('Initializing T-R-A-V-I...');
        debugUI.log('Initializing T-R-A-V-I engine...');
        
        try {
            // Initialize engine
            this.engine = new Engine(this.canvas);
            await this.engine.initialize();
            debugUI.log('Engine initialized');
            
            // Setup WebSocket client
            this.setupWebSocket();
            
            // Start engine
            this.engine.start();
            debugUI.log('Engine started');
            
            // Setup window resize handler
            window.addEventListener('resize', () => this.engine.resize());
            
            console.log('T-R-A-V-I initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize:', error);
            debugUI.log(`ERROR: ${error.message}`, 'error');
        }
    }
    
    setupWebSocket() {
        this.wsClient = new WSClient(this.wsUrl, (message) => this.handleMessage(message));
        
        this.wsClient.onConnect = () => {
            console.log('Connected to server');
            debugUI.setConnectionStatus(true);
            debugUI.log('Connected to server');
        };
        
        this.wsClient.onDisconnect = () => {
            console.log('Disconnected from server');
            debugUI.setConnectionStatus(false);
            debugUI.log('Disconnected from server');
        };
        
        this.wsClient.connect();
    }
    
    handleMessage(message) {
        const { type, payload } = message;
        
        switch (type) {
            case 'STATE':
                this.handleState(payload);
                break;
                
            case 'EVENT':
                this.handleEvent(payload);
                break;
                
            case 'ERROR':
                this.handleError(payload);
                break;
                
            default:
                console.warn('Unknown message type:', type);
        }
    }
    
    handleState(payload) {
        console.log('Received state:', payload);
        debugUI.log('Received full state');
        
        // Update scene from state
        this.engine.scene.updateFromState(payload.entities);
        
        // Update debug UI
        const entityCount = Object.keys(payload.entities).length;
        debugUI.setEntityCount(entityCount);
    }
    
    handleEvent(payload) {
        const { event_type, data } = payload;
        console.log('Received event:', event_type, data);
        debugUI.log(`Event: ${event_type}`);
        
        switch (event_type) {
            case 'entity_spawned':
                this.engine.scene.onEntitySpawned(data);
                debugUI.setEntityCount(this.engine.scene.entities.size);
                break;
                
            case 'entity_updated':
                this.engine.scene.onEntityUpdated(data);
                break;
                
            case 'entity_deleted':
                this.engine.scene.onEntityDeleted(data.entity_id);
                debugUI.setEntityCount(this.engine.scene.entities.size);
                break;
                
            default:
                console.warn('Unknown event type:', event_type);
        }
    }
    
    handleError(payload) {
        console.error('Server error:', payload.message);
        debugUI.log(`Server error: ${payload.message}`, 'error');
    }
    
    // Expose API for testing/debugging from console
    spawnCube(id, x, y, z, color = [1, 0, 0, 1]) {
        this.wsClient.sendCommand('spawn_entity', {
            entity_id: id,
            type: 'cube',
            position: [x, y, z],
            color: color
        });
    }
    
    moveCube(id, x, y, z) {
        this.wsClient.sendCommand('move_entity', {
            entity_id: id,
            position: [x, y, z]
        });
    }
    
    setColor(id, r, g, b, a = 1) {
        this.wsClient.sendCommand('set_color', {
            entity_id: id,
            color: [r, g, b, a]
        });
    }
    
    deleteCube(id) {
        this.wsClient.sendCommand('delete_entity', {
            entity_id: id
        });
    }
}

// Initialize app when DOM is ready
const app = new TRAVIApp();

// Start initialization
app.initialize().catch(error => {
    console.error('Fatal error:', error);
    debugUI.log(`FATAL: ${error.message}`, 'error');
});

// Expose app to global scope for console debugging
window.TRAVI = app;

console.log('T-R-A-V-I client loaded. Use window.TRAVI for debugging.');
console.log('Example: TRAVI.spawnCube("test1", 0, 1, 0, [1, 0, 0, 1])');
