# Technology Stack & Build System

## Frontend Technologies

### Mini-Program (Client)
- **Framework**: Taro 4.1.7 + React 18 + TypeScript
- **UI Components**: @taroify/core, @taroify/icons
- **Build Tool**: Webpack 5 + Vite 4
- **Platforms**: WeChat, Alipay, TikTok, Kuaishou, H5

### Admin Web Dashboard
- **Framework**: Next.js 14 + React 18 + TypeScript
- **UI Library**: Ant Design 5.12
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS with Ant Design

## Backend Technologies

### Microservices Architecture
- **Framework**: NestJS 10+ with Node.js 18+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5+
- **Communication**: gRPC (internal), REST API (external)
- **Authentication**: JWT with passport-jwt

### Message Queue System
- **Solution**: Redis 7 + Bull Queue 4.11
- **Framework Integration**: @nestjs/bull 10+
- **Features**: Delayed jobs, priority queues, retry mechanism, rate limiting
- **Monitoring**: Bull Board (Web UI)
- **Queues**: order-queue, notification-queue, payment-queue, dispatch-queue

### Infrastructure
- **Containerization**: Docker + docker-compose
- **Reverse Proxy**: Nginx
- **Cache & Queue**: Redis 7
- **Database Admin**: Adminer (port 8080)

## Common Build Commands

### Mini-Program Development
```bash
cd apps/client-mini
npm run dev:weapp     # WeChat development
npm run dev:alipay    # Alipay development  
npm run dev:tt        # TikTok development
npm run build:weapp   # WeChat production build
```

### Admin Dashboard
```bash
cd apps/admin-web
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
```

### Backend Services
```bash
# Individual service development
cd services/{service-name}
npm run start:dev    # Development with watch mode
npm run build        # Production build
npm run start:prod   # Production server

# Database operations
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio

# Protocol Buffers (for gRPC services)
npm run proto:generate   # Generate TypeScript from .proto files
```

### Message Queue Service
```bash
cd services/message-queue

# Development
npm run start:dev        # Start with hot reload

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations

# Production
npm run build
npm run start:prod

# Access Bull Board UI
open http://localhost:3010/admin/queues
```

### Docker Operations
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis adminer message-queue

# View logs
docker-compose logs -f {service-name}
docker-compose logs -f message-queue

# Stop all services
docker-compose down

# Restart message queue service
docker-compose restart message-queue
```

## Code Quality & Testing

### Testing Commands
```bash
npm run test         # Unit tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage report
npm run test:e2e     # End-to-end tests
```

### Code Quality
```bash
npm run lint         # ESLint
npm run format       # Prettier formatting
```

## Development Workflow

1. **Database Setup**: Start PostgreSQL and Redis via docker-compose
2. **Message Queue**: Start message-queue service for async processing
3. **Service Development**: Use `npm run start:dev` for hot reload
4. **Frontend Development**: Use respective dev commands for each platform
5. **Testing**: Run tests before committing changes
6. **Build**: Use production build commands for deployment

## Message Queue Usage

### Publishing Events
```typescript
// In any service
import { OrderQueueService } from '@message-queue/services';

// Publish order created event
await orderQueueService.handleOrderCreated({
  orderId: '123',
  userId: '456',
  items: [...],
  address: {...},
  scheduledTime: '2025-10-16T10:00:00Z',
});
```

### Queue Configuration
- **order-queue**: Priority 10, 3 retries, 5 concurrency
- **notification-queue**: Priority 8, 3 retries, rate limit 100/min
- **payment-queue**: Priority 10, 5 retries, idempotency guaranteed
- **dispatch-queue**: Priority 9, 3 retries, delayed execution