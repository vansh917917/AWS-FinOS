import csv
import io
from typing import List, Dict, Optional, Tuple
from app.services.parsers.base import BaseStatementParser, RawParsedRow


class CSVStatementParser(BaseStatementParser):
    @classmethod
    def parse(cls, content_bytes: bytes, filename: str) -> List[RawParsedRow]:
        # Decode content
        text = None
        for encoding in ("utf-8-sig", "utf-8", "latin1", "cp1252"):
            try:
                text = content_bytes.decode(encoding)
                break
            except UnicodeDecodeError:
                continue

        if text is None:
            raise ValueError("Unable to decode CSV file. Please ensure it is a valid text-based CSV.")

        # Detect delimiter
        sample = text[:2048]
        delimiter = ","
        try:
            sniffer = csv.Sniffer()
            dialect = sniffer.sniff(sample)
            delimiter = dialect.delimiter
        except Exception:
            delimiter = ","

        reader = csv.reader(io.StringIO(text), delimiter=delimiter)
        rows = [r for r in reader if any(cell.strip() for cell in r)]

        if not rows:
            raise ValueError("The uploaded CSV statement is empty.")

        # Find header row
        header_index, col_map = cls._detect_columns(rows)
        if header_index is None:
            raise ValueError(
                "Could not automatically detect transaction column headers (Date, Description, Amount/Debit/Credit)."
            )

        parsed_rows: List[RawParsedRow] = []
        data_rows = rows[header_index + 1 :]

        for r in data_rows:
            if len(parsed_rows) >= cls.MAX_ROWS:
                break

            parsed_row = cls._parse_row(r, col_map)
            if parsed_row:
                parsed_rows.append(parsed_row)

        if not parsed_rows:
            raise ValueError("No transaction rows could be extracted from this CSV statement.")

        return parsed_rows

    @classmethod
    def _detect_columns(
        cls, rows: List[List[str]]
    ) -> Tuple[Optional[int], Dict[str, int]]:
        for i, row in enumerate(rows[:15]):  # Search within first 15 rows for header
            lower_row = [c.strip().lower() for c in row]

            date_idx = None
            desc_idx = None
            debit_idx = None
            credit_idx = None
            amount_idx = None
            type_idx = None

            for idx, col in enumerate(lower_row):
                # Date
                if any(k in col for k in ("date", "txn_date", "trans_date", "value_date")):
                    if date_idx is None:
                        date_idx = idx
                # Description
                elif any(k in col for k in ("description", "narration", "particulars", "details", "remark", "payee")):
                    if desc_idx is None:
                        desc_idx = idx
                # Debit
                elif any(k in col for k in ("debit", "withdrawal", "dr")):
                    debit_idx = idx
                # Credit
                elif any(k in col for k in ("credit", "deposit", "cr")):
                    credit_idx = idx
                # Amount
                elif any(k in col for k in ("amount", "amt")):
                    if amount_idx is None:
                        amount_idx = idx
                # Type indicator
                elif any(k in col for k in ("type", "cr/dr", "d/c")):
                    type_idx = idx

            # Must have at least date, description, and some amount representation
            if date_idx is not None and desc_idx is not None:
                if (debit_idx is not None and credit_idx is not None) or amount_idx is not None:
                    return i, {
                        "date": date_idx,
                        "description": desc_idx,
                        "debit": debit_idx,
                        "credit": credit_idx,
                        "amount": amount_idx,
                        "type": type_idx,
                    }

        return None, {}

    @classmethod
    def _parse_row(
        cls, row: List[str], col_map: Dict[str, Optional[int]]
    ) -> Optional[RawParsedRow]:
        def get_val(key: str) -> str:
            idx = col_map.get(key)
            if idx is not None and idx < len(row):
                return row[idx].strip()
            return ""

        raw_date = get_val("date")
        raw_desc = get_val("description")

        if not raw_date and not raw_desc:
            return None  # Skip empty or irrelevant row

        norm_date = cls.normalize_date(raw_date)
        description = raw_desc or "Statement Transaction"

        direction = "ambiguous"
        amount = None
        error = None

        debit_idx = col_map.get("debit")
        credit_idx = col_map.get("credit")
        amount_idx = col_map.get("amount")
        type_idx = col_map.get("type")

        # Scenario 1: Separate Debit & Credit columns
        if debit_idx is not None and credit_idx is not None:
            raw_debit = get_val("debit")
            raw_credit = get_val("credit")

            debit_amt = cls.normalize_amount(raw_debit)
            credit_amt = cls.normalize_amount(raw_credit)

            if debit_amt is not None and debit_amt > 0:
                amount = debit_amt
                direction = "expense"
            elif credit_amt is not None and credit_amt > 0:
                amount = credit_amt
                direction = "income"
            else:
                amount = None
                direction = "ambiguous"
                error = "Zero or unparsed amount in Debit/Credit columns"

        # Scenario 2: Single Amount column with optional Type column
        elif amount_idx is not None:
            raw_amt_str = get_val("amount")
            amt = cls.normalize_amount(raw_amt_str)
            raw_type = get_val("type").lower()

            if amt is not None and amt != 0:
                amount = abs(amt)
                if amt < 0:
                    direction = "expense"
                elif any(k in raw_type for k in ("cr", "credit", "deposit", "income")):
                    direction = "income"
                elif any(k in raw_type for k in ("dr", "debit", "withdrawal", "expense")):
                    direction = "expense"
                elif any(k in raw_amt_str.lower() for k in ("cr", "credit")):
                    direction = "income"
                elif any(k in raw_amt_str.lower() for k in ("dr", "debit")):
                    direction = "expense"
                else:
                    direction = "ambiguous"
                    error = "Transaction direction (Debit/Credit) could not be reliably determined"
            else:
                amount = None
                direction = "invalid"
                error = "Invalid or zero amount"

        if not norm_date:
            error = f"Unparseable date: '{raw_date}'" if not error else error

        return RawParsedRow(
            date_str=norm_date,
            description=description,
            amount=amount,
            direction=direction,
            error=error,
        )
