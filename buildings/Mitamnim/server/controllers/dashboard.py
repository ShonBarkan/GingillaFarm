import os
import requests
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from .stats import calculate_exercise_stats, _get_parameter_units
from .exercise_tree import get_exercise_tree

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")

# Configuration for the featured statistics - Name based lookup
FEATURED_EXERCISES_CONFIG = [
    {
        "exercise_name": "כושר כללי",
        "params": ["נפח כולל (משקל X חזרות)"]
    },
    {
        "exercise_name": "ג'ודו",
        "params": ["קרבות רצופים", "זמן"]
    }
]


def get_dashboard_summary(start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    day_of_week = now.weekday()

    return {
        "date": today_str,
        "day_of_week": day_of_week,
        "todays_workouts": _get_todays_workouts(day_of_week, today_str),
        "featured_stats": _get_featured_stats(start_date, end_date)
    }


def _get_todays_workouts(day_of_week: int, today_str: str) -> List[Dict[str, Any]]:
    try:
        # 1. Fetch all templates
        payload = {"action": "find", "table": "workout_templates", "filters": {}}
        templates_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload).json()
        all_templates = templates_res.get("data", [])

        # 2. Fetch today's sessions to check completion
        session_payload = {
            "action": "find",
            "table": "workout_sessions",
            "filters": {}
        }
        sessions_res = requests.post(f"{DB_MANAGER_URL}/query", json=session_payload).json()
        all_sessions = sessions_res.get("data", [])

        # 3. Fetch exercise tree for parent names
        all_nodes = get_exercise_tree({})
        node_map = {n['id']: n['name'] for n in all_nodes}

        todays_workouts = []
        for temp in all_templates:
            days = temp.get("scheduled_days", [])
            if isinstance(days, str):
                days = json.loads(days)

            if day_of_week in days:
                temp_id = temp.get("id")

                is_completed = any(
                    s.get("template_id") == temp_id and
                    s.get("start_time", "").startswith(today_str)
                    for s in all_sessions
                )

                todays_workouts.append({
                    "id": temp_id,
                    "name": temp.get("name"),
                    "description": temp.get("description"),
                    "expected_time": temp.get("expected_time"),
                    "parent_exercise_id": temp.get("parent_exercise_id"),
                    "parent_exercise_name": node_map.get(temp.get("parent_exercise_id")),
                    "is_completed_today": is_completed
                })

        return todays_workouts
    except Exception as e:
        print(f"Error fetching today's workouts: {e}")
        return []


def _get_featured_stats(start_date: Optional[str], end_date: Optional[str]) -> List[Dict[str, Any]]:
    featured_results = []

    try:
        # 1. Fetch all nodes to map names to IDs
        all_nodes = get_exercise_tree({})
        # Creating a map: { "Name": id }
        name_to_id = {node['name']: node['id'] for node in all_nodes}

        for config in FEATURED_EXERCISES_CONFIG:
            ex_name = config["exercise_name"]
            allowed_params = config["params"]

            # 2. Resolve ID from name
            ex_id = name_to_id.get(ex_name)

            if not ex_id:
                print(f"Warning: Featured exercise '{ex_name}' not found in tree.")
                continue

            # 3. Reuse existing stats logic with the resolved ID
            full_stats = calculate_exercise_stats(ex_id, start_date=start_date, end_date=end_date)

            # 4. Filter only the parameters defined in config
            filtered_params = [
                p for p in full_stats.get("parameters", [])
                if p["name"] in allowed_params
            ]

            featured_results.append({
                "exercise_id": ex_id,
                "exercise_name": full_stats.get("exercise_name"),
                "stats": filtered_params,
                "last_activity": full_stats.get("last_session_date")
            })

    except Exception as e:
        print(f"Error generating featured stats: {e}")

    return featured_results