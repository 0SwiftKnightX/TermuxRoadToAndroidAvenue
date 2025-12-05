"""World state management"""
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class WorldState:
    """Manages the authoritative world state"""
    
    def __init__(self):
        self.entities: Dict[str, Dict[str, Any]] = {}
        
    def spawn_entity(self, entity_id: str, entity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new entity to the world"""
        entity = {
            "entity_id": entity_id,
            "type": entity_data.get("type", "cube"),
            "position": entity_data.get("position", [0, 0, 0]),
            "rotation": entity_data.get("rotation", [0, 0, 0]),
            "scale": entity_data.get("scale", [1, 1, 1]),
            "color": entity_data.get("color", [1, 1, 1, 1]),
            "meta": entity_data.get("meta", {})
        }
        self.entities[entity_id] = entity
        logger.info(f"Spawned entity: {entity_id}")
        return entity
        
    def move_entity(self, entity_id: str, position: list) -> Optional[Dict[str, Any]]:
        """Update entity position"""
        if entity_id not in self.entities:
            logger.warning(f"Attempted to move non-existent entity: {entity_id}")
            return None
        self.entities[entity_id]["position"] = position
        logger.info(f"Moved entity {entity_id} to {position}")
        return self.entities[entity_id]
        
    def set_color(self, entity_id: str, color: list) -> Optional[Dict[str, Any]]:
        """Update entity color"""
        if entity_id not in self.entities:
            logger.warning(f"Attempted to color non-existent entity: {entity_id}")
            return None
        self.entities[entity_id]["color"] = color
        logger.info(f"Set entity {entity_id} color to {color}")
        return self.entities[entity_id]
        
    def delete_entity(self, entity_id: str) -> bool:
        """Remove an entity from the world"""
        if entity_id in self.entities:
            del self.entities[entity_id]
            logger.info(f"Deleted entity: {entity_id}")
            return True
        logger.warning(f"Attempted to delete non-existent entity: {entity_id}")
        return False
        
    def get_entity(self, entity_id: str) -> Optional[Dict[str, Any]]:
        """Get entity data"""
        return self.entities.get(entity_id)
        
    def get_all_entities(self) -> Dict[str, Dict[str, Any]]:
        """Get all entities"""
        return self.entities.copy()
