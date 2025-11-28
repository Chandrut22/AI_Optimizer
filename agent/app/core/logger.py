# app/core/logger.py
import logging
import sys
from logging.handlers import RotatingFileHandler
from app.core.config import settings


def configure_logging():
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")

    root = logging.getLogger()
    root.setLevel(level)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(level)
    ch.setFormatter(formatter)
    root.addHandler(ch)

    fh = RotatingFileHandler(settings.LOG_FILE, maxBytes=10_000_000, backupCount=5, encoding="utf-8")
    fh.setLevel(level)
    fh.setFormatter(formatter)
    root.addHandler(fh)


def get_logger(name: str):
    return logging.getLogger(name)
