"""
Image Quality Assessment Service using OpenCV.
Evaluates blur, resolution, and basic contrast/lighting anomalies.
Provides explainable evidence findings without overclaiming forensic conclusions.
"""

from typing import Any, Dict, List, Tuple
import cv2
import numpy as np

from app.core.logging import logger


class ImageQualityService:
    # Threshold standards for identity document scanning
    MIN_WIDTH_PX = 600
    MIN_HEIGHT_PX = 400
    RECOMMENDED_WIDTH_PX = 1000
    BLUR_LAPLACIAN_THRESHOLD = 90.0  # Variance below this indicates blur
    BRIGHTNESS_MIN = 40.0           # Mean pixel value below this is underexposed
    BRIGHTNESS_MAX = 225.0          # Mean pixel value above this is overexposed/glare
    CONTRAST_MIN_STD = 28.0         # Standard deviation below this indicates low contrast

    def analyze_image(self, image_path: str) -> List[Dict[str, Any]]:
        """
        Runs non-destructive image quality checks on the target image.
        Returns a list of finding dicts:
        [{
            "finding_type": str,
            "severity": "INFO" | "LOW" | "MEDIUM" | "HIGH",
            "description": str,
            "details": dict
        }]
        """
        findings: List[Dict[str, Any]] = []

        # Read image using OpenCV
        img = cv2.imread(image_path)
        if img is None:
            findings.append({
                "finding_type": "IMAGE_DECODE_FAILED",
                "severity": "HIGH",
                "description": "Image file could not be decoded by the image processing engine.",
                "details": {"image_path": image_path},
            })
            return findings

        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 1. Resolution Check
        if width < self.MIN_WIDTH_PX or height < self.MIN_HEIGHT_PX:
            findings.append({
                "finding_type": "RESOLUTION_DEFICIENT",
                "severity": "HIGH",
                "description": (
                    f"Document resolution ({width}x{height}px) is below minimum verification threshold "
                    f"({self.MIN_WIDTH_PX}x{self.MIN_HEIGHT_PX}px). Fine text and security features may be unreadable."
                ),
                "details": {"width": width, "height": height, "min_width": self.MIN_WIDTH_PX, "min_height": self.MIN_HEIGHT_PX},
            })
        elif width < self.RECOMMENDED_WIDTH_PX:
            findings.append({
                "finding_type": "RESOLUTION_SUBOPTIMAL",
                "severity": "LOW",
                "description": (
                    f"Image resolution ({width}x{height}px) is acceptable but below recommended standard "
                    f"({self.RECOMMENDED_WIDTH_PX}px width) for high-accuracy OCR."
                ),
                "details": {"width": width, "height": height, "recommended_width": self.RECOMMENDED_WIDTH_PX},
            })
        else:
            findings.append({
                "finding_type": "RESOLUTION_OPTIMAL",
                "severity": "INFO",
                "description": f"Image resolution ({width}x{height}px) satisfies verification requirements.",
                "details": {"width": width, "height": height},
            })

        # 2. Blur / Sharpness Check (Laplacian Variance)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if laplacian_var < self.BLUR_LAPLACIAN_THRESHOLD:
            findings.append({
                "finding_type": "BLUR_DETECTED",
                "severity": "MEDIUM",
                "description": (
                    f"Image exhibits noticeable blur (sharpness metric: {laplacian_var:.1f}, "
                    f"threshold: {self.BLUR_LAPLACIAN_THRESHOLD}). Text edges may be degraded. "
                    "Note: Blur indicates camera motion or focus issues and does not imply document tampering."
                ),
                "details": {"laplacian_variance": round(laplacian_var, 2), "threshold": self.BLUR_LAPLACIAN_THRESHOLD},
            })
        else:
            findings.append({
                "finding_type": "SHARPNESS_SATISFACTORY",
                "severity": "INFO",
                "description": f"Image focus and sharpness are clear (metric: {laplacian_var:.1f}).",
                "details": {"laplacian_variance": round(laplacian_var, 2)},
            })

        # 3. Lighting & Contrast Analysis
        mean_brightness = float(np.mean(gray))
        contrast_std = float(np.std(gray))

        if mean_brightness < self.BRIGHTNESS_MIN:
            findings.append({
                "finding_type": "UNDEREXPOSURE_DETECTED",
                "severity": "MEDIUM",
                "description": (
                    f"Image is significantly underexposed (mean brightness: {mean_brightness:.1f}/255). "
                    "Shadows may obscure security markings or field text."
                ),
                "details": {"mean_brightness": round(mean_brightness, 2), "min_brightness": self.BRIGHTNESS_MIN},
            })
        elif mean_brightness > self.BRIGHTNESS_MAX:
            findings.append({
                "finding_type": "OVEREXPOSURE_DETECTED",
                "severity": "MEDIUM",
                "description": (
                    f"Image has severe glare or overexposure (mean brightness: {mean_brightness:.1f}/255). "
                    "Reflections may wash out printed characters."
                ),
                "details": {"mean_brightness": round(mean_brightness, 2), "max_brightness": self.BRIGHTNESS_MAX},
            })

        if contrast_std < self.CONTRAST_MIN_STD:
            findings.append({
                "finding_type": "LOW_CONTRAST_DETECTED",
                "severity": "LOW",
                "description": (
                    f"Image exhibits poor tonal contrast (contrast std: {contrast_std:.1f}). "
                    "Foreground text distinction from background may be reduced."
                ),
                "details": {"contrast_std": round(contrast_std, 2), "min_contrast_std": self.CONTRAST_MIN_STD},
            })

        return findings


image_quality_service = ImageQualityService()
