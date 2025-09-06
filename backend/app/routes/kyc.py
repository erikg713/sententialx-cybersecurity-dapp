 # backend/app/routes/kyc.py
from fastapi import APIRouter, HTTPException
from app.controllers.kyc_controller import submit_kyc

router = APIRouter()

@router.post("/submit")
async def submit(payload: dict):
    if "user_id" not in payload or "documents" not in payload:
        raise HTTPException(status_code=400, detail="Missing user_id or documents")
    return await submit_kyc(payload["user_id"], payload["documents"])
