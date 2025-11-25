from langgraph.graph import START,END,StateGraph
from app.agent.node.node import *

workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("crawler", crawl_node)
workflow.add_node("auditor", technical_audit_node) # Can run parallel to Crawler
workflow.add_node("onpage_analyzer", onpage_analyzer_node)
workflow.add_node("market_researcher", market_research_node)
workflow.add_node("strategist", strategy_node)
workflow.add_node("optimizer", optimization_node)
workflow.add_node("reporter", report_node)


# Define Edges
workflow.add_edge(START, "auditor")
workflow.add_edge(START, "crawler")
workflow.add_edge("crawler", "onpage_analyzer")
workflow.add_edge("onpage_analyzer", "market_researcher")
workflow.add_edge("auditor", "reporter")
workflow.add_edge("market_researcher", "strategist")
workflow.add_edge("strategist", "optimizer")
workflow.add_edge("optimizer", "reporter")
workflow.add_edge("reporter", END)

app = workflow.compile()

if __name__ == "__main__":
    
    # Define the initial state
    initial_state = {
        "url": "https://www.greenstechnologys.com/", 
    }

    print("--- STARTING SEO AGENT ---")
    
    # Stream the output
    for event in app.stream(initial_state):
        for key, value in event.items():
            print(f"\nFinished Node: {key}")
            
            # 1. Handle Final Report
            if key == "reporter":
                print("\n" + "="*40)
                print("FINAL GEMINI REPORT")
                print("="*40 + "\n")
                # access messages safely
                msgs = value.get("messages", [])
                if msgs:
                    print(msgs[-1].content)

            # 2. Handle Strategy Plan (FIXED)
            if key == "strategist":
                print("\n" + "="*40)
                print("STRATEGIC ACTION PLAN")
                print("="*40)
                
                data = value["strategyResult"]
                
                # Helper to get recommendations list whether data is Dict or Pydantic Object
                if isinstance(data, dict):
                    recs = data.get("recommendations", [])
                else:
                    # If it's still a Pydantic object, use getattr
                    recs = getattr(data, "recommendations", [])
                    # If recommendations inside are also objects, convert to dict for printing
                    if recs and not isinstance(recs[0], dict) and hasattr(recs[0], 'dict'):
                         recs = [r.dict() for r in recs]

                for i, rec in enumerate(recs, 1):
                    # handle accessing keys
                    prio = rec.get('priority', 'N/A').upper()
                    cat = rec.get('category', 'General')
                    text = rec.get('recommendation', 'No text')
                    print(f"{i}. [{prio}] {cat}: {text}")