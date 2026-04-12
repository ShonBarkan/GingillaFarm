from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# שימוש במודל ParameterStat שסיפקת כרפרנס
class ParameterStat(BaseModel):
    parameter_id: int
    name: str
    unit: str
    max_value: float = 0.0
    avg_value: float = 0.0
    total_value: float = 0.0
    count: int = 0

# =================================================================
# 1. TODAY'S WORKOUT MODELS
# =================================================================

class TodaysWorkout(BaseModel):
    """
    Represents a workout template scheduled for today.
    """
    id: int
    name: str
    description: Optional[str] = None
    expected_time: Optional[str] = None
    parent_exercise_id: int
    parent_exercise_name: Optional[str] = None
    # Indicates if a session for this template was already started/finished today
    is_completed_today: bool = False
    last_session_time: Optional[datetime] = None

# =================================================================
# 2. FEATURED STATS MODELS
# =================================================================

class FeaturedExerciseStats(BaseModel):
    """
    Grouped statistics for a specific featured exercise.
    """
    exercise_id: int
    exercise_name: str
    stats: List[ParameterStat]
    last_activity: Optional[datetime] = None

# =================================================================
# 3. MAIN DASHBOARD RESPONSE
# =================================================================

class DashboardSummary(BaseModel):
    """
    The full data structure returned to the dashboard.
    """
    date: str  # YYYY-MM-DD
    day_of_week: int  # 0-6
    todays_workouts: List[TodaysWorkout]
    featured_stats: List[FeaturedExerciseStats]

# מודל עזר לקונפיגורציה של ה-Featured Stats (לשימוש פנימי בקונטרולר)
class FeaturedConfigItem(BaseModel):
    exercise_id: int
    parameter_names: List[str]