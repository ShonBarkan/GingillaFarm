from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from models.exercise_assets import ExerciseAssetSchema, ExerciseAssetCreate, ExerciseAssetUpdate
from controllers import exercise_assets as controller

router = APIRouter(prefix="/exercise-assets", tags=["Exercise Assets"])


# =================================================================
# ENDPOINTS
# =================================================================

@router.post("/", response_model=Dict[str, Any])
def create_exercise_assets(data: List[ExerciseAssetCreate]):
    """
    Register new media assets (URLs, descriptions) for exercises in bulk.
    """
    return controller.create_exercise_assets(data)


@router.get("/", response_model=List[ExerciseAssetSchema])
def get_exercise_assets(
        exercise_id: Optional[int] = None,
        asset_type: Optional[str] = None,
        limit: Optional[int] = Query(None, description="Limit the number of results (default is all)")
):
    """
    Retrieve assets with optional filtering by exercise or type.
    """
    filters = {}
    if exercise_id: filters["exercise_id"] = exercise_id
    if asset_type: filters["asset_type"] = asset_type

    return controller.get_exercise_assets(filters=filters, limit=limit)


@router.get("/{asset_id}", response_model=ExerciseAssetSchema)
def get_exercise_asset(asset_id: int):
    """
    Retrieve details of a specific exercise asset by ID.
    """
    return controller.get_exercise_asset_by_id(asset_id)


@router.patch("/{asset_id}", response_model=Dict[str, Any])
def update_exercise_asset(asset_id: int, data: ExerciseAssetUpdate):
    """
    Update the URL, type, or tags of an existing asset.
    """
    return controller.update_exercise_asset(asset_id, data)


@router.delete("/", response_model=Dict[str, Any])
def delete_exercise_assets(ids: List[int]):
    """
    Bulk delete exercise assets.
    """
    return controller.delete_exercise_assets(ids)