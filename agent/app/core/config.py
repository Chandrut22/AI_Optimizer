# app/core/config.py
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
import json


class Settings(BaseSettings):
    # --- JWT Settings ---
    ACTIVATION_ALGORITHM: str = Field(default="RS256", description="JWT signing algorithm")
    ACTIVATION_PUBLIC_KEY: Optional[str] = Field(
        default=None, 
        description="PEM-formatted public key for RS256 validation"
    )
    
    # --- Optional Claims ---
    AUTH_ISSUER: Optional[str] = Field(None, description="The 'iss' claim (optional)")
    AUTH_AUDIENCE: Optional[str] = Field(None, description="The 'aud' claim (optional)")
    
    # --- Other Settings ---
    CORS_ALLOWED_ORIGINS: List[str] = Field(default_factory=list, description="Allowed CORS origins")
    DEBUG: bool = Field(default=False, description="Enable debug mode")
    LOG_LEVEL: str = Field(default="INFO", description="Log level")
    LOG_FILE: str = Field(default="logs/app.log", description="Path to log file")

    # --- ADD THIS LINE ---
    SPRING_BOOT_INTERNAL_URL: str = Field(
        ..., 
        description="Base URL for the internal Spring Boot service"
    )
    # ---------------------
    
    ACTIVATION_SECRET: Optional[str] = Field(default=None, description="JWT secret (for HS256)")


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