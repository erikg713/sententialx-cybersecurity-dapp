# backend/app/routes/auth.py
from fastapi import APIRouter, HTTPException
from app.controllers.auth_controller import login_user, logout_user

router = APIRouter()

@router.post("/login")
async def login(payload: dict):
    if "username" not in payload or "password" not in payload:
        raise HTTPException(status_code=400, detail="Missing username or password")
    return await login_user(payload["username"], payload["password"])

@router.post("/logout")
async def logout(payload: dict):
    if "session_token" not in payload:
        raise HTTPException(status_code=400, detail="Missing session_token")
    return await logout_user(payload["session_token"])
