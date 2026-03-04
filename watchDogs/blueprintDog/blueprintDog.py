import os
import json
from watchDogs.blueprintDog.blueprints.ServiceBlueprint import ServiceBlueprint
from watchDogs.blueprintDog.blueprints.FrontendBlueprint import FrontendBlueprint
from watchDogs.blueprintDog.blueprints.WatchDogBlueprint import WatchDogBlueprint
from watchDogs.blueprintDog.blueprints.PythonServerBlueprint import PythonServerBlueprint


def _is_default_content(file_path, file_type):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if file_type == "README.md":
            return "[Insert narrative]" in content or "guardian of Gingilla" in content
        if file_type == "Dockerfile":
            # Check for default slim images with very little custom logic
            return ("FROM python:3.11-slim" in content or "FROM node:20-slim" in content) and len(content) < 165
        return False
    except:
        return False


class BlueprintDog:
    """
    The Base Class: Handles Inspection (Auditor) and Configuration.
    """

    def __init__(self, root_dir, config_name='blueprint_config.json'):
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

    def _is_exempt(self, rel_path, exempt_set):
        """
        Determines if a path is exempt, including wildcard support (e.g., 'tempServer/*').
        """
        # Get the actual folder name of the root (e.g., 'tempServer')
        root_name = os.path.basename(self.root_dir)

        # Reconstruct the full path relative to the "Farm" root
        # If rel_path is 'app/models', full_path becomes 'tempServer/app/models'
        if rel_path == ".":
            full_path = root_name
        else:
            full_path = f"{root_name}/{rel_path}"

        path_parts = full_path.split('/')
        for i in range(len(path_parts)):
            current_segment = '/'.join(path_parts[:i + 1])

            # Check for direct match or wildcard match
            if current_segment in exempt_set:
                return True
            if f"{current_segment}/*" in exempt_set and len(path_parts) > (i + 1):
                return True
        return False

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
            is_exempt_docker = self._is_exempt(rel_path, self.exempt_docker)
            is_exempt_readme = self._is_exempt(rel_path, self.exempt_readme)

            # Audit Recording
            if not is_exempt_docker:
                if not has_docker:
                    self.report["missing_docker"].append(report_path)
                elif _is_default_content(os.path.join(root, 'Dockerfile'), 'Dockerfile'):
                    self.report["default_docker"].append(report_path)

            if not is_exempt_readme:
                if not has_readme:
                    self.report["missing_readme"].append(report_path)
                elif _is_default_content(os.path.join(root, 'README.md'), 'README.md'):
                    self.report["default_readme"].append(report_path)

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
    # dog.create_building("BON_SERVER", building_type="python_server")
    dog.create_building("BON_FRONT", building_type="frontend")
    # dog.run_audit()
    # dog.print_report()