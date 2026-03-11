from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.api import router as api_router
import os

app = FastAPI(title="Gingilla Farm - CarrotTracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "online", "building": "CarrotTracker"}
