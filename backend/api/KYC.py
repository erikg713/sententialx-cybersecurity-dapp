# backend/api/kyc.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import database, models
from schemas.schemas import KYCRequest

router = APIRouter(prefix="/kyc", tags=["kyc"])

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def submit_kyc(req: KYCRequest, db: Session = Depends(get_db)):
    """
    Endpoint to submit a KYC form.
    Stores full name and government ID number in the database.
    """
    try:
        # Check for existing submission with same ID number
        existing = db.query(models.KYCSubmission).filter(models.KYCSubmission.id_number == req.id_number).first()
        if existing:
            raise HTTPException(status_code=400, detail="KYC already submitted with this ID number.")

        kyc_submission = models.KYCSubmission(
            full_name=req.full_name,
            id_number=req.id_number
        )

        db.add(kyc_submission)
        db.commit()
        db.refresh(kyc_submission)

        return {"success": True, "message": "KYC submitted successfully", "kyc_id": kyc_submission.id}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"KYC submission error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
