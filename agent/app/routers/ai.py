import httpx 
from fastapi import APIRouter, Depends, status, HTTPException, Request # <-- Make sure Request is imported
from pydantic import BaseModel, Field
from app.auth.dependencies import get_current_activation_user
from app.auth.models import UserClaims
from app.core.config import settings # <-- Make sure settings are imported
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class QuestionRequest(BaseModel):
    question: str = Field(..., description="The question text to ask")


class AnswerResponse(BaseModel):
    message: str = Field(..., description="Response status message")
    user_id: str = Field(..., description="User id from token `sub`")
    answer: str = Field(..., description="Generated answer for the question")


@router.post(
    "/ai/ask",
    response_model=AnswerResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a question with access token validation",
)
def ask_question(
    request: QuestionRequest,
    fastapi_request: Request, # <-- Inject the Request object
    user: UserClaims = Depends(get_current_activation_user),
) -> AnswerResponse:
    """
    Validates access token, then checks usage limit with the backend,
    then processes the question and returns an answer.
    """

    logger.info("User %s asking: %s. Checking limits...", user.sub, request.question)

    # --- 1. THIS IS THE NEW, CORRECT URL ---
    # It points to /api/v1/usage/check-limit
    check_url = f"{settings.SPRING_BOOT_INTERNAL_URL}/api/v1/usage/check-limit"
    
    # --- 2. Get the user's token from the incoming request ---
    auth_header = fastapi_request.headers.get("Authorization")
    
    if not auth_header:
        # This is a fallback; get_current_activation_user should catch it first.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Missing Authorization header"
        )

    # --- 3. Prepare the header to forward to Spring Boot ---
    headers = {"Authorization": auth_header}

    try:
        with httpx.Client() as client:
            # --- 4. Send the request with the user's forwarded token ---
            response = client.post(check_url, headers=headers)

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
            # 401 (token invalid) or 403 (token valid, but forbidden)
            elif response.status_code == 401 or response.status_code == 403:
                logger.warning("Token forwarding failed. Spring Boot rejected the token.")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials."
                )
            else: # Other error
                logger.error("Spring Boot returned an unexpected status: %s", response.status_code)
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