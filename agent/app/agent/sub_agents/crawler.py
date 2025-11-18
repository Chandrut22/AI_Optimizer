import asyncio
import aiohttp
import async_timeout
from pydantic import BaseModel, Field
from typing import Optional
import random
import time


class CrawlResult(BaseModel):
    """A data model for storing the result of a crawl."""
    url: str
    status_code: int
    html_content: Optional[str] = Field(None)
    error_message: Optional[str] = Field(None)


class WebCrawler:
    """
    A production-ready scalable and robust asynchronous web crawler.
    Includes:
    - Retry logic
    - Rate limiting
    - Connection pooling
    - Exponential backoff
    """
    
    def __init__(
        self,
        timeout: int = 10,
        max_retries: int = 3,
        concurrency_limit: int = 5   # max parallel requests
    ):
        self.timeout = aiohttp.ClientTimeout(total=timeout)
        self.max_retries = max_retries
        self.semaphore = asyncio.Semaphore(concurrency_limit)

        # Connection pooling + disable SSL verify (optional)
        self.connector = aiohttp.TCPConnector(ssl=False, limit=50)

        self.headers = {
            "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        self.session: aiohttp.ClientSession = None

    async def __aenter__(self):
        """Create a global session for reuse."""
        self.session = aiohttp.ClientSession(
            headers=self.headers,
            timeout=self.timeout,
            connector=self.connector
        )
        return self

    async def __aexit__(self, exc_type, exc, tb):
        """Close session."""
        if self.session:
            await self.session.close()

    async def _fetch_once(self, url: str) -> CrawlResult:
        """
        Fetch a page once (no retries).
        """
        try:
            async with async_timeout.timeout(self.timeout.total):
                async with self.session.get(url) as response:

                    # Handle 429 Too Many Requests
                    if response.status == 429:
                        retry_after = response.headers.get("Retry-After", 1)
                        return CrawlResult(
                            url=url,
                            status_code=429,
                            error_message=f"Too Many Requests (Retry-After: {retry_after}s)"
                        )

                    response.raise_for_status()
                    text = await response.text()

                    return CrawlResult(
                        url=url,
                        status_code=response.status,
                        html_content=text
                    )

        except aiohttp.ClientResponseError as e:
            return CrawlResult(url=url, status_code=e.status, error_message=str(e))

        except asyncio.TimeoutError:
            return CrawlResult(url=url, status_code=408, error_message="Timeout")

        except Exception as e:
            return CrawlResult(url=url, status_code=500, error_message=str(e))

    async def fetch_page(self, url: str) -> CrawlResult:
        """
        Fetch a webpage with retries and exponential backoff.
        """
        async with self.semaphore:  # rate limit concurrency

            for attempt in range(self.max_retries):
                result = await self._fetch_once(url)

                if result.status_code != 429:  
                    return result

                # If 429 Too Many Requests → exponential backoff
                wait = 2 ** attempt + random.uniform(0, 1)
                await asyncio.sleep(wait)

            return CrawlResult(
                url=url,
                status_code=429,
                error_message="Failed after max retries"
            )


# Example usage
async def main():
    urls = [
        "https://chandru22.vercel.app/"
    ]

    async with WebCrawler(timeout=12, concurrency_limit=3) as crawler:
        tasks = [crawler.fetch_page(url) for url in urls]
        results = await asyncio.gather(*tasks)

        for r in results:
            print(r.url, r.status_code, r.error_message)


if __name__ == "__main__":
    asyncio.run(main())
