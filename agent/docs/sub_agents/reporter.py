import json
from typing import Dict
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers.string import StrOutputParser

class ReportGenerator:
    """
    Uses an LLM to generate a comprehensive, human-readable SEO report in Markdown.
    """
    def __init__(self, onpage_data: Dict, strategy_data: Dict, optimization_data: Dict, url: str):
        self.onpage_data = onpage_data
        self.strategy_data = strategy_data
        self.optimization_data = optimization_data
        self.url = url
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.2)

    def generate_markdown_report(self) -> str:
        """Generates the final Markdown report."""
        formatted_data = self._format_data_for_prompt()
        
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert SEO analyst tasked with creating a final summary report for a client.
            The report should be clear, concise, and written in Markdown format.

            Here is all the data from the SEO audit and optimization process for the URL: {url}
            ---
            {audit_data}
            ---

            Please generate a comprehensive report with the following sections:

            1.  **## Executive Summary:** A brief, high-level overview of the page's original state and the key improvements made.
            2.  **## Key Changes (Before vs. After):** A simple comparison of the original title and meta description versus the newly optimized versions.
            3.  **## Summary of Recommendations:** A bulleted list summarizing the most important strategic recommendations that were implemented.
            4.  **## Newly Generated Content:** Include the full text of any new content sections that were created to fill content gaps. Use a blockquote for the new content.

            Generate the complete report based on the provided data.
            """
        )
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            report = chain.invoke({
                "url": self.url,
                "audit_data": formatted_data
            })
            return report
        except Exception as e:
            return f"## Report Generation Failed\n\nAn error occurred: {str(e)}"

    def _format_data_for_prompt(self) -> str:
        """Formats the dictionary data into a clean, readable string for the LLM."""
        original_title = self.onpage_data.get('title', 'N/A')
        original_meta = self.onpage_data.get('meta_description', 'N/A')
        
        optimized_title_meta = self.optimization_data.get('optimized_title_meta', {})
        new_title = optimized_title_meta.get('new_title', 'N/A') if optimized_title_meta else 'N/A'
        new_meta = optimized_title_meta.get('new_meta_description', 'N/A') if optimized_title_meta else 'N/A'
        
        recommendations = "\n".join([f"- {rec['recommendation']}" for rec in self.strategy_data.get('recommendations', [])])
        
        new_sections = self.optimization_data.get('new_sections', [])
        generated_content = "\n\n".join([f"### {sec['suggested_heading']}\n{sec['new_content_paragraph']}" for sec in new_sections]) if new_sections else "No new content was generated."

        return f"""
        **Original On-Page Data:**
        - Title: {original_title}
        - Meta Description: {original_meta}

        **Strategic Recommendations:**
        {recommendations}

        **Applied Optimizations:**
        - New Title: {new_title}
        - New Meta Description: {new_meta}
        - Generated Content Sections:
        {generated_content}
        """