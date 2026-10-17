from typing import Dict, Any
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from app.api.deps import get_current_user
from app.schemas.imports import (
    ImportPreviewResponse,
    ImportConfirmRequest,
    ImportConfirmResponse,
    StatementImportResponse,
    StatementImportListResponse,
)
from app.services.imports import ImportService

router = APIRouter(prefix="/imports", tags=["Statement Imports"])


@router.post(
    "/preview",
    response_model=ImportPreviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload statement file and generate transaction preview",
)
async def preview_statement_import(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Accepts CSV or text-based PDF statement file, extracts transactions,
    runs duplicate detection against existing user records, and returns
    a server-stored preview payload with 24-hour expiration.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing from upload.",
        )

    file_bytes = await file.read()
    return ImportService.create_preview(
        user_id=current_user["id"],
        token=current_user.get("token"),
        file_bytes=file_bytes,
        filename=file.filename,
    )


@router.get(
    "",
    response_model=StatementImportListResponse,
    status_code=status.HTTP_200_OK,
    summary="List past statement imports for current user",
)
def list_statement_imports(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns paginated list of all statement import batches for the authenticated user.
    """
    return ImportService.list_imports(
        user_id=current_user["id"],
        token=current_user.get("token"),
        page=page,
        limit=limit,
    )


@router.post(
    "/{import_id}/confirm",
    response_model=ImportConfirmResponse,
    status_code=status.HTTP_200_OK,
    summary="Confirm selection and import transactions into database",
)
def confirm_statement_import(
    import_id: str,
    payload: ImportConfirmRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Confirms an active preview import. Validates that the preview is not expired,
    extracts the selected indices from the server-stored preview data, re-validates
    each transaction, and batch inserts them into public.transactions.
    Idempotent: Re-confirming a completed import will not re-insert duplicates.
    """
    return ImportService.confirm_import(
        user_id=current_user["id"],
        token=current_user.get("token"),
        import_id=import_id,
        selected_indices=payload.selected_indices,
    )


@router.get(
    "/{import_id}",
    response_model=StatementImportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single statement import metadata",
)
def get_statement_import(
    import_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Retrieves status and metadata for a specific statement import.
    """
    return ImportService.get_import(
        user_id=current_user["id"],
        token=current_user.get("token"),
        import_id=import_id,
    )
