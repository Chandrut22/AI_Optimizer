# ---- Base Stage ----
FROM python:3.12-slim AS base

# Prevent Python from writing .pyc files and keep output unbuffered
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1

# ---- Builder Stage ----
FROM base AS builder

# Install pipx and uv for reproducible builds
RUN --mount=type=cache,target=/root/.pip pip install pipx
RUN pipx install uv

# Add pipx binary directory to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Set working directory for dependency installation
WORKDIR /app

# Copy dependency files for caching
COPY pyproject.toml uv.lock* ./

# Install dependencies using uv (fast, locked dependency management)
RUN --mount=type=cache,target=/root/.cache/uv uv sync --locked

# ---- Final Stage ----
FROM base AS final

# Create non-root user and group
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid 1001 --create-home --shell /bin/bash appuser

# Set working directory for the application
WORKDIR /home/appuser/app

# Copy Python dependencies (packages + executables)
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy your app code (keep folder structure as 'app/')
COPY --chown=appuser:appgroup ./app ./app

# Switch to non-root user
USER appuser

# Expose app port (Render will set PORT automatically)
EXPOSE 8000

# Start the app using uvicorn with Python -m for reliability
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
