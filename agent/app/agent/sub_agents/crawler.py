import asyncio
import os
from firecrawl import FirecrawlApp
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class CrawlResult(BaseModel):
    url: str
    status_code: int
    html_content: Optional[str] = Field(None)
    extracted_text: Optional[str] = None
    error_message: Optional[str] = None


class FirecrawlCrawler:
    def __init__(self, api_key: Optional[str] = None):
        # Use provided api_key or fallback to environment variable
        if api_key is None:
            api_key = os.getenv("FIRECRAWL_API_KEY")
        
        if not api_key:
            raise ValueError("FIRECRAWL_API_KEY not found in environment variables or parameters")
        
        self.client = FirecrawlApp(api_key=api_key)

    async def fetch_page(self, url: str) -> CrawlResult:
        try:
            response = await self.client.scrape_url_async(
                url,
                params={"formats": ["html", "markdown"]}
            )

            return CrawlResult(
                url=url,
                status_code=200,
                html_content=response.get("html"),
                extracted_text=response.get("markdown"),
                error_message=None
            )

        except Exception as e:
            return CrawlResult(
                url=url,
                status_code=500,
                error_message=str(e)
            )


# Example usage
async def main():
    # API key is now loaded from .env automatically
    crawler = FirecrawlCrawler()

    urls = ["https://chandru22.vercel.app"]

    tasks = [crawler.fetch_page(url) for url in urls]
    results = await asyncio.gather(*tasks)

    for result in results:
        print("URL:", result.url)
        print("Status:", result.status_code)
        print("Error:", result.error_message)
        print("HTML length:", len(result.html_content or ""))
        print("Extracted text preview:", result.extracted_text[:150] if result.extracted_text else None)


if __name__ == "__main__":
    asyncio.run(main())