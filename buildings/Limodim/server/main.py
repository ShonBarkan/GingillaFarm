import json
import os
import urllib
from datetime import datetime, timedelta
import uvicorn
import requests
from datetime import date
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import shutil
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File

app = FastAPI(title="Limodim - Academic Management")

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

    @field_validator('summary', mode='before')
    @classmethod
    def ensure_list(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        if v is None:
            return []
        return v


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


class ReceptionHourBase(BaseModel):
    course_id: int  # Required
    name: str  # Required
    day: Optional[str] = None
    time: Optional[str] = None
    location_building: Optional[str] = None
    location_room: Optional[str] = None


class ExamsBase(BaseModel):
    course_id: int  # Required
    name: str  # Required
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
        "homeworks": {
            "id": "SERIAL PRIMARY KEY",
            "course_id": "INTEGER REFERENCES courses(id)",
            "name": "TEXT",
            "due_date": "TEXT",
            "grade": "FLOAT",
            "link_to": "TEXT"
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


# --- API Endpoints ---

@app.on_event("startup")
async def startup_event():
    init_db_tables()


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
    """Update an existing class entry."""
    data = class_data.dict()

    # 1. Handle date conversion if exists
    if data.get("date"):
        data["date"] = data["date"].isoformat()

    # 2. CRITICAL: Convert summary list to JSON string for DB storage
    # This prevents the "Input should be a valid list" or "must be str, not list" errors
    if "summary" in data and isinstance(data["summary"], list):
        data["summary"] = json.dumps(data["summary"])

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
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="DB Manager unreachable")


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
# --- timeline Endpoints ---
@app.get("/timeline")
async def get_timeline():
    try:
        payload_courses = {"action": "find", "table": "courses", "filters": {}}
        payload_classes = {"action": "find", "table": "classes", "filters": {}}

        courses_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_courses)
        classes_res = requests.post(f"{DB_MANAGER_URL}/query", json=payload_classes)

        if courses_res.status_code != 200 or classes_res.status_code != 200:
            return {"past": [], "future": []}

        courses_data = courses_res.json()
        classes_data = classes_res.json()

        courses = courses_data.get("data", []) if isinstance(courses_data, dict) else courses_data
        all_performed = classes_data.get("data", []) if isinstance(classes_data, dict) else classes_data

    except Exception as e:
        return {"past": [], "future": []}

    today = datetime.now().date()
    # Map Hebrew days to Python weekday index (0=Mon, 6=Sun)
    day_map = {"שני": 0, "שלישי": 1, "רביעי": 2, "חמישי": 3, "שישי": 4, "שבת": 5, "ראשון": 6}
    full_timeline = []

    for course in courses:
        schedule = course.get("schedule")

        # Parse schedule if it's stored as a JSON string
        if isinstance(schedule, str):
            try:
                schedule = json.loads(schedule)
            except:
                continue

        if not schedule or not isinstance(schedule, list):
            continue

        # Check window: 14 days back and 14 days forward
        for i in range(-14, 15):
            check_date = today + timedelta(days=i)
            day_num = check_date.weekday()

            # Find the Hebrew day name matching the date
            current_day_name = next((name for name, val in day_map.items() if val == day_num), None)

            for slot in schedule:
                # Use strip() to ensure no trailing spaces break the match
                if slot.get("day_of_week", "").strip() == current_day_name:
                    # Check if a class record exists for this specific date
                    is_performed = any(
                        str(c.get("course_id")) == str(course.get("id")) and
                        str(c.get("date_taken")) == str(check_date)
                        for c in all_performed
                    )

                    full_timeline.append({
                        "course_id": course["id"],
                        "course_name": course["name"],
                        "date": str(check_date),
                        "day": current_day_name,
                        "time": slot.get("start_time", "00:00"),
                        "is_performed": is_performed,
                        "class_type": slot.get("class_type", "Lecture"),
                        "location": f"{slot.get('location_building', '')}/{slot.get('location_room', '')}",
                        "zoom_link": slot.get("zoom_link")  # <--- הוספת השדה החדש כאן
                    })

    # Sort all events by date and then by time
    full_timeline.sort(key=lambda x: (x["date"], x["time"]))

    # Slice the results
    past = [t for t in full_timeline if t["date"] < str(today)][-6:]
    future = [t for t in full_timeline if t["date"] >= str(today)][:6]

    return {"past": past, "future": future}


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
