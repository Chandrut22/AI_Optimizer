from typing import Dict, Any
import jwt
from jwt import InvalidTokenError, ExpiredSignatureError
from .config import settings


def verify_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a JWT locally using the shared secret/algorithm.
    Raises ExpiredSignatureError if expired.
    Raises InvalidTokenError for other issues.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
        options={"require": ["exp"]},
    )
