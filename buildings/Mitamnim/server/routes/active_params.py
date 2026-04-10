from fastapi import APIRouter, Query, HTTPException, Body
from typing import List, Optional, Dict, Any
from models.active_params import ActiveParameterSchema, ActiveParameterCreate, ActiveParameterUpdate
from controllers import active_params as controller

router = APIRouter(prefix="/active-params", tags=["Active Parameters"])


# =================================================================
# CREATE OPERATIONS
# =================================================================

@router.post("/", response_model=Dict[str, Any])
def create_active_params(data: List[ActiveParameterCreate]):
    """
    Endpoint to link parameters to exercises, templates, or sessions in bulk.
    """
    return controller.create_active_params(data)


# =================================================================
# READ OPERATIONS
# =================================================================

@router.get("/", response_model=List[ActiveParameterSchema])
def get_active_params(
        exercise_id: Optional[int] = None,
        template_id: Optional[int] = None,
        session_id: Optional[int] = None,
        limit: Optional[int] = Query(None, description="Limit the number of results")
):
    """
    Retrieve active parameter links with optional filtering.
    Each item is enriched with 'name' and 'unit' from the parameters table.
    """
    filters = {}
    if exercise_id is not None: filters["exercise_id"] = exercise_id
    if template_id is not None: filters["template_id"] = template_id
    if session_id is not None: filters["session_id"] = session_id

    return controller.get_active_params(filters=filters, limit=limit)


@router.get("/{param_id}", response_model=ActiveParameterSchema)
def get_active_param(param_id: int):
    """
    Retrieve a specific parameter link by ID.
    Enriched with parameter metadata.
    """
    return controller.get_active_param_by_id(param_id)


# =================================================================
# UPDATE & SYNC OPERATIONS
# =================================================================

@router.patch("/{param_id}", response_model=Dict[str, Any])
def update_active_param(param_id: int, data: ActiveParameterUpdate):
    """
    Update priority or default value of an existing link.
    """
    return controller.update_active_param(param_id, data)


@router.post("/sync/{exercise_id}", response_model=Dict[str, Any])
async def sync_params(
    exercise_id: int,
    params_data: List[Dict[str, Any]] = Body(
        ...,
        example=[{"parameter_id": 1, "priority_index": 0}],
        description="A list of parameters to associate with the exercise. Replaces existing ones."
    )
):
    """
    Syncs the parameters for a specific exercise.
    This replaces all existing parameters for the exercise with the new list.
    Returns the newly created records with names and units.
    """
    return controller.sync_exercise_params(exercise_id, params_data)


# =================================================================
# DELETE OPERATIONS
# =================================================================

@router.delete("/", response_model=Dict[str, Any])
def delete_active_params(ids: List[int]):
    """
    Bulk delete parameter links by a list of IDs.
    """
    return controller.delete_active_params(ids)