import asyncio
import os
import logging
from firecrawl import AsyncFirecrawl
from firecrawl.v2.types import Document  # <-- Import the 'Document' type
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
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
        """
        if api_key is None:
            api_key = os.getenv("FIRECRAWL_API_KEY")
        
        if not api_key:
            logger.error("FIRECRAWL_API_KEY not found in environment variables or parameters")
            raise ValueError("FIRECRAWL_API_KEY not found in environment variables or parameters")
        
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
            response = await self.client.scrape(
                url,
                formats=["html", "markdown"]
            )
            
            logger.info(f"Successfully scraped URL: {url}")
            
            # --- FIX ---
            # The response is a 'Document' object, not a 'dict'.
            # We check its type and then access its attributes.
            if isinstance(response, Document):
                return CrawlResult(
                    url=url,
                    status_code=200,
                    html_content=response.html,        # Access .html attribute
                    extracted_text=response.markdown, # Access .markdown attribute
                    error_message=None
                )
            # --- END FIX ---
            else:
                # Fallback in case the response is something else unexpected
                logger.warning(f"Unexpected response format from Firecrawl for {url}: {type(response)}")
                return CrawlResult(
                    url=url,
                    status_code=500,
                    error_message="Unexpected response format from scraping service."
                )

        except Exception as e:
            # Log the full exception for debugging
            logger.error(f"Failed to fetch or scrape {url}: {e}", exc_info=True)
            return CrawlResult(
                url=url,
                status_code=500,
                error_message=str(e)
            )