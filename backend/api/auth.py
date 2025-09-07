from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db import models, database
from schemas.schemas import LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.username == req.username,
        models.User.password == req.password
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"success": True, "user": {"id": user.id, "username": user.username}}
