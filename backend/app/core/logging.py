"""
Structured logging module for VERITAS.
Supports contextual request IDs and structured console outputs.
"""

import logging
import sys
from contextvars import ContextVar
from typing import Optional

# Context variable to track Request ID across async request boundaries
request_id_ctx_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


class RequestIdFilter(logging.Filter):
    """Log filter that injects the current request_id into every log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx_var.get() or "-"
        return True


def setup_logging(debug: bool = False) -> None:
    """Configures root and application loggers."""
    log_level = logging.DEBUG if debug else logging.INFO

    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] [req:%(request_id)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    handler.setFormatter(formatter)
    handler.addFilter(RequestIdFilter())

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    # Remove existing handlers to prevent duplicate output
    root_logger.handlers = [handler]

    # Silence overly verbose external loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("passlib").setLevel(logging.ERROR)


logger = logging.getLogger("veritas")
