from fastapi import APIRouter
from typing import Optional, List
from controllers.stats import calculate_exercise_stats, get_trend_data
from models.stats import ExerciseStats

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/exercise/{exercise_id}", response_model=ExerciseStats)
async def get_exercise_stats(exercise_id: int):
    """
    Returns calculated summary statistics for a specific exercise and its descendants.
    """
    return calculate_exercise_stats(exercise_id)


@router.get("/exercise/{exercise_id}/trend")
async def get_trend(exercise_id: int, start: Optional[str] = None, end: Optional[str] = None):
    """
    Returns raw activity logs within a date range for trend visualization.
    """
    return get_trend_data(exercise_id, start, end)