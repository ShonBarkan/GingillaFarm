# 🌾 Farm Lore: BlueprintDog

Every great farm needs an architect and a building inspector. **BlueprintDog** is the guardian of the Gingilla Farm’s structural integrity. While the other dogs watch the logs and the health, BlueprintDog ensures that every new building (service) is constructed according to the master plan and that no existing structure falls into disrepair or loses its documentation.

<img src="../../assets/watchdogs/blueprintDog.png" alt="BlueprintDog Character" width="300" />

---

## 🛠 Technical Overview

BlueprintDog serves a dual purpose:

### 🏗 The Architect (Factory)
It automates the creation of new project components using predefined blueprints, ensuring:
- Consistent folder structures  
- Docker configurations  
- Boilerplate code  

### 🔎 The Auditor (Inspector)
It crawls the farm (repository) to:
- Identify missing or "default" (placeholder) Dockerfiles  
- Detect missing READMEs  
- Ensure the project remains fully containerized and documented  

---

## 📁 Project Structure

```plaintext
├── blueprintDog/
│   📄 README.md                     # You are here
│   📄 blueprintDog.py               # Main entry point & Auditor logic
│   📄 blueprint_config.json         # Ignore lists and exemption rules
│   └── blueprints/
│       📄 BaseBlueprint.py          # Abstract logic for file writing
│       📄 ServiceBlueprint.py       # Standard microservice template
│       📄 FrontendBlueprint.py      # React/Vite/Tailwind template
│       📄 WatchDogBlueprint.py      # Template for new admin scripts
│       📄 PythonServerBlueprint.py  # Advanced FastAPI + LogDog template
```

---

## 🏗 The Blueprints

BlueprintDog uses specialized classes to "construct" different types of buildings:

---

### 1️⃣ PythonServerBlueprint

The most advanced architect. It builds a production-ready FastAPI server with a modular **"Clean Architecture"** influence.

**Structure**
- Creates `app/` with subdirectories for:
  - controllers  
  - middleware  
  - models  
  - routes  

**LogDog Integration**
- Automatically injects `gatekeeper.py` middleware  
- Links to the farm's centralized logging system  

**Features**
- CORS setup  
- Lifespan events  
- Pre-configured `.env`  

---

### 2️⃣ FrontendBlueprint

The designer of the farm's interfaces.

**Stack**
- Vite  
- React  
- Tailwind CSS  

**Standardization**
- Enforces the Gingilla rule of i18n (English/Hebrew)  
- Creates translation configuration immediately  

**Docker**
- Provides a `node:20-slim` environment ready for development  

---

### 3️⃣ ServiceBlueprint

The general contractor.

Use this for:
- Standard backend services  
- Microservices  

When you don't need the full complexity of the FastAPI template but still must follow containerization rules.

---

### 4️⃣ WatchDogBlueprint

Used for creating new administrative scripts (like LogDog or HealthDog).

Ensures that new "Dogs":
- Follow standard execution patterns  
- Integrate cleanly into the farm’s infrastructure  

---

## 🔍 The Auditor (Inspector)

BlueprintDog doesn't just build — it inspects.

Running `run_audit()` generates a visual tree of the project with status icons:

- `[🐳]` Dockerized — A valid Dockerfile exists  
- `[📖]` Documented — A README.md is present  
- `[❌]` Missing Docker — Violation of Core Rule #1  
- `[🚨]` Missing Lore — No README found  

### 🧪 Placeholder Detection

If a README contains:
```
[Insert narrative]
```

BlueprintDog flags it as a **"Default"** file in the End-Of-Day report.

---

## 🚀 How to Use

### 🏗 Construction

To build a new building (e.g., a backend for the silo):

class BlueprintDog:
pass

```python
dog = BlueprintDog(root_dir='/path/to/farm')
dog.create_building("SiloBackend", building_type="python_server")
```

---

### 🔎 Auditing

To check the current state of the farm:

class BlueprintDog:
pass

```python
dog = BlueprintDog(root_dir='.')
dog.run_audit()
dog.print_report()
```

---

## 📋 Configuration (`blueprint_config.json`)

Manage exemptions and ignored paths here:

- **ignore_list**  
  Folders like `node_modules` or `.git` that the dog should never sniff  

- **exempt_docker**  
  Projects that do not require containerization  

- **exempt_readme**  
  Utility folders that don't require lore  

> “A solid floor before the second floor.” — BlueprintDog 🐾