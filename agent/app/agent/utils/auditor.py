import os
import requests
import traceback 
from typing import TypedDict, Optional
from dotenv import load_dotenv

load_dotenv()


class CoreWebVitals(TypedDict):
    """Data model for Core Web Vitals metrics."""
    lcp: Optional[float] # Largest Contentful Paint (in seconds)
    fid: Optional[float] # First Input Delay (in milliseconds)
    cls: Optional[float] # Cumulative Layout Shift (unitless score)

class TechnicalAuditResult(TypedDict):
    """Final complete audit report."""
    url:str
    performance_score: Optional[int] = None
    mobile_friendly: Optional[bool] = None
    uses_https: Optional[bool] = None
    core_web_vitals: Optional[CoreWebVitals]
    error_message: Optional[str] = None

class TechnicalAuditor:
    """
    Performs a technical SEO audit using the Google PageSpeed Insights API (Synchronous).
    """
    def __init__(self, api_key: Optional[str] = None):
        if api_key is None:
            api_key = os.getenv("PAGESPEED_API_KEY")
            
        if not api_key:
            raise ValueError("PageSpeed Insights API key is required.")
            
        self.api_key = api_key
        self.base_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
        self.timeout = 60.0 # Seconds

    def audit(self, url: str) -> TechnicalAuditResult:
        """Runs the audit for a given URL synchronously."""
        params = {
            'url': url,
            'key': self.api_key,
            'strategy': 'MOBILE'
        }
        error_message: Optional[str] = None

        try:
            response = requests.get(self.base_url, params=params, timeout=self.timeout)
            response.raise_for_status() 
            
            data = response.json()
            return self._parse_response(url, data)

        except requests.exceptions.Timeout:
            error_message = f"API request timed out after {self.timeout}s. The PageSpeed API is slow."
            print(f"--- TIMEOUT ERROR --- \n{error_message}\n")
        
        except requests.exceptions.HTTPError as e:
            error_message = f"API request failed with status {e.response.status_code}: {e.response.text}"
            print(f"--- HTTP STATUS ERROR --- \n{error_message}\n")
        
        except requests.exceptions.RequestException as e:
            error_message = f"API request failed: {type(e).__name__} - {str(e)}"
            print(f"--- REQUEST ERROR --- \n{error_message}\n")

        except Exception as e:
            error_message = f"An unexpected error occurred: {e}"
            print("--- UNEXPECTED ERROR ---")
            traceback.print_exc()
        
        return TechnicalAuditResult(
            url=url, 
            performance_score=None, 
            mobile_friendly=None, 
            uses_https=None, 
            core_web_vitals=None,
            error_message=error_message
        )

    def _parse_response(self, url: str, data: dict) -> TechnicalAuditResult:
        """Parses the complex JSON response."""
        lighthouse_result = data.get('lighthouseResult', {})
        categories = lighthouse_result.get('categories', {})
        audits = lighthouse_result.get('audits', {})

        performance_score = int(categories.get('performance', {}).get('score', 0) * 100)
        
        uses_https = audits.get('is-on-https', {}).get('score') == 1
        
        mobile_friendly = True 
        
        lcp = audits.get('largest-contentful-paint', {}).get('numericValue', 0) / 1000
        fid = audits.get('max-potential-fid', {}).get('numericValue', 0)
        cls = audits.get('cumulative-layout-shift', {}).get('numericValue', 0)

        vitals = CoreWebVitals(lcp=round(lcp, 2), fid=int(fid), cls=round(cls, 3))
        
        return TechnicalAuditResult(
            url=url,
            performance_score=performance_score,
            mobile_friendly=mobile_friendly,
            uses_https=uses_https,
            core_web_vitals=vitals,
            error_message=None
        )