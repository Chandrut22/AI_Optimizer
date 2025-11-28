from bs4 import BeautifulSoup
from app.agent.utils.auditor import TechnicalAuditResult, TechnicalAuditor
from app.agent.utils.crawler import CrawlState, WebCrawler
from app.agent.utils.onpage import OnPageResult, OnPageAnalyzer
from app.agent.utils.optimizer import OptimizationResultState, SeoOptimizer
from app.agent.utils.research import MarketResearchReport, MarketResearcher
from app.agent.utils.strategist import StrategyResult, SeoStrategist
from langchain_core.messages import SystemMessage, HumanMessage, BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import TypedDict, Annotated, Sequence
from dotenv import load_dotenv
from operator import add as add_messages

load_dotenv()

class AgentState(TypedDict):
    url: str
    messages: Annotated[Sequence[BaseMessage], add_messages]
    crawl_result : CrawlState
    technicalAuditResult: TechnicalAuditResult
    onPageResult: OnPageResult
    marketResearchResult: MarketResearchReport
    strategyResult: StrategyResult
    optimizationResult: OptimizationResultState

def crawl_node(state: AgentState) -> AgentState:
    """
    Executes the crawling logic and updates the state with results.
    """
    print(f"--- CRAWLING URL: {state['url']} ---")
    
    target_url = state["url"]
    
    crawler = WebCrawler()
    
    result = crawler.fetch_page(target_url)
    
    if result["status_code"] == 200:
        summary_msg = f"Successfully crawled {target_url}. Content is ready for audit."
    else:
        summary_msg = f"Failed to crawl {target_url}. Error: {result['error_message']}"
        
    return {
        "crawl_result": result,
        "messages": [SystemMessage(content=summary_msg)]
    }

def technical_audit_node(state: AgentState) -> AgentState:
    """
    Node responsible for running the PageSpeed Insights audit.
    """
    print(f"--- RUNNING TECHNICAL AUDIT: {state['url']} ---")
    
    target_url = state["url"]
    
    auditor = TechnicalAuditor() 
    
    audit_result = auditor.audit(target_url)
    
    if audit_result['error_message']:
        msg_content = f"Technical audit failed: {audit_result['error_message']}"
    else:
        msg_content = (
            f"Technical audit complete. "
            f"Performance Score: {audit_result['performance_score']}/100. "
            f"LCP: {audit_result['core_web_vitals']['lcp']}s. "
        )

    return {
        "technicalAuditResult": audit_result,
        "messages": [SystemMessage(content=msg_content)]
    }

def onpage_analyzer_node(state: AgentState) -> AgentState:
    """
    Node that analyzes the HTML content for On-Page SEO elements, 
    including Advanced SEO metrics.
    """
    print(f"--- RUNNING ON-PAGE ANALYSIS: {state['url']} ---")
    
    crawl_data = state.get("crawl_result")
    
    if not crawl_data or not crawl_data.get("html_content"):
        return {
            "onPageResult": {"error_message": "Skipping analysis: No HTML content available from crawl."}
        }

    html_content = crawl_data["html_content"]
    url = state["url"]

    analyzer = OnPageAnalyzer(url, html_content)
    
    results = analyzer.analyze()
    img_missing_alt = len([img for img in results['images'] if not img.get('alt')])
    h1_count = len(results.get('headings', {}).get('h1', []))
    title_len = len(results['title']) if results.get('title') else 0
    
    og_status = results.get('og_tags', 'Missing')
    schema_status = results.get('schema', 'Missing')
    robots_status = results.get('robots', 'Missing')
    
    canonical_val = results.get('canonical')
    canonical_status = "Present" if canonical_val and canonical_val != "Missing" else "Missing"
    
    summary_msg = (
        f"On-Page Analysis Complete.\n"
        f"- Title Length: {title_len} chars\n"
        f"- H1 Tags Found: {h1_count}\n"
        f"- Images without Alt Text: {img_missing_alt}\n"
        f"- Internal Links: {len(results.get('links', {}).get('internal', []))}\n"
        f"- External Links: {len(results.get('links', {}).get('external', []))}\n"
        f"- Advanced SEO: Canonical ({canonical_status}), Robots ({robots_status}), OG Tags ({og_status}), Schema ({schema_status})"
    )

    return {
        "onPageResult": results,
        "messages": [SystemMessage(content=summary_msg)]
    }

