from fastapi import APIRouter, Query
from typing import Optional
from controllers import dashboard as controller
from models.dashboard import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    start: Optional[str] = Query(None, description="Start date for stats (YYYY-MM-DD)"),
    end: Optional[str] = Query(None, description="End date for stats (YYYY-MM-DD)")
):
    """
    Returns unified data for the main dashboard screen:
    1. Scheduled workouts for today.
    2. Specific featured statistics for chosen exercises.
    """
    return controller.get_dashboard_summary(start_date=start, end_date=end)