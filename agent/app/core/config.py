from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
import json


class Settings(BaseSettings):
    # Activation token settings
    ACTIVATION_SECRET: Optional[str] = Field(default=None, description="JWT secret for activation token")
    ACTIVATION_PUBLIC_KEY: Optional[str] = Field(default=None, description="JWT public key (for RS256/ES256)")
    ACTIVATION_ALGORITHM: str = Field(default="HS256", description="JWT signing algorithm")

    # CORS
    CORS_ALLOWED_ORIGINS: List[str] = Field(default_factory=list, description="Allowed CORS origins")

    # Debug / Environment flags
    DEBUG: bool = Field(default=False, description="Enable debug mode")

    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Log level")
    LOG_FILE: str = Field(default="logs/app.log", description="Path to log file")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

    @field_validator("CORS_ALLOWED_ORIGINS", mode="before")
    def parse_origins(cls, v):
        """Allow list, JSON array, or comma-separated string for origins."""
        if not v:
            return []
        if isinstance(v, (list, tuple)):
            return list(v)
        s = str(v).strip()
        if s.startswith("[") and s.endswith("]"):
            try:
                return json.loads(s)
            except Exception:
                pass
        return [item.strip() for item in s.split(",") if item.strip()]


settings = Settings()
