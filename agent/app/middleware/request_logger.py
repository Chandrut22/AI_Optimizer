import logging
import time
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = time.perf_counter()
        path = request.url.path
        method = request.method
        client_ip = request.client.host if request.client else "unknown"

        # Don’t log cookies or authorization headers
        logger.info("REQ %s %s ip=%s", method, path, client_ip)

        try:
            response = await call_next(request)
        except Exception as e:
            elapsed = (time.perf_counter() - start) * 1000
            logger.exception("ERR %s %s ip=%s t_ms=%.2f err=%s", method, path, client_ip, elapsed, str(e))
            raise

        elapsed = (time.perf_counter() - start) * 1000
        logger.info("RES %s %s ip=%s status=%d t_ms=%.2f",
                    method, path, client_ip, response.status_code, elapsed)
        return response
