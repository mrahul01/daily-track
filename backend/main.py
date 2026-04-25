from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Time, Date
from datetime import date, time
from database import Base, engine, get_db, User
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", truncate_error=False)

def hash_password(password: str):
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password[:72], hashed_password)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://candied-unpicked-quiet.ngrok-free.dev",
        "*"  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    expose_headers=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

class DailyTrack(Base):
    __tablename__ = "dailytrack"
    __table_args__ = {'extend_existing': True}  # Add this line
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    userID = Column(Integer)
    startTime = Column(Time)
    endTime = Column(Time)
    work = Column(String(30))
    track_date = Column(Date)



class RegisterData(BaseModel):
    userNAME: str
    emailID: EmailStr
    phoneNO: str 
    password: str


class LoginData(BaseModel):
    emailID: EmailStr
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

class UpdateUser(BaseModel):
    name: str
    email: EmailStr
    phone: str



@app.post("/register")
def register(data: RegisterData, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.emailID == data.emailID).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    if not data.password:
        raise HTTPException(status_code=400, detail="Password required")
    
    hashed_pwd = hash_password(data.password) 
    new_user = User(
        userNAME=data.userNAME,
        emailID=data.emailID,
        phoneNO=data.phoneNO,
        password=hashed_pwd
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "user_id": new_user.userID}
    
@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.emailID == data.emailID).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not verify_password(data.password, user.password):
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
@app.put("/user/{user_id}")
def update_user(user_id: int, data: UpdateUser, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.userID == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.userNAME = data.name
    user.emailID = data.email
    user.phoneNO = data.phone

    db.commit()
    db.refresh(user)

    return {"message": "User updated successfully"}
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
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