def market_research_node(state: AgentState) -> AgentState:
    """
    Node that runs competitor analysis and keyword research.
    """
    print(f"--- RUNNING MARKET RESEARCH: {state['url']} ---")
    
    crawl_data = state.get("crawl_result", {})
    on_page_data = state.get("onPageResult", {})
    
    html_content = crawl_data.get("html_content")
    
    if not html_content:
        return {
            "marketResearchResult": {"error_message": "Skipping research: No HTML content available."}
        }

    soup = BeautifulSoup(html_content, 'html.parser')
    page_text = soup.body.get_text(separator=' ', strip=True) if soup.body else ""
    
    page_title = on_page_data.get("title", state["url"])

    researcher = MarketResearcher(page_content=page_text, page_title=page_title)
    results = researcher.research()

    return {
        "marketResearchResult": results
    }

def strategy_node(state: AgentState) -> AgentState:
    """
    Node that runs the SeoStrategist.
    """
    print(f"--- GENERATING STRATEGY: {state['url']} ---")
    
    onpage = state.get("onPageResult", {})
    tech = state.get("technicalAuditResult", {})
    market = state.get("marketResearchResult", {})
    
    strategist = SeoStrategist(
        onpage_data=onpage,
        technical_data=tech,
        research_data=market
    )
    
    result = strategist.generate_strategy()
    
    # 3. Return update
    return {"strategyResult": result}

def optimization_node(state: AgentState) -> AgentState:
    """
    Node that runs the SeoOptimizer.
    """
    print(f"--- RUNNING CONTENT OPTIMIZER: {state['url']} ---")
    
    strategy = state.get("strategyResult", {})
    onpage = state.get("onPageResult", {})
    research = state.get("marketResearchResult", {})
    
    optimizer = SeoOptimizer(strategy, onpage, research)
    results = optimizer.apply_optimizations()
    
    return {"optimizationResult": results}


