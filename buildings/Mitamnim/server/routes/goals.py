from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from models.goals import GoalSchema, GoalCreate, GoalUpdate
from controllers import goals as controller

router = APIRouter(prefix="/goals", tags=["Goals"])


# =================================================================
# ENDPOINTS
# =================================================================

@router.post("/", response_model=Dict[str, Any])
def create_goals(data: List[GoalCreate]):
    """
    Set one or more training goals in bulk.
    """
    return controller.create_goals(data)


@router.get("/", response_model=List[GoalSchema])
def get_goals(
        exercise_id: Optional[int] = Query(None, description="Filter goals by exercise ID"),
        is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
        limit: Optional[int] = Query(None, description="Limit the number of goals returned")
):
    """
    Retrieve goals with optional filtering and limits.
    """
    filters = {}
    if exercise_id is not None: filters["exercise_id"] = exercise_id
    if is_completed is not None: filters["is_completed"] = is_completed

    return controller.get_goals(filters=filters, limit=limit)


@router.get("/{goal_id}", response_model=GoalSchema)
def get_goal(goal_id: int):
    """
    Retrieve a specific training goal by its ID.
    """
    return controller.get_goal_by_id(goal_id)


@router.patch("/{goal_id}", response_model=Dict[str, Any])
def update_goal(goal_id: int, data: GoalUpdate):
    """
    Update target values or mark a goal as completed.
    """
    return controller.update_goal(goal_id, data)


@router.delete("/", response_model=Dict[str, Any])
def delete_goals(ids: List[int]):
    """
    Bulk delete goals using a list of IDs.
    """
    return controller.delete_goals(ids)