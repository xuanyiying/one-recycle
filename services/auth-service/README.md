# API 目录结构设计

## 概述

`/services/api/` 目录是整个微服务架构的API规范中心，负责统一管理所有服务的接口定义、版本控制、路由配置和中间件处理机制。

## 目录结构

```
services/api/
├── README.md                    # 本文档
├── package.json                 # 依赖管理
├── tsconfig.json               # TypeScript配置
├── prisma/                     # 数据库模式定义
│   └── schema.prisma           # 统一数据模型
├── specs/                      # API规范定义
│   ├── openapi/               # OpenAPI 3.0规范
│   │   ├── v1/               # API v1版本
│   │   │   ├── common.yaml   # 通用组件定义
│   │   │   ├── auth.yaml     # 认证相关API
│   │   │   ├── users.yaml    # 用户管理API
│   │   │   ├── orders.yaml   # 订单管理API
│   │   │   ├── dispatch.yaml # 配送管理API
│   │   │   ├── couriers.yaml # 快递员管理API
│   │   │   ├── notifications.yaml # 通知服务API
│   │   │   ├── payments.yaml # 支付服务API
│   │   │   ├── inventory.yaml # 库存管理API
│   │   │   └── categories.yaml # 分类管理API
│   │   └── v2/               # API v2版本（未来扩展）
│   └── graphql/              # GraphQL模式定义
│       └── schema.graphql    # 统一GraphQL模式
├── types/                     # TypeScript类型定义
│   ├── common/               # 通用类型
│   │   ├── base.types.ts     # 基础类型
│   │   ├── error.types.ts    # 错误类型
│   │   └── pagination.types.ts # 分页类型
│   ├── auth/                 # 认证相关类型
│   ├── users/                # 用户相关类型
│   ├── orders/               # 订单相关类型
│   ├── dispatch/             # 配送相关类型
│   ├── couriers/             # 快递员相关类型
│   ├── notifications/        # 通知相关类型
│   ├── payments/             # 支付相关类型
│   ├── inventory/            # 库存相关类型
│   └── categories/           # 分类相关类型
├── middleware/               # 中间件定义
│   ├── auth.middleware.ts    # 认证中间件
│   ├── validation.middleware.ts # 验证中间件
│   ├── rate-limit.middleware.ts # 限流中间件
│   ├── cors.middleware.ts    # CORS中间件
│   └── error.middleware.ts   # 错误处理中间件
├── validators/               # 数据验证器
│   ├── common/              # 通用验证器
│   ├── auth/                # 认证验证器
│   ├── users/               # 用户验证器
│   ├── orders/              # 订单验证器
│   ├── dispatch/            # 配送验证器
│   ├── couriers/            # 快递员验证器
│   ├── notifications/       # 通知验证器
│   ├── payments/            # 支付验证器
│   ├── inventory/           # 库存验证器
│   └── categories/          # 分类验证器
├── routes/                  # 路由配置
│   ├── v1/                 # v1版本路由
│   │   ├── index.ts        # 路由入口
│   │   ├── auth.routes.ts  # 认证路由
│   │   ├── users.routes.ts # 用户路由
│   │   ├── orders.routes.ts # 订单路由
│   │   ├── dispatch.routes.ts # 配送路由
│   │   ├── couriers.routes.ts # 快递员路由
│   │   ├── notifications.routes.ts # 通知路由
│   │   ├── payments.routes.ts # 支付路由
│   │   ├── inventory.routes.ts # 库存路由
│   │   └── categories.routes.ts # 分类路由
│   └── v2/                 # v2版本路由（未来扩展）
├── config/                 # 配置文件
│   ├── api.config.ts       # API配置
│   ├── database.config.ts  # 数据库配置
│   ├── redis.config.ts     # Redis配置
│   └── security.config.ts  # 安全配置
└── utils/                  # 工具函数
    ├── response.utils.ts   # 响应格式化
    ├── error.utils.ts      # 错误处理
    ├── validation.utils.ts # 验证工具
    └── pagination.utils.ts # 分页工具
```

## 核心功能

### 1. 接口版本管理

#### 版本策略
- **语义化版本控制**: 遵循 SemVer 规范 (major.minor.patch)
- **向后兼容**: 新版本保持向后兼容，废弃功能通过 deprecation 标记
- **版本路由**: 通过 URL 路径区分版本 (`/api/v1/`, `/api/v2/`)
- **版本生命周期**: 明确的版本支持周期和迁移计划

#### 版本管理实现
```typescript
// 版本配置
export const API_VERSIONS = {
  v1: {
    version: '1.0.0',
    deprecated: false,
    supportUntil: '2025-12-31',
    routes: '/api/v1',
  },
  v2: {
    version: '2.0.0',
    deprecated: false,
    supportUntil: '2026-12-31',
    routes: '/api/v2',
  },
};
```

### 2. 路由配置规范

#### 路由命名规范
- **RESTful设计**: 遵循REST API设计原则
- **资源导向**: 以资源为中心的URL设计
- **统一格式**: `/api/{version}/{resource}/{id?}/{action?}`

