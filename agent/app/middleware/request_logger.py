import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("app.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Simple request/response logging middleware.
    Logs in a structured, JSON-friendly way without clashing with Uvicorn.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        logger.info(
            "Incoming request",
            extra={"method": request.method, "path": request.url.path},
        )

        response = await call_next(request)

        logger.info(
            "Response sent",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
            },
        )

        return response
