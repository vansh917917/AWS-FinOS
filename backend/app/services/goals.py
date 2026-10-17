import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status

from app.db.database import get_db
from app.schemas.goals import (
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    GoalListResponse,
    GoalStatus,
)


class GoalService:
    @classmethod
    def calculate_goal_metrics(cls, row: Dict[str, Any]) -> GoalResponse:
        target_amt = float(row["target_amount"])
        current_amt = float(row.get("current_amount", 0.0))
        remaining_amt = max(0.0, target_amt - current_amt)
        progress_pct = round((current_amt / target_amt * 100), 2) if target_amt > 0 else 0.0

        derived_status = GoalStatus.COMPLETED if current_amt >= target_amt else GoalStatus.IN_PROGRESS

        return GoalResponse(
            id=str(row["id"]),
            user_id=str(row["user_id"]),
            name=row["name"],
            description=row.get("description") or "",
            target_amount=round(target_amt, 2),
            current_amount=round(current_amt, 2),
            remaining_amount=round(remaining_amt, 2),
            progress_percentage=progress_pct,
            target_date=str(row["target_date"]) if row.get("target_date") else None,
            status=derived_status,
            created_at=str(row["created_at"]),
            updated_at=str(row["updated_at"]),
        )

    @classmethod
    def get_goals(
        cls,
        user_id: str,
        token: Optional[str] = None,
    ) -> GoalListResponse:
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,),
            ).fetchall()

        items: List[GoalResponse] = []
        total_target = 0.0
        total_current = 0.0

        for r in rows:
            goal_item = cls.calculate_goal_metrics(dict(r))
            items.append(goal_item)
            total_target += goal_item.target_amount
            total_current += goal_item.current_amount

        overall_pct = round((total_current / total_target * 100), 2) if total_target > 0 else 0.0

        return GoalListResponse(
            items=items,
            total_target_amount=round(total_target, 2),
            total_current_amount=round(total_current, 2),
            overall_progress_percentage=overall_pct,
        )

    @classmethod
    def get_goal(
        cls,
        user_id: str,
        token: Optional[str],
        goal_id: str,
    ) -> GoalResponse:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM goals WHERE id = ? AND user_id = ?",
                (goal_id, user_id),
            ).fetchone()
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Goal not found or unauthorized.",
                )
            return cls.calculate_goal_metrics(dict(row))

    @classmethod
    def create_goal(
        cls,
        user_id: str,
        token: Optional[str],
        payload: GoalCreate,
    ) -> GoalResponse:
        g_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()
        target_date_str = payload.target_date.isoformat() if payload.target_date else None

        with get_db() as conn:
            conn.execute(
                """
                INSERT INTO goals (id, user_id, name, description, target_amount, current_amount, target_date, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    g_id,
                    user_id,
                    payload.name,
                    payload.description or "",
                    float(payload.target_amount),
                    float(payload.current_amount),
                    target_date_str,
                    "in_progress",
                    now_iso,
                    now_iso,
                ),
            )

        return cls.get_goal(user_id, token, g_id)

    @classmethod
    def update_goal(
        cls,
        user_id: str,
        token: Optional[str],
        goal_id: str,
        payload: GoalUpdate,
    ) -> GoalResponse:
        now_iso = datetime.now(timezone.utc).isoformat()
        with get_db() as conn:
            existing = conn.execute(
                "SELECT * FROM goals WHERE id = ? AND user_id = ?",
                (goal_id, user_id),
            ).fetchone()
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Goal not found or unauthorized.",
                )

            set_clauses = ["updated_at = ?"]
            params: List[Any] = [now_iso]

            if payload.name is not None:
                set_clauses.append("name = ?")
                params.append(payload.name)
            if payload.description is not None:
                set_clauses.append("description = ?")
                params.append(payload.description)
            if payload.target_amount is not None:
                set_clauses.append("target_amount = ?")
                params.append(float(payload.target_amount))
            if payload.current_amount is not None:
                set_clauses.append("current_amount = ?")
                params.append(float(payload.current_amount))
            if payload.target_date is not None:
                set_clauses.append("target_date = ?")
                params.append(payload.target_date.isoformat())

            params.extend([goal_id, user_id])
            conn.execute(
                f"UPDATE goals SET {', '.join(set_clauses)} WHERE id = ? AND user_id = ?",
                params,
            )

        return cls.get_goal(user_id, token, goal_id)

    @classmethod
    def delete_goal(
        cls,
        user_id: str,
        token: Optional[str],
        goal_id: str,
    ) -> Dict[str, str]:
        with get_db() as conn:
            existing = conn.execute(
                "SELECT id FROM goals WHERE id = ? AND user_id = ?",
                (goal_id, user_id),
            ).fetchone()
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Goal not found or unauthorized.",
                )

            conn.execute(
                "DELETE FROM goals WHERE id = ? AND user_id = ?",
                (goal_id, user_id),
            )
        return {"message": "Goal deleted successfully."}