SEO_REPORT_TEMPLATE = """
# COMPREHENSIVE SEO AUDIT REPORT
**Target Website:** {url}
**Audit Date:** {date}

---

# TABLE OF CONTENTS
1. Executive Summary
2. Scorecard Overview
3. Search Engine Visibility
4. On-Page SEO Analysis
    4.1 Title Tag Optimization
    4.2 Meta Description Analysis
    4.3 Keyword Usage
5. Content Structure & Hierarchy
    5.1 Heading Tags (H1-H6)
    5.2 Content Quality & Gaps
6. Technical Infrastructure
    6.1 Canonicalization
    6.2 Robots & Indexing
    6.3 Schema Markup
7. Site Performance & Core Web Vitals
8. Security & Accessibility
9. Strategic Action Plan

---

# 1. EXECUTIVE SUMMARY

This document provides an in-depth technical and content audit of {url}. The purpose of this audit is to identify barriers preventing the site from ranking higher in search engines and to uncover opportunities for organic growth.

**Current Health Assessment**
The website is currently performing at a score of **{perf_score}/100**.

Based on our analysis, the website demonstrates strengths in certain areas but requires immediate attention regarding critical technical SEO factors and content optimization. The following sections detail every aspect of the site's performance, contrasting current metrics against industry standards and Google's Core Web Vitals benchmarks.

---

# 2. SCORECARD OVERVIEW

We have categorized our findings into three distinct levels of urgency. This breakdown helps prioritize the remediation efforts required.

| Category | Findings Count | Definition |
| :--- | :--- | :--- |
| **Good Results** | {good_count} | Items that meet or exceed industry best practices. No action required. |
| **Recommended Improvements** | {rec_count} | Items that are not broken but could be optimized for better performance. |
| **Critical Issues** | {critical_count} | Items that are actively hurting your rankings or user experience. Immediate fix required. |

---

# 3. SEARCH ENGINE VISIBILITY

This section visualizes how your website appears to a user on a Search Engine Results Page (SERP). The click-through rate (CTR) of your website is heavily influenced by the attractiveness and relevance of this snippet.

**Snippet Preview:**
> **{seo_title}**
> {url}
> {seo_description}

**Analysis of Snippet:**
If the title or description above appears cut off, generic, or missing, it indicates a significant missed opportunity. A well-crafted snippet acts as an advertisement for your content, enticing users to choose your link over competitors.

---

# 4. ON-PAGE SEO ANALYSIS

On-page SEO refers to the practice of optimizing individual web pages in order to rank higher and earn more relevant traffic in search engines.

## 4.1 Title Tag Optimization

**Concept Definition**
The Title Tag is an HTML element that specifies the title of a web page. It is displayed on search engine results pages (SERPs) as the clickable headline for a given result.

**Why It Matters**
The title tag is widely considered one of the most important on-page SEO elements. It gives search engines a high-level overview of the page content and is the first interaction a user has with your brand in search results.

**Audit Findings**
* **Status:** {title_status}
* **Character Length:** {title_len} characters (Optimal: 50-60 characters)
* **Current Content:** "{seo_title}"

**Recommendations**
Ensure your title tag is unique for every page. It should place the most important keyword near the beginning of the string. If the current length is under 30 characters, it is too thin. If it is over 60 characters, Google will truncate it.

## 4.2 Meta Description Analysis

**Concept Definition**
The meta description is an attribute that provides a brief summary of a web page. Search engines often display the meta description in search results, which can influence click-through rates.

**Why It Matters**
While meta descriptions are not a direct ranking factor, they are a primary driver of user behavior. A compelling description acts as a "pitch" to the searcher. If left empty, Google will pull random text from the page, which may not be flattering or relevant.

**Audit Findings**
* **Status:** {meta_status}
* **Character Length:** {meta_len} characters (Optimal: 150-160 characters)
* **Current Content:** "{seo_description}"

## 4.3 Keyword Usage

**Concept Definition**
Keywords are the ideas and topics that define what your content is about. In terms of SEO, they're the words and phrases that searchers enter into search engines, also called "search queries."

**Audit Findings**
* **Primary Keyword Identified:** {keyword_status}

**Analysis**
We analyzed the content to see if a primary keyword is naturally integrated into the Title, H1, and first 100 words of the body content. If the primary keyword is listed as "N/A" or "Missing," search engines may struggle to understand the core topic of this page.

---

# 5. CONTENT STRUCTURE & HIERARCHY

Search engines use heading tags to understand the structure and hierarchy of your content.

## 5.1 Heading Tags (H1-H6)

**Concept Definition**
Heading tags are used to communicate the organization of the content on the page. The H1 tag should define the main topic, while H2s through H6s should be used to define sub-topics.

**Why It Matters**
Proper usage of heading tags allows search engine crawlers to navigate your content efficiently. It also improves accessibility for screen readers. A page should strictly have only one H1 tag.

**Audit Findings**
* **H1 Tag Status:** {h1_status}
* **Current H1:** "{h1_tag}"

**Sub-heading Distribution (H2 Tags):**
{h2_list}

**Analysis**
Review the list of H2 tags above. Do they outline a logical flow of information? Do they contain secondary keywords? If the list is empty, the content may appear as a "wall of text" to Google, which is difficult to index accurately.

## 5.2 Content Quality & Gaps

**Concept Definition**
Content Gap Analysis involves comparing your existing content against that of your top competitors to identify topics you have missed.

**Market Intelligence Findings**
We analyzed the top ranking competitors for your niche.
* **Competitor Count:** {comp_count}

**Identified Content Gaps:**
The following topics are covered by your competitors but appear to be missing or under-represented on your page:
{gap_list}

**Recommendation**
To establish topical authority, we recommend expanding your content to include sections dedicated to these missing topics. This demonstrates to Google that your page is the most comprehensive resource available.

---

# 6. TECHNICAL INFRASTRUCTURE

Technical SEO refers to website and server optimizations that help search engine spiders crawl and index your site more effectively.

## 6.1 Canonicalization

**Concept Definition**
A canonical tag (rel="canonical") is a snippet of HTML code that defines the main version for duplicate, near-duplicate, and similar pages.

**Audit Findings**
* **Status:** {canonical_status}

**Analysis**
If this is "Missing," your site is at risk of duplicate content issues, especially if you use URL parameters (like tracking codes) in marketing campaigns.

## 6.2 Robots & Indexing

**Concept Definition**
The meta robots tag tells search engines whether they are allowed to index this specific page and whether they should follow the links upon it.

**Audit Findings**
* **Directives Found:** {robots_status}

## 6.3 Schema Markup

**Concept Definition**
Schema markup is code (semantic vocabulary) that you put on your website to help the search engines return more informative results for users.

**Audit Findings**
* **Status:** {schema_status}

**Analysis**
If schema is detected, it increases the likelihood of rich snippets (stars, images, FAQ boxes) appearing in search results. If missing, you are losing real estate on the results page.

---

# 7. SITE PERFORMANCE & CORE WEB VITALS

Google has officially made page speed a ranking factor. This section analyzes the Core Web Vitals, which are a set of specific factors that Google considers important in a webpage's overall user experience.

## Performance Metrics

| Metric | Value | Assessment |
| :--- | :--- | :--- |
| **Overall Performance Score** | {perf_score}/100 | General Health Indicator |
| **Largest Contentful Paint (LCP)** | {lcp}s | Measures Loading Performance |
| **Cumulative Layout Shift (CLS)** | {cls} | Measures Visual Stability |
| **Response Time** | {response_time}s | Server Latency |
| **Page Size** | {html_size_kb} KB | Code Heaviness |

## Detailed Analysis

**Largest Contentful Paint (LCP)**
LCP measures how long it takes for the largest content element (usually the hero image or main text) to become visible.
* **Your Result:** {lcp} seconds.
* **Benchmark:** Google requires this to be under 2.5 seconds.
* **Impact:** Slow LCP causes high bounce rates as users become frustrated waiting for the main content to appear.

**Optimization Opportunities**
* **JavaScript Minification Status:** {js_min_status}
* **CSS Minification Status:** {css_min_status}
* **Total Requests:** {request_count}

---

# 8. SECURITY & ACCESSIBILITY

Website security is a prerequisite for ranking. Google prioritizes the safety of its users.

## Security Audit

* **HTTPS (SSL Certificate):** {https_status}
* **Directory Listing:** {dir_listing_status}
* **Malware Status:** {malware_status}

**Analysis**
HTTPS (Hypertext Transfer Protocol Secure) is an internet communication protocol that protects the integrity and confidentiality of data between the user's computer and the site. If your status is "Insecure," browsers like Chrome will mark your site as "Not Secure," significantly hurting trust and conversion rates.

## Image Accessibility

* **Total Images:** {img_count}
* **Images Missing Alt Text:** {img_missing_alt}

**Why it Matters**
Alt text is a written description of an image. Screen readers use this to describe images to visually impaired users. Furthermore, search engines use this text to understand what the image shows, helping you rank in Google Image Search.

---

# 9. STRATEGIC ACTION PLAN

Based on the comprehensive data collected above, we have developed a prioritized roadmap. These recommendations are ordered by impact (High to Low). Executing the High Priority items will yield the fastest results.

## High Priority (Critical Fixes)
These items are likely preventing your site from ranking or causing penalty risks.

{action_plan_high}

## Medium Priority (Optimization)
These items will help improve your keyword rankings and click-through rates.

{action_plan_medium}

## Low Priority (Maintenance)
These items are best practices for long-term health.

{action_plan_low}

---
*End of Report | Generated by AI SEO Agent*
"""
from datetime import datetime

