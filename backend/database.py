from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base

DB_URL = "mysql+pymysql://root:@localhost/vikat"

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    userID = Column(Integer, primary_key=True)
    userNAME = Column(String(50))
    emailID = Column(String(50))
    phoneNO = Column(String(15))
    password = Column(String(100))  # better size

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()