from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from typing import TypedDict, List, Dict, Optional
from pydantic import BaseModel, Field
import os
import time
from dotenv import load_dotenv

load_dotenv()

class Recommendation(BaseModel):
    priority: str = Field(description="Priority: 'High', 'Medium', or 'Low'")
    category: str = Field(description="Category: 'Content', 'Technical', 'On-Page', 'Backlinks'")
    recommendation: str = Field(description="Specific action item.")
    justification: str = Field(description="Why this helps SEO.")

class SeoStrategy(BaseModel):
    recommendations: List[Recommendation]

class StrategyResult(TypedDict):
    recommendations: List[Dict[str, str]]
    error_message: Optional[str]

class SeoStrategist:
    """
    Synthesizes technical, content, and market data into an actionable SEO strategy.
    """
    def __init__(self, onpage_data: dict, technical_data: dict, research_data: dict):
        self.onpage_data = onpage_data or {}
        self.technical_data = technical_data or {}
        self.research_data = research_data or {}

        # Initialize Gemini
        # We use a slightly higher temperature here (0.4) to allow for some creative strategic thinking
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.4,
            google_api_key= os.getenv("GOOGLE_API_KEY")
        )

    def generate_strategy(self) -> StrategyResult:
        """Generates the SEO strategy synchronously."""
        try:
            print("  >> SeoStrategist is running")
            print("   > Synthesizing data into strategy...")

            # Format data into a clear context string
            context_str = self._format_data_for_prompt()

            # Rate Limit Protection: Brief pause before heavy generation
            time.sleep(2)

            # Define the Prompt
            prompt = ChatPromptTemplate.from_template(
                """
                You are an elite SEO Strategist. Your goal is to create a prioritized action plan to improve the ranking of the target website.

                Review the comprehensive audit data below. Identify the weak points and opportunities.

                DATA CONTEXT:
                {audit_data}

                INSTRUCTIONS:
                1. **Prioritize Ruthlessly:** Put technical blockers (like broken pages or slow LCP) and "low hanging fruit" (like missing titles) as 'High' priority.
                2. **Be Specific:** Don't say "Fix Core Web Vitals". Say "Compress images to reduce LCP from 4.5s".
                3. **Content Gaps:** If the market research shows missing topics, recommend creating specific pages/sections.
                4. **Output Format:** Provide a list of 5-10 distinct recommendations.
                """
            )

            # Create Chain with Structured Output
            chain = prompt | self.llm.with_structured_output(SeoStrategy)

            # Invoke
            result = chain.invoke({"audit_data": context_str})

            # Convert Pydantic model to list of dicts for State compatibility
            recs_list = []
            if result and hasattr(result, 'recommendations'):
                for rec in result.recommendations:
                    # Handle Pydantic v1 vs v2 conversion safely
                    if hasattr(rec, 'model_dump'):
                        recs_list.append(rec.model_dump())
                    elif hasattr(rec, 'dict'):
                        recs_list.append(rec.dict())

            print(" >> SeoStrategist is running successfully")
            return {
                "recommendations": recs_list,
                "error_message": None
            }

        except Exception as e:
            print(f"SeoStrategist Failed: {str(e)}")
            return {
                "recommendations": [],
                "error_message": f"Strategy Generation Failed: {str(e)}"
            }

    def _format_data_for_prompt(self) -> str:
        """Helper to format complex dictionaries into a readable string for the LLM."""

        # 1. Technical Summaries
        tech_audit = self.technical_data
        cwv = tech_audit['core_web_vitals']
        tech_summary = (
            f"- Performance Score: {tech_audit.get('performance_score', 'N/A')}\n"
            f"- LCP: {cwv.get('lcp', 'N/A')} | CLS: {cwv.get('cls', 'N/A')}\n"
            f"- Mobile Friendly: {tech_audit.get('mobile_friendly') if tech_audit.get('mobile_friendly') is not None else 'Unknown'}\n"
            f"- HTTPS: {'Yes' if tech_audit.get('url', '').startswith('https') else 'No'}"
        )

        # 2. On-Page Summaries
        onpage = self.onpage_data
        onpage_summary = (
            f"- Title: {onpage.get('title', 'Missing')}\n"
            f"- Meta Description: {onpage.get('meta_description', 'Missing')}\n"
            f"- H1 Tags: {onpage.get('headings', {}).get('h1', [])}\n"
            f"- Word Count: {onpage.get('body_text_length', 0)}\n"
            f"- Canonical: {onpage.get('canonical', 'Missing')}\n"
            f"- Schema: {onpage.get('schema', 'Missing')}"
        )

        # 3. Market Research Summaries
        market = self.research_data
        kw_data = market.get('keyword_analysis', {}) or {}
        gaps = market.get('content_gap_analysis', {}) or {}
        market_summary = (
            f"- Primary Keyword: {kw_data.get('primary_keyword', 'N/A')}\n"
            f"- Secondary Keywords: {', '.join(kw_data.get('secondary_keywords', []))}\n"
            f"- Missing Content Topics: {', '.join(gaps.get('suggested_topics', []))}\n"
            f"- Competitors Analyzed: {len(market.get('competitor_urls', []))}"
        )

        return f"""
        === TECHNICAL AUDIT ===
        {tech_summary}

        === ON-PAGE ANALYSIS ===
        {onpage_summary}

        === MARKET RESEARCH ===
        {market_summary}
        """