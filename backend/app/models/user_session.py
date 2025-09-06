# backend/app/models/user_session.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserSession(BaseModel):
    user_id: str
    session_token: str
    created_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None 
