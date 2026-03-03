import os
from watchDogs.blueprintDog.blueprints.BaseBlueprint import BaseBlueprint
class WatchDogBlueprint(BaseBlueprint):
    def construct(self, name):
        # Specific path for watchDogs
        path = os.path.join(self.root_dir, "watchDogs", name)
        os.makedirs(path, exist_ok=True)
        self.write_script(path, name)
        self.write_readme(path, name)

    def write_script(self, path, name):
        content = f"def run():\n    print('🐾 {name} patrolling...')\nif __name__ == '__main__':\n    run()"
        self.write_file(path, f"{name}.py", content)

    def write_readme(self, path, name):
        self.write_file(path, "README.md", f"# 🐕 WatchDog: {name}\nGuardian of the farm.")
