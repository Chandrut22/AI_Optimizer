import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.auth.dependencies import (
    get_current_activation_user, 
    check_spring_boot_limit, 
    save_scan_history_async
)
from app.auth.models import UserClaims
from agent.main import MainAgent  # <-- Import the MainAgent class
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter()

# --- Pydantic Models for this endpoint ---

class SeoAnalysisRequest(BaseModel):
    url: str = Field(..., description="The website URL to analyze")

# The response will be a complex JSON report from the agent,
# so we use a generic 'dict' as the response model.
# We will also add our 'usage_details' to it.

@router.post(
    "/agent/run-seo-analysis",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Runs the full multi-agent SEO analysis",
)
async def run_seo_analysis(
    req: SeoAnalysisRequest,
    fastapi_request: Request,
    
    # --- Dependencies handle all auth and limit checking ---
    user: UserClaims = Depends(get_current_activation_user),
    usage_data: dict = Depends(check_spring_boot_limit),
):
    """
    This is the main endpoint to run a full SEO scan.
    
    1. Validates the user's token.
    2. Checks and increments the user's usage limit on the Spring Boot backend.
    3. Saves the scan URL to the user's history.
    4. Runs the full asynchronous multi-agent AI analysis.
    5. Returns the complete SEO report.
    """
    
    logger.info(f"User {user.sub} passed limit check. Reason: {usage_data.get('reason')}")

    # --- 1. Save to History (Fire and Forget) ---
    # We run this in the background (no 'await') so it doesn't block the AI
    await save_scan_history_async(fastapi_request, req.url)

    # --- 2. Run the Main AI Agent ---
    try:
        logger.info(f"Starting main agent for {req.url}...")
        
        # Initialize MainAgent with the URL from the request
        main_agent = MainAgent(req.url)
        
        # Run the full async pipeline
        result_report = await main_agent.run() 
        
        logger.info(f"Main agent finished for {req.url}.")
        
        # --- 3. Return the full report ---
        # Add the usage data to the final report for the frontend
        result_report["usage_details"] = usage_data.get("usage")
        return result_report
        
    except Exception as e:
        # Log the error and return a 500
        logger.error(f"Main agent failed for {req.url}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during the AI analysis: {str(e)}"
        )