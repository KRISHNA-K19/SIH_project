"""
Modular Optical Character Recognition (OCR) Service.
Interfaces with PaddleOCR when installed and available;
Gracefully reports UNAVAILABLE status without fabricating synthetic data.
"""

import re
from typing import Any, Dict, List, Optional, Tuple
from app.core.logging import logger

# Check if PaddleOCR is available in the current environment
try:
    from paddleocr import PaddleOCR
    _PADDLE_AVAILABLE = True
except (ImportError, Exception):
    PaddleOCR = None
    _PADDLE_AVAILABLE = False


class OCRService:
    def __init__(self):
        self._ocr_engine = None
        self._is_initialized = False

    def is_available(self) -> bool:
        """Returns True if PaddleOCR is installed and can be imported."""
        return _PADDLE_AVAILABLE

    def _get_engine(self):
        """Lazily initializes the PaddleOCR engine to avoid slow server startup."""
        if not self._is_initialized and _PADDLE_AVAILABLE:
            try:
                self._ocr_engine = PaddleOCR(use_angle_cls=True, lang="en")
                self._is_initialized = True
            except Exception as exc:
                logger.warning(f"PaddleOCR failed to initialize engine: {exc}")
                self._ocr_engine = None
        return self._ocr_engine

    def extract_text(self, image_path: str) -> Dict[str, Any]:
        """
        Executes OCR text recognition on the given image.
        Returns:
        {
            "status": "COMPLETED" | "UNAVAILABLE" | "FAILED",
            "lines": List[str],
            "raw_text": str,
            "line_confidences": List[float],
            "average_confidence": Optional[float],
            "error_detail": Optional[str]
        }
        """
        if not self.is_available():
            return {
                "status": "UNAVAILABLE",
                "lines": [],
                "raw_text": "",
                "line_confidences": [],
                "average_confidence": None,
                "error_detail": (
                    "PaddleOCR engine or model weights are not installed in this environment. "
                    "Install paddlepaddle and paddleocr to enable real-time OCR extraction. "
                    "No synthetic text was fabricated."
                ),
            }

        engine = self._get_engine()
        if not engine:
            return {
                "status": "UNAVAILABLE",
                "lines": [],
                "raw_text": "",
                "line_confidences": [],
                "average_confidence": None,
                "error_detail": "PaddleOCR runtime failed to load models.",
            }

        try:
            results = engine.ocr(image_path, cls=True)
            if not results or not results[0]:
                return {
                    "status": "COMPLETED",
                    "lines": [],
                    "raw_text": "",
                    "line_confidences": [],
                    "average_confidence": None,
                    "error_detail": None,
                }

            lines: List[str] = []
            confidences: List[float] = []

            for line in results[0]:
                text_part = line[1][0]
                conf_part = float(line[1][1])
                lines.append(text_part)
                confidences.append(conf_part)

            avg_conf = sum(confidences) / len(confidences) if confidences else None
            raw_text = "\n".join(lines)

            return {
                "status": "COMPLETED",
                "lines": lines,
                "raw_text": raw_text,
                "line_confidences": [round(c, 4) for c in confidences],
                "average_confidence": round(avg_conf, 4) if avg_conf is not None else None,
                "error_detail": None,
            }

        except Exception as exc:
            logger.error(f"OCR execution failed on {image_path}: {exc}")
            return {
                "status": "FAILED",
                "lines": [],
                "raw_text": "",
                "line_confidences": [],
                "average_confidence": None,
                "error_detail": f"OCR processing failure: {str(exc)}",
            }

    @staticmethod
    def extract_candidate_fields(raw_text: str) -> Dict[str, Optional[str]]:
        """
        Extracts candidate fields from OCR text using pattern matching.
        """
        fields: Dict[str, Optional[str]] = {
            "document_number": None,
            "date_of_birth": None,
            "expiry_date": None,
            "nationality": None,
        }

        # Match potential passport / ID numbers (1-2 letters + 7-9 digits, or 9 alphanumeric)
        doc_num_match = re.search(r"\b([A-Z]{1,2}[0-9]{7,9}|[0-9]{9})\b", raw_text)
        if doc_num_match:
            fields["document_number"] = doc_num_match.group(1)

        # Match dates in DD/MM/YYYY or YYYY-MM-DD or DD-MMM-YYYY format
        date_matches = re.findall(r"\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})\b", raw_text)
        if len(date_matches) >= 1:
            fields["date_of_birth"] = date_matches[0]
        if len(date_matches) >= 2:
            fields["expiry_date"] = date_matches[1]

        # Match 3-letter country codes
        nat_match = re.search(r"\b(USA|GBR|CAN|AUS|IND|DEU|FRA|ITA|ESP|JPN|SGP|BRA)\b", raw_text)
        if nat_match:
            fields["nationality"] = nat_match.group(1)

        return fields


ocr_service = OCRService()
