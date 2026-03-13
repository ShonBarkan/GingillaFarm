from sqlalchemy import create_engine
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

load_dotenv()
# Sensitive data loaded from the centralized .env in the root
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@db:5432/gingilla_db")

# engine handles the Connection Pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()