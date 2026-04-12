from fastapi import APIRouter, Query
from typing import Optional, List
from controllers import stats as controller


router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/exercise/{exercise_id}")
async def get_exercise_stats(
    exercise_id: int,
    start: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Returns calculated summary statistics for a specific exercise and its descendants,
    with optional date range filtering.
    """
    return controller.calculate_exercise_stats(exercise_id, start_date=start, end_date=end)

@router.get("/exercise/{exercise_id}/trend")
async def get_exercise_trend(
    exercise_id: int,
    start: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Returns full log history for trend visualization, filtered by date range.
    """
    return controller.get_trend_data(exercise_id, start_date=start, end_date=end)