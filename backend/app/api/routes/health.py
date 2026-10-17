from fastapi import APIRouter
from app.core.config import get_settings

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get("/health")
def health_check():
    """
    Service health check endpoint.
    Used by frontend and monitoring tools to verify backend availability.
    """
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "phase": 1
    }
