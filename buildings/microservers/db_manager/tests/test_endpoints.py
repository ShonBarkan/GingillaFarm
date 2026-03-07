def test_update_user_role(client):
    """Test updating existing grain in the Silo."""
    # 1. Plant the seed
    client.post("/query", json={
        "action": "insert",
        "table": "users",
        "data": {"username": "worker_bee", "hashed_password": "xyz", "role": "guest"}
    })

    # 2. Update the role to 'admin'
    payload = {
        "action": "update",
        "table": "users",
        "data": {"role": "admin"},
        "filters": {"username": "worker_bee"}
    }
    response = client.post("/query", json=payload)

    assert response.status_code == 200
    assert response.json()["data"][0]["role"] == "admin"
    assert response.json()["count"] == 1


def test_delete_specific_user(client):
    """Test removing specific grain from the Silo."""
    # 1. Plant the seed
    client.post("/query", json={
        "action": "insert",
        "table": "users",
        "data": {"username": "temporary_chinchilla", "hashed_password": "123"}
    })

    # 2. Delete it
    payload = {
        "action": "delete",
        "table": "users",
        "filters": {"username": "temporary_chinchilla"}
    }
    response = client.post("/query", json=payload)

    assert response.status_code == 200
    assert response.json()["count"] == 1

    # 3. Verify it's gone
    find_res = client.post("/query", json={
        "action": "find", "table": "users", "filters": {"username": "temporary_chinchilla"}
    })
    assert find_res.json()["count"] == 0


def test_security_prevent_unfiltered_delete(client):
    """Ensure the Silo refuses to delete everything at once."""
    payload = {
        "action": "delete",
        "table": "users",
        "filters": {}  # Empty filters should be blocked
    }
    response = client.post("/query", json=payload)
    # Our translator logic or route should catch this
    assert response.status_code == 400
    assert "Delete requires 'filters'" in response.json()["detail"]


def test_unsupported_action(client):
    """Test how the Silo handles unknown commands."""
    payload = {
        "action": "burn_the_farm",
        "table": "users"
    }
    response = client.post("/query", json=payload)
    assert response.status_code == 400
    assert "not supported" in response.json()["detail"].lower()


def test_insert_missing_data(client):
    """Test error handling when data is missing for an insert."""
    payload = {
        "action": "insert",
        "table": "users",
        "data": {}
    }
    response = client.post("/query", json=payload)
    assert response.status_code == 400
    assert "requires 'data'" in response.json()["detail"]