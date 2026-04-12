from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# =================================================================
# RESPONSE SCHEMA
# =================================================================

class ActivityLogHistorySchema(BaseModel):
    """
    Represents a full activity log entry for history display.
    Includes performance_data as a parsed dictionary.
    """
    id: int
    exercise_id: int
    exercise_name: Optional[str] = None

    # CRITICAL FIX: Changed from int to Any and allowed None.
    # This prevents ResponseValidationError when workout_session_id is null.
    workout_session_id: Any = Field(default=None, nullable=True)

    performance_data: Dict[str, Any] = Field(default_factory=dict)

    # Using Any for timestamp ensures compatibility with both strings and datetime objects
    # returning from different database managers/silos.
    timestamp: Any

    is_manual: bool = True

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 101,
                "exercise_id": 4,
                "exercise_name": "Pullups",
                "workout_session_id": None,
                "performance_data": {"reps": "12", "weight": "0"},
                "timestamp": "2026-04-10T15:00:00",
                "is_manual": True
            }
        }


# =================================================================
# FILTER SCHEMA
# =================================================================

class HistoryFilters(BaseModel):
    """
    Schema for validating history query parameters.
    """
    exercise_id: Optional[int] = None
    workout_session_id: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    limit: int = Field(default=50, ge=1, le=500)