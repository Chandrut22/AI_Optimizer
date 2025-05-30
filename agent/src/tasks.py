from crewai import Task
from textwrap import dedent

class CustomTasks:
    def __init__(self, agent):
        self.agent = agent

    def summarize_seo_report(self):
        return Task(
            description=dedent("""
                Analyze the provided SEO audit report from AIOSEO for the website: {website_url}.
                Identify strengths and weaknesses based on the report, particularly focusing on:
                - Page Title & Meta Description
                - Heading structure (H1/H2/H3)
                - Link strategy (internal/external)
                - Mobile optimization
                - Robots.txt and sitemap
                - Open Graph and Schema tags
                - Performance (HTML size, JS/CSS minification, server requests)
                - Security (HTTPS, directory listing)

                Your goal is to explain this in simple terms so any non-technical site owner can understand it.
            """),
            expected_output=dedent("""
                A clear, bullet-point SEO summary of the website's current status, highlighting:
                - What is working well
                - What’s missing or poorly implemented
                - Any critical technical issues
            """),
            agent=self.agent
        )

    def recommend_seo_improvements(self):
        return Task(
            description=dedent("""
                Based on the weaknesses found in the SEO audit report of {website_url}, provide a full SEO improvement plan.
                Your answer must include:
                - Actionable suggestions to fix missing or poor areas (metadata, structure, performance, etc.)
                - Technical fixes for canonical URLs, schema markup, image optimization, etc.
                - A list of high-priority items to fix first
            """),
            expected_output=dedent("""
                An SEO recommendation document structured in sections (e.g., Metadata, Structure, Performance, Technical SEO).
                Each section must have:
                - Problem
                - Why it matters
                - Clear steps to fix it
            """),
            agent=self.agent
        )
