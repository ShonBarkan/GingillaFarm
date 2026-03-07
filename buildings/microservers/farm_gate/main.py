from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .core.gatekeeper import Gatekeeper
from .core.config import GateConfig

app = FastAPI(title="Gingilla Farm - The Great Gate")
gate = Gatekeeper()

# Centralized CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=GateConfig.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def route_traffic(service: str, path: str, request: Request):
    """The main gate for all farm traffic."""
    return await gate.proxy(service, path, request)

@app.post("/admin/gate/{service}/toggle")
async def admin_toggle(service: str):
    """Admin command to drop or raise the portcullis."""
    try:
        new_status = gate.toggle_gate(service)
        return {"message": f"The gate for {service} is now {new_status}."}
    except ValueError as e:
        return {"error": str(e)}

@app.get("/health")
def health():
    return {"status": "The Gate is standing.", "building_states": gate.status}