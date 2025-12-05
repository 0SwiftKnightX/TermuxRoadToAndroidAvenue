/**
 * Debug UI overlay for displaying connection status and logs
 */

class DebugUI {
    constructor() {
        this.content = document.getElementById('debug-content');
        this.logs = [];
        this.maxLogs = 20;
        this.connected = false;
        this.entityCount = 0;
    }
    
    setConnectionStatus(connected) {
        this.connected = connected;
        this.update();
    }
    
    setEntityCount(count) {
        this.entityCount = count;
        this.update();
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push({ message, type, timestamp });
        
        // Keep only the most recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        this.update();
    }
    
    update() {
        const statusClass = this.connected ? 'connected' : 'disconnected';
        const statusText = this.connected ? 'CONNECTED' : 'DISCONNECTED';
        
        let html = `
            <div class="status ${statusClass}">Status: ${statusText}</div>
            <div class="status">Entities: ${this.entityCount}</div>
            <hr style="margin: 10px 0; border-color: #0f0;">
            <div style="font-size: 10px; color: #0ff;">Recent Events:</div>
        `;
        
        // Display logs in reverse order (newest first)
        for (let i = this.logs.length - 1; i >= 0; i--) {
            const log = this.logs[i];
            html += `<div class="log-entry">[${log.timestamp}] ${log.message}</div>`;
        }
        
        this.content.innerHTML = html;
    }
}

export const debugUI = new DebugUI();
