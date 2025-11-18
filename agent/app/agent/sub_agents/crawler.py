import asyncio
import os
import logging
from firecrawl import AsyncFirecrawl  # <-- 1. Changed from AsyncFirecrawlApp
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file (optional, good for local dev)
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)


class CrawlResult(BaseModel):
    """
    Data model for storing the result of a crawl operation.
    """
    url: str
    status_code: int
    html_content: Optional[str] = Field(None)
    extracted_text: Optional[str] = None
    error_message: Optional[str] = None


class WebCrawler:
    """
    Asynchronous web crawler using Firecrawl's AsyncFirecrawl client.
    
    This class is responsible for fetching and scraping web page content.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initializes the asynchronous Firecrawl client.

        Args:
            api_key: The Firecrawl API key. If None, it will be
                     fetched from the "FIRECRAWL_API_KEY" environment variable.
        
        Raises:
            ValueError: If the API key is not provided and not found
                        in the environment variables.
        """
        if api_key is None:
            api_key = os.getenv("FIRECRAWL_API_KEY")
        
        if not api_key:
            logger.error("FIRECRAWL_API_KEY not found in environment variables or parameters")
            raise ValueError("FIRECRAWL_API_KEY not found in environment variables or parameters")
        
        # 2. Use the AsyncFirecrawl class from the new docs
        self.client = AsyncFirecrawl(api_key=api_key)
        logger.info("WebCrawler (AsyncFirecrawl) initialized successfully.")

    async def fetch_page(self, url: str) -> CrawlResult:
        """
        Asynchronously fetches and scrapes a single URL.

        Args:
            url: The URL to scrape.

        Returns:
            A CrawlResult object containing the scrape data or an error.
        """
        logger.debug(f"Attempting to fetch page: {url}")
        try:
            # 3. Use the .scrape() method
            # 4. Pass 'formats' as a direct keyword argument
            response = await self.client.scrape(
                url,
                formats=["html", "markdown"]
            )
            
            logger.info(f"Successfully scraped URL: {url}")
            
            if isinstance(response, dict):
                return CrawlResult(
                    url=url,
                    status_code=200,
                    # The response keys are 'html' and 'markdown'
                    html_content=response.get("html"),
                    extracted_text=response.get("markdown"),
                    error_message=None
                )
            else:
                logger.warning(f"Unexpected response format from Firecrawl for {url}: {type(response)}")
                return CrawlResult(
                    url=url,
                    status_code=500,
                    error_message="Unexpected response format from scraping service."
                )

        except Exception as e:
            logger.error(f"Failed to fetch or scrape {url}: {e}", exc_info=True)
            return CrawlResult(
                url=url,
                status_code=500,
                error_message=str(e)
            )

# This file is a module, so the if __name__ == "__main__": block
# is correctly removed for production code.