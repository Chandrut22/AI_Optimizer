from fastapi import FastAPI, Depends, HTTPException, status
from typing import Annotated

# Import from the auth module within the same 'app' package
from .auth import get_current_user, TokenData

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello World - Public Endpoint"}

@app.get("/api/secure")
async def read_secure_data(
    current_user: Annotated[TokenData, Depends(get_current_user)]
):
    """
    Requires a valid JWT in the access_token cookie.
    """
    return {
        "message": "Hello, this is secured data!",
        "user_email": current_user.sub,
        "user_roles": current_user.authorities
    }

@app.get("/api/admin")
async def read_admin_data(
    current_user: Annotated[TokenData, Depends(get_current_user)]
):
    """
    Requires a valid JWT in the access_token cookie AND the ADMIN role.
    """
    # Check if authorities list exists and contains "ADMIN"
    if not current_user.authorities or "ADMIN" not in current_user.authorities:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires ADMIN role"
        )
    return {
        "message": "Hello, Admin!",
        "user_email": current_user.sub
    }