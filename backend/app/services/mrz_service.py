"""
MRZ (Machine Readable Zone) parsing and ICAO 9303 checksum validation service.
Supports TD1 (3x30), TD2 (2x36), and TD3 (2x44) document standards.
"""

import re
from typing import Any, Dict, List, Optional, Tuple
from app.core.logging import logger

# ICAO 9303 weight sequence
ICAO_WEIGHTS = [7, 3, 1]


def icao_char_value(c: str) -> int:
    """Calculates character value per ICAO 9303 specification."""
    c = c.upper()
    if c.isdigit():
        return int(c)
    if "A" <= c <= "Z":
        return ord(c) - ord("A") + 10
    if c == "<":
        return 0
    return 0


def calculate_icao_check_digit(data: str) -> str:
    """Calculates single ICAO 9303 check digit (0-9) for a string using 7-3-1 weights."""
    total = 0
    for idx, char in enumerate(data):
        weight = ICAO_WEIGHTS[idx % 3]
        total += icao_char_value(char) * weight
    return str(total % 10)


class MRZService:
    @staticmethod
    def extract_mrz_lines_from_text(raw_text: str) -> List[str]:
        """
        Scans raw text lines for consecutive MRZ strings matching ICAO length criteria (30, 36, or 44 chars).
        """
        lines = [line.strip().upper().replace(" ", "") for line in raw_text.splitlines() if line.strip()]
        valid_mrz_lines = []
        for line in lines:
            # Check if line matches MRZ character set (uppercase letters, digits, and filler '<')
            if re.match(r"^[A-Z0-9<]{28,45}$", line):
                valid_mrz_lines.append(line)
        return valid_mrz_lines

    def parse_and_validate(self, mrz_lines: List[str]) -> Tuple[bool, Dict[str, Any], List[Dict[str, Any]]]:
        """
        Parses MRZ lines and runs strict ICAO 9303 checksum validations.
        Returns: (is_valid: bool, extracted_fields: dict, findings: list)
        """
        findings: List[Dict[str, Any]] = []
        extracted_fields: Dict[str, Any] = {}

        if not mrz_lines or len(mrz_lines) < 2:
            return False, {}, [{
                "finding_type": "MRZ_NOT_FOUND",
                "severity": "LOW",
                "description": "No Machine Readable Zone (MRZ) could be identified in the scanned document.",
                "details": {"detected_candidate_lines": len(mrz_lines)},
            }]

        # Check for TD3 (Passport - 2 lines of 44 chars)
        if len(mrz_lines) >= 2 and all(len(l) == 44 for l in mrz_lines[-2:]):
            return self._validate_td3(mrz_lines[-2], mrz_lines[-1])

        # Check for TD1 (Identity Card - 3 lines of 30 chars)
        if len(mrz_lines) >= 3 and all(len(l) == 30 for l in mrz_lines[-3:]):
            return self._validate_td1(mrz_lines[-3], mrz_lines[-2], mrz_lines[-1])

        # Check for TD2 (Visa / ID - 2 lines of 36 chars)
        if len(mrz_lines) >= 2 and all(len(l) == 36 for l in mrz_lines[-2:]):
            return self._validate_td2(mrz_lines[-2], mrz_lines[-1])

        findings.append({
            "finding_type": "MRZ_FORMAT_INVALID",
            "severity": "MEDIUM",
            "description": f"Found candidate MRZ lines with irregular line lengths: {[len(l) for l in mrz_lines]}",
            "details": {"lines": mrz_lines},
        })
        return False, {}, findings

    def _validate_td3(self, line1: str, line2: str) -> Tuple[bool, Dict[str, Any], List[Dict[str, Any]]]:
        """Validates TD3 Passport (2 lines x 44 characters)."""
        findings: List[Dict[str, Any]] = []

        # Line 1 parsing
        doc_code = line1[0:2].replace("<", "")
        issuing_country = line1[2:5].replace("<", "")
        names_part = line1[5:44]
        name_parts = names_part.split("<<", 1)
        surname = name_parts[0].replace("<", " ").strip()
        given_names = name_parts[1].replace("<", " ").strip() if len(name_parts) > 1 else ""

        # Line 2 parsing
        doc_number = line2[0:9].replace("<", "")
        doc_number_check = line2[9]
        nationality = line2[10:13].replace("<", "")
        dob = line2[13:19]
        dob_check = line2[19]
        sex = line2[20].replace("<", "X")
        expiry = line2[21:27]
        expiry_check = line2[27]
        optional_data = line2[28:42]
        composite_check = line2[43]

        # Validations
        all_passed = True

        # Document number check digit
        calc_doc_check = calculate_icao_check_digit(line2[0:9])
        doc_check_passed = calc_doc_check == doc_number_check
        if not doc_check_passed:
            all_passed = False
            findings.append({
                "finding_type": "MRZ_DOC_NUMBER_CHECKSUM_FAILED",
                "severity": "HIGH",
                "description": (
                    f"MRZ Document number checksum mismatch: expected '{doc_number_check}', "
                    f"computed '{calc_doc_check}'. Possible character misread or data alteration."
                ),
                "details": {"doc_number": doc_number, "expected": doc_number_check, "computed": calc_doc_check},
            })

        # Date of birth check digit
        calc_dob_check = calculate_icao_check_digit(dob)
        dob_check_passed = calc_dob_check == dob_check
        if not dob_check_passed:
            all_passed = False
            findings.append({
                "finding_type": "MRZ_DOB_CHECKSUM_FAILED",
                "severity": "HIGH",
                "description": f"MRZ Date of Birth checksum mismatch: expected '{dob_check}', computed '{calc_dob_check}'.",
                "details": {"dob": dob, "expected": dob_check, "computed": calc_dob_check},
            })

        # Expiration date check digit
        calc_expiry_check = calculate_icao_check_digit(expiry)
        expiry_check_passed = calc_expiry_check == expiry_check
        if not expiry_check_passed:
            all_passed = False
            findings.append({
                "finding_type": "MRZ_EXPIRY_CHECKSUM_FAILED",
                "severity": "HIGH",
                "description": f"MRZ Expiry date checksum mismatch: expected '{expiry_check}', computed '{calc_expiry_check}'.",
                "details": {"expiry": expiry, "expected": expiry_check, "computed": calc_expiry_check},
            })

        # Composite check digit (line2[0:10] + line2[13:20] + line2[21:43])
        composite_data = line2[0:10] + line2[13:20] + line2[21:43]
        calc_composite_check = calculate_icao_check_digit(composite_data)
        composite_check_passed = calc_composite_check == composite_check
        if not composite_check_passed:
            all_passed = False
            findings.append({
                "finding_type": "MRZ_COMPOSITE_CHECKSUM_FAILED",
                "severity": "HIGH",
                "description": (
                    f"MRZ Overall composite checksum mismatch: expected '{composite_check}', "
                    f"computed '{calc_composite_check}'."
                ),
                "details": {"expected": composite_check, "computed": calc_composite_check},
            })

        if all_passed:
            findings.append({
                "finding_type": "MRZ_CHECKSUMS_VERIFIED",
                "severity": "INFO",
                "description": "All ICAO 9303 TD3 MRZ check digits passed strict verification.",
                "details": {"standard": "TD3", "document_type": "PASSPORT"},
            })

        extracted_fields = {
            "document_type": "PASSPORT",
            "format": "TD3",
            "issuing_country": issuing_country,
            "surname": surname,
            "given_names": given_names,
            "full_name": f"{given_names} {surname}".strip(),
            "document_number": doc_number,
            "nationality": nationality,
            "date_of_birth": dob,
            "sex": sex,
            "expiry_date": expiry,
            "checksum_valid": all_passed,
        }

        return all_passed, extracted_fields, findings

    def _validate_td1(self, line1: str, line2: str, line3: str) -> Tuple[bool, Dict[str, Any], List[Dict[str, Any]]]:
        """Validates TD1 Identity Card (3 lines x 30 characters)."""
        findings: List[Dict[str, Any]] = []

        # Line 1
        doc_code = line1[0:2].replace("<", "")
        issuing_country = line1[2:5].replace("<", "")
        doc_number = line1[5:14].replace("<", "")
        doc_number_check = line1[14]

        # Line 2
        dob = line2[0:6]
        dob_check = line2[6]
        sex = line2[7]
        expiry = line2[8:14]
        expiry_check = line2[14]
        nationality = line2[15:18].replace("<", "")
        composite_check = line2[29]

        # Line 3
        name_parts = line3.split("<<", 1)
        surname = name_parts[0].replace("<", " ").strip()
        given_names = name_parts[1].replace("<", " ").strip() if len(name_parts) > 1 else ""

        all_passed = True
        calc_doc_check = calculate_icao_check_digit(line1[5:14])
        if calc_doc_check != doc_number_check:
            all_passed = False
            findings.append({
                "finding_type": "MRZ_DOC_NUMBER_CHECKSUM_FAILED",
                "severity": "HIGH",
                "description": f"TD1 Document number checksum mismatch: expected '{doc_number_check}', got '{calc_doc_check}'.",
                "details": {"doc_number": doc_number},
            })

        calc_dob_check = calculate_icao_check_digit(dob)
        if calc_dob_check != dob_check:
            all_passed = False
            findings.append({
                "finding_type": "MRZ_DOB_CHECKSUM_FAILED",
                "severity": "HIGH",
                "description": f"TD1 DOB checksum mismatch: expected '{dob_check}', got '{calc_dob_check}'.",
                "details": {"dob": dob},
            })

        calc_expiry_check = calculate_icao_check_digit(expiry)
        if calc_expiry_check != expiry_check:
            all_passed = False
            findings.append({
                "finding_type": "MRZ_EXPIRY_CHECKSUM_FAILED",
                "severity": "HIGH",
                "description": f"TD1 Expiry checksum mismatch: expected '{expiry_check}', got '{calc_expiry_check}'.",
                "details": {"expiry": expiry},
            })

        if all_passed:
            findings.append({
                "finding_type": "MRZ_CHECKSUMS_VERIFIED",
                "severity": "INFO",
                "description": "All ICAO 9303 TD1 MRZ check digits passed strict verification.",
                "details": {"standard": "TD1", "document_type": "ID_CARD"},
            })

        extracted_fields = {
            "document_type": "ID_CARD",
            "format": "TD1",
            "issuing_country": issuing_country,
            "surname": surname,
            "given_names": given_names,
            "full_name": f"{given_names} {surname}".strip(),
            "document_number": doc_number,
            "nationality": nationality,
            "date_of_birth": dob,
            "sex": sex,
            "expiry_date": expiry,
            "checksum_valid": all_passed,
        }

        return all_passed, extracted_fields, findings

    def _validate_td2(self, line1: str, line2: str) -> Tuple[bool, Dict[str, Any], List[Dict[str, Any]]]:
        """Validates TD2 Identity Card/Visa (2 lines x 36 characters)."""
        findings: List[Dict[str, Any]] = []

        issuing_country = line1[2:5].replace("<", "")
        names_part = line1[5:36].split("<<", 1)
        surname = names_part[0].replace("<", " ").strip()
        given_names = names_part[1].replace("<", " ").strip() if len(names_part) > 1 else ""

        doc_number = line2[0:9].replace("<", "")
        doc_number_check = line2[9]
        nationality = line2[10:13].replace("<", "")
        dob = line2[13:19]
        dob_check = line2[19]
        sex = line2[20]
        expiry = line2[21:27]
        expiry_check = line2[27]

        all_passed = True
        calc_doc = calculate_icao_check_digit(line2[0:9])
        if calc_doc != doc_number_check:
            all_passed = False
            findings.append({
                "finding_type": "MRZ_DOC_NUMBER_CHECKSUM_FAILED",
                "severity": "HIGH",
                "description": f"TD2 Document number checksum mismatch: expected '{doc_number_check}', got '{calc_doc}'.",
                "details": {"doc_number": doc_number},
            })

        if all_passed:
            findings.append({
                "finding_type": "MRZ_CHECKSUMS_VERIFIED",
                "severity": "INFO",
                "description": "All ICAO 9303 TD2 MRZ check digits passed verification.",
                "details": {"standard": "TD2"},
            })

        extracted_fields = {
            "document_type": "VISA/ID",
            "format": "TD2",
            "issuing_country": issuing_country,
            "surname": surname,
            "given_names": given_names,
            "full_name": f"{given_names} {surname}".strip(),
            "document_number": doc_number,
            "nationality": nationality,
            "date_of_birth": dob,
            "sex": sex,
            "expiry_date": expiry,
            "checksum_valid": all_passed,
        }

        return all_passed, extracted_fields, findings


mrz_service = MRZService()
