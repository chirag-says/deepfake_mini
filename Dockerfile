# ==========================================
# DeFraudAI - Optimized Full-Stack Dockerfile
# Target: < 4GB image size
# ==========================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM python:3.11-slim-bookworm

WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements first for better caching
COPY src/backend/requirements.txt ./requirements.txt

# Install Python dependencies with optimizations
# --no-cache-dir: Don't cache pip packages
# Using CPU-only PyTorch from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt \
    && rm -rf /root/.cache/pip \
    && rm -rf /root/.cache/huggingface \
    && find /usr/local -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true

# Copy backend code
COPY src/backend/ ./src/backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Set working directory to backend
WORKDIR /app/src/backend

# Expose port
EXPOSE 8000

# Start the server
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
