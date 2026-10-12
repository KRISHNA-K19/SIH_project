"""
Cross-Document and Cross-Case Field Consistency Verification Service.
Compares OCR fields, MRZ fields, and Case Subject data to uncover discrepancies and cross-case links.
"""

from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import select, and_
from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.subject import CaseSubject
from app.models.document import Document
from app.models.identity_link import IdentityLink


class CrossCheckService:
    @staticmethod
    def normalize_str(val: Optional[str]) -> str:
        """Normalizes strings for comparison (lowercased, alphanumeric only)."""
        if not val:
            return ""
        return "".join(c.lower() for c in val if c.isalnum())

    def cross_check_document_fields(
        self,
        mrz_fields: Dict[str, Any],
        ocr_fields: Dict[str, Optional[str]],
        subject: Optional[CaseSubject] = None,
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Cross-checks fields between MRZ, OCR, and Subject declared attributes.
        Returns: (discrepancy_matches: list, findings: list)
        """
        discrepancies: List[Dict[str, Any]] = []
        findings: List[Dict[str, Any]] = []

        # 1. Compare MRZ Document Number vs OCR Document Number
        mrz_doc_num = mrz_fields.get("document_number")
        ocr_doc_num = ocr_fields.get("document_number")

        if mrz_doc_num and ocr_doc_num:
            norm_mrz = self.normalize_str(mrz_doc_num)
            norm_ocr = self.normalize_str(ocr_doc_num)
            is_match = norm_mrz == norm_ocr
            discrepancies.append({
                "field_name": "document_number",
                "source_value": mrz_doc_num,
                "target_value": ocr_doc_num,
                "is_consistent": is_match,
                "discrepancy_note": None if is_match else "MRZ doc number does not match OCR visual doc number",
            })
            if not is_match:
                findings.append({
                    "finding_type": "FIELD_MISMATCH_DOC_NUMBER",
                    "severity": "HIGH",
                    "description": (
                        f"Document Number mismatch: MRZ specifies '{mrz_doc_num}', "
                        f"whereas visual OCR indicates '{ocr_doc_num}'."
                    ),
                    "details": {"mrz_doc_number": mrz_doc_num, "ocr_doc_number": ocr_doc_num},
                })
            else:
                findings.append({
                    "finding_type": "DOC_NUMBER_CROSS_VERIFIED",
                    "severity": "INFO",
                    "description": "Document Number is mutually consistent across MRZ and visual inspection.",
                    "details": {"document_number": mrz_doc_num},
                })

        # 2. Compare Subject declared ID vs Document ID
        if subject and subject.id_number:
            doc_id = mrz_doc_num or ocr_doc_num
            if doc_id:
                norm_sub = self.normalize_str(subject.id_number)
                norm_doc = self.normalize_str(doc_id)
                is_match = norm_sub == norm_doc
                discrepancies.append({
                    "field_name": "subject_declared_id",
                    "source_value": subject.id_number,
                    "target_value": doc_id,
                    "is_consistent": is_match,
                    "discrepancy_note": None if is_match else "Declared Subject ID differs from scanned document ID",
                })
                if not is_match:
                    findings.append({
                        "finding_type": "SUBJECT_ID_MISMATCH",
                        "severity": "HIGH",
                        "description": (
                            f"Case Subject profile declared ID '{subject.id_number}' does not match "
                            f"scanned document ID '{doc_id}'."
                        ),
                        "details": {"subject_id": subject.id_number, "document_id": doc_id},
                    })

        # 3. Compare Subject declared Name vs MRZ/OCR Name
        if subject and subject.full_name:
            doc_name = mrz_fields.get("full_name")
            if doc_name:
                norm_sub_name = self.normalize_str(subject.full_name)
                norm_doc_name = self.normalize_str(doc_name)
                # Check for either exact match or subname containment
                is_name_match = (norm_sub_name in norm_doc_name) or (norm_doc_name in norm_sub_name)
                discrepancies.append({
                    "field_name": "subject_name",
                    "source_value": subject.full_name,
                    "target_value": doc_name,
                    "is_consistent": is_name_match,
                    "discrepancy_note": None if is_name_match else "Declared Subject Name differs from scanned document Name",
                })
                if not is_name_match:
                    findings.append({
                        "finding_type": "SUBJECT_NAME_MISMATCH",
                        "severity": "HIGH",
                        "description": (
                            f"Subject declared name '{subject.full_name}' does not align with "
                            f"name printed on document '{doc_name}'."
                        ),
                        "details": {"declared_name": subject.full_name, "document_name": doc_name},
                    })

        # 4. Compare Nationality
        mrz_nat = mrz_fields.get("nationality")
        ocr_nat = ocr_fields.get("nationality")
        if mrz_nat and ocr_nat and self.normalize_str(mrz_nat) != self.normalize_str(ocr_nat):
            findings.append({
                "finding_type": "NATIONALITY_MISMATCH",
                "severity": "MEDIUM",
                "description": f"Nationality discrepancy: MRZ '{mrz_nat}' vs OCR '{ocr_nat}'.",
                "details": {"mrz_nat": mrz_nat, "ocr_nat": ocr_nat},
            })

        return discrepancies, findings

    def find_cross_case_links(
        self,
        db: Session,
        current_case_id: str,
        document_hash: str,
        document_number: Optional[str] = None,
        subject_name: Optional[str] = None,
        subject_dob: Optional[str] = None,
    ) -> List[IdentityLink]:
        """
        Searches the database for correlations in other cases:
        - Duplicate uploaded document SHA-256 hash.
        - Exact matching document number or identity details.
        """
        links: List[IdentityLink] = []

        # 1. Check for Duplicate Document Hash in other cases
        duplicate_docs = db.scalars(
            select(Document).where(
                and_(
                    Document.sha256_hash == document_hash,
                    Document.case_id != current_case_id
                )
            )
        ).all()

        for doc in duplicate_docs:
            link = IdentityLink(
                source_case_id=current_case_id,
                target_case_id=doc.case_id,
                match_type="DUPLICATE_DOCUMENT",
                confidence_score=1.0,
                details_json=f'{{"matched_sha256": "{document_hash}", "matched_doc_id": "{doc.id}"}}',
            )
            links.append(link)

        # 2. Check for matching Subject ID Number in other cases
        if document_number:
            matching_subjects = db.scalars(
                select(CaseSubject).where(
                    and_(
                        CaseSubject.id_number == document_number,
                        CaseSubject.case_id != current_case_id
                    )
                )
            ).all()

            for sub in matching_subjects:
                # Avoid duplicate links
                if not any(l.target_case_id == sub.case_id and l.match_type == "EXACT_ID" for l in links):
                    link = IdentityLink(
                        source_case_id=current_case_id,
                        target_case_id=sub.case_id,
                        match_type="EXACT_ID",
                        confidence_score=0.95,
                        details_json=f'{{"matched_id_number": "{document_number}", "subject_name": "{sub.full_name}"}}',
                    )
                    links.append(link)

        # 3. Check for matching Name + DOB in other cases
        if subject_name and subject_dob:
            matching_name_dob = db.scalars(
                select(CaseSubject).where(
                    and_(
                        CaseSubject.full_name == subject_name,
                        CaseSubject.date_of_birth == subject_dob,
                        CaseSubject.case_id != current_case_id
                    )
                )
            ).all()

            for sub in matching_name_dob:
                if not any(l.target_case_id == sub.case_id for l in links):
                    link = IdentityLink(
                        source_case_id=current_case_id,
                        target_case_id=sub.case_id,
                        match_type="NAME_AND_DOB",
                        confidence_score=0.90,
                        details_json=f'{{"matched_name": "{subject_name}", "matched_dob": "{subject_dob}"}}',
                    )
                    links.append(link)

        return links


cross_check_service = CrossCheckService()
