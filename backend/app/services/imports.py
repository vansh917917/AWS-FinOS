import json
import math
import re
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any, List, Set

from fastapi import HTTPException, status
from app.db.database import get_db
from app.schemas.imports import (
    ImportPreviewResponse,
    ImportConfirmResponse,
    StatementImportResponse,
    StatementImportListResponse,
    PreviewRowItem,
    RowStatus,
    ImportStatus,
)
from app.schemas.transactions import TransactionCreate, INCOME_CATEGORIES, EXPENSE_CATEGORIES
from app.services.parsers.csv_parser import CSVStatementParser
from app.services.parsers.pdf_parser import PDFStatementParser
from app.services.merchant_normalizer import MerchantNormalizer


class ImportService:
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    @staticmethod
    def _make_fingerprint(date_str: str, amount: float, tx_type: str, desc: str) -> str:
        clean_desc = re.sub(r"\s+", " ", (desc or "").strip().lower())
        return f"{date_str}|{round(float(amount), 2):.2f}|{tx_type.lower()}|{clean_desc}"

    @classmethod
    def create_preview(
        cls,
        user_id: str,
        token: Optional[str],
        file_bytes: bytes,
        filename: str,
    ) -> ImportPreviewResponse:
        if not file_bytes or len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )
        if len(file_bytes) > cls.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds maximum allowed limit of 10 MB.",
            )

        lower_fn = filename.lower()
        if lower_fn.endswith(".csv"):
            ext = "csv"
            raw_rows = CSVStatementParser.parse(file_bytes, filename)
        elif lower_fn.endswith(".pdf"):
            ext = "pdf"
            raw_rows = PDFStatementParser.parse(file_bytes, filename)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file extension. Only CSV and PDF statement formats are supported.",
            )

        if not raw_rows:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No transaction rows could be extracted from the uploaded statement file.",
            )

        # Fetch existing transactions for fingerprinting
        with get_db() as conn:
            existing_rows = conn.execute(
                "SELECT transaction_date, amount, type, description FROM transactions WHERE user_id = ?",
                (user_id,),
            ).fetchall()

        existing_fingerprints: Set[str] = set()
        for r in existing_rows:
            fp = cls._make_fingerprint(
                str(r["transaction_date"]),
                float(r["amount"]),
                str(r["type"]),
                str(r["description"] or ""),
            )
            existing_fingerprints.add(fp)

        preview_items: List[PreviewRowItem] = []
        batch_fingerprints: Set[str] = set()

        for idx, row in enumerate(raw_rows):
            is_valid_format = (
                row.date_str is not None
                and row.amount is not None
                and row.amount > 0
                and row.error is None
                and row.direction in ("income", "expense")
            )

            if not is_valid_format:
                if row.direction == "ambiguous":
                    status_enum = RowStatus.NEEDS_REVIEW
                    status_reason = row.error or "Debit/Credit direction requires review"
                else:
                    status_enum = RowStatus.INVALID
                    status_reason = row.error or "Missing valid date, positive amount, or direction"
                is_selectable = False
                default_selected = False
            else:
                amt_float = float(row.amount)
                fp = cls._make_fingerprint(row.date_str, amt_float, row.direction, row.description)

                if fp in existing_fingerprints or fp in batch_fingerprints:
                    status_enum = RowStatus.POTENTIAL_DUPLICATE
                    status_reason = "Identical transaction (date, amount, type, description) already exists"
                    is_selectable = True
                    default_selected = False
                else:
                    status_enum = RowStatus.NEW
                    status_reason = None
                    is_selectable = True
                    default_selected = True
                    batch_fingerprints.add(fp)

            # Determine proper category distribution
            matched_category = None
            if getattr(row, "category", None) and str(row.category).strip():
                matched_category = str(row.category).strip()

            if not matched_category:
                _, suggested_cat = MerchantNormalizer.match_known_merchant(row.description or "")
                if suggested_cat:
                    matched_category = suggested_cat

            if row.direction == "income":
                assigned_category = matched_category if matched_category in INCOME_CATEGORIES else "Other Income"
            elif row.direction == "expense":
                assigned_category = matched_category if matched_category in EXPENSE_CATEGORIES else "Other Expense"
            else:
                assigned_category = "Other Expense"

            preview_items.append(
                PreviewRowItem(
                    index=idx,
                    date=row.date_str,
                    description=row.description or "Statement Transaction",
                    amount=float(row.amount) if row.amount is not None else None,
                    type=row.direction if row.direction in ("income", "expense") else None,
                    category=assigned_category,
                    status=status_enum,
                    status_reason=status_reason,
                    is_selectable=is_selectable,
                    default_selected=default_selected,
                )
            )

        total_rows = len(preview_items)
        valid_rows = sum(1 for item in preview_items if item.status == RowStatus.NEW)
        duplicate_rows = sum(1 for item in preview_items if item.status == RowStatus.POTENTIAL_DUPLICATE)
        review_rows = sum(1 for item in preview_items if item.status == RowStatus.NEEDS_REVIEW)
        invalid_rows = sum(1 for item in preview_items if item.status == RowStatus.INVALID)

        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
        expires_at_str = expires_at.isoformat()
        now_str = datetime.now(timezone.utc).isoformat()
        created_id = str(uuid.uuid4())

        preview_json = json.dumps([item.model_dump() for item in preview_items])

        with get_db() as conn:
            conn.execute(
                """
                INSERT INTO statement_imports (
                    id, user_id, filename, file_type, status, total_rows, valid_rows,
                    imported_rows, duplicate_rows, failed_rows, error_message, preview_data,
                    created_at, expires_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    created_id,
                    user_id,
                    filename,
                    ext,
                    ImportStatus.PREVIEW_READY.value,
                    total_rows,
                    valid_rows,
                    0,
                    duplicate_rows,
                    review_rows + invalid_rows,
                    "",
                    preview_json,
                    now_str,
                    expires_at_str,
                ),
            )

        return ImportPreviewResponse(
            import_id=created_id,
            filename=filename,
            file_type=ext,
            total_rows=total_rows,
            valid_rows=valid_rows,
            duplicate_rows=duplicate_rows,
            review_rows=review_rows,
            invalid_rows=invalid_rows,
            expires_at=expires_at_str,
            items=preview_items,
        )

    @classmethod
    def confirm_import(
        cls,
        user_id: str,
        token: Optional[str],
        import_id: str,
        selected_indices: List[int],
        category_overrides: Optional[Dict[int, str]] = None,
    ) -> ImportConfirmResponse:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM statement_imports WHERE id = ? AND user_id = ?",
                (import_id, user_id),
            ).fetchone()
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Statement import preview not found",
                )
            record = dict(row)

        if record.get("status") == ImportStatus.COMPLETED.value:
            return ImportConfirmResponse(
                import_id=import_id,
                status=ImportStatus.COMPLETED.value,
                imported_count=int(record.get("imported_rows") or 0),
                skipped_duplicate_count=int(record.get("duplicate_rows") or 0),
                skipped_invalid_count=int(record.get("failed_rows") or 0),
                message="This statement import has already been completed.",
            )

        expires_at_raw = record.get("expires_at")
        if expires_at_raw:
            try:
                expires_at = datetime.fromisoformat(expires_at_raw.replace("Z", "+00:00"))
                if datetime.now(timezone.utc) > expires_at:
                    with get_db() as conn:
                        conn.execute(
                            "UPDATE statement_imports SET status = ? WHERE id = ? AND user_id = ?",
                            (ImportStatus.EXPIRED.value, import_id, user_id),
                        )
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="This statement preview has expired (24 hours). Please re-upload your file.",
                    )
            except HTTPException:
                raise
            except Exception:
                pass

        if record.get("status") != ImportStatus.PREVIEW_READY.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot confirm import with status '{record.get('status')}'.",
            )

        try:
            raw_items = json.loads(record.get("preview_data") or "[]")
        except Exception:
            raw_items = []

        index_map = {
            item["index"]: item for item in raw_items if isinstance(item, dict) and "index" in item
        }

        selected_set = set(selected_indices)
        transactions_to_insert: List[Dict[str, Any]] = []
        now_iso = datetime.now(timezone.utc).isoformat()

        for idx in selected_set:
            item = index_map.get(idx)
            if not item or not item.get("is_selectable"):
                continue

            date_val = item.get("date")
            amt_val = item.get("amount")
            type_val = item.get("type")
            override = None
            if category_overrides:
                override = category_overrides.get(idx) or category_overrides.get(str(idx))
            cat_val = override or item.get("category") or ("Other Income" if type_val == "income" else "Other Expense")
            desc_val = item.get("description") or ""

            if not date_val or amt_val is None or type_val not in ("income", "expense"):
                continue

            try:
                parsed_date = datetime.strptime(date_val, "%Y-%m-%d").date()
                validated_model = TransactionCreate(
                    type=type_val,
                    amount=Decimal(str(amt_val)),
                    category=cat_val,
                    description=desc_val,
                    transaction_date=parsed_date,
                )
                transactions_to_insert.append({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "type": validated_model.type.value,
                    "amount": float(validated_model.amount),
                    "category": validated_model.category,
                    "description": validated_model.description or "",
                    "transaction_date": validated_model.transaction_date.isoformat(),
                    "created_at": now_iso,
                    "updated_at": now_iso,
                })
            except Exception:
                continue

        with get_db() as conn:
            for tx in transactions_to_insert:
                conn.execute(
                    """
                    INSERT INTO transactions (id, user_id, type, amount, category, description, transaction_date, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        tx["id"],
                        tx["user_id"],
                        tx["type"],
                        tx["amount"],
                        tx["category"],
                        tx["description"],
                        tx["transaction_date"],
                        tx["created_at"],
                        tx["updated_at"],
                    ),
                )

            imported_count = len(transactions_to_insert)
            duplicate_count = sum(
                1 for item in raw_items
                if item.get("status") == RowStatus.POTENTIAL_DUPLICATE.value and item.get("index") not in selected_set
            )
            invalid_count = sum(
                1 for item in raw_items
                if item.get("status") in (RowStatus.INVALID.value, RowStatus.NEEDS_REVIEW.value)
            )

            completed_at = datetime.now(timezone.utc).isoformat()
            conn.execute(
                """
                UPDATE statement_imports 
                SET status = ?, imported_rows = ?, completed_at = ?
                WHERE id = ? AND user_id = ?
                """,
                (ImportStatus.COMPLETED.value, imported_count, completed_at, import_id, user_id),
            )

        return ImportConfirmResponse(
            import_id=import_id,
            status=ImportStatus.COMPLETED.value,
            imported_count=imported_count,
            skipped_duplicate_count=duplicate_count,
            skipped_invalid_count=invalid_count,
            message=f"Successfully imported {imported_count} transactions.",
        )

    @classmethod
    def list_imports(
        cls,
        user_id: str,
        token: Optional[str],
        page: int = 1,
        limit: int = 20,
    ) -> StatementImportListResponse:
        offset = (page - 1) * limit
        with get_db() as conn:
            total = conn.execute(
                "SELECT COUNT(*) as total FROM statement_imports WHERE user_id = ?",
                (user_id,),
            ).fetchone()["total"]

            rows = conn.execute(
                """
                SELECT id, user_id, filename, file_type, status, total_rows, valid_rows,
                       imported_rows, duplicate_rows, failed_rows, error_message, created_at,
                       completed_at, expires_at
                FROM statement_imports
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                (user_id, limit, offset),
            ).fetchall()

        pages = max(1, math.ceil(total / limit)) if total > 0 else 1

        items = [
            StatementImportResponse(
                id=str(row["id"]),
                user_id=str(row["user_id"]),
                filename=str(row["filename"]),
                file_type=str(row["file_type"]),
                status=str(row["status"]),
                total_rows=int(row["total_rows"] or 0),
                valid_rows=int(row["valid_rows"] or 0),
                imported_rows=int(row["imported_rows"] or 0),
                duplicate_rows=int(row["duplicate_rows"] or 0),
                failed_rows=int(row["failed_rows"] or 0),
                error_message=str(row["error_message"] or ""),
                created_at=str(row["created_at"]),
                completed_at=str(row["completed_at"]) if row["completed_at"] else None,
                expires_at=str(row["expires_at"]),
            )
            for row in rows
        ]

        return StatementImportListResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )

    @classmethod
    def get_import(
        cls,
        user_id: str,
        token: Optional[str],
        import_id: str,
    ) -> StatementImportResponse:
        with get_db() as conn:
            row = conn.execute(
                """
                SELECT id, user_id, filename, file_type, status, total_rows, valid_rows,
                       imported_rows, duplicate_rows, failed_rows, error_message, created_at,
                       completed_at, expires_at
                FROM statement_imports
                WHERE id = ? AND user_id = ?
                """,
                (import_id, user_id),
            ).fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Statement import record not found",
            )

        return StatementImportResponse(
            id=str(row["id"]),
            user_id=str(row["user_id"]),
            filename=str(row["filename"]),
            file_type=str(row["file_type"]),
            status=str(row["status"]),
            total_rows=int(row["total_rows"] or 0),
            valid_rows=int(row["valid_rows"] or 0),
            imported_rows=int(row["imported_rows"] or 0),
            duplicate_rows=int(row["duplicate_rows"] or 0),
            failed_rows=int(row["failed_rows"] or 0),
            error_message=str(row["error_message"] or ""),
            created_at=str(row["created_at"]),
            completed_at=str(row["completed_at"]) if row["completed_at"] else None,
            expires_at=str(row["expires_at"]),
        )
