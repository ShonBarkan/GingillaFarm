import os
import json
import textwrap
from watchDogs.blueprintDog.blueprints.BaseBlueprint import BaseBlueprint

# --- SUB-CLASS: PYTHON SERVER ARCHITECT ---

class PythonServerBlueprint(BaseBlueprint):
    """
    Constructs a full FastAPI Python Server with LogDog integration.
    Hierarchy: app/ (main, controllers, middleware, models, routes)
    """

    def construct(self, name):
        path = os.path.join(self.root_dir, name)
        app_path = os.path.join(path, "app")

        # 1. Create Folder Structure
        folders = ['controllers', 'middleware', 'models', 'routes']
        for folder in folders:
            os.makedirs(os.path.join(app_path, folder), exist_ok=True)

        # 2. Root Files
        self.write_readme(path, name)
        self.write_docker(path, name)
        self.write_requirements(path)
        self.write_env(path)

        # 3. Application Core
        self.write_main_py(app_path, name)
        self.write_gatekeeper(os.path.join(app_path, 'middleware'), name)
        self.write_controller(os.path.join(app_path, 'controllers'), name)
        self.write_routes(os.path.join(app_path, 'routes'), name)

    def write_readme(self, path, name):
        content = f"# 🌾 Farm Lore: {name}\nThe {name} server handles the heavy lifting of the farm.\n[Insert narrative about Gingilla's server room]"
        self.write_file(path, "README.md", content)

    def write_docker(self, path, name):
        content = "FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements\nCMD [\"python\", \"app/main.py\"]"
        self.write_file(path, "Dockerfile", content)

    def write_requirements(self, path):
        content = "fastapi\nuvicorn\npydantic\npython-dotenv"
        self.write_file(path, "requirements", content)

    def write_env(self, path):
        content = "ALLOWED_ORIGINS=http://localhost:3000\nFARM_ROOT_PATH=../../"
        self.write_file(path, ".env", content)

    def write_main_py(self, path, name):
        """Writes the full main.py FastAPI entry point."""
        content = textwrap.dedent("""\
            import os
            import uvicorn
            from fastapi import FastAPI
            from fastapi.middleware.cors import CORSMiddleware
            from contextlib import asynccontextmanager
            from dotenv import load_dotenv
            from .middleware.gatekeeper import logdog_gatekeeper, gate_logger
            from .routes.farm_routes import router as farm_router

            load_dotenv()

            @asynccontextmanager
            async def lifespan(app: FastAPI):
                gate_logger.success("The {{building_name}} is open! LogDog is on duty.",
                                    extra={'traceID': 'BOOT', 'context': 'System'})
                yield
                gate_logger.info("The {{building_name}} is closing. LogDog is going to sleep.",
                                 extra={'traceID': 'SHUTDOWN', 'context': 'System'})

            app = FastAPI(title="Gingilla Main {{building_name}}", lifespan=lifespan)

            # CORS configuration
            origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
            app.add_middleware(
                CORSMiddleware,
                allow_origins=origins,
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
            )

            # Attach the custom LogDog middleware
            app.middleware("http")(logdog_gatekeeper)

            # Include the modular farm routes
            app.include_router(farm_router, prefix="/api/v1")

            @app.get("/")
            async def root():
                return {"status": "{{building_name}} Online"}

            if __name__ == "__main__":
                uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
        """)
        final_content = content.replace("{{building_name}}", name)
        self.write_file(path, "main.py", final_content)

    def write_gatekeeper(self, path, name):
        """Writes the full gatekeeper.py middleware."""
        content = textwrap.dedent("""\
            import os
            import sys
            import time
            from fastapi import Request
            from dotenv import load_dotenv

            load_dotenv()

            # Path resolution to find LogDog in the farm's watchDogs directory
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))
            from watchDogs.logDog.python.logDog import setup_log_dog

            gate_logger = setup_log_dog("{{building_name}}_Gate", log_type="api")

            async def logdog_gatekeeper(request: Request, call_next):
                trace_id = os.urandom(4).hex().upper()
                start_time = time.time()

                gate_logger.info(f"Critter at the gate: {request.url.path}", extra={
                    'traceID': trace_id, 'method': request.method, 'endpoint': request.url.path, 'context': 'Main'
                })

                response = await call_next(request)
                duration = time.time() - start_time

                gate_logger.success(f"Request complete in {duration:.4f}s", extra={
                    'traceID': trace_id, 'method': request.method, 'endpoint': request.url.path,
                    'status_code': response.status_code, 'context': 'Gatekeeper'
                })
                return response
        """)
        final_content = content.replace("{{building_name}}", name)
        self.write_file(path, "gatekeeper.py", final_content)

    def write_controller(self, path, name):
        """Writes the full farm_controller.py."""
        content = textwrap.dedent("""\
            from ..middleware.gatekeeper import setup_log_dog

            logic_dog = setup_log_dog("{{building_name}}_Logic")

            async def get_{{building_name}}_status(trace_id: str):
                logic_dog.info("Gathering animal status...", extra={'traceID': trace_id, 'context': 'Controller'})

                status = {"gingilla": "happy", "seeds": "plenty"}

                logic_dog.success("Status gathered successfully", extra={'traceID': trace_id, 'context': 'Controller'})
                return status
        """)
        final_content = content.replace("{{building_name}}", name)
        self.write_file(path, "farm_controller.py", final_content)

    def write_routes(self, path, name):
        """Writes the full farm_routes.py."""
        content = textwrap.dedent("""\
            from fastapi import APIRouter, Request
            from ..controllers.farm_controller import get_{{building_name}}_status
            from ..middleware.gatekeeper import setup_log_dog

            router = APIRouter()
            route_dog = setup_log_dog("{{building_name}}_Routes")

            @router.get("/status")
            async def status(request: Request):
                tid = "ROUTE-TID"
                route_dog.info("Routing to Farm Status", extra={'traceID': tid, 'context': 'Router'})
                return await get_{{building_name}}_status(tid)
        """)
        final_content = content.replace("{{building_name}}", name)
        self.write_file(path, "farm_routes.py", final_content)