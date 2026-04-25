from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import URL

DB_URL = URL.create(
    drivername="mysql+pymysql",
    username="app_user",
    password="Rahul@123",
    host="localhost",
    database="vikat"
)

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    userID = Column(Integer, primary_key=True , autoincrement=True)
    userNAME = Column(String(50))
    emailID = Column(String(50))
    phoneNO = Column(String(15))
    password = Column(String(100))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()