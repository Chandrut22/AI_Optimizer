import os
from firecrawl import Firecrawl
from firecrawl.v2.types import Document
from typing import Optional, TypedDict, Dict
from dotenv import load_dotenv

load_dotenv()


class CrawlState(TypedDict):
    url: str
    html_content: Optional[str]
    markdown : Optional[str]
    metadata : Dict
    error_message: Optional[str]

class WebCrawler:
    def __init__(self, api_key: Optional[str] = None):

        if api_key is None:
            api_key = os.getenv("FIRECRAWL_API_KEY")

        if not api_key:
            raise ValueError("FIRECRAWL_API_KEY not found in environment variables or parameters")

        self.client = Firecrawl(api_key=api_key)

    def fetch_page(self, url: str) -> CrawlState:
        print("  >> WebCrawler is running")
        try:
            response = self.client.scrape(
                url,
                formats=["html", "markdown"]
            )

            response = response.model_dump()
            print("  >> WebCrawler is running successfully")

            return CrawlState(
                url=url,
                html_content=response['html'],
                markdown=response['markdown'],
                metadata=response['metadata'],
                error_message=None
            )

        except Exception as e:
            # Log the full exception for debugging
            print("  >> WebCrawler is caused error")
            return CrawlState(
                url=url,
                html_content=None,
                extracted_text=None,
                metadata=None,
                error_message=str(e)
            )