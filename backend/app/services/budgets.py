import calendar
import uuid
from datetime import date, datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status

from app.db.database import get_db
from app.schemas.budgets import (
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse,
    BudgetListResponse,
    BudgetStatus,
    normalize_month_str,
)


def get_month_date_range(month_str: str):
    """Returns (start_date_str, end_date_str) for a given YYYY-MM-01 or YYYY-MM string."""
    parts = month_str.split("-")
    year = int(parts[0])
    month = int(parts[1])
    _, last_day = calendar.monthrange(year, month)
    start_date = f"{year:04d}-{month:02d}-01"
    end_date = f"{year:04d}-{month:02d}-{last_day:02d}"
    return start_date, end_date


class BudgetService:
    @classmethod
    def calculate_budget_metrics(
        cls,
        budget_row: Dict[str, Any],
        actual_spent: float,
    ) -> BudgetResponse:
        budget_amt = float(budget_row["budget_amount"])
        remaining_amt = budget_amt - actual_spent
        pct_used = round((actual_spent / budget_amt * 100), 2) if budget_amt > 0 else 0.0

        if pct_used > 100.0:
            b_status = BudgetStatus.OVER_BUDGET
        elif pct_used >= 80.0:
            b_status = BudgetStatus.NEAR_LIMIT
        else:
            b_status = BudgetStatus.UNDER_BUDGET

        return BudgetResponse(
            id=str(budget_row["id"]),
            user_id=str(budget_row["user_id"]),
            category=budget_row["category"],
            month=str(budget_row["month"]),
            budget_amount=round(budget_amt, 2),
            spent_amount=round(actual_spent, 2),
            remaining_amount=round(remaining_amt, 2),
            percentage_used=pct_used,
            status=b_status,
            created_at=str(budget_row["created_at"]),
            updated_at=str(budget_row["updated_at"]),
        )

    @classmethod
    def get_budgets(
        cls,
        user_id: str,
        token: Optional[str] = None,
        month: Optional[str] = None,
    ) -> BudgetListResponse:
        target_month = normalize_month_str(month) if month else date.today().replace(day=1).isoformat()
        start_date, end_date = get_month_date_range(target_month)

        with get_db() as conn:
            budget_rows = conn.execute(
                "SELECT * FROM budgets WHERE user_id = ? AND month = ? ORDER BY category",
                (user_id, target_month),
            ).fetchall()

            tx_rows = conn.execute(
                """
                SELECT category, SUM(amount) as total_spent
                FROM transactions
                WHERE user_id = ? AND type = 'expense' AND transaction_date >= ? AND transaction_date <= ?
                GROUP BY category
                """,
                (user_id, start_date, end_date),
            ).fetchall()

        spent_by_category = {row["category"]: float(row["total_spent"]) for row in tx_rows}

        items: List[BudgetResponse] = []
        total_budgeted = 0.0
        total_spent = 0.0

        for b in budget_rows:
            cat = b["category"]
            actual = spent_by_category.get(cat, 0.0)
            item = cls.calculate_budget_metrics(dict(b), actual)
            items.append(item)
            total_budgeted += item.budget_amount
            total_spent += item.spent_amount

        overall_pct = round((total_spent / total_budgeted * 100), 2) if total_budgeted > 0 else 0.0

        return BudgetListResponse(
            month=target_month,
            items=items,
            total_budgeted=round(total_budgeted, 2),
            total_spent=round(total_spent, 2),
            overall_percentage=overall_pct,
        )

    @classmethod
    def get_budget(
        cls,
        user_id: str,
        token: Optional[str],
        budget_id: str,
    ) -> BudgetResponse:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM budgets WHERE id = ? AND user_id = ?",
                (budget_id, user_id),
            ).fetchone()
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Budget not found or unauthorized.",
                )
            b = dict(row)
            start_date, end_date = get_month_date_range(str(b["month"]))

            tx_row = conn.execute(
                """
                SELECT COALESCE(SUM(amount), 0) as total_spent
                FROM transactions
                WHERE user_id = ? AND type = 'expense' AND category = ? AND transaction_date >= ? AND transaction_date <= ?
                """,
                (user_id, b["category"], start_date, end_date),
            ).fetchone()
            actual = float(tx_row["total_spent"])

        return cls.calculate_budget_metrics(b, actual)

    @classmethod
    def create_budget(
        cls,
        user_id: str,
        token: Optional[str],
        payload: BudgetCreate,
    ) -> BudgetResponse:
        target_month = payload.month
        now_iso = datetime.now(timezone.utc).isoformat()
        b_id = str(uuid.uuid4())

        try:
            with get_db() as conn:
                existing = conn.execute(
                    "SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ?",
                    (user_id, payload.category, target_month),
                ).fetchone()
                if existing:
                    month_label = target_month[:7]
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"A budget for '{payload.category}' already exists for {month_label}.",
                    )

                conn.execute(
                    """
                    INSERT INTO budgets (id, user_id, category, month, budget_amount, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        b_id,
                        user_id,
                        payload.category,
                        target_month,
                        float(payload.amount),
                        now_iso,
                        now_iso,
                    ),
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create budget: {str(e)}",
            )

        return cls.get_budget(user_id, token, b_id)

    @classmethod
    def update_budget(
        cls,
        user_id: str,
        token: Optional[str],
        budget_id: str,
        payload: BudgetUpdate,
    ) -> BudgetResponse:
        now_iso = datetime.now(timezone.utc).isoformat()
        with get_db() as conn:
            existing = conn.execute(
                "SELECT id FROM budgets WHERE id = ? AND user_id = ?",
                (budget_id, user_id),
            ).fetchone()
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Budget not found or unauthorized.",
                )

            conn.execute(
                "UPDATE budgets SET budget_amount = ?, updated_at = ? WHERE id = ? AND user_id = ?",
                (float(payload.amount), now_iso, budget_id, user_id),
            )

        return cls.get_budget(user_id, token, budget_id)

    @classmethod
    def delete_budget(
        cls,
        user_id: str,
        token: Optional[str],
        budget_id: str,
    ) -> Dict[str, str]:
        with get_db() as conn:
            existing = conn.execute(
                "SELECT id FROM budgets WHERE id = ? AND user_id = ?",
                (budget_id, user_id),
            ).fetchone()
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Budget not found or unauthorized.",
                )

            conn.execute(
                "DELETE FROM budgets WHERE id = ? AND user_id = ?",
                (budget_id, user_id),
            )
        return {"message": "Budget deleted successfully."}
