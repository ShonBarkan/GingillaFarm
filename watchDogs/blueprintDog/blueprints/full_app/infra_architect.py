import os
import textwrap


class InfraArchitect:
    """
    The Infrastructure Contractor: Handles Docker, Compose, and Environment files.
    Ensures ALL sensitive data and configurations are pulled from .env.
    Strictly No Hebrew in code or comments.
    """

    def __init__(self, config, building_path, trace_id):
        self.config = config
        self.building_path = building_path
        self.infra = config.get("infrastructure", {})

    def build_all(self):
        """Main entry point for infrastructure creation."""
        self.write_env_file()
        self.write_dockerfiles()
        self.write_docker_compose()

    def write_env_file(self):
        """Generates the .env file. This is the SINGLE source of truth."""
        env_path = os.path.join(self.building_path, ".env")
        env_vars = self.infra.get("env_vars", [])

        # Core Infrastructure secrets/configs
        content = f"# --- Gingilla Farm: {self.config['building_name']} ---\n\n"
        content += f"BUILDING_NAME={self.config['building_name']}\n"
        content += f"DB_MANAGER_URL={self.infra.get('db_manager_url', '')}\n"

        # Ports (Used by Compose to map external to internal)
        content += f"BACKEND_PORT_EXTERNAL={self.config['server'].get('port', 8000)}\n"
        content += f"FRONTEND_PORT_EXTERNAL={self.config['frontend'].get('port', 3000)}\n"

        # Internal Ports (For the code to listen on)
        content += "BACKEND_PORT_INTERNAL=8000\n"
        content += "FRONTEND_PORT_INTERNAL=5173\n"

        # Custom environment variables from config
        content += "\n# --- Custom App Secrets ---\n"
        for var in env_vars:
            content += f"{var['key']}={var['default']}\n"

        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(content)

    def write_dockerfiles(self):
        """Dockerfiles rely strictly on environment variables injected at runtime."""
        # Server Dockerfile
        server_docker = textwrap.dedent("""\
            FROM python:3.11-slim
            WORKDIR /app
            COPY requirements.txt .
            RUN pip install --no-cache-dir -r requirements.txt
            COPY . .
            # Port is referenced via ENV variable in the CMD or by the orchestrator
            EXPOSE 8000
            CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT_INTERNAL}"]
        """)

        server_path = os.path.join(self.building_path, "server")
        os.makedirs(server_path, exist_ok=True)
        with open(os.path.join(server_path, "Dockerfile"), 'w') as f:
            f.write(server_docker)

        # Frontend Dockerfile
        client_docker = textwrap.dedent("""\
            FROM node:20-slim
            WORKDIR /app
            COPY package*.json ./
            RUN npm install
            COPY . .
            EXPOSE 5173
            CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
        """)

        client_path = os.path.join(self.building_path, "frontend")
        os.makedirs(client_path, exist_ok=True)
        with open(os.path.join(client_path, "Dockerfile"), 'w') as f:
            f.write(client_docker)

    def write_docker_compose(self):
        """Compose maps ports and volumes using .env variables."""
        volumes = self.infra.get("volumes", {})
        vol_mapping = ""
        for key, path in volumes.items():
            vol_mapping += f"      - {path}:/app/{key}\n"

        name = self.config['building_name'].lower()

        compose_content = textwrap.dedent(f"""\
            version: '3.8'
            services:
              {name}-server:
                build: ./server
                # Maps [External Port from .env] : [Internal Port from .env]
                ports:
                  - "${{BACKEND_PORT_EXTERNAL}}:${{BACKEND_PORT_INTERNAL}}"
                env_file: .env
                volumes:
            {vol_mapping}
              {name}-frontend:
                build: ./frontend
                ports:
                  - "${{FRONTEND_PORT_EXTERNAL}}:${{FRONTEND_PORT_INTERNAL}}"
                env_file: .env
        """)

        with open(os.path.join(self.building_path, "docker-compose.yml"), 'w') as f:
            f.write(compose_content)