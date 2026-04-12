import os, requests, json, operator
from typing import List, Dict, Any, Optional
from .exercise_tree import get_exercise_tree
from .activity_log_history import _get_all_descendant_ids


DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")

# --- Configuration Engine ---
STATS_CONFIG = {
    "derived_parameters": [
        {
            "source": "בריכות",
            "target": "מרחק",
            "multiplier": 25,
            "unit": "מטרים"
        }
    ],
    "combinations": [
        {
            "sources": ["משקל", "חזרות"],
            "target": "נפח כולל (משקל X חזרות)",
            "operation": operator.mul,
            "unit": "ק״ג",
            "include_sources": [ "חזרות"],
            "stats_source": "משקל"
        }
    ]
}


def _get_parameter_units() -> Dict[str, str]:
    try:
        payload = {"action": "find", "table": "parameters", "filters": {}}
        res = requests.post(f"{DB_MANAGER_URL}/query", json=payload).json()
        params_data = res.get("data", [])
        return {p['name'].strip(): p.get('unit', '') for p in params_data if p.get('name')}
    except Exception as e:
        print(f"Error fetching parameter units: {e}")
        return {}


def _normalize_performance_data(perf_data: Dict[str, Any], units_map: Dict[str, str]) -> Dict[
    str, Dict[str, List[float]]]:
    """
    Normalization engine to handle derived parameters and combinations.
    Returns a mapping of parameter names to their total and stats values.
    """
    normalized = {}
    for k, v in perf_data.items():
        if not k or k == "null":
            continue
        try:
            normalized[k.strip()] = float(v)
        except (ValueError, TypeError):
            continue

    # Initial structure for processed stats: { "param_name": {"total_vals": [], "stats_vals": [] } }
    processed_stats = {k: {"total_vals": [v], "stats_vals": [v]} for k, v in normalized.items()}

    # 1. Process derived parameters (e.g., Pools -> Distance)
    for rule in STATS_CONFIG["derived_parameters"]:
        src = rule["source"]
        if src in normalized:
            target = rule["target"]
            val = normalized[src] * rule["multiplier"]
            processed_stats[target] = {"total_vals": [val], "stats_vals": [val]}
            units_map[target] = rule["unit"]

    # 2. Process combinations (e.g., Weight * Reps -> Volume)
    for rule in STATS_CONFIG["combinations"]:
        srcs = rule["sources"]
        if all(s in normalized for s in srcs):
            target = rule["target"]
            val1, val2 = normalized[srcs[0]], normalized[srcs[1]]

            combined_val = rule["operation"](val1, val2)

            # Use specific stats_source for Max/Avg calculation, default to combined_val
            stats_val = normalized.get(rule["stats_source"], combined_val)

            processed_stats[target] = {
                "total_vals": [combined_val],
                "stats_vals": [stats_val]
            }
            units_map[target] = rule["unit"]

            # Remove original source parameters unless explicitly included
            for s in srcs:
                if s not in rule.get("include_sources", []):
                    processed_stats.pop(s, None)

    return processed_stats


def calculate_exercise_stats(exercise_id: int, start_date: Optional[str] = None, end_date: Optional[str] = None) -> \
Dict[str, Any]:
    all_nodes = get_exercise_tree({})
    current_node = next((n for n in all_nodes if n['id'] == exercise_id), {})
    relevant_ids = _get_all_descendant_ids(exercise_id, all_nodes)
    units_map = _get_parameter_units()

    try:
        payload = {"action": "find", "table": "activity_logs", "filters": {}, "limit": 1000}
        logs_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload).json()
        all_logs = logs_res.get("data", [])

        filtered_logs = []
        for log in all_logs:
            if log.get("exercise_id") not in relevant_ids:
                continue
            ts = log.get("timestamp", "").split('T')[0]
            if start_date and ts < start_date:
                continue
            if end_date and ts > end_date:
                continue
            filtered_logs.append(log)
    except Exception as e:
        print(f"Stats Error: {e}")
        filtered_logs = []

    if not filtered_logs:
        return {
            "exercise_id": exercise_id,
            "exercise_name": current_node.get('name', "Unknown"),
            "parameters": [],
            "total_logs_count": 0
        }

    # Data collection: { "param_name": { "totals": [], "stats": [] } }
    master_map = {}

    for log in filtered_logs:
        perf_data = log.get("performance_data", {})
        if isinstance(perf_data, str):
            try:
                perf_data = json.loads(perf_data)
            except:
                perf_data = {}

        normalized_entry = _normalize_performance_data(perf_data, units_map)

        for p_name, data in normalized_entry.items():
            if p_name not in master_map:
                master_map[p_name] = {"totals": [], "stats": []}
            master_map[p_name]["totals"].extend(data["total_vals"])
            master_map[p_name]["stats"].extend(data["stats_vals"])

    # Build final response object
    final_params_stats = []
    for p_name, values in master_map.items():
        total_sum = sum(values["totals"])
        stats_list = values["stats"]

        final_params_stats.append({
            "parameter_id": 0,
            "name": p_name,
            "unit": units_map.get(p_name, ""),
            "max_value": max(stats_list) if stats_list else 0,
            "avg_value": round(sum(stats_list) / len(stats_list), 2) if stats_list else 0,
            "total_value": total_sum,
            "count": len(values["totals"])
        })

    return {
        "exercise_id": exercise_id,
        "exercise_name": current_node.get('name', "Unknown"),
        "last_session_date": max([l['timestamp'] for l in filtered_logs]) if filtered_logs else None,
        "parameters": final_params_stats,
        "total_logs_count": len(filtered_logs),
        "descendant_count": len(relevant_ids) - 1
    }

def get_trend_data(exercise_id: int, start_date: str = None, end_date: str = None):
    all_nodes = get_exercise_tree({})
    relevant_ids = _get_all_descendant_ids(exercise_id, all_nodes)
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
                clean_perf = {k.strip(): v for k, v in perf_data.items() if k and str(k).strip()}
                log["performance_data"] = clean_perf
                log["parameter_units"] = {k: units_map.get(k, "") for k in clean_perf.keys()}
                data.append(log)

        return sorted(data, key=lambda x: x.get('timestamp', ''))
    except Exception as e:
        print(f"Trend Error: {e}")
        return []