#### 路由配置示例
```typescript
// 标准CRUD路由
GET    /api/v1/users          # 获取用户列表
POST   /api/v1/users          # 创建用户
GET    /api/v1/users/:id      # 获取特定用户
PUT    /api/v1/users/:id      # 更新用户
DELETE /api/v1/users/:id      # 删除用户

// 嵌套资源路由
GET    /api/v1/users/:id/orders     # 获取用户订单
POST   /api/v1/users/:id/addresses  # 添加用户地址

// 操作路由
POST   /api/v1/orders/:id/cancel    # 取消订单
POST   /api/v1/orders/:id/confirm   # 确认订单
```

### 3. 中间件处理机制

#### 中间件执行顺序
1. **安全中间件**: CORS、Helmet、Rate Limiting
2. **认证中间件**: JWT验证、用户身份确认
3. **授权中间件**: 权限检查、角色验证
4. **验证中间件**: 请求参数验证、数据格式检查
5. **业务中间件**: 业务逻辑处理
6. **响应中间件**: 响应格式化、错误处理

#### 中间件配置
```typescript
// 中间件配置示例
export const middlewareConfig = {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 最大请求数
    message: 'Too many requests from this IP',
  },
  auth: {
    excludePaths: ['/api/v1/auth/login', '/api/v1/auth/register'],
    tokenExpiry: '24h',
  },
};
```

### 4. 错误统一处理

#### 错误分类
- **客户端错误 (4xx)**: 请求错误、验证失败、权限不足
- **服务端错误 (5xx)**: 系统错误、数据库错误、第三方服务错误
- **业务错误**: 业务逻辑相关的错误

#### 错误响应格式
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // 错误代码
    message: string;        // 错误消息
    details?: any;          // 详细信息
    timestamp: string;      // 时间戳
    path: string;          // 请求路径
    traceId: string;       // 追踪ID
  };
}
```

#### 错误处理示例
```typescript
// 统一错误处理
export class GlobalErrorHandler {
  static handle(error: Error, req: Request, res: Response) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: this.getErrorCode(error),
        message: this.getErrorMessage(error),
        details: this.getErrorDetails(error),
        timestamp: new Date().toISOString(),
        path: req.path,
        traceId: req.headers['x-trace-id'] as string,
      },
    };
    
    res.status(this.getStatusCode(error)).json(errorResponse);
  }
}
```

## 数据模型管理

### Prisma Schema 设计原则
- **统一数据模型**: 所有服务共享同一套数据模型定义
- **关系映射**: 清晰的表关系和外键约束
- **索引优化**: 合理的索引设计提升查询性能
- **数据迁移**: 版本化的数据库迁移脚本

### 模型示例
```prisma
model User {
  id              BigInt           @id @default(autoincrement())
  mobile          String?          @db.VarChar(20)
  nickname        String?          @db.VarChar(50)
  avatarUrl       String?          @map("avatar_url") @db.VarChar(255)
  status          UserStatus       @default(ACTIVE)
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")
  
  // 关系
  identities      UserIdentity[]
  addresses       Address[]
  orders          Order[]
  
  @@map("users")
  @@index([mobile])
  @@index([status])
}
```

## 安全考虑

### 1. 认证安全
- **JWT Token**: 使用RS256算法签名
- **Token刷新**: 实现refresh token机制
- **多设备登录**: 支持多设备同时登录管理

### 2. 授权控制
- **RBAC**: 基于角色的访问控制
- **资源权限**: 细粒度的资源访问控制
- **API权限**: 接口级别的权限控制

### 3. 数据安全
- **输入验证**: 严格的输入数据验证
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 输出数据转义和过滤

### 4. 传输安全
- **HTTPS强制**: 生产环境强制使用HTTPS
- **CORS配置**: 严格的跨域资源共享配置
- **请求限流**: 防止API滥用和DDoS攻击

## 性能优化

### 1. 缓存策略
- **Redis缓存**: 热点数据缓存
- **CDN加速**: 静态资源CDN分发
- **数据库缓存**: 查询结果缓存

### 2. 数据库优化
- **索引优化**: 合理的数据库索引设计
- **查询优化**: SQL查询性能优化
- **连接池**: 数据库连接池管理

### 3. API优化
- **分页查询**: 大数据量分页处理
- **字段选择**: 支持字段选择减少传输量
- **批量操作**: 支持批量数据操作

## 监控和日志

### 1. API监控
- **响应时间**: 接口响应时间监控
- **错误率**: 接口错误率统计
- **调用量**: API调用量统计

### 2. 日志管理
- **结构化日志**: 使用JSON格式的结构化日志
- **日志级别**: 合理的日志级别设置
- **日志聚合**: 集中式日志收集和分析

### 3. 链路追踪
- **请求追踪**: 分布式请求链路追踪
- **性能分析**: 接口性能瓶颈分析
- **错误定位**: 快速错误定位和排查

## 开发规范

### 1. 代码规范
- **TypeScript**: 使用TypeScript进行类型安全开发
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化

### 2. 测试规范
- **单元测试**: 核心业务逻辑单元测试
- **集成测试**: API接口集成测试
- **端到端测试**: 完整业务流程测试

### 3. 文档规范
- **API文档**: 详细的API接口文档
- **代码注释**: 清晰的代码注释
- **变更日志**: 版本变更记录

这个API目录结构设计为整个微服务架构提供了统一的接口规范、版本管理、安全控制和错误处理机制，确保了系统的可维护性、可扩展性和安全性。