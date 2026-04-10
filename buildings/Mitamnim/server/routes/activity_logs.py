from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from models.activity_logs import ActivityLogSchema, ActivityLogCreate, ActivityLogUpdate
from controllers import activity_logs as controller

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])


# =================================================================
# ENDPOINTS
# =================================================================

@router.post("/", response_model=Dict[str, Any])
def create_activity_logs(data: List[ActivityLogCreate]):
    """
    Log performance results (sets, reps, weight) in bulk.
    """
    return controller.create_activity_logs(data)


@router.get("/", response_model=List[ActivityLogSchema])
def get_activity_logs(
        session_id: Optional[int] = None,
        exercise_id: Optional[int] = None,
        limit: Optional[int] = Query(None, description="Limit the number of results (default is all)")
):
    """
    Retrieve performance logs with optional filtering by session or exercise.
    """
    filters = {}
    if session_id: filters["session_id"] = session_id
    if exercise_id: filters["exercise_id"] = exercise_id

    return controller.get_activity_logs(filters=filters, limit=limit)


@router.get("/{log_id}", response_model=ActivityLogSchema)
def get_activity_log(log_id: int):
    """
    Retrieve a specific activity log entry by ID.
    """
    return controller.get_activity_log_by_id(log_id)


@router.patch("/{log_id}", response_model=Dict[str, Any])
def update_activity_log(log_id: int, data: ActivityLogUpdate):
    """
    Update specific performance metrics or metadata in a log.
    """
    return controller.update_activity_log(log_id, data)


@router.delete("/", response_model=Dict[str, Any])
def delete_activity_logs(ids: List[int]):
    """
    Bulk delete activity log entries.
    """
    return controller.delete_activity_logs(ids)