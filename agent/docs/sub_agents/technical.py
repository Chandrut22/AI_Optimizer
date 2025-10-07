import os
import requests
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
    core_web_vitals: CoreWebVitals
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

    def audit(self, url: str) -> TechnicalAuditResult:
        """Runs the audit for a given URL, focusing on mobile performance."""
        params = {
            'url': url,
            'key': self.api_key,
            'strategy': 'MOBILE' # Mobile is critical for SEO
        }
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status() # Raise an exception for bad status codes
            data = response.json()
            return self._parse_response(url, data)
        except requests.exceptions.RequestException as e:
            return TechnicalAuditResult(url=url, core_web_vitals={}, error_message=f"API request failed: {e}")
        except Exception as e:
            return TechnicalAuditResult(url=url, core_web_vitals={}, error_message=f"An unexpected error occurred: {e}")

    def _parse_response(self, url: str, data: dict) -> TechnicalAuditResult:
        """Parses the complex JSON response from the API into our simple model."""
        lighthouse_result = data.get('lighthouseResult', {})
        categories = lighthouse_result.get('categories', {})
        audits = lighthouse_result.get('audits', {})

        # Performance Score (scaled 0-100)
        performance_score = int(categories.get('performance', {}).get('score', 0) * 100)

        # Security: Check for HTTPS
        # A score of 1 means it passes the audit (is on HTTPS)
        uses_https = audits.get('is-on-https', {}).get('score') == 1

        # Mobile-Friendliness
        # A score of 1 means it passes the audit
        mobile_friendly = audits.get('mobile-friendly', {}).get('score') == 1

        # Core Web Vitals
        lcp = audits.get('largest-contentful-paint', {}).get('numericValue', 0) / 1000 # ms to s
        fid = audits.get('max-potential-fid', {}).get('numericValue', 0) # ms
        cls = audits.get('cumulative-layout-shift', {}).get('numericValue', 0)

        vitals = CoreWebVitals(lcp=round(lcp, 2), fid=int(fid), cls=round(cls, 3))
        
        return TechnicalAuditResult(
            url=url,
            performance_score=performance_score,
            mobile_friendly=mobile_friendly,
            uses_https=uses_https,
            core_web_vitals=vitals
        )