"""Command router for handling WebSocket commands"""
import logging
from typing import Dict, Any, Optional
from world_state import WorldState
from messages import create_event_message

logger = logging.getLogger(__name__)


class CommandRouter:
    """Routes and executes commands on the world state"""
    
    def __init__(self, world_state: WorldState):
        self.world_state = world_state
        self.handlers = {
            "spawn_entity": self._handle_spawn_entity,
            "move_entity": self._handle_move_entity,
            "set_color": self._handle_set_color,
            "delete_entity": self._handle_delete_entity
        }
        
    def route_command(self, command: str, params: Dict[str, Any]) -> Optional[str]:
        """Route a command to its handler and return an event message if successful"""
        logger.info(f"Routing command: {command} with params: {params}")
        
        if command not in self.handlers:
            logger.warning(f"Unknown command: {command}")
            return None
            
        try:
            return self.handlers[command](params)
        except Exception as e:
            logger.error(f"Error executing command {command}: {e}")
            return None
            
    def _handle_spawn_entity(self, params: Dict[str, Any]) -> str:
        """Handle spawn_entity command"""
        entity_id = params.get("entity_id")
        if not entity_id:
            raise ValueError("entity_id is required")
            
        entity = self.world_state.spawn_entity(entity_id, params)
        return create_event_message("entity_spawned", entity)
        
    def _handle_move_entity(self, params: Dict[str, Any]) -> Optional[str]:
        """Handle move_entity command"""
        entity_id = params.get("entity_id")
        position = params.get("position")
        
        if not entity_id or position is None:
            raise ValueError("entity_id and position are required")
            
        entity = self.world_state.move_entity(entity_id, position)
        if entity:
            return create_event_message("entity_updated", entity)
        return None
        
    def _handle_set_color(self, params: Dict[str, Any]) -> Optional[str]:
        """Handle set_color command"""
        entity_id = params.get("entity_id")
        color = params.get("color")
        
        if not entity_id or color is None:
            raise ValueError("entity_id and color are required")
            
        entity = self.world_state.set_color(entity_id, color)
        if entity:
            return create_event_message("entity_updated", entity)
        return None
        
    def _handle_delete_entity(self, params: Dict[str, Any]) -> Optional[str]:
        """Handle delete_entity command"""
        entity_id = params.get("entity_id")
        if not entity_id:
            raise ValueError("entity_id is required")
            
        if self.world_state.delete_entity(entity_id):
            return create_event_message("entity_deleted", {"entity_id": entity_id})
        return None
