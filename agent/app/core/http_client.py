import httpx
from app.config import settings


def make_httpx_client() -> httpx.AsyncClient:
    # Client for Spring Boot auth service
    return httpx.AsyncClient(
        base_url=str(settings.SPRING_BASE_URL),
        timeout=httpx.Timeout(settings.REQUEST_TIMEOUT_SECONDS),
        follow_redirects=False,
        verify=True,  # Keep TLS verification ON
    )
