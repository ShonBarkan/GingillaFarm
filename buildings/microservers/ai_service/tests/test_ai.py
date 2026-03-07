def test_owl_text_response(client):
    """Test standard string response."""
    payload = {
        "prompt": "Say 'Gingilla' once.",
        "as_json": False,
        "requester_app": "Test_Building"
    }
    response = client.post("/ask", json=payload)
    assert response.status_code == 200
    assert "Gingilla" in response.json()["answer"]

def test_owl_json_response(client):
    """Test structured JSON response with a schema."""
    payload = {
        "prompt": "List 2 farm animals.",
        "as_json": True,
        "response_schema": {
            "type": "object",
            "properties": {
                "animals": {"type": "array", "items": {"type": "string"}}
            }
        },
        "requester_app": "Test_Building"
    }
    response = client.post("/ask", json=payload)
    assert response.status_code == 200
    assert isinstance(response.json()["answer"]["animals"], list)