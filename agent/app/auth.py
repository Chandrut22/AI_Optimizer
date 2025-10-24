import os
from fastapi import Depends, HTTPException, status, Cookie
from jose import JWTError, jwt
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
from typing import Annotated

load_dotenv() # Load variables from .env file at the root

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_COOKIE_NAME = "access_token" # Define the cookie name

class TokenData(BaseModel):
    sub: str | None = None
    authorities: list[str] | None = None

async def get_token_from_cookie(
    access_token: Annotated[str | None, Cookie(alias=ACCESS_TOKEN_COOKIE_NAME)] = None
):
    """Dependency that extracts the access token from the request cookie."""
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: Access token cookie missing",
        )
    return access_token

async def get_current_user(
    token: Annotated[str, Depends(get_token_from_cookie)]
):
    """
    Dependency to validate JWT from cookie and extract user info.
    Inject this into protected endpoints.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials from cookie",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: Subject missing",
            )

        authorities: list[str] | None = payload.get("authorities")
        # Ensure authorities is a list even if missing in token
        token_data = TokenData(sub=username, authorities=authorities or [])

    except JWTError as e:
        print(f"JWTError decoding cookie token: {e}")
        raise credentials_exception
    except ValidationError as e:
        print(f"ValidationError parsing token payload: {e}")
        raise credentials_exception

    return token_data