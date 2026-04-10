import os
import requests
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from models.active_params import ActiveParameterCreate, ActiveParameterUpdate

# =================================================================
# CONFIGURATION
# =================================================================

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "active_params"


# =================================================================
# INTERNAL HELPERS
# =================================================================

def _enrich_params_data(data_list: List[dict]) -> List[dict]:
    if not data_list:
        return data_list

    params_info_payload = {
        "action": "find",
        "table": "parameters",
        "filters": {}
    }

    try:
        params_info_res = requests.post(f"{DB_MANAGER_URL}/query", json=params_info_payload)
        if params_info_res.status_code == 200:
            all_defs = params_info_res.json().get("data", [])
            params_map = {p['id']: p for p in all_defs}

            for item in data_list:
                p_id = item.get('parameter_id')
                p_def = params_map.get(p_id)
                if p_def:
                    # אנחנו מוסיפים את השדות ישירות לאובייקט
                    item['name'] = p_def.get('name')
                    item['unit'] = p_def.get('unit')
    except Exception as e:
        print(f"Enrichment error: {e}")

    return data_list


# =================================================================
# CREATE OPERATIONS
# =================================================================

def create_active_params(data: List[Any]):
    """
    Inserts active parameters into the database.
    Handles both Pydantic models (from routes) and raw dicts (from other controllers).
    """
    results = []
    for item in data:
        # 1. Flexible Type Handling: Check if item is Pydantic or Dict
        if hasattr(item, "model_dump"):
            # If it's a Pydantic model, convert to dict
            item_dict = item.model_dump(exclude_unset=True)
        else:
            # If it's already a dict, use as is
            item_dict = item

        # 2. Build Silo Payload
        payload = {
            "action": "insert",
            "table": TABLE_NAME,
            "data": item_dict
        }

        # 3. Request to DB Manager
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

        if response.status_code != 200:
            # Print error to server console for debugging
            print(f"Silo Error in Active Params: {response.text}")
            raise HTTPException(status_code=response.status_code, detail=response.text)

        # 4. Collect the inserted record
        res_json = response.json()
        results.extend(res_json.get("data", []))

    return {"status": "success", "data": results}

# =================================================================
# READ OPERATIONS
# =================================================================

def get_active_params(filters: Dict[str, Any] = None, limit: Optional[int] = None):
    """
    Retrieves parameter links and enriches them with names and units.
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

    raw_data = response.json().get("data", [])
    return _enrich_params_data(raw_data)


def get_active_param_by_id(param_id: int):
    """
    Fetches a specific link and enriches it with metadata.
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
        raise HTTPException(status_code=404, detail="Active parameter link not found")

    enriched_item = _enrich_params_data([data[0]])
    return enriched_item[0]


# =================================================================
# UPDATE & SYNC OPERATIONS
# =================================================================

def update_active_param(param_id: int, data: ActiveParameterUpdate):
    """
    Updates the priority or default value of an existing link.
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


def sync_exercise_params(exercise_id: int, params_data: List[dict]):
    """
    Replaces all active parameters for an exercise with a new prioritized list.
    Enriches the response with parameter metadata.
    """
    # 1. Clear existing links for this specific exercise
    delete_payload = {
        "action": "delete",
        "table": TABLE_NAME,
        "filters": {"exercise_id": exercise_id}
    }
    del_res = requests.post(f"{DB_MANAGER_URL}/query", json=delete_payload)

    if del_res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to clear existing parameters")

    if not params_data:
        return {"status": "success", "data": []}

    # 2. Insert new entries one by one (Silo standard)
    inserted_results = []
    for item in params_data:
        insert_payload = {
            "action": "insert",
            "table": TABLE_NAME,
            "data": {
                "exercise_id": exercise_id,
                "parameter_id": item["parameter_id"],
                "priority_index": item.get("priority_index", 0)
            }
        }
        res = requests.post(f"{DB_MANAGER_URL}/query", json=insert_payload)

        if res.status_code == 200:
            inserted_results.extend(res.json().get("data", []))
        else:
            # Optional: handle partial failure or raise error
            raise HTTPException(status_code=res.status_code, detail=res.text)

    # 3. Enrich the new list with names and units
    enriched_results = _enrich_params_data(inserted_results)

    return {
        "status": "success",
        "data": enriched_results
    }


# =================================================================
# DELETE OPERATIONS
# =================================================================

def delete_active_params(ids: List[int]):
    """
    Bulk delete parameter links by ID.
    """
    deleted_ids = []
    for row_id in ids:
        payload = {
            "action": "delete",
            "table": TABLE_NAME,
            "filters": {"id": row_id}
        }
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            deleted_ids.append(row_id)

    return {"status": "deleted", "count": len(deleted_ids), "ids": deleted_ids}


def get_exercise_params(exercise_id: int):
    """
    Helper function specifically for fetching and enriching
    parameters for a single exercise.
    """
    return get_active_params(filters={"exercise_id": exercise_id})
