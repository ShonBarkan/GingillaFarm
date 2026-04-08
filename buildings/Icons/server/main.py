import requests
import json
import uvicorn
import random
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI(title="Gingilla Farm - Icon Building")

# --- Configuration ---
DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://shon-comp:8000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Schemas ---
class IconMetadata(BaseModel):
    subject: str
    sub_subject: str
    name: str


class BulkIconItem(IconMetadata):
    svg_content: str  # The actual SVG XML string


class BulkUploadRequest(BaseModel):
    icons: List[BulkIconItem]


class SingleIconRequest(IconMetadata):
    svg_content: str


# --- DB Initialization ---
def init_db_tables():
    """Triggers table creation in the DB Manager with svg_content column."""
    table_definition = {
        "icons": {
            "id": "SERIAL PRIMARY KEY",
            "subject": "TEXT NOT NULL",
            "sub_subject": "TEXT NOT NULL",
            "name": "TEXT UNIQUE NOT NULL",
            "svg_content": "TEXT NOT NULL"
        }
    }
    print("Initializing Icon Tables via DB Manager...")
    for table_name, columns in table_definition.items():
        payload = {"action": "create_table", "table": table_name, "columns": columns}
        try:
            requests.post(f"{DB_MANAGER_URL}/query", json=payload, timeout=5)
        except Exception:
            print(f"Warning: Could not connect to DB Manager at {DB_MANAGER_URL}")


@app.on_event("startup")
async def startup_event():
    init_db_tables()


# --- API Endpoints ---

@app.get("/subjects")
async def get_unique_subjects():
    payload = {"action": "find", "table": "icons", "filters": {}}
    try:
        res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        icons = res.json().get("data", [])
        subjects = sorted(list(set(icon['subject'] for icon in icons)))
        return subjects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/icons")
async def get_icons(subject: Optional[str] = None, sub_subject: Optional[str] = None):
    filters = {}
    if subject: filters["subject"] = subject
    if sub_subject: filters["sub_subject"] = sub_subject

    payload = {"action": "find", "table": "icons", "filters": filters}
    res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    return res.json()


@app.get("/icons/random")
async def get_random_icons(limit: int = 20):
    payload = {"action": "find", "table": "icons", "filters": {}}
    res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    icons = res.json().get("data", [])
    random.shuffle(icons)
    return icons[:limit]


@app.post("/icons", status_code=201)
async def create_single_icon(payload: SingleIconRequest):
    """Saves a single icon passed as a raw SVG string."""
    db_payload = {
        "action": "insert",
        "table": "icons",
        "data": {
            "subject": payload.subject,
            "sub_subject": payload.sub_subject,
            "name": payload.name,
            "svg_content": payload.svg_content
        }
    }
    try:
        res = requests.post(f"{DB_MANAGER_URL}/query", json=db_payload)
        return res.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/icons/bulk")
async def bulk_upload_icons(payload: BulkUploadRequest):
    results = []
    for item in payload.icons:
        try:
            db_payload = {
                "action": "insert",
                "table": "icons",
                "data": {
                    "subject": item.subject,
                    "sub_subject": item.sub_subject,
                    "name": item.name,
                    "svg_content": item.svg_content
                }
            }
            requests.post(f"{DB_MANAGER_URL}/query", json=db_payload)
            results.append({"name": item.name, "status": "success"})
        except Exception as e:
            results.append({"name": item.name, "status": "failed", "error": str(e)})

    return {"processed": len(payload.icons), "results": results}


@app.put("/icons/{icon_id}")
async def update_icon(icon_id: int, icon_data: SingleIconRequest): # שינוי כאן ל-SingleIconRequest
    payload = {
        "action": "update",
        "table": "icons",
        "data": icon_data.dict(),
        "filters": {"id": icon_id}
    }
    return requests.post(f"{DB_MANAGER_URL}/query", json=payload).json()


@app.delete("/icons/{icon_id}")
async def delete_icon(icon_id: int):
    # Just delete from DB - no disk files to worry about anymore
    payload = {
        "action": "delete",
        "table": "icons",
        "filters": {"id": icon_id}
    }
    return requests.post(f"{DB_MANAGER_URL}/query", json=payload).json()


@app.delete("/icons/bulk/delete")
async def bulk_delete_icons(
        subject: Optional[str] = Query(None),
        sub_subject: Optional[str] = Query(None)
):
    if not subject and not sub_subject:
        raise HTTPException(status_code=400, detail="חייב לספק לפחות פרמטר אחד למחיקה המונית")

    filters = {}
    if subject: filters["subject"] = subject
    if sub_subject: filters["sub_subject"] = sub_subject

    payload = {
        "action": "delete",
        "table": "icons",
        "filters": filters
    }

    try:
        res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        return res.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/icons/name/{icon_name}")
async def get_icon_by_name(icon_name: str):
    payload = {
        "action": "find",
        "table": "icons",
        "filters": {"name": icon_name}
    }

    try:
        res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        data = res.json().get("data", [])

        if not data:
            raise HTTPException(status_code=404, detail=f"Icon with name '{icon_name}' not found")

        return data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
