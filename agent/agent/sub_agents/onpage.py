from bs4 import BeautifulSoup
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from urllib.parse import urljoin, urlparse

class OnPageResult(BaseModel):
    """A data model for storing the results of an on-page SEO analysis."""
    url: str
    title: Optional[str] = None
    meta_description: Optional[str] = None
    headings: Dict[str, List[str]] = Field(default_factory=dict)
    body_text_length: int = 0
    images: List[Dict[str, Optional[str]]] = Field(default_factory=list)
    links: Dict[str, List[str]] = Field(default_factory=dict)
    error_message: Optional[str] = None

class OnPageAnalyzer:
    """
    Parses HTML content to extract key on-page SEO elements.
    """
    def __init__(self, url: str, html_content: str):
        self.url = url
        self.base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
        self.soup = BeautifulSoup(html_content, 'lxml')

    def analyze(self) -> OnPageResult:
        """Runs all extraction methods and returns a structured result."""
        try:
            headings = self._extract_headings()
            images = self._extract_images()
            links = self._extract_links()
            
            # Use .get_text() for cleaner text extraction
            body_text = self.soup.body.get_text(separator=' ', strip=True) if self.soup.body else ""

            return OnPageResult(
                url=self.url,
                title=self._extract_title(),
                meta_description=self._extract_meta_description(),
                headings=headings,
                body_text_length=len(body_text.split()),
                images=images,
                links=links
            )
        except Exception as e:
            return OnPageResult(url=self.url, error_message=f"An error occurred during parsing: {str(e)}")

    def _extract_title(self) -> Optional[str]:
        return self.soup.title.string.strip() if self.soup.title else None

    def _extract_meta_description(self) -> Optional[str]:
        meta_tag = self.soup.find('meta', attrs={'name': 'description'})
        return meta_tag.get('content').strip() if meta_tag else None

    def _extract_headings(self) -> Dict[str, List[str]]:
        headings = {}
        for i in range(1, 7):
            tag = f'h{i}'
            found_tags = [h.get_text(strip=True) for h in self.soup.find_all(tag)]
            if found_tags:
                headings[tag] = found_tags
        return headings

    def _extract_images(self) -> List[Dict[str, Optional[str]]]:
        images = []
        for img in self.soup.find_all('img'):
            images.append({
                'src': img.get('src'),
                'alt': img.get('alt', '').strip() or None # Return None if alt is empty
            })
        return images

    def _extract_links(self) -> Dict[str, List[str]]:
        links = {'internal': [], 'external': []}
        for a_tag in self.soup.find_all('a', href=True):
            href = a_tag['href']
            # Resolve relative URLs to absolute URLs
            absolute_url = urljoin(self.base_url, href)
            
            if self.base_url in absolute_url:
                links['internal'].append(absolute_url)
            else:
                links['external'].append(absolute_url)
        return links