services:
  db:
    image: postgres:15-alpine
    container_name: gingilla_postgres
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: gingilla_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  db_manager:
    build: ./buildings/microservers/db_manager
    container_name: silo_microservice
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/gingilla_db
    ports:
      - "8001:8000"

volumes:
  postgres_data: