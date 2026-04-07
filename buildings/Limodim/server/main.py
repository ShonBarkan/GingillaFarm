import json
import os
import urllib
import uvicorn
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import shutil
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File, Request
from datetime import datetime, timedelta, date
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import urllib.parse

app = FastAPI(title="Limodim - Academic Management")
scheduler = AsyncIOScheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://shon-comp:3100", "http://localhost:3100", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()
DB_MANAGER_URL = os.getenv("DB_MANAGER_URL", "http://localhost:8000")
BASE_STORAGE_PATH = os.getenv("PDF_STORAGE_PATH", "./uploads/summaries")
UPLOAD_DIR = os.path.abspath(BASE_STORAGE_PATH)

# --- PDF handle ---
# Ensure assets directory exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
# Serve files statically so they can be viewed in the browser
app.mount("/pdf-files", StaticFiles(directory=UPLOAD_DIR), name="summaries")


# --- Pydantic Schemas ---

class ScheduleEntry(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    location_building: Optional[str] = None
    location_room: Optional[str] = None
    class_type: Optional[str] = "הרצאה"
    zoom_link: Optional[str] = None


class AISummaryVisual(BaseModel):
    type: str = "none"
    value: str = ""


class AISummaryBase(BaseModel):
    id: Optional[int] = None
    class_id: Optional[int] = None
    parent_id: Optional[int] = None
    title: str
    content: Optional[str] = None
    visual: AISummaryVisual = AISummaryVisual()
    order_index: int = 0
    summary_type: Optional[str] = None
    is_reviewed: bool = False
    mastery_level: int = 0
    sub_topics: List['AISummaryBase'] = []


class AIQuizDistractor(BaseModel):
    answer_text: str
    explanation: Optional[str] = None


class AIQuizQuestionBase(BaseModel):
    id: Optional[int] = None
    quiz_id: int
    question_text: str
    correct_answer: str
    explanation: Optional[str] = None
    distractors: List[AIQuizDistractor] = []
    correct_count: int = 0
    wrong_count: int = 0


class AIQuizAttempt(BaseModel):
    attempt_date: str  # ISO format
    score: float


class AIQuizBase(BaseModel):
    id: Optional[int] = None
    class_id: int
    attempts: List[AIQuizAttempt] = []
    created_at: Optional[datetime] = None
    questions: List[AIQuizQuestionBase] = []


# Rebuild recursive model
AISummaryBase.model_rebuild()


class ClassBase(BaseModel):
    course_id: int
    name: str
    date_taken: Optional[str] = None
    number: int
    birvouz: Optional[str] = None
    summary: Optional[List[str]] = []
    location_room: Optional[str] = None
    time: Optional[str] = None
    class_type: Optional[str] = "הרצאה"


class ClassFileBase(BaseModel):
    class_id: int
    file_name: str
    original_name: str
    upload_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class HomeworkBase(BaseModel):
    course_id: int  # Required
    name: str
    due_date: Optional[str] = None
    grade: Optional[float] = None
    link_to: Optional[str] = None
    is_done: Optional[bool] = False


class ReceptionHourBase(BaseModel):
    course_id: int  # Required
    name: str  # Required
    day: Optional[str] = None
    time: Optional[str] = None
    location_building: Optional[str] = None
    location_room: Optional[str] = None


class ExamsBase(BaseModel):
    course_id: int
    name: str
    date: Optional[str] = None  # Added for the Timeline
    percentage: Optional[float] = None
    grade: Optional[int] = None


class SyllabusBase(BaseModel):
    course_id: int
    topic_num: int = None
    topic: str
    introduction: Optional[str] = None


class FullCourseData(BaseModel):
    course: Dict[str, Any]
    classes: List[Dict[str, Any]] = []
    homeworks: List[Dict[str, Any]] = []
    reception_hours: List[Dict[str, Any]] = []
    exams: List[Dict[str, Any]] = []
    syllabus: List[Dict[str, Any]] = []


class CourseBase(BaseModel):
    name: str
    degree_points: Optional[float] = None
    lecturer: Optional[str] = None
    practitioner: Optional[str] = None
    final_grade: Optional[int] = None
    semester: Optional[int] = None
    link_to: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    schedule: Optional[List[ScheduleEntry]] = []

    # This validator catches empty strings and converts them to None
    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v


# --- DB Initialization Logic ---

def init_db_tables():
    """Triggers table creation in the DB Manager for the Limodim project."""
    tables = {
        "courses": {
            "id": "SERIAL PRIMARY KEY",
            "name": "TEXT NOT NULL",
            "degree_points": "FLOAT",
            "lecturer": "TEXT",
            "practitioner": "TEXT",
            "final_grade": "INTEGER",
            "semester": "INTEGER",
            "link_to": "TEXT",
            "start_date": "DATE",
            "end_date": "DATE",
            "schedule": "JSONB"
        },
        "classes": {
            "id": "SERIAL PRIMARY KEY",
            "course_id": "INTEGER REFERENCES courses(id)",
            "name": "TEXT",
            "date_taken": "TEXT",
            "number": "INTEGER",
            "birvouz": "TEXT",
            "summary": "JSONB DEFAULT '[]'::jsonb",
            "location_building": "TEXT",
            "location_room": "TEXT",
            "time": "TEXT",
            "class_type": "TEXT"
        },
        "ai_summaries": {
            "id": "SERIAL PRIMARY KEY",
            "class_id": "INTEGER REFERENCES classes(id) ON DELETE CASCADE",
            "parent_id": "INTEGER REFERENCES ai_summaries(id) ON DELETE CASCADE",
            "title": "TEXT NOT NULL",
            "content": "TEXT",
            "visual": "JSONB DEFAULT '{\"type\": \"none\", \"value\": \"\"}'::jsonb",
            "order_index": "INTEGER DEFAULT 0",
            "summary_type": "TEXT",
            "is_reviewed": "BOOLEAN DEFAULT FALSE",
            "mastery_level": "INTEGER DEFAULT 0"
        },
        "ai_quizzes": {
            "id": "SERIAL PRIMARY KEY",
            "class_id": "INTEGER REFERENCES classes(id) ON DELETE CASCADE UNIQUE",
            "attempts": "JSONB DEFAULT '[]'::jsonb",
            "created_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        },
        "ai_quiz_questions": {
            "id": "SERIAL PRIMARY KEY",
            "quiz_id": "INTEGER REFERENCES ai_quizzes(id) ON DELETE CASCADE",
            "question_text": "TEXT NOT NULL",
            "correct_answer": "TEXT NOT NULL",
            "explanation": "TEXT",
            "distractors": "JSONB DEFAULT '[]'::jsonb",
            "correct_count": "INTEGER DEFAULT 0",
            "wrong_count": "INTEGER DEFAULT 0"
        },
        "homeworks": {
            "id": "SERIAL PRIMARY KEY",
            "course_id": "INTEGER REFERENCES courses(id)",
            "name": "TEXT",
            "due_date": "TEXT",
            "grade": "FLOAT",
            "link_to": "TEXT",
            "is_done": "BOOLEAN DEFAULT FALSE"
        },
        "reception_hours": {
            "id": "SERIAL PRIMARY KEY",
            "course_id": "INTEGER REFERENCES courses(id)",
            "name": "TEXT NOT NULL",
            "day": "TEXT",
            "time": "TEXT",
            "location_building": "TEXT",
            "location_room": "TEXT"
        },
        "exams": {
            "id": "SERIAL PRIMARY KEY",
            "course_id": "INTEGER REFERENCES courses(id)",
            "name": "TEXT NOT NULL",
            "date": "TEXT",
            "percentage": "FLOAT",
            "grade": "INTEGER"
        },
        "syllabus_topics": {
            "id": "SERIAL PRIMARY KEY",
            "course_id": "INTEGER REFERENCES courses(id)",
            "topic_num": "INTEGER",
            "topic": "TEXT NOT NULL",
            "introduction": "TEXT"
        },
        "class_files": {
            "id": "SERIAL PRIMARY KEY",
            "class_id": "INTEGER REFERENCES classes(id)",
            "file_name": "TEXT NOT NULL",
            "original_name": "TEXT NOT NULL",
            "upload_date": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        }
    }

    print("Initializing Limodim Tables via DB Manager...")
    for table_name, columns in tables.items():
        payload = {
            "action": "create_table",
            "table": table_name,
            "columns": columns
        }
        try:
            response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
            if response.status_code != 200:
                print(f"Failed to create '{table_name}': {response.text}")
        except requests.exceptions.ConnectionError:
            print(f"CRITICAL: Could not connect to DB Manager at {DB_MANAGER_URL}")


async def sync_classes_retroactive():
    print("--- Starting Retroactive Class Sync ---")
    try:
        # Fetch all courses
        courses_res = requests.post(f"{DB_MANAGER_URL}/query", json={
            "action": "find",
            "table": "courses",
            "filters": {}
        })

        if courses_res.status_code != 200:
            print(f"Sync Error: Failed to fetch courses. Status: {courses_res.status_code}")
            return

        courses = courses_res.json().get("data", [])
        print(f"Found {len(courses)} courses to process.")

        now = datetime.now()
        today = now.date()
        current_time_str = now.strftime("%H:%M")

        # Map for day names as they appear in the Hebrew calendar logic
        day_map = {0: "שני", 1: "שלישי", 2: "רביעי", 3: "חמישי", 4: "שישי", 5: "שבת", 6: "ראשון"}

        for course in courses:
            start_date_str = course.get("start_date")
            if not start_date_str:
                continue

            try:
                start_dt = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            except ValueError:
                continue

            # Determine the end limit for synchronization
            end_date_str = course.get("end_date")
            end_limit = today
            if end_date_str:
                try:
                    potential_end = datetime.strptime(end_date_str, "%Y-%m-%d").date()
                    if potential_end < today:
                        end_limit = potential_end
                except ValueError:
                    pass

            schedule = course.get("schedule", [])
            if isinstance(schedule, str):
                schedule = json.loads(schedule)

            if not schedule:
                continue

            check_dt = start_dt
            while check_dt <= end_limit:
                day_name_hebrew = day_map.get(check_dt.weekday())

                for entry in schedule:
                    # Clean "יום" prefix from DB entry if exists to ensure match
                    db_day = entry.get("day_of_week", "").replace("יום", "").strip()

                    if db_day == day_name_hebrew:
                        # If the class is today, only sync if it has already ended
                        if check_dt == today:
                            if entry.get("end_time") > current_time_str:
                                continue

                        date_taken_str = check_dt.strftime("%Y-%m-%d")
                        start_time = entry.get("start_time")

                        # Check if this specific instance already exists in the 'classes' table
                        exists_res = requests.post(f"{DB_MANAGER_URL}/query", json={
                            "action": "find",
                            "table": "classes",
                            "filters": {
                                "course_id": course["id"],
                                "date_taken": date_taken_str,
                                "time": start_time
                            }
                        })

                        if exists_res.status_code == 200 and len(exists_res.json().get("data", [])) == 0:
                            print(f"Adding missing class: {course['name']} on {date_taken_str}")

                            # Calculate the next lesson number for this course
                            count_res = requests.post(f"{DB_MANAGER_URL}/query", json={
                                "action": "find",
                                "table": "classes",
                                "filters": {"course_id": course["id"]}
                            })
                            class_num = len(count_res.json().get("data", [])) + 1

                            class_type = entry.get("class_type", "הרצאה")
                            new_class_data = {
                                "course_id": course["id"],
                                "name": f"{class_type} - {check_dt.strftime('%d/%m/%Y')}",
                                "date_taken": date_taken_str,
                                "number": class_num,
                                "time": start_time,
                                "class_type": class_type,
                                "location_room": entry.get("location_room"),
                                "summary": []
                            }

                            requests.post(f"{DB_MANAGER_URL}/query", json={
                                "action": "insert",
                                "table": "classes",
                                "data": new_class_data
                            })

                check_dt += timedelta(days=1)
        print("--- Sync Completed Successfully ---")

    except Exception as e:
        print(f"Cron Error: {e}")


@app.on_event("startup")
async def startup_event():
    init_db_tables()
    scheduler.add_job(sync_classes_retroactive, 'cron', hour='7-20', minute=1)  # (e.g., 01:02, 02:02, etc.)
    scheduler.start()
    await sync_classes_retroactive()  # Trigger an immediate sync on server startup


# --- API Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "online", "project": "Limodim"}


# --- Course CRUD Endpoints ---

@app.post("/courses", status_code=201)
async def create_course(course_data: CourseBase):
    data = course_data.dict()

    if data.get("start_date"):
        data["start_date"] = data["start_date"].isoformat()
    if data.get("end_date"):
        data["end_date"] = data["end_date"].isoformat()

    if data.get("schedule") is not None:
        data["schedule"] = json.dumps(data["schedule"])

    payload = {
        "action": "insert",
        "table": "courses",
        "data": data
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        return response.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.get("/courses")
async def get_courses():
    """Retrieve all courses."""
    payload = {
        "action": "find",
        "table": "courses",
        "filters": {}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.put("/courses/{course_id}")
async def update_course(course_id: int, course_data: CourseBase):
    data = course_data.dict()

    if data.get("start_date"):
        data["start_date"] = data["start_date"].isoformat()
    if data.get("end_date"):
        data["end_date"] = data["end_date"].isoformat()
    if data.get("schedule") is not None:
        data["schedule"] = json.dumps(data["schedule"])
    payload = {
        "action": "update",
        "table": "courses",
        "data": data,
        "filters": {"id": course_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        return response.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.delete("/courses/{course_id}")
async def delete_course(course_id: int):
    """
    Deletes a course and all related data (classes, homeworks,
    exams, syllabus, reception hours) to ensure integrity.
    """

    # List of tables that have a 'course_id' column
    dependency_tables = [
        "classes",
        "homeworks",
        "reception_hours",
        "exams",
        "syllabus_topics"
    ]

    try:
        # 1. Delete from all dependent tables first
        for table in dependency_tables:
            del_payload = {
                "action": "delete",
                "table": table,
                "filters": {"course_id": course_id}
            }
            requests.post(f"{DB_MANAGER_URL}/query", json=del_payload)

        # 2. Finally, delete the course itself
        course_payload = {
            "action": "delete",
            "table": "courses",
            "filters": {"id": course_id}
        }

        response = requests.post(f"{DB_MANAGER_URL}/query", json=course_payload)

        if response.status_code == 200:
            return {
                "status": "success",
                "message": f"Course {course_id} and all related data deleted."
            }

        raise HTTPException(status_code=response.status_code, detail=response.text)

    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


# --- Class CRUD Endpoints ---

@app.post("/classes", status_code=201)
async def create_class(class_data: ClassBase):
    """Create a new class entry."""
    # Convert Pydantic model to dict, handling the 'date' object if present
    data = class_data.dict()
    if data.get("date"):
        data["date"] = data["date"].isoformat()

    payload = {
        "action": "insert",
        "table": "classes",
        "data": data
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.get("/classes")
async def get_classes(course_id: Optional[int] = None):
    """Retrieve classes, optionally filtered by course_id."""
    filters = {}
    if course_id:
        filters["course_id"] = course_id

    payload = {
        "action": "find",
        "table": "classes",
        "filters": filters
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.put("/classes/{class_id}")
async def update_class(class_id: int, class_data: ClassBase):
    data = class_data.dict()

    if data.get("date_taken") and isinstance(data["date_taken"], (date, datetime)):
        data["date_taken"] = data["date_taken"].isoformat()

    # Only stringify 'summary' (the PDF paths list)
    if "summary" in data and isinstance(data["summary"], list):
        data["summary"] = json.dumps(data["summary"])

    payload = {
        "action": "update",
        "table": "classes",
        "data": data,
        "filters": {"id": class_id}
    }

    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=response.text)


@app.delete("/classes/{class_id}")
async def delete_class(class_id: int):
    """Delete a class entry."""
    payload = {
        "action": "delete",
        "table": "classes",
        "filters": {"id": class_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


# --- Homework CRUD Endpoints ---

@app.post("/homeworks", status_code=201)
async def create_homework(hw_data: HomeworkBase):
    """Create a new homework assignment entry."""
    payload = {
        "action": "insert",
        "table": "homeworks",
        "data": hw_data.dict()
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.get("/homeworks")
async def get_homeworks(course_id: Optional[int] = None):
    """Retrieve homeworks, optionally filtered by course_id."""
    filters = {}
    if course_id:
        filters["course_id"] = course_id

    payload = {
        "action": "find",
        "table": "homeworks",
        "filters": filters
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.put("/homeworks/{hw_id}")
async def update_homework(hw_id: int, hw_data: HomeworkBase):
    """Update an existing homework entry."""
    payload = {
        "action": "update",
        "table": "homeworks",
        "data": hw_data.dict(),
        "filters": {"id": hw_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.delete("/homeworks/{hw_id}")
async def delete_homework(hw_id: int):
    """Delete a homework entry."""
    payload = {
        "action": "delete",
        "table": "homeworks",
        "filters": {"id": hw_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


# --- Reception Hours CRUD Endpoints ---

@app.post("/reception-hours", status_code=201)
async def create_reception_hour(rh_data: ReceptionHourBase):
    """Create a new reception hour entry."""
    payload = {
        "action": "insert",
        "table": "reception_hours",
        "data": rh_data.dict()
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.get("/reception-hours")
async def get_reception_hours(course_id: Optional[int] = None):
    """Retrieve reception hours, optionally filtered by course_id."""
    filters = {}
    if course_id:
        filters["course_id"] = course_id

    payload = {
        "action": "find",
        "table": "reception_hours",
        "filters": filters
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.put("/reception-hours/{rh_id}")
async def update_reception_hour(rh_id: int, rh_data: ReceptionHourBase):
    """Update an existing reception hour entry."""
    payload = {
        "action": "update",
        "table": "reception_hours",
        "data": rh_data.dict(),
        "filters": {"id": rh_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.delete("/reception-hours/{rh_id}")
async def delete_reception_hour(rh_id: int):
    """Delete a reception hour entry."""
    payload = {
        "action": "delete",
        "table": "reception_hours",
        "filters": {"id": rh_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


# --- Exams CRUD Endpoints ---

@app.post("/exams", status_code=201)
async def create_exam(exam_data: ExamsBase):
    """Create a new exam entry."""
    payload = {
        "action": "insert",
        "table": "exams",
        "data": exam_data.dict()
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.get("/exams")
async def get_exams(course_id: Optional[int] = None):
    """Retrieve exams, optionally filtered by course_id."""
    filters = {}
    if course_id:
        filters["course_id"] = course_id

    payload = {
        "action": "find",
        "table": "exams",
        "filters": filters
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.put("/exams/{exam_id}")
async def update_exam(exam_id: int, exam_data: ExamsBase):
    """Update an existing exam entry."""
    payload = {
        "action": "update",
        "table": "exams",
        "data": exam_data.dict(),
        "filters": {"id": exam_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.delete("/exams/{exam_id}")
async def delete_exam(exam_id: int):
    """Delete an exam entry."""
    payload = {
        "action": "delete",
        "table": "exams",
        "filters": {"id": exam_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


# --- Syllabus CRUD Endpoints ---

@app.post("/syllabus", status_code=201)
async def create_syllabus_topic(topic_data: SyllabusBase):
    """Create a new topic in the course syllabus."""
    payload = {
        "action": "insert",
        "table": "syllabus_topics",
        "data": topic_data.dict()
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.get("/syllabus")
async def get_syllabus(course_id: Optional[int] = None):
    """Retrieve syllabus topics, optionally filtered by course_id."""
    filters = {}
    if course_id:
        filters["course_id"] = course_id

    payload = {
        "action": "find",
        "table": "syllabus_topics",
        "filters": filters
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            # Optionally sort by topic_num if the DB manager returns raw list
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.put("/syllabus/{topic_id}")
async def update_syllabus_topic(topic_id: int, topic_data: SyllabusBase):
    """Update an existing syllabus topic."""
    payload = {
        "action": "update",
        "table": "syllabus_topics",
        "data": topic_data.dict(),
        "filters": {"id": topic_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


@app.delete("/syllabus/{topic_id}")
async def delete_syllabus_topic(topic_id: int):
    """Delete a syllabus topic."""
    payload = {
        "action": "delete",
        "table": "syllabus_topics",
        "filters": {"id": topic_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


# --- full-course CRUD Endpoints ---

@app.get("/full-course/{course_id}", response_model=FullCourseData)
async def get_full_course_data(course_id: int):
    def fetch_from_db(table: str, filters: dict):
        payload = {"action": "find", "table": table, "filters": filters}
        try:
            res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
            if res.status_code == 200:
                return res.json().get("data", [])
            return []
        except Exception:
            return []

    # 1. Fetch Basic Course Info
    course_list = fetch_from_db("courses", {"id": course_id})
    if not course_list:
        raise HTTPException(status_code=404, detail="Course not found")

    # 2. Fetch all classes for this course
    all_classes = fetch_from_db("classes", {"course_id": course_id})
    class_ids = [c["id"] for c in all_classes]

    # 3. Bulk Fetch AI Status (to know what exists)
    # Fetching only IDs to check existence for the UI badges
    all_summaries = fetch_from_db("ai_summaries", {"class_id": ["IN", class_ids]})
    all_quizzes = fetch_from_db("ai_quizzes", {"class_id": ["IN", class_ids]})

    # Create lookup sets for quick access
    summary_map = {s["class_id"] for s in all_summaries if s.get("class_id")}
    quiz_map = {q["class_id"] for q in all_quizzes if q.get("class_id")}

    # 4. Attach status to each class
    for cls in all_classes:
        # We add these virtual fields so the Frontend remains compatible
        cls["has_ai_summary"] = cls["id"] in summary_map
        cls["has_ai_quiz"] = cls["id"] in quiz_map

        # Ensure summary (PDFs) is a list
        if isinstance(cls.get("summary"), str):
            try:
                cls["summary"] = json.loads(cls["summary"])
            except:
                cls["summary"] = []

    # 5. Build the final response
    full_data = {
        "course": course_list[0],
        "classes": all_classes,
        "homeworks": fetch_from_db("homeworks", {"course_id": course_id}),
        "reception_hours": fetch_from_db("reception_hours", {"course_id": course_id}),
        "exams": fetch_from_db("exams", {"course_id": course_id}),
        "syllabus": fetch_from_db("syllabus_topics", {"course_id": course_id})
    }

    return full_data


# --- timeline Endpoints ---
@app.get("/timeline/future-classes")
async def get_future_classes():
    try:
        payload_courses = {"action": "find", "table": "courses", "filters": {}}
        courses_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_courses)

        if courses_res.status_code != 200:
            return []

        courses = courses_res.json().get("data", [])

        now = datetime.now()
        today = now.date()
        current_time_str = now.strftime("%H:%M")

        day_map = {"שני": 0, "שלישי": 1, "רביעי": 2, "חמישי": 3, "שישי": 4, "שבת": 5, "ראשון": 6}
        future_timeline = []

        # Loop only for today (0) and tomorrow (1)
        for i in range(0, 2):
            check_date = today + timedelta(days=i)
            day_num = check_date.weekday()
            current_day_name = next((name for name, val in day_map.items() if val == day_num), None)

            for course in courses:
                schedule = course.get("schedule")
                start_date_str = course.get("start_date")
                end_date_str = course.get("end_date")

                if not schedule or not start_date_str or not end_date_str:
                    continue

                try:
                    course_start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                    course_end = datetime.strptime(end_date_str, "%Y-%m-%d").date()

                    if not (course_start <= check_date <= course_end):
                        continue

                    if isinstance(schedule, str):
                        schedule = json.loads(schedule)
                except:
                    continue

                for slot in schedule:
                    if slot.get("day_of_week", "").strip() == current_day_name:

                        # Filtering classes that already ended today
                        if check_date == today:
                            class_end_time = slot.get("end_time", "00:00")
                            if class_end_time < current_time_str:
                                continue

                        future_timeline.append({
                            "course_id": course["id"],
                            "course_name": course["name"],
                            "date": str(check_date),
                            "day": current_day_name,
                            "time": slot.get("start_time", "00:00"),
                            "end_time": slot.get("end_time", "00:00"),
                            "class_type": slot.get("class_type", "הרצאה"),
                            "location": f"{slot.get('location_building', '')}/{slot.get('location_room', '')}",
                            "zoom_link": slot.get("zoom_link")
                        })

        future_timeline.sort(key=lambda x: (x["date"], x["time"]))
        return future_timeline

    except Exception as e:
        print(f"Error in future-classes: {e}")
        return []


@app.get("/timeline/past-classes")
async def get_past_classes():
    try:
        # 1. Fetch all necessary data from DB Manager
        payload_courses = {"action": "find", "table": "courses", "filters": {}}
        payload_classes = {"action": "find", "table": "classes", "filters": {}}

        # New: Fetch existing AI summaries and quizzes to check for existence
        payload_summaries = {"action": "find", "table": "ai_summaries", "filters": {}}
        payload_quizzes = {"action": "find", "table": "ai_quizzes", "filters": {}}
        # We also want to know which quizzes actually have questions
        payload_questions = {"action": "find", "table": "ai_quiz_questions", "filters": {}}

        courses_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_courses)
        classes_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_classes)
        summaries_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_summaries)
        quizzes_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_quizzes)
        questions_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_questions)

        if any(res.status_code != 200 for res in [courses_res, classes_res, summaries_res, quizzes_res, questions_res]):
            return []

        # 2. Create Lookup Sets for fast existence checking
        # Set of class_ids that have at least one AI summary topic
        classes_with_ai_summary = {s.get("class_id") for s in summaries_res.json().get("data", []) if s.get("class_id")}

        # Map quiz_id to class_id
        quiz_to_class = {q.get("id"): q.get("class_id") for q in quizzes_res.json().get("data", [])}

        # Set of class_ids that have a quiz WITH at least one question
        classes_with_ai_quiz = set()
        for quest in questions_res.json().get("data", []):
            q_id = quest.get("quiz_id")
            if q_id in quiz_to_class:
                classes_with_ai_quiz.add(quiz_to_class[q_id])

        courses_list = courses_res.json().get("data", [])
        all_performed = classes_res.json().get("data", [])
        course_map = {str(c["id"]): c["name"] for c in courses_list}

        incomplete_classes = []

        for c in all_performed:
            class_id = c.get("id")

            # 3. Check PDF summaries (still in classes table)
            raw_summary = c.get("summary")
            summary_list = []
            if isinstance(raw_summary, list):
                summary_list = raw_summary
            elif isinstance(raw_summary, str) and raw_summary.strip():
                try:
                    summary_list = json.loads(raw_summary)
                except:
                    summary_list = []

            # 4. Logical Checks
            birvouz_value = c.get("birvouz")
            is_missing_birvouz = not birvouz_value or str(birvouz_value).strip() == ""
            is_missing_summary = not summary_list or len(summary_list) == 0

            # New Existence Logic
            is_missing_ai_summary = class_id not in classes_with_ai_summary
            is_missing_ai_quiz = class_id not in classes_with_ai_quiz

            if is_missing_birvouz or is_missing_summary or is_missing_ai_summary or is_missing_ai_quiz:
                incomplete_classes.append({
                    "id": class_id,
                    "course_id": c.get("course_id"),
                    "course_name": course_map.get(str(c.get("course_id")), "Unknown Course"),
                    "class_name": c.get("name"),
                    "date": c.get("date_taken"),
                    "birvouz": birvouz_value,
                    "missing": {
                        "birvouz": is_missing_birvouz,
                        "summary": is_missing_summary,
                        "ai_summary": is_missing_ai_summary,
                        "ai_quiz": is_missing_ai_quiz
                    }
                })

        incomplete_classes.sort(key=lambda x: x["date"] if x["date"] else "0000-00-00", reverse=True)
        return incomplete_classes

    except Exception as e:
        print(f"Error in past-classes: {e}")
        return []


@app.get("/timeline/future-exams")
async def get_future_exams():
    try:
        # 1. Fetch exams from the dedicated 'exams' table
        payload_exams = {"action": "find", "table": "exams", "filters": {}}
        exams_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_exams)

        # 2. Fetch courses for names
        payload_courses = {"action": "find", "table": "courses", "filters": {}}
        courses_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_courses)

        if exams_res.status_code != 200 or courses_res.status_code != 200:
            return []

        exams_data = exams_res.json().get("data", [])
        courses_list = courses_res.json().get("data", [])

        course_map = {c['id']: c['name'] for c in courses_list}
        today = datetime.now().date()
        future_exams = []

        for ex in exams_data:
            exam_date_str = ex.get("date")
            if not exam_date_str:
                continue

            try:
                exam_date = datetime.strptime(exam_date_str, "%Y-%m-%d").date()
            except:
                continue

            # Filter: Only today onwards
            if exam_date >= today:
                future_exams.append({
                    "course_id": ex.get("course_id"),
                    "course_name": course_map.get(ex.get("course_id"), "Unknown"),
                    "exam_name": ex.get("name", "Unnamed Exam"),
                    "date": str(exam_date),
                    "percentage": ex.get("percentage", 0),
                    "days_left": (exam_date - today).days
                })

        # Sort by date
        future_exams.sort(key=lambda x: x["date"])
        return future_exams

    except Exception as e:
        print(f"Error in future-exams: {e}")
        return []


@app.get("/timeline/reception-hours")
async def get_reception_hours():
    try:
        payload_rh = {"action": "find", "table": "reception_hours", "filters": {}}
        payload_courses = {"action": "find", "table": "courses", "filters": {}}

        rh_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_rh)
        courses_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_courses)

        if rh_res.status_code != 200 or courses_res.status_code != 200:
            return []

        rh_data = rh_res.json().get("data", [])
        courses_list = courses_res.json().get("data", [])
        course_map = {c['id']: c['name'] for c in courses_list}

        now = datetime.now()
        today = now.date()
        current_time_str = now.strftime("%H:%M")

        rev_day_map = {
            0: "שני", 1: "שלישי", 2: "רביעי", 3: "חמישי", 4: "שישי", 5: "שבת", 6: "ראשון"
        }

        reception_timeline = []

        # Only today (0) and tomorrow (1)
        for i in range(0, 2):
            check_date = today + timedelta(days=i)
            current_day_name = rev_day_map.get(check_date.weekday())

            for slot in rh_data:
                db_day = str(slot.get("day", "")).replace("יום", "").strip()

                if db_day == current_day_name:
                    slot_time = slot.get("time", "00:00")

                    # Filter out past slots for today
                    if i == 0 and slot_time < current_time_str:
                        continue

                    reception_timeline.append({
                        "course_id": slot.get("course_id"),
                        "course_name": course_map.get(slot.get("course_id"), "Unknown"),
                        "staff_name": slot.get("name", "Staff"),
                        "date": str(check_date),
                        "day": current_day_name,
                        "time": slot_time,
                        "location": f"{slot.get('location_building', '')}/{slot.get('location_room', '')}"
                    })

        reception_timeline.sort(key=lambda x: (x["date"], x["time"]))
        return reception_timeline

    except Exception as e:
        print(f"Error in reception-hours: {e}")
        return []


@app.get("/timeline/due-homework")
async def get_due_homework():
    try:
        # Fetch homework and courses
        payload_hw = {"action": "find", "table": "homeworks", "filters": {}}
        payload_courses = {"action": "find", "table": "courses", "filters": {}}

        hw_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_hw)
        courses_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_courses)

        if hw_res.status_code != 200 or courses_res.status_code != 200:
            return []

        homeworks = hw_res.json().get("data", [])
        courses_list = courses_res.json().get("data", [])
        courses_dict = {c['id']: c['name'] for c in courses_list}

        today = datetime.now().date()
        due_hw = []

        for hw in homeworks:
            # Check if assignment is explicitly done
            # Handles None (old records) or False
            if hw.get("is_done") is True:
                continue

            due_date_str = hw.get("due_date")
            if not due_date_str:
                continue

            try:
                due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
            except:
                continue

            # We include everything not done (even if it's overdue)
            due_hw.append({
                "id": hw["id"],
                "course_id": hw["course_id"],
                "course_name": courses_dict.get(hw["course_id"], "Unknown"),
                "name": hw.get("name", "Untitled Task"),
                "due_date": str(due_date),
                "days_left": (due_date - today).days,
                "link": hw.get("link_to"),
                "is_done": False
            })

        # Sort: Oldest deadline first (to highlight what's most urgent/overdue)
        due_hw.sort(key=lambda x: x["due_date"])

        return due_hw

    except Exception as e:
        print(f"Error in due-homework: {e}")
        return []


# --- Files Endpoints ---

def sanitize_folder_name(name: str):
    decoded_name = urllib.parse.unquote(name)
    # Allows Hebrew, English, spaces and underscores. Removes illegal characters like / \ : * ? " < > |
    return "".join([c for c in decoded_name if c.isalnum() or c in (' ', '_', '-')]).strip()


@app.post("/upload-pdf/{course_name}/{class_id}")
async def upload_pdf(course_name: str, class_id: int, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    clean_course_name = sanitize_folder_name(course_name)
    relative_folder = os.path.join(clean_course_name, str(class_id))
    target_dir = os.path.join(UPLOAD_DIR, relative_folder)
    os.makedirs(target_dir, exist_ok=True)

    timestamp = int(datetime.now().timestamp())
    unique_name = f"{timestamp}_{file.filename}"
    file_path_on_disk = os.path.join(target_dir, unique_name)
    db_path = f"{clean_course_name}/{class_id}/{unique_name}".replace("\\", "/")

    with open(file_path_on_disk, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        class_res = requests.post(f"{DB_MANAGER_URL}/query", json={
            "action": "find",
            "table": "classes",
            "filters": {"id": class_id}
        }).json()

        current_class = class_res.get("data", [{}])[0]
        raw_summary = current_class.get("summary")

        # --- SAFE PARSING LOGIC ---
        if isinstance(raw_summary, list):
            summary_list = raw_summary
        elif isinstance(raw_summary, str) and raw_summary.strip():
            try:
                summary_list = json.loads(raw_summary)
            except:
                summary_list = []
        else:
            summary_list = []
        # --------------------------

        summary_list.append(db_path)

        update_payload = {
            "action": "update",
            "table": "classes",
            "data": {"summary": json.dumps(summary_list)},
            "filters": {"id": class_id}
        }

        requests.post(f"{DB_MANAGER_URL}/query", json=update_payload)
        return {"status": "success", "path": db_path}

    except Exception as e:
        if os.path.exists(file_path_on_disk):
            os.remove(file_path_on_disk)
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")


@app.post("/delete-class-file/{course_name}/{class_id}")
async def delete_class_file(course_name: str, class_id: int, request_data: dict):
    file_path_to_remove = request_data.get("file_path")
    if not file_path_to_remove:
        raise HTTPException(status_code=400, detail="file_path is required")

    absolute_path = os.path.join(UPLOAD_DIR, file_path_to_remove)
    if os.path.exists(absolute_path):
        os.remove(absolute_path)

    try:
        class_res = requests.post(f"{DB_MANAGER_URL}/query", json={
            "action": "find",
            "table": "classes",
            "filters": {"id": class_id}
        }).json()

        current_class = class_res.get("data", [{}])[0]
        raw_summary = current_class.get("summary")

        # --- SAFE PARSING LOGIC ---
        if isinstance(raw_summary, list):
            summary_list = raw_summary
        elif isinstance(raw_summary, str) and raw_summary.strip():
            summary_list = json.loads(raw_summary)
        else:
            summary_list = []
        # --------------------------

        updated_summary = [p for p in summary_list if p != file_path_to_remove]

        update_payload = {
            "action": "update",
            "table": "classes",
            "data": {"summary": json.dumps(updated_summary)},
            "filters": {"id": class_id}
        }

        requests.post(f"{DB_MANAGER_URL}/query", json=update_payload)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/class-summary/{class_id}")
async def get_class_summary(class_id: int):
    payload = {
        "action": "find",
        "table": "classes",
        "filters": {"id": class_id}
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    data = response.json().get("data", [])

    if not data:
        return []

    # Return the summary field parsed as a list
    try:
        return json.loads(data[0].get("summary", "[]"))
    except:
        return []


# --- Stats Endpoints ---
@app.get("/classes/missing-summaries")
async def get_missing_summaries():
    try:
        # Fetch data from DB Manager
        res_classes = requests.post(f"{DB_MANAGER_URL}/query",
                                    json={"action": "find", "table": "classes", "filters": {}})
        res_courses = requests.post(f"{DB_MANAGER_URL}/query",
                                    json={"action": "find", "table": "courses", "filters": {}})

        if res_classes.status_code != 200 or res_courses.status_code != 200:
            raise HTTPException(status_code=500, detail="Database connection failed")

        all_classes = res_classes.json().get("data", [])
        all_courses = {c['id']: c['name'] for c in res_courses.json().get("data", [])}

        today = datetime.now().date()
        missing = []

        for cls in all_classes:
            # Parse date and summary
            date_taken = datetime.strptime(cls['date_taken'], "%Y-%m-%d").date() if cls.get('date_taken') else None
            summary = cls.get('summary', [])

            if isinstance(summary, str):
                try:
                    summary = json.loads(summary)
                except:
                    summary = []

            # Filter logic: date has passed and summary list is empty
            if date_taken and date_taken <= today and (not summary or len(summary) == 0):
                missing.append({
                    "id": cls['id'],
                    "course_id": cls['course_id'],
                    "course_name": all_courses.get(cls['course_id'], "Unknown"),
                    "number": cls['number'],
                    "name": cls.get('name', 'Untitled'),
                    "date": cls['date_taken']
                })

        # Sort by date (oldest first)
        missing.sort(key=lambda x: x['date'])
        return missing

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- ai-summary Endpoints ---
def build_summary_tree(flat_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    # 1. Create a map for all items by their ID
    nodes = {item['id']: {**item, "sub_topics": []} for item in flat_list}
    tree = []

    # 2. Sort the items by order_index first to ensure sequence
    sorted_items = sorted(flat_list, key=lambda x: x.get('order_index', 0))

    for item in sorted_items:
        node = nodes[item['id']]
        parent_id = item.get('parent_id')

        if parent_id is None:
            # Root level topic
            tree.append(node)
        else:
            # Sub-topic: add to parent's sub_topics if parent exists
            if parent_id in nodes:
                nodes[parent_id]['sub_topics'].append(node)
            else:
                # Fallback: if parent is missing for some reason, treat as root
                tree.append(node)

    return tree


@app.get("/classes/{class_id}/ai-summary", response_model=List[AISummaryBase])
async def get_class_ai_summary(class_id: int):
    payload = {
        "action": "find",
        "table": "ai_summaries",
        "filters": {"class_id": class_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code != 200:
            return []

        flat_data = response.json().get("data", [])

        # Parse visual JSON strings back to dicts if they come as strings
        for item in flat_data:
            if isinstance(item.get("visual"), str):
                try:
                    item["visual"] = json.loads(item["visual"])
                except:
                    item["visual"] = {"type": "none", "value": ""}

        return build_summary_tree(flat_data)

    except Exception as e:
        print(f"Error fetching AI summary: {e}")
        return []


# --- Update in main.py ---

def save_topic_recursive(topic_data, class_id, parent_id=None):
    """
    Recursively saves a topic and its children to the database.
    """
    # 1. Pull out sub_topics so they don't go into the ai_summaries table columns
    sub_topics = topic_data.pop("sub_topics", [])

    # 2. Prepare the data for saving
    clean_data = {
        "class_id": int(class_id),
        "parent_id": parent_id,
        "title": topic_data.get("title", "Untitled"),
        "content": topic_data.get("content", ""),
        "summary_type": topic_data.get("summary_type", "definition"),
        "order_index": topic_data.get("order_index", 0),
        "visual": topic_data.get("visual", {"type": "none", "value": ""}),
        "is_reviewed": topic_data.get("is_reviewed", False),
        "mastery_level": topic_data.get("mastery_level", 0)
    }

    # Handle JSONB fields for the DB Manager
    if isinstance(clean_data["visual"], (dict, list)):
        clean_data["visual"] = json.dumps(clean_data["visual"])

    # 3. Determine if we are updating or inserting
    topic_id = topic_data.get("id")
    action = "update" if topic_id else "insert"
    filters = {"id": topic_id} if topic_id else {}

    payload = {
        "action": action,
        "table": "ai_summaries",
        "data": clean_data,
        "filters": filters
    }

    # 4. Execute the DB operation
    res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    if res.status_code == 200:
        res_data = res.json()

        # 5. CRITICAL: Get the ID of the topic we just saved
        # If it was an insert, we need the new ID to be the parent of the sub_topics
        new_topic_id = topic_id
        if action == "insert":
            # Some DB Managers return 'inserted_id', others might need a 'find'
            new_topic_id = res_data.get("inserted_id")

            # Fallback: if ID is missing in response, find it by title and class_id
            if not new_topic_id:
                lookup = requests.post(f"{DB_MANAGER_URL}/query", json={
                    "action": "find",
                    "table": "ai_summaries",
                    "filters": {"class_id": class_id, "title": clean_data["title"]}
                }).json()
                if lookup.get("data"):
                    new_topic_id = lookup["data"][-1]["id"]

        # 6. Recursively save all children with the new parent_id
        if new_topic_id:
            for sub in sub_topics:
                save_topic_recursive(sub, class_id, new_topic_id)

    return res


@app.post("/ai-summary", status_code=201)
async def upsert_summary_topic(topic: AISummaryBase):
    topic_dict = topic.dict()
    class_id = topic_dict.get("class_id")

    if not class_id:
        raise HTTPException(status_code=400, detail="Missing class_id")

    response = save_topic_recursive(topic_dict, class_id, topic_dict.get("parent_id"))

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"DB Error: {response.text}")

    return {"status": "success", "detail": response.json()}


@app.patch("/ai-summary/{topic_id}/status")
async def update_summary_status(topic_id: int, status: Dict[str, Any]):
    """Quick update for is_reviewed or mastery_level."""
    payload = {
        "action": "update",
        "table": "ai_summaries",
        "data": status,  # e.g., {"is_reviewed": True}
        "filters": {"id": topic_id}
    }
    res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    return res.json()


@app.put("/ai-summary/{topic_id}")
async def update_summary_topic(topic_id: int, topic_data: AISummaryBase):
    """
    Updates an existing summary topic.
    Handles JSONB serialization for the 'visual' field.
    """
    data = topic_data.dict(exclude={"id", "sub_topics"}, exclude_unset=True)

    if "visual" in data and data["visual"] is not None:
        data["visual"] = json.dumps(data["visual"])

    payload = {
        "action": "update",
        "table": "ai_summaries",
        "data": data,
        "filters": {"id": topic_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return response.json()
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/ai-summary/{topic_id}")
async def delete_summary_topic(topic_id: int):
    """
    Deletes a summary topic.
    Recursive deletion of sub-topics is handled by DB CASCADE.
    """
    payload = {
        "action": "delete",
        "table": "ai_summaries",
        "filters": {"id": topic_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        if response.status_code == 200:
            return {"status": "success", "message": f"Topic {topic_id} and its sub-topics deleted."}
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- ai-quiz Endpoints ---
@app.get("/classes/{class_id}/ai-quiz")
async def get_class_quiz(class_id: int):
    """
    Fetches the quiz header and all its associated questions.
    """
    # 1. Fetch Quiz Header
    quiz_res = requests.post(f"{DB_MANAGER_URL}/query", json={
        "action": "find",
        "table": "ai_quizzes",
        "filters": {"class_id": class_id}
    })

    quizzes = quiz_res.json().get("data", [])
    if not quizzes:
        return None

    quiz = quizzes[0]

    # Parse attempts from JSONB string if necessary
    if isinstance(quiz.get("attempts"), str):
        quiz["attempts"] = json.loads(quiz["attempts"])

    # 2. Fetch Questions for this quiz
    questions_res = requests.post(f"{DB_MANAGER_URL}/query", json={
        "action": "find",
        "table": "ai_quiz_questions",
        "filters": {"quiz_id": quiz["id"]}
    })

    questions = questions_res.json().get("data", [])

    # Parse distractors for each question
    for q in questions:
        if isinstance(q.get("distractors"), str):
            q["distractors"] = json.loads(q["distractors"])

    quiz["questions"] = questions
    return quiz


@app.post("/ai-quizzes", status_code=201)
async def create_quiz(quiz_data: AIQuizBase):
    """Creates the quiz header for a class."""
    payload = {
        "action": "insert",
        "table": "ai_quizzes",
        "data": {
            "class_id": quiz_data.class_id,
            "attempts": json.dumps([])
        }
    }
    return requests.post(f"{DB_MANAGER_URL}/query", json=payload).json()


@app.post("/ai-quiz/question")
async def save_quiz_question(data: dict):
    try:
        quiz_id = data.get("quiz_id")

        if quiz_id is None:
            raise HTTPException(status_code=400, detail="Missing quiz_id in request")

        distractors = data.get("distractors", [])

        # שינוי כאן: הסרנו את class_id כי הוא לא קיים בטבלת השאלות ב-DB
        clean_data = {
            "quiz_id": int(quiz_id),
            "question_text": data.get("question_text"),
            "correct_answer": data.get("correct_answer"),
            "explanation": data.get("explanation"),
            "distractors": json.dumps(distractors)
        }

        question_id = data.get("id")
        action = "update" if question_id else "insert"
        filters = {"id": question_id} if question_id else {}

        payload = {
            "action": action,
            "table": "ai_quiz_questions",
            "data": clean_data,
            "filters": filters
        }

        res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        return res.json()
    except Exception as e:
        print(f"Error in save_quiz_question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai-quizzes/{quiz_id}/attempt")
async def submit_quiz_attempt(quiz_id: int, attempt: AIQuizAttempt):
    """
    Appends a new score attempt to the quiz history (JSONB).
    """
    # 1. Get current quiz to read existing attempts
    quiz_res = requests.post(f"{DB_MANAGER_URL}/query", json={
        "action": "find",
        "table": "ai_quizzes",
        "filters": {"id": quiz_id}
    }).json()

    if not quiz_res.get("data"):
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz = quiz_res["data"][0]

    # 2. Parse existing attempts
    attempts = quiz.get("attempts", [])
    if isinstance(attempts, str):
        attempts = json.loads(attempts)

    # 3. Append new attempt
    attempts.append(attempt.dict())

    # 4. Update DB
    update_payload = {
        "action": "update",
        "table": "ai_quizzes",
        "data": {"attempts": json.dumps(attempts)},
        "filters": {"id": quiz_id}
    }

    return requests.post(f"{DB_MANAGER_URL}/query", json=update_payload).json()


@app.post("/ai-quizzes/{quiz_id}/attempt")
async def submit_quiz_attempt(quiz_id: int, attempt: AIQuizAttempt):
    """
    Appends a new score attempt to the quiz history (JSONB).
    """
    # 1. Get current quiz to read existing attempts
    quiz_res = requests.post(f"{DB_MANAGER_URL}/query", json={
        "action": "find",
        "table": "ai_quizzes",
        "filters": {"id": quiz_id}
    }).json()

    if not quiz_res.get("data"):
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz = quiz_res["data"][0]

    # 2. Parse existing attempts
    attempts = quiz.get("attempts", [])
    if isinstance(attempts, str):
        attempts = json.loads(attempts)

    # 3. Append new attempt
    attempts.append(attempt.dict())

    # 4. Update DB
    update_payload = {
        "action": "update",
        "table": "ai_quizzes",
        "data": {"attempts": json.dumps(attempts)},
        "filters": {"id": quiz_id}
    }

    return requests.post(f"{DB_MANAGER_URL}/query", json=update_payload).json()


@app.delete("/ai-quizzes/{quiz_id}")
async def delete_quiz(quiz_id: int):
    """Deletes the entire quiz and its questions via Cascade."""
    payload = {
        "action": "delete",
        "table": "ai_quizzes",
        "filters": {"id": quiz_id}
    }
    return requests.post(f"{DB_MANAGER_URL}/query", json=payload).json()


@app.post("/ai-quiz/question/{question_id}/stats")
async def update_question_stats(question_id: int, data: dict):
    try:
        is_correct = data.get("is_correct")
        res = requests.post(f"{DB_MANAGER_URL}/query", json={
            "action": "find",
            "table": "ai_quiz_questions",
            "filters": {"id": question_id}
        }).json()

        if not res.get("data"):
            raise HTTPException(status_code=404, detail="Question not found")

        question = res["data"][0]

        column = "correct_count" if is_correct else "wrong_count"
        current_val = question.get(column, 0) or 0

        update_payload = {
            "action": "update",
            "table": "ai_quiz_questions",
            "data": {column: current_val + 1},
            "filters": {"id": question_id}
        }

        return requests.post(f"{DB_MANAGER_URL}/query", json=update_payload).json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/ai-quiz/question/{question_id}")
async def delete_quiz_question(question_id: int):
    try:
        payload = {
            "action": "delete",
            "table": "ai_quiz_questions",
            "filters": {"id": question_id}
        }
        res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        return res.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


templates = Jinja2Templates(directory="templates")

@app.get("/classes/{class_id}/export")
async def export_lesson(request: Request, class_id: int):
    try:
        # 1. Fetch Class and Course metadata
        class_query = requests.post(f"{DB_MANAGER_URL}/query", json={
            "action": "find",
            "table": "classes",
            "filters": {"id": class_id}
        }).json()

        if not class_query.get("data"):
            raise HTTPException(status_code=404, detail="Class not found")

        class_info = class_query["data"][0]

        course_query = requests.post(f"{DB_MANAGER_URL}/query", json={
            "action": "find",
            "table": "courses",
            "filters": {"id": class_info["course_id"]}
        }).json()

        course_info = course_query["data"][0] if course_query.get("data") else {"name": "Unknown Course"}

        # 2. Fetch Summaries
        summary_res = requests.post(f"{DB_MANAGER_URL}/query", json={
            "action": "find",
            "table": "ai_summaries",
            "filters": {"class_id": class_id}
        }).json()

        raw_parts = summary_res.get("data", [])

        # Helper to normalize IDs (Fix for 'unhashable dict' error)
        def get_safe_id(val):
            if isinstance(val, dict):
                return val.get("id")
            return val

        # 3. Data Normalization
        clean_parts = []
        for p in raw_parts:
            clean_parts.append({
                **p,
                "id": get_safe_id(p.get("id")),
                "parent_id": get_safe_id(p.get("parent_id"))
            })

        # 4. Hierarchical Sorting (DFS)
        children_map = {}
        for part in clean_parts:
            pid = part["parent_id"]
            if pid not in children_map:
                children_map[pid] = []
            children_map[pid].append(part)

        # Sort siblings by order_index
        for pid in children_map:
            children_map[pid].sort(key=lambda x: x.get("order_index", 0))

        ordered_parts = []
        def traverse(current_pid):
            for child in children_map.get(current_pid, []):
                ordered_parts.append(child)
                traverse(child["id"])

        # Execute DFS starting from roots (handles None, 0, or "0")
        traverse(None)
        if not ordered_parts:
            for root_key in [0, "0", "null"]:
                if root_key in children_map:
                    traverse(root_key)
                    break

        # 5. Build Markdown content
        full_summary_md = ""
        for part in ordered_parts:
            title = part.get("title", "Untitled")
            content = part.get("content", "")
            # Use ### for sub-topics, ## for root topics
            level = "###" if part.get("parent_id") else "##"

            visual_data = part.get("visual", {"type": "none", "value": ""})
            if isinstance(visual_data, str):
                try:
                    visual_data = json.loads(visual_data)
                except:
                    visual_data = {"type": "none", "value": ""}

            visual_html = ""
            if visual_data.get("type") == "code" and visual_data.get("value"):
                visual_html = f"\n\n```javascript\n{visual_data['value']}\n```\n\n"

            full_summary_md += f"{level} {title}\n\n{content}{visual_html}\n\n---\n\n"

        if not ordered_parts:
            full_summary_md = "No summary content available for this class."

        # 6. Fetch Quiz and Questions
        quiz_res = requests.post(f"{DB_MANAGER_URL}/query", json={
            "action": "find",
            "table": "ai_quizzes",
            "filters": {"class_id": class_id}
        }).json()

        questions = []
        if quiz_res.get("data"):
            quiz_obj = quiz_res["data"][0]
            quiz_id = get_safe_id(quiz_obj.get("id"))

            q_res = requests.post(f"{DB_MANAGER_URL}/query", json={
                "action": "find",
                "table": "ai_quiz_questions",
                "filters": {"quiz_id": quiz_id}
            }).json()
            questions = q_res.get("data", [])
            for q in questions:
                if isinstance(q.get("distractors"), str):
                    q["distractors"] = json.loads(q["distractors"])

        # 7. Prepare Filename and Context
        course_name_raw = course_info.get('name', 'Course')
        class_date_raw = class_info.get('date_taken', 'NoDate')
        filename = f"{course_name_raw.replace(' ', '_')}_{class_date_raw.replace('/', '-')}.html"
        encoded_filename = urllib.parse.quote(filename)

        context = {
            "request": request,
            "course_name": course_name_raw,
            "class_name": class_info.get('name') or f"Class #{class_info.get('number')}",
            "class_date": class_date_raw,
            "summary_content": full_summary_md,
            "quiz_json": json.dumps(questions)
        }

        # 8. Final Response (Fixed signature for Starlette/FastAPI consistency)
        return templates.TemplateResponse(
            request=request,
            name="export_template.html",
            context=context,
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
        )

    except Exception as e:
        import traceback
        print(f"EXPORT CRITICAL ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
