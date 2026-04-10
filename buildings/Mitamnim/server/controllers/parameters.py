import os
import requests
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from models.parameters import ParameterCreate, ParameterUpdate

# =================================================================
# CONFIGURATION
# =================================================================

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "parameters"


# =================================================================
# CREATE OPERATIONS (Individual & Bulk)
# =================================================================

def create_parameters(data: List[ParameterCreate]):
    """
    Inserts one or more global parameters into the database.
    Loops through the data list for Silo compatibility.
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

def get_parameters(filters: Dict[str, Any] = None, limit: Optional[int] = None):
    """
    Retrieves global parameters. Action: 'select' -> 'find'.
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


def get_parameter_by_id(param_id: int):
    """
    Fetches a specific parameter by its ID.
    """
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": {"id": param_id}
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    result_json = response.json()
    data = result_json.get("data", [])

    if not data:
        raise HTTPException(status_code=404, detail="Parameter not found")

    return data[0]


# =================================================================
# UPDATE OPERATIONS
# =================================================================

def update_parameter(param_id: int, data: ParameterUpdate):
    """
    Updates an existing parameter (e.g., name or unit).
    """
    payload = {
        "action": "update",
        "table": TABLE_NAME,
        "filters": {"id": param_id},
        "data": data.model_dump(exclude_unset=True)
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


# =================================================================
# DELETE OPERATIONS (Individual & Bulk)
# =================================================================

def delete_parameters(ids: List[int]):
    """
    Deletes global parameters. Loops because Silo expects single-match filters.
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