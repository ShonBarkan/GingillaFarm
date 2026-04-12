from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from models.workout_templates import WorkoutTemplateSchema, WorkoutTemplateCreate, WorkoutTemplateUpdate
from controllers import workout_templates as controller

router = APIRouter(prefix="/workout-templates", tags=["Workout Templates"])


# =================================================================
# ENDPOINTS
# =================================================================

@router.post("/", response_model=Dict[str, Any])
def create_workout_templates(data: List[WorkoutTemplateCreate]):
    """
    Create one or more workout templates (plans) in bulk.
    """
    return controller.create_workout_templates(data)


@router.get("/", response_model=List[WorkoutTemplateSchema])
def get_workout_templates(
        parent_exercise_id: Optional[List[int]] = Query(
            None,
            description="Filter by specific exercise IDs"
        ),
        recursive_id: Optional[int] = Query(
            None,
            description="Find templates for this ID and all its descendants"
        ),
        limit: Optional[int] = Query(None, description="Limit results")
):
    """
    Retrieve workout templates.
    Use 'recursive_id' to get templates for an exercise and its entire sub-tree.
    """
    if recursive_id:
        return controller.get_workout_templates(recursive_exercise_id=recursive_id, limit=limit)

    filters = {}
    if parent_exercise_id:
        filters["parent_exercise_id"] = parent_exercise_id

    return controller.get_workout_templates(filters=filters, limit=limit)

@router.get("/{template_id}", response_model=WorkoutTemplateSchema)
def get_workout_template(template_id: int):
    """
    Retrieve a specific workout template by its ID.
    """
    return controller.get_workout_template_by_id(template_id)


@router.patch("/{template_id}", response_model=Dict[str, Any])
def update_workout_template(template_id: int, data: WorkoutTemplateUpdate):
    """
    Update a template's name, scheduling (cron/interval), or metadata.
    """
    return controller.update_workout_template(template_id, data)


@router.delete("/", response_model=Dict[str, Any])
def delete_workout_templates(ids: List[int]):
    """
    Bulk delete workout templates.
    """
    return controller.delete_workout_templates(ids)