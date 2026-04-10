import os
import requests
import json
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from models.workout_sessions import WorkoutSessionCreate, WorkoutSessionUpdate
# Import the logs controller to handle atomic logging
from controllers.activity_logs import create_activity_logs

# =================================================================
# CONFIGURATION
# =================================================================

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "workout_sessions"


# =================================================================
# CREATE OPERATIONS
# =================================================================

def create_workout_sessions(data: List[WorkoutSessionCreate]):
    results = []
    for item in data:
        item_dict = item.model_dump(exclude={"session_required_params"})

        if "summary_data" in item_dict and item_dict["summary_data"] is not None:
            item_dict["summary_data"] = json.dumps(item_dict["summary_data"])

        payload = {
            "action": "insert",
            "table": TABLE_NAME,
            "data": item_dict
        }

        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

        if response.status_code != 200:
            print(f"Silo Error: {response.text}")
            raise HTTPException(status_code=response.status_code, detail=response.text)

        results.extend(response.json().get("data", []))

    return {"status": "success", "data": results}


# =================================================================
# UPDATE OPERATIONS (Atomic Logic added here)
# =================================================================

def update_workout_session(session_id: int, data: WorkoutSessionUpdate):
    """
    Updates session metadata and handles atomic activity logging.
    """
    # 1. Convert Pydantic model to dict
    item_dict = data.model_dump(exclude_unset=True)

    # 2. Handle Atomic Activity Logging
    activity_logs = item_dict.pop("activity_logs", None)
    if activity_logs:
        # Inject the session_id into each log entry
        for log in activity_logs:
            log["workout_session_id"] = session_id

            # Ensure performance_data is a JSON string for Silo compatibility
            # This is done here to ensure the data is ready for the logs controller
            if "performance_data" in log and isinstance(log["performance_data"], (dict, list)):
                log["performance_data"] = json.dumps(log["performance_data"])

        # Call the existing logs controller to save them
        create_activity_logs(activity_logs)

    # 3. Serialize summary_data for Silo compatibility
    if "summary_data" in item_dict and item_dict["summary_data"] is not None:
        item_dict["summary_data"] = json.dumps(item_dict["summary_data"])

    # 4. Update the session record in DB Manager
    payload = {
        "action": "update",
        "table": TABLE_NAME,
        "filters": {"id": session_id},
        "data": item_dict
    }

    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    if response.status_code != 200:
        print(f"Silo Error during session update: {response.text}")
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

# =================================================================
# READ & DELETE OPERATIONS (Remaining unchanged)
# =================================================================

def get_workout_sessions(filters: Dict[str, Any] = None, limit: Optional[int] = None):
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": filters or {},
        "limit": limit
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json().get("data", [])


def get_workout_session_by_id(session_id: int):
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": {"id": session_id}
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    result_json = response.json()
    data = result_json.get("data", [])
    if not data:
        raise HTTPException(status_code=404, detail="Workout session not found")
    return data[0]


def delete_workout_sessions(ids: List[int]):
    deleted_count = 0
    for row_id in ids:
        payload = {
            "action": "delete",
            "table": TABLE_NAME,
            "filters": {"id": row_id}
        }
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            deleted_count += 1
    return {"status": "deleted", "count": deleted_count, "ids": ids}