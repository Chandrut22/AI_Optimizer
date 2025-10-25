import os
import logging # Import standard logging
from fastapi import Depends, HTTPException, status, Cookie
from jose import JWTError, jwt
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
from typing import Annotated

# Configure basic logging
logging.basicConfig(level=logging.INFO) # Set to INFO or DEBUG as needed
logger = logging.getLogger(__name__)

# Load variables from .env file (if present, Render vars override)
load_dotenv()

# --- Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_COOKIE_NAME = "access_token" # Name of the cookie to check

# --- Startup Logging ---
# Log the configuration being used to help debug environment variable issues
if not SECRET_KEY:
    logger.error("!!! SECRET_KEY environment variable not found or empty!")
else:
    logger.info(f"--- FastAPI Auth: Reading SECRET_KEY length: {len(SECRET_KEY)}")

if not ALGORITHM:
    logger.error("!!! ALGORITHM environment variable not found or empty!")
else:
    logger.info(f"--- FastAPI Auth: Reading ALGORITHM: {ALGORITHM}")

# --- Pydantic Model ---
class TokenData(BaseModel):
    """Defines the expected structure of the decoded JWT payload."""
    sub: str | None = None # Subject (usually username/email)
    authorities: list[str] | None = None # Roles/Permissions

# --- Dependencies ---
async def get_token_from_cookie(
    # Extracts the value of the cookie named ACCESS_TOKEN_COOKIE_NAME.
    # Returns None if the cookie doesn't exist.
    access_token: Annotated[str | None, Cookie(alias=ACCESS_TOKEN_COOKIE_NAME)] = None
) -> str: # Specify return type hint
    """Dependency function to extract the JWT from the request's cookie."""
    if access_token is None:
        logger.warn("Request received without access token cookie.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: Access token cookie missing",
        )
    logger.debug("Access token cookie found.") # Debug log if needed
    return access_token

async def get_current_user(
    # Depends on get_token_from_cookie to get the raw token string
    token: Annotated[str, Depends(get_token_from_cookie)]
) -> TokenData: # Specify return type hint
    """
    Core security dependency:
    1. Receives token extracted from cookie.
    2. Decodes and validates the JWT signature and claims.
    3. Extracts user information (subject and authorities).
    Inject this into endpoints that require authentication.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials from cookie",
        # headers={"WWW-Authenticate": "Bearer"}, # Not needed for cookie auth failure
    )

    # Pre-validation checks for configuration
    if not SECRET_KEY or not ALGORITHM:
        logger.error("Missing SECRET_KEY or ALGORITHM configuration for JWT validation.")
        # Raise 500 for server misconfiguration rather than 401
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error: Authentication configuration missing."
        )

    try:
        # --- Debugging: Log the received JWT header ---
        try:
            unverified_header = jwt.get_unverified_header(token)
            logger.info(f"--- JWT Header Received: {unverified_header}")
        except Exception as header_ex:
            logger.error(f"Could not parse JWT header: {header_ex}")
            raise credentials_exception # Fail if header can't even be read
        # --------------------------------------------

        # Decode and validate the JWT
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM] # Use the algorithm from environment variable
            # You could add audience/issuer validation here if needed:
            # options={"verify_aud": False, "verify_iss": False}
            )

        # Extract subject (email)
        username: str | None = payload.get("sub")
        if username is None:
             logger.warn("Token validation failed: Payload missing 'sub' (subject) claim.")
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, # Or 422 if payload structure error
                detail="Invalid token payload: Subject missing",
            )

        # Extract authorities
        authorities: list[str] | None = payload.get("authorities")

        # Use Pydantic to validate structure and create a data object
        # Default authorities to empty list if claim is missing
        token_data = TokenData(sub=username, authorities=authorities or [])

        logger.info(f"Token validated successfully for user: {username}")
        return token_data

    except JWTError as e:
        # Catches signature errors, expiration, algorithm mismatch, etc.
        logger.error(f"JWTError decoding/validating cookie token: {e}")
        # Attach specific error detail if helpful for client debugging (optional)
        credentials_exception.detail = f"Token validation error: {e}"
        raise credentials_exception
    except ValidationError as e:
        # Catches Pydantic model validation errors (if payload structure is wrong)
        logger.error(f"ValidationError parsing token payload: {e}")
        # Return 422 Unprocessable Entity for bad payload structure
        raise HTTPException(
             status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
             detail=f"Invalid token payload structure: {e}"
        )
    except Exception as e:
        # Catch any other unexpected errors during the process
        logger.error(f"Unexpected error during token validation: {e}", exc_info=True)
        raise credentials_exception