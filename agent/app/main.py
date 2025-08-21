from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.logging import configure_logging
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
    """
    Factory function to create and configure the FastAPI application.
    """
    configure_logging()
    logger = logging.getLogger("app.main")

    app = FastAPI(
        title="AI Agent API",
        version="1.0.0",
        description="Backend service for AI agent with health checks, AI tasks, and authentication.",
        lifespan=lifespan,
    )

    # Middlewares
    setup_middlewares(app)
    app.add_middleware(RequestLoggingMiddleware)

    # Routers
    app.include_router(health.router, prefix="/health", tags=["Health"])
    app.include_router(ai.router, prefix="/ai", tags=["AI"])
    app.include_router(debug.router, prefix="/debug", tags=["Debug"])

    return app


app = create_app()
