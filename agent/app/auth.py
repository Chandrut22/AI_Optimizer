import os
import logging
from fastapi import Depends, HTTPException, status, Cookie
from jose import JWTError, jwt
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
from typing import Annotated

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load variables from .env file (if present, Render vars override)
load_dotenv()

# --- Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY")
# ALGORITHM variable is no longer strictly needed for decode, but good for logging
# ALGORITHM = os.getenv("ALGORITHM") # You can comment this out if desired
ACCESS_TOKEN_COOKIE_NAME = "access_token"

# --- Startup Logging ---
if not SECRET_KEY:
    logger.error("!!! SECRET_KEY environment variable not found or empty!")
else:
    logger.info(f"--- FastAPI Auth: Reading SECRET_KEY length: {len(SECRET_KEY)}")

# Log that we are specifically using HS256
logger.info(f"--- FastAPI Auth: Hardcoded to use ALGORITHM: HS256")

# --- Pydantic Model ---
class TokenData(BaseModel):
    """Defines the expected structure of the decoded JWT payload."""
    sub: str | None = None
    authorities: list[str] | None = None

# --- Dependencies ---
async def get_token_from_cookie(
    access_token: Annotated[str | None, Cookie(alias=ACCESS_TOKEN_COOKIE_NAME)] = None
) -> str:
    """Dependency function to extract the JWT from the request's cookie."""
    if access_token is None:
        logger.warn("Request received without access token cookie.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: Access token cookie missing",
        )
    logger.debug("Access token cookie found.")
    return access_token

async def get_current_user(
    token: Annotated[str, Depends(get_token_from_cookie)]
) -> TokenData:
    """
    Core security dependency: Validates JWT (expecting HS256) from cookie.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials from cookie",
    )

    if not SECRET_KEY:
        logger.error("Missing SECRET_KEY configuration for JWT validation.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error: Authentication configuration missing."
        )

    try:
        try:
            unverified_header = jwt.get_unverified_header(token)
            logger.info(f"--- JWT Header Received: {unverified_header}")
            # Optional: Check if header alg matches HS256 before decoding fully
            if unverified_header.get("alg") != "HS256":
                 logger.error(f"Token algorithm mismatch. Expected HS256 but got {unverified_header.get('alg')}")
                 # Raise specific error for algorithm mismatch
                 raise HTTPException(
                     status_code=status.HTTP_401_UNAUTHORIZED,
                     detail=f"Invalid token algorithm. Expected HS256 but got {unverified_header.get('alg')}",
                 )
        except Exception as header_ex:
            logger.error(f"Could not parse JWT header: {header_ex}")
            raise credentials_exception

        # Decode and validate the JWT, explicitly allowing ONLY HS256
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"] # <-- HARDCODED ALGORITHM
        )

        username: str | None = payload.get("sub")
        if username is None:
             logger.warn("Token validation failed: Payload missing 'sub' claim.")
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: Subject missing",
            )

        authorities: list[str] | None = payload.get("authorities")
        token_data = TokenData(sub=username, authorities=authorities or [])

        logger.info(f"Token validated successfully for user: {username}")
        return token_data

    except JWTError as e:
        logger.error(f"JWTError decoding/validating cookie token (HS256): {e}")
        credentials_exception.detail = f"Token validation error: {e}"
        raise credentials_exception
    except ValidationError as e:
        logger.error(f"ValidationError parsing token payload: {e}")
        raise HTTPException(
             status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
             detail=f"Invalid token payload structure: {e}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during token validation: {e}", exc_info=True)
        raise credentials_exception