from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .active_params import ActiveParameterCreate, ActiveParameterSchema


# =================================================================
# BASE SCHEMA
# =================================================================

class ExerciseTreeNodeBase(BaseModel):
    name: str
    parent_id: Optional[int] = None


# =================================================================
# CREATE SCHEMA (POST)
# =================================================================

class ExerciseTreeNodeCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None
    active_params: Optional[List[Dict[str, Any]]] = None


# =================================================================
# UPDATE SCHEMA (PUT / PATCH)
# =================================================================

class ExerciseTreeNodeUpdate(BaseModel):
    """Used for updating a node's name or moving it in the hierarchy."""
    name: Optional[str] = None
    parent_id: Optional[int] = None


# =================================================================
# RESPONSE SCHEMA (GET)
# =================================================================

class ExerciseTreeNodeSchema(ExerciseTreeNodeBase):
    """
    Full database representation of an exercise node.
    Includes linked parameters and potential children for tree traversal.
    """
    id: int
    required_params: Optional[List[ActiveParameterSchema]] = None

    # Optional: Used when fetching the tree recursively
    children: Optional[List["ExerciseTreeNodeSchema"]] = None

    class Config:
        from_attributes = True