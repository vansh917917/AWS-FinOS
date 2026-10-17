from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ImportStatus(str, Enum):
    PROCESSING = "processing"
    PREVIEW_READY = "preview_ready"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


class RowStatus(str, Enum):
    NEW = "new"
    POTENTIAL_DUPLICATE = "potential_duplicate"
    NEEDS_REVIEW = "needs_review"
    INVALID = "invalid"


class PreviewRowItem(BaseModel):
    index: int
    date: Optional[str] = None
    description: str = ""
    amount: Optional[float] = None
    type: Optional[str] = None
    category: str = "Other Expense"
    status: RowStatus = RowStatus.NEW
    status_reason: Optional[str] = None
    is_selectable: bool = True
    default_selected: bool = True


class ImportPreviewResponse(BaseModel):
    import_id: str
    filename: str
    file_type: str
    total_rows: int
    valid_rows: int
    duplicate_rows: int
    review_rows: int
    invalid_rows: int
    expires_at: str
    items: List[PreviewRowItem]


class ImportConfirmRequest(BaseModel):
    selected_indices: List[int] = Field(default_factory=list)


class ImportConfirmResponse(BaseModel):
    import_id: str
    status: str
    imported_count: int
    skipped_duplicate_count: int
    skipped_invalid_count: int
    message: str


class StatementImportResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: str
    status: str
    total_rows: int
    valid_rows: int
    imported_rows: int
    duplicate_rows: int
    failed_rows: int
    error_message: str
    created_at: str
    completed_at: Optional[str] = None
    expires_at: str


class StatementImportListResponse(BaseModel):
    items: List[StatementImportResponse]
    total: int
    page: int
    limit: int
    pages: int

