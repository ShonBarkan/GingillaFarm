import os
from watchDogs.blueprintDog.blueprints.BaseBlueprint import BaseBlueprint

class ServiceBlueprint(BaseBlueprint):
    def construct(self, name):
        path = os.path.join(self.root_dir, name)
        os.makedirs(path, exist_ok=True)
        for d in ['src', 'tests', 'logs']: os.makedirs(os.path.join(path, d), exist_ok=True)
        self.write_readme(path, name)
        self.write_docker(path, name)
        self.write_env(path)

    def write_readme(self, path, name):
        self.write_file(path, "README.md", f"# 🌾 Farm Lore: {name}\nIn the fields of Gingilla...\n[Insert narrative]")

    def write_docker(self, path, name):
        self.write_file(path, "Dockerfile",
                        "FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\nCMD [\"python\", \"src/main.py\"]")
        self.write_file(path, "docker-compose.yml", f"services:\n  {name.lower()}:\n    build: .")

    def write_env(self, path):
        self.write_file(path, ".env", "DEBUG=True")
