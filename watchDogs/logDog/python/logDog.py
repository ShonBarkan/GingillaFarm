import sys
import io
import json
import os
import logging
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv

# --- PATH INITIALIZATION ---
load_dotenv()
FARM_ROOT = os.getenv("FARM_ROOT_PATH", "./")
LOG_DIR = os.path.join(FARM_ROOT, "farm_logs")\

# --- CUSTOM LOG LEVEL REGISTRATION ---
SUCCESS_LEVEL_NUM = 25
logging.addLevelName(SUCCESS_LEVEL_NUM, "SUCCESS")

def success(self, message, *args, **kws):
    """Custom level for successful farm operations."""
    if self.isEnabledFor(SUCCESS_LEVEL_NUM):
        self._log(SUCCESS_LEVEL_NUM, message, args, **kws)
logging.Logger.success = success


# --- DATA MODELS (The Farm Guardrails) ---

class BaseLogSchema(BaseModel):
    context: str = "---"
    traceID: Optional[str] = None


class TestLogSchema(BaseLogSchema):
    test_name: str
    file_name: str
    expected: Any = "N/A"
    got: Any = "N/A"


class APILogSchema(BaseLogSchema):
    method: str
    endpoint: str
    status_code: Optional[int] = None
    traceID: str


# --- FORMATTER ---

