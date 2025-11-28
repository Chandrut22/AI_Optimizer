import httpx
import logging
from fastapi import Request, HTTPException, status, Depends
from typing import Optional
from app.core.security import validate_activation_token
from app.auth.models import UserClaims
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_authorization_token(request: Request) -> str:
    """
    Extract Bearer token from Authorization header.
    Raises 401 if missing or malformed.
    """
    auth_header: Optional[str] = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_header[len("Bearer "):].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


def get_current_activation_user(token: str = Depends(get_authorization_token)) -> UserClaims:
    """
    Validate the activation token and return the user claims.
    """
    return validate_activation_token(token)



async def check_spring_boot_limit(request: Request) -> dict:
    """
    [WRITE] Dependency: Checks limit and INCREMENTS count on Spring Boot.
    
    This is used by any endpoint that consumes a user's daily quota.
    
    Raises HTTPException on any error (401, 402, 403, 429).
    Returns the JSON response from Spring Boot (with usage details) if successful.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Missing Authorization header"
        )

    check_url = f"{settings.SPRING_BOOT_INTERNAL_URL}/api/v1/usage/check-limit"
    headers = {"Authorization": auth_header}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(check_url, headers=headers)

        if response.status_code == 200:
            return response.json() 

        if response.status_code == 402: 
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Your 14-day free trial has expired."
            )
        elif response.status_code == 429: 
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="You have exceeded your daily limit of 10 AI requests."
            )
        elif response.status_code == 403:
             reason = response.json().get("reason", "")
             if reason == "TIER_NOT_SELECTED": # Tier not selected
                 raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="TIER_NOT_SELECTED"
                 )
             else:
                 raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        elif response.status_code == 401: # Token invalid
            logger.warning("Token forwarding failed. Spring Boot rejected the token.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials."
            )
        else: 
            logger.error(f"Spring Boot returned an unexpected status: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json().get("reason", "An error occurred with your account.")
            )

    except httpx.RequestError as e:
        logger.error(f"Failed to connect to Spring Boot limit service: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service is temporarily unavailable. Please try again later."
        )

async def save_scan_history_async(request: Request, url: str):
    """
    [WRITE] Fire-and-forget call to Spring Boot to save scan history.
    Does not raise errors, only logs them, as this is not a critical path.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        logger.warning("No auth header found, cannot save scan history.")
        return

    history_url = f"{settings.SPRING_BOOT_INTERNAL_URL}/api/v1/scans"
    headers = {"Authorization": auth_header}
    payload = {"url": url}
    
    try:
        async with httpx.AsyncClient() as client:
            await client.post(history_url, headers=headers, json=payload)
        logger.info(f"Successfully saved scan history for {url}")
    except httpx.RequestError as e:
        logger.warning(f"Failed to save scan history for {url}: {e}")