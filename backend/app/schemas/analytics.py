from typing import List, Optional
from pydantic import BaseModel


class AnalyticsOverviewResponse(BaseModel):
    total_income: float
    total_expense: float
    net_cash_flow: float
    savings_rate: float
    transaction_count: int
    expense_count: int
    average_expense: float
    period_start: Optional[str] = None
    period_end: Optional[str] = None


class MonthlyCashFlowItem(BaseModel):
    month: str
    month_label: str
    income: float
    expenses: float
    net_cash_flow: float


class MonthlyAnalyticsResponse(BaseModel):
    items: List[MonthlyCashFlowItem]


class CategorySpendingItem(BaseModel):
    category: str
    amount: float
    percentage: float
    transaction_count: int


class CategoryAnalyticsResponse(BaseModel):
    type: str
    total_amount: float
    items: List[CategorySpendingItem]


class TopExpenseItem(BaseModel):
    id: str
    date: str
    description: str
    category: str
    amount: float


class TopExpensesResponse(BaseModel):
    items: List[TopExpenseItem]


class BudgetUtilizationItem(BaseModel):
    category: str
    budget_amount: float
    spent_amount: float
    remaining_amount: float
    percentage_used: float
    status: str


class BudgetAnalyticsResponse(BaseModel):
    month: str
    total_budgeted: float
    total_spent: float
    overall_utilization_pct: float
    categories_under_budget: int
    categories_near_limit: int
    categories_over_budget: int
    items: List[BudgetUtilizationItem]
