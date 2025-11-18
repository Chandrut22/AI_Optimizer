import asyncio
import logging
from pydantic import BaseModel, Field
from typing import Optional
from playwright.async_api import async_playwright
# Import Playwright's specific error types
from playwright._impl._api_types import TimeoutError as PlaywrightTimeoutError
from playwright._impl._api_types import Error as PlaywrightError

logger = logging.getLogger(__name__)

class CrawlResult(BaseModel):
    """A data model for storing the result of a crawl."""
    url: str
    status_code: int
    html_content: Optional[str] = Field(None, description="The full HTML content of the page.")
    error_message: Optional[str] = Field(None, description="Any error encountered during crawling.")

class WebCrawler:
    """
    A robust asynchronous web crawler using a headless browser (Playwright)
    to render JavaScript and bypass simple bot detection.
    """
    def __init__(self, timeout: int = 20): # Increased default timeout to 20s
        self.timeout_ms = timeout * 1000
        # Use a real browser user-agent
        self._user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

    async def fetch_page(self, url: str) -> CrawlResult:
        """
        Asynchronously fetches a single webpage using a real browser.
        """
        
        browser = None
        context = None
        page = None
        
        try:
            async with async_playwright() as p:
                # Launch a new headless browser instance
                # Note: --no-sandbox is often required in Docker containers
                browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
                
                # Create a new browser context
                context = await browser.new_context(
                    user_agent=self._user_agent,
                    ignore_https_errors=True # Ignores SSL certificate errors
                )
                
                page = await context.new_page()
                
                # Try to load the page
                response = await page.goto(
                    url, 
                    timeout=self.timeout_ms, 
                    wait_until="domcontentloaded" # Wait for DOM, not all network requests
                )
                
                status_code = response.status
                
                if status_code >= 400:
                    error_msg = f"HTTP Error: {status_code} {response.status_text}"
                    if status_code == 429:
                        error_msg = "HTTP Error: 429 Too Many Requests"
                    
                    return CrawlResult(
                        url=url, 
                        status_code=status_code, 
                        error_message=error_msg
                    )

                # Get the *rendered* HTML content
                html = await page.content()
                
                return CrawlResult(
                    url=url,
                    status_code=status_code,
                    html_content=html
                )

        except PlaywrightTimeoutError:
            logger.warning(f"Playwright timed out crawling {url}")
            return CrawlResult(url=url, status_code=408, error_message=f"Request timed out after {self.timeout_ms / 1000}s.")
        
        except PlaywrightError as e:
            # Catches other browser-level errors
            logger.error(f"Playwright browser error for {url}: {e}")
            return CrawlResult(url=url, status_code=500, error_message=f"Browser navigation error: {str(e)}")
        
        except Exception as e:
            # Catch-all for any other unexpected errors
            logger.error(f"An unexpected error occurred crawling {url}: {e}", exc_info=True)
            return CrawlResult(url=url, status_code=500, error_message=f"An unexpected error occurred: {str(e)}")
        
        finally:
            # Ensure all browser resources are always closed
            if page:
                await page.close()
            if context:
                await context.close()
            if browser:
                await browser.close()