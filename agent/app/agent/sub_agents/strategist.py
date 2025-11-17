import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# --- Pydantic Models for a Structured Strategy Output ---

class Recommendation(BaseModel):
    """A single, actionable SEO recommendation."""
    priority: str = Field(description="Priority of the task, e.g., 'High', 'Medium', 'Low'.")
    category: str = Field(description="The area of SEO this task addresses, e.g., 'Content', 'Technical', 'On-Page'.")
    recommendation: str = Field(description="The specific, detailed recommendation.")
    justification: str = Field(description="The reason why this recommendation is important for SEO.")

class SeoStrategy(BaseModel):
    """A complete SEO strategy with a prioritized list of recommendations."""
    recommendations: List[Recommendation]

class SeoStrategist:
    """
    Synthesizes audit data into an actionable SEO strategy using an LLM.
    """
    def __init__(self, onpage_data: Dict, technical_data: Dict, research_data: Dict):
        self.onpage_data = onpage_data
        self.technical_data = technical_data
        self.research_data = research_data
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.2)

    async def generate_strategy(self) -> SeoStrategy:
        """Generates the SEO strategy by calling the LLM with all collected data."""
        formatted_data = self._format_data_for_prompt()
        
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert SEO consultant reviewing a website audit. Your task is to synthesize the provided data and create a prioritized, actionable list of recommendations to improve the page's search engine ranking.

            Focus on providing concrete, specific advice. For each recommendation, provide a priority level, a category, the recommendation itself, and a justification.

            Here is the audit data:
            ---
            {audit_data}
            ---

            Based on this data, generate the complete SEO strategy.
            """
        )
        
        chain = prompt | self.llm.with_structured_output(SeoStrategy)
        
        try:
            # Use the asynchronous 'ainvoke' method
            strategy = await chain.ainvoke({"audit_data": formatted_data})
            return strategy
        except Exception as e:
            # Fallback in case of a parsing or API error
            return SeoStrategy(recommendations=[
                Recommendation(
                    priority="High",
                    category="Error",
                    recommendation="Failed to generate SEO strategy.",
                    justification=f"An error occurred: {str(e)}"
                )
            ])

    def _format_data_for_prompt(self) -> str:
        """Formats the dictionary data into a clean, readable string for the LLM."""
        # This function is just data processing, so it remains synchronous
        onpage_str = json.dumps(self.onpage_data, indent=2)
        technical_str = json.dumps(self.technical_data, indent=2)
        research_str = json.dumps(self.research_data, indent=2)

        return f"""
        1. On-Page Analysis:
        {onpage_str}

        2. Technical Audit:
        {technical_str}

        3. Market & Keyword Research:
        {research_str}
        """