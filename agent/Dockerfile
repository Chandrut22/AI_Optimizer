# -----------------------------
# Stage 1: Base image
# -----------------------------
FROM python:3.10-slim-buster

# Prevent Python from writing .pyc files & enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set working directory
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
# Install dependencies system-wide
# -----------------------------
RUN uv pip install --system --no-cache-dir .

# -----------------------------
# Copy application source
# -----------------------------
COPY ./app ./app

# Create logs directory
RUN mkdir -p /app/logs

# -----------------------------
# Create a non-root user for security
# -----------------------------
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# -----------------------------
# Expose port for FastAPI
# -----------------------------
EXPOSE 8000

# -----------------------------
# Run FastAPI app (Render sets $PORT automatically)
# -----------------------------
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
