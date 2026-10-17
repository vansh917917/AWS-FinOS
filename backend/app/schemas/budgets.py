from datetime import date
from decimal import Decimal
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas.transactions import EXPENSE_CATEGORIES


class BudgetStatus(str, Enum):
    UNDER_BUDGET = "under_budget"
    NEAR_LIMIT = "near_limit"
    OVER_BUDGET = "over_budget"


def normalize_month_str(val: str) -> str:
    """Normalize input string (YYYY-MM or YYYY-MM-DD) to canonical YYYY-MM-01 date format."""
    val = val.strip()
    if len(val) == 7 and val[4] == "-":
        return f"{val}-01"
    elif len(val) == 10 and val[4] == "-" and val[7] == "-":
        return f"{val[:7]}-01"
    raise ValueError("Month must be formatted as YYYY-MM or YYYY-MM-DD (e.g. '2026-09' or '2026-09-01')")


class BudgetBase(BaseModel):
    category: str
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Monthly budget amount must be greater than 0")
    month: str = Field(..., description="Canonical month e.g. '2026-09-01' or '2026-09'")

    @field_validator("month")
    @classmethod
    def validate_and_normalize_month(cls, v: str) -> str:
        return normalize_month_str(v)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in EXPENSE_CATEGORIES:
            raise ValueError(
                f"Invalid budget category '{v}'. Budgets can only be set for expense categories: {', '.join(EXPENSE_CATEGORIES)}"
            )
        return v


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Updated budget amount must be greater than 0")


class BudgetResponse(BaseModel):
    id: str
    user_id: str
    category: str
    month: str
    budget_amount: float
    spent_amount: float
    remaining_amount: float
    percentage_used: float
    status: BudgetStatus
    created_at: str
    updated_at: str


class BudgetListResponse(BaseModel):
    month: str
    items: List[BudgetResponse]
    total_budgeted: float
    total_spent: float
    overall_percentage: float
