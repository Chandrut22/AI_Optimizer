from typing import Optional
import httpx
from fastapi import Response


def copy_set_cookie_headers(src_headers: httpx.Headers, dst_response: Response) -> None:
    """
    Copy all `Set-Cookie` headers from the upstream Spring Boot response
    to the outgoing FastAPI response.

    This ensures that any refreshed access/refresh tokens are passed
    transparently back to the client browser.

    ⚠️ Security: Cookies should never be logged, only forwarded.
    """
    for cookie_value in src_headers.get_list("set-cookie"):
        # FastAPI allows multiple Set-Cookie headers via append
        dst_response.headers.append("set-cookie", cookie_value)


def extract_cookie_from_set_cookie_headers(
    src_headers: httpx.Headers, cookie_name: str
) -> Optional[str]:
    """
    Extract the value of a specific cookie from `Set-Cookie` headers.

    Args:
        src_headers: The headers returned by Spring Boot.
        cookie_name: The cookie name to search for (e.g., 'access_token').

    Returns:
        The cookie value if found, otherwise None.

    Example:
        Set-Cookie: access_token=jwt_token; Path=/; HttpOnly; Secure
        → returns "jwt_token"
    """
    cookie_name_lower = cookie_name.lower()

    for sc in src_headers.get_list("set-cookie"):
        # Example: "access_token=jwt; Path=/; HttpOnly; Secure"
        first_part = sc.split(";", 1)[0]  # only "name=value"
        if "=" in first_part:
            name, value = first_part.split("=", 1)
            if name.strip().lower() == cookie_name_lower:
                return value.strip()

    return None
