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
    question: str = Field(..., min_length=3, description="The question to ask the AI")


class AskResponse(BaseModel):
    user: dict
    answer: str


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
):
    """
    Secure AI question-answering endpoint.

    Steps:
    1. Authenticated user is resolved from cookies/JWT via Spring Boot.
    2. Accepts a natural language question.
    3. Returns AI-generated answer placeholder (replace with real model call).
    """

    logger.info("User '%s' asked AI: %s", user.sub, body.question)

    # TODO: Replace with real AI service integration
    ai_answer = f"🤖 You asked: '{body.question}'. Here's an AI-generated response placeholder."

    return AskResponse(
        user={"id": user.sub, "email": user.email, "roles": user.roles},
        answer=ai_answer,
    )
