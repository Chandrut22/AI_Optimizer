"""
Authentication dependency for FastAPI.

- Verifies JWT access token from cookies
- If expired/invalid, calls Spring Boot /refresh-token
- Propagates Set-Cookie headers from Spring Boot
- Returns validated UserClaims model
"""

import logging
from fastapi import Request, Response, HTTPException, status
import jwt
import httpx

from app.auth.models import UserClaims
from app.auth.utils import (
    copy_set_cookie_headers,
    extract_cookie_from_set_cookie_headers,
)
from app.core.config import settings
from app.core.security import verify_jwt
from app.core.http_client import make_httpx_client

logger = logging.getLogger(__name__)


async def get_current_user(request: Request, response: Response) -> UserClaims:
    """
    Dependency for retrieving the current authenticated user.

    Workflow:
        1. Verify access_token from cookies locally
        2. If expired/invalid → refresh via Spring Boot
        3. Propagate Set-Cookie headers from Spring Boot
        4. Verify refreshed access_token and return claims
    """
    access_cookie = settings.ACCESS_COOKIE_NAME
    refresh_cookie = settings.REFRESH_COOKIE_NAME

    access_token = request.cookies.get(access_cookie)

    # Step 1: Local verification
    if access_token:
        claims = _try_verify_access_token(access_token)
        if claims:
            return claims

    # Step 2: Require refresh token
    if refresh_cookie not in request.cookies:
        logger.warning("Missing refresh token cookie; rejecting request.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
        )

    # Step 2b: Refresh from Spring Boot
    spring_resp = await _refresh_from_spring(request)

    # Step 3: Propagate cookies to client
    copy_set_cookie_headers(spring_resp.headers, response)

    if spring_resp.status_code >= 400:
        logger.warning("Spring Boot refresh rejected with status=%d", spring_resp.status_code)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    # Step 4: Verify new token
    new_access_token = extract_cookie_from_set_cookie_headers(
        spring_resp.headers, access_cookie
    ) or request.cookies.get(access_cookie)

    if not new_access_token:
        logger.error("Refresh succeeded but no access token cookie found.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    claims = _try_verify_access_token(new_access_token)
    if not claims:
        logger.error("Refreshed token is invalid.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    return claims


# ----------------------------------------------------------------------
# Internal helpers
# ----------------------------------------------------------------------
def _try_verify_access_token(token: str) -> UserClaims | None:
    """Attempt to verify access token locally."""
    try:
        claims = verify_jwt(token)
        logger.debug("Access token valid for sub=%s", claims.get("sub"))
        return UserClaims(**claims)
    except jwt.ExpiredSignatureError:
        logger.info("Access token expired; attempting refresh.")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid access token; attempting refresh. reason=%s", e)
        return None


async def _refresh_from_spring(request: Request) -> httpx.Response:
    """Call Spring Boot refresh endpoint with incoming cookies."""
    url = f"{settings.SPRING_BASE_URL}{settings.SPRING_REFRESH_PATH}"
    headers = {
        "User-Agent": request.headers.get("user-agent", "FastAPI-AI-Agent"),
        "X-Requested-With": "XMLHttpRequest",
    }

    async with make_httpx_client() as client:
        try:
            response = await client.post(url, cookies=request.cookies, headers=headers)
            logger.info("Spring Boot refresh request completed with status=%d", response.status_code)
            return response
        except httpx.RequestError as e:
            logger.error("Failed to reach Spring Boot service: %s", e)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Auth service unavailable",
            )
