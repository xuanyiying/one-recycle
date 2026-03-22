# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

One Recycle is a recycling platform where users create pickup orders for used items (books, clothes, electronics), couriers collect items, warehouse staff inspect and store them, and users receive settlement in points. The project uses a hybrid architecture: monolithic for development/testing, microservices for production.

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
npm run prisma:push        # Push schema to database
npm run prisma:seed        # Seed database
npm run seed               # Run main seed script
npm run seed:categories    # Seed categories only
npm run seed:points-mall   # Seed points mall products
npm run seed:content-config  # Seed FAQ and recycle rules

# Testing
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov:unit      # Unit tests with coverage (>=90% threshold)
npm run test:cov:e2e       # E2E tests with coverage (>=80% threshold)
npm run test:report        # Generate Allure report

# Code Quality
npm run lint               # Run ESLint with auto-fix
npm run typecheck          # TypeScript type checking
npm run format             # Format with Prettier
```

### Admin Web (Next.js Dashboard)
```bash
cd apps/admin-web

npm run dev                # Development server (port 3000)
npm run build              # Production build
npm run start              # Start production server
npm run lint               # Run Next.js linter
npm run typecheck          # TypeScript check
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
- **`modules/`** - Business modules (26 modules)
- **`common/`** - Shared utilities (guards, interceptors, decorators, pipes, filters)
- **`prisma/`** - Prisma client and database access
- **`config/`** - Configuration factories for app, database, auth

Key modules in `server/src/modules/`:
- `auth` - JWT authentication, WeChat/Alipay social login
- `user` - User management and profiles
- `order` - Order management with complex status state machine (14 states)
- `payment` - Payment processing, refunds, withdrawals
- `account` - User balance, transactions, settlement
- `logistics` - JD Logistics (JDL) API integration, tracking
- `dispatch` - Courier assignment and intelligent scheduling
- `inventory` - Item tracking, quality checks, warehouse management
- `queue` - Bull/Redis job processors (order, payment, notification, dispatch)
- `notification` - Multi-channel notifications (SMS, email, push, WeChat template)
- `points` - Points mall, points orders, sign-in, tasks, invites
- `ai` - Multi-provider AI integration (OpenAI, Baidu, Aliyun, Tencent)
- `customer` - Customer service chat, tickets, knowledge base
- `voice-order` - AI-powered voice ordering with ASR and dialog engine
- `content` - FAQs, recycle rules, banners, articles
- `settlement` - Automated settlement and reconciliation
- `tenant` - Multi-tenant management, staff, platform wallet

### Order Status Flow
```
PENDING -> PENDING_PICKUP -> PICKED_UP -> IN_TRANSIT -> PENDING_RECEIPT
-> INSPECTING -> INSPECTED -> PENDING_INBOUND -> INBOUNDED
-> PENDING_SETTLEMENT -> COMPLETED
```
Exception paths: `INSPECTING -> INSPECTION_EXCEPTION -> MANUAL_PROCESSING`
Cancellation possible from: `PENDING`, `PENDING_PICKUP`, `IN_TRANSIT`

State machine logic is defined in `apps/admin-web/src/lib/orderStateMachine.ts`.

### Frontend Architecture

**Admin Web (`apps/admin-web/`)** - Next.js 14 with App Router
- Route groups: `(auth)` for login, `(dashboard)` for admin pages
- Uses Tailwind CSS v4, Radix UI, React Hook Form with Zod validation
- API calls through service modules in `src/services/`

**Mini Client (`apps/mini-client/`)** - Taro multi-platform mini-program
- Pages in `src/pages/` (recycle, order, profile, address, voice-order, points-mall)
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
- Schema: `server/prisma/schema.prisma` (55 models)
- Key model groups: User, Order, Payment, Account, Inventory, Logistics, Points, AI, Tenant

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

## Environment Variables

Required for server (see `server/.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `JWT_SECRET` - JWT signing key
- `WECHAT_APP_ID`, `WECHAT_APP_SECRET` - WeChat login
- `OPENAI_API_KEY` (or other AI provider keys) - AI features

## Deployment

- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Trigger branch**: `prod` (push to prod triggers auto-deploy)
- **Target**: Tencent Cloud CVM (101.42.31.216)
- **Method**: rsync + Docker Compose on server
- See `docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md` for setup

## Testing

- Unit tests: `*.spec.ts` files alongside source
- E2E tests: `server/test/*.e2e-spec.ts`
- Coverage thresholds: 90% unit, 80% e2e
- For CI debugging: set `LOG_LEVEL=debug` and `DB_LOG_QUERIES=true`
