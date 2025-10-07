import asyncio
from langchain.tools import BaseTool
from sub_agents.onpage import OnPageAnalyzer
from pydantic import BaseModel, Field
from typing import Type

# Import the core crawler class
from sub_agents.crawler import WebCrawler

class CrawlInput(BaseModel):
    url: str = Field(description="The URL of the webpage to crawl.")

class CrawlWebsiteTool(BaseTool):
    # FIX: Add the ': str' type annotation
    name: str = "website_crawler"
    description: str = "A tool to crawl a website and retrieve its raw HTML content. It also returns the HTTP status code."
    
    args_schema: Type[BaseModel] = CrawlInput
    
    def _run(self, url: str) -> dict:
        """
        Synchronous entry point for the tool.
        Internally, it runs the async crawler.
        """
        crawler = WebCrawler()
        # Use asyncio.run to execute the async function from a sync context
        crawl_result = asyncio.run(crawler.fetch_page(url))
        # Return the result as a dictionary to be stored in the agent's state
        return crawl_result.dict()
    
    async def _arun(self, url: str) -> dict:
        """Asynchronous entry point for the tool."""
        crawler = WebCrawler()
        crawl_result = await crawler.fetch_page(url)
        return crawl_result.dict()
    
# ... (Keep your existing CrawlWebsiteTool and its imports)

# --- On-Page Analysis Tool ---
class OnPageInput(BaseModel):
    url: str = Field(description="The original URL of the page.")
    html_content: str = Field(description="The raw HTML content of the page to be analyzed.")

class OnPageAnalysisTool(BaseTool):
    name: str = "onpage_seo_analyzer"
    description: str = "A tool to perform a detailed on-page SEO analysis of a page's HTML content."
    args_schema: Type[BaseModel] = OnPageInput

    def _run(self, url: str, html_content: str) -> dict:
        """Synchronous entry point for the tool."""
        if not html_content:
            return {"error": "HTML content cannot be empty."}
        
        analyzer = OnPageAnalyzer(url=url, html_content=html_content)
        analysis_result = analyzer.analyze()
        return analysis_result.dict()

    async def _arun(self, url: str, html_content: str) -> dict:
        """Asynchronous entry point for the tool."""
        # This specific task is CPU-bound, so a separate async implementation isn't
        # strictly necessary, but we provide it for tool consistency.
        return self._run(url, html_content)

# ... (Keep your existing CrawlWebsiteTool, OnPageAnalysisTool, and their imports)
from sub_agents.research import MarketResearcher

# --- Market Research Tool ---
class MarketResearchInput(BaseModel):
    url: str = Field(description="The original URL of the page.")
    title: str = Field(description="The title of the page.")
    # You could also pass headings and body text separately if needed
    page_content: str = Field(description="The text content of the page.")

class MarketResearchTool(BaseTool):
    name: str = "market_and_keyword_researcher"
    description: str = "A tool to perform keyword analysis, find competitors, and identify content gaps for a webpage."
    args_schema: Type[BaseModel] = MarketResearchInput

    def _run(self, url: str, title: str, page_content: str) -> dict:
        """Synchronous entry point for the tool."""
        researcher = MarketResearcher(page_title=title, page_content=page_content)
        report = researcher.research()
        return report.dict()

    async def _arun(self, url: str, title: str, page_content: str) -> dict:
        """Asynchronous entry point for the tool."""
        # For a truly async version, the methods in MarketResearcher would need to be async
        return self._run(url, title, page_content)
    

# ... (Keep all your existing tools and imports)
import os
from sub_agents.technical import TechnicalAuditor

# --- Technical Audit Tool ---
class TechnicalAuditInput(BaseModel):
    url: str = Field(description="The URL of the page to audit for technical SEO issues.")

