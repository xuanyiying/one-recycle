# syntax=docker/dockerfile:1

# 1. Builder stage: Install all dependencies, generate prisma client, and build the app
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# 2. Production stage: Copy only necessary artifacts for running the application
FROM node:20-alpine AS production
WORKDIR /usr/src/app

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the compiled application code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy the generated Prisma client from the builder stage
COPY --from=builder /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

# Copy the Prisma schema file, as it's needed by the client at runtime
COPY --from=builder /usr/src/app/prisma ./prisma

USER node

CMD ["node", "dist/main"]