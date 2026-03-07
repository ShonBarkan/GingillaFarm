from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from typing import List, Optional

# Internal Imports
from .core.scheduler import scheduler, start_scheduler
from .core.tasks import (
    morning_report,
    clean_spoiled_logs,
    check_farm_heartbeat,
    run_blueprint_audit
)


# --- SCHEMAS ---

class ManualJobRequest(BaseModel):
    job_id: str
    seconds: int
    task_name: str = "generic_ping"


class JobResponse(BaseModel):
    job_id: str
    next_run: Optional[datetime]


# --- LIFESPAN (The Foreman's Routine) ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Actions to perform when the Foreman's Office opens."""
    start_scheduler()

    # 1. Schedule: The Morning Report (Every day at 08:00 AM)
    scheduler.add_job(
        morning_report,
        'cron',
        hour=8,
        minute=0,
        id="morning_report",
        replace_existing=True
    )

    # 2. Schedule: Log Cleanup (Every Sunday at 00:00 AM)
    scheduler.add_job(
        clean_spoiled_logs,
        'cron',
        day_of_week='sun',
        hour=0,
        minute=0,
        id="log_cleanup",
        replace_existing=True
    )

    # 3. Schedule: Farm Heartbeat (Every 15 minutes)
    scheduler.add_job(
        check_farm_heartbeat,
        'interval',
        minutes=15,
        id="heartbeat_patrol",
        replace_existing=True
    )

    # 4. Schedule: Structural Audit (Every 6 hours)
    scheduler.add_job(
        run_blueprint_audit,
        'interval',
        hours=6,
        id="blueprint_audit",
        replace_existing=True
    )

    yield
    # Actions to perform when the office closes
    scheduler.shutdown()


# --- APP INITIALIZATION ---

app = FastAPI(
    title="Gingilla Farm - The Foreman",
    description="Central Task & Scheduler Service",
    lifespan=lifespan
)


# --- ENDPOINTS ---

@app.get("/health")
def health_check():
    """Verify the Foreman is at his desk and the clock is ticking."""
    return {
        "status": "active",
        "scheduler_running": scheduler.running,
        "current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


@app.get("/jobs", response_model=List[JobResponse])
def list_scheduled_jobs():
    """See the Foreman's current clipboard of tasks."""
    jobs = scheduler.get_jobs()
    return [
        {"job_id": j.id, "next_run": j.next_run_time}
        for j in jobs
    ]


@app.post("/jobs/add")
async def add_one_off_task(request: ManualJobRequest):
    """
    Tell the Foreman to do a task after a specific delay.
    Useful for 'Remind me in 10 minutes' type logic.
    """
    run_time = datetime.now() + timedelta(seconds=request.seconds)

    # Mapping task_name to the actual function
    task_map = {
        "morning_report": morning_report,
        "clean_logs": clean_spoiled_logs,
        "audit": run_blueprint_audit
    }

    func_to_run = task_map.get(request.task_name)
    if not func_to_run:
        # Fallback to a simple print if task_name isn't recognized
        func_to_run = lambda: print(f"🔔 Manual alert for {request.job_id} triggered!")

    scheduler.add_job(
        func_to_run,
        trigger='date',
        run_date=run_time,
        id=request.job_id,
        replace_existing=True
    )

    return {
        "status": "success",
        "message": f"Task '{request.task_name}' scheduled for {run_time}"
    }


@app.delete("/jobs/{job_id}")
async def cancel_task(job_id: str):
    """Remove a task from the Foreman's clipboard."""
    try:
        scheduler.remove_job(job_id)
        return {"status": "success", "message": f"Job {job_id} cancelled."}
    except Exception:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")