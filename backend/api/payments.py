# backend/api/payments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import database, models
from schemas.schemas import PaymentRequest

router = APIRouter(prefix="/payments", tags=["payments"])

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_payment(req: PaymentRequest, db: Session = Depends(get_db)):
    """
    Endpoint to create a new payment.
    Stores the payment amount and timestamp in the database.
    """
    try:
        payment = models.Payment(amount=req.amount)
        db.add(payment)
        db.commit()
        db.refresh(payment)

        return {
            "success": True,
            "payment": {
                "id": payment.id,
                "amount": payment.amount,
                "paid_at": payment.paid_at
            }
        }
    except Exception as e:
        print(f"Payment creation error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/history")
def get_payment_history(db: Session = Depends(get_db)):
    """
    Endpoint to fetch payment history.
    Returns all payments ordered by most recent first.
    """
    try:
        payments = db.query(models.Payment).order_by(models.Payment.paid_at.desc()).all()
        return {"payments": [
            {"id": p.id, "amount": p.amount, "paid_at": p.paid_at} for p in payments
        ]}
    except Exception as e:
        print(f"Fetching payment history error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
