from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from app.api.deps import get_current_user
from app.schemas.transactions import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
    CashFlowSummaryResponse,
)
from app.services.transactions import TransactionService

router = APIRouter(prefix="/transactions", tags=["Cash Flow Transactions"])


# 1. Static route: List transactions (with search, filter, pagination, sort)
@router.get("", response_model=TransactionListResponse)
def list_transactions(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
    type: Optional[str] = Query(default=None, description="Filter by type: income or expense"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    search: Optional[str] = Query(default=None, description="Search in description or category"),
    start_date: Optional[str] = Query(default=None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(default=None, description="End date (YYYY-MM-DD)"),
    sort_order: str = Query(default="desc", description="Sort order: desc (newest) or asc (oldest)"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    List transactions for the authenticated user.
    Supports search, type/category filters, date ranges, and pagination.
    """
    return TransactionService.list_transactions(
        user_id=user["id"],
        token=user.get("token"),
        page=page,
        limit=limit,
        type=type,
        category=category,
        search=search,
        start_date=start_date,
        end_date=end_date,
        sort_order=sort_order,
    )


# 2. Static route: Cash Flow Summary (registered BEFORE dynamic /{transaction_id})
@router.get("/summary", response_model=CashFlowSummaryResponse)
def get_cash_flow_summary(
    start_date: Optional[str] = Query(default=None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(default=None, description="End date (YYYY-MM-DD)"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns total income, total expense, and net cash flow for the authenticated user.
    Accepts optional date range parameters.
    """
    return TransactionService.get_summary(
        user_id=user["id"],
        token=user.get("token"),
        start_date=start_date,
        end_date=end_date,
    )


# 3. Dynamic route: Get single transaction
@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Retrieve a single transaction by ID.
    Enforces user ownership.
    """
    row = TransactionService.get_transaction(
        user_id=user["id"],
        token=user.get("token"),
        transaction_id=transaction_id,
    )
    return TransactionResponse(
        id=str(row["id"]),
        user_id=str(row["user_id"]),
        type=str(row["type"]),
        amount=float(row["amount"]),
        category=str(row["category"]),
        description=str(row.get("description") or ""),
        transaction_date=str(row["transaction_date"]),
        created_at=str(row["created_at"]),
        updated_at=str(row["updated_at"]),
    )


# 4. Create transaction
@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    data: TransactionCreate,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Create a new transaction for the authenticated user.
    Validates amount > 0 and category compatibility with type.
    """
    return TransactionService.create_transaction(
        user_id=user["id"],
        token=user.get("token"),
        data=data,
    )


# 5. Update transaction
@router.patch("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    data: TransactionUpdate,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Partially update an existing transaction.
    Performs cross-field validation to guarantee type and category remain compatible.
    """
    return TransactionService.update_transaction(
        user_id=user["id"],
        token=user.get("token"),
        transaction_id=transaction_id,
        data=data,
    )


# 6. Delete transaction
@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Delete a transaction. Only the authenticated owner can delete it.
    """
    return TransactionService.delete_transaction(
        user_id=user["id"],
        token=user.get("token"),
        transaction_id=transaction_id,
    )


# 7. Reset all transactions and financial data
@router.post("/reset")
def reset_transactions(
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Reset all user financial data (transactions, imports, budgets, goals) to zero.
    """
    return TransactionService.reset_user_data(
        user_id=user["id"],
        token=user.get("token"),
    )
