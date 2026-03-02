import os
import logging
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime
from dotenv import load_dotenv

# --- PATH INITIALIZATION ---
load_dotenv()
FARM_ROOT = os.getenv("FARM_ROOT_PATH")
LOG_DIR = os.path.join(FARM_ROOT, "farm_logs")


class LogDogFormatter(logging.Formatter):
    STATUS_WIDTH = 11
    PROJECT_LIMIT = 11
    CONTEXT_LIMIT = 11
    SUMMARY_LIMIT = 25

    def __init__(self, project_name, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.raw_project_name = project_name

    COLORS = {
        'DEBUG': '\033[94m', 'INFO': '\033[92m',
        'WARNING': '\033[93m', 'ERROR': '\033[91m', 'CRITICAL': '\033[41m'
    }
    RESET = '\033[0m'

    def format(self, record):
        log_time = datetime.now().strftime("%H:%M:%S")
        color = self.COLORS.get(record.levelname, self.RESET)
        status_text = f"{record.levelname:^{self.STATUS_WIDTH}}"
        colored_status = f"{color}[{status_text}]{self.RESET}"

        proj = self.raw_project_name
        fmt_proj = (proj[:self.PROJECT_LIMIT - 2] + "..") if len(
            proj) > self.PROJECT_LIMIT else f"{proj:<{self.PROJECT_LIMIT}}"

        ctx = getattr(record, 'context', '---')
        fmt_ctx = (ctx[:self.CONTEXT_LIMIT - 2] + "..") if len(
            ctx) > self.CONTEXT_LIMIT else f"{ctx:^{self.CONTEXT_LIMIT}}"

        raw_msg = record.getMessage()
        sum_msg = (raw_msg[:self.SUMMARY_LIMIT - 3] + "...") if len(
            raw_msg) > self.SUMMARY_LIMIT else f"{raw_msg:<{self.SUMMARY_LIMIT}}"

        standard_attrs = vars(logging.makeLogRecord({})).keys()
        extras = {k: v for k, v in record.__dict__.items() if
                  k not in standard_attrs and k not in ['traceID', 'context']}

        metadata = {
            "traceID": getattr(record, 'traceID', 'N/A'),
            "context": ctx,
            "project": self.raw_project_name,
            "message": raw_msg
        }
        if extras: metadata["details"] = extras

        return f"{colored_status}[{log_time}][{fmt_proj}][{fmt_ctx}] {sum_msg}, {metadata}"


def setup_log_dog(project_name):
    logger = logging.getLogger(project_name)
    if not logger.handlers:
        # Create farm_logs inside the root defined in .env
        if not os.path.exists(LOG_DIR):
            os.makedirs(LOG_DIR, exist_ok=True)

        console_handler = logging.StreamHandler()
        today_date = datetime.now().strftime("%Y-%m-%d")
        file_name = f"logs-{today_date}.log"
        file_path = os.path.join(LOG_DIR, file_name)
        file_handler = TimedRotatingFileHandler(
            file_path, when="midnight", interval=1, backupCount=14
        )

        formatter = LogDogFormatter(project_name=project_name)
        console_handler.setFormatter(formatter)
        file_handler.setFormatter(formatter)

        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

    logger.setLevel(logging.DEBUG)
    return logger


if __name__ == "__main__":
    print("*" * 50)
    print(f"Log Directory: {LOG_DIR}")
    print("*" * 50)
    # Initialize the master dog for the Skyscraper project
    dog = setup_log_dog("Skyscraper")

    # 1. API - Standard Request (GET)
    dog.info("User fetched quiz list",
             extra={'traceID': 'req-101', 'context': 'GET'})

    # 2. React - Component Interaction
    dog.debug("Option 'B' selected",
              extra={'traceID': 'ui-45', 'context': 'QuizCard'})

    # 3. Database - Performance Tracking
    dog.warning("Query took 1.2 seconds",
                extra={'traceID': 'db-99', 'context': 'Postgres', 'table': 'questions'})

    # 4. Security - Auth Failure
    dog.error("Invalid credentials",
              extra={'traceID': 'sec-00', 'context': 'AuthGuard', 'ip': '1.2.3.4'})

    # 5. Docker - Service Health
    dog.critical("Container stopped",
                 extra={'traceID': 'sys-1', 'context': 'Docker', 'container': 'pi-hole'})

    # 6. React - State Update
    dog.info("Score updated: 85%",
             extra={'traceID': 'ui-46', 'context': 'ScoreBoard', 'user': 'Itai'})

    # 7. API - Resource Creation (POST)
    dog.info("New quiz created",
             extra={'traceID': 'req-102', 'context': 'POST', 'quiz_id': 505})

    # 8. Background Process - Maintenance
    dog.debug("Log rotation complete",
              extra={'traceID': 'maint-1', 'context': 'CleanDog', 'deleted_files': 12})

    # 9. Nextcloud - File Access Warning
    dog.warning("File locked by user",
                extra={'traceID': 'cloud-2', 'context': 'Nextcloud', 'file': 'config.php'})

    # 10. Long Message & Context Truncation Test
    dog.info("This is a test of the automatic truncation logic for long strings",
             extra={'traceID': 'test-long', 'context': 'TestRunner'})
