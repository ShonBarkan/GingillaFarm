import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException

# --- Constants ---
SILO_URL = "http://db_manager:8000/query"
TOKEN_TABLE_NAME = "token_logs"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Actions to perform when the Owl wakes up."""
    await ensure_token_table_exists()
    yield
    # Actions to perform when the Owl goes to sleep (if any)


async def ensure_token_table_exists():
    """Checks if the Silo has a place for feathers, creates it if not."""
    async with httpx.AsyncClient() as client:
        # 1. Try to 'find' the table by doing a limit 0 select
        check_payload = {
            "action": "find",
            "table": TOKEN_TABLE_NAME,
            "filters": {"id": -1}  # Look for something that doesn't exist
        }

        try:
            response = await client.post(SILO_URL, json=check_payload)

            # If the Silo returns an error saying the table doesn't exist
            if response.status_code != 200:
                print(f"🐕 HealthDog Note: {TOKEN_TABLE_NAME} missing. Constructing...")

                create_payload = {
                    "action": "create_table",
                    "table": TOKEN_TABLE_NAME,
                    "columns": {
                        "service": "VARCHAR(50)",
                        "prompt_tokens": "INTEGER",
                        "completion_tokens": "INTEGER",
                        "total_tokens": "INTEGER",
                        "timestamp": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                    }
                }
                await client.post(SILO_URL, json=create_payload)
                print(f"✅ {TOKEN_TABLE_NAME} table created successfully.")
            else:
                print(f"✅ {TOKEN_TABLE_NAME} is already prepared in the Silo.")

        except Exception as e:
            print(f"⚠️ Warning: Could not connect to Silo to verify tables: {e}")


# Initialize FastAPI with the lifespan manager
app = FastAPI(title="Gingilla Farm - AI Service", lifespan=lifespan)