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
            description="Filter templates by one or more parent exercise IDs (e.g. ?parent_exercise_id=1&parent_exercise_id=2)"
        ),
        limit: Optional[int] = Query(None, description="Limit the number of templates returned")
):
    """
    Retrieve workout templates. Supports single or multiple parent exercise IDs.
    """
    filters = {}
    if parent_exercise_id:
        # הקונטרולר המעודכן יודע לזהות אם זו רשימה ולהשתמש ב-action: in
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