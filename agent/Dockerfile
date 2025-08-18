FROM python:3.10-slim-buster

# set working directory
WORKDIR /app

# Install uv
RUN pip install uv

# Create virtual environment with uv
RUN uv venv .venv

# Ensure venv is on PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy dependency files first (for caching)
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv pip install --no-cache-dir .

# Copy rest of the project
COPY . .

# Expose port for FastAPI
EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "agent.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
