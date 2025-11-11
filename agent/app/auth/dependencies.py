# app/auth/dependencies.py
from fastapi import Request, HTTPException, status, Depends
from typing import Optional
from app.core.security import validate_activation_token
from app.auth.models import UserClaims

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
