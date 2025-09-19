import os
from typing import Literal
from IPython.display import Image, display
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_core.tools import tool

# Load environment variables from .env
load_dotenv()
# -- DuckDuckGo import: try a resilient import (API exposed via langchain_community) --
try:
    # Common convenience import
    from langchain_community.tools import DuckDuckGoSearchResults
except Exception:
    # Fallback to the direct module path if package layout differs
    from langchain_community.tools.ddg_search.tool import DuckDuckGoSearchResults

# (DuckDuckGoSearchResults docs / API reference). :contentReference[oaicite:1]{index=1}
os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")
# ----------------------------
# Config / LLM
# ----------------------------
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")  # a free/light-weight Gemini model

# ----------------------------
# Tools
# ----------------------------

# 1) local SEO optimizer tool (simple deterministic function for demonstration)
@tool
def seo_optimizer_tool(query: str) -> str:
    """
    Optimize a user request (site URL or SEO question) into a search-friendly query and a short justification.
    """
    raw = query.strip()
    # Very simple heuristic example — in production you'd call a more sophisticated function
    optimized = f"{raw} latest research {2025} actionable keywords"
    justification = (
        "Added 'latest research 2025' for freshness; included 'actionable keywords' to "
        "encourage result pages that provide practical, implementable SEO tips."
    )
    # Return a clearly-parsable block (LLM will receive this as a tool observation)
    return f"Optimized Query: {optimized}\nJustification: {justification}"

# 2) DuckDuckGo web search tool (langchain_community)
ddg_search = DuckDuckGoSearchResults(max_results=5)

# Map by name so the tool_node can execute dynamically
tools = {
    "seo_optimizer_tool": seo_optimizer_tool,
    "web_search": ddg_search,  # runnable/BaseTool-like object
}


# Bind tools to the LLM so the model knows their schemas (API may be beta/stable per provider)
llm_with_tools = llm.bind_tools(list(tools.values()))

# ----------------------------
# Nodes
# ----------------------------
def llm_call(state: MessagesState):
    """
    The LLM runs and may call tools. We seed the LLM with the 'SEO Optimization Agent'
    instructions (system prompt uses the user's role/goal/instructions).
    """
    system_prompt = SystemMessage(
        content=(
            "role=\"SEO Optimization Assistant\",\n"
            "goal=\"Optimize websites for better search engine ranking and increased organic traffic.\",\n"
            "instructions=\"\"\"\n"
            "You are an SEO Optimization Agent.\n\n"
            "Given a website URL or specific SEO-related question, provide a comprehensive SEO analysis and improvement suggestions.\n"
            "Steps (must be followed in this order):\n"
            "1) Call the 'seo_optimizer_tool' tool with the user's raw request to produce an optimized search query + justification.\n"
            "2) Call the 'web_search' tool with the optimized query to gather recent references and examples.\n"
            "3) Produce a final SEO plan in Markdown covering: Keyword Research, On-Page, Off-Page, Technical SEO, Content Strategy.\n\n"
            "Use the DuckDuckGo tool for research to improve suggestions when needed. Ask for more details if required.\n"
            "Provide step-by-step recommendations in markdown-friendly format.\n"
            "\"\"\""
        )
    )

    # combine system prompt + conversation messages from state
    prompt_messages = [system_prompt] + state["messages"]
    return {"messages": [llm_with_tools.invoke(prompt_messages)]}


def tool_node(state: dict):
    """
    Executes tools requested by the LLM's last message.
    Supports both local functions and runnable tools (DuckDuckGoSearchResults).
    """
    result = []
    last_msg = state["messages"][-1]
    for tool_call in getattr(last_msg, "tool_calls", []):
        name = tool_call["name"]
        args = tool_call.get("args", {})
        tool_to_run = tools.get(name)

        if tool_to_run:
            try:
                # For runnable tools like DuckDuckGoSearchResults, invoke with the arguments dictionary
                if hasattr(tool_to_run, "invoke"):
                     observation = tool_to_run.invoke(args)
                # For simple callable functions, pass the arguments dictionary
                elif callable(tool_to_run):
                    observation = tool_to_run(args)
                else:
                    observation = f"Error: Tool '{name}' is not callable or runnable."
            except Exception as e:
                observation = f"Error executing tool '{name}': {e}"
        else:
            observation = f"Error: Tool '{name}' not found."

        # Wrap the observation as a ToolMessage so the LLM can read it in the next step
        result.append(ToolMessage(content=str(observation), tool_call_id=tool_call.get("id")))
    return {"messages": result}


# ----------------------------
# Conditional edge
# ----------------------------
def should_continue(state: MessagesState) -> Literal["Action", END]:
    """
    If the LLM asked to call a tool, route to 'environment' node (Action),
    otherwise finish the graph and return the final answer.
    """
    last_message = state["messages"][-1]
    if getattr(last_message, "tool_calls", None):
        return "Action"
    return END


# ----------------------------
# Build & compile graph
# ----------------------------
agent_builder = StateGraph(MessagesState)
agent_builder.add_node("llm_call", llm_call)
agent_builder.add_node("environment", tool_node)

agent_builder.add_edge(START, "llm_call")
agent_builder.add_conditional_edges(
    "llm_call",
    should_continue,
    {"Action": "environment", END: END}
)
agent_builder.add_edge("environment", "llm_call")

agent = agent_builder.compile()

# Visualize (optional)
try:
    display(Image(agent.get_graph(xray=True).draw_mermaid_png()))
except Exception:
    pass

# ----------------------------
# Example run
# ----------------------------
sample = HumanMessage(content="Analyze https://chandru22.vercel.app/ and suggest SEO improvements focusing on technical SEO and content.")
response_state = agent.invoke({"messages": [sample]})

# Print each message returned in the final state (tool outputs + LLM final message)
for m in response_state["messages"]:
    try:
        m.pretty_print()
    except Exception:
        print(str(m))