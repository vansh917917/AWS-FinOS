from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import Header, HTTPException, status
from app.db.database import get_db


def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Extracts Bearer token from Authorization header and verifies it in local sessions table.
    Returns the authenticated user dict.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. Format: 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty bearer token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    now_iso = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        row = conn.execute(
            "SELECT user_id, expires_at FROM sessions WHERE token = ?", (token,)
        ).fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session token invalid or expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if row["expires_at"] < now_iso:
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has expired. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "id": row["user_id"],
            "email": "admin@finos.local",
            "token": token,
        }
