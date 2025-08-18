import logging
import time
from typing import Callable, Awaitable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for structured request/response logging.

    - Logs method, path, status, IP, response time
    - Does NOT log cookies or authorization headers
    - Exceptions are logged at ERROR level with traceback
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        start = time.perf_counter()

        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        logger.info(
            "Incoming request",
            extra={
                "method": method,
                "path": path,
                "ip": client_ip,
            },
        )

        try:
            response = await call_next(request)
        except Exception as e:
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.exception(
                "Request failed",
                extra={
                    "method": method,
                    "path": path,
                    "ip": client_ip,
                    "elapsed_ms": round(elapsed_ms, 2),
                    "error": str(e),
                },
            )
            raise

        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "Request completed",
            extra={
                "method": method,
                "path": path,
                "ip": client_ip,
                "status": response.status_code,
                "elapsed_ms": round(elapsed_ms, 2),
            },
        )

        return response
