
import httpx
import os

class DBManagerClient:
    def __init__(self):
        self.base_url = os.getenv("DB_MANAGER_URL", "http://db-manager:8000")

    async def send_query(self, query: dict):
        async with httpx.AsyncClient() as client:
            try:
                # Forward query to the central Silo
                response = await client.post(f"{self.base_url}/query", json=query)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Silo Connection Error: {str(e)}")
                raise e

db_manager = DBManagerClient()
