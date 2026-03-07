# 🌾 The Great Silo (DB Manager)

### 📜 Farm Lore
Every farm needs a place to keep its harvest safe from the winter and the crows. The Great Silo is the most reinforced structure in Gingilla Farm. Whether it's the names of the field hands (Users) or the prophecies of the Wise Owl (Gemini), the Silo organizes, protects, and retrieves every bit of grain. No building touches the earth directly; they all pass their yields through the Silo's sorting hats.

---

### 🛠 Technical Specification
This is a **Python FastAPI** microservice that acts as a centralized gateway to the farm's databases.

**Core Features:**
* **Unified Interface:** Accepts standardized JSON objects to perform CRUD operations.
* **Direct Query Access:** Supports raw SQL execution for complex farm analytics.
* **Connection Pooling:** Managed via SQLAlchemy to ensure high-performance data flow.
* **Multi-DB Support:** Currently optimized for **PostgreSQL**, with architectural hooks for **MongoDB**.

**API Standards:**
* `POST /query`: Execute a JSON-based structured query.
* `POST /raw`: Execute a direct SQL string (Admin only).
* `GET /health`: Silo integrity check.