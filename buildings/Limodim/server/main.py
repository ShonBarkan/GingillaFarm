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
from fastapi import UploadFile, File
from datetime import datetime, timedelta, date
from apscheduler.schedulers.asyncio import AsyncIOScheduler

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
    class_type: Optional[str] = "Lecture"
    zoom_link: Optional[str] = None


class AISubject(BaseModel):
    title: str
    description: str  # Supports Markdown & LaTeX (e.g. $ \alpha \cap \beta $)
    sub_topics: Optional[List['AISubject']] = []  # Hierarchical tree structure


class AIQuizQuestion(BaseModel):
    question: str
    question_type: str = "multiple_choice"  # e.g., "multiple_choice", "boolean", "open"
    correct_answer: str
    distractors: List[str]  # Wrong answers
    explanation: Optional[str] = None  # Why this is the right answer
    mapped_topic: Optional[str] = None  # Links to an AISubject title


class AIQuizAttempt(BaseModel):
    attempt_date: str  # ISO format date
    score: float
    total_questions: int


class AIQuiz(BaseModel):
    questions: List[AIQuizQuestion] = []
    history: List[AIQuizAttempt] = []  # Track results over time


class ClassBase(BaseModel):
    course_id: int
    name: str
    date_taken: Optional[str] = None
    number: int
    birvouz: Optional[str] = None
    summary: Optional[List[str]] = []
    location_room: Optional[str] = None
    time: Optional[str] = None
    class_type: Optional[str] = "Lecture"
    # New AI Fields
    ai_summary: Optional[List[AISubject]] = []
    ai_quiz: Optional[AIQuiz] = None

    # This ensures that JSON strings from the DB are parsed into objects/lists
    @field_validator('summary', 'ai_summary', 'ai_quiz', mode='before')
    @classmethod
    def ensure_json_parsed(cls, v):
        if isinstance(v, str) and v.strip():
            try:
                return json.loads(v)
            except:
                return v
        return v or ([] if cls is not AIQuiz else {"questions": [], "history": []})


AISubject.model_rebuild()


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
            "ai_summary": "JSONB DEFAULT '[]'::jsonb",
            "ai_quiz": "JSONB DEFAULT '{\"questions\": [], \"history\": []}'::jsonb",
            "location_building": "TEXT",
            "location_room": "TEXT",
            "time": "TEXT",
            "class_type": "TEXT"
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
            "file_name": "TEXT NOT NULL",  # Unique name stored on disk
            "original_name": "TEXT NOT NULL",  # Original name for display
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

                            class_type = entry.get("class_type", "Lecture")
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
    """Update an existing class entry including AI summary and quiz data."""

    # Convert Pydantic model to a dictionary
    # Nested models (AISubject, AIQuiz) will be converted to nested dicts/lists
    data = class_data.dict()

    # 1. Handle date conversion if date_taken exists
    if data.get("date_taken"):
        # Ensure it's stored as a string if it came as a date object
        if isinstance(data["date_taken"], (date, datetime)):
            data["date_taken"] = data["date_taken"].isoformat()

    # 2. CRITICAL: Convert all JSONB fields to JSON strings for DB storage
    # This ensures the DB Manager receives a valid JSON string for Postgres JSONB columns
    json_fields = ["summary", "ai_summary", "ai_quiz"]

    for field in json_fields:
        if field in data and data[field] is not None:
            # We only stringify if it's currently a list or a dict
            if isinstance(data[field], (list, dict)):
                data[field] = json.dumps(data[field])

    # 3. Prepare the payload for the DB Manager
    payload = {
        "action": "update",
        "table": "classes",
        "data": data,
        "filters": {"id": class_id}
    }

    try:
        response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)

        if response.status_code == 200:
            return response.json()

        # If DB Manager returned an error (e.g., 400, 500)
        raise HTTPException(
            status_code=response.status_code,
            detail=f"DB Manager Error: {response.text}"
        )

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="CRITICAL: Could not connect to DB Manager"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal Server Error: {str(e)}"
        )


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

    course_list = fetch_from_db("courses", {"id": course_id})
    if not course_list:
        raise HTTPException(status_code=404, detail="Course not found")

    full_data = {
        "course": course_list[0],
        "classes": fetch_from_db("classes", {"course_id": course_id}),
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

        # Get current date and time
        now = datetime.now()
        today = now.date()
        current_time_str = now.strftime("%H:%M")

        day_map = {"שני": 0, "שלישי": 1, "רביעי": 2, "חמישי": 3, "שישי": 4, "שבת": 5, "ראשון": 6}
        future_timeline = []

        for course in courses:
            schedule = course.get("schedule")
            start_date_str = course.get("start_date")
            end_date_str = course.get("end_date")

            if not schedule or not start_date_str or not end_date_str:
                continue

            try:
                course_start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                course_end = datetime.strptime(end_date_str, "%Y-%m-%d").date()

                if isinstance(schedule, str):
                    schedule = json.loads(schedule)
            except:
                continue

            for i in range(0, 15):
                check_date = today + timedelta(days=i)

                if not (course_start <= check_date <= course_end):
                    continue

                day_num = check_date.weekday()
                current_day_name = next((name for name, val in day_map.items() if val == day_num), None)

                for slot in schedule:
                    if slot.get("day_of_week", "").strip() == current_day_name:

                        # Fix: If checking for today, skip classes that have already ended
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
                            "class_type": slot.get("class_type", "Lecture"),
                            "location": f"{slot.get('location_building', '')}/{slot.get('location_room', '')}",
                            "zoom_link": slot.get("zoom_link")
                        })

        future_timeline.sort(key=lambda x: (x["date"], x["time"]))
        return future_timeline[:6]

    except Exception as e:
        print(f"Error in future-classes: {e}")
        return []


