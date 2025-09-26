import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging incoming requests."""

    async def dispatch(self, request: Request, call_next) -> Response:
        logger = logging.getLogger("uvicorn.access")
        logger.info(f"📥 {request.method} {request.url}")
        response = await call_next(request)
        logger.info(f"📤 {response.status_code} {request.url}")
        return response
