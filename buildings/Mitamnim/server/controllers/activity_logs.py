import json
import os
import requests
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from models.activity_logs import ActivityLogCreate, ActivityLogUpdate

# =================================================================
# CONFIGURATION
# =================================================================

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "activity_logs"


# =================================================================
# CREATE OPERATIONS (Individual & Bulk)
# =================================================================


def create_activity_logs(data: List[Any]):
    """
    Inserts activity logs into the database.
    Handles both Pydantic models and raw dictionaries for internal building communication.
    """
    results = []
    for item in data:
        # 1. Flexible Type Handling
        if hasattr(item, "model_dump"):
            # If it's a Pydantic model (from Route)
            item_dict = item.model_dump(exclude_unset=True)
        else:
            # If it's already a dict (from Session Controller)
            item_dict = item

        # 2. Silo Compatibility: Stringify nested JSON objects
        if "performance_data" in item_dict and isinstance(item_dict["performance_data"], (dict, list)):
            item_dict["performance_data"] = json.dumps(item_dict["performance_data"])

        # 3. DB Manager Request
        payload = {
            "action": "insert",
            "table": TABLE_NAME,
            "data": item_dict
        }

        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

        if response.status_code != 200:
            print(f"Silo Error in Activity Logs: {response.text}")
            raise HTTPException(status_code=response.status_code, detail=response.text)

        # 4. Collect results
        results.extend(response.json().get("data", []))

    return {"status": "success", "data": results}


# =================================================================
# READ OPERATIONS (With Limit & Filters)
# =================================================================

def get_activity_logs(filters: Dict[str, Any] = None, limit: Optional[int] = None):
    """
    Retrieves performance logs.
    Action: 'select' -> 'find' to match Silo translator.
    """
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": filters or {},
        "limit": limit
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    # Return the clean list from the 'data' key
    return response.json().get("data", [])


def get_activity_log_by_id(log_id: int):
    """
    Fetches a specific log entry by its primary key ID.
    """
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": {"id": log_id}
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    result_json = response.json()
    data = result_json.get("data", [])

    if not data:
        raise HTTPException(status_code=404, detail="Activity log entry not found")

    return data[0]


# =================================================================
# UPDATE OPERATIONS
# =================================================================

def update_activity_log(log_id: int, data: Any):
    """
    Updates an activity log.
    Ensures performance_data is stringified for the Silo.
    """
    # 1. Handle both Pydantic and Dict
    if hasattr(data, "model_dump"):
        item_dict = data.model_dump(exclude_unset=True)
    else:
        item_dict = data

    # 2. CRITICAL: Stringify performance_data for SQL compatibility
    if "performance_data" in item_dict and isinstance(item_dict["performance_data"], (dict, list)):
        item_dict["performance_data"] = json.dumps(item_dict["performance_data"])

    # 3. Build the payload for DB Manager
    payload = {
        "action": "update",
        "table": TABLE_NAME,
        "filters": {"id": log_id},
        "data": item_dict
    }

    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    if response.status_code != 200:
        print(f"Silo Update Error: {response.text}")
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


# =================================================================
# DELETE OPERATIONS (Individual & Bulk)
# =================================================================

def delete_activity_logs(ids: List[int]):
    """
    Deletes activity logs. Loops through IDs since Silo expects single filter matches.
    """
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
