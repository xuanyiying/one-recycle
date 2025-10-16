# syntax=docker/dockerfile:1

# 1. Builder stage: Install all dependencies and build the app
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Production stage: Copy only necessary artifacts for running the application
FROM node:20-alpine AS production
WORKDIR /usr/src/app

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the compiled application code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

USER node

CMD ["node", "dist/main"]