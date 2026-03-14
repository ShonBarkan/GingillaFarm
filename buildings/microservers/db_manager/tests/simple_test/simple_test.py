import requests
import json

BASE_URL = "http://shon-comp:8000"

def print_response(title, response):
    print(f"--- {title} ---")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    print("\n")

def run_farm_checks():
    # 1. Health Check (Integrity Check)
    print("Checking Silo integrity...")
    health = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", health)

    # 2. Create Table (Building a new storage bin)
    # The Silo expects a dictionary for columns, not a string.
    create_data = {
        "action": "create_table",
        "table": "crops",
        "columns": {
            "id": "SERIAL PRIMARY KEY",
            "name": "TEXT",
            "quantity": "INTEGER"
        }
    }
    create_res = requests.post(f"{BASE_URL}/query", json=create_data)
    print_response("Create Table", create_res)

    # 3. Insert Data (Filling the Silo)
    insert_data = {
        "action": "insert",
        "table": "crops",
        "data": {"name": "Carrot", "quantity": 50}
    }
    insert_res = requests.post(f"{BASE_URL}/query", json=insert_data)
    print_response("Insert Data", insert_res)

    # 4. Find Data (Searching the Silo)
    find_data = {
        "action": "find",
        "table": "crops",
        "filters": {"name": "Carrot"}
    }
    find_res = requests.post(f"{BASE_URL}/query", json=find_data)
    print_response("Find Data", find_res)

    # 5. Raw Admin Query (Direct Silo Access)
    # Using the /raw endpoint with a query string parameter
    raw_query = "SELECT * FROM crops;"
    raw_res = requests.post(f"{BASE_URL}/raw", params={"query": raw_query})
    print_response("Raw Admin Query", raw_res)

if __name__ == "__main__":
    try:
        run_farm_checks()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the Silo. Is the Docker container running?")