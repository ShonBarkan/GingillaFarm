from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .active_params import ActiveParameterCreate, ActiveParameterSchema


# =================================================================
# BASE SCHEMA
# =================================================================

class WorkoutSessionBase(BaseModel):
    template_id: Optional[int] = None
    start_time: str
    end_time: Optional[str] = None
    status: str = "active"
    notes: Optional[str] = None


# =================================================================
# CREATE SCHEMA (POST)
# =================================================================

class WorkoutSessionCreate(WorkoutSessionBase):
    summary_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    session_required_params: Optional[List[ActiveParameterCreate]] = []


# =================================================================
# UPDATE SCHEMA (PUT / PATCH)
# =================================================================

class WorkoutSessionUpdate(BaseModel):
    template_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    status: Optional[str] = None
    summary_data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

    # New field: allows sending activity logs inside the session update
    activity_logs: Optional[List[Dict[str, Any]]] = None


# =================================================================
# RESPONSE SCHEMA (GET)
# =================================================================

class WorkoutSessionSchema(WorkoutSessionBase):
    id: int
    summary_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    session_required_params: Optional[List[ActiveParameterSchema]] = None

    class Config:
        from_attributes = True