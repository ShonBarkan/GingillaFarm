import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_kill_switch():
    """Test that closing the gate actually stops traffic."""
    # 1. Close the AI gate
    client.post("/admin/gate/ai/toggle")

    # 2. Try to reach the AI service
    response = client.post("/ai/ask", json={"prompt": "Hello?"})
    assert response.status_code == 503
    assert "closed for repairs" in response.json()["detail"]

    # 3. Re-open the gate
    client.post("/admin/gate/ai/toggle")
    # (Note: In actual tests, the target service would be mocked)