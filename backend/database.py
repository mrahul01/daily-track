"""
database.py — SQLAlchemy setup
Configure via environment variables (recommended) or directly here for local dev.
"""
import os
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import URL

DB_URL = URL.create(
    drivername="mysql+pymysql",
    username=os.getenv("DB_USER",     "app_user"),
    password=os.getenv("DB_PASSWORD", "Rahul@123"),  # Use .env in production!
    host=os.getenv("DB_HOST",         "localhost"),
    port=int(os.getenv("DB_PORT",     3306)),
    database=os.getenv("DB_NAME",     "vikat"),
)

engine = create_engine(
    DB_URL,
    pool_pre_ping=True,   # Reconnect on stale connections
    pool_recycle=1800,    # Recycle every 30 min
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    userID   = Column(Integer, primary_key=True, autoincrement=True)
    userNAME = Column(String(50),  nullable=False)
    emailID  = Column(String(100), nullable=False, unique=True, index=True)
    phoneNO  = Column(String(15),  nullable=True)
    password = Column(String(100), nullable=False)


def get_db():
    """Dependency — yields a DB session and guarantees cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
