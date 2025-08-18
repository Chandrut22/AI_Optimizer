FROM python:3.10-slim-buster

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN pip install uv
RUN uv venv .venv
RUN .venv/bin/pip install --no-cache-dir .

COPY . .

# Ensure /app is in Python path
ENV PYTHONPATH=/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
