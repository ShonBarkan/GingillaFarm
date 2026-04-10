import os
import requests
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from models.exercise_assets import ExerciseAssetCreate, ExerciseAssetUpdate

# =================================================================
# CONFIGURATION
# =================================================================

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "exercise_assets"


# =================================================================
# CREATE OPERATIONS (Individual & Bulk)
# =================================================================

def create_exercise_assets(data: List[ExerciseAssetCreate]):
    """
    Registers media assets. Loops through the list for Silo compatibility.
    """
    results = []
    for item in data:
        payload = {
            "action": "insert",
            "table": TABLE_NAME,
            "data": item.model_dump(exclude_unset=True)
        }
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        results.extend(response.json().get("data", []))

    return {"status": "success", "data": results}


# =================================================================
# READ OPERATIONS (With Limit & Filters)
# =================================================================

def get_exercise_assets(filters: Dict[str, Any] = None, limit: Optional[int] = None):
    """
    Retrieves exercise assets. Action: 'select' -> 'find'.
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

    return response.json().get("data", [])


def get_exercise_asset_by_id(asset_id: int):
    """
    Fetches a specific asset by its primary key ID.
    """
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": {"id": asset_id}
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    result_json = response.json()
    data = result_json.get("data", [])

    if not data:
        raise HTTPException(status_code=404, detail="Exercise asset not found")

    return data[0]


# =================================================================
# UPDATE OPERATIONS
# =================================================================

def update_exercise_asset(asset_id: int, data: ExerciseAssetUpdate):
    """
    Updates the metadata, URL, or tags of an existing asset.
    """
    payload = {
        "action": "update",
        "table": TABLE_NAME,
        "filters": {"id": asset_id},
        "data": data.model_dump(exclude_unset=True)
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


# =================================================================
# DELETE OPERATIONS (Individual & Bulk)
# =================================================================

def delete_exercise_assets(ids: List[int]):
    """
    Deletes assets. Loops because Silo expects single record filters.
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