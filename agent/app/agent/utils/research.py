from dotenv import load_dotenv
from typing import Optional, TypedDict, List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.tools.tavily_search import TavilySearchResults
from pydantic import BaseModel, Field

load_dotenv()

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

class InternalKeywordSchema(BaseModel):
    primary_keyword: str = Field(description="The single most important keyword.")
    secondary_keywords: List[str] = Field(description="3-5 related keywords.")

class InternalGapSchema(BaseModel):
    competitor_themes: List[str] = Field(description="Common themes in competitor content.")
    suggested_topics: List[str] = Field(description="Topics missing from our page.")

class MarketResearcher:
    """
    Performs keyword analysis, competitor research, and content gap analysis (Synchronous).
    """
    def __init__(self, page_content: str, page_title: str):
        self.page_content = page_content
        self.page_title = page_title
        
        # LLM Setup
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.2, # Low temperature for factual, analytical reporting
        )
        
        # Search Tool Setup (Requires TAVILY_API_KEY env var)
        self.search_tool = TavilySearchResults(max_results=3)

    def research(self) -> MarketResearchReport:
        """Runs the full research pipeline synchronously."""
        try:
            print("   > Identifying keywords...")
            keyword_data = self._identify_keywords()
            
            primary_kw = keyword_data.get("primary_keyword")
            
            if not primary_kw:
                raise ValueError("Could not determine a primary keyword.")

            print(f"   > Analyzing competitors for: {primary_kw}...")

            competitors = self._analyze_competitors(primary_kw)
            
            competitor_urls = [res.get('url') for res in competitors if isinstance(res, dict) and res.get('url')]
            
            competitor_snippets = "\n".join(
                [f"URL: {res.get('url')}\nContent: {res.get('content')}" for res in competitors if isinstance(res, dict)]
            )

            print("   > Calculating content gaps...")
            gap_data = self._find_content_gaps(competitor_snippets)

            return MarketResearchReport(
                keyword_analysis=keyword_data,
                competitor_urls=competitor_urls,
                content_gap_analysis=gap_data,
                error_message=None
            )

        except Exception as e:
            return MarketResearchReport(
                keyword_analysis=None,
                competitor_urls=[],
                content_gap_analysis=None,
                error_message=str(e)
            )

    def _identify_keywords(self) -> dict:
        """Extracts keywords using Gemini and returns a DICTIONARY."""
        prompt = ChatPromptTemplate.from_template(
            "Analyze the webpage content. Identify 1 primary keyword and 3-5 secondary keywords.\n\nTitle: {title}\n\nContent: {content}"
        )
        chain = prompt | self.llm.with_structured_output(InternalKeywordSchema)
        
        result = chain.invoke({
            "title": self.page_title,
            "content": self.page_content[:10000],
        })
        
        if hasattr(result, 'model_dump'): return result.model_dump() 
        if hasattr(result, 'dict'): return result.dict() 
        return result

    def _analyze_competitors(self, primary_keyword: str) -> List[Dict[str, Any]]:
        """Uses Tavily Search to find top competing pages."""
        return self.search_tool.invoke(f"top blog posts about {primary_keyword}")

    def _find_content_gaps(self, competitor_snippets: str) -> dict:
        """Finds missing topics and returns a DICTIONARY."""
        prompt = ChatPromptTemplate.from_template(
            "Compare my content with competitor snippets. What are they covering that I am missing? \n\nMy Content: {my_content}\n\nCompetitor Content:\n{competitor_content}"
        )
        chain = prompt | self.llm.with_structured_output(InternalGapSchema)
        
        result = chain.invoke({
            "my_content": self.page_content[:5000],
            "competitor_content": competitor_snippets,
        })
        
        if hasattr(result, 'model_dump'): return result.model_dump() # Pydantic v2
        if hasattr(result, 'dict'): return result.dict() # Pydantic v1
        return result

    def _identify_keywords(self) -> KeywordReport:
        """Extracts keywords using Gemini."""
        prompt = ChatPromptTemplate.from_template(
            "Analyze the webpage content. Identify 1 primary keyword and 3-5 secondary keywords.\n\nTitle: {title}\n\nContent: {content}"
        )
        chain = prompt | self.llm.with_structured_output(InternalKeywordSchema)
        
        result = chain.invoke({
            "title": self.page_title,
            "content": self.page_content[:10000], 
        })
        return result

    def _analyze_competitors(self, primary_keyword: str) -> List[Dict[str, Any]]:
        """Uses Tavily Search to find top competing pages."""
        return self.search_tool.invoke(f"top blog posts about {primary_keyword}")

    def _find_content_gaps(self, competitor_snippets: str) -> ContentGapReport:
        """Finds missing topics."""
        prompt = ChatPromptTemplate.from_template(
            "Compare my content with competitor snippets. What are they covering that I am missing? \n\nMy Content: {my_content}\n\nCompetitor Content:\n{competitor_content}"
        )
        chain = prompt | self.llm.with_structured_output(InternalGapSchema)
        
        result = chain.invoke({
            "my_content": self.page_content[:5000],
            "competitor_content": competitor_snippets,
        })
        return result