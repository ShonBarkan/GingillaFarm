# 🦉 The Owl's Perch (AI Service)

### 📜 Farm Lore
Every farm has secrets that only the wind and the owls understand. The Owl's Perch is where the farm's data is turned into wisdom. Other buildings send their scrolls (prompts) to the Owl, and it returns with prophecies—sometimes as a story (String) and sometimes as a structured harvest map (JSON). For every word it speaks, it leaves a feather (Token) in the Silo so the Farmer knows the cost of wisdom.

---

### 🛠 Technical Specification
**Engine:** Gemini 1.5 Pro
**Features:**
* **Hybrid Output:** Supports plain text or structured JSON schemas.
* **Token Reporting:** Automatically calculates and sends usage metrics to the DB Manager.
* **Stateless/Stateful:** Can handle single prompts or maintain a "thread" of conversation.