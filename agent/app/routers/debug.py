# app/routers/debug.py
import logging
from typing import Dict
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()


class CookiesResponse(BaseModel):
    cookies_count: int
    cookies: Dict[str, str]


@router.get("/cookies", response_model=CookiesResponse, summary="Inspect cookies (debug only)")
async def debug_cookies(request: Request) -> CookiesResponse:
    logger.debug("Debug cookies: %s", request.cookies)
    return CookiesResponse(cookies_count=len(request.cookies), cookies=dict(request.cookies))
