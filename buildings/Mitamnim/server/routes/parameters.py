from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from models.parameters import ParameterSchema, ParameterCreate, ParameterUpdate
from controllers import parameters as controller

router = APIRouter(prefix="/parameters", tags=["Parameters"])


# =================================================================
# ENDPOINTS
# =================================================================

@router.post("/", response_model=Dict[str, Any])
def create_parameters(data: List[ParameterCreate]):
    """
    Define one or more new parameters (metrics like Weight, Reps, etc.) in bulk.
    """
    return controller.create_parameters(data)


@router.get("/", response_model=List[ParameterSchema])
def get_parameters(
        scope: Optional[str] = Query(None, description="Filter by scope (e.g., 'exercise', 'workout')"),
        limit: Optional[int] = Query(None, description="Limit the number of parameters returned")
):
    """
    Retrieve parameter definitions with optional scope filtering.
    """
    filters = {}
    if scope: filters["scope"] = scope

    return controller.get_parameters(filters=filters, limit=limit)


@router.get("/{param_id}", response_model=ParameterSchema)
def get_parameter(param_id: int):
    """
    Retrieve a specific parameter definition by its ID.
    """
    return controller.get_parameter_by_id(param_id)


@router.patch("/{param_id}", response_model=Dict[str, Any])
def update_parameter(param_id: int, data: ParameterUpdate):
    """
    Update an existing parameter's name, unit, or scope.
    """
    return controller.update_parameter(param_id, data)


@router.delete("/", response_model=Dict[str, Any])
def delete_parameters(ids: List[int]):
    """
    Bulk delete parameter definitions.
    Note: This may fail if parameters are currently linked to active exercises.
    """
    return controller.delete_parameters(ids)