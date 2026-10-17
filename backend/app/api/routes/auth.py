import secrets
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.database import get_db

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    status: str
    token: str
    email: str


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    """
    Validates single-user master password.
    Returns session token on success.
    """
    if req.password != settings.APP_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect master password",
        )

    token = secrets.token_urlsafe(32)
    created_at = datetime.now(timezone.utc)
    expires_at = created_at + timedelta(days=30)

    with get_db() as conn:
        conn.execute(
            "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
            (token, "default", created_at.isoformat(), expires_at.isoformat()),
        )

    return LoginResponse(
        status="authenticated",
        token=token,
        email="admin@finos.local",
    )


@router.post("/logout")
def logout(user: Dict[str, Any] = Depends(get_current_user)):
    """Logs out by invalidating the current session token."""
    with get_db() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (user["token"],))
    return {"status": "logged_out"}


@router.get("/me")
def get_authenticated_user_profile(
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Returns profile for currently authenticated session."""
    return {
        "status": "authenticated",
        "user_id": user["id"],
        "email": user["email"],
    }
