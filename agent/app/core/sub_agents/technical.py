import os
import httpx  # Use httpx for async requests
import traceback # Import traceback for detailed logging
from pydantic import BaseModel, Field
from typing import Optional

# --- Pydantic Models for a Clean, Structured Output ---

class CoreWebVitals(BaseModel):
    """Data model for Core Web Vitals metrics."""
    lcp: Optional[float] = Field(None, description="Largest Contentful Paint (in seconds)")
    fid: Optional[float] = Field(None, description="First Input Delay (in milliseconds)")
    cls: Optional[float] = Field(None, description="Cumulative Layout Shift (unitless score)")

class TechnicalAuditResult(BaseModel):
    """The final, consolidated technical audit report."""
    url: str
    performance_score: Optional[int] = Field(None, description="Google's performance score (0-100)")
    mobile_friendly: Optional[bool] = Field(None, description="Whether the page is mobile-friendly")
    uses_https: Optional[bool] = Field(None, description="Whether the page uses HTTPS")
    core_web_vitals: CoreWebVitals = Field(default_factory=CoreWebVitals)
    error_message: Optional[str] = None


class TechnicalAuditor:
    """
    Performs a technical SEO audit using the Google PageSpeed Insights API.
    """
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("PageSpeed Insights API key is required.")
        self.api_key = api_key
        self.base_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
        
        # --- FIX 1: Increase timeout to 60 seconds ---
        self.client = httpx.AsyncClient(timeout=60.0)

    async def audit(self, url: str) -> TechnicalAuditResult:
        """Runs the audit for a given URL, focusing on mobile performance."""
        params = {
            'url': url,
            'key': self.api_key,
            'strategy': 'MOBILE'
        }
        error_message: Optional[str] = None
        try:
            response = await self.client.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            return self._parse_response(url, data)

        # --- FIX 2: Add specific handler for ReadTimeout ---
        except httpx.ReadTimeout as e:
            error_message = f"API request timed out after {self.client.timeout.read}s. The PageSpeed API is slow."
            print(f"--- TIMEOUT ERROR --- \n{error_message}\n")
        
        except httpx.HTTPStatusError as e:
            # This handles 4xx/5xx errors (e.g., 403 Forbidden, 400 Bad Request)
            error_message = f"API request failed with status {e.response.status_code}: {e.response.text}"
            print(f"--- HTTP STATUS ERROR --- \n{error_message}\n")
        
        except httpx.RequestError as e:
            # This handles other network errors (e.g., DNS failure, connection refused)
            error_message = f"API request failed: {type(e).__name__} - {str(e)}"
            print(f"--- REQUEST ERROR --- \n{error_message}\n")

        except Exception as e:
            # This catches any other unexpected errors (e.g., JSON parsing)
            error_message = f"An unexpected error occurred: {e}"
            print("--- UNEXPECTED ERROR ---")
            traceback.print_exc()
        
        return TechnicalAuditResult(url=url, error_message=error_message)


    def _parse_response(self, url: str, data: dict) -> TechnicalAuditResult:
        """Parses the complex JSON response from the API into our simple model."""
        lighthouse_result = data.get('lighthouseResult', {})
        categories = lighthouse_result.get('categories', {})
        audits = lighthouse_result.get('audits', {})

        performance_score = int(categories.get('performance', {}).get('score', 0) * 100)
        uses_https = audits.get('is-on-https', {}).get('score') == 1
        mobile_friendly = audits.get('mobile-friendly', {}).get('score') == 1

        lcp = audits.get('largest-contentful-paint', {}).get('numericValue', 0) / 1000
        fid = audits.get('max-potential-fid', {}).get('numericValue', 0)
        cls = audits.get('cumulative-layout-shift', {}).get('numericValue', 0)

        vitals = CoreWebVitals(lcp=round(lcp, 2), fid=int(fid), cls=round(cls, 3))
        
        return TechnicalAuditResult(
            url=url,
            performance_score=performance_score,
            mobile_friendly=mobile_friendly,
            uses_https=uses_https,
            core_web_vitals=vitals
        )

