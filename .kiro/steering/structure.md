# Project Structure & Organization

## Repository Layout

```
one-recycle/
├── apps/                    # Frontend applications
│   ├── client-mini/         # Taro multi-platform mini-program
│   └── admin-web/           # Next.js admin dashboard
├── services/                # Backend microservices
│   ├── account-service/     # User authentication & profiles
│   ├── api-gateway/         # API gateway & routing
│   ├── auth-service/        # Authentication service
│   ├── category-service/    # Item categories management
│   ├── courier-service/     # Courier management
│   ├── dispatch-service/    # Order dispatch & JD Express
│   ├── inventory-service/   # Inventory management
│   ├── message-queue/       # Message queue service (NEW)
│   ├── notification-service/# Notifications & messaging
│   ├── order-service/       # Order lifecycle management
│   ├── payment-service/     # Payment processing
│   └── shared/              # Shared utilities & types
├── docs/                    # Project documentation
├── scripts/                 # Utility scripts
└── docker-compose.yml       # Development environment
```

## Service Architecture Patterns

### NestJS Service Structure
Each microservice follows this standard structure:
```
service-name/
├── src/
│   ├── modules/             # Feature modules
│   ├── common/              # Shared utilities
│   ├── config/              # Configuration
│   ├── prisma/              # Database client & generated types
│   ├── proto/               # gRPC protocol definitions
│   └── main.ts              # Application entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── tests/                   # Test files
├── Dockerfile               # Container configuration
└── package.json             # Dependencies & scripts
```

### Message Queue Service Structure
```
message-queue/
├── src/
│   ├── common/              # Common utilities
│   │   └── services/
│   │       └── idempotency.service.ts
│   ├── config/              # Configuration
│   │   └── queue.config.ts
│   ├── database/            # Database layer
│   │   ├── repositories/
│   │   │   ├── job-status.repository.ts
│   │   │   └── dead-letter-queue.repository.ts
│   │   ├── prisma.service.ts
│   │   └── database.module.ts
│   ├── health/              # Health check
│   │   ├── health.controller.ts
│   │   ├── health.service.ts
│   │   └── health.module.ts
│   ├── queue/               # Queue module
│   │   ├── dto/             # Event DTOs
│   │   ├── processors/      # Message consumers
│   │   ├── services/        # Queue producers
│   │   └── queue.module.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── Dockerfile
└── package.json
```

### Frontend Application Structure

#### Mini-Program (apps/client-mini/)
```
src/
├── pages/                   # Page components
│   ├── index/               # Home page
│   ├── recycle/             # Recycling flow
│   ├── order/               # Order management
│   ├── profile/             # User profile
│   └── address/             # Address management
├── components/              # Reusable components
├── services/                # API service layer
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
├── types/                   # TypeScript definitions
└── styles/                  # Global styles
```

#### Admin Dashboard (apps/admin-web/)
```
src/
├── app/                     # Next.js app directory
│   ├── dashboard/           # Dashboard pages
│   ├── users/               # User management
│   ├── orders/              # Order management
│   ├── components/          # Shared components
│   └── layout.tsx           # Root layout
├── lib/                     # Utility libraries
└── services/                # API client services
```

## Naming Conventions

### Files & Directories
- **Services**: kebab-case (e.g., `account-service`, `order-service`)
- **Components**: PascalCase (e.g., `UserProfile.tsx`, `OrderList.tsx`)
- **Pages**: kebab-case directories (e.g., `user-profile/`, `order-detail/`)
- **Utilities**: camelCase (e.g., `apiClient.ts`, `validation.ts`)

### Database & API
- **Database tables**: snake_case (e.g., `user_profiles`, `order_items`)
- **API endpoints**: kebab-case (e.g., `/api/user-profiles`, `/api/order-items`)
- **Environment variables**: UPPER_SNAKE_CASE (e.g., `DATABASE_URL`, `JWT_SECRET`)

## Port Allocation

### Development Ports
- **API Gateway**: 3002
- **Account Service**: 3001 (HTTP), 50051 (gRPC)
- **Order Service**: 3003
- **Notification Service**: 3004
- **Courier Service**: 3005
- **Dispatch Service**: 3006
- **Category Service**: 3008
- **Inventory Service**: 3009
- **Message Queue Service**: 3010 (NEW)
- **Admin Web**: 3000 (Next.js default)
- **PostgreSQL**: 5432
- **Redis**: 6379
- **Adminer**: 8080

## Configuration Management

### Environment Files
- **Development**: `.env` in each service directory
- **Testing**: `.env.test` for test-specific configuration
- **Production**: Environment variables or configuration management system

### Shared Configuration
- **Database URLs**: Consistent across services using PostgreSQL
- **JWT Secrets**: Shared across authentication services
- **API Keys**: Third-party service integration (JD Express, payment providers)

## Development Guidelines

### Code Organization
1. **Feature-based modules**: Group related functionality together
2. **Shared utilities**: Common code in `services/shared/`
3. **Type definitions**: Centralized in each service's `types/` directory
4. **API contracts**: Protocol Buffers for gRPC, OpenAPI for REST

### Testing Structure
- **Unit tests**: Alongside source files (`.spec.ts`)
- **Integration tests**: In `tests/` directory
- **E2E tests**: Service-level in `tests/` directory
- **Test utilities**: Shared helpers in `tests/test-utils.ts`

### Documentation
- **API docs**: Generated from code annotations
- **Architecture docs**: In `docs/` directory
- **Service docs**: README.md in each service directory
- **Database schema**: Documented in Prisma schema files