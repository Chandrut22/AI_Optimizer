from fastapi import APIRouter, Depends, status, Request
from pydantic import BaseModel, Field
from app.auth.dependencies import get_current_user
from app.auth.models import UserClaims
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI"])


# --- Models --- #
class AskRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)


class AskResponse(BaseModel):
    user: UserClaims
    answer: str


# --- Routes --- #
@router.post(
    "/ask",
    response_model=AskResponse,
    status_code=status.HTTP_200_OK,
)
async def ai_ask(
    body: AskRequest,
    request: Request,  # ✅ no Depends()
    user: UserClaims = Depends(get_current_user),  # ✅ still valid
) -> AskResponse:
    """
    Secure AI question-answering endpoint.
    """
    logger.info("User '%s' asked: %s", user.sub, body.question)

    ai_answer = f"🤖 You asked: '{body.question}'. Placeholder AI response."

    return AskResponse(user=user, answer=ai_answer)