class LogDogFormatter(logging.Formatter):
    # Width Constants
    STATUS_WIDTH = 12
    PROJECT_LIMIT = 12
    CONTEXT_LIMIT = 12
    TRACE_WIDTH = 12
    SUMMARY_LIMIT = 25

    COLORS = {
        'DEBUG': '\033[94m',  # Blue
        'INFO': '\033[96m',  # Cyan/Bright Green
        'SUCCESS': '\033[92m',  # Green
        'WARNING': '\033[93m',  # Yellow
        'ERROR': '\033[91m',  # Red
        'CRITICAL': '\033[41m'  # White on Red
    }
    RESET = '\033[0m'
    LOG_RECORD_BUILTINS = {
        'args', 'asctime', 'created', 'exc_info', 'exc_text', 'filename',
        'funcName', 'levelname', 'levelno', 'lineno', 'module', 'msecs',
        'name', 'process', 'processName', 'relativeCreated',
        'stack_info', 'thread', 'threadName', 'taskName'
    }

    def __init__(self, project_name: str, log_type: str = "default", *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.project_name = project_name
        self.fmt_proj = f"[{(self.project_name[:self.PROJECT_LIMIT - 3] + '...') if len(self.project_name) > self.PROJECT_LIMIT else self.project_name:^{self.PROJECT_LIMIT}}]"
        self.log_type = log_type

    def _get_extra_data(self, record):
        """Extracts all non-standard fields passed in 'extra'."""
        extra = {k: v for k, v in record.__dict__.items()
                 if k not in self.LOG_RECORD_BUILTINS}
        return f" {json.dumps(extra)}" if extra else ""

    def format(self, record: logging.LogRecord) -> str:
        log_time = datetime.now().strftime("%H:%M:%S")
        color = self.COLORS.get(record.levelname, self.RESET)
        status = f"{color}[{record.levelname:^{self.STATUS_WIDTH}}]{self.RESET}"
        file_name = record.filename

        # Get the {} block for the end
        extra_json = self._get_extra_data(record)

        if self.log_type == "test":
            base_line = self._format_test(record, log_time, status,file_name)
        elif self.log_type == "api":
            base_line = self._format_api(record, log_time, status,file_name)
        else:
            base_line = self._format_default(record, log_time, status,file_name)

        return f"{base_line}{extra_json}"

    def _format_default(self, record, log_time, status,file_name) -> str:
        # Check for traceID in extra
        tid = getattr(record, 'traceID', '----------')
        fmt_tid = f"[{tid:^{self.TRACE_WIDTH}}]"

        ctx = getattr(record, 'context', '---')
        fmt_ctx = (ctx[:self.CONTEXT_LIMIT - 3] + "...") if len(
            str(ctx)) > self.CONTEXT_LIMIT else f"{ctx:^{self.CONTEXT_LIMIT}}"

        msg = record.getMessage()
        sum_msg = (msg[:self.SUMMARY_LIMIT - 3] + "...") if len(
            msg) > self.SUMMARY_LIMIT else f"{msg:<{self.SUMMARY_LIMIT}}"

        return f"{status}[{log_time}]{self.fmt_proj}{fmt_tid}[{file_name}][{fmt_ctx}] {sum_msg} "

    def _format_test(self, record, log_time, status,file_name) -> str:
        try:
            data = TestLogSchema(**record.__dict__)
            tid_str = f"[{data.traceID:^{self.TRACE_WIDTH}}]" if data.traceID else ""

            line = f"{status}[{log_time}]{self.fmt_proj}{tid_str}[{file_name}][TEST:{data.test_name}] {record.getMessage()}"
            if record.levelname not in ["INFO", "SUCCESS"]:
                line += f" | Expected: {data.expected} | Got: {data.got}"
            return line
        except (ValidationError, AttributeError):
            return self._format_default(record, log_time, status,file_name)

    def _format_api(self, record, log_time, status,file_name) -> str:
        try:
            data = APILogSchema(**record.__dict__)
            tid_str = f"[{data.traceID:^{self.TRACE_WIDTH}}]" if data.traceID else ""
            return (f"{status}[{log_time}]{self.fmt_proj}{tid_str}[{file_name}][{data.method}][{data.endpoint}] "
                    f"({data.status_code or '??'}) {record.getMessage()}")
        except (ValidationError, AttributeError):
            return self._format_default(record, log_time, status,file_name)

# --- SETUP FUNCTION ---
def setup_log_dog(project_name: str, log_type: str = "default"):
    # Unique logger per project and type
    logger = logging.getLogger(f"{project_name}_{log_type}")

    if not logger.handlers:
        if not os.path.exists(LOG_DIR):
            os.makedirs(LOG_DIR, exist_ok=True)

        if sys.platform == "win32" and isinstance(sys.stdout, io.TextIOWrapper):
            sys.stdout.reconfigure(encoding='utf-8')

        console_handler = logging.StreamHandler(sys.stdout)

        file_path = os.path.join(LOG_DIR, f"logs-{datetime.now().strftime('%Y-%m-%d')}.log")

        file_handler = TimedRotatingFileHandler(
            file_path,
            when="midnight",
            interval=1,
            backupCount=14,
            encoding="utf-8"
        )

        formatter = LogDogFormatter(project_name=project_name, log_type=log_type)
        console_handler.setFormatter(formatter)
        file_handler.setFormatter(formatter)

        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

    logger.setLevel(logging.DEBUG)
    return logger


# --- DEMO ---

if __name__ == "__main__":
    # --- 1. DEFAULT FARM DOG (General Infrastructure) ---
    dog = setup_log_dog("Gingilla")

    dog.success("Database connection established",
                extra={'traceID': 'DB-INIT', 'context': 'Postgres', 'pool_size': 10})

    dog.info("Monitoring system heartbeat",
             extra={'traceID': 'SYS-HBT', 'context': 'Grafana', 'uptime': '48h'})

    dog.warning("Disk space approaching threshold",
                extra={'traceID': 'SYS-DSK', 'context': 'Storage', 'usage': '85%'})

    dog.critical("Power supply failure in barn",
                 extra={'traceID': 'SYS-PWR', 'context': 'Hardware', 'unit': 'UPS-01'})

    # --- 2. API DOG (Microservices & Requests) ---
    api_dog = setup_log_dog("Gingilla", log_type="api")

    api_dog.info("Fetching carrot data", extra={
        'traceID': 'REQ-777', 'method': 'GET', 'endpoint': '/farm/carrots', 'user_id': 42
    })

    api_dog.success("Profile updated successfully", extra={
        'traceID': 'REQ-888', 'method': 'PATCH', 'endpoint': '/user/profile', 'status_code': 200
    })

    api_dog.error("Unauthorized access attempt", extra={
        'traceID': 'SEC-001', 'method': 'POST', 'endpoint': '/admin/vault', 'status_code': 401, 'ip': '192.168.1.50'
    })

    api_dog.warning("Slow response detected", extra={
        'traceID': 'REQ-999', 'method': 'GET', 'endpoint': '/analytics/heavy', 'duration': '2.5s', 'status_code': 200
    })

    # --- 3. TEST DOG (Quality Assurance) ---
    test_dog = setup_log_dog("Gingilla", log_type="test")

    test_dog.success("Encryption logic passed", extra={
        'test_name': 'CRYPTO_VAL', 'file_name': 'test_auth.py', 'traceID': 'TEST-01'
    })

    test_dog.error("Assertion Error in math module", extra={
        'test_name': 'MATH_ADD', 'file_name': 'test_core.py', 'expected': 4, 'got': 5, 'traceID': 'TEST-02'
    })

    test_dog.info("Starting integration suite", extra={
        'test_name': 'SUITE_INIT', 'file_name': 'runner.py', 'total_tests': 150
    })

    test_dog.critical("Environment setup failed", extra={
        'test_name': 'ENV_LOAD', 'file_name': 'conftest.py', 'error': 'Docker timeout', 'traceID': 'TEST-04'
    })