from datetime import date
from decimal import Decimal
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator


class GoalStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the financial goal")
    description: Optional[str] = Field(default="", max_length=255)
    target_amount: Decimal = Field(..., gt=0, decimal_places=2, description="Target savings amount must be greater than 0")
    current_amount: Decimal = Field(default=Decimal("0.00"), ge=0, decimal_places=2, description="Current accumulated amount")
    target_date: Optional[date] = Field(default=None, description="Optional target date for achieving this goal")

    @model_validator(mode="after")
    def validate_amounts(self):
        if self.current_amount > self.target_amount:
            raise ValueError("Current saved amount cannot exceed target amount")
        return self


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)
    target_amount: Optional[Decimal] = Field(default=None, gt=0, decimal_places=2)
    current_amount: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    target_date: Optional[date] = None

    @model_validator(mode="after")
    def validate_amounts_if_both_provided(self):
        if self.target_amount is not None and self.current_amount is not None:
            if self.current_amount > self.target_amount:
                raise ValueError("Current saved amount cannot exceed target amount")
        return self


class GoalResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    target_amount: float
    current_amount: float
    remaining_amount: float
    progress_percentage: float
    target_date: Optional[str]
    status: GoalStatus
    created_at: str
    updated_at: str


class GoalListResponse(BaseModel):
    items: List[GoalResponse]
    total_target_amount: float
    total_current_amount: float
    overall_progress_percentage: float
