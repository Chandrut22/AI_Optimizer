# app/agent/agent.py
from langgraph.graph import START, END, StateGraph
# Explicitly import only what is needed to avoid circular dependency issues
from app.agent.node.node import (
    AgentState,
    crawl_node,
    technical_audit_node,
    onpage_analyzer_node,
    market_research_node,
    strategy_node,
    optimization_node,
    report_node
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

        # --- Add Nodes ---
        workflow.add_node("crawler", crawl_node)
        workflow.add_node("auditor", technical_audit_node)
        workflow.add_node("onpage_analyzer", onpage_analyzer_node)
        workflow.add_node("market_researcher", market_research_node)
        workflow.add_node("strategist", strategy_node)
        workflow.add_node("optimizer", optimization_node)
        workflow.add_node("reporter", report_node)

        # --- Define Edges ---
        
        # 1. Technical Audit Branch (Parallel)
        # Runs independently and updates state; does not block the main flow.
        workflow.add_edge(START, "auditor")
        workflow.add_edge("auditor", END) 

        # 2. Main Content & Strategy Pipeline
        # Crawler -> OnPage -> Research -> Strategy -> Optimization -> Reporting
        workflow.add_edge(START, "crawler")
        workflow.add_edge("crawler", "onpage_analyzer")
        workflow.add_edge("onpage_analyzer", "market_researcher")
        workflow.add_edge("market_researcher", "strategist")
        workflow.add_edge("strategist", "optimizer")
        workflow.add_edge("optimizer", "reporter")
        workflow.add_edge("reporter", END)

        return workflow.compile()

    async def run(self):
        """
        Executes the graph asynchronously and returns the final state dictionary.
        """
        initial_state = {
            "url": self.url,
            "messages": []
        }
        
        # ainvoke runs the graph to completion
        result = await self.app.ainvoke(initial_state)
        
        return result