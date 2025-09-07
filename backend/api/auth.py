from typing import Generator, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import logging

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from passlib.context import CryptContext
import jwt

from db import models, database
from schemas.schemas import LoginRequest

# Router
router = APIRouter(prefix="/auth", tags=["auth"])

# Logger
logger = logging.getLogger(__name__)

# Password hashing context (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT / security settings (use environment variables in production)
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h default


def get_db() -> Generator[Session, None, None]:
    """
    Provide a database session and ensure it's closed after use.
    Kept as a function so FastAPI can use it as a dependency.
    """
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a hashed password.
    Returns False on verification errors instead of raising.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        logger.exception("Unexpected error while verifying password")
        return False


def hash_password(password: str) -> str:
    """Hash a plaintext password (bcrypt)."""
    return pwd_context.hash(password)


def create_access_token(subject: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token. Subject should contain identifying data (e.g. id, username).
    The token includes iat and exp claims and a `sub` set to the subject id (string).
    """
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = subject.copy()
    payload.update({"iat": now, "exp": expire, "sub": str(subject.get("id", ""))})
    try:
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    except Exception:
        logger.exception("Failed to encode JWT token")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token generation failed")
    # jwt.encode returns str in PyJWT >=2.0, bytes in some older libs — ensure string
    return token if isinstance(token, str) else token.decode("utf-8")


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Authenticate the user and return a JWT access token and safe user info.

    Notes:
    - Supports both bcrypt-hashed passwords and legacy plaintext-stored passwords.
    - If a legacy plaintext match is found and the model exposes a `hashed_password` attribute,
      the plaintext will be re-hashed and stored (best-effort migration).
    - Keep a strong SECRET_KEY in production and avoid plaintext password storage.
    """
    # Fetch user by username (do not include password comparison in DB query to avoid leaking timing info)
    user = db.query(models.User).filter(models.User.username == req.username).first()

    # Generic failure to avoid leaking whether username exists
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Prefer an explicit hashed field (if model has one) but fall back to legacy `password`
    stored_password = getattr(user, "hashed_password", None) or getattr(user, "password", None)
    if stored_password is None:
        logger.warning("Authentication attempted for user %s but no password field present", req.username)
        # Treat as invalid credentials to avoid account enumeration
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Determine whether stored_password looks like a bcrypt hash (common prefix $2b$, $2a$, $2y$)
    password_ok = False
    if isinstance(stored_password, str) and stored_password.startswith("$2"):
        password_ok = verify_password(req.password, stored_password)
    else:
        # Legacy / insecure: direct equality fallback. Accept but recommend migration.
        password_ok = req.password == stored_password
        if password_ok:
            logger.warning("User %s authenticated using a plaintext-stored password. Recommend migrating to hashed storage.", req.username)
            # Best-effort: if model supports hashed_password attribute, upgrade it
            if hasattr(user, "hashed_password"):
                try:
                    user.hashed_password = hash_password(req.password)
                    # Optionally remove or blank the legacy password if field exists
                    if hasattr(user, "password"):
                        try:
                            setattr(user, "password", None)
                        except Exception:
                            # Not critical; just log
                            logger.debug("Could not clear legacy password field for user %s", req.username)
                    db.add(user)
                    db.commit()
                    logger.info("Upgraded user %s to hashed password storage", req.username)
                except Exception:
                    db.rollback()
                    logger.exception("Failed to migrate user %s password to hashed storage", req.username)

    if not password_ok:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Build token payload and response-safe user object
    token_payload = {"id": user.id, "username": user.username}
    access_token = create_access_token(token_payload)

    safe_user = {"id": user.id, "username": user.username}

    return {"success": True, "access_token": access_token, "token_type": "bearer", "user": safe_user}
