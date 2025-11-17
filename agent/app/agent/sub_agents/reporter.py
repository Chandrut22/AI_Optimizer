import json
from typing import Dict, List, Optional
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
        
        # --- NEW: Create formatted summaries ---
        summaries = self._create_summaries_for_prompt()
        
        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert SEO auditor and analyst. Your job is to synthesize all the data from a multi-agent SEO audit 
            and present a comprehensive, actionable report in Markdown format for a client.

            **IMPORTANT:** Do NOT include the raw JSON data in your report. Use only the provided summaries to build your analysis.
            Present comparative data (like before/after) in Markdown tables.

            Here is all the data collected for the URL: {url}
            ---
            
            # 1. Technical Audit Summary
            {technical_summary}

            # 2. Original On-Page Summary
            {onpage_summary}

            # 3. Market Research Summary
            {research_summary}
            
            # 4. SEO Strategy Summary
            {strategy_summary}
            
            # 5. Applied Optimizations Summary
            {optimization_summary}
            
            ---

            Please generate a complete report with the following structure:

            1.  **## 📈 Overall SEO Score: [X] %**
                (Calculate an overall score from 0-100 based on all the data. A high score means the page 
                is well-optimized *after* the audit; a low score means it still has many issues.)

            2.  **## Executive Summary**
                (A high-level overview of the page's state and the key actions taken.)

            3.  **## 📊 Key Changes (Before vs. After)**
                (Show the original vs. new title and meta description in a Markdown table.
                | Item | Before | After |
                | :--- | :--- | :--- |
                | Title | ... | ... |
                | Meta Description | ... | ... |
                If no changes were applied, state that.)

            4.  **## 🔬 Detailed Audit & Analysis**
                (This is the most important section. Create a sub-section for each agent/task. 
                For each one, summarize the findings, analyze if the results are good or bad, 
                and provide 1-2 *future* recommendations.)

                ### Technical Audit
                * **Findings:** (Summarize the technical_summary. If the audit failed, state that.)
                * **Analysis:** (Is the performance score good or bad? What is the impact of being mobile-friendly?)
                * **Future Suggestions:** (e.g., "Optimize image formats," "Reduce unused JavaScript.")

                ### On-Page Analysis
                * **Findings:** (Summarize the onpage_summary: title, headings, word count, etc.)
                * **Analysis:** (Are the headings well-structured? Is the word count sufficient?)
                * **Future Suggestions:** (e.g., "Add H2 headings for new sections," "Internally link to new blog posts.")

                ### Market & Keyword Research
                * **Findings:** (Summarize the research_summary: primary keyword, content gaps identified.)
                * **Analysis:** (Was the original page targeting the right keyword? Are the content gaps significant?)
                * **Future Suggestions:** (e.g., "Monitor keyword rankings," "Investigate competitor backlinks.")
                
                ### SEO Strategy
                * **Findings:** (Summarize the main recommendations from strategy_summary.)
                * **Analysis:** (Were these high-priority, high-impact suggestions?)
                * **Future Suggestions:** (e.g., "Implement the 'Person' schema as suggested," "Plan a content calendar based on the strategy.")

                ### Content Optimization
                * **Findings:** (Summarize the optimization_summary: what was rewritten or generated.)
                * **Analysis:** (Are the new sections high-quality? Do they fill the gaps well? If no content was generated, state that.)
                * **Future Suggestions:** (e.g., "Manually review and deploy the new content," "Create supporting blog posts for the new topics.")
            """
        )
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            report = await chain.ainvoke({
                "url": self.url,
                **summaries  # Pass all the new summary strings
            })
            return report
        except Exception as e:
            return f"## Report Generation Failed\n\nAn error occurred: {str(e)}"

    def _create_summaries_for_prompt(self) -> Dict[str, str]:
        """Helper function to create clean summaries of all agent data."""
        
        # Technical Summary
        tech_error = self.technical_data.get('error_message')
        if tech_error:
            technical_summary = f"Technical audit failed: {tech_error}"
        else:
            vitals = self.technical_data.get('core_web_vitals', {})
            technical_summary = (
                f"- Performance Score: {self.technical_data.get('performance_score', 'N/A')}%\n"
                f"- Mobile Friendly: {self.technical_data.get('mobile_friendly', 'N/A')}\n"
                f"- Uses HTTPS: {self.technical_data.get('uses_https', 'N/A')}\n"
                f"- LCP: {vitals.get('lcp', 'N/A')}s, FID: {vitals.get('fid', 'N/A')}ms, CLS: {vitals.get('cls', 'N/A')}"
            )
            
        # On-Page Summary
        onpage_summary = (
            f"- Original Title: {self.onpage_data.get('title', 'N/A')}\n"
            f"- Original Meta Description: {self.onpage_data.get('meta_description', 'N/A')}\n"
            f"- Word Count: {self.onpage_data.get('body_text_length', 0)}\n"
            f"- Total Headings (H1-H6): {sum(len(v) for v in self.onpage_data.get('headings', {}).values())}\n"
            f"- Total Images: {len(self.onpage_data.get('images', []))}\n"
            f"- Internal Links: {len(self.onpage_data.get('links', {}).get('internal', []))}\n"
            f"- External Links: {len(self.onpage_data.get('links', {}).get('external', []))}"
        )
        
        # Research Summary
        research_error = self.research_data.get('error_message')
        if research_error:
            research_summary = f"Market research failed: {research_error}"
        else:
            keywords = self.research_data.get('keyword_analysis', {})
            gaps = self.research_data.get('content_gap_analysis', {})
            research_summary = (
                f"- Primary Keyword: {keywords.get('primary_keyword', 'N/A')}\n"
                f"- Secondary Keywords: {', '.join(keywords.get('secondary_keywords', []))}\n"
                f"- Identified Competitors: {len(self.research_data.get('competitor_urls', []))}\n"
                f"- Content Gaps Found: {', '.join(gaps.get('suggested_topics', ['None']))}"
            )
        
        # Strategy Summary
        recommendations = self.strategy_data.get('recommendations', [])
        if recommendations:
            strategy_summary = "\n".join([
                f"- **{rec.get('priority')} Priority ({rec.get('category')}):** {rec.get('recommendation')}" 
                for rec in recommendations
            ])
        else:
            strategy_summary = "No strategic recommendations were generated."
            
        # Optimization Summary
        opt_error = self.optimization_data.get('error_message')
        if opt_error:
            optimization_summary = f"Content optimization failed: {opt_error}"
        else:
            title_meta = self.optimization_data.get('optimized_title_meta')
            new_sections = self.optimization_data.get('new_sections', [])
            
            if title_meta:
                optimization_summary = (
                    f"- New Title: {title_meta.get('new_title', 'N/A')}\n"
                    f"- New Meta Description: {title_meta.get('new_meta_description', 'N/A')}\n"
                )
            else:
                optimization_summary = "- No new title or meta description was generated.\n"
            
            optimization_summary += f"- New Content Sections Added: {len(new_sections)}"

        return {
            "technical_summary": technical_summary,
            "onpage_summary": onpage_summary,
            "research_summary": research_summary,
            "strategy_summary": strategy_summary,
            "optimization_summary": optimization_summary,
        }

