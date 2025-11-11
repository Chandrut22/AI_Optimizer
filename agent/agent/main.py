import json
import os
import asyncio
from dotenv import load_dotenv
from tools import (
    CrawlWebsiteTool, OnPageAnalysisTool, MarketResearchTool, 
    TechnicalAuditTool, StrategyGeneratorTool, OptimizationApplierTool,
    ReportGeneratorTool
)
from bs4 import BeautifulSoup

# Load environment variables from .env file
load_dotenv()

async def run_full_seo_agent():
    # Get API key once
    pagespeed_api_key = os.getenv("PAGESPEED_API_KEY")
    if not pagespeed_api_key:
        print("❌ ERROR: PAGESPEED_API_KEY environment variable not set.")
        return

    # Instantiate all the tools
    crawler, analyzer = CrawlWebsiteTool(), OnPageAnalysisTool()
    researcher, auditor = MarketResearchTool(), TechnicalAuditTool(api_key=pagespeed_api_key)
    strategist, optimizer, reporter = StrategyGeneratorTool(), OptimizationApplierTool(), ReportGeneratorTool()

    target_url = "https://chandru22.vercel.app/"

    # --- 1. Analysis Phase (Now Partially Parallel) ---
    print("--- 1. ANALYSIS PHASE ---")
    
    # Run independent tasks concurrently
    print("Running Crawl and Technical Audit in parallel...")
    crawl_task = crawler.arun({'url': target_url})
    technical_task = auditor.arun({'url': target_url})
    
    # Wait for both to complete
    crawl_result, technical_report = await asyncio.gather(crawl_task, technical_task)
    print("✅ Crawl and Technical Audit complete!")

    # --- Defensive Error Checking ---
    if crawl_result.get('error_message'):
        print(f"❌ Crawl failed: {crawl_result['error_message']}")
        return # Stop execution
    if technical_report.get('error_message'):
        print(f"⚠️ Technical Audit failed: {technical_report['error_message']}")
        # We can continue, but the report will note the failure.

    # Dependent tasks
    print("Running On-page Analysis and Market Research...")
    onpage_input = {'url': crawl_result['url'], 'html_content': crawl_result['html_content']}
    analysis_result = await analyzer.arun(onpage_input)
    
    soup = BeautifulSoup(crawl_result['html_content'], 'lxml')
    page_text = soup.body.get_text(separator=' ', strip=True) if soup.body else ""
    research_input = {'url': analysis_result['url'], 'title': analysis_result.get('title', ''), 'page_content': page_text}
    research_report = await researcher.arun(research_input)
    print("✅ On-page Analysis and Research complete!")

    # --- 2. Strategy Phase ---
    print("\n--- 2. STRATEGY PHASE ---")
    strategy_input = { "onpage_data": analysis_result, "technical_data": technical_report, "research_data": research_report }
    final_strategy = await strategist.arun(strategy_input)
    print("✅ Strategy generation complete!")

    # --- 3. Optimization Phase ---
    print("\n--- 3. OPTIMIZATION PHASE ---")
    optimization_input = { "strategy": final_strategy, "onpage_data": analysis_result, "research_data": research_report }
    final_optimizations = await optimizer.arun(optimization_input)
    print("✅ Optimization application complete!")

    # --- 4. Reporting Phase ---
    print("\n--- 4. REPORTING PHASE ---")
    # Pass all collected data to the new "smart" reporter
    report_input = {
        "url": target_url,
        "onpage_data": analysis_result,
        "technical_data": technical_report,    # <-- Passed to new reporter
        "research_data": research_report,      # <-- Passed to new reporter
        "strategy_data": final_strategy,
        "optimization_data": final_optimizations
    }
    final_report = await reporter.arun(report_input)
    print("✅ Report generation complete!")

    # --- 📜 FINAL SEO REPORT 📜 ---
    print("\n\n" + "="*50)
    print(" " * 15 + "FINAL SEO REPORT")
    print("="*50 + "\n")
    print(final_report['markdown_report'])


if __name__ == "__main__":
    # Run the async main function
    asyncio.run(run_full_seo_agent())

