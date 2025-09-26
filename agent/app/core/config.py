from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration settings."""

    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"

    # CORS
    CORS_ALLOWED_ORIGINS: list[str] = ["https://your-frontend.vercel.app"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
