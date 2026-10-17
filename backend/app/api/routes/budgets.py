from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_current_user
from app.schemas.budgets import (
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse,
    BudgetListResponse,
)
from app.services.budgets import BudgetService

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("", response_model=BudgetListResponse)
def list_budgets(
    month: Optional[str] = Query(None, description="Month in YYYY-MM or YYYY-MM-DD format"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve all category budgets for the specified month along with calculated actual spending."""
    return BudgetService.get_budgets(
        user_id=current_user["id"],
        token=current_user.get("token"),
        month=month,
    )


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    payload: BudgetCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new monthly category budget for the authenticated user."""
    return BudgetService.create_budget(
        user_id=current_user["id"],
        token=current_user.get("token"),
        payload=payload,
    )


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve a single budget by ID with live spending metrics."""
    return BudgetService.get_budget(
        user_id=current_user["id"],
        token=current_user.get("token"),
        budget_id=budget_id,
    )


@router.patch("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: str,
    payload: BudgetUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update a budget amount and immediately recalculate remaining and percentage used."""
    return BudgetService.update_budget(
        user_id=current_user["id"],
        token=current_user.get("token"),
        budget_id=budget_id,
        payload=payload,
    )


@router.delete("/{budget_id}", status_code=status.HTTP_200_OK)
def delete_budget(
    budget_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete a budget configuration."""
    return BudgetService.delete_budget(
        user_id=current_user["id"],
        token=current_user.get("token"),
        budget_id=budget_id,
    )
