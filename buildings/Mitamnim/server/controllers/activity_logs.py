import json
import os
import requests
import pytz
from datetime import datetime
from typing import List, Any, Dict, Optional
from fastapi import HTTPException

DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")
TABLE_NAME = "activity_logs"
ISRAEL_TZ = pytz.timezone("Asia/Jerusalem")


def _parse_log_data(log: Dict[str, Any]) -> Dict[str, Any]:
    if "performance_data" in log and isinstance(log["performance_data"], str):
        try:
            log["performance_data"] = json.loads(log["performance_data"])
        except (json.JSONDecodeError, TypeError):
            log["performance_data"] = {}

    if "workout_session_id" in log:
        val = log["workout_session_id"]
        if val is None:
            log["workout_session_id"] = None
        else:
            try:
                log["workout_session_id"] = int(val)
            except:
                log["workout_session_id"] = None

    return log


def create_activity_logs(data: List[Any]):
    results = []
    for item in data:
        if hasattr(item, "model_dump"):
            item_dict = item.model_dump(exclude_unset=True)
        else:
            item_dict = item

        if "performance_data" in item_dict and isinstance(item_dict["performance_data"], (dict, list)):
            item_dict["performance_data"] = json.dumps(item_dict["performance_data"])

        if not item_dict.get("timestamp"):
            item_dict["timestamp"] = datetime.now(ISRAEL_TZ).isoformat()
        else:
            try:
                dt = datetime.fromisoformat(item_dict["timestamp"].replace('Z', '+00:00'))
                item_dict["timestamp"] = dt.astimezone(ISRAEL_TZ).isoformat()
            except:
                item_dict["timestamp"] = datetime.now(ISRAEL_TZ).isoformat()

        payload = {
            "action": "insert",
            "table": TABLE_NAME,
            "data": item_dict
        }

        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        raw_results = response.json().get("data", [])
        for res in raw_results:
            results.append(_parse_log_data(res))

    return {"status": "success", "data": results}


def get_activity_logs(filters: Dict[str, Any] = None, limit: Optional[int] = None):
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
    return [_parse_log_data(log) for log in raw_data]


def get_activity_log_by_id(log_id: int):
    payload = {
        "action": "find",
        "table": TABLE_NAME,
        "filters": {"id": log_id}
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    data = response.json().get("data", [])
    if not data:
        raise HTTPException(status_code=404, detail="Activity log entry not found")
    return _parse_log_data(data[0])


def update_activity_log(log_id: int, data: Any):
    if hasattr(data, "model_dump"):
        item_dict = data.model_dump(exclude_unset=True)
    else:
        item_dict = data

    if "performance_data" in item_dict and isinstance(item_dict["performance_data"], (dict, list)):
        item_dict["performance_data"] = json.dumps(item_dict["performance_data"])

    payload = {
        "action": "update",
        "table": TABLE_NAME,
        "filters": {"id": log_id},
        "data": item_dict
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    result = response.json()
    if "data" in result and result["data"]:
        result["data"] = [_parse_log_data(log) for log in result["data"]]
    return result


def delete_activity_logs(ids: List[int]):
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
