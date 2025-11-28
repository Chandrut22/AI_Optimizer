from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from typing import Dict, List
from pydantic import BaseModel, Field
from typing import Dict, Optional, TypedDict

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
    Executes SEO strategy by rewriting content and generating new sections (Synchronous).
    """
    def __init__(self, strategy: Dict, onpage_data: Dict, research_data: Dict):
        self.strategy = strategy.get('recommendations', []) if strategy else []
        self.onpage_data = onpage_data or {}
        self.research_data = research_data or {}
        
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7)

    def apply_optimizations(self) -> Dict:
        """Runs the optimization pipeline synchronously."""
        try:
            title_recs = [r for r in self.strategy if r.get('category') in ['Title Tag', 'Meta Description', 'On-Page']]
            content_recs = [r for r in self.strategy if r.get('category') == 'Content']

            optimized_meta = None
            new_sections = []
            if title_recs: 
                print("   > Optimizing Title & Meta Description...")
                optimized_meta = self._rewrite_title_and_meta(title_recs)

            gap_recs = [
                r for r in content_recs 
                if any(x in r.get('recommendation', '').lower() for x in ['add', 'gap', 'create', 'write'])
            ][:2]
            
            if gap_recs:
                print(f"   > Generating {len(gap_recs)} new content sections...")
                new_sections = self._generate_new_sections(gap_recs)

            return {
                "optimized_title_meta": optimized_meta,
                "new_sections": new_sections,
                "error_message": None
            }

        except Exception as e:
            return {
                "optimized_title_meta": None, 
                "new_sections": [], 
                "error_message": str(e)
            }

    def _rewrite_title_and_meta(self, recommendations: List[Dict]) -> Dict:
        """Rewrites title/meta."""
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert SEO copywriter. Rewrite the title and meta description.
            
            Original Title: {original_title}
            Original Meta: {original_meta}
            Target Keyword: {keyword}
            
            Directives:
            {recommendations}
            """
        )
        chain = prompt | self.llm.with_structured_output(OptimizedTitleMeta)
        
        kw_data = self.research_data.get('keyword_analysis')
        if not kw_data: 
            kw_data = {}
            
        primary_kw = kw_data.get('primary_keyword', 'N/A')
        
        rec_text = "\n".join([f"- {r.get('recommendation')}" for r in recommendations])

        result = chain.invoke({
            "original_title": self.onpage_data.get('title', ''),
            "original_meta": self.onpage_data.get('meta_description', ''),
            "keyword": primary_kw,
            "recommendations": rec_text
        })
        
        if hasattr(result, 'model_dump'): return result.model_dump()
        if hasattr(result, 'dict'): return result.dict()
        return result

    def _generate_new_sections(self, recommendations: List[Dict]) -> List[Dict]:
        """Generates new content paragraphs."""
        kw_data = self.research_data.get('keyword_analysis')
        if not kw_data: 
            kw_data = {}
            
        primary_kw = kw_data.get('primary_keyword', 'N/A')
        
        generated = []
        
        prompt = ChatPromptTemplate.from_template(
            """
            Write a new website content section (100-150 words) to fill a content gap.
            Topic: "{topic}"
            Target Keyword: "{keyword}"
            """
        )
        chain = prompt | self.llm.with_structured_output(GeneratedContentSection)

        for rec in recommendations:
            topic = rec.get('recommendation', 'General Topic')
            try:
                res = chain.invoke({"topic": topic, "keyword": primary_kw})
                
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
    