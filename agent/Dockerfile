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

# *** FIX: Use uv sync --locked for strict reproducibility ***
RUN --mount=type=cache,target=/root/.cache/uv uv sync --system --locked
# Removed: uv pip install . --system --frozen

# ---- Final Stage ----
FROM base as final

RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid 1001 --create-home --shell /bin/bash appuser

WORKDIR /home/appuser/app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --chown=appuser:appgroup ./app ./app
# COPY --chown=appuser:appgroup .env ./.env

USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]