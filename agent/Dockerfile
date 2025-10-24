# ---- Base Stage ----
# Use a specific slim Python image for efficiency
FROM python:3.12-slim as base

# Prevent Python from writing pyc files and keep output unbuffered
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # Tell uv to use the system Python it finds
    UV_SYSTEM_PYTHON=1

# ---- Builder Stage ----
# Used to install dependencies securely
FROM base as builder

# Install uv using pipx for isolated installation
RUN --mount=type=cache,target=/root/.pip pip install pipx
RUN pipx install uv

# Set working directory
WORKDIR /app

# Copy only dependency definition files first for better caching
COPY pyproject.toml uv.lock* ./

# Install dependencies using uv into the system Python site-packages
# Use --locked if your uv.lock file is up-to-date and committed
# Use --frozen -r requirements.txt if uv.lock might not exist or be current
RUN --mount=type=cache,target=/root/.cache/uv uv pip install --system --frozen -r requirements.txt
# OR potentially: uv sync --system --locked

# ---- Final Stage ----
# Create the final lean image
FROM base as final

# Create a non-root user and group for security
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid 1001 --create-home --shell /bin/bash appuser

# Set the working directory for the non-root user
WORKDIR /home/appuser/app

# Copy installed packages from the builder stage
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
# Copy the application code (assuming your code is in an 'app' folder)
COPY --chown=appuser:appgroup ./app ./app
# Copy the .env file if needed for local Docker run (better to use compose env_file)
# COPY --chown=appuser:appgroup .env ./.env

# Switch to the non-root user
USER appuser

# Expose the port the application will run on (matches CMD)
EXPOSE 8000

# Command to run the application using uvicorn
# Using uvicorn directly instead of 'fastapi run' for more explicit control
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]