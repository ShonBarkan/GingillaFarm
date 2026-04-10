from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from .active_params import ActiveParameterCreate, ActiveParameterSchema

# =================================================================
# BASE SCHEMA
# =================================================================

class WorkoutTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_exercise_id: int
    exercises_config: List[Dict[str, Any]]
    expected_time: Optional[str] = None
    scheduled_days: Optional[List[int]] = None

# =================================================================
# CREATE SCHEMA (POST)
# =================================================================

class WorkoutTemplateCreate(WorkoutTemplateBase):
    """
    Used for creating a new template.
    Allows nested definition of session-level parameters.
    """
    session_required_params: Optional[List[ActiveParameterCreate]] = []

# =================================================================
# UPDATE SCHEMA (PUT / PATCH)
# =================================================================

class WorkoutTemplateUpdate(BaseModel):
    """Used for updating a template. All fields are optional."""
    name: Optional[str] = None
    description: Optional[str] = None
    parent_exercise_id: Optional[int] = None
    exercises_config: Optional[List[Dict[str, Any]]] = None
    expected_time: Optional[str] = None
    scheduled_days: Optional[List[int]] = None

# =================================================================
# RESPONSE SCHEMA (GET)
# =================================================================

class WorkoutTemplateSchema(WorkoutTemplateBase):
    """Full database representation of a workout template."""
    id: int
    created_at: datetime
    session_required_params: Optional[List[ActiveParameterSchema]] = None

    class Config:
        from_attributes = True