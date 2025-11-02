import asyncio
import os
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type, Any

# Import all sub-agent classes
from sub_agents.crawler import WebCrawler
from sub_agents.onpage import OnPageAnalyzer
from sub_agents.research import MarketResearcher
from sub_agents.technical import TechnicalAuditor
from sub_agents.strategist import SeoStrategist
from sub_agents.optimizer import SeoOptimizer
from sub_agents.reporter import ReportGenerator

# --- Crawl Tool ---
class CrawlInput(BaseModel):
    url: str = Field(description="The URL of the webpage to crawl.")

class CrawlWebsiteTool(BaseTool):
    name: str = "website_crawler"
    description: str = "A tool to crawl a website and retrieve its raw HTML content."
    args_schema: Type[BaseModel] = CrawlInput
    
    def _run(self, url: str) -> dict:
        crawler = WebCrawler()
        return asyncio.run(crawler.fetch_page(url)).dict()
    
    async def _arun(self, url: str) -> dict:
        crawler = WebCrawler()
        crawl_result = await crawler.fetch_page(url)
        return crawl_result.dict()

# --- On-Page Analysis Tool ---
class OnPageInput(BaseModel):
    url: str = Field(description="The original URL of the page.")
    html_content: str = Field(description="The raw HTML content of the page to be analyzed.")

class OnPageAnalysisTool(BaseTool):
    name: str = "onpage_seo_analyzer"
    description: str = "A tool to perform a detailed on-page SEO analysis of a page's HTML content."
    args_schema: Type[BaseModel] = OnPageInput

    def _run(self, url: str, html_content: str) -> dict:
        if not html_content:
            return {"error": "HTML content cannot be empty."}
        analyzer = OnPageAnalyzer(url=url, html_content=html_content)
        return analyzer.analyze().dict()

    async def _arun(self, url: str, html_content: str) -> dict:
        # Run CPU-bound parsing in a thread to avoid blocking
        return await asyncio.to_thread(self._run, url=url, html_content=html_content)

# --- Market Research Tool ---
class MarketResearchInput(BaseModel):
    url: str = Field(description="The original URL of the page.")
    title: str = Field(description="The title of the page.")
    page_content: str = Field(description="The text content of the page.")

class MarketResearchTool(BaseTool):
    name: str = "market_and_keyword_researcher"
    description: str = "A tool to perform keyword analysis, find competitors, and identify content gaps."
    args_schema: Type[BaseModel] = MarketResearchInput

    def _run(self, url: str, title: str, page_content: str) -> dict:
        researcher = MarketResearcher(page_title=title, page_content=page_content)
        return asyncio.run(researcher.research()).dict()

    async def _arun(self, url: str, title: str, page_content: str) -> dict:
        researcher = MarketResearcher(page_title=title, page_content=page_content)
        report = await researcher.research()
        return report.dict()

# --- Technical Audit Tool ---
class TechnicalAuditInput(BaseModel):
    url: str = Field(description="The URL of the page to audit for technical SEO issues.")

class TechnicalAuditTool(BaseTool):
    name: str = "technical_seo_auditor"
    description: str = "A tool to perform a technical SEO audit on a URL using Google's PageSpeed Insights."
    args_schema: Type[BaseModel] = TechnicalAuditInput
    api_key: str  # Field to hold the API key

    # Override constructor to accept api_key
    def __init__(self, api_key: str, **data: Any):
        # Pass api_key to super() to satisfy Pydantic validation
        super().__init__(api_key=api_key, **data)
        if not api_key:
            raise ValueError("PAGESPEED_API_KEY must be provided to TechnicalAuditTool.")
        self.api_key = api_key

    def _run(self, url: str) -> dict:
        auditor = TechnicalAuditor(api_key=self.api_key)
        return asyncio.run(auditor.audit(url)).dict()

    async def _arun(self, url: str) -> dict:
        auditor = TechnicalAuditor(api_key=self.api_key)
        report = await auditor.audit(url)
        return report.dict()

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
        strategist = SeoStrategist(
            onpage_data=onpage_data,
            technical_data=technical_data,
            research_data=research_data
        )
        return asyncio.run(strategist.generate_strategy()).dict()

    async def _arun(self, onpage_data: dict, technical_data: dict, research_data: dict) -> dict:
        strategist = SeoStrategist(
            onpage_data=onpage_data,
            technical_data=technical_data,
            research_data=research_data
        )
        strategy = await strategist.generate_strategy()
        return strategy.dict()

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
        optimizer = SeoOptimizer(
            strategy=strategy,
            onpage_data=onpage_data,
            research_data=research_data
        )
        return asyncio.run(optimizer.apply_optimizations()).dict()

    async def _arun(self, strategy: dict, onpage_data: dict, research_data: dict) -> dict:
        optimizer = SeoOptimizer(
            strategy=strategy,
            onpage_data=onpage_data,
            research_data=research_data
        )
        result = await optimizer.apply_optimizations()
        return result.dict()

# --- Report Generator Tool ---
class ReportInput(BaseModel):
    """Input model for the ReportGeneratorTool."""
    url: str = Field(description="The original URL that was analyzed.")
    onpage_data: dict = Field(description="The original on-page analysis results.")
    technical_data: dict = Field(description="The technical audit results.")  # <-- ADDED
    research_data: dict = Field(description="The market research results.")  # <-- ADDED
    strategy_data: dict = Field(description="The generated SEO strategy.")
    optimization_data: dict = Field(description="The applied content optimizations.")

class ReportGeneratorTool(BaseTool):
    name: str = "seo_report_generator"
    description: str = "A tool that generates a final, analytical Markdown report."
    args_schema: Type[BaseModel] = ReportInput

    def _run(self, url: str, onpage_data: dict, technical_data: dict, research_data: dict, strategy_data: dict, optimization_data: dict) -> dict:
        """Synchronous entry point."""
        reporter = ReportGenerator(
            url=url,
            onpage_data=onpage_data,
            technical_data=technical_data,      # <-- ADDYED
            research_data=research_data,        # <-- ADDED
            strategy_data=strategy_data,
            optimization_data=optimization_data
        )
        report = asyncio.run(reporter.generate_markdown_report())
        return {"markdown_report": report}

    async def _arun(self, url: str, onpage_data: dict, technical_data: dict, research_data: dict, strategy_data: dict, optimization_data: dict) -> dict:
        """Asynchronous entry point."""
        reporter = ReportGenerator(
            url=url,
            onpage_data=onpage_data,
            technical_data=technical_data,      # <-- ADDED
            research_data=research_data,        # <-- ADDED
            strategy_data=strategy_data,
            optimization_data=optimization_data
        )
        report = await reporter.generate_markdown_report()
        return {"markdown_report": report}

