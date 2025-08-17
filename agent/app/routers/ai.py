from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth.dependencies import get_current_user
from app.auth.models import UserClaims

router = APIRouter(prefix="/ai", tags=["AI"])


class AskBody(BaseModel):
    question: str


@router.post("/ask")
async def ai_ask(body: AskBody, user: UserClaims = Depends(get_current_user)):
    # Replace with your AI logic — user is authenticated here
    return {
        "user": {"id": user.sub, "email": user.email, "roles": user.roles},
        "answer": f"🤖 You asked: '{body.question}'. Here's an AI-generated response placeholder.",
    }
