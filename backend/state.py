# backend/state.py
import time
from typing import Dict, Any

class WorldState:
    """
    Core world state manager for T-R-A-V-I engine
    Manages entities, game state, and handles client input
    """
    
    def __init__(self):
        self.entities: Dict[str, Dict[str, Any]] = {}
        self.time: float = 0.0
        self.frame_count: int = 0
        
        # Initialize with a default cube for testing
        self.entities["cube_0"] = {
            "id": "cube_0",
            "type": "cube",
            "position": [0.0, 0.0, 0.0],
            "rotation": [0.0, 0.0, 0.0],
            "scale": [1.0, 1.0, 1.0],
            "color": [1.0, 0.0, 0.0, 1.0]  # Red cube
        }
    
    def update(self, delta_time: float) -> None:
        """
        Update world state each frame
        """
        self.time += delta_time
        self.frame_count += 1
        
        # Example: Rotate the default cube
        if "cube_0" in self.entities:
            cube = self.entities["cube_0"]
            cube["rotation"][1] += delta_time * 0.5  # Rotate around Y axis
    
    def apply_input(self, payload: Dict[str, Any]) -> None:
        """
        Handle input from clients
        """
        action = payload.get("action")
        
        if action == "spawn_cube":
            entity_id = payload.get("id", f"cube_{len(self.entities)}")
            position = payload.get("position", [0.0, 0.0, 0.0])
            color = payload.get("color", [1.0, 1.0, 1.0, 1.0])
            
            self.entities[entity_id] = {
                "id": entity_id,
                "type": "cube",
                "position": position,
                "rotation": [0.0, 0.0, 0.0],
                "scale": [1.0, 1.0, 1.0],
                "color": color
            }
        
        elif action == "move_entity":
            entity_id = payload.get("id")
            position = payload.get("position")
            if entity_id in self.entities and position:
                self.entities[entity_id]["position"] = position
        
        elif action == "delete_entity":
            entity_id = payload.get("id")
            if entity_id in self.entities:
                del self.entities[entity_id]
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Serialize world state for transmission to clients
        """
        return {
            "time": self.time,
            "frame_count": self.frame_count,
            "entities": self.entities
        }
