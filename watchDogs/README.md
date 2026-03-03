# 🐕 The WatchDogs of Gingilla Farm

Welcome to the Kennel. The WatchDogs are the administrative guardians of the Gingilla Farm ecosystem. They are specialized scripts designed to maintain order, health, and structural integrity across all buildings (services) in the farm.

---

## 🐾 The Pack at a Glance

| Name | Character                                                                                        | Duty | Catchphrase | Link                                           |
|------|--------------------------------------------------------------------------------------------------|------|-------------|------------------------------------------------|
| **LogDog** | <!-- OR --> <br> <img src="../assets/watchdogs/logdog.png" width="100" alt="LogDog">             | Sniffs out every API call and system error across Python and Node.js. | "A sharp bark for every spark." | [View Documentation](./logDog/README.md)       |
| **HealthDog** | <!-- OR --> <br> <img src="../assets/watchdogs/HealthDog.png" width="100" alt="HealthDog">       | Checks database heartbeats and service availability every morning. | "A farm is only as strong as its fences." | [View Documentation](./healthDog/README.md)    |
| **BlueprintDog** | <!-- OR --> <br> <img src="../assets/watchdogs/blueprintDog.png" width="100" alt="BlueprintDog"> | Builds new services and inspects structures for Docker and Lore compliance. | "Measure twice, bark once." | [View Documentation](./blueprintDog/README.md) |

---

## 🏗️ Core WatchDog Principles

All dogs in the kennel follow the **Gingilla Core Rules**:

- **Shared Language:** While they may be written in different tongues (Python/JS), they all output logs in the same format.
- **Centralized Secrets:** Every dog reads from the root `.env` file to know where the farm boundaries are.
- **Container First:** Every dog is designed to run inside a Docker environment or manage Dockerized services.
- **The Lore:** Every dog has a story. Technical excellence is mandatory, but the "Farm Lore" is what gives the project its soul.

---

## 🛠️ Global Requirements

To keep the pack running smoothly, ensure your root environment is prepared:

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- A valid `.env` file in the project root containing `FARM_ROOT_PATH`

---

> “A farm is only as strong as the hounds that guard it.” – Gingilla 🐹

---

Which dog would you like to deploy next, or should we create a new **GuardDog** for security?