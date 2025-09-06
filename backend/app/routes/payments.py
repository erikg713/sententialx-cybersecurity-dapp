 # backend/app/routes/payments.py
from fastapi import APIRouter, HTTPException
from app.controllers.payments_controller import process_payment

router = APIRouter()

@router.post("/process")
async def payment(payload: dict):
    if "user_id" not in payload or "amount" not in payload:
        raise HTTPException(status_code=400, detail="Missing user_id or amount")
    return await process_payment(payload["user_id"], payload["amount"])
