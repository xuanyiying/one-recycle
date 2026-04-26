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
COPY --from=builder --chown=appuser:appgroup /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/scripts ./scripts

# Create writable directories for Prisma and npm cache
RUN mkdir -p /app/node_modules/.cache /tmp/prisma && \
    chown -R appuser:appgroup /app/node_modules/.cache /tmp/prisma

# Set environment
ENV NODE_ENV=production
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=library
ENV npm_config_cache=/tmp/npm-cache

# Switch to non-root user
USER appuser

# Expose port (HTTP for gateway/monolith, gRPC for microservices)
EXPOSE 3000 3001 3002 3003 3004 3008 3009 50051

# Health check - gRPC services use PORT+10000 for HTTP health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD if [ -n "$SERVICE_NAME" ] && [ "$SERVICE_NAME" != "api-gateway" ]; then \
    curl -f http://localhost:$((${PORT:-50051}+10000))/api/health || exit 1; \
    else \
    curl -f http://localhost:${PORT:-3000}/api/health || exit 1; \
    fi

# Start application:
# - If SERVICE_NAME is set -> microservice mode (dist/microservices.js)
# - If SERVICE_NAME is not set -> monolith mode (dist/main.js)
# - RUN_SEED=1 enables seed execution after db push (idempotent, safe to re-run)
# Database initialization with retry logic
CMD ["sh", "-c", "echo 'Waiting for database...'; DB_INIT_SUCCESS=0; for i in 1 2 3 4 5; do if npx prisma db push; then echo 'Database schema synced'; DB_INIT_SUCCESS=1; break; fi; echo \"Attempt $i failed, retrying in 5s...\"; sleep 5; done; if [ \"$DB_INIT_SUCCESS\" = '0' ]; then echo 'Database initialization failed after 5 attempts'; exit 1; fi; [ \"$RUN_SEED\" = '1' ] && npx ts-node scripts/main.ts; if [ -n \"$SERVICE_NAME\" ]; then node dist/microservices.js; else node dist/main.js; fi"]
