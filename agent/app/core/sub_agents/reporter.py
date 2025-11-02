import json
from typing import Dict
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers.string import StrOutputParser

class ReportGenerator:
    """
    Uses an LLM to generate a comprehensive, human-readable SEO report in Markdown.
    This version analyzes the findings from all agents, provides a score, and suggests future actions.
    """
    def __init__(self, url: str, onpage_data: Dict, technical_data: Dict, research_data: Dict, strategy_data: Dict, optimization_data: Dict):
        self.url = url
        self.onpage_data = onpage_data
        self.technical_data = technical_data
        self.research_data = research_data
        self.strategy_data = strategy_data
        self.optimization_data = optimization_data
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.2)

    async def generate_markdown_report(self) -> str:
        """Generates the final Markdown report."""
        formatted_data = self._format_data_for_prompt()
        
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert SEO auditor and analyst. Your job is to synthesize all the data from a multi-agent SEO audit 
            and present a comprehensive, actionable report in Markdown format for a client.

            Here is all the data collected for the URL: {url}
            ---
            {audit_data}
            ---

            Please generate a complete report with the following structure:

            1.  **## 📈 Overall SEO Score: [X] %**
                (Calculate an overall score from 0-100 based on all the data. A high score means the page 
                is well-optimized *after* the audit; a low score means it still has many issues.)

            2.  **## Executive Summary**
                (A high-level overview of the page's state and the key actions taken.)

            3.  **## 📊 Key Changes (Before vs. After)**
                (Show the original vs. new title and meta description. If no changes were applied, state that.)

            4.  **## 🔬 Detailed Audit & Analysis**
                (This is the most important section. Create a sub-section for each agent/task. 
                For each one, summarize the findings, analyze if the results are good or bad, 
                and provide 1-2 *future* recommendations.)

                ### Technical Audit
                * **Findings:** (Summarize the technical_data: performance score, mobile-friendly, etc.)
                * **Analysis:** (Is this score good or bad? What is the impact? If the audit failed, state that.)
                * **Future Suggestions:** (e.g., "Optimize image formats," "Reduce unused JavaScript.")

                ### On-Page Analysis
                * **Findings:** (Summarize the onpage_data: title, headings, word count, etc.)
                * **Analysis:** (Are the headings well-structured? Is the word count sufficient?)
                * **Future Suggestions:** (e.g., "Add H2 headings for new sections," "Internally link to new blog posts.")

                ### Market & Keyword Research
                * **Findings:** (Summarize the research_data: primary keyword, content gaps identified.)
                * **Analysis:** (Was the original page targeting the right keyword? Are the content gaps significant?)
                * **Future Suggestions:** (e.g., "Monitor keyword rankings," "Investigate competitor backlinks.")
                
                ### SEO Strategy
                * **Findings:** (Summarize the main recommendations from strategy_data.)
                * **Analysis:** (Were these high-priority, high-impact suggestions?)
                * **Future Suggestions:** (e.g., "Implement the 'Person' schema as suggested," "Plan a content calendar based on the strategy.")

                ### Content Optimization
                * **Findings:** (Summarize the optimization_data: what was rewritten or generated.)
                * **Analysis:** (Are the new sections high-quality? Do they fill the gaps well? If no content was generated, state that.)
                * **Future Suggestions:** (e.g., "Manually review and deploy the new content," "Create supporting blog posts for the new topics.")
            """
        )
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            report = await chain.ainvoke({
                "url": self.url,
                "audit_data": formatted_data
            })
            return report
        except Exception as e:
            return f"## Report Generation Failed\n\nAn error occurred: {str(e)}"

    def _format_data_for_prompt(self) -> str:
        """Formats all the dictionary data into a clean, readable string for the LLM."""
        return f"""
        # Original On-Page Analysis
        {json.dumps(self.onpage_data, indent=2)}

        # Technical Audit Results
        {json.dumps(self.technical_data, indent=2)}

        # Market & Keyword Research
        {json.dumps(self.research_data, indent=2)}

        # Generated SEO Strategy
        {json.dumps(self.strategy_data, indent=2)}

        # Applied Optimizations
        {json.dumps(self.optimization_data, indent=2)}
        """

