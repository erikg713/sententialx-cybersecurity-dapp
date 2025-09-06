# backend/app/controllers/auth_controller.py
from app.models.user_session import UserSession
from datetime import datetime, timedelta
import uuid

# Dummy in-memory store
sessions = {}

async def login_user(username: str, password: str):
    # TODO: Integrate real authentication
    token = str(uuid.uuid4())
    session = UserSession(
        user_id=username,
        session_token=token,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(hours=2)
    )
    sessions[token] = session
    return {"message": "Logged in", "session_token": token}

async def logout_user(session_token: str):
    if session_token in sessions:
        del sessions[session_token]
        return {"message": "Logged out"}
    return {"message": "Session not found"}
