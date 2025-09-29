# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.logger import configure_logging, get_logger
from app.middleware.security import setup_middlewares
from app.middleware.request_logger import RequestLoggingMiddleware
from app.routers import service, health, debug, ai
from app.core.config import settings

configure_logging()
logger = get_logger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting FastAPI service...")
    yield
    logger.info("🛑 Shutting down FastAPI service...")


def create_app() -> FastAPI:
    app = FastAPI(
        title="FastAPI Activation Service",
        version="1.0.0",
        description="Validates Spring Boot activation_token JWTs and exposes /api/service",
        lifespan=lifespan,
    )

    # Middlewares & logging
    setup_middlewares(app)
    app.add_middleware(RequestLoggingMiddleware)

    # Routers
    app.include_router(health.router, prefix="/health", tags=["Health"])
    app.include_router(service.router, prefix="/api", tags=["API"])
    app.include_router(ai.router, prefix="/api", tags=["Agent"])
    # debug routes should be mounted only if debug enabled (see below)
    if settings.DEBUG:
        app.include_router(debug.router, prefix="/debug", tags=["Debug"])

    # Generic exception handler (logs and returns minimal info)
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception: %s", exc, exc_info=True)
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

    return app


app = create_app()
