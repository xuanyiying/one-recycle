# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

One Recycle is a recycling platform where users create pickup orders for used items (books, clothes), couriers collect items, warehouse staff inspect and store them, and users receive payment in points. The project uses a hybrid architecture: monolithic for development/testing, microservices for production.

## Commands

### Server (NestJS Backend)
```bash
cd server

# Development
npm run start:dev          # Start with watch mode
npm run dev                # Alias for start:dev

# Build & Production
npm run build              # Build the application
npm run start:prod         # Run production build

# Database (Prisma)
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations (dev)
npm run prisma:migrate:deploy  # Deploy migrations (prod)
npm run prisma:studio      # Open Prisma Studio GUI
npm run prisma:seed        # Seed database

# Testing
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov:unit      # Unit tests with coverage (≥90% threshold)
npm run test:cov:e2e       # E2E tests with coverage (≥80% threshold)
npm run test:report        # Generate Allure report

# Code Quality
npm run lint               # Run ESLint with auto-fix
npm run typecheck          # TypeScript type checking
npm run format             # Format with Prettier

# Seed Data
npm run seed               # Run main seed script
npm run seed:categories    # Seed categories only
SEED_ORDER_COUNT=20 npm run seed  # Custom order count
```

### Admin Web (Next.js Dashboard)
```bash
cd apps/admin-web

npm run dev                # Development server (port 3000)
npm run build              # Production build
npm run start              # Start production server
npm run lint               # Run Next.js linter
npm run typecheck          # TypeScript check
npm run test               # Run Jest tests
```

### Mini Client (Taro Mini-Program)
```bash
cd apps/mini-client

npm run dev:weapp          # WeChat mini-program dev mode
npm run build:weapp        # Build for WeChat
npm run dev:alipay         # Alipay mini-program dev mode
npm run build:alipay       # Build for Alipay
npm run dev:h5             # H5 web dev mode
npm run build:h5           # Build for H5
npm run typecheck          # TypeScript check (strict config)
```

## Architecture

### Backend Structure (`server/src/`)
- **`modules/`** - Business modules (auth, order, payment, inventory, etc.)
- **`common/`** - Shared utilities (guards, interceptors, decorators, pipes, filters)
- **`prisma/`** - Prisma client and database access
- **`config/`** - Configuration factories for app, database, auth

Key modules in `server/src/modules/`:
- `auth` - JWT authentication, WeChat/Alipay social login
- `order` - Order management with status state machine
- `payment` - Payment processing, refunds, withdrawals
- `inventory` - Item tracking and warehouse management
- `dispatch` - Courier assignment and logistics
- `queue` - Bull/Redis job processors (order, payment, notification, dispatch)
- `voice-order` - AI-powered voice ordering system
- `customer` - Customer service chat and tickets
- `ai` - Multi-provider AI integration (OpenAI, Baidu, Aliyun, Tencent)

### Order Status Flow
```
PENDING → PENDING_PICKUP → PICKED_UP → IN_TRANSIT → PENDING_RECEIPT
→ INSPECTING → INSPECTED → PENDING_INBOUND → INBOUNDED
→ PENDING_SETTLEMENT → COMPLETED
```
Exception paths: `INSPECTING → INSPECTION_EXCEPTION → MANUAL_PROCESSING`
Cancellation possible from: `PENDING`, `PENDING_PICKUP`, `IN_TRANSIT`

State machine logic is defined in `apps/admin-web/src/lib/orderStateMachine.ts`.

### Frontend Architecture

**Admin Web (`apps/admin-web/`)** - Next.js 14 with App Router
- Route groups: `(auth)` for login, `(dashboard)` for admin pages
- Uses Tailwind CSS v4, Radix UI, React Hook Form with Zod validation
- API calls through service modules in `src/services/`

**Mini Client (`apps/mini-client/`)** - Taro multi-platform mini-program
- Pages in `src/pages/` (recycle, order, profile, address, voice-order)
- State management: Zustand stores in `src/store/`
- API services in `src/services/` with centralized request handling
- Supports WeChat, Alipay, Douyin, H5 platforms

### Queue Processing
Bull queues (Redis-backed) in `server/src/modules/queue/processors/`:
- `order.processor.ts` - Order status transitions
- `payment.processor.ts` - Payment/refund processing
- `notification.processor.ts` - SMS, email, push notifications
- `dispatch.processor.ts` - Courier assignment

Queue names defined in `QUEUE_NAMES` constant (`server/src/common/constants/`).

### Database
- PostgreSQL with Prisma ORM
- Schema: `server/prisma/schema.prisma`
- Key models: User, Order, OrderItem, Category, Payment, InventoryItem, Tenant

## Code Patterns

### NestJS Controllers
All controller methods must be async with explicit return types:
```typescript
@Get(':id')
async findOne(@Param('id') id: string): Promise<any> {
  return this.service.findOne(id);
}
```

### Module Structure
Each business module follows:
```
module-name/
├── dto/              # Data transfer objects
├── interfaces/       # TypeScript interfaces
├── services/         # Business logic
├── *.controller.ts   # HTTP endpoints
├── *.grpc.controller.ts  # gRPC endpoints (if needed)
└── *.module.ts       # Module definition
```

### Frontend Services
Mini-client API services use a centralized request wrapper (`src/utils/request.ts`) that handles:
- Token refresh on 401
- Request caching
- Error handling
- Platform detection

## Environment Variables

Required for server (see `server/.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `JWT_SECRET` - JWT signing key
- `WECHAT_APP_ID`, `WECHAT_APP_SECRET` - WeChat login
- `OPENAI_API_KEY` (or other AI provider keys) - AI features

## Testing

- Unit tests: `*.spec.ts` files alongside source
- E2E tests: `server/test/*.e2e-spec.ts`
- Test data SQL: `server/test/fixtures/order-state-test-data.sql`
- Mock scripts: `server/test/mocks/`
- Coverage thresholds: 90% unit, 80% e2e

For CI debugging: set `LOG_LEVEL=debug` and `DB_LOG_QUERIES=true`
