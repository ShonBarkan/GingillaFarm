import requests

DB_MANAGER_URL = "http://shon-comp:8000"


def clean_farm_data():
    # רשימת הטבלאות לפי סדר התלויות (מהסוף להתחלה)
    tables = [
        "syllabus_topics",
        "exams",
        "reception_hours",
        "homeworks",
        "classes",
        "courses"
    ]

    print("--- Cleaning all rows from Gingilla Farm ---")

    for table in tables:
        # פעולת delete עם פילטר ריק אמורה למחוק את כל השורות
        payload = {
            "action": "delete",
            "table": table,
            "filters": {}
        }

        try:
            res = requests.post(f"{DB_MANAGER_URL}/query", json=payload)
            if res.status_code == 200:
                print(f"Cleared all data from: {table}")
            else:
                print(f"Failed to clear {table}: {res.text}")
        except Exception as e:
            print(f"Error: {e}")

    print("--- Cleanup Attempt Finished ---")


if __name__ == "__main__":
    clean_farm_data()