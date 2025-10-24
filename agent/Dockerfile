# ---- Base Stage ----
# Use a specific slim Python image for efficiency and security updates
FROM python:3.12-slim as base

# Prevent Python from writing .pyc files and keep output unbuffered
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # Tell uv to use the system Python it finds
    UV_SYSTEM_PYTHON=1

# ---- Builder Stage ----
# Used to install dependencies securely and create a cacheable layer
FROM base as builder

# Install uv using pipx for isolated installation
# Using --mount for caching pip downloads
RUN --mount=type=cache,target=/root/.pip pip install pipx
RUN pipx install uv

# Add the pipx bin directory to the PATH for subsequent RUN commands
ENV PATH="/root/.local/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy only dependency definition files first for better Docker layer caching
COPY pyproject.toml uv.lock* ./

# Install dependencies using uv sync based on the lock file
# This ensures reproducible builds
# Using --mount for caching uv downloads/builds
RUN --mount=type=cache,target=/root/.cache/uv uv sync --locked

# ---- Final Stage ----
# Create the final lean image for running the application
FROM base as final

# Create a non-root user and group for security
# Using standard user/group IDs often used in base images
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid 1001 --create-home --shell /bin/bash appuser

# Set the working directory inside the non-root user's home
WORKDIR /home/appuser/app

# Copy installed Python packages from the builder stage's site-packages
# Ensure the python version directory matches the base image (e.g., python3.12)
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

# Copy the application code from your local 'app' directory into the container
# Set ownership to the non-root user
COPY --chown=appuser:appgroup ./app ./app

# Switch to the non-root user
USER appuser

# Expose the port the application will run on (should match Render settings and CMD)
EXPOSE 8000

# Command to run the application using uvicorn
# Listens on all interfaces (0.0.0.0) required inside Docker
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]