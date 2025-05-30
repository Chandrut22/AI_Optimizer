from crew import SEOAuditCrew

if __name__ == '__main__':
    print("SEO Optimizer AI Agent")
    website_url = input("Enter the website URL: ").strip()

    crew = SEOAuditCrew().crew()
    result = crew.kickoff(inputs={'website_url': website_url})
    print("\n\nSEO Analysis Result:\n")
    print(result)
