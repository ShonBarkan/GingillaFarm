# ⛩️ The Great Gate (API Gateway)

### 📜 Farm Lore
Every traveler knows that to enter Gingilla Farm, they must pass through the Great Gate. It is the only part of the farm that looks out toward the road. The Gatekeeper knows which buildings are open for business and which are under repair. If a building is acting strange, the Gatekeeper can drop the portcullis, keeping the rest of the farm safe while the mending happens.

---

### 🛠 Technical Specification
**Engine:** FastAPI + HTTPX (Reverse Proxy)
**Features:**
* **Single Entry:** Unified access to all microservices.
* **CORS Master:** Centralized Cross-Origin Resource Sharing for the Frontend.
* **The Kill Switch:** Dynamically enable/disable routing to specific buildings.