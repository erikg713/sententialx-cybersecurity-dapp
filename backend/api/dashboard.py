from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from db import database, models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

logger = logging.getLogger("sententialx.dashboard")


def get_db():
    """
    Dependency that yields a database session and ensures it is closed after use.
    """
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ThreatSummary(BaseModel):
    id: Optional[int]
    title: Optional[str]
    severity: Optional[str]
    created_at: Optional[datetime]


class StatsResponse(BaseModel):
    total_threats: int
    total_users: int
    active_users_30d: Optional[int] = None
    threats_by_severity: Optional[Dict[str, int]] = None
    recent_threats: Optional[List[ThreatSummary]] = None


@router.get("/stats", response_model=StatsResponse, status_code=status.HTTP_200_OK)
def get_stats(db: Session = Depends(get_db)):
    """
    Return a small set of dashboard statistics.

    - total_threats: total number of Threat records
    - total_users: total number of User records
    - active_users_30d: number of users active in the last 30 days (if `last_login` exists on User)
    - threats_by_severity: map of severity -> count (if `severity` exists on Threat)
    - recent_threats: up to 5 most recent threats with basic fields (if `created_at`/`title` exist)
    """
    try:
        # Basic totals (these should always exist)
        total_threats = db.query(func.count(models.Threat.id)).scalar() or 0
        total_users = db.query(func.count(models.User.id)).scalar() or 0

        result = {
            "total_threats": int(total_threats),
            "total_users": int(total_users),
            "active_users_30d": None,
            "threats_by_severity": None,
            "recent_threats": None,
        }

        # Attempt to compute active users in the last 30 days if the field exists
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        if hasattr(models.User, "last_login"):
            try:
                active_users_30d = (
                    db.query(func.count(models.User.id))
                    .filter(models.User.last_login >= thirty_days_ago)
                    .scalar()
                    or 0
                )
                result["active_users_30d"] = int(active_users_30d)
            except Exception as e:
                logger.debug("Could not compute active_users_30d: %s", e)

        # Attempt to compute threats by severity if the field exists
        if hasattr(models.Threat, "severity"):
            try:
                rows = (
                    db.query(models.Threat.severity, func.count(models.Threat.id))
                    .group_by(models.Threat.severity)
                    .all()
                )
                # rows is list of (severity, count)
                severity_map = {str(r[0]): int(r[1]) for r in rows}
                result["threats_by_severity"] = severity_map
            except Exception as e:
                logger.debug("Could not compute threats_by_severity: %s", e)

        # Attempt to fetch recent threats if basic fields exist
        if hasattr(models.Threat, "created_at"):
            try:
                limit = 5
                query = db.query(models.Threat).order_by(models.Threat.created_at.desc()).limit(limit)
                threats = query.all()
                recent = []
                for t in threats:
                    item = {
                        "id": getattr(t, "id", None),
                        "title": getattr(t, "title", None),
                        "severity": getattr(t, "severity", None),
                        "created_at": getattr(t, "created_at", None),
                    }
                    recent.append(item)
                result["recent_threats"] = recent
            except Exception as e:
                logger.debug("Could not fetch recent_threats: %s", e)

        return result

    except Exception as exc:
        logger.exception("Failed to fetch dashboard stats: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch dashboard statistics",
        )
