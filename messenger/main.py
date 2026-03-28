import subprocess
import platform
import logging
import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# --- Load Environment ---
load_dotenv()
API_BASE_URL = os.getenv("MESSENGER_API_BASE", "http://localhost:8020")

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("GingillaMessenger")


# --- Lifespan Handler (Replacement for on_event) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info(f"🌐 Gingilla Messenger started on {platform.system()}!")
    logger.info(f"🔗 API Base URL set to: {API_BASE_URL}")
    logger.info("🛠️ Ready to handle WhatsApp messages.")
    yield
    # Shutdown logic
    logger.info("👋 Shutting down messenger...")


app = FastAPI(title="Gingilla Messenger API", lifespan=lifespan)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Data Models ---
class MessageRequest(BaseModel):
    content: str
    to: str = "me"


def run_mudslide(text: str, recipient: str):
    """Executes the mudslide CLI command with strict error checking"""
    is_windows = platform.system() == "Windows"
    cmd = f'npx mudslide send {recipient} "{text}"'

    logger.info(f"🚀 Attempting to send message to: {recipient}")

    try:
        # Capture output to detect silent errors like "Timed Out"
        result = subprocess.run(
            cmd,
            shell=is_windows,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )

        # Baileys/Mudslide sometimes exits with 0 even on timeout
        combined_output = (result.stdout + result.stderr).lower()

        if "error" in combined_output or "timed out" in combined_output:
            logger.error(f"❌ Mudslide Internal Error: {result.stderr.strip() or result.stdout.strip()}")
        elif result.returncode == 0:
            logger.info(f"✅ Message successfully sent to {recipient}")
        else:
            logger.error(f"❌ Process exited with code {result.returncode}: {result.stderr.strip()}")

    except Exception as e:
        logger.error(f"💀 Unexpected system error: {str(e)}")


# --- API Routes ---

@app.get("/", response_class=HTMLResponse)
async def get_web_interface():
    """Serves the main HTML interface and injects the API_BASE URL"""
    html_file_path = os.path.join(os.path.dirname(__file__), "index.html")
    try:
        with open(html_file_path, "r", encoding="utf-8") as f:
            html_content = f.read()

        # Target the specific line in index.html to inject the .env value
        target_line = 'const API_BASE = "http://localhost:8000";'
        injected_html = html_content.replace(
            target_line,
            f'const API_BASE = "{API_BASE_URL}";'
        )
        return injected_html
    except FileNotFoundError:
        logger.warning("📂 index.html not found in current directory!")
        raise HTTPException(status_code=404, detail="Interface not found")


@app.post("/send")
async def send_message(msg: MessageRequest, background_tasks: BackgroundTasks):
    """API Endpoint to send a message"""
    if not msg.content:
        logger.warning("⚠️ Received a send request with empty content")
        raise HTTPException(status_code=400, detail="Message content is required")

    logger.info(f"📩 New request: To={msg.to} | Length={len(msg.content)}")

    # Queue the sending in the background
    background_tasks.add_task(run_mudslide, msg.content, msg.to)

    return {
        "status": "queued",
        "recipient": msg.to,
        "content_length": len(msg.content)
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("💓 Health check pinged")
    return {
        "status": "online",
        "platform": platform.system(),
        "api_base": API_BASE_URL
    }


if __name__ == "__main__":
    # Start the server on port 8020 as requested
    logger.info("🔥 Starting Uvicorn server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8020, reload=True)