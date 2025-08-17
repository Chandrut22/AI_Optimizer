import logging
import os
import sys
from pythonjsonlogger import jsonlogger
from app.config import settings


def configure_logging() -> None:
    """
    Configure root logger based on env:
    - LOG_FORMAT: 'console' or 'json'
    - LOG_LEVEL:  DEBUG/INFO/WARNING/ERROR
    """
    # Clear existing handlers (avoid duplication with reload)
    for h in logging.root.handlers[:]:
        logging.root.removeHandler(h)

    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    fmt_choice = settings.LOG_FORMAT.lower()

    if fmt_choice == "json":
        handler = logging.StreamHandler(sys.stdout)
        formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s %(pathname)s %(lineno)s"
        )
        handler.setFormatter(formatter)
        logging.basicConfig(level=level, handlers=[handler])
    else:
        logging.basicConfig(
            level=level,
            format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            stream=sys.stdout,
        )

    # Reduce noisy logs
    logging.getLogger("uvicorn.error").setLevel(level)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
