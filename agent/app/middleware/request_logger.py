# app/middleware/request_logger.py
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("uvicorn.access")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Simple request/response logging middleware.
    Keeps logs concise for monitoring.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        logger.info("Incoming: %s %s", request.method, request.url.path)
        response = await call_next(request)
        logger.info("Response: %s %s -> %s", request.method, request.url.path, response.status_code)
        return response
