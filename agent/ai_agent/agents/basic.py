import os
from typing import TypedDict, List, Dict, Any
from firecrawl import FirecrawlApp
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END


# --- 1. Define the State (Internal Use) ---
class SEOReportState(TypedDict):
    url: str
    target_keywords: List[str]
    page_content: str
    metadata: Dict[str, Any]
    analysis: Dict[str, Any]
    title_suggestion: str
    meta_suggestion: str
    internal_link_suggestions: List[str]
    final_report: str


# --- 2. Define the Nodes (Internal Workers) ---

def scrape_site_node(state: SEOReportState) -> Dict[str, Any]:
    url = state["url"]
    app = FirecrawlApp(api_key=os.environ["FIRECRAWL_API_KEY"])
    scraped_data = app.scrape_url(url)

    if not scraped_data:
        raise ValueError("⚠️ Could not scrape the website. Please check the URL.")

    return {
        "page_content": scraped_data["markdown"],
        "metadata": scraped_data["metadata"]
    }


def analyze_content_node(state: SEOReportState) -> Dict[str, Any]:
    metadata = state["metadata"]
    keywords = state["target_keywords"]

    title = metadata.get("title", "")
    meta_desc = metadata.get("description", "")
    h1_tags = metadata.get("h1", [])
    all_links = metadata.get("links", [])

    domain = state["url"].split('//')[-1].split('/')[0]
    internal_links = [link for link in all_links if domain in link]

    return {
        "analysis": {
            "title_length_ok": len(title) <= 60,
            "meta_desc_length_ok": len(meta_desc) <= 160,
            "keywords_in_title": any(k.lower() in title.lower() for k in keywords),
            "keywords_in_meta": any(k.lower() in meta_desc.lower() for k in keywords),
            "h1_tag_present": len(h1_tags) > 0,
            "internal_links_count": len(internal_links),
            "internal_links_low": len(internal_links) < 5,
        }
    }


def suggest_title_and_meta_node(state: SEOReportState) -> Dict[str, str]:
    analysis = state["analysis"]
    if analysis.get("keywords_in_title") and analysis.get("keywords_in_meta"):
        return {}

    page_content = state["page_content"]
    keywords = state["target_keywords"]

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro-latest", temperature=0.7)

    prompt = f"""
    You are an expert SEO copywriter.
    Suggest an improved SEO title and meta description based on this page and keywords.

    Rules:
    - Title ≤ 60 characters
    - Meta ≤ 160 characters
    - Must naturally include at least one target keyword.

    Keywords: {', '.join(keywords)}

    Content Snippet:
    "{page_content[:1000]}..."
    """

    response = llm.invoke(prompt)
    content = response.content

    try:
        title = content.split("Title:")[1].split("Meta:")[0].strip()
        meta = content.split("Meta:")[1].strip()
        return {"title_suggestion": title, "meta_suggestion": meta}
    except Exception:
        return {"title_suggestion": "N/A", "meta_suggestion": "N/A"}


def suggest_internal_links_node(state: SEOReportState) -> Dict[str, List[str]]:
    if not state["analysis"].get("internal_links_low"):
        return {}

    page_content = state["page_content"]
    mock_site_pages = [
        {"url": "/features", "title": "Explore Our Features"},
        {"url": "/pricing", "title": "View Our Pricing Plans"},
        {"url": "/blog/customer-stories", "title": "Customer Success Stories"},
    ]

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro-latest", temperature=0.7)

    prompt = f"""
    You are an SEO strategist.
    Suggest 2-3 natural internal links for this page content.

    Pages available to link:
    {mock_site_pages}

    Page Content:
    "{page_content[:1200]}..."

    Format:
    1. Anchor Text: "..." → Link: "..."
    """

    response = llm.invoke(prompt)
    return {"internal_link_suggestions": response.content.splitlines()}


def compile_report_node(state: SEOReportState) -> Dict[str, str]:
    report = []
    report.append(f"### SEO Optimization Report for {state['url']}")

    if state.get("title_suggestion") or state.get("meta_suggestion"):
        report.append("\n**🔹 Title & Meta Suggestions**")
        report.append(f"- Suggested Title: {state.get('title_suggestion', 'No changes needed.')}")
        report.append(f"- Suggested Meta: {state.get('meta_suggestion', 'No changes needed.')}")

    if state.get("internal_link_suggestions"):
        report.append("\n**🔹 Internal Linking Opportunities**")
        for suggestion in state["internal_link_suggestions"]:
            report.append(f"- {suggestion}")

    if not (state.get("title_suggestion") or state.get("internal_link_suggestions")):
        report.append("\n✅ No major SEO issues found. The page is well optimized!")

    return {"final_report": "\n".join(report)}


# --- 3. Build the Graph ---
workflow = StateGraph(SEOReportState)
workflow.add_node("scrape_site", scrape_site_node)
workflow.add_node("analyze_content", analyze_content_node)
workflow.add_node("suggest_title_and_meta", suggest_title_and_meta_node)
workflow.add_node("suggest_internal_links", suggest_internal_links_node)
workflow.add_node("compile_report", compile_report_node)

workflow.set_entry_point("scrape_site")
workflow.add_edge("scrape_site", "analyze_content")
workflow.add_edge("analyze_content", "suggest_title_and_meta")
workflow.add_edge("suggest_title_and_meta", "suggest_internal_links")
workflow.add_edge("suggest_internal_links", "compile_report")
workflow.add_edge("compile_report", END)

app = workflow.compile()


# --- 4. Run for the User ---
def run_seo_optimizer(url: str, keywords: List[str]):
    """
    User-facing function: enter a URL + target keywords,
    get a clean SEO report.
    """
    result = app.invoke({"url": url, "target_keywords": keywords})
    print(result["final_report"])
    return result["final_report"]


# Example run
if __name__ == "__main__":
    run_seo_optimizer(
        url="https://langchain.com/",
        keywords=["AI agent", "developer framework"]
    )
