from typing import Optional, List
from pydantic import BaseModel


class UserClaims(BaseModel):
    sub: str
    exp: int
    iat: Optional[int] = None
    email: Optional[str] = None
    roles: Optional[List[str]] = None
