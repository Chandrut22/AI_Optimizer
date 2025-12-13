# AI Optimizer Agent Service

The **Agent Service** is a high-performance Python application built with **FastAPI**. It serves as the intelligent core of the AI Optimizer platform, responsible for executing deep SEO analysis using a multi-agent AI system. It also acts as a Resource Server, validating JWTs issued by the Spring Boot Authentication Server.

## 🚀 Tech Stack

* **Framework:** FastAPI
* **Runtime:** Python 3.10+
* **AI & Agents:** LangGraph, LangChain, Google GenAI, Tavily, Firecrawl
* **Web Automation:** Playwright
* **Package Manager:** uv
* **Server:** Uvicorn (ASGI)

## ✨ Key Features

* **Multi-Agent SEO Analysis:** Autonomously crawls websites, audits content, and generates optimization strategies.
* **Secure Resource Server:** Validates RSA-signed JWTs (Access Tokens) from the Spring Boot backend.
* **Usage Tracking:** Verifies user limits with the backend before performing expensive AI operations.
* **Asynchronous Architecture:** Built on `asyncio` and `aiohttp` for non-blocking IO operations.

## 📊 Multi-Agent Workflow

The Agent Service orchestrates a sophisticated LangGraph-based workflow that coordinates multiple specialized AI agents to analyze websites comprehensively:

![LangGraph Workflow Architecture](../docs/langgraph-workflow.png)

**Workflow Nodes:**

- **web_crawler**: Fetches raw HTML and page metadata from the target URL
- **crawling_auditor**: Analyzes crawlability and indexation issues
- **on_page_analyzer**: Evaluates content, keywords, and meta tags
- **technical_auditor**: Runs Core Web Vitals and technical health checks
- **market_researcher**: Analyzes competitors and market positioning
- **seo_strategist**: Synthesizes findings into actionable strategy
- **seo_optimizer**: Generates specific optimization recommendations
- **report_generator**: Compiles comprehensive analysis into JSON report

## ⚙️ Configuration

The application is configured using environment variables. Create a `.env` file in the root directory based on the example below:

**Required Variables:**

| Variable                     | Description                                                        |
| :--------------------------- | :----------------------------------------------------------------- |
| `SPRING_BOOT_INTERNAL_URL` | Base URL of the Spring Boot backend (e.g.,`http://backend:8080`) |
| `ACTIVATION_PUBLIC_KEY`    | RSA Public Key (PEM format) to verify JWT signatures               |
| `PAGESPEED_API_KEY`        | Google PageSpeed Insights API Key                                  |
| `GOOGLE_API_KEY`           | API Key for Google Gemini (GenAI)                                  |
| `TAVILY_API_KEY`           | API Key for Tavily Search                                          |
| `FIRECRAWL_API_KEY`        | API Key for Firecrawl                                              |

**Optional / Default Variables:**

| Variable                 | Description                                      | Default   |
| :----------------------- | :----------------------------------------------- | :-------- |
| `ACTIVATION_ALGORITHM` | JWT signing algorithm                            | `RS256` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins | `[]`    |
| `DEBUG`                | Enable debug mode and routes                     | `False` |
| `LOG_LEVEL`            | Logging verbosity (INFO, DEBUG, ERROR)           | `INFO`  |

*Reference: `app/core/config.py`*

## 🛠️ Installation & Running

### Option 1: Using Docker (Recommended)

The project includes a `Dockerfile` optimized with `uv` for fast dependency installation.

1. **Build the Image:**

   ```bash
   docker build -t ai-optimizer-agent .
   ```
2. **Run the Container:**

   ```bash
   docker run -p 8000:8000 --env-file .env ai-optimizer-agent
   ```

### Option 2: Local Development

This project uses `uv` for modern Python package management, but standard `pip` works as well.

1. **Install `uv` (Optional but recommended):**

   ```bash
   pip install uv
   ```
2. **Install Dependencies:**

   ```bash
   # Using uv (faster)
   uv pip install --system .

   # OR using standard pip
   pip install .
   ```
3. **Start the Server:**

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## 🔌 API Endpoints

### Core Capabilities

| Method   | Endpoint                        | Description                                                                                                     |
| :------- | :------------------------------ | :-------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/agent/run-seo-analysis` | **Main Endpoint.** Triggers the multi-agent system to audit a specific URL. Requires valid JWT and quota. |
| `GET`  | `/api/service`                | Test endpoint to validate your JWT token and see extracted scopes.                                              |

### Utility & Health

| Method  | Endpoint           | Description                                                        |
| :------ | :----------------- | :----------------------------------------------------------------- |
| `GET` | `/health`        | Health check probe for orchestrators (k8s/docker).                 |
| `GET` | `/debug/cookies` | Inspect incoming request cookies (Enabled only if `DEBUG=True`). |

## 🏗️ Architecture Note

This service is designed to work in tandem with the Spring Boot Backend.

1. **Frontend** gets an Access Token from Spring Boot.
2. **Frontend** sends the Token + Target URL to this **Agent Service**.
3. **Agent Service** validates the Token signature using the Public Key.
4. **Agent Service** calls back to Spring Boot to check if the user has remaining scan credits.
5. If authorized, the **AI Agents** run the analysis and return the result.
