---
inclusion: always
---

# Project Structure & Organization

## Repository Layout

```
one-recycle/
├── apps/
│   ├── client-mini/         # Taro multi-platform mini-program (WeChat/Alipay/TikTok/Kuaishou)
│   └── admin-web/           # Next.js admin dashboard
├── services/
│   ├── account-service/     # User profiles & addresses (gRPC + HTTP)
│   ├── api-gateway/         # External API entry point (port 3002)
│   ├── auth-service/        # JWT authentication
│   ├── category-service/    # Recyclable item categories
│   ├── courier-service/     # Courier management
│   ├── dispatch-service/    # Order dispatch & JD Express integration
│   ├── inventory-service/   # Item inventory tracking
│   ├── message-queue/       # Redis + Bull queue service (port 3010)
│   ├── notification-service/# Push notifications
│   ├── order-service/       # Order lifecycle (PENDING → COMPLETED)
│   ├── payment-service/     # Payments & withdrawals
│   └── shared/              # Shared types & utilities
├── docs/                    # Architecture & API documentation
└── docker-compose.yml       # PostgreSQL, Redis, Adminer
```

## Standard Service Structure

### NestJS Microservice Pattern
```
service-name/
├── src/
│   ├── modules/             # Feature modules (user/, order/, etc.)
│   ├── common/              # Shared utilities, guards, interceptors
│   ├── config/              # Configuration files
│   ├── prisma/              # Generated Prisma client
│   ├── proto/               # gRPC .proto files (if applicable)
│   └── main.ts
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration history
├── tests/                   # Integration & unit tests
├── .env                     # Local environment variables
├── Dockerfile
└── package.json
```

### Frontend Structure

**Mini-Program** (apps/client-mini/):
```
src/
├── pages/                   # Taro page components
├── components/              # Reusable UI components
├── services/                # API clients (orderService.ts, userService.ts)
├── hooks/                   # Custom hooks (useAuth.ts, useOrders.ts)
├── store/                   # State management
├── types/                   # TypeScript interfaces
└── utils/                   # Helper functions
```

**Admin Dashboard** (apps/admin-web/):
```
src/
├── app/                     # Next.js 14 app directory
│   ├── dashboard/
│   ├── users/
│   ├── orders/
│   └── components/
├── lib/                     # Utilities
└── services/                # API clients
```

## Naming Conventions

### Files & Directories
- **Services/Directories**: kebab-case (`account-service`, `order-service`)
- **React Components**: PascalCase (`UserProfile.tsx`, `OrderList.tsx`)
- **TypeScript files**: camelCase (`apiClient.ts`, `userService.ts`)
- **Test files**: `*.spec.ts` for unit, `*.e2e-spec.ts` for integration

### Code & API
- **Database tables**: snake_case (`user_profiles`, `order_items`)
- **Prisma models**: PascalCase (`UserProfile`, `OrderItem`)
- **API endpoints**: kebab-case (`/api/user-profiles`, `/api/order-items`)
- **Environment variables**: UPPER_SNAKE_CASE (`DATABASE_URL`, `JWT_SECRET`)
- **TypeScript interfaces**: PascalCase with `I` prefix optional (`User` or `IUser`)
- **Enums**: PascalCase (`OrderStatus`, `PaymentMethod`)

## Port Allocation

| Service | HTTP Port | gRPC Port | Purpose |
|---------|-----------|-----------|---------|
| api-gateway | 3002 | - | External API entry |
| account-service | 3001 | 50051 | User & address management |
| order-service | 3003 | - | Order lifecycle |
| notification-service | 3004 | - | Push notifications |
| courier-service | 3005 | - | Courier management |
| dispatch-service | 3006 | - | JD Express integration |
| category-service | 3008 | - | Item categories |
| inventory-service | 3009 | - | Inventory tracking |
| message-queue | 3010 | - | Queue service + Bull Board UI |
| admin-web | 3000 | - | Next.js dashboard |
| PostgreSQL | 5432 | - | Database |
| Redis | 6379 | - | Cache & queues |
| Adminer | 8080 | - | DB admin UI |

## Configuration Management

### Environment Variables
- Each service has `.env` file (never commit to git)
- Use `.env.example` to document required variables
- Testing uses `.env.test` with isolated database
- Production uses environment-specific configuration

### Common Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection for cache & queues
- `JWT_SECRET`: Shared across auth-service and api-gateway
- `PORT`: Service HTTP port
- `GRPC_PORT`: gRPC port (if applicable)

## Code Organization Principles

1. **Feature modules**: Group related functionality (e.g., `src/user/`, `src/order/`)
2. **Shared code**: Use `services/shared/` for cross-service utilities
3. **Dependency injection**: Use NestJS DI for all services and repositories
4. **DTOs with validation**: Use class-validator decorators on all DTOs
5. **Separation of concerns**: Controller → Service → Repository pattern

## Testing Strategy

- **Unit tests**: `*.spec.ts` alongside source files
- **Integration tests**: `tests/` directory with database setup
- **E2E tests**: `*.e2e-spec.ts` for full request/response cycles
- **Test utilities**: `tests/test-utils.ts` for shared helpers
- **Coverage**: Aim for >80% on business logic

## Service Communication Patterns

### gRPC (Internal Service-to-Service)
- Used for synchronous internal calls (e.g., order-service → dispatch-service)
- Define `.proto` files in `proto/` directory
- Generate TypeScript with `npm run proto:generate`
- account-service exposes gRPC on port 50051

### REST API (External Client-Facing)
- All external requests go through api-gateway (port 3002)
- Gateway routes to appropriate microservices
- Use DTOs with class-validator for request validation
- Return consistent JSON response format

### Message Queue (Asynchronous)
- Use Redis + Bull for non-blocking operations
- Queues: order-queue, notification-queue, payment-queue, dispatch-queue
- Implement idempotency using job IDs
- Retry failed jobs with exponential backoff
- Dead-letter queue for permanently failed jobs
- Access Bull Board UI at `http://localhost:3010/admin/queues`

## Development Workflows

### Adding a New Service
1. Create directory in `services/` following standard NestJS structure
2. Add Prisma schema if database access needed
3. Create Dockerfile for containerization
4. Add service to `docker-compose.yml` with port allocation
5. Create `.env.example` documenting required variables
6. Add startup script to `services/start-all-services.sh`

### Adding New API Endpoints
1. Create DTO with class-validator decorators (`@IsString()`, `@IsNotEmpty()`, etc.)
2. Implement controller method with NestJS decorators (`@Post()`, `@Get()`, etc.)
3. Add business logic in service layer
4. Write integration tests in `tests/` directory
5. If external-facing, add route in api-gateway

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npm run prisma:migrate dev --name descriptive_name`
3. Run `npm run prisma:generate` to update Prisma client
4. Update related DTOs and TypeScript interfaces
5. Test migration locally before committing

### Adding Queue Jobs
1. Define event DTO in `message-queue/src/queue/dto/`
2. Create processor in `message-queue/src/queue/processors/`
3. Add queue service method in `message-queue/src/queue/services/`
4. Publish events from other services using queue client
5. Test with Bull Board UI at `http://localhost:3010/admin/queues`