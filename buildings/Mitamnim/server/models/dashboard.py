from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ParameterStat(BaseModel):
    parameter_id: int
    name: str
    unit: str
    max_value: float = 0.0
    avg_value: float = 0.0
    total_value: float = 0.0
    count: int = 0

class TodaysWorkout(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    expected_time: Optional[str] = None
    parent_exercise_id: Optional[int] = None
    parent_exercise_name: Optional[str] = None
    is_completed_today: bool = False
    last_session_time: Optional[datetime] = None

class FeaturedExerciseStats(BaseModel):
    exercise_id: int
    exercise_name: str
    stats: List[ParameterStat]
    last_activity: Optional[datetime] = None

class DashboardSummary(BaseModel):
    date: str
    day_of_week: int
    todays_workouts: List[TodaysWorkout]
    featured_stats: List[FeaturedExerciseStats]

class FeaturedConfigItem(BaseModel):
    exercise_id: int
    parameter_names: List[str]