# app/core/security.py
from typing import Any, Dict
import jwt
from jwt import PyJWTError
from fastapi import HTTPException, status
from app.core.config import settings
from app.auth.models import UserClaims

# Helper: determine key to use
def _get_verification_key() -> str:
    alg = settings.ACTIVATION_ALGORITHM.upper()
    if alg.startswith("HS"):
        if not settings.ACTIVATION_SECRET:
            raise RuntimeError("ACTIVATION_SECRET is required for HMAC algorithms")
        return settings.ACTIVATION_SECRET
    elif alg.startswith("RS") or alg.startswith("ES"):
        # For RSA/ECDSA, expect public key (PEM) in ACTIVATION_PUBLIC_KEY
        if not settings.ACTIVATION_PUBLIC_KEY:
            raise RuntimeError("ACTIVATION_PUBLIC_KEY is required for RSA/ECDSA algorithms")
        return settings.ACTIVATION_PUBLIC_KEY
    else:
        # fallback to secret
        if settings.ACTIVATION_SECRET:
            return settings.ACTIVATION_SECRET
        raise RuntimeError("No ACTIVATION secret/public key configured")


def validate_activation_token(token: str) -> UserClaims:
    """
    Validate the activation token coming from the frontend.
    Returns a populated UserClaims on success.
    Raises HTTPException(401) on invalid/expired/malformed tokens.
    """
    key = _get_verification_key()
    algorithms = [settings.ACTIVATION_ALGORITHM]

    try:
        payload: Dict[str, Any] = jwt.decode(token, key=key, algorithms=algorithms)
    except PyJWTError as exc:
        # Map JWT errors to 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired activation token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    # Use pydantic model to validate expected claims
    try:
        claims = UserClaims(**payload)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Activation token payload missing required claims",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    return claims
