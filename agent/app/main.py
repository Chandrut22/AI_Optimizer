# In app/main.py
from fastapi import FastAPI, Depends
from typing import Annotated
from .auth import get_current_user, TokenData
# --- Add CORS imports ---
from fastapi.middleware.cors import CORSMiddleware
import os # To read allowed origins from environment
# ------------------------

app = FastAPI()

# --- Configure CORS ---
# Read allowed origins from environment variable, split by comma
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "") # Default to empty string
origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

# Fallback for local development if variable not set
if not origins:
    origins = [
        "http://localhost:5173", # Default Vite port
        "http://localhost:3000", # Common React dev port
    ]
    print(f"Warning: ALLOWED_ORIGINS not set, falling back to defaults: {origins}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # List of allowed origins
    allow_credentials=True, # <<< IMPORTANT for cookies
    allow_methods=["*"],    # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],    # Allow all headers
)
# ------------------------


# --- Your Endpoints ---
@app.get("/")
async def read_root():
    return {"message": "Hello World - Public Endpoint"}

@app.get("/api/secure")
async def read_secure_data(
    current_user: Annotated[TokenData, Depends(get_current_user)]
):
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