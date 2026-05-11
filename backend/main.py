"""
main.py — DailyTrack FastAPI backend
"""
import os
import logging
from datetime import date, time

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
import bcrypt
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import Column, Integer, String, Time, Date, text
from sqlalchemy.orm import Session

from database import Base, engine, get_db, User

# ─── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="DailyTrack API",
    version="1.0.0",
    docs_url="/docs",      # Remove in production or add auth
    redoc_url="/redoc",
)

# ─── CORS ──────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Password hashing ──────────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain[:72].encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain[:72].encode(), hashed.encode())

# ─── DB Models ─────────────────────────────────────────────────────────────────
class DailyTrack(Base):
    __tablename__  = "dailytrack"
    __table_args__ = {"extend_existing": True}

    id         = Column(Integer, primary_key=True, autoincrement=True)
    userID     = Column(Integer, nullable=False, index=True)
    startTime  = Column(Time, nullable=False)
    endTime    = Column(Time, nullable=False)
    work       = Column(String(30), nullable=False)
    track_date = Column(Date, nullable=False, index=True)

Base.metadata.create_all(bind=engine)

# ─── Pydantic Schemas ───────────────────────────────────────────────────────────
class RegisterSchema(BaseModel):
    userNAME: str
    emailID:  EmailStr
    phoneNO:  str = "0000000000"
    password: str

    @field_validator("userNAME")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginSchema(BaseModel):
    emailID:  EmailStr
    password: str


class DailyTrackSchema(BaseModel):
    userID:     int
    track_date: date
    startTime:  time
    endTime:    time
    work:       str

    @field_validator("work")
    @classmethod
    def work_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Work cannot be empty")
        return v.strip()


class UpdateUserSchema(BaseModel):
    name:  str
    email: EmailStr
    phone: str = ""


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "service": "DailyTrack API"}


@app.post("/register", status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    if db.query(User).filter(User.emailID == data.emailID).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        userNAME=data.userNAME,
        emailID=data.emailID,
        phoneNO=data.phoneNO,
        password=hash_password(data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info("New user registered: %s", data.emailID)
    return {"message": "User registered successfully", "user_id": new_user.userID}


@app.post("/login", tags=["Auth"])
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.emailID == data.emailID).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    return {
        "message": "Login successful",
        "user": {"id": user.userID, "name": user.userNAME, "email": user.emailID},
    }


@app.get("/user/{user_id}", tags=["Users"])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.userID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id":    user.userID,
        "name":  user.userNAME,
        "email": user.emailID,
        "phone": user.phoneNO or "",
    }


@app.put("/user/{user_id}", tags=["Users"])
def update_user(user_id: int, data: UpdateUserSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.userID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent email conflict with another account
    conflict = db.query(User).filter(
        User.emailID == data.email,
        User.userID  != user_id,
    ).first()
    if conflict:
        raise HTTPException(status_code=400, detail="Email already in use by another account")

    user.userNAME = data.name.strip()
    user.emailID  = data.email
    user.phoneNO  = data.phone
    db.commit()
    return {"message": "User updated successfully"}


@app.post("/add-track", status_code=status.HTTP_201_CREATED, tags=["Track"])
def add_track(data: DailyTrackSchema, db: Session = Depends(get_db)):
    entry = DailyTrack(
        userID=data.userID,
        track_date=data.track_date,
        startTime=data.startTime,
        endTime=data.endTime,
        work=data.work,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"message": "Track added successfully", "id": entry.id}


@app.get("/get-track/{user_id}", tags=["Track"])
def get_track(user_id: int, db: Session = Depends(get_db)):
    try:
        rows = db.execute(
            text("""
                SELECT userID, startTime, endTime, work, track_date
                FROM dailytrack
                WHERE userID = :uid
                ORDER BY track_date DESC, startTime ASC
            """),
            {"uid": user_id},
        ).fetchall()

        return [
            {
                "userID":     r.userID,
                "startTime":  str(r.startTime),
                "endTime":    str(r.endTime),
                "work":       r.work,
                "track_date": str(r.track_date),
            }
            for r in rows
        ]
    except Exception as exc:
        logger.error("get-track error for user %s: %s", user_id, exc)
        raise HTTPException(status_code=500, detail="Failed to fetch track data")


@app.delete("/track/{track_id}", tags=["Track"])
def delete_track(track_id: int, db: Session = Depends(get_db)):
    entry = db.query(DailyTrack).filter(DailyTrack.id == track_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Track entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("RELOAD", "true").lower() == "true",
    )