class TechnicalAuditTool(BaseTool):
    name: str = "technical_seo_auditor"
    description: str = "A tool to perform a technical SEO audit on a URL using Google's PageSpeed Insights."
    args_schema: Type[BaseModel] = TechnicalAuditInput

    def _run(self, url: str) -> dict:
        """Synchronous entry point for the tool."""
        api_key = os.getenv("PAGESPEED_API_KEY")
        if not api_key:
            return {"error": "PAGESPEED_API_KEY environment variable not set."}
        
        auditor = TechnicalAuditor(api_key=api_key)
        report = auditor.audit(url)
        return report.dict()

    async def _arun(self, url: str) -> dict:
        """Asynchronous entry point for the tool."""
        # For a truly async version, the audit method would use aiohttp instead of requests
        return self._run(url)
    

# ... (Keep all your existing tools and imports)
from sub_agents.strategist import SeoStrategist

# --- Strategy Generator Tool ---
class StrategyInput(BaseModel):
    onpage_data: dict = Field(description="The dictionary containing on-page analysis results.")
    technical_data: dict = Field(description="The dictionary containing technical audit results.")
    research_data: dict = Field(description="The dictionary containing market research results.")

class StrategyGeneratorTool(BaseTool):
    name: str = "seo_strategy_generator"
    description: str = "A tool that synthesizes all audit data to create a prioritized SEO action plan."
    args_schema: Type[BaseModel] = StrategyInput

    def _run(self, onpage_data: dict, technical_data: dict, research_data: dict) -> dict:
        """Synchronous entry point for the tool."""
        strategist = SeoStrategist(
            onpage_data=onpage_data,
            technical_data=technical_data,
            research_data=research_data
        )
        strategy = strategist.generate_strategy()
        return strategy.dict()

    async def _arun(self, onpage_data: dict, technical_data: dict, research_data: dict) -> dict:
        """Asynchronous entry point for the tool."""
        return self._run(onpage_data, technical_data, research_data)
    

# ... (Keep all your existing tools and imports)
from sub_agents.optimizer import SeoOptimizer

# --- Optimization Applier Tool ---
class OptimizationInput(BaseModel):
    strategy: dict = Field(description="The SEO strategy plan from the strategist.")
    onpage_data: dict = Field(description="The original on-page analysis results.")
    research_data: dict = Field(description="The original market research results.")

class OptimizationApplierTool(BaseTool):
    name: str = "seo_optimization_applier"
    description: str = "A tool that applies an SEO strategy by rewriting content and generating new sections."
    args_schema: Type[BaseModel] = OptimizationInput

    def _run(self, strategy: dict, onpage_data: dict, research_data: dict) -> dict:
        """Synchronous entry point for the tool."""
        optimizer = SeoOptimizer(
            strategy=strategy,
            onpage_data=onpage_data,
            research_data=research_data
        )
        result = optimizer.apply_optimizations()
        return result.dict()

    async def _arun(self, strategy: dict, onpage_data: dict, research_data: dict) -> dict:
        """Asynchronous entry point for the tool."""
        return self._run(strategy, onpage_data, research_data)
    

# ... (Keep all your existing tools and imports)
from sub_agents.reporter import ReportGenerator

# --- Report Generator Tool ---
class ReportInput(BaseModel):
    url: str = Field(description="The original URL that was analyzed.")
    onpage_data: dict = Field(description="The original on-page analysis results.")
    strategy_data: dict = Field(description="The generated SEO strategy.")
    optimization_data: dict = Field(description="The applied content optimizations.")

class ReportGeneratorTool(BaseTool):
    name: str = "seo_report_generator"
    description: str = "A tool that generates a final, human-readable Markdown report summarizing the entire SEO process."
    args_schema: Type[BaseModel] = ReportInput

    def _run(self, url: str, onpage_data: dict, strategy_data: dict, optimization_data: dict) -> dict:
        """Synchronous entry point for the tool."""
        reporter = ReportGenerator(
            url=url,
            onpage_data=onpage_data,
            strategy_data=strategy_data,
            optimization_data=optimization_data
        )
        report = reporter.generate_markdown_report()
        return {"markdown_report": report}

    async def _arun(self, url: str, onpage_data: dict, strategy_data: dict, optimization_data: dict) -> dict:
        """Asynchronous entry point for the tool."""
        return self._run(url, onpage_data, strategy_data, optimization_data)