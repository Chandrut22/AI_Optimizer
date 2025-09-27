# app/core/config.py
from typing import List, Optional
from pydantic import BaseSettings, Field, validator


class Settings(BaseSettings):
    # Activation token settings
    ACTIVATION_SECRET: Optional[str] = Field(None, env="ACTIVATION_SECRET")
    ACTIVATION_PUBLIC_KEY: Optional[str] = Field(None, env="ACTIVATION_PUBLIC_KEY")
    ACTIVATION_ALGORITHM: str = Field("HS256", env="ACTIVATION_ALGORITHM")

    # CORS
    CORS_ALLOWED_ORIGINS: List[str] = Field(default_factory=list, env="CORS_ALLOWED_ORIGINS")

    # Debug / Environment flags
    DEBUG: bool = Field(False, env="DEBUG")

    # Logging
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field("logs/app.log", env="LOG_FILE")

    class Config:
        env_file = ".env"
        case_sensitive = True

    @validator("CORS_ALLOWED_ORIGINS", pre=True)
    def parse_origins(cls, v):
        # Allow a JSON-like list or comma separated string or single origin
        if not v:
            return []
        if isinstance(v, (list, tuple)):
            return list(v)
        s = str(v).strip()
        if s.startswith("[") and s.endswith("]"):
            # attempt to eval simple list
            try:
                import json
                return json.loads(s)
            except Exception:
                pass
        # comma separated
        return [item.strip() for item in s.split(",") if item.strip()]

settings = Settings()
