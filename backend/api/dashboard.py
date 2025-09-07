from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import models, database

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_threats = db.query(models.Threat).count()
    active_users = db.query(models.User).count()
    return {"total_threats": total_threats, "active_users": active_users}
