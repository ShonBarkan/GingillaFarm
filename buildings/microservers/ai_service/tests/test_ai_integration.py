import time
import httpx
import pytest

# Internal Docker URLs (or localhost if running locally)
AI_URL = "http://localhost:8002/ask"
SILO_URL = "http://localhost:8001/query"


def test_token_logging_integration():
    """Verify that asking the Owl creates a record in the Silo."""
    unique_service_name = "Integration_Test_Dog"

    # 1. Ask the AI Service a prompt
    prompt_payload = {
        "prompt": "Give me a 5-word sentence about a chinchilla.",
        "as_json": False,
        "requester_app": unique_service_name
    }
    ai_response = httpx.post(AI_URL, json=prompt_payload)
    assert ai_response.status_code == 200

    # Give the async background task a split second to hit the DB
    time.sleep(0.5)

    # 2. Query the Silo to see if the tokens were logged
    query_payload = {
        "action": "find",
        "table": "token_logs",
        "filters": {"service": unique_service_name}
    }
    silo_response = httpx.post(SILO_URL, json=query_payload)

    assert silo_response.status_code == 200
    data = silo_response.json()["data"]

    # 3. Assertions
    assert len(data) > 0, "No token logs found in the Silo for this service!"
    assert data[0]["service"] == unique_service_name
    assert data[0]["total_tokens"] > 0
    print(f"✅ Verified: {data[0]['total_tokens']} tokens logged in הממגורה.")