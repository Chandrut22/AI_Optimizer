# -----------------------------
# Stage 1: Base image
# -----------------------------
FROM python:3.10-slim-buster

# Prevent Python from writing .pyc files & enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# --- 1. (NEW) Install system dependencies for Playwright ---
# These are required for the headless browser to run
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxshmfence1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# -----------------------------
# Install uv package manager
# -----------------------------
RUN pip install --no-cache-dir --upgrade pip uv

# -----------------------------
# Copy dependency files
# -----------------------------
COPY pyproject.toml uv.lock ./

# -----------------------------
# Install dependencies
# -----------------------------
# Use uv pip install based on pyproject.toml
RUN uv pip install --system --no-cache-dir -r pyproject.toml

# --- 2. (NEW) Install the browser binaries ---
RUN playwright install chromium

# -----------------------------
# Copy application source
# -----------------------------
COPY app ./app

# Create logs directory
RUN mkdir -p /app/logs && chown -R root:root /app/logs

# -----------------------------
# Expose port
# -----------------------------
# Use $PORT which is standard for Render/Koyeb, default to 8000
EXPOSE 8000

# -----------------------------
# Run FastAPI app
# -----------------------------
# Use $PORT environment variable, default to 8000 if not set
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]