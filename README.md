
# AI Optimizer

## 1. Project Overview

**AI Optimizer** is a comprehensive, full-stack automated SEO analysis platform designed to help users audit websites, identify performance bottlenecks, and generate AI-driven strategies for ranking improvement.

Unlike traditional SEO tools that just list errors, this system uses a **multi-agent AI architecture** to simulate a team of SEO experts—performing technical audits, market research, and content optimization strategies in real-time.

---

## 2. System Architecture

The project follows a modern microservices architecture, ensuring separation of concerns between the user interface, data management, and the AI computation layer.

### High-Level Architecture

* **Frontend**: A responsive Single Page Application (SPA) for user interaction.
* **Backend (Auth & Data)**: A robust REST API for managing identities, scan history, and usage limits.
* **Agent Service (AI Core)**: A dedicated service running a LangGraph workflow to perform heavy-duty scraping and analysis.
* **Infrastructure**: Dockerized environment with PostgreSQL for data persistence and Prometheus/Grafana for observability.

### Technology Stack

| Component               | Framework / Tool | Key Features                                            |
| :---------------------- | :--------------- | :------------------------------------------------------ |
| **Frontend**      | React + Vite     | Tailwind CSS, Shadcn UI, React Query, Axios             |
| **Backend**       | Java Spring Boot | Spring Security (OAuth2/JWT), Hibernate/JPA, PostgreSQL |
| **Agent Service** | Python FastAPI   | LangGraph, LangChain, Firecrawl, Google GenAI          |
| **DevOps**        | Docker           | Docker Compose                                          |

---

## 3. Component Services

### A. Frontend Service (`/frontend`)

The user-facing dashboard built with **React** and **Vite**.

* **Responsibilities**:
  * User Authentication (Login, Register, Google OAuth).
  * Dashboard for viewing historical scans.
  * **Results Page**: Visualizes complex SEO data using scorecards, metrics grids, and renders the AI's markdown report.

### B. Backend Service (`/backend`)

The central control plane built with **Spring Boot 3.5.6**.

* **Responsibilities**:
  * **Security**: Issues and validates JWTs (RS256); handles Google OAuth2 flows.
  * **Data Management**: Stores user profiles and scan history in PostgreSQL.
  * **Rate Limiting**: Tracks user usage to prevent abuse.
  * **Observability**: Exposes metrics for Prometheus monitoring.

### C. Agent Service (`/agent`)

The intelligence layer built with **FastAPI** and **LangGraph**.

* **Responsibilities**:
  * Validates user tokens against the Backend before processing.
  * **Orchestration**: Runs a directed graph of AI agents to analyze the target URL.
  * **Capabilities**: Web crawling (Playwright), Technical Auditing (PageSpeed), and Semantic Analysis (LLMs).

---

## 4. Workflow

### User Interaction Flow

1. **Authentication**: User logs in via the Frontend. The Backend issues a JWT stored in a secure cookie/storage.
2. **Scan Request**: User submits a URL on the Dashboard.
3. **Validation**:
   * The Agent service receives the request.
   * It calls the Backend to verify the user's token and check if they have remaining scan credits.
4. **Execution**: Once validated, the Agent Service triggers the Multi-Agent Workflow.
5. **Result**: The JSON report is returned to the Frontend for rendering, and the scan summary is saved to the Backend history.

### AI Multi-Agent Workflow

The AI analysis is managed by **LangGraph**, which coordinates specialized nodes:

1. **Crawler Node**: Fetches the raw HTML and metadata of the target website.
2. **Auditor Node** *(Parallel)*: Runs technical checks (Core Web Vitals, SSL, mobile friendliness).
3. **On-Page Analyzer**: Evaluates content quality, keyword usage, and meta tags.
4. **Market Researcher**: Analyzes the website's niche and competitors.
5. **Strategist**: Synthesizes findings into a high-level SEO strategy.
6. **Optimizer**: Generates specific, actionable recommendations.
7. **Reporter**: Compiles everything into a comprehensive Markdown report.
