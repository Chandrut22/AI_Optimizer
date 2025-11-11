# app/core/security.py
from typing import Any, Dict
import jwt
from jwt import PyJWTError
from fastapi import HTTPException, status
from app.core.config import settings
from app.auth.models import UserClaims  # <-- Imports the new model


def _get_verification_key() -> str:
    """
    Get the correct verification key based on the algorithm.
    For RS256, this is the public key.
    For HS256, this is the shared secret.
    """
    alg = settings.ACTIVATION_ALGORITHM.upper()

    if alg.startswith("RS") or alg.startswith("ES"):  # RSA/ECDSA
        if not settings.ACTIVATION_PUBLIC_KEY:
            raise RuntimeError(f"ACTIVATION_PUBLIC_KEY is required for {alg} algorithm")
        # The key is expected in PEM format as a string
        return settings.ACTIVATION_PUBLIC_KEY
    
    elif alg.startswith("HS"):  # HMAC
        if not settings.ACTIVATION_SECRET:
            raise RuntimeError(f"ACTIVATION_SECRET is required for {alg} algorithm")
        return settings.ACTIVATION_SECRET
    
    else:
        raise RuntimeError(f"Unsupported JWT algorithm: {alg}")


def validate_activation_token(token: str) -> UserClaims:
    """
    Validate the activation token coming from the frontend.
    Returns a populated UserClaims on success.
    Raises HTTPException(401) on invalid/expired/malformed tokens.
    """
    
    try:
        key = _get_verification_key()
        algorithms = [settings.ACTIVATION_ALGORITHM]

        # Set up validation options
        # We only verify audience/issuer if they are set in the config
        options = {
            "verify_aud": bool(settings.AUTH_AUDIENCE),
            "verify_iss": bool(settings.AUTH_ISSUER),
        }

        payload: Dict[str, Any] = jwt.decode(
            token,
            key=key,
            algorithms=algorithms,
            audience=settings.AUTH_AUDIENCE,
            issuer=settings.AUTH_ISSUER,
            options=options
        )
        
    except PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired activation token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except RuntimeError as exc:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token validation configuration error: {exc}",
        ) from exc

    try:
        # Pydantic validates the payload against the new UserClaims model
        # It will automatically map "authorities" -> "scopes"
        claims = UserClaims(**payload)
        
    except Exception as exc:
        # This will catch if 'sub' or 'exp' is missing, etc.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token payload is missing required claims: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    return claims