import os
import logging
import base64 # Import base64 module
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
# Get the Base64 encoded key from environment
_encoded_secret_key = os.getenv("SECRET_KEY")
SECRET_KEY = None # Initialize as None
ALGORITHM = "HS256" # Hardcoded as per your requirement
ACCESS_TOKEN_COOKIE_NAME = "access_token"

# --- Startup Logging & Key Decoding ---
if not _encoded_secret_key:
    logger.error("!!! SECRET_KEY environment variable not found or empty!")
else:
    logger.info(f"--- FastAPI Auth: Reading Base64 SECRET_KEY length: {len(_encoded_secret_key)}")
    try:
        # *** FIX: Decode the Base64 key to get the raw bytes ***
        SECRET_KEY = base64.b64decode(_encoded_secret_key)
        logger.info(f"--- FastAPI Auth: Successfully decoded SECRET_KEY (byte length: {len(SECRET_KEY)})")
    except Exception as decode_ex:
        logger.error(f"!!! Failed to decode Base64 SECRET_KEY: {decode_ex}")
        # SECRET_KEY will remain None, causing validation to fail later

logger.info(f"--- FastAPI Auth: Using ALGORITHM: {ALGORITHM}")

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
    Core security dependency: Validates JWT (HS256) from cookie using the decoded secret key.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials from cookie",
    )

    # Check if the key was successfully decoded during startup
    if not SECRET_KEY:
        logger.error("JWT validation cannot proceed: SECRET_KEY was not properly decoded or is missing.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error: Authentication configuration invalid."
        )

    try:
        try:
            unverified_header = jwt.get_unverified_header(token)
            logger.info(f"--- JWT Header Received: {unverified_header}")
            # Optional: Check alg header
            if unverified_header.get("alg") != ALGORITHM:
                 logger.error(f"Token algorithm mismatch. Expected {ALGORITHM} but got {unverified_header.get('alg')}")
                 raise HTTPException(
                     status_code=status.HTTP_401_UNAUTHORIZED,
                     detail=f"Invalid token algorithm. Expected {ALGORITHM} but got {unverified_header.get('alg')}",
                 )
        except Exception as header_ex:
            logger.error(f"Could not parse JWT header: {header_ex}")
            raise credentials_exception

        # Decode and validate the JWT using the DECODED (byte) secret key
        payload = jwt.decode(
            token,
            SECRET_KEY, # Use the decoded byte key
            algorithms=[ALGORITHM]
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
        # Catches signature errors, expiration, etc.
        logger.error(f"JWTError decoding/validating cookie token ({ALGORITHM}): {e}")
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