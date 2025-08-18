"""
Application settings loaded from environment variables (.env).
Centralized configuration for FastAPI AI Agent service.
"""

from typing import List, Literal
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables.

    Sections:
        - JWT: Authentication config shared with Spring Boot
        - Spring Boot: External service URLs & paths
        - Cookies: Token cookie names
        - Networking/Security: Timeouts, CORS, HTTPS
        - Logging: Log format and verbosity
    """

    # --- JWT ---
    JWT_SECRET: str = Field(..., description="Shared secret with Spring Boot for JWT signing")
    JWT_ALGORITHM: str = Field("HS256", description="JWT algorithm used for signing")

    # --- Spring Boot ---
    SPRING_BASE_URL: AnyHttpUrl = Field(..., description="Base URL of the Spring Boot service")
    SPRING_REFRESH_PATH: str = Field("/refresh-token", description="Path for refreshing tokens")

    # --- Cookies ---
    ACCESS_COOKIE_NAME: str = Field("access_token", description="Name of the access token cookie")
    REFRESH_COOKIE_NAME: str = Field("refresh_token", description="Name of the refresh token cookie")

    # --- Networking / Security ---
    REQUEST_TIMEOUT_SECONDS: float = Field(6.0, description="Default timeout for external requests")
    CORS_ALLOW_ORIGINS: List[AnyHttpUrl] = Field(default_factory=list, description="Allowed CORS origins")
    FORCE_HTTPS_REDIRECT: bool = Field(True, description="Force HTTPS redirect in production")

    # --- Logging ---
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = Field(
        "INFO", description="Logging level"
    )
    LOG_FORMAT: Literal["console", "json"] = Field(
        "console", description="Log output format"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
