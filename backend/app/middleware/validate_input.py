# backend/app/middleware/validate_input.py
from fastapi import Request, HTTPException

async def validate_input(request: Request, required_fields: list):
    body = await request.json()
    missing = [field for field in required_fields if field not in body]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing fields: {missing}")
    return body
