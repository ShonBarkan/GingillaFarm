import os
import requests
import json
from typing import List, Optional, Dict, Any
from .exercise_tree import get_exercise_tree

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "activity_logs"


def _get_all_descendant_ids(exercise_id: int, all_nodes: List[Dict]) -> List[int]:
    """
    Helper to find all children from a pre-fetched flat list of nodes.
    """
    ids = [exercise_id]

    def find_children_recursive(current_id):
        for node in all_nodes:
            if node.get("parent_id") == current_id:
                child_id = node.get("id")
                if child_id not in ids:
                    ids.append(child_id)
                    find_children_recursive(child_id)

    find_children_recursive(exercise_id)
    return ids


def get_history(exercise_id: Optional[int] = None, session_id: Optional[int] = None, limit: int = 50):
    try:
        # 1. Fetch ALL exercise nodes once (Optimization: use this for both Tree and Names)
        all_exercises = get_exercise_tree({})
        exercise_names_map = {ex["id"]: ex["name"] for ex in all_exercises}

        # 2. Resolve target IDs for the filter
        target_ids = []
        if exercise_id:
            target_ids = _get_all_descendant_ids(exercise_id, all_exercises)

        # 3. Fetch logs from Silo
        # Using simple filters to ensure Silo compatibility
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
            return []

        all_raw_logs = response.json().get("data", [])

        # 4. Filter logs by exercise hierarchy in Python
        if exercise_id:
            final_logs = [log for log in all_raw_logs if log.get("exercise_id") in target_ids]
        else:
            final_logs = all_raw_logs

        # 5. Apply limit and ENRICH names from our local map
        final_logs = final_logs[:limit]

        for log in final_logs:
            ex_id = log.get("exercise_id")
            # Attach the real name from our pre-fetched map
            log["exercise_name"] = exercise_names_map.get(ex_id, f"Exercise {ex_id}")

            # Parse performance data
            if isinstance(log.get("performance_data"), str):
                try:
                    log["performance_data"] = json.loads(log["performance_data"])
                except:
                    log["performance_data"] = {}

            log["timestamp"] = str(log.get("timestamp", ""))

        return final_logs

    except Exception as e:
        print(f"History Error: {e}")
        return []