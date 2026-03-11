import os
import json
from watchDogs.blueprintDog.blueprints.ServiceBlueprint import ServiceBlueprint
from watchDogs.blueprintDog.blueprints.FrontendBlueprint import FrontendBlueprint
from watchDogs.blueprintDog.blueprints.WatchDogBlueprint import WatchDogBlueprint
from watchDogs.blueprintDog.blueprints.PythonServerBlueprint import PythonServerBlueprint


def _is_exempt(rel_path, exempt_set):
    # Normalize rel_path: if it's ".", make it empty; otherwise use it.
    # We strip the root_name prefix logic unless your JSON specifically
    # includes "GingillaFarm/assets".
    path = "" if rel_path == "." else rel_path

    # Split into parts and check segments
    # We use .lower() if you want to be case-insensitive,
    # but better to just match your JSON casing exactly.
    parts = [p for p in path.split('/') if p]

    # Check the root itself if rel_path is "."
    if not parts:
        return "." in exempt_set or "GingillaFarm" in exempt_set

    current_path = ""
    for i, part in enumerate(parts):
        if current_path:
            current_path += f"/{part}"

        else:
            current_path = part

        # Check for direct match (e.g., "watchDogs")
        if current_path in exempt_set:
            return True

        # Check for wildcard match (e.g., "assets/*")
        # Only returns True if there are more parts after this segment
        if f"{current_path}/*" in exempt_set and i < len(parts) - 1:
            return True

    return False


class BlueprintDog:
    """
    The Base Class: Handles Inspection (Auditor) and Configuration.
    """

    def __init__(self, root_dir, config_name='blueprint_audit_config.json'):
        self.root_dir = os.path.normpath(root_dir)
        self.config_path = os.path.join(os.path.dirname(__file__), config_name)
        self.report = {"missing_docker": [], "missing_readme": [], "default_docker": [], "default_readme": []}
        self.config = self._load_config()
        self.ignore_list = set(self.config.get("ignore_list", []))
        self.exempt_docker = set(self.config.get("exempt_docker", []))
        self.exempt_readme = set(self.config.get("exempt_readme", []))
        self.watchdog_dir = os.path.join(self.root_dir, "watchDogs")

    def _load_config(self):
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def create_building(self, building_name, building_type="service"):
        """Factory Method: Routes creation to the correct subclass."""
        architects = {
            "service": ServiceBlueprint,
            "frontend": FrontendBlueprint,
            "watchdog": WatchDogBlueprint,
            "python_server": PythonServerBlueprint
        }

        arch_class = architects.get(building_type.lower(), ServiceBlueprint)
        architect = arch_class(self.root_dir)
        architect.construct(building_name)

    # --- AUDITOR LOGIC --

    def run_audit(self, max_depth=None, silent=False):
        self.report = {"missing_docker": [], "missing_readme": [], "default_docker": [], "default_readme": []}

        # Use the actual directory name for the visual tree root
        root_display_name = os.path.basename(self.root_dir)
        start_level = self.root_dir.count(os.sep)

        for root, dirs, files in os.walk(self.root_dir):
            current_level = root.count(os.sep) - start_level

            # Filter ignored directories
            dirs[:] = [d for d in dirs if d not in self.ignore_list and not d.startswith('.')]
            if max_depth is not None and current_level >= max_depth:
                dirs[:] = []

            rel_path = os.path.relpath(root, self.root_dir).replace(os.sep, '/')
            folder_name = os.path.basename(root) if root != self.root_dir else root_display_name

            # --- FIX: Use folder_name instead of "." for the report ---
            report_path = folder_name if rel_path == "." else rel_path

            # Logic: Check if files exist
            has_docker = 'Dockerfile' in files or 'docker-compose.yml' in files
            has_readme = 'README.md' in files

            # Logic: Check exemptions
            is_exempt_docker = _is_exempt(rel_path, self.exempt_docker)
            is_exempt_readme = _is_exempt(rel_path, self.exempt_readme)

            # Audit Recording
            if not is_exempt_docker:
                if not has_docker:
                    self.report["missing_docker"].append(report_path)

            if not is_exempt_readme:
                if not has_readme:
                    self.report["missing_readme"].append(report_path)

            # Visual Tree Printing
            if not silent:
                indent = '│   ' * current_level
                d_icon = "[🐳]" if has_docker else ("" if is_exempt_docker else "[❌]")
                r_icon = "[📖]" if has_readme else ("" if is_exempt_readme else "[🚨]")
                print(f"{indent}├── {folder_name}/  {d_icon}{r_icon}")

                file_indent = '│   ' * (current_level + 1)
                for f in sorted(files):
                    if f not in self.ignore_list and not f.startswith('.'):
                        print(f"{file_indent}📄 {f}")

        return self.report

    def print_report(self):
        print("\n" + "=" * 60)
        print("📋 BLUEPRINTDOG END-OF-DAY REPORT")
        print("=" * 60)

        categories = [
            ("missing_docker", "🚨 MISSING DOCKER"),
            ("missing_readme", "📖 MISSING README"),
            ("default_docker", "⚠️ DEFAULT DOCKER (Placeholder)"),
            ("default_readme", "⚠️ DEFAULT README (Placeholder)")
        ]

        found_issues = False
        for key, title in categories:
            if self.report[key]:
                found_issues = True
                print(f"{title}:")
                for path in self.report[key]:
                    print(f"  - {path}")

        if not found_issues:
            print("✅ All buildings are secured and documented. The Farm is safe.")

        print("=" * 60)


# --- EXECUTION ---
if __name__ == "__main__":
    dog = BlueprintDog(r'C:\Shon\gitHub\GingillaFarm\buildings')
    # dog.create_building("circles_server", building_type="python_server")
    # dog.create_building("circles_client", building_type="frontend")
    dog.create_building("BON_full_app", building_type="full_app")
    # dog.run_audit()
    # dog.print_report()
