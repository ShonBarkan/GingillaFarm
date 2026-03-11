import os
import json
import textwrap

from validator import FullAppValidator
from infra_architect import InfraArchitect
from server_architect import ServerArchitect
from client_architect import ClientArchitect

from watchDogs.logDog.python.logDog import setup_log_dog


class FullAppArchitect:
    """
    The Master Orchestrator: Coordinates between Validator, Infra, Server, and Client.
    Handles conditional logic based on config features.
    Strictly No Hebrew in code or comments.
    """

    def __init__(self, config, root_dir, trace_id):
        self.config = config
        self.root_dir = root_dir
        self.building_name = config.get("building_name")
        self.building_path = os.path.join(root_dir, self.building_name)
        self.trace_id = trace_id

        # Initialize Sub-Architects
        self.validator = FullAppValidator(config, root_dir, trace_id)
        self.infra_arch = InfraArchitect(config, self.building_path, trace_id)
        self.server_arch = ServerArchitect(config, self.building_path, trace_id)
        self.client_arch = ClientArchitect(config, self.building_path, trace_id)

        self.dog = setup_log_dog(self.config["building_name"] + "_front", log_type="default")

    def build(self):
        """Main execution flow: Validate -> Create Folders -> Build Parts."""
        print(f"🏗️  Starting construction of '{self.building_name}'...")

        # 1. Validation Phase
        if not self.validator.validate():
            print("🛑 Construction aborted due to validation errors.")
            return False

        # 2. Base Directory Creation
        try:
            os.makedirs(self.building_path, exist_ok=True)
            print(f"📂 Directory created: {self.building_path}")
        except Exception as e:
            print(f"🚨 Failed to create root directory: {str(e)}")
            return False

        # # 3. Infrastructure (Docker, .env)
        # print("⚡ Setting up infrastructure...")
        # self.infra_arch.build_all()

        # # 4. Backend (FastAPI)
        # print("🐍 Building Backend Server...")
        # self.server_arch.build_all()

        # 5. Frontend (React/Vite)
        print("⚛️  Building Frontend Client...")
        self.client_arch.build_all()

        self._create_readme()

        print(f"\n✅ SUCCESS: '{self.building_name}' is ready in the farm!")
        print(f"👉 To start: cd {self.building_name} && docker-compose up --build")
        return True

    def _create_readme(self):
        """Rule: Start with Farm Lore, followed by Technical specs."""
        readme_path = os.path.join(self.building_path, "README.md")
        narrative = self.config.get("narrative", "A new building in the Gingilla Farm.")

        content = textwrap.dedent(f"""\
            # 🥕 {self.building_name} - Farm Lore
            {narrative}

            Gingilla, the ginger chinchilla, scurries around the new {self.building_name}. 
            Every brick is a microservice, and every wire is a route in the big stack.

            ---
            ## Technical Specification
            - **Backend:** FastAPI (Python 3.11)
            - **Frontend:** React + Vite + Tailwind
            - **Database:** {self.config['database'].get('engine', 'N/A')}
            - **Port:** {self.config['server'].get('port')}

            ## How to Run
            1. Ensure Docker is running.
            2. Run `docker-compose up --build`.
        """)

        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(content)


if __name__ == "__main__":

    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(current_dir, "blueprint.json")

    project_root = r"C:\Shon\gitHub\GingillaFarm\buildings\skel_app"
    trace_id_temp = "trace_id"
    print(f"🔍 Looking for config at: {config_path}")

    if os.path.exists(config_path):
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config_data = json.load(f)

            master_builder = FullAppArchitect(config_data, project_root, trace_id_temp)
            master_builder.build()

        except Exception as e:
            print(f"❌ Error during manual execution: {str(e)}")
    else:
        print(f"🚨 Error: 'blueprint.json' not found in {current_dir}")
