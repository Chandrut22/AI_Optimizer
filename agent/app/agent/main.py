from langgraph.graph import START, END, StateGraph
from app.agent.node.node import (
    AgentState,
    call_firecrawl,
    call_technical_auditor, 
    call_crawling_auditor,
    call_on_page_analyzer,
    call_market_researcher,
    call_seo_strategist,
    call_seo_optimizer,
    call_report_generator
)

class MainAgent:
    def __init__(self, url: str):
        self.url = url
        self.app = self._build_graph()

    def _build_graph(self):
        """
        Constructs the StateGraph with correct nodes and edges.
        """
        workflow = StateGraph(AgentState)

        # Add Nodes
        workflow.add_node("web_crawler", call_firecrawl)
        workflow.add_node("technical_auditor", call_technical_auditor)
        workflow.add_node("crawling_auditor", call_crawling_auditor)
        workflow.add_node("on_page_analyzer", call_on_page_analyzer)
        workflow.add_node("market_researcher", call_market_researcher)
        workflow.add_node("seo_strategist", call_seo_strategist)
        workflow.add_node("seo_optimizer", call_seo_optimizer)
        workflow.add_node("report_generator", call_report_generator)

        # Define Edges
        # Parallel start: Crawler and Technical Auditor run at the same time
        workflow.add_edge(START, "web_crawler")
        workflow.add_edge(START, "technical_auditor")
        
        # Crawler feeds into Crawling Auditor and On-Page Analyzer
        workflow.add_edge("web_crawler", "crawling_auditor")
        workflow.add_edge("web_crawler", "on_page_analyzer")
        
        # Feed all data into Market Researcher
        workflow.add_edge("technical_auditor", "market_researcher")
        workflow.add_edge("crawling_auditor", "market_researcher")
        workflow.add_edge("on_page_analyzer", "market_researcher")
        
        # Strategy -> Optimization -> Reporting
        workflow.add_edge("market_researcher", "seo_strategist")
        workflow.add_edge("seo_strategist", "seo_optimizer")
        workflow.add_edge("seo_optimizer", "report_generator")
        workflow.add_edge("report_generator", END)

        return workflow.compile()

    async def run(self):
        """
        Executes the graph asynchronously and returns the final state dictionary.
        """
        initial_state = {
            "url": self.url,
            "messages": []
        }
        
        result = await self.app.ainvoke(initial_state)
        
        return result
    
# ... (Previous code in agent/app/agent/main.py) ...

# if __name__ == "__main__":
#     import asyncio
#     import json

#     async def main():
#         # 1. Define a test URL
#         test_url = "https://ai-optimizer-beta.vercel.app/" 
        
#         print(f"Starting test for URL: {test_url}")
        
#         # 2. Initialize the Agent
#         agent = MainAgent(url=test_url)
        
#         # 3. Run the Agent
#         try:
#             result = await agent.run()
            
#             # 4. Print the result (pretty-printed)
#             print("\n--- FINAL AGENT STATE ---\n")
#             # We convert to string with default=str to handle objects that aren't natively JSON serializable
#             print(json.dumps(result, indent=2, default=str))
            
#             # Check for specific keys if needed
#             if "final_report" in result:
#                 print("\n--- FINAL REPORT ---\n")
#                 print(result["final_report"])
                
#         except Exception as e:
#             print(f"\nAn error occurred during execution: {e}")

#     # Run the async main function
#     asyncio.run(main())