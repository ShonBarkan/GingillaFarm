import pytest
from fastapi.testclient import TestClient
from ..main import app
from ..core.scheduler import scheduler

client = TestClient(app)


def test_foreman_health():
    """Verify the office is open."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "active"


def test_chore_list():
    """Verify all 4 core chores are on the clipboard."""
    response = client.get("/jobs")
    job_ids = [j["job_id"] for j in response.json()]
    expected_jobs = ["morning_report", "log_cleanup", "heartbeat_patrol", "blueprint_audit"]

    for job in expected_jobs:
        assert job in job_ids


def test_add_manual_chore():
    """Test if we can give the Foreman a quick task."""
    payload = {
        "job_id": "quick_snack",
        "seconds": 5,
        "task_name": "generic_ping"
    }
    response = client.post("/jobs/add", json=payload)
    assert response.status_code == 200
    assert scheduler.get_job("quick_snack") is not None