# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**One Recycle** is a multi-platform waste recycling management system built with a microservices architecture. The platform consists of:

- **Backend**: NestJS-based microservices with gRPC communication
- **Frontend**: Next.js admin dashboard and Taro-based multi-platform mini-program client
- **Infrastructure**: PostgreSQL, Redis, message queue system

## Architecture

### Microservices Structure

```
services/
├── api-gateway/           # HTTP request routing and authentication
├── account-service/       # User account management (gRPC enabled)
├── order-service/         # Order processing
├── notification-service/  # Notification delivery
├── courier-service/       # Courier management
├── dispatch-service/      # Shipment dispatch (JD Express integration)
├── category-service/      # Item category management
├── inventory-service/     # Inventory tracking
├── message-queue/         # BullMQ-based task queue with Bull Board UI
├── auth-service/          # Authentication and JWT
├── payment-service/       # Payment processing
└── shared/               # Shared libraries and utilities (@one-recycle/shared)
```

### Communication Patterns

- **HTTP**: API Gateway exposes REST endpoints on port 3002
- **gRPC**: Services communicate via gRPC (e.g., account-service on port 50051)
- **Message Queue**: Redis-backed BullMQ for async tasks (port 3010)
- **Database**: PostgreSQL with database-per-service pattern

### Frontend Applications

- **admin-web**: Next.js 14 admin dashboard with Ant Design
- **client-mini**: Taro-based multi-platform mini-program (WeChat, Alipay, ByteDance, etc.)

## Development Commands

### Services Development

**Building and Starting Services:**

```bash
# Build all services (in individual service directories)
cd services/<service-name>
npm run build

# Run in development mode with watch
npm run start:dev

# Run in debug mode
npm run start:debug

# Run in production mode
npm run start:prod
```

**Testing:**

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run integration tests
npm run test:integration
```

**Code Quality:**

```bash
# Lint and fix code
npm run lint

# Format code with Prettier
npm run format
```

**Database (Prisma):**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations in development
npm run prisma:migrate

# Deploy migrations to production
npm run prisma:deploy

# Open Prisma Studio GUI
npm run prisma:studio
```

**gRPC (account-service):**

```bash
# Generate TypeScript proto files from .proto definitions
npm run proto:generate
```

### Admin Web (Next.js)

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Client Mini-Program (Taro)

```bash
# Development build for WeChat mini-program
npm run dev:weapp

# Production build for WeChat
npm run build:weapp

# Development builds for other platforms
npm run dev:alipay    # Alipay
npm run dev:h5        # H5/Web
npm run dev:tt        # ByteDance

# Analyze bundle size
npm run analyze
npm run build:analyze
```

### Quick Start All Services (Docker)

```bash
# Use docker-compose for all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f <service-name>
```

### Shell Scripts

```bash
# Start all services in background with auto-restart
./services/start-all-services-auto.sh

# Stop all running services
./services/stop-all-services.sh

# Check status of all services
./services/check-services-status.sh

# Clean up processes
./services/cleanup-processes.sh
```

## Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Key environment variables:**
   - `DATABASE_URL`: PostgreSQL connection string
   - `REDIS_HOST`, `REDIS_PORT`: Redis connection
   - `JWT_SECRET`: JWT signing secret
   - Service ports: `API_GATEWAY_PORT`, `ACCOUNT_SERVICE_PORT`, etc.
   - Third-party API keys: `JD_EXPRESS_API_KEY`

3. **Start infrastructure:**
   ```bash
   docker-compose up postgres redis
   ```

## Code Generation Rules

### NestJS Controllers

All controllers must follow these patterns (as defined in `code-generation-rules.md`):

1. **Async methods with explicit return types:**
   ```typescript
   @Get()
   async findAll(): Promise<any> {
     return this.service.findAll();
   }
   ```

2. **All HTTP decorators (@Get, @Post, @Patch, @Put, @Delete) require async/await**

3. **Parameter decorators:**
   ```typescript
   @Get(':id')
   async findOne(@Param('id') id: string): Promise<any>
   
   @Post()
   async create(@Body() createDto: CreateDto): Promise<any>
   ```

### TypeScript Configuration

Services use relaxed TypeScript settings for decorator support:
- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`
- `strictPropertyInitialization: false`
- `strictFunctionTypes: false`

If you encounter decorator signature resolution errors, ensure:
1. All controller methods use `async` keyword
2. All methods have explicit return types
3. Run `npm run prisma:generate` if using Prisma
4. Rebuild the project to refresh TypeScript language service

## Shared Library

The `@one-recycle/shared` module is used across services:

```bash
cd services/shared

# Build shared library
npm run build

# Watch mode during development
npm run dev

# Clean build artifacts
npm run clean
```

Services import from shared:
```typescript
import { SomeUtility } from '@one-recycle/shared';
```

## Key Technologies & Versions

- **NestJS**: 10.x - 11.x
- **TypeScript**: 5.x
- **Prisma**: 5.x (ORM)
- **gRPC**: @grpc/grpc-js
- **Next.js**: 14.x
- **Taro**: 4.x
- **Redis**: Latest (or 7.x)
- **PostgreSQL**: 15
- **BullMQ**: Task queue with Redis

## Database Management

Each service has its own database with Prisma schemas:
- `account_db` - Account service
- `order_db` - Order service
- `category_db` - Category service
- `inventory_db` - Inventory service

To check database state:
- Use Adminer UI at `http://localhost:8080`
- Use Prisma Studio: `npm run prisma:studio` in any service

## Message Queue

The message-queue service provides:
- BullMQ task processing
- Bull Board UI at `/admin/queues` (when `BULL_BOARD_ENABLED=true`)
- Runs on port 3010

## Debugging & Troubleshooting

### Service Won't Start
1. Check if port is already in use
2. Verify environment variables are set
3. Check logs: `./services/logs/startup.log`
4. Run syntax check: `./services/test-syntax.sh`

### gRPC Connection Issues
- Verify proto files are generated: `npm run proto:generate`
- Check gRPC port is accessible
- Ensure services are listening on correct ports

### Database Issues
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` is correct in `.env`
3. Run migrations: `npm run prisma:migrate`
4. View schema in Prisma Studio: `npm run prisma:studio`

### Port Conflicts
- Use `lsof -i :PORT` to find what's using a port
- Kill process: `kill -9 PID` or use `./services/cleanup-processes.sh`
