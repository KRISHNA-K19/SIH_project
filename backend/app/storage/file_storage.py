"""
Secure private local file storage service.
Handles file signature verification, size checks, SHA-256 hashing,
path traversal prevention, and isolated directory storage.
"""

import hashlib
import io
import os
import uuid
from pathlib import Path
from typing import Optional, Set, Tuple
from fastapi import HTTPException, UploadFile, status
from PIL import Image

from app.core.config import settings
from app.core.logging import logger

# Recognized file signatures (magic bytes)
MAGIC_SIGNATURES = {
    "image/jpeg": [b"\xFF\xD8\xFF"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
}

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}


class StorageService:
    def __init__(self, base_storage_path: Optional[Path] = None):
        self.base_path = base_storage_path or settings.resolved_storage_path
        self.original_dir = self.base_path / "documents" / "original"
        self.processed_dir = self.base_path / "documents" / "processed"
        self.original_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(self, file_content: bytes, filename: str, content_type: Optional[str] = None) -> Tuple[str, str]:
        """
        Validates file size, file extension, magic byte signature, and image readability.
        Returns: (normalized_mime_type: str, safe_extension: str)
        Raises HTTPException if file is invalid or insecure.
        """
        # 1. Size verification
        file_size = len(file_content)
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )
        if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum permissible size of {max_mb} MB.",
            )

        # 2. Extension verification
        ext = Path(filename).suffix.lower()
        if ext not in settings.allowed_extension_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file extension '{ext}'. Permitted extensions: {settings.ALLOWED_EXTENSIONS}",
            )

        # 3. Magic byte signature verification
        detected_mime: Optional[str] = None
        for mime, signatures in MAGIC_SIGNATURES.items():
            for sig in signatures:
                if file_content.startswith(sig):
                    detected_mime = mime
                    break
            if detected_mime:
                break

        if not detected_mime or detected_mime not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file signature: Content does not match supported image formats (JPEG, PNG).",
            )

        # 4. Image readability check using Pillow
        try:
            with Image.open(io.BytesIO(file_content)) as img:
                img.verify()
        except Exception as exc:
            logger.warning(f"Image readability verification failed: {exc}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrupted or unreadable image data.",
            )

        # Map to canonical extension
        canonical_ext = ".jpg" if detected_mime == "image/jpeg" else ".png"
        return detected_mime, canonical_ext

    def save_original_file(self, file_content: bytes, safe_extension: str) -> Tuple[str, str, str]:
        """
        Saves uploaded file into private original storage.
        Returns: (storage_filename, absolute_storage_path, sha256_hash)
        """
        sha256_hash = hashlib.sha256(file_content).hexdigest()
        unique_name = f"{uuid.uuid4().hex}{safe_extension}"
        target_path = self.original_dir / unique_name

        # Prevent path traversal
        self._assert_within_directory(target_path, self.original_dir)

        with open(target_path, "wb") as f:
            f.write(file_content)

        return unique_name, str(target_path), sha256_hash

    def get_file_path(self, storage_filename: str, is_processed: bool = False) -> Path:
        """
        Retrieves safe absolute path for storage filename, enforcing strict directory boundary checks.
        """
        target_dir = self.processed_dir if is_processed else self.original_dir
        # Strip path delimiters
        safe_name = os.path.basename(storage_filename)
        target_path = (target_dir / safe_name).resolve()

        self._assert_within_directory(target_path, target_dir)

        if not target_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stored document file not found on disk.",
            )

        return target_path

    def _assert_within_directory(self, target: Path, base: Path) -> None:
        """Enforces that target stays strictly within base directory (prevents path traversal)."""
        try:
            target.resolve().relative_to(base.resolve())
        except ValueError:
            logger.error(f"Path traversal detected! Target: {target}, Base: {base}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Illegal path access attempt detected.",
            )


storage_service = StorageService()
