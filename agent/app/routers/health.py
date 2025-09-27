# app/routers/health.py
from fastapi import APIRouter

router = APIRouter()


@router.get("/check", summary="Health check")
def health_check():
    return {"status": "ok"}
