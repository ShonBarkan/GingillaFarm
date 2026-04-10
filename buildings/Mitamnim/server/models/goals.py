from pydantic import BaseModel
from typing import Optional

# =================================================================
# BASE SCHEMA
# =================================================================

class GoalBase(BaseModel):
    exercise_id: int
    goal_type: str
    target_value: float

# =================================================================
# CREATE SCHEMA (POST)
# =================================================================

class GoalCreate(GoalBase):
    """Used for setting a new goal. Completion status defaults to False."""
    pass

# =================================================================
# UPDATE SCHEMA (PUT / PATCH)
# =================================================================

class GoalUpdate(BaseModel):
    """Used for updating goal targets or marking as completed."""
    exercise_id: Optional[int] = None
    goal_type: Optional[str] = None
    target_value: Optional[float] = None
    is_completed: Optional[bool] = None

# =================================================================
# RESPONSE SCHEMA (GET)
# =================================================================

class GoalSchema(GoalBase):
    """Full database representation of a training goal."""
    id: int
    is_completed: bool = False

    class Config:
        from_attributes = True