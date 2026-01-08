# ==========================================
# DeFraudAI - Unified Full-Stack Dockerfile
# ==========================================

# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY src/backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY src/backend/ ./src/backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Set working directory to backend
WORKDIR /app/src/backend

# Expose port (Railway sets PORT env var)
EXPOSE 8000

# Start the server
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
