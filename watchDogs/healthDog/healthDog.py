import subprocess
import os
import sys
import argparse  # To target specific buildings
from datetime import datetime


class HealthDog:
    def __init__(self, target_path="."):
        # Resolve path relative to where the script is
        self.base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
        self.target = os.path.join(self.base_path, target_path)
        self.config = os.path.join(self.base_path, "watchDogs/healthDog/pyproject.toml")

    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] 🐕 {message}")

    def run_check(self, name, cmd):
        self.log(f"Inspecting {name}...")
        # We run the command specifically on the target building/folder
        result = subprocess.run(cmd + [self.target], capture_output=True, text=True)

        if result.returncode == 0:
            print(f"   ✅ {name} passed.")
            return True
        else:
            print(f"   ❌ {name} failed!")
            print(result.stdout if result.stdout else result.stderr)
            return False

    def perform_rounds(self):
        self.log(f"Rounds started for: {self.target}")

        # We point all tools to the central config
        checks = [
            ("Sniff Test (Ruff)", ["ruff", "check", "--config", self.config]),
            ("Soil Check (MyPy)", ["mypy", "--config-file", self.config]),
            ("The Bite (Pytest)", ["pytest", "-c", self.config])
        ]

        results = [self.run_check(name, cmd) for name, cmd in checks]

        if all(results):
            self.log("🏁 Status: HEALTHY. Good dog!")
            sys.exit(0)
        else:
            self.log("🏁 Status: UNHEALTHY. Fix the fences!")
            sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", default=".", help="Folder to inspect (e.g. buildings/microservers/db_manager)")
    args = parser.parse_args()

    dog = HealthDog(target_path=args.target)
    dog.perform_rounds()