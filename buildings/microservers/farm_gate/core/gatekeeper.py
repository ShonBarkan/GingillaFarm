import httpx
from fastapi import Request, Response, HTTPException
from .config import GateConfig


class Gatekeeper:
    def __init__(self):
        self.services = GateConfig.SERVICES
        self.status = GateConfig.INITIAL_STATUS.copy()

    def is_open(self, service: str) -> bool:
        """Check if the portcullis is raised for this building."""
        return self.status.get(service, False)

    def toggle_gate(self, service: str) -> str:
        """Flip the Kill Switch for a service."""
        if service in self.status:
            self.status[service] = not self.status[service]
            return "OPEN" if self.status[service] else "CLOSED"
        raise ValueError("Building not found.")

    async def proxy(self, service: str, path: str, request: Request):
        """The heavy lifting: Forwarding the traveler to the right building."""
        if service not in self.services:
            raise HTTPException(status_code=404, detail="That building doesn't exist.")

        if not self.is_open(service):
            raise HTTPException(status_code=503, detail=f"The {service} building is closed for repairs.")

        target_url = f"{self.services[service]}/{path}"

        async with httpx.AsyncClient() as client:
            try:
                # Forward everything: Method, Body, Headers, Params
                proxy_res = await client.request(
                    method=request.method,
                    url=target_url,
                    headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
                    params=request.query_params,
                    content=await request.body(),
                    timeout=30.0  # AI Owl can be slow sometimes
                )

                return Response(
                    content=proxy_res.content,
                    status_code=proxy_res.status_code,
                    headers=dict(proxy_res.headers)
                )
            except httpx.RequestError as e:
                raise HTTPException(status_code=502, detail=f"Building unreachable: {str(e)}")