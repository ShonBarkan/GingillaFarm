from pydantic import BaseModel
from typing import Optional

# =================================================================
# BASE SCHEMA
# =================================================================

class ActiveParameterBase(BaseModel):
    parameter_id: int
    exercise_id: Optional[int] = None
    template_id: Optional[int] = None
    session_id: Optional[int] = None
    priority_index: int = 0
    default_value: Optional[str] = None

# =================================================================
# CREATE SCHEMA (POST)
# =================================================================

class ActiveParameterCreate(ActiveParameterBase):
    """Used for creating a new parameter link. ID is auto-generated."""
    pass

# =================================================================
# UPDATE SCHEMA (PUT / PATCH)
# =================================================================

class ActiveParameterUpdate(BaseModel):
    """Used for updating an existing link. All fields are optional."""
    parameter_id: Optional[int] = None
    exercise_id: Optional[int] = None
    template_id: Optional[int] = None
    session_id: Optional[int] = None
    priority_index: Optional[int] = None
    default_value: Optional[str] = None

# =================================================================
# RESPONSE SCHEMA (GET)
# =================================================================

class ActiveParameterSchema(ActiveParameterBase):
    """Full database representation of the active parameter link."""
    id: int

    class Config:
        from_attributes = True


class ActiveParameterBase(BaseModel):
    parameter_id: int
    exercise_id: Optional[int] = None
    template_id: Optional[int] = None
    session_id: Optional[int] = None
    priority_index: int = 0
    default_value: Optional[str] = None

