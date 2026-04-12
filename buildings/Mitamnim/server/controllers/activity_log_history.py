import os
import requests
import json
from typing import List, Optional, Dict, Any
from .exercise_tree import get_exercise_tree

# =================================================================
# CONFIGURATION
# =================================================================

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "activity_logs"


# =================================================================
# INTERNAL UTILITIES
# =================================================================

def _get_all_descendant_ids(exercise_id: int, all_nodes: List[Dict]) -> List[int]:
    """
    Recursively finds all descendant exercise IDs to ensure history
    includes data from sub-categories.
    """
    ids = {exercise_id}  # Using a set to prevent duplicates

    def find_children_recursive(current_id):
        for node in all_nodes:
            if node.get("parent_id") == current_id:
                child_id = node.get("id")
                if child_id not in ids:
                    ids.add(child_id)
                    find_children_recursive(child_id)

    find_children_recursive(exercise_id)
    return list(ids)


# =================================================================
# CORE LOGIC
# =================================================================

def get_history(exercise_id: Optional[int] = None, session_id: Optional[int] = None, limit: int = 50):
    """
    Fetches and enriches activity history logs.
    Handles JSON parsing and schema compatibility for workout_session_id.
    """
    try:
        # 1. Fetch all exercise metadata for mapping names and hierarchy
        all_exercises = get_exercise_tree({})
        exercise_names_map = {ex["id"]: ex["name"] for ex in all_exercises}

        # 2. Resolve target exercise IDs if filter is provided
        target_ids = []
        if exercise_id:
            target_ids = _get_all_descendant_ids(exercise_id, all_exercises)

        # 3. Fetch logs from DB Manager (Silo)
        payload = {
            "action": "find",
            "table": TABLE_NAME,
            "filters": {"workout_session_id": session_id} if session_id else {},
            "limit": 1000,
            "order_by": "timestamp",
            "order_direction": "DESC"
        }

        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code != 200:
            print(f"[HISTORY CONTROLLER] DB Manager Error: {response.text}")
            return []

        all_raw_logs = response.json().get("data", [])

        # 4. Filter by exercise hierarchy in memory
        if exercise_id:
            final_logs = [log for log in all_raw_logs if log.get("exercise_id") in target_ids]
        else:
            final_logs = all_raw_logs

        # 5. Apply limit and enrich data for frontend
        final_logs = final_logs[:limit]

        for log in final_logs:
            # Attach the human-readable exercise name
            ex_id = log.get("exercise_id")
            log["exercise_name"] = exercise_names_map.get(ex_id, f"Exercise {ex_id}")

            # CRITICAL: Ensure workout_session_id is compatible with Optional[int] schema
            # If the database has it as null, we set it explicitly to None
            if log.get("workout_session_id") is None:
                log["workout_session_id"] = None

            # Parse performance_data JSON string back to dictionary
            if isinstance(log.get("performance_data"), str):
                try:
                    log["performance_data"] = json.loads(log["performance_data"])
                except (json.JSONDecodeError, TypeError):
                    log["performance_data"] = {}

            # Ensure timestamp is stringified if it returns as datetime object
            log["timestamp"] = str(log.get("timestamp", ""))

            # Ensure is_manual has a default value
            if "is_manual" not in log or log["is_manual"] is None:
                log["is_manual"] = True

        return final_logs

    except Exception as e:
        print(f"[HISTORY CONTROLLER] General Error: {e}")
        return []