from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from app.auth.dependencies import get_current_activation_user
from app.auth.models import UserClaims
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
    user: UserClaims = Depends(get_current_activation_user),
) -> AnswerResponse:
    """
    Validates access token from Authorization header.
    If valid, processes the question and returns an answer.
    """

    logger.info("User %s asked: %s", user.sub, request.question)

    # For now: mock answer (you can integrate LLM or custom logic later)
    answer_text = f"Echo: {request.question}"

    return AnswerResponse(
        message="Question answered successfully",
        user_id=user.sub,
        answer=answer_text,
    )
