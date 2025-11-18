import asyncio
import os
import json
import logging
import time
from dotenv import load_dotenv
from bs4 import BeautifulSoup

# --- We will import the actual classes, not the tools ---
from .sub_agents.crawler import WebCrawler, CrawlResult
from .sub_agents.technical import TechnicalAuditor, TechnicalAuditResult
from .sub_agents.onpage import OnPageAnalyzer, OnPageResult
from .sub_agents.research import MarketResearcher, MarketResearchReport
from .sub_agents.strategist import SeoStrategist, SeoStrategy
from .sub_agents.optimizer import SeoOptimizer, OptimizationResult
from .sub_agents.reporter import ReportGenerator
from app.core.config import settings

# Load .env file (if running locally)
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class MainAgent:
    """
    Wrapper class to run the full SEO agent pipeline.
    This version is robust and handles failures in sub-agents.
    """
    
    def __init__(self, target_url: str):
        self.target_url = target_url
        self.start_time = time.time()
        
        # Use the PAGESPEED_API_KEY from settings, which is more robust
        self.pagespeed_api_key = settings.PAGESPEED_API_KEY
        if not self.pagespeed_api_key:
            raise ValueError("❌ ERROR: PAGESPEED_API_KEY environment variable not set.")
        
        # Instantiate all the sub-agents
        self.crawler = WebCrawler()
        self.auditor = TechnicalAuditor(api_key=self.pagespeed_api_key)
        # Other agents will be instantiated as needed
    
    async def run(self) -> dict:
        """Run the complete SEO analysis pipeline"""
        
        logger.info(f"--- Starting SEO Analysis for {self.target_url} ---")
        
        # --- 1. Analysis Phase (Parallel) ---
        logger.info("--- 1. ANALYSIS PHASE ---")
        logger.info("Running Crawl and Technical Audit in parallel...")
        
        crawl_task = self.crawler.fetch_page(self.target_url)
        technical_task = self.auditor.audit(self.target_url)
        
        crawl_result, technical_result = await asyncio.gather(crawl_task, technical_task)
        technical_report = technical_result.model_dump() # Convert to dict
        logger.info("✅ Crawl and Technical Audit complete!")

        # --- THIS IS THE FIX ---
        # Handle crawl failure gracefully instead of crashing
        if crawl_result.html_content:
            logger.info("Crawl succeeded. Running On-page Analysis and Market Research...")
            # If crawl succeeded, parse the HTML
            analyzer = OnPageAnalyzer(self.target_url, crawl_result.html_content)
            analysis_result = analyzer.analyze().model_dump()
            
            # Run research
            soup = BeautifulSoup(crawl_result.html_content, 'lxml')
            page_text = soup.body.get_text(separator=' ', strip=True) if soup.body else ""
            researcher = MarketResearcher(page_content=page_text, page_title=analysis_result.get("title", ""))
            research_report = (await researcher.research()).model_dump()
            logger.info("✅ On-page Analysis and Research complete!")
            
        else:
            # If crawl failed, create error reports and skip dependent tasks
            logger.warning(f"Crawl failed: {crawl_result.error_message}")
            analysis_result = {"url": self.target_url, "error_message": f"Crawl failed: {crawl_result.error_message}"}
            research_report = {"error_message": "Skipped because crawl failed."}
            logger.warning("Skipped On-page Analysis and Research.")
        # --- END FIX ---

        # --- 2. Strategy Phase ---
        logger.info("\n--- 2. STRATEGY PHASE ---")
        strategist = SeoStrategist(analysis_result, technical_report, research_report)
        final_strategy = (await strategist.generate_strategy()).model_dump()
        logger.info("✅ Strategy generation complete!")

        # --- 3. Optimization Phase ---
        # Only run if crawl was successful
        if crawl_result.html_content:
            logger.info("\n--- 3. OPTIMIZATION PHASE ---")
            optimizer = SeoOptimizer(final_strategy, analysis_result, research_report)
            final_optimizations = (await optimizer.apply_optimizations()).model_dump()
            logger.info("✅ Optimization application complete!")
        else:
            logger.warning("Skipped Optimization phase because crawl failed.")
            final_optimizations = {"error_message": "Skipped because crawl failed."}

        # --- 4. Reporting Phase ---
        logger.info("\n--- 4. REPORTING PHASE ---")
        reporter = ReportGenerator(
            self.target_url,
            analysis_result,
            technical_report,
            research_report,
            final_strategy,
            final_optimizations
        )
        final_report_markdown = await reporter.generate_markdown_report()
        logger.info("✅ Report generation complete!")
        
        logger.info(f"--- Analysis Complete in {time.time() - self.start_time:.2f}s ---")
        
        # Return the final consolidated dictionary
        return {
            "onpage_data": analysis_result,
            "technical_data": technical_report,
            "research_data": research_report,
            "strategy_data": final_strategy,
            "optimization_data": final_optimizations,
            "final_report_markdown": final_report_markdown
        }

# Keep the old function for backward compatibility
async def run_full_seo_agent():
    """Legacy function - use MainAgent class instead"""
    # This should get the URL from an env var or config,
    # hardcoding is not ideal for testing.
    main_agent = MainAgent(os.getenv("TEST_URL", "https://chandru22.vercel.app/"))
    return await main_agent.run()

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(run_full_seo_agent())