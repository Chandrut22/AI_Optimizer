import logging
from typing import Dict
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/debug", tags=["Debug"])


# --- Response Model --- #

class CookiesResponse(BaseModel):
    """Response model for debug cookies endpoint."""

    cookies_count: int = Field(..., description="Number of cookies received")
    cookies: Dict[str, str] = Field(
        ..., description="Dictionary of cookie names and values"
    )


# --- Routes --- #

@router.get(
    "/cookies",
    response_model=CookiesResponse,
    summary="Inspect request cookies",
    response_description="List of cookies received by FastAPI",
)
async def debug_cookies(request: Request) -> CookiesResponse:
    """
    Debug endpoint to inspect cookies received by FastAPI.

    ⚠️ Do NOT expose in production — this reveals sensitive cookies.
    Useful for local testing and verifying cookie-based authentication.
    """
    cookies = request.cookies

    logger.debug("Received cookies: %s", cookies)

    return CookiesResponse(
        cookies_count=len(cookies),
        cookies=dict(cookies),
    )