def report_node(state: AgentState) -> dict:
    """
    Fills the LONG-FORM template using data from all agents.
    """
    print(f"--- GENERATING COMPREHENSIVE REPORT FOR: {state['url']} ---")

    crawl = state.get("crawl_result", {})
    audit = state.get("technicalAuditResult", {})
    onpage = state.get("onPageResult", {})
    market = state.get("marketResearchResult", {})
    strategy = state.get("strategyResult", {})
    opt = state.get("optimizationResult", {})
    url = state.get("url")

    if crawl.get("error_message"):
        return {"messages": [SystemMessage(content=f"Report Failed: {crawl['error_message']}")]}

    def safe_get(obj, key, default="N/A"):
        if not obj: return default
        if isinstance(obj, dict): return obj.get(key, default)
        return getattr(obj, key, default)

    
    perf_score = safe_get(audit, 'performance_score', 0)
    
    title = safe_get(onpage, 'title', 'Missing')
    meta = safe_get(onpage, 'meta_description', 'Missing')
    
    headings = safe_get(onpage, 'headings', {})
    h1s = safe_get(headings, 'h1', [])
    h1_tag = h1s[0] if h1s else "No H1 Tag Found"
    
    h2s = safe_get(headings, 'h2', [])
    h2_list_str = "\n".join([f"- {h}" for h in h2s[:15]]) if h2s else "No H2 tags found."

    images = safe_get(onpage, 'images', [])
    img_missing_alt = len([i for i in images if not safe_get(i, 'alt')])
    
    core_vitals = safe_get(audit, 'core_web_vitals', {})
    lcp = safe_get(core_vitals, 'lcp', 0)
    cls = safe_get(core_vitals, 'cls', 0)
    
    kw_data = safe_get(market, 'keyword_analysis', {})
    primary_kw = safe_get(kw_data, 'primary_keyword', 'N/A')
    competitors = safe_get(market, 'competitor_urls', [])
    gaps = safe_get(safe_get(market, 'content_gap_analysis', {}), 'suggested_topics', [])
    gap_list_str = "\n".join([f"- {gap}" for gap in gaps]) if gaps else "No specific content gaps detected."

    recs = safe_get(strategy, 'recommendations', [])
    if recs and isinstance(recs[0], object) and hasattr(recs[0], 'dict'):
        recs = [r.dict() for r in recs]
        
    high_recs = [f"**{r.get('category')}:** {r.get('recommendation')} ({r.get('justification')})" for r in recs if r.get('priority', '').lower() == 'high']
    med_recs = [f"**{r.get('category')}:** {r.get('recommendation')} ({r.get('justification')})" for r in recs if r.get('priority', '').lower() == 'medium']
    low_recs = [f"**{r.get('category')}:** {r.get('recommendation')} ({r.get('justification')})" for r in recs if r.get('priority', '').lower() == 'low']

    high_str = "\n\n".join(high_recs) if high_recs else "No critical high-priority issues found."
    med_str = "\n\n".join(med_recs) if med_recs else "No medium-priority optimization suggested."
    low_str = "\n\n".join(low_recs) if low_recs else "No low-priority maintenance items."

    system_prompt = """You are a Senior Technical SEO Consultant writing a white-paper style audit report.
    
    Your goal is to populate the provided Long-Form Template.
    
    INSTRUCTIONS:
    1. **Tone:** Professional, authoritative, and educational.
    2. **Length:** Do not summarize. Write full, detailed paragraphs for the 'Analysis' sections.
    3. **Icons:** DO NOT use emojis or icons (like ✅, ❌, 💡). Use text-based status indicators (e.g., "Pass", "Fail", "Critical", "Good").
    4. **Data:** Use the Context Data provided to fill the variables.
    5. **Scorecard:**
       - 'Critical Issues': Count items where LCP > 2.5s, HTTPS is Insecure, or Title is Missing.
       - 'Good Results': Count items where Score > 80, LCP < 2.5s, Title exists.
    """

    user_message = f"""
    TARGET TEMPLATE:
    {SEO_REPORT_TEMPLATE}

    ---
    CONTEXT DATA:
    
    [METADATA]
    - URL: {url}
    - Date: {datetime.now().strftime("%B %d, %Y")}
    
    [TECHNICAL]
    - Score: {perf_score}
    - LCP: {lcp}
    - CLS: {cls}
    - HTTPS: {safe_get(audit, 'uses_https')}
    - Mobile Friendly: {safe_get(audit, 'mobile_friendly')}
    
    [ON-PAGE]
    - Title: {title}
    - Meta: {meta}
    - H1: {h1_tag}
    - H2 Count: {len(h2s)}
    - Image Count: {len(images)}
    - Missing Alt: {img_missing_alt}
    
    [MARKET]
    - Keyword: {primary_kw}
    - Competitor Count: {len(competitors)}
    - Gaps: {gap_list_str}
    
    [STRATEGY STRINGS]
    High Priority: {high_str}
    Medium Priority: {med_str}
    Low Priority: {low_str}
    """

    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2)
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message)
    ])

    return {"messages": [response]}