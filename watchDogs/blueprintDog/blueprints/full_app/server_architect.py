import os
import textwrap
from api_engine import ApiEngine


class ServerArchitect:
    """
    The Backend Contractor: Builds the FastAPI application structure.
    Uses ApiEngine to generate specific route and model logic.
    Strictly No Hebrew in code or comments.
    """

    def __init__(self, config, building_path, trace_id):
        self.config = config
        self.building_path = os.path.join(building_path, "server")
        self.engine = ApiEngine(config)
        self.tables = config.get("database", {}).get("tables", [])

    def build_all(self):
        """Orchestrates the creation of all backend files."""
        self._create_folders()
        self._write_base_files()
        self._write_models()
        self._write_routes()
        self._write_requirements()

    def _create_folders(self):
        """Creates the internal FastAPI directory tree."""
        folders = ["app", "app/routes", "app/models", "app/middleware", "app/utils"]
        for folder in folders:
            os.makedirs(os.path.join(self.building_path, folder), exist_ok=True)

    def _write_base_files(self):
        """Writes the main entry point and database client."""
        # 1. main.py
        main_content = textwrap.dedent(f"""\
            from fastapi import FastAPI
            from fastapi.middleware.cors import CORSMiddleware
            from .routes.api import router as api_router
            import os

            app = FastAPI(title="Gingilla Farm - {self.config['building_name']}")

            app.add_middleware(
                CORSMiddleware,
                allow_origins=["*"],
                allow_methods=["*"],
                allow_headers=["*"],
            )

            app.include_router(api_router, prefix="/api/v1")

            @app.get("/health")
            async def health_check():
                return {{"status": "online", "building": "{self.config['building_name']}"}}
        """)

        with open(os.path.join(self.building_path, "app/main.py"), 'w') as f:
            f.write(main_content)

        # 2. db_client.py (Logic for talking to Silo)
        db_client_code = self.engine.generate_db_client()
        with open(os.path.join(self.building_path, "app/utils/db_client.py"), 'w') as f:
            f.write(db_client_code)

    def _write_models(self):
        """Generates Pydantic models for all tables."""
        content = "from pydantic import BaseModel\nfrom typing import Optional, Any\n\n"
        for table in self.tables:
            content += self.engine.generate_pydantic_models(table) + "\n"

        with open(os.path.join(self.building_path, "app/models/schemas.py"), 'w') as f:
            f.write(content)

    def _write_routes(self):
        """Generates FastAPI routes for all tables."""
        content = textwrap.dedent("""\
            from fastapi import APIRouter, HTTPException
            from ..models.schemas import *
            from ..utils.db_client import db_manager

            router = APIRouter()
        """)

        for table in self.tables:
            content += self.engine.generate_fastapi_routes(table) + "\n"

        with open(os.path.join(self.building_path, "app/routes/api.py"), 'w') as f:
            f.write(content)

    def _write_requirements(self):
        """Generates the requirements.txt file."""
        reqs = textwrap.dedent("""\
            fastapi==0.104.1
            uvicorn==0.24.0
            httpx==0.25.1
            pydantic==2.5.2
            python-dotenv==1.0.0
        """)
        with open(os.path.join(self.building_path, "requirements.txt"), 'w') as f:
            f.write(reqs)