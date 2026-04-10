from pydantic import BaseModel
from typing import List, Optional

# =================================================================
# BASE SCHEMA
# =================================================================

class ExerciseAssetBase(BaseModel):
    exercise_id: int
    asset_type: str
    url: str
    title: Optional[str] = None
    tags: List[str] = []

# =================================================================
# CREATE SCHEMA (POST)
# =================================================================

class ExerciseAssetCreate(ExerciseAssetBase):
    """Used for adding a new asset to an exercise. ID is auto-generated."""
    pass

# =================================================================
# UPDATE SCHEMA (PUT / PATCH)
# =================================================================

class ExerciseAssetUpdate(BaseModel):
    """Used for updating asset details. All fields are optional."""
    exercise_id: Optional[int] = None
    asset_type: Optional[str] = None
    url: Optional[str] = None
    title: Optional[str] = None
    tags: Optional[List[str]] = None

# =================================================================
# RESPONSE SCHEMA (GET)
# =================================================================

class ExerciseAssetSchema(ExerciseAssetBase):
    """Full database representation of an exercise asset."""
    id: int

    class Config:
        from_attributes = True