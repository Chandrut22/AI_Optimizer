FROM python:3.10-slim-buster

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy project files for dependency installation
COPY pyproject.toml uv.lock ./

# Install dependencies system-wide using uv (reads pyproject.toml + uv.lock)
RUN uv pip install --system --no-cache-dir .

# Copy source code
COPY . .

# Ensure app is importable
ENV PYTHONPATH=/app

EXPOSE 8000

# Render sets $PORT automatically
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
