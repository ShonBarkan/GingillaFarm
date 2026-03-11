import os
import httpx
import asyncio
from watchDogs.logDog.python.logDog import setup_log_dog


class FullAppValidator:
    """
    The Inspector: Validates config with a distinction between
    Critical Errors (stop) and Warnings (continue).
    Strictly No Hebrew in code or comments.
    """

    def __init__(self, config, root_dir, trace_id):
        self.config = config
        self.root_dir = root_dir
        self.trace_id = trace_id
        self.errors = []
        self.warnings = []
        # Initialize the Dog for the Inspector
        self.log_dog = setup_log_dog(config.get("building_name", "unknown") + "_inspector", log_type="default")

    def validate(self):
        """Main entry point: distinguishes between blocking and non-blocking issues."""
        self.log_dog.info("🧐 Inspector starting site survey...", extra={'context': 'validate', 'traceID': self.trace_id})

        if not self.config:
            self.log_dog.critical("❌ Survey failed: Config object is empty!",
                              extra={'context': 'validate', 'traceID': self.trace_id})
            self.errors.append("Config object is empty or None.")
            return False

        # 1. Run Checks
        self.log_dog.debug("Running check_required_sections...", extra={'context': 'validate', 'traceID': self.trace_id})
        self._check_required_sections()

        self.log_dog.debug("Running check_database_integrity...", extra={'context': 'validate', 'traceID': self.trace_id})
        self._check_database_integrity()

        self.log_dog.debug("Running check_infrastructure_health...",
                       extra={'context': 'validate', 'traceID': self.trace_id})
        self._check_infrastructure_health()

        self.log_dog.debug("Running check_collision...", extra={'context': 'validate', 'traceID': self.trace_id})
        self._check_collision()

        # 2. Print Warnings (Non-blocking)
        if self.warnings:
            self.log_dog.warning(f"⚠️ Inspector found {len(self.warnings)} minor issues.",
                             extra={'context': 'validate', 'traceID': self.trace_id})
            print("\n" + "-" * 40)
            print("⚠️  CONSTRUCTION WARNINGS:")
            for warn in self.warnings:
                print(f" - {warn}")
            print("-" * 40)

        # 3. Report Errors (Blocking)
        if self.errors:
            self.log_dog.error(f"🛑 CRITICAL: {len(self.errors)} violations found. Construction halted.",
                           extra={'context': 'validate', 'traceID': self.trace_id})
            print("\n" + "!" * 40)
            print("🚨 CRITICAL ERRORS - CONSTRUCTION HALTED")
            for err in self.errors:
                print(f" - {err}")
            print("!" * 40 + "\n")
            return False

        self.log_dog.info("✅ Site survey cleared. The Gingilla can start digging.",
                      extra={'context': 'validate', 'traceID': self.trace_id})
        print("✅ Validation passed. Ready for assembly.")
        return True

    def _check_required_sections(self):
        """Checks for the absolute minimum root keys required."""
        if "building_name" not in self.config or not self.config["building_name"]:
            self.errors.append("Root field 'building_name' is missing or empty.")
            self.log_dog.error("Missing 'building_name' in config.",
                           extra={'context': '_check_required_sections', 'traceID': self.trace_id})

        if "infrastructure" not in self.config:
            self.errors.append("Root field 'infrastructure' is missing.")
            self.log_dog.error("Infrastructure section missing.",
                           extra={'context': '_check_required_sections', 'traceID': self.trace_id})

        if "server" not in self.config:
            self.errors.append("Root field 'server' is missing.")

        if "frontend" not in self.config:
            self.errors.append("Root field 'frontend' is missing.")

        if "database" not in self.config:
            self.warnings.append("Root field 'database' is missing. Proceeding with a stateless build.")
            self.log_dog.warning("No database defined. This will be a stateless barn.",
                             extra={'context': '_check_required_sections', 'traceID': self.trace_id})

    def _check_database_integrity(self):
        """Comprehensive DB validation."""
        db = self.config.get("database")
        if not db or not db.get("tables"):
            self.warnings.append("No database tables defined. Building will be stateless.")
            return

        allowed_types = ["int", "string", "float", "boolean", "json", "date"]
        table_names = [t.get("name") for t in db.get("tables", []) if t.get("name")]

        if len(table_names) != len(set(table_names)):
            self.errors.append("Duplicate table names found in database config.")
            self.log_dog.error("Structural error: Duplicate tables detected.",
                           extra={'context': '_check_database_integrity', 'traceID': self.trace_id})

        for table in db.get("tables", []):
            t_name = table.get("name", "UnknownTable")
            self.log_dog.debug(f"Inspecting table: {t_name}",
                           extra={'context': '_check_database_integrity', 'traceID': self.trace_id})

            if "name" not in table:
                self.errors.append("A table definition is missing a name.")
                continue

            cols = table.get("columns", [])
            col_names = [c.get("name") for c in cols]

            pk = table.get("primary_key")
            if not pk:
                self.errors.append(f"Table '{t_name}' must have a 'primary_key'.")
            elif pk not in col_names:
                self.errors.append(f"Primary key '{pk}' for table '{t_name}' is not in column list.")

            for col in cols:
                c_type = col.get("type")
                if c_type not in allowed_types:
                    self.errors.append(f"Invalid type '{c_type}' in table '{t_name}'.")

    def _check_infrastructure_health(self):
        """Checks infra components and pings the DB Manager."""
        infra = self.config.get("infrastructure", {})
        db_url = infra.get("db_manager_url")

        if not db_url:
            self.warnings.append("infrastructure.db_manager_url is missing. API calls to Silo will fail.")

        if db_url:
            self.log_dog.info(f"📡 Pinging Silo at {db_url}...",
                          extra={'context': '_check_infrastructure_health', 'traceID': self.trace_id})
            try:
                response = httpx.get(f"{db_url}/health", timeout=2.0)
                if response.status_code == 200:
                    self.log_dog.info("📶 Silo Connection: ACTIVE.",
                                  extra={'context': '_check_infrastructure_health', 'traceID': self.trace_id})
                    print(f"📡 Silo Connection: {db_url} is ACTIVE.")
                else:
                    self.warnings.append(f"Silo at {db_url} responded with status {response.status_code}.")
                    self.log_dog.warning(f"Silo responded with status {response.status_code}",
                                     extra={'context': '_check_infrastructure_health', 'traceID': self.trace_id})
            except (httpx.ConnectError, httpx.TimeoutException):
                self.warnings.append(f"Silo at {db_url} is UNREACHABLE.")
                self.log_dog.error(f"Silo connection failed at {db_url}",
                               extra={'context': '_check_infrastructure_health', 'traceID': self.trace_id})

    def _check_collision(self):
        """Critical check to prevent data loss."""
        name = self.config.get("building_name")
        if name:
            target = os.path.join(self.root_dir, name)
            if os.path.exists(target):
                self.log_dog.critical(f"Collision detected! Folder '{name}' already exists.",
                                  extra={'context': '_check_collision', 'traceID': self.trace_id})
                self.errors.append(f"Building folder '{name}' already exists. Overwrite prohibited.")