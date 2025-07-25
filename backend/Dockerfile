FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
# First download all dependencies as wheels
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Copy wheels and requirements
COPY --from=builder /app/wheels /app/wheels
COPY requirements.txt .

# Install from wheels
RUN pip install --no-cache-dir --find-links=/app/wheels -r requirements.txt \
    && rm -rf /app/wheels

# Copy source code
COPY . .

# Expose port (Cloud Run expects 8080)
EXPOSE 8080

# Start in production mode with Cloud Run's required port
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"] 