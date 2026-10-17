from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    MonthlyAnalyticsResponse,
    CategoryAnalyticsResponse,
    TopExpensesResponse,
    BudgetAnalyticsResponse,
)
from app.services.analytics import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve high-level financial metrics (income, expenses, net cash flow, savings rate)."""
    return AnalyticsService.get_overview(
        user_id=current_user["id"],
        token=current_user.get("token"),
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/monthly", response_model=MonthlyAnalyticsResponse)
def get_monthly_analytics(
    months: int = Query(6, ge=1, le=24, description="Number of past months to aggregate"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve historical monthly cash flow trends."""
    return AnalyticsService.get_monthly(
        user_id=current_user["id"],
        token=current_user.get("token"),
        months_count=months,
    )


@router.get("/categories", response_model=CategoryAnalyticsResponse)
def get_category_analytics(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    type: str = Query("expense", pattern="^(income|expense)$", description="Transaction type filter"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve category breakdown and spending percentages."""
    return AnalyticsService.get_categories(
        user_id=current_user["id"],
        token=current_user.get("token"),
        start_date=start_date,
        end_date=end_date,
        tx_type=type,
    )


@router.get("/top-expenses", response_model=TopExpensesResponse)
def get_top_expenses(
    limit: int = Query(5, ge=1, le=50, description="Max number of top expenses to return"),
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve highest individual expense transactions."""
    return AnalyticsService.get_top_expenses(
        user_id=current_user["id"],
        token=current_user.get("token"),
        limit=limit,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/budget", response_model=BudgetAnalyticsResponse)
def get_budget_analytics(
    month: Optional[str] = Query(None, description="Target month in YYYY-MM or YYYY-MM-DD format"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve budget utilization overview and category status distributions."""
    return AnalyticsService.get_budget_analytics(
        user_id=current_user["id"],
        token=current_user.get("token"),
        month=month,
    )
