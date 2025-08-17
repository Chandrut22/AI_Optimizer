import logging
import jwt
from fastapi import Request, Response, HTTPException, status
from app.auth.models import UserClaims
from app.auth.utils import copy_set_cookie_headers, extract_cookie_from_set_cookie_headers
from app.core.config import settings
from app.core.security import verify_jwt
from app.core.http_client import make_httpx_client

logger = logging.getLogger(__name__)


async def get_current_user(request: Request, response: Response) -> UserClaims:
    """
    Auth dependency:
    1) Verify access_token from cookies locally
    2) If expired/invalid → call Spring Boot /refresh-token with incoming cookies
    3) Copy any Set-Cookie headers from Spring into our response
    4) Verify new access_token and return claims
    """
    access_cookie_name = settings.ACCESS_COOKIE_NAME
    refresh_cookie_name = settings.REFRESH_COOKIE_NAME

    access_token = request.cookies.get(access_cookie_name)

    # 1) Local verification
    if access_token:
        try:
            claims = verify_jwt(access_token)
            logger.debug("Access token valid for sub=%s", claims.get("sub"))
            return UserClaims(**claims)
        except jwt.ExpiredSignatureError:
            logger.info("Access token expired; attempting refresh.")
        except jwt.InvalidTokenError as e:
            logger.warning("Invalid access token; attempting refresh. Reason=%s", e)

    # 2) Refresh flow requires refresh cookie present
    if refresh_cookie_name not in request.cookies:
        logger.warning("Missing refresh token cookie; unauthorized.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    # Call Spring Boot refresh endpoint with browser cookies
    async with make_httpx_client() as client:
        try:
            spring_resp = await client.post(
                settings.SPRING_REFRESH_PATH,
                cookies=request.cookies,  # forwards both access & refresh cookies
                headers={
                    "User-Agent": request.headers.get("user-agent", "FastAPI-AI-Agent"),
                    "X-Requested-With": "XMLHttpRequest",
                },
            )
            logger.info("Spring refresh call completed with status=%d", spring_resp.status_code)
        except Exception as e:
            logger.error("Failed to reach Spring Boot auth service: %s", e)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Auth service unavailable",
            )

    # 3) Pass through Set-Cookie to the browser
    copy_set_cookie_headers(spring_resp.headers, response)

    if spring_resp.status_code >= 400:
        logger.warning("Spring refresh rejected; status=%d", spring_resp.status_code)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    # 4) Verify the new token from Set-Cookie (or fallback to existing)
    new_access_token = extract_cookie_from_set_cookie_headers(
        spring_resp.headers, access_cookie_name
    ) or request.cookies.get(access_cookie_name)

    if not new_access_token:
        logger.error("Refresh succeeded but access token cookie missing.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    try:
        claims = verify_jwt(new_access_token)
        logger.debug("Refreshed access token valid for sub=%s", claims.get("sub"))
        return UserClaims(**claims)
    except jwt.InvalidTokenError as e:
        logger.error("Invalid refreshed access token: %s", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
