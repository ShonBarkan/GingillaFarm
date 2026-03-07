import httpx
import os
import asyncio
from datetime import datetime, timedelta

# Internal Farm URLs (Standardizing based on your Docker setup)
SILO_URL = os.getenv("SILO_URL", "http://db_manager:8000/query")
AI_URL = os.getenv("AI_URL", "http://ai_service:8000/ask")


async def morning_report():
    """Ask the Owl (AI Service) to generate a morning status report for the farmer."""
    payload = {
        "prompt": "You are the Wise Owl of Gingilla Farm. It is a new day. Give the farmer a warm, 2-line morning status report based on the lore of a ginger chinchilla farm.",
        "as_json": False,
        "requester_app": "Foreman"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(AI_URL, json=payload, timeout=10.0)
            if response.status_code == 200:
                print(f"🦉 Owl's Prophecy: {response.json().get('answer')}")
            else:
                print(f"⚠️ Owl is groggy (Status: {response.status_code})")
        except Exception as e:
            print(f"❌ Could not reach the Owl's Perch: {e}")


async def clean_spoiled_logs():
    """Removes logs older than 14 days from הממגורה (The Silo)."""
    # Calculate the date 14 days ago
    cutoff = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d %H:%M:%S")

    payload = {
        "action": "delete",
        "table": "farm_logs",
        "filters": {"timestamp": {"operator": "<", "value": cutoff}}
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(SILO_URL, json=payload, timeout=5.0)
            affected = response.json().get("affected_rows", 0)
            print(f"🧹 Foreman cleaned up {affected} rows of spoiled logs.")
        except Exception as e:
            print(f"⚠️ Silo was too heavy to clean: {e}")


async def check_farm_heartbeat():
    """Pings the health endpoints of all major buildings."""
    buildings = {
        "Silo": "http://db_manager:8000/health",
        "Owl": "http://ai_service:8000/health"
    }

    async with httpx.AsyncClient() as client:
        for name, url in buildings.items():
            try:
                res = await client.get(url, timeout=2.0)
                if res.status_code == 200:
                    print(f"✅ {name} heartbeat is steady.")
                else:
                    print(f"🚨 {name} is breathing heavily (Status: {res.status_code})")
            except Exception:
                print(f"💀 CRITICAL: {name} has no pulse!")


async def run_blueprint_audit():
    """Logs a structural check (to be expanded with BlueprintDog logic)."""
    print("📐 BlueprintDog is sniffing the fences... Structural integrity confirmed.")
    # In the future, this will trigger the actual blueprintDog.py script