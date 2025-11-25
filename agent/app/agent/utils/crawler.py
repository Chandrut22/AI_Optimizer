import os
from firecrawl import Firecrawl
from firecrawl.v2.types import Document
from typing import Optional, TypedDict
from dotenv import load_dotenv

load_dotenv()


class CrawlState(TypedDict):  
    url: str
    status_code: int
    html_content: Optional[str]
    extracted_text: Optional[str]
    error_message: Optional[str]


class WebCrawler:
    """    
    This class is responsible for fetching and scraping web page content.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initializes the asynchronous Firecrawl client.
        """
        if api_key is None:
            api_key = os.getenv("FIRECRAWL_API_KEY")
        
        if not api_key:
            raise ValueError("FIRECRAWL_API_KEY not found in environment variables or parameters")
        
        self.client = Firecrawl(api_key=api_key)

    def fetch_page(self, url: str) -> CrawlState:
        """
        Asynchronously fetches and scrapes a single URL.

        Args:
            url: The URL to scrape.

        Returns:
            A CrawlResult object containing the scrape data or an error.
        """
        try:
            response = self.client.scrape(
                url,
                formats=["html", "markdown"]
            )
            
            if isinstance(response, Document):
                return CrawlState(
                    url=url,
                    status_code=200,
                    html_content=response.html,        
                    extracted_text=response.markdown, 
                    error_message=None
                )
            else:
                return CrawlState(
                    url=url,
                    status_code=500,
                    html_content=None,
                    extracted_text=None,
                    error_message="Unexpected response format from scraping service."
                )

        except Exception as e:
            return CrawlState(
                url=url,
                status_code=500,
                html_content=None,
                extracted_text=None,
                error_message=str(e)
            )