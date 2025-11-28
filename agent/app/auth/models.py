# app/auth/models.py
from typing import Optional, List
from pydantic import BaseModel, Field


class UserClaims(BaseModel):
    """
    Represents JWT claims that MATCH the Spring Boot JwtService.
    - 'sub' (subject) is the user id/username.
    - 'authorities' is mapped to 'scopes'
    """
    
    sub: str = Field(..., description="Subject / user id") 
    
    exp: int = Field(..., description="Expiration timestamp (epoch seconds)")
    
    iat: int = Field(..., description="Issued at timestamp")
    
    scopes: List[str] = Field(default_factory=list, alias="authorities")

    class Config:
        extra = "ignore"
        populate_by_name = True