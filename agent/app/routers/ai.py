# app/routers/ai.py
import httpx # Make sure this is imported
from fastapi import APIRouter, Depends, status, HTTPException
from pydantic import BaseModel, Field
from app.auth.dependencies import get_current_activation_user
from app.auth.models import UserClaims
from app.core.config import settings # <--- 1. IMPORT SETTINGS
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class QuestionRequest(BaseModel):
    question: str = Field(..., description="The question text to ask")


class AnswerResponse(BaseModel):
    message: str = Field(..., description="Response status message")
    user_id: str = Field(..., description="User id from token `sub`")
    answer: str = Field(..., description="Generated answer for the question")


# --- REMOVE THE OLD HARDCODED URL ---
# SPRING_BOOT_CHECK_URL = "http://localhost:8080/api/v1/internal/users/{user_id}/check-limit"


@router.post(
    "/ai/ask",
    response_model=AnswerResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a question with access token validation",
)
def ask_question(
    request: QuestionRequest,
    user: UserClaims = Depends(get_current_activation_user),
) -> AnswerResponse:
    """
    Validates access token, then checks usage limit with the backend,
    then processes the question and returns an answer.
    """

    logger.info("User %s asking: %s. Checking limits...", user.sub, request.question)

    # --- 2. BUILD THE URL FROM SETTINGS ---
    check_url = f"{settings.SPRING_BOOT_INTERNAL_URL}/api/v1/internal/users/{user.sub}/check-limit"
    
    try:
        with httpx.Client() as client:
            response = client.post(check_url)

        # Check if the backend denied the request
        if response.status_code != 200:
            if response.status_code == 402: # Trial Expired
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail="Your 14-day free trial has expired."
                )
            elif response.status_code == 429: # Daily Limit
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="You have exceeded your daily limit of 10 AI requests."
                )
            else: # Other error
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("reason", "An error occurred with your account.")
                )

    except httpx.RequestError as e:
        logger.error("Failed to connect to Spring Boot limit service: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service is temporarily unavailable. Please try again later."
        )

    # --- If check passes, run the AI logic ---
    logger.info("User %s allowed. Processing question...", user.sub)

    answer_text = f"Echo: {request.question}"

    return AnswerResponse(
        message="Question answered successfully",
        user_id=user.sub,
        answer=answer_text,
    )