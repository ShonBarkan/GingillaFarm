import os

class GateConfig:
    # These must match your service names in docker-compose.yml
    SERVICES = {
        "db": os.getenv("DB_MANAGER_URL", "http://db_manager:8000"),
        "ai": os.getenv("AI_SERVICE_URL", "http://ai_service:8000"),
        "foreman": os.getenv("FOREMAN_URL", "http://foreman_microservice:8000")
    }

    # Initial Kill Switch status (True = Open, False = Closed)
    INITIAL_STATUS = {
        "db": True,
        "ai": True,
        "foreman": True
    }

    # Allowed origins for CORS (Your Tailscale IP or Localhost)
    ALLOWED_ORIGINS = ["*"]