from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_tavily import TavilySearch as TavilySearchResults

# --- Pydantic Models for Structured Output (All upgraded to V2) ---

class KeywordReport(BaseModel):
    """Data model for a keyword report."""
    primary_keyword: str = Field(description="The single most important keyword for the text.")
    secondary_keywords: List[str] = Field(description="A list of 3-5 related secondary keywords.")

class ContentGapReport(BaseModel):
    """Data model for a content gap analysis."""
    competitor_themes: List[str] = Field(description="Common themes or topics found in competitor content.")
    suggested_topics: List[str] = Field(description="Topics missing from the user's page that should be added.")

class MarketResearchReport(BaseModel):
    """The final, consolidated market research report."""
    keyword_analysis: Optional[KeywordReport] = None
    competitor_urls: List[str] = Field(default_factory=list)
    content_gap_analysis: Optional[ContentGapReport] = None
    error_message: Optional[str] = None


class MarketResearcher:
    """
    Performs keyword analysis, competitor research, and content gap analysis.
    """
    def __init__(self, page_content: str, page_title: str):
        self.page_content = page_content
        self.page_title = page_title
        # Initialize the LLM (Gemini Pro) and the search tool
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0)
        self.search_tool = TavilySearchResults(max_results=3)

    async def research(self) -> MarketResearchReport:
        """Runs the full research pipeline."""
        try:
            # 1. Identify keywords from the user's page content
            keyword_report = await self._identify_keywords()
            if not keyword_report or not keyword_report.primary_keyword:
                raise ValueError("Could not determine a primary keyword.")

            # 2. Find competitors using the primary keyword
            competitors = await self._analyze_competitors(keyword_report.primary_keyword)
            competitor_urls = [res['url'] for res in competitors]
            competitor_snippets = "\n".join([f"URL: {res['url']}\nContent: {res['content']}" for res in competitors])

            # 3. Find content gaps by comparing with competitors
            content_gap_report = await self._find_content_gaps(competitor_snippets)

            return MarketResearchReport(
                keyword_analysis=keyword_report,
                competitor_urls=competitor_urls,
                content_gap_analysis=content_gap_report
            )
        except Exception as e:
            return MarketResearchReport(error_message=str(e))


    async def _identify_keywords(self) -> KeywordReport:
        """Uses Gemini to extract keywords from the page content."""
        prompt = ChatPromptTemplate.from_template(
            "Analyze the following webpage content and title. Identify the single primary keyword and 3-5 secondary keywords. \n\nTitle: {title}\n\nContent: {content}"
        )
        # The chain now correctly uses a Pydantic V2 model
        chain = prompt | self.llm.with_structured_output(KeywordReport)
        return await chain.ainvoke({
            "title": self.page_title,
            "content": self.page_content[:4000],
        })

    async def _analyze_competitors(self, primary_keyword: str) -> List[Dict[str, Any]]:
        """Uses Tavily Search to find top competing pages."""
        # Use the async 'ainvoke' method for the search tool
        return await self.search_tool.ainvoke(f"top articles about {primary_keyword}")

    async def _find_content_gaps(self, competitor_snippets: str) -> ContentGapReport:
        """Uses Gemini to find topics competitors cover that we don't."""
        prompt = ChatPromptTemplate.from_template(
            "You are an SEO strategist. Analyze my content and the content of my top competitors. Identify key themes my competitors cover that I am missing. Suggest specific topics I should add to my page to fill these gaps. \n\nMy Content: {my_content}\n\nCompetitor Content Snippets:\n{competitor_content}"
        )
        chain = prompt | self.llm.with_structured_output(ContentGapReport)
        return await chain.ainvoke({
            "my_content": self.page_content[:4000],
            "competitor_content": competitor_snippets,
        })