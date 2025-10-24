# ---- Base ----
FROM python:3.12-slim as base
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 UV_SYSTEM_PYTHON=1

# ---- Builder ----
FROM base as builder
RUN --mount=type=cache,target=/root/.pip pip install pipx
RUN pipx install uv
ENV PATH="/root/.local/bin:${PATH}"
WORKDIR /app
COPY pyproject.toml uv.lock* ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --locked

# ---- Final ----
FROM base as final
RUN groupadd --gid 1001 appgroup && useradd --uid 1001 --gid 1001 --create-home appuser
WORKDIR /home/appuser/app

# Copy dependencies
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

# Copy code
COPY --chown=appuser:appgroup ./app ./

USER appuser
EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
