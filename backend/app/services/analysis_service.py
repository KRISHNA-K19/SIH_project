"""
Master Analysis Orchestration Service.
Executes the multi-stage document screening pipeline:
Image Quality -> OCR Extraction -> MRZ Validation -> Cross-Checking -> Risk Scoring.
"""

import json
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.db.base import utc_now
from app.models.case import Case
from app.models.document import Document
from app.models.analysis import AnalysisRun
from app.models.field import ExtractedField
from app.models.evidence import EvidenceFinding
from app.models.risk import RiskAssessment
from app.models.timeline import CaseTimeline
from app.services.image_quality_service import image_quality_service
from app.services.ocr_service import ocr_service
from app.services.mrz_service import mrz_service
from app.services.cross_check_service import cross_check_service
from app.services.risk_service import risk_service


class AnalysisService:
    def run_pipeline(
        self,
        db: Session,
        document_id: str,
        user_id: Optional[str] = None
    ) -> AnalysisRun:
        """
        Executes end-to-end document verification pipeline.
        Persists all stages, findings, extracted fields, and risk assessments.
        """
        document = db.scalar(select(Document).where(Document.id == document_id))
        if not document:
            raise ValueError(f"Document {document_id} not found.")

        case = db.scalar(select(Case).where(Case.id == document.case_id))
        if not case:
            raise ValueError(f"Case {document.case_id} not found.")

        # Create or retrieve active analysis run
        run = AnalysisRun(
            document_id=document.id,
            case_id=case.id,
            status="PROCESSING",
            algorithm_version=settings.ANALYSIS_POLICY_VERSION,
            started_at=utc_now(),
        )
        db.add(run)
        db.flush()  # assign run.id

        all_findings = []
        is_partial = False

        try:
            # 1. Image Quality Checks (OpenCV)
            if settings.IMAGE_QUALITY_CHECK_ENABLED:
                quality_findings = image_quality_service.analyze_image(document.storage_path)
                all_findings.extend(quality_findings)

            # 2. Text Extraction via OCR
            ocr_result = ocr_service.extract_text(document.storage_path)
            if ocr_result["status"] == "UNAVAILABLE":
                is_partial = True
                all_findings.append({
                    "finding_type": "OCR_ENGINE_UNAVAILABLE",
                    "severity": "INFO",
                    "description": ocr_result["error_detail"],
                    "details": {"status": "UNAVAILABLE"},
                })
            elif ocr_result["status"] == "FAILED":
                is_partial = True
                all_findings.append({
                    "finding_type": "OCR_PROCESSING_FAILED",
                    "severity": "MEDIUM",
                    "description": ocr_result["error_detail"],
                    "details": {"status": "FAILED"},
                })

            raw_text = ocr_result.get("raw_text", "")
            ocr_candidate_fields = ocr_service.extract_candidate_fields(raw_text)

            # 3. MRZ Extraction & Validation
            mrz_lines = mrz_service.extract_mrz_lines_from_text(raw_text)
            mrz_valid, mrz_fields, mrz_findings = mrz_service.parse_and_validate(mrz_lines)
            all_findings.extend(mrz_findings)

            # 4. Cross-Field Consistency Checks
            primary_subject = case.subjects[0] if case.subjects else None
            discrepancies, cross_findings = cross_check_service.cross_check_document_fields(
                mrz_fields=mrz_fields,
                ocr_fields=ocr_candidate_fields,
                subject=primary_subject,
            )
            all_findings.extend(cross_findings)

            # 5. Persist Extracted Fields
            # Store fields from MRZ
            for field_name, value in mrz_fields.items():
                if value is not None and field_name not in ["format", "checksum_valid"]:
                    db.add(ExtractedField(
                        analysis_run_id=run.id,
                        field_name=f"mrz_{field_name}",
                        raw_value=str(value),
                        normalized_value=str(value).strip().upper(),
                        confidence=1.0 if mrz_valid else 0.8,
                        source="MRZ",
                        is_verified=mrz_valid,
                    ))

            # Store candidate visual fields from OCR
            for field_name, value in ocr_candidate_fields.items():
                if value:
                    db.add(ExtractedField(
                        analysis_run_id=run.id,
                        field_name=f"ocr_{field_name}",
                        raw_value=str(value),
                        normalized_value=str(value).strip().upper(),
                        confidence=ocr_result.get("average_confidence"),
                        source="OCR",
                        is_verified=False,
                    ))

            # 6. Persist Evidence Findings
            for finding in all_findings:
                db.add(EvidenceFinding(
                    analysis_run_id=run.id,
                    finding_type=finding.get("finding_type", "GENERAL_OBSERVATION"),
                    severity=finding.get("severity", "INFO"),
                    description=finding.get("description", ""),
                    details_json=json.dumps(finding.get("details", {})),
                ))

            # 7. Evaluate Risk Assessment
            overall_score, risk_level, factors, explanation = risk_service.evaluate_risk(
                all_findings,
                algorithm_version=settings.ANALYSIS_POLICY_VERSION,
            )

            risk_assessment = RiskAssessment(
                analysis_run_id=run.id,
                case_id=case.id,
                overall_score=overall_score,
                risk_level=risk_level,
                policy_version=settings.ANALYSIS_POLICY_VERSION,
                factors_json=json.dumps(factors),
                explanation=explanation,
            )
            db.add(risk_assessment)

            # 8. Detect Cross-Case Identity Links
            new_links = cross_check_service.find_cross_case_links(
                db=db,
                current_case_id=case.id,
                document_hash=document.sha256_hash,
                document_number=mrz_fields.get("document_number") or ocr_candidate_fields.get("document_number"),
                subject_name=primary_subject.full_name if primary_subject else None,
                subject_dob=primary_subject.date_of_birth if primary_subject else None,
            )
            for link in new_links:
                db.add(link)

            # 9. Complete Analysis Run
            run.status = "PARTIAL" if is_partial else "COMPLETED"
            run.completed_at = utc_now()
            run.summary_notes = (
                f"Screening complete with score {overall_score}/100 ({risk_level}). "
                f"Generated {len(all_findings)} evidence findings. Mode: {run.status}."
            )

            # 10. Record Case Timeline Event
            db.add(CaseTimeline(
                case_id=case.id,
                user_id=user_id,
                event_type="ANALYSIS_COMPLETED",
                description=f"Automated document screening completed for '{document.original_filename}'. Result: {risk_level} Risk ({overall_score}).",
                metadata_json=json.dumps({
                    "document_id": document.id,
                    "analysis_run_id": run.id,
                    "risk_level": risk_level,
                    "overall_score": overall_score,
                    "status": run.status,
                }),
            ))

            db.commit()
            db.refresh(run)
            return run

        except Exception as exc:
            db.rollback()
            logger.error(f"Error during analysis run pipeline execution: {exc}", exc_info=True)
            run.status = "FAILED"
            run.completed_at = utc_now()
            run.error_message = str(exc)
            db.add(run)
            db.commit()
            db.refresh(run)
            return run


analysis_service = AnalysisService()
