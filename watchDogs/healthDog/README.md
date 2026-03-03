# 🐕 WatchDog: HealthDog

<img src="../../assets/watchdogs/HealthDog.png" alt="HealthDog Character" width="300" />

> *The vigilant sheepdog of Gingilla Farm, guarding code quality and keeping the soil clean.*

---

## 🌾 Farm Lore

Every farm needs a protector—not just from wolves, but from creeping chaos and messy trails. **HealthDog** is the primary guardian of **GingillaFarm**.

While the other animals focus on their chores, HealthDog patrols the fence lines, sniffing out "smelly" code and ensuring the "soil" (type safety) remains rich and untainted. If the logic isn't lean or the types aren't strict, HealthDog is ready to bark—or bite.

---

## 🛠️ Technical Overview

HealthDog is the automated CI/QC (Continuous Integration / Quality Control) engine for the GingillaFarm ecosystem. It ensures the repository remains professional, strictly typed, and fully tested.

### Features

- **Sniffing (Linting & Formatting)** – Ruff for ultra-fast linting and formatting.
- **Soil Inspection (Type Checking)** – MyPy in strict mode.
- **Biting (Testing)** – Pytest with coverage reporting.
- **WatchDog Audit** – Custom Python script logging health metrics to PostgreSQL/MongoDB.

---

## 📂 Project Structure

```text
GingillaFarm/
├── .pre-commit-config.yaml
├── Makefile
├── .env
├── watchDogs/
│   └── healthDog/
│       ├── healthDog.py
│       └── pyproject.toml

```

> 🔎 Root-level tooling ensures the entire farm is inspected — not just a single service.

---

# 🚀 Installation & Usage

## Requirements

- Python 3.12+
- uv package manager

### Install Dependencies (from root)

```bash
# Sync all farm dependencies
uv sync
```

---

## 🧭 Farm Commands (Run from GingillaFarm root)

All commands are centralized in the root `Makefile`.

| Command | Action | Farm Metaphor |
|----------|--------|---------------|
| `make sniff` | Runs Ruff (fix/format) and MyPy across the project | Cleaning the barn and checking the soil |
| `make bite` | Runs Pytest with coverage | Testing the farm's defenses |
| `make check-all` | Runs Sniff and Bite | Full perimeter patrol |
| `make health-check` | Executes `watchDogs/healthDog/healthDog.py` | Logging findings to the farm ledger |

---

# ⚙️ Configuration

HealthDog is governed by the root-level `pyproject.toml`, ensuring no microservice is left uninspected.

### Tooling Rules

- **Ruff**
  - Ignores line length (`E501`)
  - Strict import sorting and naming enforcement

- **MyPy**
  - `strict = true`
  - No weak typing allowed

- **Pre-commit**
  - Configured in root `.pre-commit-config.yaml`
  - Blocks messy code before it leaves the local gate

- **Custom Audit**
  - `[tool.healthdog]` section inside `pyproject.toml`
  - Database logging enabled
  - Enforces no Hebrew characters in backend comments/code

---

# 🐳 Containerization & Farm Compliance

- Fully Docker-ready
- Reads secrets from centralized `.env`
- Backend remains English-only (frontend may localize)
- Root-level enforcement guarantees farm-wide consistency

---

> “A farm is only as strong as its fences.” – HealthDog 🐕