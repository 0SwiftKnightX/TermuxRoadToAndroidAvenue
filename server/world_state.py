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
        entity_type = entity_data.get("type", "cube")
        
        # Base entity structure
        entity = {
            "entity_id": entity_id,
            "type": entity_type,
            "position": entity_data.get("position", [0, 0, 0]),
            "rotation": entity_data.get("rotation", [0, 0, 0]),
            "scale": entity_data.get("scale", [1, 1, 1]),
            "color": entity_data.get("color", [1, 1, 1, 1]),
            "meta": entity_data.get("meta", {})
        }
        
        # Add type-specific fields for player entities
        if entity_type == "player":
            entity["stats"] = entity_data.get("stats", {
                "health": 100,
                "stamina": 100,
                "mana": 50,
                "level": 1,
                "experience": 0
            })
            entity["movement"] = entity_data.get("movement", {
                "speed": 5.0,
                "jump_strength": 1.5
            })
            entity["inventory"] = entity_data.get("inventory", [])
            
        # Add type-specific fields for pet entities
        elif entity_type == "pet":
            entity["stats"] = entity_data.get("stats", {
                "health": 50,
                "loyalty": 100
            })
            entity["behavior"] = entity_data.get("behavior", {
                "mode": "follow",
                "target_id": None
            })
        
        self.entities[entity_id] = entity
        logger.info(f"[STATE] Spawned entity: {entity_id} of type: {entity_type}")
        return entity
        
    def move_entity(self, entity_id: str, position: list) -> Optional[Dict[str, Any]]:
        """Update entity position"""
        if entity_id not in self.entities:
            logger.warning(f"Attempted to move non-existent entity: {entity_id}")
            return None
        self.entities[entity_id]["position"] = position
        logger.info(f"[STATE] entity {entity_id} mutated position")
        return self.entities[entity_id]
        
    def set_color(self, entity_id: str, color: list) -> Optional[Dict[str, Any]]:
        """Update entity color"""
        if entity_id not in self.entities:
            logger.warning(f"Attempted to color non-existent entity: {entity_id}")
            return None
        self.entities[entity_id]["color"] = color
        logger.info(f"[STATE] entity {entity_id} mutated color")
        return self.entities[entity_id]
        
    def update_stats(self, entity_id: str, stats: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update entity stats with validation"""
        if entity_id not in self.entities:
            logger.warning(f"Attempted to update stats for non-existent entity: {entity_id}")
            return None
            
        entity = self.entities[entity_id]
        entity_type = entity.get("type")
        
        # Only player and pet entities have stats
        if entity_type not in ["player", "pet"]:
            logger.warning(f"Entity {entity_id} of type {entity_type} does not support stats")
            return None
            
        if "stats" not in entity:
            entity["stats"] = {}
            
        # Validate and update stats
        for key, value in stats.items():
            # Basic validation: numeric values
            if not isinstance(value, (int, float)):
                logger.warning(f"Invalid stat value for {key}: {value}")
                continue
                
            # Type-specific validation
            if entity_type == "player":
                # Health, stamina, mana cannot be negative
                if key in ["health", "stamina", "mana"] and value < 0:
                    logger.warning(f"Player stat {key} cannot be negative")
                    continue
                # Level must be at least 1
                if key == "level" and value < 1:
                    logger.warning(f"Player level cannot be less than 1")
                    continue
                    
            elif entity_type == "pet":
                # Health cannot be negative
                if key == "health" and value < 0:
                    logger.warning(f"Pet health cannot be negative")
                    continue
                # Loyalty is clamped between 0 and 100
                if key == "loyalty":
                    value = max(0, min(100, value))
                    
            entity["stats"][key] = value
            logger.info(f"[STATE] entity {entity_id} mutated stats.{key}")
            
        return entity
        
    def update_pet_behavior(self):
        """Auto-update pet following behavior"""
        for entity_id, entity in self.entities.items():
            if entity.get("type") == "pet":
                behavior = entity.get("behavior", {})
                target_id = behavior.get("target_id")
                mode = behavior.get("mode")
                
                if mode == "follow" and target_id and target_id in self.entities:
                    # Get target position
                    target_entity = self.entities[target_id]
                    target_pos = target_entity["position"]
                    
                    # Simple following logic: move pet closer to target
                    pet_pos = entity["position"]
                    dx = target_pos[0] - pet_pos[0]
                    dy = target_pos[1] - pet_pos[1]
                    dz = target_pos[2] - pet_pos[2]
                    
                    # Calculate distance
                    dist = (dx**2 + dy**2 + dz**2)**0.5
                    
                    # If pet is too far, move it closer (keep 2 units away)
                    if dist > 2.0:
                        # Normalize and scale movement
                        factor = (dist - 2.0) / dist * 0.1  # Move 10% of excess distance
                        entity["position"] = [
                            pet_pos[0] + dx * factor,
                            pet_pos[1] + dy * factor,
                            pet_pos[2] + dz * factor
                        ]
                        logger.debug(f"Pet {entity_id} following {target_id}")
        
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
