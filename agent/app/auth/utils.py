import httpx
from fastapi import Response


def copy_set_cookie_headers(src_headers: httpx.Headers, dst_response: Response) -> None:
    """
    Copy *all* Set-Cookie headers from Spring Boot response to our FastAPI response.
    Use headers.append to allow multiple cookies.
    """
    for cookie_value in src_headers.get_list("set-cookie"):
        # Do NOT log cookies; they are sensitive.
        dst_response.headers.append("set-cookie", cookie_value)


def extract_cookie_from_set_cookie_headers(
    src_headers: httpx.Headers, cookie_name: str
) -> str | None:
    """
    Parse Set-Cookie headers and return the cookie's value if present.
    """
    for sc in src_headers.get_list("set-cookie"):
        # "access_token=jwt; Path=/; HttpOnly; Secure; SameSite=None"
        first = sc.split(";", 1)[0]
        if "=" in first:
            name, value = first.split("=", 1)
            if name.strip().lower() == cookie_name.lower():
                return value.strip()
    return None
