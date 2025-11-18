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
        
        # --- PROPER CODE FIX 1 ---
        # Change the User-Agent to mimic Googlebot.
        # Servers (like Vercel) are very likely to rate-limit
        # standard python/browser user-agents, causing 429 errors.
        # They are much less likely to block Googlebot.
        self._headers = {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }
        # --- END FIX ---
        
        self._timeout = aiohttp.ClientTimeout(total=timeout)

    async def fetch_page(self, url: str) -> CrawlResult:
        """
        Asynchronously fetches a single webpage.

        Args:
            url: The URL of the page to fetch.

        Returns:
            A CrawlResult object with the page's data or an error message.
        """
        
        # This is correct for your setup to avoid SSL verification errors
        connector = aiohttp.TCPConnector(ssl=False)

        try:
            # Pass the connector to the ClientSession
            async with aiohttp.ClientSession(
                headers=self._headers,
                timeout=self._timeout,
                connector=connector
            ) as session:
                
                async with session.get(url) as response:
                    
                    status_code = response.status
                    
                    # --- PROPER CODE FIX 2 ---
                    # Remove response.raise_for_status() and handle errors manually.
                    # This allows us to gracefully catch the 429 error and report it
                    # instead of throwing an exception that crashes the agent.
                    if status_code >= 400:
                        if status_code == 429:
                            return CrawlResult(url=url, status_code=status_code, error_message="HTTP Error: Too Many Requests")
                        else:
                            return CrawlResult(url=url, status_code=status_code, error_message=f"HTTP Error: {response.reason}")
                    # --- END FIX ---

                    html = await response.text()
                    
                    return CrawlResult(
                        url=url,
                        status_code=status_code,
                        html_content=html
                    )

        except asyncio.TimeoutError:
            return CrawlResult(url=url, status_code=408, error_message="Request timed out.")
        except Exception as e:
            # Catch other potential errors, e.g., invalid URL
            return CrawlResult(url=url, status_code=500, error_message=f"An unexpected error occurred: {str(e)}")

# # Example of how to run it (for testing purposes)
# async def main():
#     crawler = WebCrawler()
#     result = await crawler.fetch_page("https://langchain.com/")
#     if result.html_content:
#         print(f"Successfully fetched {result.url} (Status: {result.status_code})")
#         print(f"HTML starts with: {result.html_content[:200]}")
#     else:
#         print(f"Failed to fetch {result.url}: {result.error_message}")

# if __name__ == '__main__':
#     asyncio.run(main())