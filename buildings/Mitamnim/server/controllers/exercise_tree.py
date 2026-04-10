import os
import requests
from typing import List, Optional, Dict, Any, Union
from fastapi import HTTPException
from models.exercise_tree import ExerciseTreeNodeCreate, ExerciseTreeNodeUpdate
from controllers.active_params import sync_exercise_params
from controllers.active_params import get_exercise_params

# =================================================================
# CONFIGURATION
# =================================================================

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "exercise_tree"


# =================================================================
# CREATE OPERATIONS (Individual & Bulk)
# =================================================================

def create_exercise_nodes(data: List[ExerciseTreeNodeCreate]):
    """
    Creates nodes in the exercise tree and optionally links active parameters.
    """
    results = []
    for item in data:
        # 1. Extract parameters from the model dump if they exist
        # We assume the model might have a field 'active_params' or similar
        item_dict = item.model_dump(exclude_unset=True)
        active_params = item_dict.pop("active_params", [])

        # 2. Insert the Node itself into exercise_tree
        payload = {
            "action": "insert",
            "table": TABLE_NAME,
            "data": item_dict  # Now contains only tree fields (name, parent_id)
        }
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        new_node_data = response.json().get("data", [])
        if not new_node_data:
            continue

        new_node = new_node_data[0]
        node_id = new_node.get("id")

        # 3. If parameters were provided, link them to the new node
        if active_params and node_id:
            # We reuse the sync logic which handles bulk insert and enrichment
            sync_res = sync_exercise_params(node_id, active_params)
            # Add the enriched params to the response object so the frontend sees them immediately
            new_node["active_params"] = sync_res.get("data", [])

        results.append(new_node)

    return {"status": "success", "data": results}


# =================================================================
# READ OPERATIONS
# =================================================================

def get_exercise_tree(filters: Union[int, Dict[str, Any], None] = None, limit: Optional[int] = None):
    """
    Fetches the exercise tree or specific nodes.

    Args:
        filters: Can be an integer (ID), a dictionary of filters, or None.
        limit: Optional limit for the query.
    """
    # 1. Smart Filter Handling: Wrap integer ID into a valid dictionary
    query_filters = {}

    if isinstance(filters, int):
        # If user passed just '6', convert to {'id': 6}
        query_filters = {"id": filters}
    elif isinstance(filters, dict):
        # If user passed a dict, use it as is
        query_filters = filters
    elif filters is None:
        # If no filters, fetch everything
        query_filters = {}

    # 2. Build the Silo-compatible payload
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": query_filters,
        "limit": limit
    }

    try:
        # 3. Request to DB Manager
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

        # 4. Error Handling
        if response.status_code != 200:
            print(f"Silo Query Error: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"DB Manager Error: {response.text}"
            )

        # 5. Return data
        data = response.json().get("data", [])
        return data

    except requests.RequestException as e:
        print(f"Connection error to DB Manager: {e}")
        raise HTTPException(status_code=503, detail="Database Manager connection failed")

def get_exercise_node_by_id(node_id: int):
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": {"id": node_id}
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error fetching from DB")

    data = response.json().get("data", [])
    if not data:
        raise HTTPException(status_code=404, detail="Exercise node not found")

    node = data[0]

    # --- הוספת הפרמטרים המועשרים לתוצאה ---
    try:
        # שליפת הפרמטרים דרך הקונטרולר שכולל שמות ויחידות מידה
        node["active_params"] = get_exercise_params(node_id)
    except Exception as e:
        print(f"Warning: Could not fetch params for node {node_id}: {e}")
        node["active_params"] = []

    return node


# =================================================================
# UPDATE OPERATIONS
# =================================================================

def update_exercise_node(node_id: int, data: ExerciseTreeNodeUpdate):
    payload = {
        "action": "update",
        "table": TABLE_NAME,
        "filters": {"id": node_id},
        "data": data.model_dump(exclude_unset=True)
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()


# =================================================================
# DELETE OPERATIONS
# =================================================================

def delete_exercise_nodes(ids: List[int]):
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
