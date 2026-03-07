from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.memory import MemoryJobStore

# We use MemoryJobStore for now, but we can move to the Silo (Postgres) later
jobstores = {
    'default': MemoryJobStore()
}

scheduler = AsyncIOScheduler(jobstores=jobstores)

def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        print("🐕 The Foreman has started his rounds.")