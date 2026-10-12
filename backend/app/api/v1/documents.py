"""
Document Upload, Metadata, and Private File Retrieval Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.case import Case
from app.models.document import Document
from app.models.timeline import CaseTimeline
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.services.case_service import case_service
from app.services.audit_service import audit_service
from app.storage.file_storage import storage_service

router = APIRouter(tags=["Document Storage & Retrieval"])


@router.post("/cases/{case_id}/documents", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    document_type: str = Form("PASSPORT"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Secure document upload endpoint.
    Performs file signature verification, size checks, SHA-256 calculation,
    and isolates private file storage outside web roots.
    """
    case = case_service.get_case_by_id(db, case_id)

    # Read binary content into memory for validation
    content = await file.read()

    # Validate file format, signature, size, and readability
    mime_type, safe_ext = storage_service.validate_file(
        file_content=content,
        filename=file.filename or "upload.jpg",
        content_type=file.content_type,
    )

    # Save to private filesystem storage
    storage_filename, storage_path, sha256_hash = storage_service.save_original_file(
        file_content=content,
        safe_extension=safe_ext,
    )

    # Persist document record
    doc = Document(
        case_id=case.id,
        original_filename=file.filename or f"document{safe_ext}",
        storage_filename=storage_filename,
        storage_path=storage_path,
        mime_type=mime_type,
        file_size_bytes=len(content),
        sha256_hash=sha256_hash,
        document_type=document_type.upper(),
        upload_status="STORED",
    )
    db.add(doc)

    # Add timeline event
    db.add(CaseTimeline(
        case_id=case.id,
        user_id=current_user.id,
        event_type="DOCUMENT_UPLOADED",
        description=f"Uploaded '{doc.original_filename}' ({doc.document_type}, {doc.file_size_bytes} bytes).",
    ))

    db.commit()
    db.refresh(doc)

    # Audit event
    audit_service.log_event(
        db=db,
        user_id=current_user.id,
        action="UPLOAD_DOCUMENT",
        resource_type="DOCUMENT",
        resource_id=doc.id,
        details={"case_id": case.id, "sha256": sha256_hash, "doc_type": doc.document_type},
    )

    return DocumentUploadResponse(
        document=doc,
        message="Document uploaded and cryptographically verified successfully.",
    )


@router.get("/cases/{case_id}/documents", response_model=List[DocumentResponse])
def list_case_documents(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists all documents registered to a case."""
    case = case_service.get_case_by_id(db, case_id)
    return list(case.documents)


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document_metadata(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves document metadata without exposing raw storage paths."""
    doc = db.scalar(select(Document).where(Document.id == document_id))
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    return doc


@router.get("/documents/{document_id}/file")
def download_document_file(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Secure file streaming endpoint.
    Enforces authorization, path traversal defenses, and private storage isolation.
    """
    doc = db.scalar(select(Document).where(Document.id == document_id))
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )

    # RBAC verification against case
    case = case_service.get_case_by_id(db, doc.case_id)
    if current_user.role == "OFFICER" and case.assigned_officer_id and case.assigned_officer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: You are not authorized to view files for this case.",
        )

    file_path = storage_service.get_file_path(doc.storage_filename, is_processed=False)

    audit_service.log_event(
        db=db,
        user_id=current_user.id,
        action="DOWNLOAD_DOCUMENT",
        resource_type="DOCUMENT",
        resource_id=doc.id,
        details={"case_id": doc.case_id},
    )

    return FileResponse(
        path=str(file_path),
        media_type=doc.mime_type,
        filename=doc.original_filename,
    )
