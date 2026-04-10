import requests
import os
import json
from datetime import datetime

BASE_URL = os.getenv("MITAMNIM_API_URL", "http://localhost:8001")


def get_id_map(endpoint):
    """מחזיר מפה של שם -> ID עבור טבלה מסוימת"""
    try:
        res = requests.get(f"{BASE_URL}{endpoint}")
        data = res.json()
        items = data.get("data", data) if isinstance(data, dict) else data
        return {item['name']: item['id'] for item in items if 'name' in item and 'id' in item}
    except:
        return {}


def run_seed():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    mocks_path = os.path.join(script_dir, 'mocks.json')
    with open(mocks_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("🚀 Starting Extended Smart Seeding...")

    # --- 1. Parameters ---
    for p in data['parameters']:
        requests.post(f"{BASE_URL}/parameters/", json=p)
    param_map = get_id_map("/parameters/")
    print(f"✅ Parameters Loaded.")

    # --- 2. Exercise Tree ---
    for level in data['hierarchy']:
        exercise_map = get_id_map("/exercises/")
        for node in level['nodes']:
            parent_id = exercise_map.get(node.get("parent"))
            req_params = [{"parameter_id": param_map[p], "priority_index": i}
                          for i, p in enumerate(node.get("params", [])) if p in param_map]

            requests.post(f"{BASE_URL}/exercises/", json={
                "name": node['name'], "parent_id": parent_id, "required_params": req_params
            })

    # רענון מפת התרגילים לאחר הבנייה
    exercise_map = get_id_map("/exercises/")
    print(f"✅ Exercise Tree Built.")

    # --- 3. Training Assets ---
    print("🎬 Seeding Training Assets...")
    for asset in data.get("assets", []):
        ex_id = exercise_map.get(asset['exercise_name'])
        if ex_id:
            requests.post(f"{BASE_URL}/assets/admin/import", json=[{  # נניח שיש אנדפוינט אימפורט
                "exercise_id": ex_id,
                "asset_type": asset['asset_type'],
                "url": asset['url'],
                "title": asset['title'],
                "tags": asset['tags']
            }])

    # --- 4. Goals ---
    print("🎯 Seeding Goals...")
    for goal in data.get("goals", []):
        ex_id = exercise_map.get(goal['exercise_name'])
        if ex_id:
            requests.post(f"{BASE_URL}/goals/", json={
                "exercise_id": ex_id,
                "goal_type": goal['goal_type'],
                "target_value": goal['target_value']
            })

    # --- 5. Workout Templates ---
    print("📝 Seeding Workout Templates...")
    for t in data.get("templates", []):
        # בניית ה-Config של התרגילים בתוך השבלונה
        ex_config = []
        for ex_item in t['exercises']:
            eid = exercise_map.get(ex_item['name'])
            if eid:
                ex_config.append({"exercise_id": eid, "exercise_name": ex_item['name'], "sets": ex_item['sets']})

        # בניית פרמטרים של סשן (כמו עצימות)
        sess_params = [{"parameter_id": param_map[p], "priority_index": i}
                       for i, p in enumerate(t['session_params']) if p in param_map]

        requests.post(f"{BASE_URL}/workouts/templates", json={
            "name": t['name'],
            "description": t['description'],
            "parent_exercise_id": exercise_map.get(t['parent_category']),
            "exercises_config": ex_config,
            "session_required_params": sess_params
        })

    # --- 6. Workout Sessions & Activity Logs (הדמיית אימון אחד שבוצע) ---
    print("🏃 Seeding an Active Session & Logs...")
    # נביא את השבלונה שיצרנו הרגע
    templates_res = requests.get(f"{BASE_URL}/workouts/templates")
    templates = templates_res.json().get("data", [])
    if templates:
        target_template = templates[0]
        # יצירת סשן
        session_res = requests.post(f"{BASE_URL}/workouts/sessions", json={
            "template_id": target_template['id'],
            "start_time": datetime.now().isoformat(),
            "notes": "אימון מוק ראשון"
        })
        session_id = session_res.json().get("id")

        if session_id:
            # הוספת לוג של תרגיל לתוך הסשן
            for act in data.get("activities_mock", []):
                ex_id = exercise_map.get(act['exercise_name'])
                if ex_id:
                    requests.post(f"{BASE_URL}/activities/", json={
                        "exercise_id": ex_id,
                        "workout_session_id": session_id,
                        "performance_data": act['performance_data'],
                        "is_manual": act['is_manual']
                    })

    print("\n✨ All tables seeded with at least one row of mock data!")


if __name__ == "__main__":
    run_seed()