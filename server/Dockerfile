# OneRecycle Server - Production Dockerfile
# Supports both monolith and microservice modes via SERVICE_NAME env var

FROM node:22-slim AS deps
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ curl \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Builder stage
FROM node:22-slim AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application (tsc + tsc-alias) for production
RUN npx tsc -p tsconfig.build.json --incremental false && \
    npx tsc-alias

# Copy proto files (tsc doesn't copy .proto files)
RUN mkdir -p dist/proto && cp src/proto/*.proto dist/proto/

# Verify build output
RUN echo "=== Build output ===" && \
    ls -la dist/ && \
    test -f dist/main.js || (echo "ERROR: main.js not found" && exit 1) && \
    test -f dist/microservices.js || (echo "ERROR: microservices.js not found" && exit 1)

# Production stage
FROM node:22-slim AS runner
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup appuser

# Copy built application
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

# Set environment
ENV NODE_ENV=production

# Switch to non-root user
USER appuser

# Expose port (HTTP for gateway/monolith, gRPC for microservices)
EXPOSE 3000 3001 3002 3003 3004 3008 3009 50051

# Health check (default for HTTP services)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Start application:
# - If SERVICE_NAME is set -> microservice mode (dist/microservices.js)
# - If SERVICE_NAME is not set -> monolith mode (dist/main.js)
# Also runs prisma db push on startup to ensure schema is in sync
CMD ["sh", "-c", "npx prisma db push --skip-generate 2>/dev/null; if [ -n \"$SERVICE_NAME\" ]; then node dist/microservices.js; else node dist/main.js; fi"]
