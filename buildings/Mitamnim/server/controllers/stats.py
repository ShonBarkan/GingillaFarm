import os, requests, json
from typing import List, Dict, Any, Optional
from .exercise_tree import get_exercise_tree
from .activity_log_history import _get_all_descendant_ids

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")


def _get_parameter_units() -> Dict[str, str]:
    """
    Helper to fetch all parameters and create a name-to-unit mapping.
    """
    try:
        payload = {"action": "find", "table": "parameters", "filters": {}}
        res = requests.post(f"{DB_MANAGER_URL}/query", json=payload).json()
        params_data = res.get("data", [])
        # Create a map: {"משקל": "ק"ג", "חזרות": "", ...}
        return {p['name'].strip(): p.get('unit', '') for p in params_data if p.get('name')}
    except Exception as e:
        print(f"Error fetching parameter units: {e}")
        return {}


def calculate_exercise_stats(exercise_id: int) -> Dict[str, Any]:
    # 1. Fetch Tree Nodes
    all_nodes = get_exercise_tree({})
    current_node = next((n for n in all_nodes if n['id'] == exercise_id), {})
    relevant_ids = _get_all_descendant_ids(exercise_id, all_nodes)

    # Fetch units mapping
    units_map = _get_parameter_units()

    # 2. Fetch logs
    try:
        payload = {"action": "find", "table": "activity_logs", "filters": {}, "limit": 1000}
        logs_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload).json()
        all_logs = logs_res.get("data", [])
        logs = [log for log in all_logs if log.get("exercise_id") in relevant_ids]
    except Exception as e:
        print(f"Stats Fetch Error: {e}")
        logs = []

    if not logs:
        return {
            "exercise_id": exercise_id,
            "exercise_name": current_node.get('name', "Unknown"),
            "parameters": [],
            "total_logs_count": 0,
            "last_session_date": None
        }

    # 3. Aggregate Data with Clean Keys
    stats_map = {}
    for log in logs:
        perf_data = log.get("performance_data", {})
        if isinstance(perf_data, str):
            try:
                perf_data = json.loads(perf_data)
            except:
                perf_data = {}

        if not isinstance(perf_data, dict):
            continue

        for param_name, value in perf_data.items():
            if not param_name or not str(param_name).strip() or param_name == "null":
                continue

            try:
                num_val = float(value)
                clean_name = str(param_name).strip()
                if clean_name not in stats_map:
                    stats_map[clean_name] = []
                stats_map[clean_name].append(num_val)
            except (ValueError, TypeError):
                continue

    # 4. Build Schema-compliant stats
    final_params_stats = []
    for param_name, values in stats_map.items():
        if not values:
            continue

        total = sum(values)
        count = len(values)

        final_params_stats.append({
            "parameter_id": 0,
            "name": param_name,
            "unit": units_map.get(param_name, ""),  # משיכת היחידה מהמפה
            "max_value": max(values),
            "avg_value": round(total / count, 2),
            "total_value": total,
            "count": count
        })

    timestamps = [l['timestamp'] for l in logs if l.get('timestamp')]

    return {
        "exercise_id": exercise_id,
        "exercise_name": current_node.get('name', "Unknown"),
        "last_session_date": max(timestamps) if timestamps else None,
        "parameters": final_params_stats,
        "total_logs_count": len(logs),
        "descendant_count": len(relevant_ids) - 1
    }


def get_trend_data(exercise_id: int, start_date: str = None, end_date: str = None):
    all_nodes = get_exercise_tree({})
    relevant_ids = _get_all_descendant_ids(exercise_id, all_nodes)

    # Fetch units mapping
    units_map = _get_parameter_units()

    try:
        payload = {"action": "find", "table": "activity_logs", "filters": {}, "limit": 1000}
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        all_logs = response.json().get("data", [])

        data = []
        for log in all_logs:
            if log.get("exercise_id") not in relevant_ids:
                continue

            full_ts = log.get("timestamp", "")
            if not full_ts:
                continue

            ts_date = full_ts.split('T')[0]

            if start_date and ts_date < start_date:
                continue
            if end_date and ts_date > end_date:
                continue

            perf_data = log.get("performance_data", {})
            if isinstance(perf_data, str):
                try:
                    perf_data = json.loads(perf_data)
                except:
                    perf_data = {}

            if isinstance(perf_data, dict):
                # כאן אנחנו מזריקים את ה-unit לתוך ה-performance_data או מוסיפים שדה metadata
                clean_perf = {k.strip(): v for k, v in perf_data.items() if k and str(k).strip()}

                # הוספת יחידות לכל פרמטר בתוך האובייקט כדי שהפרונטנד ידע להציג בגרף
                # אנחנו יוצרים מבנה שכולל את היחידה עבור כל לוג
                log["performance_data"] = clean_perf
                log["parameter_units"] = {k: units_map.get(k, "") for k in clean_perf.keys()}

                data.append(log)

        return sorted(data, key=lambda x: x.get('timestamp', ''))
    except Exception as e:
        print(f"Trend Error: {e}")
        return []