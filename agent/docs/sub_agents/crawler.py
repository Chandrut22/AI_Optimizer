import asyncio
import aiohttp
from pydantic import BaseModel, Field
from typing import Optional

class CrawlResult(BaseModel):
    """A data model for storing the result of a crawl."""
    url: str
    status_code: int
    html_content: Optional[str] = Field(None, description="The full HTML content of the page.")
    error_message: Optional[str] = Field(None, description="Any error encountered during crawling.")

class WebCrawler:
    """
    A scalable and robust asynchronous web crawler.
    """
    def __init__(self, timeout: int = 10):
        self._headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        self._timeout = aiohttp.ClientTimeout(total=timeout)

    async def fetch_page(self, url: str) -> CrawlResult:
        """
        Asynchronously fetches a single webpage.

        Args:
            url: The URL of the page to fetch.

        Returns:
            A CrawlResult object with the page's data or an error message.
        """
        try:
            async with aiohttp.ClientSession(headers=self._headers, timeout=self._timeout) as session:
                async with session.get(url, ssl=False) as response:
                    # Raises an HTTPError for bad responses (4xx or 5xx)
                    response.raise_for_status()
                    
                    status_code = response.status
                    html = await response.text()
                    
                    return CrawlResult(
                        url=url,
                        status_code=status_code,
                        html_content=html
                    )
        except aiohttp.ClientResponseError as e:
            return CrawlResult(url=url, status_code=e.status, error_message=f"HTTP Error: {e.message}")
        except asyncio.TimeoutError:
            return CrawlResult(url=url, status_code=408, error_message="Request timed out.")
        except Exception as e:
            return CrawlResult(url=url, status_code=500, error_message=f"An unexpected error occurred: {str(e)}")

# Example of how to run it (for testing purposes)
async def main():
    crawler = WebCrawler()
    result = await crawler.fetch_page("https://langchain.com/")
    if result.html_content:
        print(f"Successfully fetched {result.url} (Status: {result.status_code})")
        print(f"HTML starts with: {result.html_content[:200]}")
    else:
        print(f"Failed to fetch {result.url}: {result.error_message}")

if __name__ == '__main__':
    asyncio.run(main())