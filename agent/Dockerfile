# -----------------------------
# Stage 1: Base image
# -----------------------------
FROM python:3.10-slim-buster

# Prevent Python from writing .pyc files & enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

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
COPY app ./app

# Create logs directory
RUN mkdir -p /app/logs && chown -R root:root /app/logs

# -----------------------------
# Expose port for FastAPI
# -----------------------------
EXPOSE 8000

# -----------------------------
# Run FastAPI app with Render's $PORT
# -----------------------------
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
