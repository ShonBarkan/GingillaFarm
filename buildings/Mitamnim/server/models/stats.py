from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class ParameterStat(BaseModel):
    parameter_id: int
    name: str
    unit: str
    max_value: float = 0.0
    avg_value: float = 0.0
    total_value: float = 0.0

class ExerciseStats(BaseModel):
    exercise_id: int
    exercise_name: str
    last_session_date: Optional[str] = None
    # Dynamic dictionary: parameter_id -> stats object
    parameters: List[ParameterStat]
    total_logs_count: int = 0