from dotenv import load_dotenv
from typing import Optional, TypedDict, List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
import os
import time
from tavily import TavilyClient

load_dotenv()

class InternalKeywordSchema(BaseModel):
    """Schema for extracting keywords from page content."""
    primary_keyword: str = Field(description="The single most important keyword for SEO.")
    secondary_keywords: List[str] = Field(description="3-5 related keywords found in the content.")

class InternalGapSchema(BaseModel):
    """Schema for content gap analysis."""
    competitor_themes: List[str] = Field(description="Common themes found in competitor content.")
    suggested_topics: List[str] = Field(description="Topics missing from our page that competitors cover.")

# --- Define TypedDicts for Report Output ---

class KeywordReport(TypedDict):
    primary_keyword: str
    secondary_keywords: List[str]

class ContentGapReport(TypedDict):
    competitor_themes: List[str]
    suggested_topics: List[str]

class MarketResearchReport(TypedDict):
    """The final dictionary structure for the state."""
    keyword_analysis: Optional[KeywordReport]
    competitor_urls: List[str]
    content_gap_analysis: Optional[ContentGapReport]
    error_message: Optional[str]

class MarketResearcher:
    """
    Performs keyword analysis, competitor research, and content gap analysis (Synchronous).
    """
    def __init__(self, page_content: str, page_title: str):
        self.page_content = page_content
        self.page_title = page_title

        # LLM Setup
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.2,
            api_key=os.getenv("GOOGLE_API_KEY")
        )

        self.tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

    def research(self) -> MarketResearchReport:
        """Runs the full research pipeline synchronously."""
        try:
            print("  >> MarketResearcher is running")
            print("   > Identifying keywords...")
            keyword_data = self._identify_keywords()

            primary_kw = keyword_data.get("primary_keyword")

            if not primary_kw:
                raise ValueError("Could not determine a primary keyword.")

            # --- RATE LIMIT FIX: Pause 10 seconds ---
            print("     (Pausing 10s to respect API rate limits...)")
            time.sleep(10)

            print(f"   > Analyzing competitors for: {primary_kw}...")

            # 2. Find competitors (Search Tool)
            competitors = self._analyze_competitors(primary_kw)

            # Extract URLs and create snippets
            competitor_urls = [res.get('url') for res in competitors if isinstance(res, dict) and res.get('url')]

            competitor_snippets = "\n".join(
                [f"URL: {res.get('url')}\nContent: {res.get('content')}" for res in competitors if isinstance(res, dict)]
            )

            # --- RATE LIMIT FIX: Pause 5 seconds ---
            # Even though search isn't an LLM call, giving the API a breather helps
            print("     (Pausing 5s...)")
            time.sleep(5)

            print("   > Calculating content gaps...")
            # 3. Find content gaps (LLM Call #2)
            gap_data = self._find_content_gaps(competitor_snippets)

            print(" >> MarketResearcher is running successfully")

            return MarketResearchReport(
                keyword_analysis=keyword_data,
                competitor_urls=competitor_urls,
                content_gap_analysis=gap_data,
                error_message=None
            )

        except Exception as e:
            # Return empty/safe structure on failure so the agent doesn't crash
            print(f"MarketResearcher Failed: {str(e)}")
            return MarketResearchReport(
                keyword_analysis=None,
                competitor_urls=[],
                content_gap_analysis=None,
                error_message=str(e)
            )

    def _identify_keywords(self) -> KeywordReport:
        """Extracts keywords using Gemini and returns a DICTIONARY."""
        prompt = ChatPromptTemplate.from_template(
            "Analyze the webpage content. Identify 1 primary keyword and 3-5 secondary keywords.\n\nTitle: {title}\n\nContent: {content}"
        )
        # Use Pydantic schema for structured output
        chain = prompt | self.llm.with_structured_output(InternalKeywordSchema)

        result = chain.invoke({
            "title": self.page_title,
            "content": self.page_content[:10000],
        })

        if hasattr(result, 'model_dump'): return result.model_dump() # Pydantic v2
        if hasattr(result, 'dict'): return result.dict() # Pydantic v1
        return result

    def _analyze_competitors(self, primary_keyword: str) -> List[Dict[str, Any]]:
        """
        Refactored to use Native Tavily Client for better control.
        """
        response = self.tavily_client.search(
            query=f"top blog posts about {primary_keyword}",
            max_results=3,
            search_depth="advanced",
            include_raw_content=False
        )

        return response.get('results', [])

    def _find_content_gaps(self, competitor_snippets: str) -> ContentGapReport:
        """Finds missing topics and returns a DICTIONARY."""
        prompt = ChatPromptTemplate.from_template(
            "Compare my content with competitor snippets. What are they covering that I am missing? \n\nMy Content: {my_content}\n\nCompetitor Content:\n{competitor_content}"
        )
        chain = prompt | self.llm.with_structured_output(InternalGapSchema)

        result = chain.invoke({
            "my_content": self.page_content[:5000], # Truncate my content for comparison
            "competitor_content": competitor_snippets,
        })

        # --- Convert Pydantic Object to Dictionary ---
        if hasattr(result, 'model_dump'): return result.model_dump() # Pydantic v2
        if hasattr(result, 'dict'): return result.dict() # Pydantic v1
        return result