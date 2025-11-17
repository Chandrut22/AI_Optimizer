import json
import os
import asyncio
from dotenv import load_dotenv
from app.agent.tools import (
    CrawlWebsiteTool, OnPageAnalysisTool, MarketResearchTool, 
    TechnicalAuditTool, StrategyGeneratorTool, OptimizationApplierTool,
    ReportGeneratorTool
)
from bs4 import BeautifulSoup

# Load environment variables from .env file
load_dotenv()

class MainAgent:
    """Wrapper class to run the full SEO agent pipeline"""
    
    def __init__(self, target_url: str):
        self.target_url = target_url
        self.pagespeed_api_key = os.getenv("PAGESPEED_API_KEY")
        
        if not self.pagespeed_api_key:
            raise ValueError("❌ ERROR: PAGESPEED_API_KEY environment variable not set.")
        
        # Instantiate all the tools
        self.crawler = CrawlWebsiteTool()
        self.analyzer = OnPageAnalysisTool()
        self.researcher = MarketResearchTool()
        self.auditor = TechnicalAuditTool(api_key=self.pagespeed_api_key)
        self.strategist = StrategyGeneratorTool()
        self.optimizer = OptimizationApplierTool()
        self.reporter = ReportGeneratorTool()
    
    async def run(self) -> dict:
        """Run the complete SEO analysis pipeline"""
        
        print(f"--- Starting SEO Analysis for {self.target_url} ---")
        
        # --- 1. Analysis Phase (Partially Parallel) ---
        print("--- 1. ANALYSIS PHASE ---")
        print("Running Crawl and Technical Audit in parallel...")
        
        crawl_task = self.crawler.arun({'url': self.target_url})
        technical_task = self.auditor.arun({'url': self.target_url})
        
        crawl_result, technical_report = await asyncio.gather(crawl_task, technical_task)
        print("✅ Crawl and Technical Audit complete!")

        # --- Defensive Error Checking ---
        if crawl_result.get('error_message'):
            raise Exception(f"Crawl failed: {crawl_result['error_message']}")
        
        if technical_report.get('error_message'):
            print(f"⚠️ Technical Audit failed: {technical_report['error_message']}")

        # Dependent tasks
        print("Running On-page Analysis and Market Research...")
        onpage_input = {'url': crawl_result['url'], 'html_content': crawl_result['html_content']}
        analysis_result = await self.analyzer.arun(onpage_input)
        
        soup = BeautifulSoup(crawl_result['html_content'], 'lxml')
        page_text = soup.body.get_text(separator=' ', strip=True) if soup.body else ""
        research_input = {'url': analysis_result['url'], 'title': analysis_result.get('title', ''), 'page_content': page_text}
        research_report = await self.researcher.arun(research_input)
        print("✅ On-page Analysis and Research complete!")

        # --- 2. Strategy Phase ---
        print("\n--- 2. STRATEGY PHASE ---")
        strategy_input = { 
            "onpage_data": analysis_result, 
            "technical_data": technical_report, 
            "research_data": research_report 
        }
        final_strategy = await self.strategist.arun(strategy_input)
        print("✅ Strategy generation complete!")

        # --- 3. Optimization Phase ---
        print("\n--- 3. OPTIMIZATION PHASE ---")
        optimization_input = { 
            "strategy": final_strategy, 
            "onpage_data": analysis_result, 
            "research_data": research_report 
        }
        final_optimizations = await self.optimizer.arun(optimization_input)
        print("✅ Optimization application complete!")

        # --- 4. Reporting Phase ---
        print("\n--- 4. REPORTING PHASE ---")
        report_input = {
            "url": self.target_url,
            "onpage_data": analysis_result,
            "technical_data": technical_report,
            "research_data": research_report,
            "strategy_data": final_strategy,
            "optimization_data": final_optimizations
        }
        final_report = await self.reporter.arun(report_input)
        print("✅ Report generation complete!")
        
        return final_report

# Keep the old function for backward compatibility
async def run_full_seo_agent():
    """Legacy function - use MainAgent class instead"""
    main_agent = MainAgent("https://chandru22.vercel.app/")
    return await main_agent.run()

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(run_full_seo_agent())

