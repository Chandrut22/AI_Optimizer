import json
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from app.core.config import settings

logger = logging.getLogger(__name__)


def _parse_cors_origins(origins_raw: str) -> list[str]:
    """
    Parse CORS origins from environment.
    Supports:
    - JSON array: '["https://a.com","https://b.com"]'
    - Comma-separated: 'https://a.com,https://b.com'
    """
    if not origins_raw:
        return []

    try:
        # Try JSON array
        parsed = json.loads(origins_raw)
        if isinstance(parsed, list):
            return [o.strip() for o in parsed if isinstance(o, str)]
    except json.JSONDecodeError:
        pass

    # Fallback: comma-separated string
    return [o.strip() for o in origins_raw.split(",") if o.strip()]


def setup_middlewares(app: FastAPI) -> None:
    """
    Configure global FastAPI middlewares:
    - CORS: allow cross-origin requests for browsers with cookies
    - HTTPS redirect: enforce HTTPS if enabled
    """
    allow_origins = _parse_cors_origins(settings.CORS_ALLOW_ORIGINS)

    if not allow_origins:
        logger.warning("⚠️ No CORS origins configured; frontend may not work properly.")
    else:
        logger.info(f"✅ CORS allowed origins: {allow_origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,  # Required for cookies
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "*"],
        expose_headers=["set-cookie"],
    )

    if settings.FORCE_HTTPS_REDIRECT:
        logger.info("🔒 Enforcing HTTPS redirect for all requests")
        app.add_middleware(HTTPSRedirectMiddleware)
    else:
        logger.warning("⚠️ HTTPS redirect is disabled; do not use this in production!")
