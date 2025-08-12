FROM python:3.10-slim-buster

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN pip install uv
RUN uv venv .venv
RUN source .venv/bin/activate
RUN uv pip install --no-cache-dir .

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]