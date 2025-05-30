from crewai import Agent
from textwrap import dedent
from dotenv import load_dotenv
from crewai_tools import ScrapeWebsiteTool, WebsiteSearchTool
from crewai import LLM
load_dotenv()


class CustomAgents:
    def __init__(self):
        self.llm = LLM(
            model="gemini/gemini-2.0-flash",
            temperature=0.7,
        )

    def seo_optimizer_agent(self):
        return Agent(
            role="SEO Optimization Specialist",
            goal=dedent("""
                Analyze website SEO audit reports and provide a clear, prioritized action plan to boost performance.
            """),
            backstory=dedent("""
                You are an elite SEO expert with deep experience in both on-page and technical SEO.
                You help developers, marketers, and business owners understand where their site stands,
                and how to rank higher in Google using actionable, white-hat techniques.
            """),
            allow_delegation=False,
            verbose=True,
            llm=self.llm,
            tools=[
                ScrapeWebsiteTool(), 
                # WebsiteSearchTool()
            ]  
        )
