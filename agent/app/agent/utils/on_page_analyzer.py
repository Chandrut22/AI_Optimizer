from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from typing import Dict,Optional,TypedDict,List,Any

class OnPageResult(TypedDict):
    url: str
    title: Optional[str]
    meta_description: Optional[str]
    headings: Dict[str, List[str]]
    body_text_length: int
    images: List[Dict[str, Optional[str]]]
    links: Dict[str, List[str]]
    canonical: str
    robots: str
    og_tags: str
    schema: str
    error_message: Optional[str]


class OnPageAnalyzer:
    """
    Parses HTML content to extract key on-page SEO elements.
    Designed to work with pre-fetched HTML from CrawlState.
    """
    def __init__(self, url: str, html_content: str, metadata: Dict[str, Any] = None):
        self.url = url
        self.base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
        self.html_content = html_content
        self.metadata = metadata or {}

        # Initialize BeautifulSoup only if we have content
        if html_content:
            self.soup = BeautifulSoup(html_content, 'html.parser')
        else:
            self.soup = None

    def analyze(self) -> OnPageResult:
        """Runs all extraction methods and returns a structured dictionary."""
        try:
            if not self.soup:
                return {
                    "url": self.url,
                    "error_message": "Analysis Failed: No HTML content provided.",
                    # Fill others with empty defaults to prevent key errors downstream
                    "headings": {}, "images": [], "links": {"internal": [], "external": []},
                    "body_text_length": 0, "canonical": "Missing", "robots": "Missing",
                    "og_tags": "Missing", "schema": "Missing", "title": None, "meta_description": None
                }

            # --- Extraction Logic ---

            print("  >> OnPageAnalyzer is running")

            # 1. Title & Description (Prefer Metadata, fallback to HTML)
            title = self.metadata.get('title') or self._extract_title_fallback()
            desc = self.metadata.get('description') or self._extract_meta_description_fallback()

            # 2. Content Structure
            headings = self._extract_headings()
            body_text = self.soup.body.get_text(separator=' ', strip=True) if self.soup.body else ""

            # 3. Media & Navigation
            images = self._extract_images()
            links = self._extract_links()

            # 4. Technical / Advanced Tags
            canonical = self._extract_canonical()
            robots = self._extract_robots()
            og_tags = self._extract_opengraph()
            schema = self._extract_schema()

            print("  >> OnPageAnalyzer is running successfully")


            return OnPageResult(
                url = self.url,
                title = title,
                meta_description = desc,
                headings = headings,
                body_text_length = len(body_text.split()),
                images = images,
                links = links,
                canonical = canonical,
                robots = robots,
                og_tags = og_tags,
                schema = schema,
                error_message = None
            )

        except Exception as e:
            return OnPageResult(
                url = self.url,
                error_message = f"Parsing Error: {str(e)}",
                headings = {}, images = [], links = {}, body_text_length = 0,
                canonical = "Error", robots = "Error", og_tags = "Error", schema = "Error",
                title = None, meta_description = None
            )

    # --- Internal Extraction Methods ---

    def _extract_title_fallback(self) -> Optional[str]:
        return self.soup.title.string.strip() if self.soup.title else None

    def _extract_meta_description_fallback(self) -> Optional[str]:
        meta = self.soup.find('meta', attrs={'name': 'description'})
        if meta:
            return meta.get('content', '').strip()
        return None

    def _extract_headings(self) -> Dict[str, List[str]]:
        headings = {}
        for i in range(1, 4): # H1, H2, H3
            tag = f'h{i}'
            # Get text, strip whitespace, remove empty headings
            found_tags = [h.get_text(strip=True) for h in self.soup.find_all(tag)]
            found_tags = [t for t in found_tags if t]
            if found_tags:
                headings[tag] = found_tags
        return headings

    def _extract_images(self) -> List[Dict[str, Optional[str]]]:
        # Limits to first 20 images to keep payload size manageable for LLM
        imgs = []
        for i in self.soup.find_all('img', limit=20):
            src = i.get('src')
            alt = i.get('alt')
            if src: # Only include if it has a source
                imgs.append({'src': src, 'alt': alt})
        return imgs

    def _extract_links(self) -> Dict[str, List[str]]:
        links = {'internal': [], 'external': []}
        domain = urlparse(self.url).netloc

        for a in self.soup.find_all('a', href=True):
            href = a['href'].strip()
            if not href or href.startswith(('javascript:', 'mailto:', 'tel:')):
                continue

            full_url = urljoin(self.url, href)
            parsed_href = urlparse(full_url)

            if parsed_href.netloc == domain:
                links['internal'].append(full_url)
            else:
                links['external'].append(full_url)

        # Remove duplicates
        links['internal'] = list(set(links['internal']))
        links['external'] = list(set(links['external']))
        return links

    def _extract_canonical(self) -> str:
        link = self.soup.find('link', rel='canonical')
        return link.get('href') if link else "Missing"

    def _extract_robots(self) -> str:
        # Check metadata first (Firecrawl sometimes puts it there)
        if self.metadata.get('robots'):
            return str(self.metadata.get('robots'))

        meta = self.soup.find('meta', attrs={'name': 'robots'})
        return meta.get('content') if meta else "Index/Follow (Assumed)"

    def _extract_opengraph(self) -> str:
        # We check for the "Big 3": Title, Desc, Image
        found = []
        if self.soup.find('meta', property='og:title'): found.append('title')
        if self.soup.find('meta', property='og:description'): found.append('desc')
        if self.soup.find('meta', property='og:image'): found.append('image')

        if len(found) == 3:
            return "Perfect (All Main Tags Found)"
        elif found:
            return f"Partial ({', '.join(found)})"
        return "Missing"

    def _extract_schema(self) -> str:
        # Look for JSON-LD script blocks
        schema = self.soup.find('script', type='application/ld+json')
        return "Detected (JSON-LD)" if schema else "Missing"