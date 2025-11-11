import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# --- Pydantic Models (No changes here) ---

class OptimizedTitleMeta(BaseModel):
    """Data model for a rewritten Title and Meta Description."""
    new_title: str = Field(description="The newly optimized, SEO-friendly title.")
    new_meta_description: str = Field(description="The newly optimized, compelling meta description.")

class GeneratedContentSection(BaseModel):
    """Data model for a newly generated content section to fill a gap."""
    suggested_heading: str = Field(description="A suitable H2 or H3 heading for the new section.")
    new_content_paragraph: str = Field(description="The full paragraph of new content, written to be engaging and informative.")

class OptimizationResult(BaseModel):
    """The final, consolidated result of all content optimizations."""
    optimized_title_meta: Optional[OptimizedTitleMeta] = None
    new_sections: List[GeneratedContentSection] = Field(default_factory=list)
    error_message: Optional[str] = None

# --- SeoOptimizer Class (Changes are inside) ---

class SeoOptimizer:
    """
    Executes an SEO strategy by rewriting content and generating new sections using an LLM.
    """
    def __init__(self, strategy: Dict, onpage_data: Dict, research_data: Dict):
        self.strategy = strategy.get('recommendations', [])
        self.onpage_data = onpage_data
        self.research_data = research_data if research_data else {} # Ensure research_data is a dict
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.5)

    async def apply_optimizations(self) -> OptimizationResult:
        """Runs the full optimization pipeline."""
        try:
            title_meta_recommendations = [r for r in self.strategy if r['category'] in ['Title Tag', 'Meta Description']]
            content_gap_recommendations = [r for r in self.strategy if r['category'] == 'Content']

            # Create a list of tasks to run in parallel
            tasks_to_run = []
            
            # Task 1: Rewrite Title and Meta (if recommendations exist)
            if title_meta_recommendations:
                tasks_to_run.append(self._rewrite_title_and_meta(title_meta_recommendations))
            
            # Task 2: Generate New Sections (if recommendations exist)
            if content_gap_recommendations:
                tasks_to_run.append(self._generate_new_sections(content_gap_recommendations))

            if not tasks_to_run:
                return OptimizationResult() # Nothing to do

            # Run all tasks concurrently
            results = await asyncio.gather(*tasks_to_run)

            # Process results
            optimized_title_meta: Optional[OptimizedTitleMeta] = None
            new_sections: List[GeneratedContentSection] = []

            # Check results by type
            for res in results:
                if isinstance(res, OptimizedTitleMeta):
                    optimized_title_meta = res
                elif isinstance(res, list): # This is the list of new sections
                    new_sections = res

            return OptimizationResult(
                optimized_title_meta=optimized_title_meta,
                new_sections=new_sections
            )
        except Exception as e:
            return OptimizationResult(error_message=str(e))

    async def _rewrite_title_and_meta(self, recommendations: List[Dict]) -> OptimizedTitleMeta:
        """Uses a specific prompt to rewrite the title and meta description."""
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert SEO copywriter. Your task is to rewrite a webpage's title and meta description based on a list of recommendations.

            Original Title: {original_title}
            Original Meta Description: {original_meta}
            Primary Keyword: {keyword}

            Recommendations:
            {recommendations}

            Rewrite the title and meta description to be SEO-friendly, compelling, and aligned with the recommendations.
            """
        )
        chain = prompt | self.llm.with_structured_output(OptimizedTitleMeta)
        
        primary_keyword = (self.research_data.get('keyword_analysis') or {}).get('primary_keyword', '')

        # Use the asynchronous 'ainvoke'
        return await chain.ainvoke({
            "original_title": self.onpage_data.get('title', ''),
            "original_meta": self.onpage_data.get('meta_description', ''),
            "keyword": primary_keyword,
            "recommendations": "\n".join([f"- {r['recommendation']}" for r in recommendations])
        })

    async def _generate_new_sections(self, recommendations: List[Dict]) -> List[GeneratedContentSection]:
        """Generates new content paragraphs for each content-gap recommendation in parallel."""
        
        primary_keyword = (self.research_data.get('keyword_analysis') or {}).get('primary_keyword', '')
        
        generation_tasks = []

        for rec in recommendations:
            if "add a section" in rec['recommendation'].lower() or "fill the content gap" in rec['recommendation'].lower():
                prompt = ChatPromptTemplate.from_template(
                    """
                    You are an expert content writer and subject matter expert. Your task is to write a new, informative paragraph for a webpage to fill a content gap.

                    Topic for the new section: "{topic}"
                    Primary Keyword of the article: "{keyword}"

                    Write a new paragraph (around 100-150 words) on this topic. It should be engaging, accurate, and naturally incorporate the primary keyword if relevant. Provide a suitable H2 or H3 heading for this new section.
                    """
                )
                chain = prompt | self.llm.with_structured_output(GeneratedContentSection)
                topic = rec['recommendation']
                
                # Add the async task to the list, don't run it yet
                generation_tasks.append(chain.ainvoke({
                    "topic": topic,
                    "keyword": primary_keyword
                }))
        
        # Run all generation tasks in parallel
        generated_sections = await asyncio.gather(*generation_tasks)
        return generated_sections