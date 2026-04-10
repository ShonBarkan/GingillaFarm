from pydantic import BaseModel
from typing import Optional, Dict, Any

# =================================================================
# BASE SCHEMA
# =================================================================

class ActivityLogBase(BaseModel):
    exercise_id: int
    performance_data: Dict[str, Any]
    workout_session_id: Optional[int] = None
    is_manual: bool = True

# =================================================================
# CREATE SCHEMA (POST)
# =================================================================

class ActivityLogCreate(ActivityLogBase):
    """
    Used for logging a new performance entry.
    Timestamp is usually handled by the database but can be provided.
    """
    timestamp: Optional[str] = None

# =================================================================
# UPDATE SCHEMA (PUT / PATCH)
# =================================================================

class ActivityLogUpdate(BaseModel):
    """Used for correcting logged data."""
    exercise_id: Optional[int] = None
    performance_data: Optional[Dict[str, Any]] = None
    workout_session_id: Optional[int] = None
    timestamp: Optional[str] = None
    is_manual: Optional[bool] = None

# =================================================================
# RESPONSE SCHEMA (GET)
# =================================================================

class ActivityLogSchema(ActivityLogBase):
    """Full database representation of an activity log entry."""
    id: int
    timestamp: str

    class Config:
        from_attributes = True