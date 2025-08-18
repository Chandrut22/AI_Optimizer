# """
# Main entrypoint for the FastAPI AI Agent service.
# """

# import logging
# from fastapi import FastAPI

# from app.core.logging import configure_logging
# from app.middleware.security import setup_middlewares
# from app.middleware.request_logger import RequestLoggingMiddleware
# from app.routers import ai, health


# def create_app() -> FastAPI:
#     """
#     Factory function to create and configure the FastAPI application.
#     """
#     # --- Configure logging ---
#     configure_logging()
#     logger = logging.getLogger("app.main")
#     logger.info("Bootstrapping FastAPI AI Agent service...")

#     # --- Initialize app ---
#     app = FastAPI(
#         title="AI Agent API",
#         version="1.0.0",
#         description="Backend service for AI agent with health checks, AI tasks, and authentication.",
#     )

#     # --- Middlewares ---
#     setup_middlewares(app)
#     app.add_middleware(RequestLoggingMiddleware)

#     # --- Routers ---
#     app.include_router(health.router, prefix="/health", tags=["Health"])
#     app.include_router(ai.router, prefix="/ai", tags=["AI"])

#     logger.info("Application ready.")
#     return app


# # Application instance
# app = create_app()

from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}