@app.get("/timeline/past-classes")
async def get_past_classes():
    try:
        payload_courses = {"action": "find", "table": "courses", "filters": {}}
        payload_performed = {"action": "find", "table": "classes", "filters": {}}

        courses_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_courses)
        performed_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_performed)

        if courses_res.status_code != 200 or performed_res.status_code != 200:
            return []

        courses_list = courses_res.json().get("data", [])
        all_performed = performed_res.json().get("data", [])

        course_map = {str(c["id"]): c["name"] for c in courses_list}

        incomplete_classes = []

        for c in all_performed:
            def parse_field(field):
                if not field: return None
                if isinstance(field, str):
                    try:
                        return json.loads(field)
                    except:
                        return None
                return field

            birvouz = c.get("birvouz")
            summary = parse_field(c.get("summary"))
            ai_summary = parse_field(c.get("ai_summary"))
            ai_quiz = parse_field(c.get("ai_quiz"))

            is_missing_birvouz = not birvouz or str(birvouz).strip() == ""
            is_missing_summary = not summary or len(summary) == 0
            is_missing_ai_summary = not ai_summary or len(ai_summary) == 0

            is_missing_ai_quiz = (
                    not ai_quiz or
                    not isinstance(ai_quiz, dict) or
                    not ai_quiz.get("questions") or
                    len(ai_quiz.get("questions")) == 0
            )

            if is_missing_birvouz or is_missing_summary or is_missing_ai_summary or is_missing_ai_quiz:
                incomplete_classes.append({
                    "id": c.get("id"),
                    "course_id": c.get("course_id"),
                    "course_name": course_map.get(str(c.get("course_id")), "Unknown Course"),
                    "class_name": c.get("name"),
                    "date": c.get("date_taken"),
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
        # 1. Fetch all reception hours from their own table
        payload_rh = {"action": "find", "table": "reception_hours", "filters": {}}
        rh_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_rh)

        # 2. Fetch courses to get course names
        payload_courses = {"action": "find", "table": "courses", "filters": {}}
        courses_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_courses)

        if rh_res.status_code != 200 or courses_res.status_code != 200:
            print(f"DB Error: RH {rh_res.status_code}, Courses {courses_res.status_code}")
            return []

        # Parse data safely
        rh_data = rh_res.json().get("data", [])
        courses_list = courses_res.json().get("data", [])

        # Create a mapping for course names {id: name}
        course_map = {c['id']: c['name'] for c in courses_list}

        today = datetime.now().date()
        rev_day_map = {
            0: "שני", 1: "שלישי", 2: "רביעי", 3: "חמישי", 4: "שישי", 5: "שבת", 6: "ראשון"
        }

        reception_timeline = []

        # 3. Process the results
        for i in range(0, 11):
            check_date = today + timedelta(days=i)
            current_day_name = rev_day_map.get(check_date.weekday())

            for slot in rh_data:
                # Clean day string
                db_day = str(slot.get("day", "")).replace("יום", "").strip()

                if db_day == current_day_name:
                    reception_timeline.append({
                        "course_id": slot.get("course_id"),
                        "course_name": course_map.get(slot.get("course_id"), "Unknown"),
                        "staff_name": slot.get("name", "Staff"),
                        "date": str(check_date),
                        "day": current_day_name,
                        "time": slot.get("time", "00:00"),
                        "location": f"{slot.get('location_building', '')}/{slot.get('location_room', '')}"
                    })

        # 4. Sort and return
        reception_timeline.sort(key=lambda x: (x["date"], x["time"]))

        return reception_timeline[:5]

    except Exception as e:
        print(f"Critical Error in reception-hours: {e}")
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


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
