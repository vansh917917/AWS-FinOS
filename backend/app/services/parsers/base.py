import re
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Optional, Dict, Any, List
from dataclasses import dataclass


@dataclass
class RawParsedRow:
    date_str: Optional[str] = None
    description: str = ""
    amount: Optional[Decimal] = None
    direction: str = "ambiguous"  # "income", "expense", "ambiguous", "invalid"
    error: Optional[str] = None
    category: Optional[str] = None


class BaseStatementParser:
    MAX_ROWS = 1000  # Size safety cap for preview JSONB payload

    @staticmethod
    def normalize_date(date_raw: str) -> Optional[str]:
        """
        Parses common date formats into standard YYYY-MM-DD ISO string.
        """
        if not date_raw:
            return None
        cleaned = date_raw.strip()
        cleaned = re.sub(r"[,/]", "-", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned)

        date_formats = [
            "%Y-%m-%d",
            "%d-%m-%Y",
            "%m-%d-%Y",
            "%d-%b-%Y",
            "%d-%B-%Y",
            "%d %b %Y",
            "%d %B %Y",
            "%d-%m-%y",
            "%m-%d-%y",
            "%d-%b-%y",
        ]

        for fmt in date_formats:
            try:
                dt = datetime.strptime(cleaned, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue

        # Try original cleaned string without dash replacement
        original_clean = date_raw.strip()
        for fmt in ("%Y/%m/%d", "%d/%m/%Y", "%m/%d/%Y", "%d/%b/%Y", "%d/%m/%y"):
            try:
                dt = datetime.strptime(original_clean, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue

        return None

    @staticmethod
    def normalize_amount(amount_raw: Any) -> Optional[Decimal]:
        """
        Cleans and parses a monetary string or number into Decimal.
        """
        if amount_raw is None:
            return None
        val_str = str(amount_raw).strip()
        if not val_str:
            return None

        # Remove currency symbols, commas, spaces
        cleaned = re.sub(r"[₹$€£\s,]", "", val_str)
        # Handle trailing/leading credit or debit indicators (e.g. 1250.00 Cr, Dr)
        cleaned = re.sub(r"(?i)(cr|dr|inr|rs\.?)", "", cleaned).strip()

        try:
            amt = Decimal(cleaned)
            return amt
        except (InvalidOperation, ValueError):
            return None
