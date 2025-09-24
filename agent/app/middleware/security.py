import json
import logging
from typing import Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from app.core.config import settings

logger = logging.getLogger(__name__)


def _parse_cors_origins(origins_raw: Any) -> list[str]:
    """
    Normalize CORS origins from env / settings.
    Handles:
    - Python list (already parsed by Pydantic)
    - JSON string (e.g., '["https://a.com","https://b.com"]')
    - Comma-separated string (e.g., 'https://a.com,https://b.com')
    """
    if not origins_raw:
        return []

    if isinstance(origins_raw, list):
        return [str(o).strip() for o in origins_raw if o]

    if isinstance(origins_raw, str):
        try:
            parsed = json.loads(origins_raw)
            if isinstance(parsed, list):
                return [str(o).strip() for o in parsed if o]
        except json.JSONDecodeError:
            return [o.strip() for o in origins_raw.split(",") if o.strip()]

    return [str(origins_raw).strip()]


def setup_middlewares(app: FastAPI) -> None:
    """
    Configure global FastAPI middlewares:
    - CORS
    - HTTPS redirect
    """
    allow_origins = _parse_cors_origins(settings.CORS_ALLOW_ORIGINS)

    if not allow_origins:
        logger.warning("⚠️ No CORS origins configured; frontend may not work properly.")
    else:
        logger.info(f"✅ CORS allowed origins: {allow_origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,   # ✅ FIXED (use parsed list)
        allow_credentials=True,
        allow_methods=["*"],          # shorthand for all methods
        allow_headers=["*"],          # shorthand for all headers
    )

    if settings.FORCE_HTTPS_REDIRECT:
        logger.info("🔒 Enforcing HTTPS redirect for all requests")
        app.add_middleware(HTTPSRedirectMiddleware)
    else:
        logger.warning("⚠️ HTTPS redirect is disabled; do not use this in production!")
