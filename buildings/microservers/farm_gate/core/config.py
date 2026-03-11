import os


class GateConfig:
    SERVICES = {
        # Core Microservices
        "db": os.getenv("DB_MANAGER_URL", "http://db_manager:8000"),
        "ai": os.getenv("AI_SERVICE_URL", "http://ai_service:8000"),
        "foreman": os.getenv("FOREMAN_URL", "http://foreman_microservice:8000"),

        # The Infrastructure Buildings
        "map": os.getenv("MAP_URL", "http://farm_map:80"),
        "weather": os.getenv("GRAFANA_URL", "http://grafana:3000"),
        "cellar": os.getenv("NEXTCLOUD_URL", "http://nextcloud_app:80"),
        "metrics": os.getenv("PROMETHEUS_URL", "http://prometheus:9090")
    }

    # Initial Kill Switch status (True = Open, False = Closed)
    # This allows you to "lock the doors" of specific buildings via the Gate
    INITIAL_STATUS = {
        "db": True,
        "ai": True,
        "foreman": True,
        "map": True,
        "weather": True,
        "cellar": True,
        "metrics": True
    }

    # Allowed origins for CORS
    # For Gingilla Farm, it's best to eventually set this to your specific Tailscale/Local IP
    ALLOWED_ORIGINS = ["*"]