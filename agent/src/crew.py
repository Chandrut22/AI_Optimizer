from crewai import Crew, Process
from crewai.project import CrewBase, agent, task, crew
from agents import CustomAgents
from tasks import CustomTasks

@CrewBase
class SEOAuditCrew:
    def __init__(self):
        self.agents_provider = CustomAgents()
        self.tasks_provider = CustomTasks(self.seo_optimizer_agent())

    @agent
    def seo_optimizer_agent(self):
        return self.agents_provider.seo_optimizer_agent()

    @task
    def summarize(self):
        return self.tasks_provider.summarize_seo_report()

    @task
    def recommend(self):
        return self.tasks_provider.recommend_seo_improvements()

    @crew
    def crew(self):
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )
