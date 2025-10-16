# Message Queue Service - 快速开始指南

## 前置要求

- Node.js >= 18.0.0
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

## 安装步骤

### 1. 安装依赖

```bash
cd services/message-queue
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/message_queue_db?schema=public

# 服务配置
PORT=3010
NODE_ENV=development

# 队列配置
QUEUE_REMOVE_ON_COMPLETE=100
QUEUE_REMOVE_ON_FAIL=1000

# Bull Board配置
BULL_BOARD_ENABLED=true
BULL_BOARD_PATH=/admin/queues
```

### 3. 启动依赖服务

```bash
# 在项目根目录
docker-compose up -d postgres redis
```

### 4. 初始化数据库

```bash
# 生成Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# (可选) 打开Prisma Studio查看数据
npm run prisma:studio
```

### 5. 启动服务

```bash
# 开发模式（带热重载）
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## 验证安装

### 1. 检查健康状态

```bash
curl http://localhost:3010/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T10:00:00Z",
  "queues": [
    {
      "name": "order-queue",
      "status": "healthy",
      "paused": false,
      "counts": {
        "waiting": 0,
        "active": 0,
        "completed": 0,
        "failed": 0
      }
    }
  ]
}
```

### 2. 访问Bull Board管理界面

打开浏览器访问：
```
http://localhost:3010/admin/queues
```

## 使用示例

### 发布订单创建事件

```typescript
import { OrderQueueService } from './queue/services/order-queue.service';

// 注入服务
constructor(private readonly orderQueueService: OrderQueueService) {}

// 发布事件
await this.orderQueueService.handleOrderCreated({
  orderId: '123',
  userId: '456',
  items: [
    {
      categoryId: 'cat1',
      quantity: 2,
      estimatedPrice: 50.00,
    }
  ],
  address: {
    id: 'addr1',
    fullAddress: '北京市朝阳区xxx',
  },
  scheduledTime: '2025-10-16T10:00:00Z',
});
```

### 发送通知

```typescript
import { NotificationQueueService, NotificationPriority } from './queue/services/notification-queue.service';

// 发送短信
await this.notificationQueueService.sendSms({
  phone: '13800138000',
  template: 'order_created',
  params: { orderId: '123' },
  priority: NotificationPriority.HIGH,
});

// 发送推送通知
await this.notificationQueueService.sendPush({
  userId: '456',
  title: '订单已创建',
  content: '您的订单123已成功创建',
  priority: NotificationPriority.NORMAL,
});
```

### 处理支付回调

```typescript
import { PaymentQueueService } from './queue/services/payment-queue.service';

await this.paymentQueueService.handlePaymentCallback({
  transactionId: 'txn_123',
  orderId: '123',
  amount: 100.00,
  status: 'success',
  provider: 'wechat',
  rawData: { /* 原始回调数据 */ },
  timestamp: new Date().toISOString(),
});
```

## 常见问题

### Q: Redis连接失败

**A:** 检查Redis是否正在运行：
```bash
docker ps | grep redis
# 如果没有运行，启动Redis
docker-compose up -d redis
```

### Q: 数据库连接失败

**A:** 检查DATABASE_URL配置是否正确，确保PostgreSQL正在运行：
```bash
docker ps | grep postgres
```

### Q: 任务处理失败

**A:** 查看日志：
```bash
# 如果使用Docker
docker-compose logs -f message-queue

# 如果本地运行
# 查看控制台输出
```

查看死信队列：
```
访问 http://localhost:3010/admin/queues
点击对应队列 -> Failed标签
```

### Q: 如何清理已完成的任务

**A:** 使用队列服务的清理方法：
```typescript
await orderQueueService.cleanCompleted(0); // 立即清理
await orderQueueService.cleanCompleted(3600000); // 清理1小时前的
```

或通过Bull Board UI手动清理。

### Q: 如何暂停/恢复队列

**A:** 使用队列服务的方法：
```typescript
// 暂停队列
await orderQueueService.pause();

// 恢复队列
await orderQueueService.resume();
```

或通过Bull Board UI操作。

## 开发技巧

### 1. 查看队列统计

```typescript
const stats = await orderQueueService.getQueueStats();
console.log(stats);
// {
//   waiting: 10,
//   active: 2,
//   completed: 1000,
//   failed: 5,
//   delayed: 3,
//   paused: false
// }
```

### 2. 使用幂等性服务

```typescript
import { IdempotencyService } from './common/services/idempotency.service';

await this.idempotencyService.processWithIdempotency(
  'unique-job-id',
  'job-type',
  'queue-name',
  payload,
  async () => {
    // 实际处理逻辑
    return result;
  }
);
```

### 3. 生成幂等性键

```typescript
const jobId = IdempotencyService.generateIdempotencyKey(
  'payment-callback',
  transactionId,
  orderId
);
// 结果: "payment-callback-txn_123-order_456"
```

### 4. 调整并发数

在处理器中修改并发配置：
```typescript
@Processor('order-queue', {
  concurrency: 10  // 增加到10个并发
})
```

## 监控和调试

### 查看实时日志

```bash
# Docker环境
docker-compose logs -f message-queue

# 本地开发
# 日志会输出到控制台
```

### 使用Prisma Studio查看数据

```bash
npm run prisma:studio
```

访问 http://localhost:5555 查看：
- job_status 表：任务状态
- dead_letter_queue 表：失败任务

### Bull Board功能

访问 http://localhost:3010/admin/queues 可以：
- 查看所有队列状态
- 查看任务详情
- 手动重试失败任务
- 清理已完成任务
- 暂停/恢复队列

## 下一步

- 阅读 [README.md](./README.md) 了解更多功能
- 查看 [设计文档](../../.kiro/specs/message-queue-integration/design.md)
- 查看 [实施总结](../../docs/message-queue-implementation-summary.md)
- 集成到现有业务服务中

## 获取帮助

如果遇到问题：
1. 查看日志输出
2. 检查Bull Board中的失败任务
3. 查看Prisma Studio中的数据库记录
4. 参考项目文档

---

**祝开发顺利！** 🚀