# Use slim Python base image
FROM python:3.10-slim-buster

# Avoid Python writing .pyc files and force stdout flushing
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install uv (Astral package manager)
RUN pip install --no-cache-dir uv

# Copy dependency files first (for better caching)
COPY pyproject.toml uv.lock ./

# Install dependencies system-wide with uv
RUN uv pip install --system --no-cache-dir -r uv.lock

# Copy application source
COPY . .

# Ensure app is on PYTHONPATH
ENV PYTHONPATH=/app

# Expose default port
EXPOSE 8000

# Use Render-provided PORT environment variable if available
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
