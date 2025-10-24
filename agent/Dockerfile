# ---- Base Stage ----
FROM python:3.12-slim as base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1

# ---- Builder Stage ----
FROM base as builder

# Install uv using pipx
RUN --mount=type=cache,target=/root/.pip pip install pipx
RUN pipx install uv

# *** FIX: Add pipx bin directory to PATH ***
ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /app

# Copy dependency definition files
COPY pyproject.toml uv.lock* ./

# *** FIX: Install directly from pyproject.toml using '.' ***
# Install dependencies using uv into the system Python site-packages
RUN --mount=type=cache,target=/root/.cache/uv uv pip install . --system --frozen
# Removed: uv pip install --system --frozen -r requirements.txt
# OR potentially: uv sync --system --locked (if uv.lock is guaranteed)

# ---- Final Stage ----
FROM base as final

RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid 1001 --create-home --shell /bin/bash appuser

WORKDIR /home/appuser/app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --chown=appuser:appgroup ./app ./app
# COPY --chown=appuser:appgroup .env ./.env # Recommended to use Render env vars instead

USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]