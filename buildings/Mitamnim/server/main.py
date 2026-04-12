import requests
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Importing new modular routes
from routes import (
    parameters,
    active_params,
    exercise_tree,
    workout_templates,
    workout_sessions,
    activity_logs,
    exercise_assets,
    goals,
    stats,
    activity_log_history,
    dashboard
)

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    print("🚀 Initializing Mitamnim Database...")
    init_db_tables()
    yield
    # --- Shutdown ---
    print("🛑 Shutting down Mitamnim Server...")

app = FastAPI(
    title="Mitamnim API",
    lifespan=lifespan
)

# --- Configuration ---
DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB Initialization ---

def init_db_tables():
    """
    Initializes the database schema via DB Manager.
    Uses the sequential order to respect Foreign Key constraints.
    """
    tables = {
        "parameters": {
            "id": "SERIAL PRIMARY KEY",
            "name": "TEXT NOT NULL",
            "unit": "TEXT NOT NULL",
            "scope": "TEXT DEFAULT 'exercise'"  # Added scope
        },
        "exercise_tree": {
            "id": "SERIAL PRIMARY KEY",
            "name": "TEXT NOT NULL",
            "parent_id": "INTEGER REFERENCES exercise_tree(id) ON DELETE CASCADE"
        },
        "workout_templates": {
            "id": "SERIAL PRIMARY KEY",
            "name": "TEXT NOT NULL",
            "description": "TEXT",
            "parent_exercise_id": "INTEGER REFERENCES exercise_tree(id) ON DELETE SET NULL",
            "exercises_config": "JSONB NOT NULL",
            "expected_time": "TEXT",
            "scheduled_days": "JSONB",  # [0,1,2,3,4,5,6]
            "cron_expression": "TEXT",   # For advanced scheduling
            "interval_seconds": "INTEGER",
            "created_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        },
        "workout_sessions": {
            "id": "SERIAL PRIMARY KEY",
            "template_id": "INTEGER REFERENCES workout_templates(id) ON DELETE SET NULL",
            "start_time": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "end_time": "TIMESTAMP",
            "status": "TEXT DEFAULT 'in_progress'", # Added status tracking
            "summary_data": "JSONB",
            "notes": "TEXT"
        },
        "active_params": {
            "id": "SERIAL PRIMARY KEY",
            "parameter_id": "INTEGER REFERENCES parameters(id) ON DELETE CASCADE",
            "exercise_id": "INTEGER REFERENCES exercise_tree(id) ON DELETE CASCADE",
            "template_id": "INTEGER REFERENCES workout_templates(id) ON DELETE CASCADE",
            "session_id": "INTEGER REFERENCES workout_sessions(id) ON DELETE CASCADE",
            "priority_index": "INTEGER DEFAULT 0",
            "default_value": "TEXT"
        },
        "activity_logs": {
            "id": "SERIAL PRIMARY KEY",
            "exercise_id": "INTEGER REFERENCES exercise_tree(id) ON DELETE CASCADE",
            "workout_session_id": "INTEGER REFERENCES workout_sessions(id) ON DELETE CASCADE",
            "timestamp": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "performance_data": "JSONB NOT NULL",
            "is_manual": "BOOLEAN DEFAULT TRUE"
        },
        "exercise_assets": {
            "id": "SERIAL PRIMARY KEY",
            "exercise_id": "INTEGER REFERENCES exercise_tree(id) ON DELETE CASCADE",
            "asset_type": "TEXT NOT NULL",
            "url": "TEXT NOT NULL",
            "title": "TEXT",
            "tags": "JSONB"
        },
        "goals": {
            "id": "SERIAL PRIMARY KEY",
            "exercise_id": "INTEGER REFERENCES exercise_tree(id) ON DELETE CASCADE",
            "goal_type": "TEXT NOT NULL",
            "target_value": "FLOAT NOT NULL",
            "is_completed": "BOOLEAN DEFAULT FALSE"
        }
    }

    for table_name, columns in tables.items():
        payload = {
            "action": "create_table",
            "table": table_name,
            "columns": columns
        }
        try:
            response = requests.post(f"{DB_MANAGER_URL}/query", json=payload, timeout=5)
            if response.status_code != 200:
                print(f"⚠️ Table {table_name} already exists or failed: {response.text}")
        except Exception as e:
            print(f"❌ Error connecting to DB Manager for {table_name}: {e}")

# --- Route Registration ---
app.include_router(parameters.router)
app.include_router(active_params.router)
app.include_router(exercise_tree.router)
app.include_router(workout_templates.router)
app.include_router(workout_sessions.router)
app.include_router(activity_logs.router)
app.include_router(exercise_assets.router)
app.include_router(goals.router)
app.include_router(stats.router)
app.include_router(activity_log_history.router)
app.include_router(dashboard.router)

# --- Health Check ---
@app.get("/health")
async def health():
    return {"status": "ok", "service": "mitamnim-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)