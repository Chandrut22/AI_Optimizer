import logging
import aiohttp
from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.auth.dependencies import (
    get_current_activation_user, 
    check_spring_boot_limit, 
    save_scan_history_async
)
from app.auth.models import UserClaims
from app.agent.main import MainAgent 
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter()


class SeoAnalysisRequest(BaseModel):
    url: str = Field(..., description="The website URL to analyze")


async def verify_url_accessible(url: str) -> bool:
    """
    Checks if a URL is reachable (returns 200 OK) without downloading the full body.
    """
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; SEO-Agent/1.0)'}
        timeout = aiohttp.ClientTimeout(total=10) # 10s timeout
        
        async with aiohttp.ClientSession(timeout=timeout) as session:
            try:
                async with session.head(url, headers=headers, allow_redirects=True) as resp:
                    if resp.status < 400:
                        return True
                    if resp.status != 405:
                        logger.warning(f"URL check failed {url}: Status {resp.status}")
                        return False
            except (aiohttp.ClientError, Exception):
                pass

            async with session.get(url, headers=headers, allow_redirects=True) as resp:
                if resp.status < 400:
                    return True
                logger.warning(f"URL check failed {url}: Status {resp.status}")
                return False

    except Exception as e:
        logger.warning(f"URL validation exception for {url}: {str(e)}")
        return False

@router.post(
    "/agent/run-seo-analysis",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Runs the full multi-agent SEO analysis",
)
async def run_seo_analysis(
    req: SeoAnalysisRequest,
    fastapi_request: Request,
    
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

    # is_valid = await verify_url_accessible(req.url)
    # if not is_valid:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail=f"The URL '{req.url}' is unreachable or does not exist. Please check the address and try again."
    #     )

    await save_scan_history_async(fastapi_request, req.url)

    try:
        logger.info(f"Starting main agent for {req.url}...")
        
        main_agent = MainAgent(req.url)
        
        result_report = await main_agent.run() 
        
        logger.info(f"Main agent finished for {req.url}.")
        
        result_report["usage_details"] = usage_data.get("usage")
        return result_report
        
    except Exception as e:
        logger.error(f"Main agent failed for {req.url}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during the AI analysis: {str(e)}"
        )