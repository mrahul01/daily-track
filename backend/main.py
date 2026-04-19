from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Time, Date
from datetime import date, time

from database import Base, engine, get_db, User

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

class DailyTrack(Base):
    __tablename__ = "dailytrack"
    id = Column(Integer, primary_key=True, autoincrement=True)
    userID = Column(Integer)
    startTime = Column(Time)
    endTime = Column(Time)
    work = Column(String(30))
    track_date = Column(Date)


class RegisterData(BaseModel):
    userID: int
    name: str
    email: EmailStr
    phone: str
    password: str


class LoginData(BaseModel):
    userID: int
    password: str


class DailyTrackData(BaseModel):
    userID: int
    track_date: date
    startTime: time
    endTime: time
    work: str


class DailyTrackOut(BaseModel):
    userID: int
    startTime: time
    endTime: time
    work: str
    track_date: date

    class Config:
        from_attributes = True

@app.post("/register")
def register(data: RegisterData, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.userID == data.userID).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        userID=data.userID,
        userNAME=data.name,
        emailID=data.email,
        phoneNO=data.phone,
        password=data.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@app.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.userID == data.userID).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if user.password != data.password:
        raise HTTPException(status_code=401, detail="Wrong password")

    return {
        "message": "Login successful",
        "user": {
            "id": user.userID,
            "name": user.userNAME,
            "email": user.emailID
        }
    }


@app.get("/user/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.userID == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.userID,
        "name": user.userNAME,
        "email": user.emailID,
        "phone": user.phoneNO
    }

@app.post("/add-track")
def add_track(data: DailyTrackData, db: Session = Depends(get_db)):

    new_entry = DailyTrack(
        userID=data.userID,
        track_date=data.track_date,
        startTime=data.startTime,
        endTime=data.endTime,
        work=data.work
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return {"message": "Track added successfully"}


from sqlalchemy import text

@app.get("/get-track/{userID}")
def get_track(userID: int, db: Session = Depends(get_db)):

    try:
        result = db.execute(
            text("""
                SELECT userID, startTime, endTime, work, track_date
                FROM dailytrack
                WHERE userID = :userID
            """),
            {"userID": userID}
        )

        rows = result.fetchall()

        return [
            {
                "userID": r.userID,
                "startTime": r.startTime,
                "endTime": r.endTime,
                "work": r.work,
                "track_date": r.track_date
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))