import requests
import json
from datetime import date

BASE_URL = "http://shon-comp:8002"


def seed_farm():
    print("--- Starting Gingilla Farm Seeding ---")

    course_mock = {
    "name": "מבוא לחקלאות",
    "degree_points": 3.5,
    "lecturer": "דר שלולית",
    "practitioner": "מר טפטפת",
    "final_grade": 100,
    "semester": 1,
    "link_to": "https://moodle.gingilla-farm.edu/course/view.php?id=101",
    "start_date": "2026-03-01",
    "end_date": "2026-06-30",
    "schedule": [
        {
            "day_of_week": "ראשון",
            "start_time": "10:00",
            "end_time": "12:00",
            "location_building": "חממה 4",
            "location_room": "1",
            "class_type": "Lecture"
        },
        {
            "day_of_week": "שלישי",
            "start_time": "14:00",
            "end_time": "16:00",
            "location_building": "חממה 5",
            "location_room": "12",
            "class_type": "Tutorial"
        }
    ]
}

    # 1. Create Course
    res = requests.post(f"{BASE_URL}/courses", json=course_mock)
    response_data = res.json()

    # Check multiple possible locations for the ID based on your server response
    course_id = None
    if "id" in response_data:
        course_id = response_data["id"]
    elif "data" in response_data and isinstance(response_data["data"], dict):
        course_id = response_data["data"].get("id")
    elif "data" in response_data and isinstance(response_data["data"], list):
        course_id = response_data["data"][0].get("id")

    if not course_id:
        print(f"FAILED: Could not get course ID. Response was: {response_data}")
        return

    print(f"Successfully planted course (ID: {course_id})")

    # 2. Mock Syllabus Data
    syllabus_mocks = [
        {
            "course_id": course_id,
            "topic_num": 1,
            "topic": "Processes and Threads",
            "introduction": "Exploring the core of multitasking: how OS manages concurrent execution."
        },
        {
            "course_id": course_id,
            "topic_num": 2,
            "topic": "Memory Management",
            "introduction": "Virtual memory, paging, and segmentation—keeping data organized and safe."
        },
        {
            "course_id": course_id,
            "topic_num": 3,
            "topic": "File Systems",
            "introduction": "How persistent data is structured on disks and managed via inodes."
        }
    ]

    # 3. Mock Exams Data
    exam_mocks = [
        {
            "course_id": course_id,
            "name": "בוחן אמצע - תהליכים",
            "percentage": 15.0,
            "grade": 85  # Example grade already received
        },
        {
            "course_id": course_id,
            "name": "מטלת סיום - בניית קרנל",
            "percentage": 35.0,
            "grade": 92
        },
        {
            "course_id": course_id,
            "name": "מבחן סופי",
            "percentage": 50.0,
            "grade": None  # Exam hasn't happened yet
        }
    ]

    # 4. Mock Reception Hours Data
    reception_mocks = [
        {
            "course_id": course_id,
            "name": "שעת קבלה מתרגל",
            "day": "רביעי",
            "time": "16:00",
            "location_building": "בניין 32",
            "location_room": "חדר 204"
        },
        {
            "course_id": course_id,
            "name": "שעת קבלה מרצה",
            "day": "שני",
            "time": "11:00",
            "location_building": "בניין 60",
            "location_room": "חדר 402"
        }
    ]

    # 5. Mock Homework Data
    homework_mocks = [
        {
            "course_id": course_id,
            "due_date": "2026-03-25",
            "grade": 100.0,
            "link_to": "https://github.com/gingilla/os-hw1"
        },
        {
            "course_id": course_id,
            "due_date": "2026-04-15",
            "grade": None,
            "link_to": "https://github.com/gingilla/os-hw2"
        },
        {
            "course_id": course_id,
            "due_date": "2026-05-01",
            "grade": None,
            "link_to": "https://github.com/gingilla/os-hw3"
        }
    ]

    # 6. Mock Performed Classes (History)
    class_history_mocks = [
        {
            "course_id": course_id,
            "date_taken": "2026-03-02",
            "number": 1,
            "birvouz": "הקדמה למערכות הפעלה - עבר חלק",
            "location_building": "32",
            "location_room": "1",
            "time": "12:00",
        },
        {
            "course_id": course_id,
            "date_taken": "2026-03-05",
            "number": 2,
            "birvouz": "דיברנו על תהליכים וחוטים. המרצה היה קצת מהיר מדי.",
            "location_building": "32",
            "location_room": "1",
            "time": "10:00",
            "class_type": "Lecture"
        },
        {
            "course_id": course_id,
            "date_taken": "2026-03-09",
            "number": 3,
            "birvouz": "ניהול זיכרון ו-Paging. נושא קשה, צריך לחזור על המצגת.",
            "location_building": "32",
            "location_room": "1",
            "time": "12:00",
            "class_type": "Lecture"

        },
        {
            "course_id": course_id,
            "date_taken": "2026-03-12",
            "number": 4,
            "birvouz": "תרגול מעשי על זיכרון וירטואלי במעבדה.",
            "location_building": "32",
            "location_room": "מעבדה 10",
            "time": "10:00",
            "class_type": ",תרגול"
        }
    ]

    table_actions = [
        ("syllabus", syllabus_mocks),
        ("exams", exam_mocks),
        ("reception-hours", reception_mocks),
        ("homeworks", homework_mocks),
        ("classes", class_history_mocks)
    ]

    for endpoint, mocks in table_actions:
        print(f"Injecting {endpoint}...")
        for mock in mocks:
            r = requests.post(f"{BASE_URL}/{endpoint}", json=mock)
            if r.status_code not in [200, 201]:
                print(f"Error in {endpoint}: {r.text}")
            else:
                print(f"Success in {endpoint}")

    print("\n--- Seeding Complete! ---")


if __name__ == "__main__":
    seed_farm()


