import subprocess
import os
import sys
from datetime import datetime


class HealthDog:
    def __init__(self):
        # Move to the root of Gingilla Farm
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
        os.chdir(self.root_dir)
        self.report = []

    def log(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] 🐕 {message}")

    def run_check(self, name, command):
        self.log(f"HealthDog is performing: {name}...")
        result = subprocess.run(command, capture_output=True, text=True, shell=False)

        if result.returncode == 0:
            self.log(f"✅ {name} passed.")
            return True
        else:
            self.log(f"❌ {name} failed!")
            # Only print details if it's not just an 'info' log
            print(result.stdout)
            print(result.stderr)
            return False

    def perform_rounds(self):
        self.log(f"Starting rounds at {self.root_dir}")

        # 1. Sniff Test (Linting with Ruff)
        # Pointing to the config in the healthDog folder
        ruff_cmd = ["ruff", "check", ".", "--config", "watchDogs/healthDog/pyproject.toml"]
        sniff_ok = self.run_check("Sniff Test (Ruff)", ruff_cmd)

        # 2. Soil Check (Types with MyPy)
        mypy_cmd = ["mypy", ".", "--config-file", "watchDogs/healthDog/pyproject.toml"]
        soil_ok = self.run_check("Soil Check (MyPy)", mypy_cmd)

        # 3. The Bite (Tests with Pytest)
        # Pytest will find the config automatically or we pass it
        pytest_cmd = ["pytest", "-c", "watchDogs/healthDog/pyproject.toml"]
        bite_ok = self.run_check("The Bite (Pytest)", pytest_cmd)

        if sniff_ok and soil_ok and bite_ok:
            self.log("🏁 Farm status: HEALTHY. Good dog!")
            sys.exit(0)
        else:
            self.log("🏁 Farm status: ISSUES DETECTED. Check the logs above.")
            sys.exit(1)


if __name__ == "__main__":
    dog = HealthDog()
    dog.perform_rounds()