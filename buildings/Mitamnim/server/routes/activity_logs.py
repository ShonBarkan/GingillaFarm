from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from models.activity_logs import ActivityLogSchema, ActivityLogCreate, ActivityLogUpdate
from controllers import activity_logs as controller

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])


@router.post("/", response_model=Dict[str, Any])
def create_activity_logs(data: List[ActivityLogCreate]):
    print(f"[ROUTER] Creating {len(data)} logs...")
    return controller.create_activity_logs(data)


@router.get("/", response_model=List[ActivityLogSchema])
def get_activity_logs(
        session_id: Optional[int] = None,
        exercise_id: Optional[int] = None,
        limit: Optional[int] = Query(None, description="Limit the number of results (default is all)")
):
    filters = {}
    if session_id: filters["session_id"] = session_id
    if exercise_id: filters["exercise_id"] = exercise_id

    print(f"[ROUTER] Fetching logs with filters: {filters}")
    results = controller.get_activity_logs(filters=filters, limit=limit)

    print(f"[ROUTER] Controller returned {len(results)} items")
    if len(results) > 0:
        print(f"[ROUTER] First item sample: {results[0]}")

    return results


@router.get("/{log_id}", response_model=ActivityLogSchema)
def get_activity_log(log_id: int):
    print(f"[ROUTER] Fetching log ID: {log_id}")
    return controller.get_activity_log_by_id(log_id)


@router.patch("/{log_id}", response_model=Dict[str, Any])
def update_activity_log(log_id: int, data: ActivityLogUpdate):
    print(f"[ROUTER] Updating log ID: {log_id}")
    return controller.update_activity_log(log_id, data)


@router.delete("/", response_model=Dict[str, Any])
def delete_activity_logs(ids: List[int]):
    print(f"[ROUTER] Deleting logs: {ids}")
    return controller.delete_activity_logs(ids)