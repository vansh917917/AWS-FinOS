import math
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from app.db.database import get_db
from app.schemas.transactions import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
    CashFlowSummaryResponse,
    INCOME_CATEGORIES,
    EXPENSE_CATEGORIES,
)


class TransactionService:
    @classmethod
    def list_transactions(
        cls,
        user_id: str,
        token: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        type: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        sort_order: str = "desc",
    ) -> TransactionListResponse:
        conditions = ["user_id = ?"]
        params: List[Any] = [user_id]

        if type and type in ("income", "expense"):
            conditions.append("type = ?")
            params.append(type)

        if category:
            conditions.append("category = ?")
            params.append(category)

        if start_date:
            conditions.append("transaction_date >= ?")
            params.append(start_date)

        if end_date:
            conditions.append("transaction_date <= ?")
            params.append(end_date)

        if search:
            clean_search = f"%{search.strip()}%"
            conditions.append("(description LIKE ? OR category LIKE ?)")
            params.extend([clean_search, clean_search])

        where_clause = " WHERE " + " AND ".join(conditions)
        order_dir = "ASC" if sort_order.lower() == "asc" else "DESC"
        offset = max(0, (page - 1) * limit)

        try:
            with get_db() as conn:
                count_query = f"SELECT COUNT(*) as total FROM transactions {where_clause}"
                total = conn.execute(count_query, params).fetchone()["total"]

                query = f"""
                    SELECT * FROM transactions
                    {where_clause}
                    ORDER BY transaction_date {order_dir}, created_at {order_dir}
                    LIMIT ? OFFSET ?
                """
                rows = conn.execute(query, params + [limit, offset]).fetchall()

                total_pages = max(1, math.ceil(total / limit))

                items = [
                    TransactionResponse(
                        id=str(row["id"]),
                        user_id=str(row["user_id"]),
                        type=str(row["type"]),
                        amount=float(row["amount"]),
                        category=str(row["category"]),
                        description=str(row["description"] or ""),
                        transaction_date=str(row["transaction_date"]),
                        created_at=str(row["created_at"]),
                        updated_at=str(row["updated_at"]),
                    )
                    for row in rows
                ]

                return TransactionListResponse(
                    items=items,
                    total=total,
                    page=page,
                    limit=limit,
                    total_pages=total_pages,
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to query transactions: {str(e)}",
            )

    @classmethod
    def get_transaction(
        cls, user_id: str, token: Optional[str], transaction_id: str
    ) -> Dict[str, Any]:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
                (transaction_id, user_id),
            ).fetchone()
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Transaction with ID '{transaction_id}' not found",
                )
            return dict(row)

    @classmethod
    def create_transaction(
        cls, user_id: str, token: Optional[str], data: TransactionCreate
    ) -> TransactionResponse:
        tx_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        try:
            with get_db() as conn:
                conn.execute(
                    """
                    INSERT INTO transactions (
                        id, user_id, type, amount, category, description, transaction_date, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        tx_id,
                        user_id,
                        data.type.value,
                        float(data.amount),
                        data.category,
                        data.description or "",
                        data.transaction_date.isoformat(),
                        now,
                        now,
                    ),
                )

            return TransactionResponse(
                id=tx_id,
                user_id=user_id,
                type=data.type.value,
                amount=float(data.amount),
                category=data.category,
                description=data.description or "",
                transaction_date=data.transaction_date.isoformat(),
                created_at=now,
                updated_at=now,
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create transaction: {str(e)}",
            )

    @classmethod
    def update_transaction(
        cls,
        user_id: str,
        token: Optional[str],
        transaction_id: str,
        data: TransactionUpdate,
    ) -> TransactionResponse:
        existing = cls.get_transaction(user_id, token, transaction_id)

        final_type = data.type.value if data.type is not None else existing["type"]
        final_category = data.category if data.category is not None else existing["category"]

        if final_type == "income" and final_category not in INCOME_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Category '{final_category}' is invalid for income. Allowed: {', '.join(INCOME_CATEGORIES)}",
            )
        if final_type == "expense" and final_category not in EXPENSE_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Category '{final_category}' is invalid for expense. Allowed: {', '.join(EXPENSE_CATEGORIES)}",
            )

        set_clauses: List[str] = []
        params: List[Any] = []

        if data.type is not None:
            set_clauses.append("type = ?")
            params.append(data.type.value)
        if data.amount is not None:
            set_clauses.append("amount = ?")
            params.append(float(data.amount))
        if data.category is not None:
            set_clauses.append("category = ?")
            params.append(data.category)
        if data.description is not None:
            set_clauses.append("description = ?")
            params.append(data.description)
        if data.transaction_date is not None:
            set_clauses.append("transaction_date = ?")
            params.append(data.transaction_date.isoformat())

        if not set_clauses:
            return TransactionResponse(
                id=str(existing["id"]),
                user_id=str(existing["user_id"]),
                type=str(existing["type"]),
                amount=float(existing["amount"]),
                category=str(existing["category"]),
                description=str(existing["description"] or ""),
                transaction_date=str(existing["transaction_date"]),
                created_at=str(existing["created_at"]),
                updated_at=str(existing["updated_at"]),
            )

        now = datetime.now(timezone.utc).isoformat()
        set_clauses.append("updated_at = ?")
        params.append(now)

        params.extend([transaction_id, user_id])
        query = f"UPDATE transactions SET {', '.join(set_clauses)} WHERE id = ? AND user_id = ?"

        try:
            with get_db() as conn:
                conn.execute(query, params)
            return cls.get_transaction(user_id, token, transaction_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update transaction: {str(e)}",
            )

    @classmethod
    def delete_transaction(
        cls, user_id: str, token: Optional[str], transaction_id: str
    ) -> Dict[str, Any]:
        cls.get_transaction(user_id, token, transaction_id)

        try:
            with get_db() as conn:
                conn.execute(
                    "DELETE FROM transactions WHERE id = ? AND user_id = ?",
                    (transaction_id, user_id),
                )
            return {"status": "deleted", "id": transaction_id}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete transaction: {str(e)}",
            )

    @classmethod
    def get_summary(
        cls,
        user_id: str,
        token: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> CashFlowSummaryResponse:
        conditions = ["user_id = ?"]
        params: List[Any] = [user_id]

        if start_date:
            conditions.append("transaction_date >= ?")
            params.append(start_date)
        if end_date:
            conditions.append("transaction_date <= ?")
            params.append(end_date)

        where_clause = " WHERE " + " AND ".join(conditions)

        try:
            with get_db() as conn:
                query = f"""
                    SELECT 
                        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
                    FROM transactions
                    {where_clause}
                """
                row = conn.execute(query, params).fetchone()
                total_income = Decimal(str(row["total_income"]))
                total_expense = Decimal(str(row["total_expense"]))
                net_cash_flow = total_income - total_expense

                return CashFlowSummaryResponse(
                    total_income=float(round(total_income, 2)),
                    total_expense=float(round(total_expense, 2)),
                    net_cash_flow=float(round(net_cash_flow, 2)),
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to calculate cash flow summary: {str(e)}",
            )

    @classmethod
    def reset_user_data(cls, user_id: str, token: Optional[str] = None) -> Dict[str, Any]:
        with get_db() as conn:
            conn.execute("DELETE FROM transactions WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM statement_imports WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM budgets WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM goals WHERE user_id = ?", (user_id,))
        return {
            "status": "success",
            "message": "All financial transactions, budgets, goals, and statement imports have been reset to zero.",
        }
