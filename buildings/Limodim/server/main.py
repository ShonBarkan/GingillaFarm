import json
import os
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
    allow_origins=["http://shon-comp:3100","http://localhost:3100", "http://localhost:5173"],
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


class ClassBase(BaseModel):
    course_id: int  # Required
    date_taken: Optional[str] = None
    number: int  # Required
    birvouz: Optional[str] = None
    summary: Optional[str] = None
    location_building: Optional[str] = None
    location_room: Optional[str] = None
    time: Optional[str] = None
    class_type: Optional[str] = "Lecture"


class ClassFileBase(BaseModel):
    class_id: int
    file_name: str
    original_name: str
    upload_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class HomeworkBase(BaseModel):
    course_id: int  # Required
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

from pydantic import BaseModel, field_validator # Import field_validator

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
            "date_taken": "TEXT",
            "number": "INTEGER",
            "birvouz": "TEXT",
            "summary": "TEXT",
            "location_building": "TEXT",
            "location_room": "TEXT",
            "time": "TEXT",
            "class_type": "TEXT"
        },
        "homeworks": {
            "id": "SERIAL PRIMARY KEY",
            "course_id": "INTEGER REFERENCES courses(id)",
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
    if data.get("date"):
        data["date"] = data["date"].isoformat()

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
                        "location": f"{slot.get('location_building', '')}/{slot.get('location_room', '')}"
                    })

    # Sort all events by date and then by time
    full_timeline.sort(key=lambda x: (x["date"], x["time"]))

    # Slice the results
    past = [t for t in full_timeline if t["date"] < str(today)][-5:]
    future = [t for t in full_timeline if t["date"] >= str(today)][:5]

    return {"past": past, "future": future}

# --- Files Endpoints ---

@app.post("/upload-pdf/{class_id}", response_model=ClassFileBase)
async def upload_pdf(class_id: int, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    # Create unique filename to prevent overwriting
    timestamp = int(datetime.now().timestamp())
    unique_name = f"cls_{class_id}_{timestamp}_{file.filename}"

    # Use os.path.join for OS-independent path construction
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save physical file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Register in database
    payload = {
        "action": "insert",
        "table": "class_files",
        "data": {
            "class_id": class_id,
            "file_name": unique_name,
            "original_name": file.filename
        }
    }

    try:
        requests.post(f"{DB_MANAGER_URL}/query", json=payload)
        return {"status": "success", "file_name": unique_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/class-files/{class_id}", response_model=List[ClassFileBase])
async def get_class_files(class_id: int):
    payload = {
        "action": "find",
        "table": "class_files",
        "filters": {"class_id": class_id}
    }
    response = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
    return response.json()


@app.delete("/delete-pdf/{class_id}/{file_name}")
async def delete_pdf(class_id: int, file_name: str):
    file_path = os.path.join(UPLOAD_DIR, file_name)

    # 1. Remove from disk if exists
    if os.path.exists(file_path):
        os.remove(file_path)

    # 2. Remove from database
    payload = {
        "action": "delete",
        "table": "class_files",
        "filters": {"class_id": class_id, "file_name": file_name}
    }
    requests.post(f"{DB_MANAGER_URL}/query", json=payload)

    return {"status": "deleted"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
