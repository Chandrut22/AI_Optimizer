from typing import Optional, List
from pydantic import BaseModel, Field


class UserClaims(BaseModel):
    """
    Schema for JWT claims extracted from the access token.

    This should align with the JWT payload issued by Spring Boot.
    """

    sub: str = Field(..., description="Subject (typically the user ID)")
    exp: int = Field(..., description="Expiration timestamp (epoch, seconds)")
    iat: Optional[int] = Field(None, description="Issued-at timestamp (epoch, seconds)")
    email: Optional[str] = Field(None, description="User email if present in token")
    roles: List[str] = Field(default_factory=list, description="User roles/authorities")

    class Config:
        # Allow extra fields just in case Spring adds more claims
        extra = "allow"
