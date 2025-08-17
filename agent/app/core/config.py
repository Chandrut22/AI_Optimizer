from typing import List
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # JWT config (shared with Spring Boot)
    JWT_SECRET: str = Field(..., description="Same secret used by Spring Boot")
    JWT_ALGORITHM: str = Field("HS256", description="JWT algorithm")

    # Spring Boot service
    SPRING_BASE_URL: AnyHttpUrl
    SPRING_REFRESH_PATH: str = "/refresh-token"

    # Cookies (must match Spring Boot)
    ACCESS_COOKIE_NAME: str = "access_token"
    REFRESH_COOKIE_NAME: str = "refresh_token"

    # Networking / security
    REQUEST_TIMEOUT_SECONDS: float = 6.0
    CORS_ALLOW_ORIGINS: List[AnyHttpUrl] = []
    FORCE_HTTPS_REDIRECT: bool = True

    # Logging
    LOG_LEVEL: str = "INFO"       # DEBUG, INFO, WARNING, ERROR
    LOG_FORMAT: str = "console"   # console | json

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
