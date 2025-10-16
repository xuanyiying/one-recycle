# OneRecycle - 多平台旧物回收小程序

## 项目介绍

OneRecycle 是一个多平台旧物回收小程序，支持微信、支付宝、抖音、快手等主流平台。用户可以通过小程序提交旧物回收订单，预约上门回收服务。

## 技术架构

### 前端
- **小程序**: Taro 3 + React + TypeScript
- **管理后台**: Next.js + Ant Design

### 后端 (微服务架构)
- **框架**: Node.js + NestJS
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **通信**: gRPC (内部服务), RESTful API (外部接口)
- **部署**: Docker + Nginx

### 服务列表
1. **Account Service**: 用户认证、个人信息管理
2. **Order Service**: 订单管理
3. **Payment Service**: 支付服务
4. **Courier Service**: 快递员管理
5. **Notification Service**: 通知服务
6. **Message Queue Service**: 消息队列服务（异步任务处理）
7. **API Gateway**: API 网关

## 项目结构

```
.
├── apps/
│   ├── client-mini/     # 小程序前端
│   └── admin-web/       # 管理后台
├── services/
│   ├── account-service/ # 用户服务
│   ├── order-service/   # 订单服务
│   ├── payment-service/ # 支付服务
│   ├── courier-service/ # 快递员服务
│   ├── notification-service/ # 通知服务
│   └── api-gateway/     # API 网关
├── packages/
│   └── shared/          # 共享工具和类型
├── docs/                # 文档
└── docker-compose.yml   # Docker 配置
```

# Services 目录结构

## 1. 整体结构

```
services/
├── shared/                           # 共享库
│   ├── common/                       # 通用工具和装饰器
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── utils/
│   │   └── index.ts
│   ├── types/                        # 共享类型定义
│   │   ├── auth.types.ts
│   │   ├── common.types.ts
│   │   ├── grpc.types.ts
│   │   └── index.ts
│   ├── config/                       # 共享配置
│   │   ├── database.config.ts
│   │   ├── grpc.config.ts
│   │   ├── redis.config.ts
│   │   └── index.ts
│   ├── database/                     # 数据库相关
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── index.ts
│   └── proto/                        # 共享Proto文件
│       ├── common.proto
│       └── generated/
├── libs/                             # 业务库
│   ├── auth/                         # 认证库
│   ├── payment/                      # 支付库
│   └── notification/                 # 通知库
├── account-service/                  # 账户服务
├── order-service/                    # 订单服务
├── payment-service/                  # 支付服务
├── courier-service/                  # 快递员服务
├── category-service/                 # 分类服务
├── inventory-service/                # 库存服务
├── notification-service/             # 通知服务
├── dispatch-service/                 # 派单服务
├── api-gateway/                      # API网关
├── package.json                      # 根依赖管理
├── tsconfig.json                     # 根TypeScript配置
├── jest.config.js                    # 根Jest配置
└── docker-compose.yml                # 开发环境配置
```

## 2. 标准化的微服务结构

每个微服务遵循以下标准结构：

```
service-name/
├── src/
│   ├── main.ts                       # 应用入口
│   ├── app.module.ts                 # 根模块
│   ├── app.controller.ts             # 应用控制器
│   ├── modules/                      # 业务模块
│   │   ├── [domain]/                 # 领域模块
│   │   │   ├── [domain].module.ts
│   │   │   ├── [domain].service.ts
│   │   │   ├── [domain].controller.ts
│   │   │   ├── [domain].grpc.controller.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-[domain].dto.ts
│   │   │   │   ├── update-[domain].dto.ts
│   │   │   │   └── index.ts
│   │   │   ├── entities/
│   │   │   │   ├── [domain].entity.ts
│   │   │   │   └── index.ts
│   │   │   └── interfaces/
│   │   │       ├── [domain].interface.ts
│   │   │       └── index.ts
│   │   └── index.ts
│   ├── common/                       # 服务特定的通用代码
│   │   ├── constants/
│   │   ├── enums/
│   │   └── types/
│   ├── config/                       # 配置文件
│   │   ├── app.config.ts
│   │   └── index.ts
│   └── proto/                        # Proto文件
│       ├── [service].proto
│       └── generated/
├── test/                             # 测试文件
│   ├── unit/                         # 单元测试
│   │   ├── modules/
│   │   └── common/
│   ├── integration/                  # 集成测试
│   ├── e2e/                          # 端到端测试
│   ├── fixtures/                     # 测试数据
│   ├── mocks/                        # Mock文件
│   ├── setup.ts                      # 测试设置
│   └── test-utils.ts                 # 测试工具
├── prisma/                           # Prisma配置
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
├── docs/                             # 文档
│   ├── api.md
│   └── README.md
├── Dockerfile                        # Docker配置
├── package.json                      # 依赖管理
├── tsconfig.json                     # TypeScript配置
├── jest.config.js                    # Jest配置
└── .env.example                      # 环境变量示例
```

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- Docker (可选，用于数据库)
- 微信开发者工具 (小程序调试)

### 安装依赖
```bash
npm run install:all
```

### 启动开发环境

#### 启动后端服务
```bash
# 启动基础设施 (数据库、Redis)
docker-compose up -d postgres redis

# 启动消息队列服务
cd services/message-queue
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev

# 启动其他微服务
npm run dev:api
```

#### 启动前端
```bash
# 启动管理后台
npm run dev:admin

# 启动小程序 (需要在 apps/client-mini 目录下)
cd apps/client-mini
npm run dev:weapp
```

## 项目文档

详细的设计文档请查看 [docs](./docs) 目录：

- [架构设计](./docs/architecture.md)
- [数据库设计](./docs/database.md)
- [微服务设计](./docs/microservices.md)
- [UI/UX 设计](./docs/ui-ux.md)

## 开发规范

- 使用 TypeScript 进行类型检查
- 遵循微服务架构原则
- 使用 Prisma 进行数据库操作
- 统一的错误处理机制
- 完善的日志记录

## 部署

### 开发环境
使用 docker-compose 一键启动所有服务。

### 生产环境
推荐使用 Kubernetes 进行部署，配合云服务商的托管服务（如 RDS、Redis 等）。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。