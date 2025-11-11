# app/auth/models.py
from typing import Optional, List
from pydantic import BaseModel, Field


class UserClaims(BaseModel):
    """
    Represents JWT claims that MATCH the Spring Boot JwtService.
    - 'sub' (subject) is the user id/username.
    - 'authorities' is mapped to 'scopes'
    """
    
    # 'sub' claim (from setSubject)
    sub: str = Field(..., description="Subject / user id") 
    
    # 'exp' claim (from setExpiration)
    exp: int = Field(..., description="Expiration timestamp (epoch seconds)")
    
    # 'iat' claim (from setIssuedAt)
    iat: int = Field(..., description="Issued at timestamp")
    
    # This is the key:
    # It looks for a claim named "authorities" in the JWT payload
    # and maps it to this 'scopes' class variable.
    scopes: List[str] = Field(default_factory=list, alias="authorities")

    # We allow extra claims (like 'jti', etc.) but ignore them
    class Config:
        extra = "ignore"
        # This line is crucial for the 'alias' to work
        populate_by_name = True