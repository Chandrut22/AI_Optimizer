import os
import requests
import time
from typing import TypedDict, Optional, List
from dotenv import load_dotenv

load_dotenv()


class CoreWebVitals(TypedDict):
    lcp: str  # Largest Contentful Paint
    cls: str  # Cumulative Layout Shift
    tbt: str  # Total Blocking Time
    si: str   # Speed Index
    fcp: str  # First Contentful Paint

class TechnicalAuditResult(TypedDict):
    url: str
    performance_score: int
    mobile_friendly: bool
    core_web_vitals: CoreWebVitals
    top_opportunities: List[str]
    error_message: Optional[str]

class TechnicalAuditor:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("PAGESPEED_API_KEY") 
        if not self.api_key:
            raise ValueError("PAGESPEED_API_KEY is required.")
        self.base_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
        self.timeout = 60.0

    def audit(self, url: str, retries: int = 2) -> TechnicalAuditResult:
        """Runs the audit for a given URL synchronously with retry logic."""
        params = {
            'url': url,
            'key': self.api_key,
            'strategy': 'MOBILE',
            'category': 'performance' # Ensure category is specified
        }

        last_error = None
        print("  >> TechnicalAuditor is running")
        for attempt in range(retries + 1):
            try:
                print(f"   > Requesting PageSpeed (Attempt {attempt + 1})...")
                response = requests.get(self.base_url, params=params, timeout=self.timeout)
                response.raise_for_status()

                data = response.json()
                return self._parse_response(url, data)

            except requests.exceptions.Timeout:
                last_error = f"API request timed out after {self.timeout}s."
                print(f"     [Warning] {last_error} Retrying...")
                time.sleep(2) # Backoff before retry

            except requests.exceptions.HTTPError as e:
                last_error = f"API request failed with status {e.response.status_code}: {e.response.reason}"
                print(f"     [Error] {last_error}")
                # Don't retry 4xx errors (client error), only 5xx (server error)
                if 400 <= e.response.status_code < 500:
                    break
                time.sleep(2)

            except Exception as e:
                last_error = f"An unexpected error occurred: {str(e)}"
                print(f"     [Error] {last_error}")
                break # Don't retry unexpected errors

        # If we exit the loop, all retries failed
        return TechnicalAuditResult(
            url=url,
            performance_score=None,
            mobile_friendly=None,
            uses_https=None,
            core_web_vitals=None,
            top_opportunities=[],
            error_message=last_error or "Unknown error after retries."
        )

    def _parse_response(self, url: str, data: dict) -> TechnicalAuditResult:
        """Parses the JSON response safely."""
        lighthouse = data.get('lighthouseResult', {})
        audits = lighthouse.get('audits', {})
        categories = lighthouse.get('categories', {})

        # Score extraction (handle if 'performance' category is missing)
        perf_cat = categories.get('performance')
        score = int(perf_cat.get('score') * 100) if perf_cat and perf_cat.get('score') is not None else None

        # Helper for safe extraction
        def get_display(key):
            return audits.get(key, {}).get('displayValue', 'N/A')

        vitals = CoreWebVitals(
            lcp=get_display('largest-contentful-paint'),
            cls=get_display('cumulative-layout-shift'),
            tbt=get_display('total-blocking-time'),
            si=get_display('speed-index'),
            fcp=get_display('first-contentful-paint')
        )

        # Mobile Friendly (Heuristic based on Viewport)
        viewport_audit = audits.get('viewport', {})
        is_mobile_friendly = viewport_audit.get('score') == 1

        # HTTPS Check
        https_audit = audits.get('is-on-https', {})
        uses_https = https_audit.get('score') == 1

        # Opportunities
        opportunities = []
        for key, audit in audits.items():
            if audit.get('score') is not None and audit.get('score') < 0.9:
                title = audit.get('title')
                display_value = audit.get('displayValue', '')

                # Filter for relevant opportunity types
                if any(x in key for x in ['insight', 'byte-weight', 'unused', 'render-blocking']):
                    if display_value:
                        opportunities.append(f"{title}: {display_value}")
                    else:
                        opportunities.append(title)
        print("  >> Technical Audit running successfully")
        return TechnicalAuditResult(
            url=url,
            performance_score=score,
            mobile_friendly=is_mobile_friendly,
            uses_https=uses_https,
            core_web_vitals=vitals,
            top_opportunities=opportunities[:5],
            error_message=None
        )