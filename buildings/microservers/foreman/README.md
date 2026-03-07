# 📋 The Foreman's Office (Task & Scheduler)

### 📜 Farm Lore
Every morning before the sun rises, the Foreman walks the fence line. He doesn't store grain or hunt for wisdom himself; he tells the Silo when to clean its floors and tells the Owl when it's time to report to the Farmer. Without the Foreman, the farm would stand still, waiting for an order that never comes.

---

### 🛠 Technical Specification
**Engine:** APScheduler (Advanced Python Scheduler)
**Job Types:**
* **Interval:** Do a task every X minutes (e.g., checking container health).
* **Cron:** Do a task at a specific time (e.g., 08:00 AM daily report).
* **One-off:** Delayed tasks triggered by other services.