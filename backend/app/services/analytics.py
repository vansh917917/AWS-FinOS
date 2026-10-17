import calendar
from datetime import date, timedelta
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status

from app.db.database import get_db
from app.services.budgets import BudgetService
from app.schemas.budgets import BudgetStatus
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    MonthlyCashFlowItem,
    MonthlyAnalyticsResponse,
    CategorySpendingItem,
    CategoryAnalyticsResponse,
    TopExpenseItem,
    TopExpensesResponse,
    BudgetUtilizationItem,
    BudgetAnalyticsResponse,
)


class AnalyticsService:
    @classmethod
    def get_overview(
        cls,
        user_id: str,
        token: Optional[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> AnalyticsOverviewResponse:
        conditions = ["user_id = ?"]
        params: List[Any] = [user_id]

        if start_date:
            conditions.append("transaction_date >= ?")
            params.append(start_date)
        if end_date:
            conditions.append("transaction_date <= ?")
            params.append(end_date)

        where_clause = " WHERE " + " AND ".join(conditions)

        with get_db() as conn:
            rows = conn.execute(
                f"SELECT type, amount FROM transactions {where_clause}",
                params,
            ).fetchall()

        total_income = 0.0
        total_expense = 0.0
        expense_count = 0

        for r in rows:
            amt = float(r["amount"])
            if r["type"] == "income":
                total_income += amt
            else:
                total_expense += amt
                expense_count += 1

        net_cash_flow = total_income - total_expense
        savings_rate = (net_cash_flow / total_income * 100.0) if total_income > 0 else 0.0
        avg_expense = (total_expense / expense_count) if expense_count > 0 else 0.0

        return AnalyticsOverviewResponse(
            total_income=round(total_income, 2),
            total_expense=round(total_expense, 2),
            net_cash_flow=round(net_cash_flow, 2),
            savings_rate=round(savings_rate, 2),
            transaction_count=len(rows),
            expense_count=expense_count,
            average_expense=round(avg_expense, 2),
            period_start=start_date,
            period_end=end_date,
        )

    @classmethod
    def get_monthly(
        cls,
        user_id: str,
        token: Optional[str],
        months_count: int = 6,
    ) -> MonthlyAnalyticsResponse:
        count = max(1, min(months_count, 24))

        today = date.today()
        months_list: List[date] = []
        curr = today.replace(day=1)
        for _ in range(count):
            months_list.append(curr)
            curr = (curr - timedelta(days=1)).replace(day=1)
        months_list.reverse()

        start_date = months_list[0].isoformat()
        _, last_day = calendar.monthrange(months_list[-1].year, months_list[-1].month)
        end_date = months_list[-1].replace(day=last_day).isoformat()

        with get_db() as conn:
            rows = conn.execute(
                """
                SELECT type, amount, transaction_date 
                FROM transactions 
                WHERE user_id = ? AND transaction_date >= ? AND transaction_date <= ?
                """,
                (user_id, start_date, end_date),
            ).fetchall()

        monthly_map: Dict[str, Dict[str, float]] = {
            m.strftime("%Y-%m"): {"income": 0.0, "expenses": 0.0}
            for m in months_list
        }

        for r in rows:
            tx_month = str(r["transaction_date"])[:7]
            amt = float(r["amount"])
            if tx_month in monthly_map:
                if r["type"] == "income":
                    monthly_map[tx_month]["income"] += amt
                else:
                    monthly_map[tx_month]["expenses"] += amt

        items: List[MonthlyCashFlowItem] = []
        for m in months_list:
            m_key = m.strftime("%Y-%m")
            label = m.strftime("%b %Y")
            inc = monthly_map[m_key]["income"]
            exp = monthly_map[m_key]["expenses"]
            items.append(
                MonthlyCashFlowItem(
                    month=m_key,
                    month_label=label,
                    income=round(inc, 2),
                    expenses=round(exp, 2),
                    net_cash_flow=round(inc - exp, 2),
                )
            )

        return MonthlyAnalyticsResponse(items=items)

    @classmethod
    def get_categories(
        cls,
        user_id: str,
        token: Optional[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        tx_type: str = "expense",
    ) -> CategoryAnalyticsResponse:
        chosen_type = "expense" if tx_type != "income" else "income"
        conditions = ["user_id = ?", "type = ?"]
        params: List[Any] = [user_id, chosen_type]

        if start_date:
            conditions.append("transaction_date >= ?")
            params.append(start_date)
        if end_date:
            conditions.append("transaction_date <= ?")
            params.append(end_date)

        where_clause = " WHERE " + " AND ".join(conditions)

        with get_db() as conn:
            rows = conn.execute(
                f"""
                SELECT category, SUM(amount) as amount, COUNT(*) as count 
                FROM transactions 
                {where_clause} 
                GROUP BY category 
                ORDER BY amount DESC
                """,
                params,
            ).fetchall()

        total_sum = sum(float(r["amount"]) for r in rows)
        items: List[CategorySpendingItem] = []

        for r in rows:
            cat = r["category"] or "Other"
            cat_amt = float(r["amount"])
            pct = round((cat_amt / total_sum * 100.0), 2) if total_sum > 0 else 0.0
            items.append(
                CategorySpendingItem(
                    category=cat,
                    amount=round(cat_amt, 2),
                    percentage=pct,
                    transaction_count=r["count"],
                )
            )

        return CategoryAnalyticsResponse(
            type=chosen_type,
            total_amount=round(total_sum, 2),
            items=items,
        )

    @classmethod
    def get_top_expenses(
        cls,
        user_id: str,
        token: Optional[str],
        limit: int = 5,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> TopExpensesResponse:
        safe_limit = max(1, min(limit, 50))
        conditions = ["user_id = ?", "type = 'expense'"]
        params: List[Any] = [user_id]

        if start_date:
            conditions.append("transaction_date >= ?")
            params.append(start_date)
        if end_date:
            conditions.append("transaction_date <= ?")
            params.append(end_date)

        where_clause = " WHERE " + " AND ".join(conditions)

        with get_db() as conn:
            rows = conn.execute(
                f"""
                SELECT id, transaction_date, description, category, amount 
                FROM transactions 
                {where_clause} 
                ORDER BY amount DESC 
                LIMIT ?
                """,
                params + [safe_limit],
            ).fetchall()

        items = [
            TopExpenseItem(
                id=str(r["id"]),
                date=str(r["transaction_date"]),
                description=r["description"] or r["category"] or "Expense",
                category=r["category"] or "Other Expense",
                amount=round(float(r["amount"]), 2),
            )
            for r in rows
        ]
        return TopExpensesResponse(items=items)

    @classmethod
    def get_budget_analytics(
        cls,
        user_id: str,
        token: Optional[str],
        month: Optional[str] = None,
    ) -> BudgetAnalyticsResponse:
        budgets_data = BudgetService.get_budgets(user_id, token, month)

        under_count = 0
        near_count = 0
        over_count = 0
        items: List[BudgetUtilizationItem] = []

        for b in budgets_data.items:
            if b.status == BudgetStatus.OVER_BUDGET:
                over_count += 1
            elif b.status == BudgetStatus.NEAR_LIMIT:
                near_count += 1
            else:
                under_count += 1

            items.append(
                BudgetUtilizationItem(
                    category=b.category,
                    budget_amount=b.budget_amount,
                    spent_amount=b.spent_amount,
                    remaining_amount=b.remaining_amount,
                    percentage_used=b.percentage_used,
                    status=b.status.value,
                )
            )

        return BudgetAnalyticsResponse(
            month=budgets_data.month,
            total_budgeted=budgets_data.total_budgeted,
            total_spent=budgets_data.total_spent,
            overall_utilization_pct=budgets_data.overall_percentage,
            categories_under_budget=under_count,
            categories_near_limit=near_count,
            categories_over_budget=over_count,
            items=items,
        )
