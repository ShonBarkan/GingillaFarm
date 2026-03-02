# 🐕 LogDog 🐕

![LogDog Character](../assets/watchdogs/logDog.png)

**LogDog** is the two-headed guardian of the **ServerFarm**. It is designed to track, analyze, and document every event occurring across the different "floors" of our digital skyscraper. 

The character of LogDog represents the perfect synergy between data analysis and execution:
* **The Left Head (Python):** Wearing a **red-eyed** gaze and glasses, he is the "Analyst." He constantly monitors incoming data streams, sniffing out patterns and scanning for anomalies.
* **The Right Head (JavaScript):** With bright **green eyes**, he is the "Writer." He handles high-speed execution, ensuring every event is perfectly documented and communicated to the system.

---

## 🛠️ System Overview

The LogDog system provides a unified logging solution for both Python and Node.js environments. It ensures that logs from different languages follow an identical DNA structure, making it easy to debug the entire stack without worrying about formatting inconsistencies.

### Key Features:
* **Unified Formatting:** Strict visual alignment in both the terminal and log files for easy scanning.
* **Daily Rotation:** Automatically creates a new log file every day (`logs-YYYY-MM-DD.log`).
* **Multi-Language Sync:** Synchronized log levels (e.g., both use `WARNING` instead of `warn`).
* **Environment Aware:** Dynamically sources the root directory from a central `.env` file.

---

## 📁 File Structure

### 🐍 Python (`logDog.py`)
Utilizes a custom `logging.Formatter` to produce a color-coded, structured grid.
- **Usage:** Import `setup_log_dog` and initialize with the project name.
- **Dependencies:** `python-dotenv`.

### 📜 JavaScript (`logDog.js`)
Powered by `Winston` with a daily-rotate-file transport for production-grade stability.
- **Usage:** Import the module and call `setupLogDog`.
- **Dependencies:** `winston`, `winston-daily-rotate-file`, `dotenv`.

---

## 🚀 Getting Started

1. Ensure a `.env` file exists in the script directory with the following variable:
   ```env
   FARM_ROOT_PATH=C:\Your\Path\To\ServerFarm