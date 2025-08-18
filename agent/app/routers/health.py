import logging
from fastapi import APIRouter, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str


@router.get(
    "/healthz",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    response_description="Simple health status of the service",
)
async def health_check() -> HealthResponse:
    """
    Basic liveness probe for Kubernetes or monitoring tools.

    Returns:
        JSON indicating service is alive.
    """
    logger.debug("Health check called")
    return HealthResponse(status="ok")


# Optional alias for humans (not just probes)
@router.get(
    "/health",
    include_in_schema=False  # keep Swagger UI clean
)
async def health_alias() -> dict:
    return {"status": "ok"}
