from fastapi import APIRouter, HTTPException
from ..models.schemas import *
from ..utils.db_client import db_manager

router = APIRouter()

@router.get("/carrots")
async def get_carrots(limit: int = 50, offset: int = 0):
    query = {
        "action": "find",
        "table": "carrots",
        "filters": {},
        "limit": limit,
        "offset": offset
    }
    return await db_manager.send_query(query)

@router.post("/carrots")
async def create_carrots(data: Carrots):
    query = {
        "action": "insert",
        "table": "carrots",
        "data": data.dict()
    }
    return await db_manager.send_query(query)

@router.delete("/carrots/{item_id}")
async def delete_carrots(item_id: int):
    query = {
        "action": "delete",
        "table": "carrots",
        "filters": {"id": item_id}
    }
    return await db_manager.send_query(query)

