import json
import logging
from typing import Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
# Make sure this import points to your actual settings configuration
# from app.core.config import settings

# This is a placeholder for your settings object for testing purposes.
# In your actual app, you would use the commented-out import above.
class Settings:
    CORS_ALLOW_ORIGINS: str | list[str] = ""
    FORCE_HTTPS_REDIRECT: bool = False

settings = Settings()


logger = logging.getLogger(__name__)


def _parse_cors_origins(origins_raw: Any) -> list[str]:
    """
    Normalize CORS origins from env / settings.
    Handles:
    - Python list (already parsed by Pydantic)
    - JSON string (e.g., '["https://a.com/","https://b.com"]')
    - Comma-separated string (e.g., 'https://a.com/, https://b.com')
    Strips whitespace and trailing slashes from each origin.
    """
    if not origins_raw:
        return []

    # Helper function to clean a single origin URL
    def clean_origin(origin: Any) -> str:
        # 1. Convert to string, 2. Strip whitespace, 3. Strip trailing slashes
        return str(origin).strip().rstrip("/")

    if isinstance(origins_raw, list):
        return [clean_origin(o) for o in origins_raw if o]

    if isinstance(origins_raw, str):
        try:
            # Handle JSON-formatted string (e.g., '["url1", "url2/"]')
            parsed = json.loads(origins_raw)
            if isinstance(parsed, list):
                return [clean_origin(o) for o in parsed if o]
        except json.JSONDecodeError:
            # Handle comma-separated string (e.g., 'url1/, url2')
            return [clean_origin(o) for o in origins_raw.split(",") if o.strip()]

    # Fallback for any other single-item type
    cleaned_origin = clean_origin(origins_raw)
    return [cleaned_origin] if cleaned_origin else []


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
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    if settings.FORCE_HTTPS_REDIRECT:
        logger.info("🔒 Enforcing HTTPS redirect for all requests")
        app.add_middleware(HTTPSRedirectMiddleware)
    else:
        logger.warning("⚠️ HTTPS redirect is disabled; do not use this in production!")