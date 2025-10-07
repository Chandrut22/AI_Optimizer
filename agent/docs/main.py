import json
import os
from dotenv import load_dotenv
from tools import (
    CrawlWebsiteTool, OnPageAnalysisTool, MarketResearchTool, 
    TechnicalAuditTool, StrategyGeneratorTool, OptimizationApplierTool,
    ReportGeneratorTool
)

# Load environment variables from .env file
load_dotenv()

def run_full_seo_agent():
    # Instantiate all the tools
    crawler, analyzer, researcher, auditor = CrawlWebsiteTool(), OnPageAnalysisTool(), MarketResearchTool(), TechnicalAuditTool()
    strategist, optimizer, reporter = StrategyGeneratorTool(), OptimizationApplierTool(), ReportGeneratorTool()

    target_url = "https://chandru22.vercel.app/"

    # --- 1. Analysis Phase ---
    print("--- 1. ANALYSIS PHASE ---")
    crawl_result = crawler.run({'url': target_url})
    technical_report = auditor.run({'url': target_url})
    onpage_input = {'url': crawl_result['url'], 'html_content': crawl_result['html_content']}
    analysis_result = analyzer.run(onpage_input)
    
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(crawl_result['html_content'], 'lxml')
    page_text = soup.body.get_text(separator=' ', strip=True) if soup.body else ""
    research_input = {'url': analysis_result['url'], 'title': analysis_result.get('title', ''), 'page_content': page_text}
    research_report = researcher.run(research_input)
    print("✅ Analysis phase complete!")

    # --- 2. Strategy Phase ---
    print("\n--- 2. STRATEGY PHASE ---")
    strategy_input = { "onpage_data": analysis_result, "technical_data": technical_report, "research_data": research_report }
    final_strategy = strategist.run(strategy_input)
    print("✅ Strategy generation complete!")

    # --- 3. Optimization Phase ---
    print("\n--- 3. OPTIMIZATION PHASE ---")
    optimization_input = { "strategy": final_strategy, "onpage_data": analysis_result, "research_data": research_report }
    final_optimizations = optimizer.run(optimization_input)
    print("✅ Optimization application complete!")

    # --- 4. Reporting Phase ---
    print("\n--- 4. REPORTING PHASE ---")
    report_input = {
        "url": target_url,
        "onpage_data": analysis_result,
        "strategy_data": final_strategy,
        "optimization_data": final_optimizations
    }
    final_report = reporter.run(report_input)
    print("✅ Report generation complete!")

    # --- 📜 FINAL SEO REPORT 📜 ---
    print("\n\n" + "="*50)
    print(" " * 15 + "FINAL SEO REPORT")
    print("="*50 + "\n")
    print(final_report['markdown_report'])


if __name__ == "__main__":
    run_full_seo_agent()