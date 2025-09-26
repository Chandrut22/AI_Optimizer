from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.logger import configure_logging
from app.middleware.security import setup_middlewares
from app.middleware.request_logger import RequestLoggingMiddleware
from app.routers import ai, health, debug
import logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger = logging.getLogger("app.main")
    logger.info("🚀 Starting FastAPI AI Agent service...")
    yield
    logger.info("🛑 Shutting down FastAPI AI Agent service...")


def create_app() -> FastAPI:
    """Factory function for creating FastAPI application."""
    configure_logging()
    app = FastAPI(
        title="AI Agent API",
        version="1.0.0",
        description="FastAPI service secured with Spring Boot JWT tokens",
        lifespan=lifespan,
    )

    # Middlewares
    setup_middlewares(app)
    app.add_middleware(RequestLoggingMiddleware)

    # Routers
    app.include_router(health.router, prefix="/health", tags=["Health"])
    app.include_router(ai.router, prefix="/ai", tags=["AI"])
    app.include_router(debug.router, prefix="/debug", tags=["Debug"])

    # Exception Handlers
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logging.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return app


app = create_app()
