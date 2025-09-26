from typing import Optional, List
from pydantic import BaseModel, Field


class UserClaims(BaseModel):
    """JWT claims extracted from Spring Boot-issued token."""

    sub: str = Field(..., description="User ID or email")
    exp: int = Field(..., description="Expiration timestamp (epoch seconds)")
    iat: Optional[int] = Field(None, description="Issued at timestamp")
    email: Optional[str] = Field(None, description="User email")
    roles: List[str] = Field(default_factory=list, description="User roles")

    class Config:
        extra = "ignore"  # ignore unexpected fields
