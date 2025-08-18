FROM python:3.10-slim-buster

# Set working directory
WORKDIR /app

# Install uv (modern package/dependency manager)
RUN pip install uv

# Create virtual environment with uv
RUN uv venv .venv

# Ensure venv is on PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy dependency files first (for caching)
COPY pyproject.toml uv.lock ./

# Install dependencies inside the venv
RUN uv pip install --no-cache-dir .

# Copy the rest of the source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI app (correct import path)
CMD ["uvicorn", "agent.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
