import jwt
import hashlib
from fastapi import HTTPException, status
from jwt import PyJWTError
from app.auth.models import UserClaims
from app.core.config import settings

# Hash secret with SHA-256 (same as Spring Boot JwtUtil)
SECRET_KEY = hashlib.sha256(settings.JWT_SECRET.encode("utf-8")).digest()
ALGORITHM = settings.JWT_ALGORITHM


def verify_access_token(token: str) -> UserClaims:
    """
    Validate JWT access token issued by Spring Boot.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return UserClaims(**payload)
    except PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired access token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
