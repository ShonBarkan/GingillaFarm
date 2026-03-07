from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class AIRequest(BaseModel):
    prompt: str = Field(..., description="The question or instruction for the Owl.")
    as_json: bool = Field(False, description="Whether to return a structured JSON object.")
    response_schema: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional JSON schema to guide the Gemini output structure."
    )
    requester_app: str = Field("Unknown_Building", description="The name of the service asking.")