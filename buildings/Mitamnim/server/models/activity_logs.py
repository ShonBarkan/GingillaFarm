from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


# =================================================================
# BASE SCHEMA
# =================================================================

class ActivityLogBase(BaseModel):
    exercise_id: int
    performance_data: Dict[str, Any]
    workout_session_id: Any = None
    is_manual: bool = True


# =================================================================
# CREATE SCHEMA (POST)
# =================================================================

class ActivityLogCreate(ActivityLogBase):
    timestamp: Optional[str] = None


# =================================================================
# UPDATE SCHEMA (PUT / PATCH)
# =================================================================

class ActivityLogUpdate(BaseModel):
    exercise_id: Optional[int] = None
    performance_data: Optional[Dict[str, Any]] = None
    workout_session_id: Any = None
    timestamp: Optional[str] = None
    is_manual: Optional[bool] = None


# =================================================================
# RESPONSE SCHEMA (GET)
# =================================================================

class ActivityLogSchema(ActivityLogBase):
    """Full database representation of an activity log entry."""
    id: int
    timestamp: Any
    workout_session_id: Any = None

    class Config:
        from_attributes = True