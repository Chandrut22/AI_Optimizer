"""
Logging configuration for the FastAPI AI Agent service.
Console = human readable, File = JSON (daily filename).
"""

import logging
import sys
import os
from datetime import datetime
from pythonjsonlogger import jsonlogger
from app.core.config import settings


def configure_logging() -> None:
    """
    Configure logging with:
      - Console handler (human readable)
      - File handler (JSON structured, per-day filename)
    """

    # --- Reset existing loggers to avoid duplication ---
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    # --- Set log level ---
    level: int = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    handlers: list[logging.Handler] = []

    # ---- Console Handler (plain format, NO JSON) ----
    console_handler = logging.StreamHandler(sys.stdout)
    console_formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    console_handler.setFormatter(console_formatter)
    handlers.append(console_handler)

    # ---- File Handler (JSON format, named by date) ----
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = os.path.join(log_dir, f"ai-agent-{today}.log")

    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    json_formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s %(pathname)s %(lineno)d"
    )
    file_handler.setFormatter(json_formatter)
    handlers.append(file_handler)

    # --- Apply configuration ---
    logging.basicConfig(level=level, handlers=handlers)

    # --- Reduce noisy loggers ---
    logging.getLogger("uvicorn.error").setLevel(level)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)

    logging.getLogger("app.core.logging").info(
        f"Logging initialized with level={settings.LOG_LEVEL}, console=plain, file={log_file}"
    )
