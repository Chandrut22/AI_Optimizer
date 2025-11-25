from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from typing import Dict,Optional,TypedDict,List

class OnPageResult(TypedDict):
    """
    A data model for storing the results of an on-page SEO analysis.
    Updated to include Advanced SEO metrics.
    """
    url: str
    title: Optional[str] 
    meta_description: Optional[str] 
    headings: Dict[str, List[str]] 
    body_text_length: int 
    images: List[Dict[str, Optional[str]]] 
    links: Dict[str, List[str]]     
    canonical: Optional[str]
    robots: Optional[str]
    og_tags: Optional[str]
    schema: Optional[str]
    error_message: Optional[str]

class OnPageAnalyzer:
    """
    Parses HTML content to extract key on-page SEO elements, 
    including Advanced SEO tags (Canonical, OG, Robots).
    """
    def __init__(self, url: str, html_content: str):
        self.url = url
        self.base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
        self.soup = BeautifulSoup(html_content, 'html.parser')

    def analyze(self) -> OnPageResult:
        """Runs all extraction methods and returns a structured result."""
        try:
            # Basic Elements
            headings = self._extract_headings()
            images = self._extract_images()
            links = self._extract_links()
            body_text = self.soup.body.get_text(separator=' ', strip=True) if self.soup.body else ""

            # Advanced SEO Elements (NEW)
            canonical = self._extract_canonical()
            robots = self._extract_robots()
            og_tags = self._extract_opengraph()
            schema = self._extract_schema()

            # We pack the new data into the result. 
            # Note: You might need to add these keys to your OnPageResult TypedDict if you want strict typing,
            # but Python dicts will accept them dynamically.
            return {
                "url": self.url,
                "title": self._extract_title(),
                "meta_description": self._extract_meta_description(),
                "headings": headings,
                "body_text_length": len(body_text.split()),
                "images": images,
                "links": links,
                # New Advanced Fields
                "canonical": canonical,
                "robots": robots,
                "og_tags": og_tags,
                "schema": schema,
                "error_message": None
            }
        except Exception as e:
            return {"url": self.url, "error_message": f"Parsing Error: {str(e)}"}

    def _extract_title(self) -> Optional[str]:
        return self.soup.title.string.strip() if self.soup.title else None

    def _extract_meta_description(self) -> Optional[str]:
        meta = self.soup.find('meta', attrs={'name': 'description'})
        return meta.get('content').strip() if meta else None

    def _extract_headings(self) -> Dict[str, List[str]]:
        headings = {}
        for i in range(1, 4): # H1 to H3
            tag = f'h{i}'
            found_tags = [h.get_text(strip=True) for h in self.soup.find_all(tag)]
            if found_tags: headings[tag] = found_tags
        return headings

    def _extract_images(self) -> List[Dict[str, Optional[str]]]:
        return [{'src': i.get('src'), 'alt': i.get('alt')} for i in self.soup.find_all('img')]

    def _extract_links(self) -> Dict[str, List[str]]:
        links = {'internal': [], 'external': []}
        for a in self.soup.find_all('a', href=True):
            href = urljoin(self.base_url, a['href'])
            if self.base_url in href: links['internal'].append(href)
            else: links['external'].append(href)
        return links

    # --- NEW ADVANCED METHODS ---

    def _extract_canonical(self) -> str:
        link = self.soup.find('link', rel='canonical')
        return link.get('href') if link else "Missing"

    def _extract_robots(self) -> str:
        meta = self.soup.find('meta', attrs={'name': 'robots'})
        return meta.get('content') if meta else "No specific directives (Index/Follow assumed)"

    def _extract_opengraph(self) -> str:
        # Check for og:title, og:description, og:image
        og_props = ['og:title', 'og:description', 'og:image']
        found = []
        for prop in og_props:
            if self.soup.find('meta', property=prop):
                found.append(prop)
        
        if len(found) == 3: return "Perfect (Title, Desc, Image found)"
        if found: return f"Partial ({', '.join(found)})"
        return "Missing"

    def _extract_schema(self) -> str:
        # Check for JSON-LD schema
        schema = self.soup.find('script', type='application/ld+json')
        return "Detected (JSON-LD)" if schema else "Missing"