FROM python:3.10-slim-buster

WORKDIR /app

COPY pyproject.toml uv.lock ./

# Install uv
RUN pip install uv

# Install project dependencies system-wide
RUN uv pip install --system --no-cache-dir .

COPY . .

ENV PYTHONPATH=/app

# Use Render-provided PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
