from fastapi import Request, HTTPException, status, Depends
from app.core.security import verify_access_token
from app.auth.models import UserClaims


def get_token_from_request(request: Request) -> str:
    """Extract Bearer token from Authorization header or HttpOnly cookie."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.replace("Bearer ", "", 1)

    if "access_token" in request.cookies:
        return request.cookies.get("access_token")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing access token",
    )


def get_current_user(request: Request = Depends()) -> UserClaims:
    """Dependency to fetch current user from JWT token."""
    token = get_token_from_request(request)
    return verify_access_token(token)
