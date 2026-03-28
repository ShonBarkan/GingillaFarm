import schedule
import time
import random
import subprocess

messages_pool = [
    "בוקר טוב מהחווה! הכל רץ כשורה.",
    "אל תשכח לבדוק את ה-Jellyfin היום.",
    "השרת של GingillaFarm מוסר דרישת שלום.",
    "הודעה יומית רנדומלית: המערכת יציבה.",
    "יום מוצלח! ה-Docker Compose שלך עובד קשה.",
    "שתה מים, השרתים דואגים לעצמם.",
    "בדיקת דופק יומית... הכל תקין!",
    "עדכון מהחווה: אין תקלות מיוחדות.",
    "הודעה מספר 9: שיהיה יום פרודוקטיבי.",
    "אל תשכח לגבות את הנתונים החשובים.",
    "ה-Tailscale מחובר והכל נגיש.",
    "GingillaFarm status: Optimal.",
    "עוד יום, עוד שירות ב-Docker.",
    "הודעה אקראית מהבוט שלך!",
    "מצב ה-WatchDogs: תקין.",
    "זמן טוב לבדוק עדכוני לינוקס.",
    "החווה גדלה, והקוד רץ.",
    "Keep calm and deploy containers.",
    "הודעה יומית - הכל ירוק ב-Dashboard.",
    "סוף הודעה רנדומלית. נתראה מחר!"
]


def send_whatsapp():
    selected_message = random.choice(messages_pool)

    cmd = ["npx", "mudslide", "send", "me", selected_message]

    try:
        subprocess.run(cmd, check=True,shell=True)
        print(f"Sent: {selected_message}")
    except subprocess.CalledProcessError as e:
        print(f"Error sending message: {e}")


schedule.every().day.at("09:00").do(send_whatsapp)

print("Gingilla Bot is running...")
send_whatsapp()
while True:
    schedule.run_pending()
    time.sleep(60)