from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from models.exercise_tree import ExerciseTreeNodeSchema, ExerciseTreeNodeCreate, ExerciseTreeNodeUpdate
from controllers import exercise_tree as controller

router = APIRouter(prefix="/exercise-tree", tags=["Exercise Tree"])


# =================================================================
# ENDPOINTS
# =================================================================

@router.post("/", response_model=Dict[str, Any])
def create_exercise_nodes(data: List[ExerciseTreeNodeCreate]):
    """
    Create one or more nodes in the exercise hierarchy.
    """
    return controller.create_exercise_nodes(data)


@router.get("/", response_model=List[ExerciseTreeNodeSchema])
def get_exercise_tree(
        parent_id: Optional[int] = Query(None, description="Filter by parent node ID"),
        limit: Optional[int] = Query(None, description="Limit the number of nodes returned")
):
    """
    Fetch exercise nodes. Filter by parent_id to get specific branches.
    """
    filters = {}
    if parent_id is not None:
        filters["parent_id"] = parent_id

    return controller.get_exercise_tree(filters=filters, limit=limit)


@router.get("/{node_id}", response_model=Dict[str, Any])
def get_exercise_node(node_id: int):
    """
    Fetch a single exercise node by its ID with enriched parameters.
    """
    return controller.get_exercise_node_by_id(node_id)


@router.patch("/{node_id}", response_model=Dict[str, Any])
def update_exercise_node(node_id: int, data: ExerciseTreeNodeUpdate):
    """
    Update a node's name or move it to a different parent.
    """
    return controller.update_exercise_node(node_id, data)


@router.delete("/", response_model=Dict[str, Any])
def delete_exercise_nodes(ids: List[int]):
    """
    Bulk delete nodes from the tree.
    """
    return controller.delete_exercise_nodes(ids)