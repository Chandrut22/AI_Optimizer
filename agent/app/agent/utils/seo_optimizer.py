from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from typing import Dict, List, Optional, TypedDict
from pydantic import BaseModel, Field
import os
import time

class OptimizationResultState(TypedDict):
    """The dictionary stored in the main AgentState."""
    optimized_title_meta: Optional[Dict[str, str]] # Stored as dict, not Pydantic
    new_sections: List[Dict[str, str]] # List of dicts
    error_message: Optional[str]

class OptimizedTitleMeta(BaseModel):
    """Data model for a rewritten Title and Meta Description."""
    new_title: str = Field(description="The newly optimized, SEO-friendly title.")
    new_meta_description: str = Field(description="The newly optimized, compelling meta description.")

class GeneratedContentSection(BaseModel):
    """Data model for a newly generated content section."""
    suggested_heading: str = Field(description="A suitable H2 or H3 heading.")
    new_content_paragraph: str = Field(description="The content paragraph (100-150 words).")

class SeoOptimizer:
    """
    Executes SEO strategy by rewriting content and generating new sections.
    """
    def __init__(self, strategy: Dict, onpage_data: Dict, research_data: Dict):
        # Safely extract recommendations list
        self.strategy = strategy.get('recommendations', []) if strategy else []
        self.onpage_data = onpage_data or {}
        self.research_data = research_data or {}

        # We use a higher temperature (0.7) for creative writing tasks
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7,
            google_api_key= os.getenv("GOOGLE_API_KEY")
        )

    def apply_optimizations(self) -> OptimizationResultState:
        """Runs the optimization pipeline synchronously."""
        print("  >> SeoOptimizer is running")
        try:
            # Filter recommendations based on category and keywords
            title_recs = [
                r for r in self.strategy
                if r.get('category') in ['Title Tag', 'Meta Description', 'On-Page']
                or 'title' in r.get('action', '').lower()
            ]

            # Look for content gaps recommendations (add, create, write, gap)
            gap_recs = [
                r for r in self.strategy
                if r.get('category') == 'Content'
                and any(x in r.get('action', '').lower() for x in ['add', 'gap', 'create', 'write'])
            ][:2] # Limit to top 2 to save tokens/time

            optimized_meta = None
            new_sections = []

            # 1. Rewrite Title & Meta (if needed)
            if title_recs:
                print("   > Optimizing Title & Meta Description...")
                optimized_meta = self._rewrite_title_and_meta(title_recs)
                # Rate limit pause
                time.sleep(2)

            # 2. Generate New Sections
            if gap_recs:
                print(f"   > Generating {len(gap_recs)} new content sections...")
                new_sections = self._generate_new_sections(gap_recs)

            print(" >> SeoOptimizer is running successfully")
            return {
                "optimized_title_meta": optimized_meta,
                "new_sections": new_sections,
                "error_message": None
            }

        except Exception as e:
            return {
                "optimized_title_meta": None,
                "new_sections": [],
                "error_message": f"Optimization Failed: {str(e)}"
            }

    def _rewrite_title_and_meta(self, recommendations: List[Dict]) -> Dict:
        """Rewrites title/meta based on analysis."""
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert SEO copywriter. Rewrite the title and meta description for this page.

            Original Title: {original_title}
            Original Meta: {original_meta}
            Target Keyword: {keyword}

            Directives from Strategy:
            {recommendations}
            """
        )
        chain = prompt | self.llm.with_structured_output(OptimizedTitleMeta)

        # Extract Keyword safely
        kw_data = self.research_data.get('keyword_analysis') or {}
        primary_kw = kw_data.get('primary_keyword', 'N/A')

        rec_text = "\n".join([f"- {r.get('action')}" for r in recommendations])

        result = chain.invoke({
            "original_title": self.onpage_data.get('title', ''),
            "original_meta": self.onpage_data.get('meta_description', ''),
            "keyword": primary_kw,
            "recommendations": rec_text
        })

        # Handle Pydantic conversion
        if hasattr(result, 'model_dump'): return result.model_dump()
        if hasattr(result, 'dict'): return result.dict()
        return result

    def _generate_new_sections(self, recommendations: List[Dict]) -> List[Dict]:
        """Generates new content paragraphs for identified gaps."""
        # Extract Keyword safely
        kw_data = self.research_data.get('keyword_analysis') or {}
        primary_kw = kw_data.get('primary_keyword', 'N/A')

        generated = []

        prompt = ChatPromptTemplate.from_template(
            """
            Write a new website content section (100-150 words) to fill a specific content gap.

            Topic Requirement: "{topic}"
            Target Keyword to include: "{keyword}"
            Tone: Professional and informative.
            """
        )
        chain = prompt | self.llm.with_structured_output(GeneratedContentSection)

        for rec in recommendations:
            topic = rec.get('action', 'General Topic')
            try:
                # Rate limit pause between generations
                time.sleep(3)

                res = chain.invoke({"topic": topic, "keyword": primary_kw})

                # Handle Pydantic conversion
                if hasattr(res, 'model_dump'):
                    res_dict = res.model_dump()
                elif hasattr(res, 'dict'):
                    res_dict = res.dict()
                else:
                    res_dict = res

                generated.append(res_dict)
            except Exception as e:
                print(f"Failed to generate section for {topic}: {e}")

        return generated