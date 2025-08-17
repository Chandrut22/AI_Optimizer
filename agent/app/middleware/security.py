from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from app.core.config import settings


def setup_middlewares(app: FastAPI) -> None:
    # CORS with credentials for cookie-based auth
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(o) for o in settings.CORS_ALLOW_ORIGINS],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["set-cookie"],
    )

    if settings.FORCE_HTTPS_REDIRECT:
        app.add_middleware(HTTPSRedirectMiddleware)
