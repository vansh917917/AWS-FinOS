from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


INCOME_CATEGORIES = (
    "Salary",
    "Freelance",
    "Business",
    "Interest",
    "Other Income",
)

EXPENSE_CATEGORIES = (
    "Food",
    "Groceries",
    "Transportation",
    "Shopping",
    "Bills & Utilities",
    "Rent",
    "Education",
    "Healthcare",
    "Entertainment",
    "Travel",
    "Personal Care",
    "Subscriptions",
    "Other Expense",
)

ALL_CATEGORIES = INCOME_CATEGORIES + EXPENSE_CATEGORIES


class TransactionBase(BaseModel):
    type: TransactionType
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Must be greater than 0")
    category: str
    description: Optional[str] = Field(default="", max_length=255)
    transaction_date: date


class TransactionCreate(TransactionBase):
    @model_validator(mode="after")
    def validate_category_for_type(self):
        if self.type == TransactionType.INCOME:
            if self.category not in INCOME_CATEGORIES:
                raise ValueError(
                    f"Invalid income category '{self.category}'. Must be one of: {', '.join(INCOME_CATEGORIES)}"
                )
        elif self.type == TransactionType.EXPENSE:
            if self.category not in EXPENSE_CATEGORIES:
                raise ValueError(
                    f"Invalid expense category '{self.category}'. Must be one of: {', '.join(EXPENSE_CATEGORIES)}"
                )
        return self


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    amount: Optional[Decimal] = Field(default=None, gt=0, decimal_places=2)
    category: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=255)
    transaction_date: Optional[date] = None

    @model_validator(mode="after")
    def validate_category_if_both_provided(self):
        # If both are supplied in the request body, validate their compatibility immediately
        if self.type and self.category:
            if self.type == TransactionType.INCOME and self.category not in INCOME_CATEGORIES:
                raise ValueError(
                    f"Invalid income category '{self.category}'. Must be one of: {', '.join(INCOME_CATEGORIES)}"
                )
            if self.type == TransactionType.EXPENSE and self.category not in EXPENSE_CATEGORIES:
                raise ValueError(
                    f"Invalid expense category '{self.category}'. Must be one of: {', '.join(EXPENSE_CATEGORIES)}"
                )
        elif self.category and not self.type:
            # Check if category is valid in at least one list
            if self.category not in ALL_CATEGORIES:
                raise ValueError(f"Unknown transaction category '{self.category}'")
        return self


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    amount: float
    category: str
    description: str
    transaction_date: str
    created_at: str
    updated_at: str


class TransactionListResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class CashFlowSummaryResponse(BaseModel):
    total_income: float
    total_expense: float
    net_cash_flow: float
