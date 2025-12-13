from datetime import datetime
import os
from typing import Dict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
load_dotenv()


class ReportGenerator:
    """
    Generates a comprehensive, multi-page SEO report mimicking the deep structure of AIOSEO.
    """
    def __init__(self, state: Dict):
        self.state = state
        # We use a slightly higher max_tokens to ensure the full long report is generated
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.2,
            google_api_key= os.getenv("GOOGLE_API_KEY"),
            max_output_tokens=4000 # Allow for a long response
        )

    def generate(self) -> str:
        """Generates the long-form Markdown report synchronously."""
        print("   > Generating Comprehensive 3+ Page Report...")

        context = self._prepare_context()

        prompt = ChatPromptTemplate.from_template(
            """
            You are an elite SEO Audit System (like AIOSEO). Your task is to generate a **detailed, multi-page PDF-style SEO Report**.

            **INPUT DATA:**
            {context}

            **INSTRUCTIONS FOR GENERATION:**
            1. **Length & Depth**: Do NOT be brief. This report must be long and detailed. For every check (e.g., Title, Performance), provide:
               - The Status (✅ Pass / ❌ Fail / ⚠️ Warning)
               - The Finding (e.g., "We found an H1 tag.")
               - **Educational Context**: Explain WHY this metric is important (e.g., "Headings help search engines understand structure...").
               - **Actionable Advice**: If failed, tell them exactly how to fix it.

            2. **Structure**: Divide your output into logical "Pages" using the separator `--- PAGE BREAK ---`.

            **STRICT FORMATTING RULES (CRITICAL):**
            1. **NO TABLES:** Do not use Markdown tables. Present all data in clear bulleted lists or descriptive paragraphs.
            2. **NO EMOJIS:** Do not use icons like ✅, ❌, or ⚠️. Use professional text labels like "STATUS: PASS", "STATUS: FAIL", or "STATUS: CRITICAL".
            3. **NO PAGE BREAKS:** Do not use "--- PAGE BREAK ---" or explicit page numbers. The report should flow continuously.
            4. **VERBOSITY:** Be detailed and educational. Explain *why* a metric matters before giving the result.

            **REPORT CONTENT LAYOUT:**

            **[TITLE PAGE]**
            - Big Title: "SEO Analysis Report"
            - Subtitle: Generated for {url}
            - Date: {date}
            - Branding: "Powered by AI SEO Agent"

            **[EXECUTIVE SUMMARY & SCORE]**
            - **Overall Site Score**: Big bold number (0-100).
            - **Score Interpretation**: (e.g., "75/100 - Very Good!").
            - **Overview Table**: specific counts of Passed vs Failed checks.
            - **Search Preview**: Create a visual box showing how the Google snippet looks (Title + Meta Desc).

            **[BASIC SEO ANALYSIS]**
            - **Title Tag**: Analyze length (Standard: 60 chars). EDUCATE the user on why titles drive click-through rates (CTR).
            - **Meta Description**: Analyze length (Standard: 160 chars). EDUCATE on how it acts as an "ad copy" for the page.
            - **Headings (H1-H6)**: content hierarchy analysis.

            **[ADVANCED TECHNICAL SEO]**
            - **Canonical Tags**: Detailed explanation of duplicate content protection.
            - **Robots.txt & Sitemaps**: Crawlability status.
            - **Schema Markup**: Explain how structured data helps get Rich Snippets.
            - **Open Graph**: Social media visibility analysis.

            **[PERFORMANCE & SECURITY]**
            - **Core Web Vitals**: Deep dive into LCP, CLS, TBT. Explain what each acronym means.
            - **Mobile Friendliness**: Why mobile-first indexing matters.
            - **Security**: HTTPS/SSL check and "Safe Browsing" status.

            **[TOP OPPORTUNITIES (STRATEGY)]**
            - **Prioritized Action Plan**: List the top 5 distinct recommendations from the strategy data.
            - For each recommendation, provide a "Difficulty Level" and "Expected Impact".

            **TONE:** Professional, authoritative, yet helpful and educational (like a consultant).
            """
        )

        chain = prompt | self.llm
        result = chain.invoke({
            "context": context,
            "url": self.state.get('url', 'Target Website'),
            "date": datetime.now().strftime("%B %d, %Y")
        })

        return result.content

    def _prepare_context(self) -> str:
        """Helper to map AgentState data to the detailed sections."""
        s = self.state

        # Extract data with safe defaults
        url = s.get('url', 'Unknown')
        tech = s.get('technical_audit_result', {})
        onpage = s.get('on_page_result', {})
        crawling = s.get('crawling_audit_result', {})
        strategy = s.get('strategy_result', {})

        # Calculate a pseudo-score if one is missing
        perf_score = tech.get('performance_score', 0)
        seo_score = 100
        if not onpage.get('title'): seo_score -= 10
        if not onpage.get('meta_description'): seo_score -= 10
        if not onpage.get('headings', {}).get('h1'): seo_score -= 10
        if not tech.get('uses_https'): seo_score -= 10
        if tech.get('mobile_friendly') is False: seo_score -= 10

        final_score = int((perf_score + seo_score) / 2)

        return f"""
        TARGET URL: {url}
        CALCULATED OVERALL SCORE: {final_score}/100

        === BASIC SEO DATA ===
        - Page Title: "{onpage.get('title', 'MISSING')}" (Length: {len(onpage.get('title', '') or '')})
        - Meta Description: "{onpage.get('meta_description', 'MISSING')}" (Length: {len(onpage.get('meta_description', '') or '')})
        - H1 Tag: {onpage.get('headings', {}).get('h1', ['MISSING'])}
        - H2 Tags Found: {len(onpage.get('headings', {}).get('h2', []))} tags found.
        - Image Alt Attributes: {len(onpage.get('images', []))} images analyzed.
        - Internal Links: {len(onpage.get('links', {}).get('internal', []))}
        - External Links: {len(onpage.get('links', {}).get('external', []))}

        === ADVANCED SEO DATA ===
        - Canonical URL: {onpage.get('canonical', 'Missing')}
        - Robots.txt Status: {crawling.get('robots_status', 'Not Checked')}
        - Schema.org Data: {onpage.get('schema', 'Not Detected')}
        - Open Graph Tags: {onpage.get('og_tags', 'Not Detected')}

        === PERFORMANCE DATA (Core Web Vitals) ===
        - LCP (Largest Contentful Paint): {tech.get('core_web_vitals', {}).get('lcp', 'N/A')}
        - CLS (Cumulative Layout Shift): {tech.get('core_web_vitals', {}).get('cls', 'N/A')}
        - TBT (Total Blocking Time): {tech.get('core_web_vitals', {}).get('tbt', 'N/A')}
        - Mobile Friendly: {'Yes' if tech.get('mobile_friendly') else 'No'}
        - Server Response Time: {tech.get('core_web_vitals', {}).get('si', 'N/A')}

        === SECURITY DATA ===
        - HTTPS Enabled: {'Yes' if tech.get('uses_https') else 'No'}

        === STRATEGIC RECOMMENDATIONS (For Page 6) ===
        {strategy.get('recommendations', [])}
        """

