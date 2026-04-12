import os
import requests
import json
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from models.workout_templates import WorkoutTemplateCreate, WorkoutTemplateUpdate
from controllers.active_params import create_active_params

# =================================================================
# CONFIGURATION
# =================================================================

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "workout_templates"


def get_all_descendant_ids(exercise_id: int) -> List[int]:
    """
    Helper to fetch all descendant IDs for a given exercise.
    This ensures we find workouts for the exercise itself and its children.
    """
    # 1. Fetch the entire tree structure to traverse it
    # Note: Using get_exercise_tree if available in your imports,
    # otherwise we fetch from the DB table 'exercises'
    payload = {"action": "find", "table": "exercises", "filters": {}}
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    all_nodes = response.json().get("data", [])

    descendants = [exercise_id]

    def find_children(parent_id):
        for node in all_nodes:
            if node.get("parent_id") == parent_id:
                descendants.append(node["id"])
                find_children(node["id"])

    find_children(exercise_id)
    return descendants


# =================================================================
# CREATE OPERATIONS (Individual & Bulk)
# =================================================================

def create_workout_templates(data: List[WorkoutTemplateCreate]):
    """
    Creates workout templates and handles nested session parameters.
    """
    results = []
    for item in data:
        # 1. Extract session params before dumping the template data
        session_params = item.session_required_params

        # 2. Prepare template data for Silo (Exclude nested params)
        item_dict = item.model_dump(exclude={"session_required_params"})

        if "exercises_config" in item_dict and item_dict["exercises_config"] is not None:
            item_dict["exercises_config"] = json.dumps(item_dict["exercises_config"])

        if "scheduled_days" in item_dict and item_dict["scheduled_days"] is not None:
            item_dict["scheduled_days"] = json.dumps(item_dict["scheduled_days"])

        # 3. Save the main Template
        payload = {
            "action": "insert",
            "table": TABLE_NAME,
            "data": item_dict
        }

        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

        if response.status_code == 200:
            res_data = response.json().get("data", [])
            if not res_data:
                continue

            new_template = res_data[0]
            template_id = new_template.get("id")

            # 4. Save nested session parameters (The Junction)
            if template_id and session_params:
                params_to_create = []
                for p in session_params:
                    p_dict = p.model_dump() if hasattr(p, 'model_dump') else p
                    p_dict["template_id"] = template_id
                    params_to_create.append(p_dict)

                create_active_params(params_to_create)

            results.append(new_template)
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

    return {"status": "success", "data": results}


# =================================================================
# READ OPERATIONS (With Limit & Filters)
# =================================================================

def get_workout_templates(filters: Dict[str, Any] = None, limit: Optional[int] = None,
                          recursive_exercise_id: Optional[int] = None):
    """
    Retrieves workout templates.
    If recursive_exercise_id is provided, it finds templates for the ID and its children.
    """
    processed_filters = {}

    # Logic for Recursive Search
    if recursive_exercise_id:
        relevant_ids = get_all_descendant_ids(recursive_exercise_id)
        processed_filters["parent_exercise_id"] = {"action": "in", "value": relevant_ids}

    # Standard Filters
    elif filters:
        for key, value in filters.items():
            if isinstance(value, list):
                processed_filters[key] = {"action": "in", "value": value}
            else:
                processed_filters[key] = value

    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": processed_filters,
        "limit": limit
    }

    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json().get("data", [])


def get_workout_template_by_id(template_id: int):
    """
    Fetches a specific workout template by its ID.
    """
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": {"id": template_id}
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    result_json = response.json()
    data = result_json.get("data", [])

    if not data:
        raise HTTPException(status_code=404, detail="Workout template not found")

    return data[0]


# =================================================================
# UPDATE OPERATIONS
# =================================================================

def update_workout_template(template_id: int, data: WorkoutTemplateUpdate):
    """
    Updates an existing template's configuration or metadata.
    """
    # Convert Pydantic model to dict, excluding fields that weren't provided in the request
    item_dict = data.model_dump(exclude_unset=True)

    # Serialize complex objects to JSON strings for Silo compatibility
    if "exercises_config" in item_dict and item_dict["exercises_config"] is not None:
        item_dict["exercises_config"] = json.dumps(item_dict["exercises_config"])

    if "scheduled_days" in item_dict and item_dict["scheduled_days"] is not None:
        item_dict["scheduled_days"] = json.dumps(item_dict["scheduled_days"])

    # Prepare payload for DB Manager
    payload = {
        "action": "update",
        "table": TABLE_NAME,
        "filters": {"id": template_id},
        "data": item_dict
    }

    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


# =================================================================
# DELETE OPERATIONS (Individual & Bulk)
# =================================================================

def delete_workout_templates(ids: List[int]):
    """
    Deletes workout templates by IDs.
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
