from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from typing import TypedDict, List, Dict, Optional
from pydantic import BaseModel, Field
import json

class Recommendation(BaseModel):
    priority: str = Field(description="Priority: 'High', 'Medium', or 'Low'")
    category: str = Field(description="Category: 'Content', 'Technical', 'On-Page', 'Backlinks'")
    recommendation: str = Field(description="Specific action item.")
    justification: str = Field(description="Why this helps SEO.")

class SeoStrategy(BaseModel):
    recommendations: List[Recommendation]

class StrategyResult(TypedDict):
    recommendations: List[Dict[str, str]] # We store as list of dicts, not Pydantic objects
    error_message: Optional[str]

class SeoStrategist:
    """
    Synthesizes audit data into an actionable SEO strategy using Gemini (Sync).
    """
    def __init__(self, onpage_data: dict, technical_data: dict, research_data: dict):
        self.onpage_data = onpage_data
        self.technical_data = technical_data
        self.research_data = research_data
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2)

    def generate_strategy(self) -> dict:
        """Generates the strategy synchronously."""
        formatted_data = self._format_data_for_prompt()
        
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert SEO consultant. Review the audit data below and create a prioritized list of action items.
            
            Be specific. Don't say "Fix LCP". Say "Optimize hero image size to reduce LCP".
            
            AUDIT DATA:
            {audit_data}
            """
        )
        
        # Structure the output
        chain = prompt | self.llm.with_structured_output(SeoStrategy)
        
        try:
            # Sync Invoke
            result = chain.invoke({"audit_data": formatted_data})
            
            # Convert Pydantic -> Dict for LangGraph State compatibility
            # .dict() is used in Pydantic v1 (LangChain default), .model_dump() in v2
            if hasattr(result, 'model_dump'):
                return result.model_dump() # Pydantic v2
            if hasattr(result, 'dict'):
                return result.dict() # Pydantic v1 (You were missing the parentheses here)
            
            # Fallback if neither exists (unlikely if result is SeoStrategy)
            return result
            
        except Exception as e:
            return {
                "recommendations": [
                    {
                        "priority": "High",
                        "category": "System",
                        "recommendation": "Strategy Generation Failed",
                        "justification": str(e)
                    }
                ]
            }

    def _format_data_for_prompt(self) -> str:
        """Formats the input dicts into a string, handling potential serialization errors."""
        def safe_json(data):
            try:
                return json.dumps(data, indent=2, default=str)
            except:
                return str(data)

        return f"""
        === ON-PAGE ANALYSIS ===
        {safe_json(self.onpage_data)}

        === TECHNICAL AUDIT ===
        {safe_json(self.technical_data)}

        === MARKET RESEARCH ===
        {safe_json(self.research_data)}
        """
