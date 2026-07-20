"""
Database configuration for the AI Accountability Trust Engine.

This module creates:
- SQLite database connection
- SQLAlchemy engine
- Session factory
- Base class for ORM models
"""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session


# --------------------------------------------------
# Database Configuration
# --------------------------------------------------

# SQLite database file name
DATABASE_FILENAME = "accountability.db"

# Database URL
DATABASE_URL = f"sqlite:///{DATABASE_FILENAME}"


# --------------------------------------------------
# SQLAlchemy Engine
# --------------------------------------------------

# Create the database engine.
# check_same_thread=False allows SQLite to be used with FastAPI.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


# --------------------------------------------------
# Session Factory
# --------------------------------------------------

# Each request gets its own database session.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# --------------------------------------------------
# Base Class
# --------------------------------------------------

# All database models will inherit from this Base class.
Base = declarative_base()


# --------------------------------------------------
# Database Dependency
# --------------------------------------------------

def get_db() -> Generator[Session, None, None]:
    """
    Creates a database session for each request.

    Yields:
        Session: Active SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()