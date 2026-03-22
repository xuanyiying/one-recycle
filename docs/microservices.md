# 微服务架构设计

## 1. 架构模式

OneRecycle 采用**混合架构模式**：
- **开发/测试环境**: NestJS 单体应用，所有模块共享进程
- **生产环境**: 通过 Docker Compose/K8s 拆分为独立微服务

这种模式兼顾了开发效率和部署灵活性。

## 2. 服务拆分

### 2.1 核心服务列表

| 服务 | 职责 | 数据域 |
|------|------|--------|
| api-gateway | 统一入口、路由分发、认证 | 无独立数据库 |
| account-service | 用户账户、余额、提现 | User, Account, Transaction, Withdrawal |
| order-service | 订单创建、状态流转 | Order, OrderItem, OrderAssignment |
| payment-service | 支付、退款、结算 | Payment, Refund, SettlementRecord |
| notification-service | 短信、邮件、推送 | Notification, NotificationTemplate |
| inventory-service | 库存、质检、入库 | InventoryItem, QualityCheck, Warehouse |
| category-service | 分类管理、定价 | Category, RecyclePricingRule |
| message-queue | 异步任务处理 | 无 (消费 Bull Queue) |

### 2.2 内部服务 (单体中为模块)

以下功能在单体中作为 NestJS 模块存在，生产环境可独立部署：

| 模块 | 职责 |
|------|------|
| auth | JWT 认证、第三方登录 |
| user | 用户信息管理 |
| logistics | 京东物流 API 对接 |
| dispatch | 智能派单调度 |
| points | 积分商城、签到、任务 |
| ai | 多 AI 供应商集成 |
| customer | 智能客服、工单 |
| voice-order | 语音下单 (ASR + 对话引擎) |
| content | FAQ、回收规则、文章 |
| settlement | 自动结算与对账 |
| tenant | 多租户管理 |

## 3. 通信方式

### 3.1 同步通信 (gRPC)

微服务间使用 gRPC 进行同步调用，通过 `.proto` 文件定义接口：

```protobuf
// 示例: 订单服务 -> 账户服务
service AccountService {
  rpc GetUser (GetUserRequest) returns (UserResponse);
  rpc FreezeBalance (FreezeRequest) returns (FreezeResponse);
}
```

### 3.2 异步通信 (Bull Queue)

通过 Redis-backed Bull Queue 实现异步任务处理：

| 队列 | 生产者 | 消费者 | 用途 |
|------|--------|--------|------|
| order | order-service | order.processor | 订单状态流转 |
| payment | payment-service | payment.processor | 支付/退款处理 |
| notification | 各服务 | notification.processor | 消息发送 |
| dispatch | dispatch-service | dispatch.processor | 派单调度 |

## 4. 数据一致性

### 4.1 共享数据库 (开发模式)

开发环境下所有模块共享同一个 PostgreSQL 数据库，通过 Prisma 统一管理。

### 4.2 最终一致性 (生产模式)

跨服务操作通过事件驱动保证最终一致性：

1. 服务 A 完成本地事务
2. 发布事件到 Bull Queue
3. 服务 B 消费事件，执行本地事务
4. 失败时触发补偿逻辑

## 5. 部署配置

### 5.1 Docker Compose (生产)

```bash
cd deploy/docker
docker compose -f docker-compose.production.yml up -d
```

### 5.2 Kubernetes

```bash
cd deploy/k8s
./k8s-deploy.sh
```

详见 [deploy/docs/K8S-DEPLOY.md](../deploy/docs/K8S-DEPLOY.md)

## 6. 扩展策略

- **水平扩展**: 无状态服务 (order, notification, queue) 可通过 K8s HPA 自动扩缩
- **数据库**: 读写分离，从库分担查询压力
- **缓存**: Redis Cluster 支持数据分片
- **队列**: 多 Worker 消费提升处理吞吐
