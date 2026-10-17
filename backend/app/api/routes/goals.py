from typing import Dict, Any
from fastapi import APIRouter, Depends, status

from app.api.deps import get_current_user
from app.schemas.goals import (
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    GoalListResponse,
)
from app.services.goals import GoalService

router = APIRouter(prefix="/goals", tags=["Financial Goals"])


@router.get("", response_model=GoalListResponse)
def list_goals(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve all financial goals for the authenticated user with progress metrics."""
    return GoalService.get_goals(
        user_id=current_user["id"],
        token=current_user.get("token"),
    )


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: GoalCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new financial goal."""
    return GoalService.create_goal(
        user_id=current_user["id"],
        token=current_user.get("token"),
        payload=payload,
    )


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve a single financial goal by ID."""
    return GoalService.get_goal(
        user_id=current_user["id"],
        token=current_user.get("token"),
        goal_id=goal_id,
    )


@router.patch("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update a financial goal (e.g. adjust target, log savings contribution)."""
    return GoalService.update_goal(
        user_id=current_user["id"],
        token=current_user.get("token"),
        goal_id=goal_id,
        payload=payload,
    )


@router.delete("/{goal_id}", status_code=status.HTTP_200_OK)
def delete_goal(
    goal_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete a financial goal."""
    return GoalService.delete_goal(
        user_id=current_user["id"],
        token=current_user.get("token"),
        goal_id=goal_id,
    )
