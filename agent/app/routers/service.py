# app/routers/service.py
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from app.auth.dependencies import get_current_activation_user
from app.auth.models import UserClaims
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ServiceResponse(BaseModel):
    message: str = Field(..., description="Result message")
    user_id: str = Field(..., description="User id from token `sub`")
    scopes: list[str] = Field(..., description="Scopes extracted from activation token")


@router.get(
    "/service",
    response_model=ServiceResponse,
    status_code=status.HTTP_200_OK,
    summary="Access protected service using activation_token",
)
def protected_service(user: UserClaims = Depends(get_current_activation_user)) -> ServiceResponse:
    """
    Validates activation_token provided in Authorization header.
    Returns message, user_id and scopes on success.
    """
    logger.info("Service accessed by user=%s scopes=%s", user.sub, user.scopes)
    return ServiceResponse(
        message="Service granted",
        user_id=user.sub,
        scopes=user.scopes,
    )
