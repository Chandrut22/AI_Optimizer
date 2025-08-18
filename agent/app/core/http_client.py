import httpx
from app.core.config import settings


def make_httpx_client() -> httpx.AsyncClient:
    """
    Create a preconfigured AsyncClient for communicating with the Spring Boot auth service.

    Settings come from environment variables via `app.core.config.settings`.

    - Base URL: settings.SPRING_BASE_URL
    - Timeout: settings.REQUEST_TIMEOUT_SECONDS
    - Redirects: Disabled (we expect 30x only for auth)
    - TLS verification: Enabled by default (can extend later with custom CA)

    Usage:
        async with make_httpx_client() as client:
            resp = await client.get("/health")
            data = resp.json()
    """
    return httpx.AsyncClient(
        base_url=str(settings.SPRING_BASE_URL),
        timeout=httpx.Timeout(
            timeout=settings.REQUEST_TIMEOUT_SECONDS,
            connect=settings.REQUEST_TIMEOUT_SECONDS,
            read=settings.REQUEST_TIMEOUT_SECONDS,
            write=settings.REQUEST_TIMEOUT_SECONDS,
        ),
        follow_redirects=False,
        verify=True,  # ✅ TLS verification ON (good for prod)
    )
