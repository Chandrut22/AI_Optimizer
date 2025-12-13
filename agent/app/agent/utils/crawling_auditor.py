from typing import Dict, List, Optional, TypedDict
from urllib.parse import urljoin, urlparse
import urllib.robotparser
from bs4 import BeautifulSoup


class CrawlingAuditResult(TypedDict):
    robots_status: Dict[str, str]
    js_links_count: int
    risky_external_links: List[str]
    error_message: Optional[str]

class CrawlingAuditor:
    """
    Analyzes existing HTML content for SEO best practices regarding
    crawling, indexing, and link health.
    """
    def __init__(self, url: str):
        self.url = url
        self.parsed_url = urlparse(url)
        self.domain = self.parsed_url.netloc
        self.robots_url = urljoin(url, "/robots.txt")
        self.user_agent = "*"

    def run_audit(self, html_content: str) -> CrawlingAuditResult:
        """
        Main entry point.
        Returns: A dictionary (CrawlingAuditResult) containing the audit data.
        """
        print(f"--- Starting Crawl Audit for {self.url} ---")

        # Initialize default state
        result: CrawlingAuditResult = {
            "robots_status": {},
            "js_links_count": 0,
            "risky_external_links": [],
            "error_message": None
        }

        print("  >> CrawlingAuditor is running")
        try:
            # 1. Check Robots.txt
            robots_data = self._check_sensitive_paths_blocked()
            result["robots_status"] = robots_data

            # 2. Analyze HTML Links
            if html_content:
                soup = BeautifulSoup(html_content, 'html.parser')
                link_data = self._analyze_links(soup)
                result["js_links_count"] = link_data["js_links"]
                result["risky_external_links"] = link_data["risky_links"]
            else:
                result["error_message"] = "No HTML content provided to auditor."

        except Exception as e:
            result["error_message"] = f"Audit failed: {str(e)}"

        print("  >> CrawlingAuditor is running successfully")
        return result

    def _check_sensitive_paths_blocked(self) -> Dict[str, str]:
        """
        Checks if robots.txt exists and blocks specific paths.
        Returns a dict mapping paths to their status ('Blocked' or 'Allowed').
        """
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(self.robots_url)

        path_status = {}
        sensitive_paths = ["/login", "/admin", "/cart", "/checkout", "/account"]

        try:
            rp.read()
        except Exception:
            # If robots.txt can't be read, assume all are allowed (risky)
            return {path: "Unknown/Read Error" for path in sensitive_paths}

        for path in sensitive_paths:
            full_check_url = urljoin(self.url, path)
            if rp.can_fetch(self.user_agent, full_check_url):
                path_status[path] = "Allowed (Risk)"
            else:
                path_status[path] = "Blocked (Safe)"

        return path_status

    def _analyze_links(self, soup: BeautifulSoup) -> Dict:
        """
        Analyzes <a> tags.
        Returns dict with count of JS links and list of risky external links.
        """
        links = soup.find_all('a')
        js_links_count = 0
        risky_links_list = []

        for link in links:
            href = link.get('href', '').strip()
            rel = link.get('rel', [])

            # Check 1: JavaScript / Uncrawlable Links
            if href.lower().startswith('javascript:') or (href == '#' and link.has_attr('onclick')):
                js_links_count += 1

            # Check 2: External Links & Nofollow
            if href.startswith('http') and self.domain not in href:
                # If 'nofollow' is NOT present in the rel attribute list
                if 'nofollow' not in rel:
                    risky_links_list.append(href)

        return {
            "js_links": js_links_count,
            "risky_links": risky_links_list
        }