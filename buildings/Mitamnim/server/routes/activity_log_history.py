from fastapi import APIRouter, Query
from typing import List, Optional
from controllers import activity_log_history as controller
from models.activity_log_history import ActivityLogHistorySchema

router = APIRouter(prefix="/history", tags=["History"])

@router.get("/", response_model=List[ActivityLogHistorySchema])
def read_history(
    exercise_id: Optional[int] = Query(None, description="Filter by exercise ID. If provided, includes all children by default."),
    session_id: Optional[int] = Query(None, description="Filter by specific workout session ID."),
    limit: int = Query(50, ge=1, le=500)
):
    """
    Retrieve activity logs history with optional filters.
    If an exercise_id is provided, the history will include logs for that exercise
    and all its recursive sub-exercises/categories.
    """
    return controller.get_history(
        exercise_id=exercise_id,
        session_id=session_id,
        limit=limit
    )

@router.get("/exercise/{exercise_id}", response_model=List[ActivityLogHistorySchema])
def read_exercise_history(
    exercise_id: int,
    limit: int = Query(20, ge=1, le=100)
):
    """
    Shortcut to get the last X entries for a specific exercise and its children.
    Perfect for 'Last Performance' tips or progress charts in the UI.
    """
    return controller.get_history(
        exercise_id=exercise_id,
        limit=limit
    )