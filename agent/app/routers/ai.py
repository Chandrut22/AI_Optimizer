import logging
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from app.auth.dependencies import get_current_user
from app.auth.models import UserClaims

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ai",
    tags=["AI"],
    responses={404: {"description": "Not found"}},
)


# --- Request & Response Models --- #

class AskRequest(BaseModel):
    """Request payload for asking the AI a question."""

    question: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="The question to ask the AI",
    )


class AskResponse(BaseModel):
    """Response containing the AI answer and user context."""

    user: UserClaims
    answer: str = Field(..., description="AI-generated answer")


# --- Routes --- #

@router.post(
    "/ask",
    response_model=AskResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask the AI a question",
    response_description="AI-generated answer along with user context",
)
async def ai_ask(
    body: AskRequest,
    user: UserClaims = Depends(get_current_user),
) -> AskResponse:
    """
    Secure AI question-answering endpoint.

    Steps:
    1. Authenticated user is resolved from JWT (via Spring Boot).
    2. Accepts a natural language question.
    3. Returns a placeholder AI-generated answer (replace with real AI service).
    """

    logger.info(
        "User '%s' (roles=%s) asked AI: %s",
        user.sub,
        user.roles,
        body.question,
    )

    # TODO: Replace with actual AI service integration
    ai_answer = (
        f"🤖 You asked: '{body.question}'. "
        f"Here's an AI-generated response placeholder."
    )

    return AskResponse(user=user, answer=ai_answer)
