from langchain_core.messages import BaseMessage
from operator import add as add_messages
from typing import List, Optional, Sequence, TypedDict , Annotated

from app.agent.utils.technical_auditor import TechnicalAuditor, TechnicalAuditResult
from app.agent.utils.seo_optimizer import SeoOptimizer, OptimizationResultState, OptimizedTitleMeta, GeneratedContentSection
from app.agent.utils.report_generator import ReportGenerator
from app.agent.utils.crawling_auditor import CrawlingAuditor, CrawlingAuditResult
from app.agent.utils.on_page_analyzer import OnPageAnalyzer, OnPageResult
from app.agent.utils.web_crawler import CrawlState, WebCrawler
from app.agent.utils.market_researcher import MarketResearcher, MarketResearchReport
from app.agent.utils.seo_strategist import SeoStrategist, SeoStrategy, StrategyResult   


class AgentState(TypedDict):
  url : str
  meassages : Annotated[Sequence[BaseMessage], add_messages]
  crawl_result: CrawlState
  technical_audit_result: TechnicalAuditResult
  crawling_audit_result: CrawlingAuditResult
  on_page_result: OnPageResult
  market_research_report: MarketResearchReport
  seo_strategy: SeoStrategy
  strategy_result: StrategyResult
  optimized_title_meta: OptimizedTitleMeta
  generated_content_sections: List[GeneratedContentSection]
  optimization_result: OptimizationResultState
  final_report: Optional[str]

  error_message: Optional[str]

def call_report_generator(state: AgentState):
    """Node that generates the final markdown report."""
    if not state.get("strategy_result"):
        return {**state, "error_message": "Cannot generate report: SEO Strategy is missing."}

    try:
        generator = ReportGenerator(state)
        report = generator.generate()
        return {"final_report": report}

    except Exception as e:
        return {"error_message": f"Report generation failed: {str(e)}"}
    
def call_seo_optimizer(state: AgentState):
    """Applies SEO optimizations based on the generated strategy and updates the state."""
    strategy_result = state.get("strategy_result")
    onpage_data = state.get("on_page_result")
    research_data = state.get("market_research_report")

    if not strategy_result:
        return {"error_message": "SEO strategy not available for optimization."}
    if not onpage_data:
        return {"error_message": "On-page analysis result not available for optimization."}
    if not research_data:
        return {"error_message": "Market research report not available for optimization."}

    try:
        optimizer = SeoOptimizer(
            strategy=strategy_result,
            onpage_data=onpage_data,
            research_data=research_data
        )
        optimization_result = optimizer.apply_optimizations()

        if optimization_result["error_message"]:
            return {"error_message": optimization_result["error_message"]}

        return {"optimization_result_state": optimization_result}

    except Exception as e:
        return {"error_message": f"SEO optimization failed: {str(e)}"}
    
def call_seo_strategist(state: AgentState):
    """Generates SEO strategy based on audit data and updates the state."""
    onpage_data = state.get("on_page_result")
    technical_data = state.get("technical_audit_result")
    research_data = state.get("market_research_report")

    if not onpage_data:
        return { "error_message": "On-page analysis result not available for strategy generation."}
    if not technical_data:
        return { "error_message": "Technical audit result not available for strategy generation."}
    if not research_data:
        return { "error_message": "Market research report not available for strategy generation."}

    try:
        strategist = SeoStrategist(
            onpage_data=onpage_data,
            technical_data=technical_data,
            research_data=research_data
        )
        strategy_result = strategist.generate_strategy()

        if strategy_result["error_message"]:
            return { "error_message": strategy_result["error_message"]}

        return {"strategy_result": strategy_result}

    except Exception as e:
        return {"error_message": f"SEO strategy generation failed: {str(e)}"}
    
def call_market_researcher(state: AgentState):
    """Performs market research and updates the state."""
    url = state["url"]
    crawl_result = state.get("crawl_result")
    on_page_result = state.get("on_page_result")

    if not url:
        return {"error_message": "URL not provided in state for market research."}
    if not crawl_result or not crawl_result.get("markdown"):
        return {"error_message": "Markdown content not available in state for market research."}
    if not on_page_result or not on_page_result.get("title"):
        return {"error_message": "Page title not available in state for market research."}

    page_content = crawl_result["markdown"]
    page_title = on_page_result["title"]

    try:
        researcher = MarketResearcher(
            page_content=page_content,
            page_title=page_title
        )
        market_research_report = researcher.research()

        if market_research_report["error_message"]:
            return { "error_message": market_research_report["error_message"]}

        return { "market_research_report": market_research_report}

    except Exception as e:
        return { "error_message": f"Market research failed: {str(e)}"}


def call_on_page_analyzer(state: AgentState):
    """Performs on-page SEO analysis and updates the state."""
    url = state["url"]
    crawl_result = state.get("crawl_result")
    html_content = crawl_result.get("html_content") if crawl_result else None
    metadata = crawl_result.get("metadata") if crawl_result else None

    if not url:
        return {**state, "error_message": "URL not provided in state for on-page analysis."}
    if not html_content:
        return {**state, "error_message": "HTML content not available in state for on-page analysis."}

    try:
        analyzer = OnPageAnalyzer(url=url, html_content=html_content, metadata=metadata)
        analysis_result = analyzer.analyze()

        if analysis_result["error_message"]:
            return {"error_message": analysis_result["error_message"]}

        return {"on_page_result": analysis_result}

    except Exception as e:
        return {"error_message": f"On-page analysis failed: {str(e)}"}

def call_crawling_auditor(state: AgentState):
    """Performs a crawling audit and updates the state."""
    url = state["url"]
    crawl_result = state.get("crawl_result")
    html_content = crawl_result.get("html_content") if crawl_result else None

    if not html_content:
        return {"error_message": "HTML content not available for crawling audit."}

    try:
        auditor = CrawlingAuditor(url=url)
        audit_result = auditor.run_audit(html_content=html_content)

        if audit_result["error_message"]:
            return {"error_message": audit_result["error_message"]}

        # FIXED: Return ONLY crawling_audit_result
        return {"crawling_audit_result": audit_result}

    except Exception as e:
        return {"error_message": f"Crawling audit failed: {str(e)}"}

def call_technical_auditor(state: AgentState):
    """Performs a technical audit using PageSpeed Insights and updates the state."""
    url = state["url"]
    if not url:
        return {**state, "error_message": "URL not provided in state for technical audit."}

    try:
        auditor = TechnicalAuditor()
        audit_result = auditor.audit(url)
        if audit_result["error_message"]:
            return {"error_message": audit_result["error_message"]}

        return {"technical_audit_result": audit_result}

    except Exception as e:
        return {"error_message": f"Technical audit failed: {str(e)}"}

def call_firecrawl(state: AgentState):
    """Fetches the URL using Firecrawl and updates the state."""
    url = state["url"]
    if not url:
        return {**state, "error_message": "URL not provided in state."}

    web_crawler = WebCrawler()
    crawl_result = web_crawler.fetch_page(url)

    if crawl_result["error_message"]:
        return {"error_message": crawl_result["error_message"]}

    # FIXED: Return ONLY crawl_result, and fixed the key name typo
    return {"crawl_result": crawl_result}
