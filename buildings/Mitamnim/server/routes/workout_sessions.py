import json
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
# ייבוא המודלים
from models.workout_sessions import WorkoutSessionSchema, WorkoutSessionCreate, WorkoutSessionUpdate
from controllers import workout_sessions as controller

router = APIRouter(prefix="/workout-sessions", tags=["Workout Sessions"])


# פונקציית עזר לתיקון הנתונים שחוזרים מה-Silo
def _parse_session_data(session: Dict[str, Any]) -> Dict[str, Any]:
    """הופכת שדות JSON String חזרה לאובייקטים עבור ה-Schema"""
    if not session:
        return session

    # טיפול ב-summary_data
    if isinstance(session.get("summary_data"), str):
        try:
            session["summary_data"] = json.loads(session["summary_data"])
        except:
            session["summary_data"] = {}

    return session


# =================================================================
# ENDPOINTS
# =================================================================

@router.post("/", response_model=Dict[str, Any])
def create_workout_sessions(data: List[WorkoutSessionCreate]):
    # הקונטרולר כבר מטפל בהמרה ל-JSON לפני ה-Insert
    return controller.create_workout_sessions(data)


@router.get("/", response_model=List[WorkoutSessionSchema])
def get_workout_sessions(
        template_id: Optional[int] = Query(None, description="Filter by workout template ID"),
        status: Optional[str] = Query(None, description="Filter by status"),
        limit: Optional[int] = Query(None, description="Limit the number of sessions returned")
):
    filters = {}
    if template_id: filters["template_id"] = template_id
    if status: filters["status"] = status

    raw_sessions = controller.get_workout_sessions(filters=filters, limit=limit)

    # המרת שדות טקסט חזרה לאובייקטים לכל הרשימה
    return [_parse_session_data(s) for s in raw_sessions]


@router.get("/{session_id}", response_model=WorkoutSessionSchema)
def get_workout_session(session_id: int):
    session = controller.get_workout_session_by_id(session_id)
    return _parse_session_data(session)


@router.patch("/{session_id}", response_model=Dict[str, Any])
def update_workout_session(session_id: int, data: WorkoutSessionUpdate):
    # הקונטרולר מטפל בהמרת ה-PATCH ל-JSON
    return controller.update_workout_session(session_id, data)


@router.delete("/", response_model=Dict[str, Any])
def delete_workout_sessions(ids: List[int]):
    return controller.delete_workout_sessions(ids)