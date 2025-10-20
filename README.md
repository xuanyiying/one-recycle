# One Recycle - 微服务架构

一个基于 NestJS 的回收服务微服务架构项目。

## 项目结构

```
one-recycle/
├── services/
│   ├── user-service/          # 用户服务 (HTTP: 3003, gRPC: 50053)
│   ├── order-service/         # 订单服务 (HTTP: 3005, gRPC: 50055)
│   ├── payment-service/       # 支付服务 (HTTP: 3006, gRPC: 50056)
│   └── dispatch-service/      # 物流服务 (HTTP: 3007, gRPC: 50057)
├── shared/                    # 共享库
├── proto/                     # Protocol Buffers 定义
└── docker-compose.yml         # Docker 编排文件
```

## 服务端口分配

| 服务 | HTTP 端口 | gRPC 端口 | 描述 |
|------|-----------|-----------|------|
| user-service | 3003 | 50053 | 用户管理服务 |
| order-service | 3005 | 50055 | 订单管理服务 |
| payment-service | 3006 | 50056 | 支付处理服务 |
| dispatch-service | 3007 | 50057 | 物流配送服务 |

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有服务依赖
npm run install:all
```

### 2. 环境配置

每个服务都需要配置相应的环境变量，请参考各服务目录下的 `.env.example` 文件。

### 3. 启动服务

```bash
# 启动所有服务（开发模式）
npm run start:dev

# 或者单独启动服务
npm run start:user
npm run start:order
npm run start:payment
npm run start:dispatch
```

### 4. 构建服务

```bash
# 构建所有服务
npm run build:all

# 或者单独构建服务
npm run build:user
npm run build:order
npm run build:payment
npm run build:dispatch
```

## 开发指南

### 代码规范

```bash
# 检查代码规范
npm run lint:all

# 格式化代码
npm run format:all
```

### 测试

```bash
# 运行所有测试
npm run test:all

# 运行单个服务测试
npm run test:user
npm run test:order
npm run test:payment
npm run test:dispatch
```

## 服务架构

### 用户服务 (user-service)
- 用户注册、登录、认证
- 用户信息管理
- JWT 令牌管理

### 订单服务 (order-service)
- 订单创建、查询、更新
- 订单状态管理
- 与其他服务的协调

### 支付服务 (payment-service)
- 支付处理（支付宝、微信、Stripe、PayPal）
- 支付状态跟踪
- 退款处理

### 物流服务 (dispatch-service)
- 物流配送管理
- 快递公司集成（京东、顺丰、圆通）
- 物流状态跟踪

## API 文档

每个服务启动后，可以通过以下地址访问 API 文档：

- 用户服务: http://localhost:3003/api/docs
- 订单服务: http://localhost:3005/api/docs
- 支付服务: http://localhost:3006/api/docs
- 物流服务: http://localhost:3007/api/docs

## 技术栈

- **框架**: NestJS
- **语言**: TypeScript
- **数据库**: PostgreSQL (通过 Prisma ORM)
- **通信**: gRPC + HTTP REST
- **认证**: JWT
- **容器化**: Docker
- **测试**: Jest

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。