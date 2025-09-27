# app/auth/models.py
from typing import Optional, List
from pydantic import BaseModel, Field


class UserClaims(BaseModel):
    """
    Represents JWT claims we expect in activation_token.
    `sub` is the user id. `scopes` is a list of permission strings.
    """
    sub: str = Field(..., description="Subject / user id")
    exp: int = Field(..., description="Expiration timestamp (epoch seconds)")
    iat: Optional[int] = Field(None, description="Issued at timestamp")
    email: Optional[str] = Field(None, description="User email")
    scopes: List[str] = Field(default_factory=list, description="Scopes granted")
    # allow extra claims but ignore them
    class Config:
        extra = "ignore"
