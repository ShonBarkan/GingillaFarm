from pydantic import BaseModel
from typing import Optional
from enum import Enum

# =================================================================
# ENUMS
# =================================================================

class ParameterScope(str, Enum):
    EXERCISE = "exercise"
    SESSION = "session"

# =================================================================
# BASE SCHEMA
# =================================================================

class ParameterBase(BaseModel):
    name: str
    unit: str
    scope: ParameterScope = ParameterScope.EXERCISE

# =================================================================
# CREATE SCHEMA (POST)
# =================================================================

class ParameterCreate(ParameterBase):
    """Used for creating a new parameter. ID is omitted."""
    pass

# =================================================================
# UPDATE SCHEMA (PUT / PATCH)
# =================================================================

class ParameterUpdate(BaseModel):
    """Used for updating existing parameters. All fields are optional."""
    name: Optional[str] = None
    unit: Optional[str] = None
    scope: Optional[ParameterScope] = None

# =================================================================
# RESPONSE SCHEMA (GET)
# =================================================================

class ParameterSchema(ParameterBase):
    """Full database representation including the primary key."""
    id: int

    class Config:
        from_attributes = True