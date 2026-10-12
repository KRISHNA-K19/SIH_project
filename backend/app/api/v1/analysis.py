"""
Analysis Pipeline, Cross-Checking, and Identity Link Endpoints.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.case import Case
from app.models.document import Document
from app.models.analysis import AnalysisRun
from app.models.identity_link import IdentityLink
from app.models.user import User
from app.schemas.analysis import (
    AnalysisTriggerRequest,
    AnalysisRunResponse,
    CrossCheckResponse,
    CrossCheckMatch,
    IdentityLinkResponse,
    EvidenceFindingResponse,
    RiskAssessmentResponse,
    ExtractedFieldResponse,
)
from app.services.case_service import case_service
from app.services.analysis_service import analysis_service
from app.services.cross_check_service import cross_check_service
from app.services.audit_service import audit_service

router = APIRouter(tags=["Analysis & Cross-Checks"])


def serialize_analysis_run(run: AnalysisRun) -> AnalysisRunResponse:
    """Helper to convert AnalysisRun ORM object to schema with parsed details."""
    findings_resp = []
    for f in run.evidence_findings:
        details_dict = None
        if f.details_json:
            try:
                details_dict = json.loads(f.details_json)
            except Exception:
                details_dict = {}
        findings_resp.append(EvidenceFindingResponse(
            id=f.id,
            finding_type=f.finding_type,
            severity=f.severity,
            description=f.description,
            details=details_dict,
        ))

    risk_resp = None
    if run.risk_assessment:
        ra = run.risk_assessment
        factors_list = []
        if ra.factors_json:
            try:
                factors_list = json.loads(ra.factors_json)
            except Exception:
                factors_list = []
        risk_resp = RiskAssessmentResponse(
            id=ra.id,
            overall_score=ra.overall_score,
            risk_level=ra.risk_level,
            policy_version=ra.policy_version,
            factors=factors_list,
            explanation=ra.explanation,
            created_at=ra.created_at,
        )

    fields_resp = [
        ExtractedFieldResponse(
            id=field.id,
            field_name=field.field_name,
            raw_value=field.raw_value,
            normalized_value=field.normalized_value,
            confidence=field.confidence,
            source=field.source,
            is_verified=field.is_verified,
        )
        for field in run.extracted_fields
    ]

    return AnalysisRunResponse(
        id=run.id,
        document_id=run.document_id,
        case_id=run.case_id,
        status=run.status,
        algorithm_version=run.algorithm_version,
        started_at=run.started_at,
        completed_at=run.completed_at,
        summary_notes=run.summary_notes,
        error_message=run.error_message,
        extracted_fields=fields_resp,
        evidence_findings=findings_resp,
        risk_assessment=risk_resp,
    )


@router.post("/cases/{case_id}/analysis", response_model=List[AnalysisRunResponse])
def trigger_analysis(
    case_id: str,
    payload: AnalysisTriggerRequest = AnalysisTriggerRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Triggers automated document analysis pipeline.
    Runs image quality checks, OCR text extraction, MRZ checksum parsing, and risk evaluation.
    """
    case = case_service.get_case_by_id(db, case_id)

    if not case.documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No documents attached to this case. Please upload a document before initiating analysis.",
        )

    docs_to_analyze: List[Document] = []
    if payload.document_id:
        doc = db.scalar(select(Document).where(Document.id == payload.document_id, Document.case_id == case.id))
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID '{payload.document_id}' not found in this case.",
            )
        docs_to_analyze.append(doc)
    else:
        docs_to_analyze = list(case.documents)

    results: List[AnalysisRunResponse] = []
    for doc in docs_to_analyze:
        run = analysis_service.run_pipeline(
            db=db,
            document_id=doc.id,
            user_id=current_user.id,
        )
        results.append(serialize_analysis_run(run))

    audit_service.log_event(
        db=db,
        user_id=current_user.id,
        action="RUN_ANALYSIS",
        resource_type="ANALYSIS",
        resource_id=case.id,
        details={"case_id": case.id, "documents_analyzed": len(results)},
    )

    return results


@router.get("/analysis/{analysis_id}", response_model=AnalysisRunResponse)
def get_analysis_run(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves full analysis run details including extracted fields, findings, and risk scoring."""
    run = db.scalar(select(AnalysisRun).where(AnalysisRun.id == analysis_id))
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis run with ID '{analysis_id}' not found.",
        )
    return serialize_analysis_run(run)


@router.post("/cases/{case_id}/cross-check", response_model=CrossCheckResponse)
def execute_cross_check(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Executes cross-document field verification across extracted OCR and MRZ data.
    Evaluates consistency against declared subject profile.
    """
    case = case_service.get_case_by_id(db, case_id)
    subject = case.subjects[0] if case.subjects else None

    # Gather extracted fields across runs
    mrz_fields = {}
    ocr_fields = {}

    for doc in case.documents:
        for run in doc.analysis_runs:
            for field in run.extracted_fields:
                if field.source == "MRZ":
                    key = field.field_name.replace("mrz_", "")
                    mrz_fields[key] = field.raw_value
                elif field.source == "OCR":
                    key = field.field_name.replace("ocr_", "")
                    ocr_fields[key] = field.raw_value

    discrepancies, _ = cross_check_service.cross_check_document_fields(
        mrz_fields=mrz_fields,
        ocr_fields=ocr_fields,
        subject=subject,
    )

    matches_list = [
        CrossCheckMatch(
            field_name=d["field_name"],
            source_value=d["source_value"],
            target_value=d["target_value"],
            is_consistent=d["is_consistent"],
            discrepancy_note=d["discrepancy_note"],
        )
        for d in discrepancies
    ]

    inconsistencies = sum(1 for m in matches_list if not m.is_consistent)
    total_checks = len(matches_list)
    score = round((1.0 - (inconsistencies / total_checks)) * 100, 1) if total_checks > 0 else 100.0

    return CrossCheckResponse(
        case_id=case.id,
        status="DISCREPANCIES_DETECTED" if inconsistencies > 0 else "CONSISTENT",
        consistency_score=score,
        discrepancies=matches_list,
        summary=f"Evaluated {total_checks} cross-check field(s); identified {inconsistencies} discrepancy(s).",
    )


@router.get("/cases/{case_id}/identity-links", response_model=List[IdentityLinkResponse])
def get_identity_links(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all detected correlations linking this case to other database cases."""
    case = case_service.get_case_by_id(db, case_id)
    links = db.scalars(
        select(IdentityLink).where(
            or_(
                IdentityLink.source_case_id == case.id,
                IdentityLink.target_case_id == case.id
            )
        )
    ).all()

    resp = []
    for link in links:
        details_dict = None
        if link.details_json:
            try:
                details_dict = json.loads(link.details_json)
            except Exception:
                details_dict = {}
        resp.append(IdentityLinkResponse(
            id=link.id,
            source_case_id=link.source_case_id,
            target_case_id=link.target_case_id,
            match_type=link.match_type,
            confidence_score=link.confidence_score,
            details=details_dict,
            created_at=link.created_at,
        ))

    return resp
