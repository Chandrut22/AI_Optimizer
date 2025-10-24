# ---- Base Stage ----
FROM python:3.12-slim as base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1

# ---- Builder Stage ----
FROM base as builder
RUN --mount=type=cache,target=/root/.pip pip install pipx
RUN pipx install uv
ENV PATH="/root/.local/bin:${PATH}"
WORKDIR /app
COPY pyproject.toml uv.lock* ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --locked

# ---- Final Stage ----
FROM base as final
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid 1001 --create-home --shell /bin/bash appuser

WORKDIR /home/appuser/app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
# *** FIX: Copy app code into the 'app' directory, matching the uvicorn command ***
COPY --chown=appuser:appgroup ./app ./app

USER appuser
EXPOSE 8000 

# *** FIX: Use python -m uvicorn and ensure port consistency ***
# Use the PORT variable Render provides, fall back to 8000 if not set.
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
# Removed old CMD: ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]