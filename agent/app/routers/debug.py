# app/routers/debug.py
from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/debug/cookies")
async def debug_cookies(request: Request):
    """
    Debug endpoint to inspect cookies received by FastAPI.
    Returns cookie names and values.
    """
    cookies = request.cookies

    return {
        "cookies_count": len(cookies),
        "cookies": {k: v for k, v in cookies.items()}  # shows name and value
    }
