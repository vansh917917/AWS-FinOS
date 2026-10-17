import io
import re
from typing import List, Optional
import pypdf
from app.services.parsers.base import BaseStatementParser, RawParsedRow


class PDFStatementParser(BaseStatementParser):
    DATE_REGEX = re.compile(
        r"^(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{2,4}|\d{1,2}\s+[A-Za-z]{3}\s+\d{2,4})"
    )
    AMOUNT_REGEX = re.compile(
        r"(?:[₹$€£]|Rs\.?)?\s*(\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)"
    )


    @classmethod
    def parse(cls, content_bytes: bytes, filename: str) -> List[RawParsedRow]:
        try:
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
        except Exception as e:
            raise ValueError(f"Corrupted or invalid PDF file: {str(e)}")

        if len(reader.pages) == 0:
            raise ValueError("The uploaded PDF has no pages.")

        # Extract text from all pages
        extracted_pages_text = []
        for page in reader.pages:
            t = page.extract_text() or ""
            extracted_pages_text.append(t)

        full_text = "\n".join(extracted_pages_text)
        alphanumeric_count = len(re.findall(r"[A-Za-z0-9]", full_text))

        # Check for scanned or image-based PDF
        if alphanumeric_count < 50:
            raise ValueError(
                "This PDF appears to be image-based or scanned and cannot be processed automatically yet. "
                "Scanned/image-only PDFs are not supported in Phase 3."
            )

        parsed_rows: List[RawParsedRow] = []
        lines = full_text.splitlines()

        for line in lines:
            if len(parsed_rows) >= cls.MAX_ROWS:
                break

            cleaned_line = line.strip()
            if not cleaned_line:
                continue

            parsed_row = cls._try_parse_line(cleaned_line)
            if parsed_row:
                parsed_rows.append(parsed_row)

        if not parsed_rows:
            raise ValueError(
                "No structured transaction rows could be confidently identified in this PDF. "
                "Ensure the statement contains text-based tabular transaction data."
            )

        return parsed_rows

    @classmethod
    def _try_parse_line(cls, line: str) -> Optional[RawParsedRow]:
        # Check if line begins with a date pattern
        date_match = cls.DATE_REGEX.match(line)
        if not date_match:
            return None

        raw_date = date_match.group(1)
        norm_date = cls.normalize_date(raw_date)
        if not norm_date:
            return None

        remainder = line[date_match.end() :].strip()

        # Find amounts in remainder
        amounts_found = cls.AMOUNT_REGEX.findall(remainder)
        valid_amounts = [
            cls.normalize_amount(a)
            for a in amounts_found
            if cls.normalize_amount(a) is not None and cls.normalize_amount(a) > 0
        ]

        if not valid_amounts:
            return None

        # Determine transaction amount and direction
        # Look for explicit Cr / Dr / Debit / Credit markers in line
        lower_line = line.lower()
        is_credit = bool(re.search(r"\b(cr|credit|deposit)\b", lower_line))
        is_debit = bool(re.search(r"\b(dr|debit|withdrawal)\b", lower_line))

        direction = "ambiguous"
        error = None
        target_amount = valid_amounts[0]

        if is_debit and not is_credit:
            direction = "expense"
        elif is_credit and not is_debit:
            direction = "income"
        elif len(valid_amounts) >= 2:
            # If multiple amounts exist (e.g. Withdrawal, Deposit, Balance), conservative review
            direction = "ambiguous"
            error = "Multiple monetary figures found; direction requires review"
        else:
            direction = "ambiguous"
            error = "Debit/Credit marker could not be confidently identified"

        # Description is the text between the date and first amount
        desc_part = remainder
        for amt_str in amounts_found:
            desc_part = desc_part.replace(amt_str, "")
        # Remove Dr / Cr tokens from description
        desc_part = re.sub(r"(?i)\b(cr|dr|credit|debit)\b", "", desc_part).strip()
        description = desc_part or "PDF Transaction"

        return RawParsedRow(
            date_str=norm_date,
            description=description[:255],
            amount=target_amount,
            direction=direction,
            error=error,
        )
