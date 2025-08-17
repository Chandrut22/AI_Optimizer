import logging
from fastapi import FastAPI
from app.core.logging import configure_logging
from app.middleware.security import setup_middlewares
from app.middleware.request_logger import RequestLoggingMiddleware
from app.routers import ai, health


def create_app() -> FastAPI:
    # Initialize logging first
    configure_logging()
    logger = logging.getLogger(__name__)
    logger.info("Bootstrapping FastAPI AI Agent service...")

    app = FastAPI(title="AI Agent API", version="1.0.0")

    # Middlewares
    setup_middlewares(app)
    app.add_middleware(RequestLoggingMiddleware)

    # Routers
    app.include_router(health.router)
    app.include_router(ai.router)

    logger.info("Application ready.")
    return app


app = create_app()
