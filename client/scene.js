/**
 * Scene management - maintains renderable objects from backend state
 */

export class Scene {
    constructor() {
        this.entities = new Map();
    }
    
    /**
     * Update scene from full state snapshot
     */
    updateFromState(entities) {
        // Clear existing entities
        this.entities.clear();
        
        // Add all entities from state
        for (const [entityId, entityData] of Object.entries(entities)) {
            this.entities.set(entityId, this.createSceneObject(entityData));
        }
    }
    
    /**
     * Handle entity spawned event
     */
    onEntitySpawned(entityData) {
        const sceneObject = this.createSceneObject(entityData);
        this.entities.set(entityData.entity_id, sceneObject);
    }
    
    /**
     * Handle entity updated event
     */
    onEntityUpdated(entityData) {
        if (this.entities.has(entityData.entity_id)) {
            // Update existing entity
            const sceneObject = this.createSceneObject(entityData);
            this.entities.set(entityData.entity_id, sceneObject);
        }
    }
    
    /**
     * Handle entity deleted event
     */
    onEntityDeleted(entityId) {
        this.entities.delete(entityId);
    }
    
    /**
     * Create a scene object from entity data
     */
    createSceneObject(entityData) {
        return {
            id: entityData.entity_id,
            type: entityData.type,
            position: entityData.position,
            rotation: entityData.rotation,
            scale: entityData.scale,
            color: entityData.color,
            meta: entityData.meta
        };
    }
    
    /**
     * Get all renderable entities
     */
    getEntities() {
        return Array.from(this.entities.values());
    }
    
    /**
     * Get entity by ID
     */
    getEntity(entityId) {
        return this.entities.get(entityId);
    }
}
