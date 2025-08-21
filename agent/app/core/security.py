from typing import Dict, Any
import jwt
import hashlib
from jwt import InvalidTokenError, ExpiredSignatureError
from .config import settings


def _spring_hmac_key() -> bytes:
    """
    Replicate Spring Boot's HMAC key derivation:
    SHA-256 digest of the raw JWT_SECRET.
    """
    return hashlib.sha256(settings.JWT_SECRET.encode("utf-8")).digest()


def verify_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a JWT issued by Spring Boot.
    Raises ExpiredSignatureError if expired.
    Raises InvalidTokenError for other issues.
    """
    return jwt.decode(
        token,
        _spring_hmac_key(),                # << use derived key
        algorithms=[settings.JWT_ALGORITHM],
        options={"require": ["exp"]},
    )
    