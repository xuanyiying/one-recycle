# Message Queue Service

消息队列服务是OneRecycle系统的核心基础设施，负责处理所有异步任务和事件驱动的业务流程。

## 功能特性

- 🚀 基于Redis + Bull Queue的高性能消息队列
- 📊 内置Bull Board监控界面
- 🔄 自动重试和死信队列处理
- ⚡ 支持延迟队列和优先级队列
- 🎯 幂等性保证
- 📈 完整的监控指标和告警

## 队列列表

| 队列名称 | 用途 | 优先级 | 重试次数 |
|---------|------|--------|---------|
| order-queue | 订单处理 | 10 | 3 |
| notification-queue | 通知发送 | 8 | 3 |
| payment-queue | 支付处理 | 10 | 5 |
| dispatch-queue | 派单调度 | 9 | 3 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑.env文件配置Redis连接信息
```

### 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

### 访问监控界面

打开浏览器访问: http://localhost:3010/admin/queues

## API端点

### 健康检查
```
GET /health
```

### 队列管理
```
GET /queues                    # 获取所有队列状态
GET /queues/:name/stats        # 获取队列统计信息
POST /queues/:name/jobs/:id/retry  # 重试失败任务
DELETE /queues/:name/clean     # 清理已完成任务
POST /queues/:name/pause       # 暂停队列
POST /queues/:name/resume      # 恢复队列
```

### 监控指标
```
GET /metrics                   # Prometheus格式指标
```

## 开发指南

### 添加新队列

1. 在`queue.module.ts`中注册新队列
2. 创建队列服务（生产者）
3. 创建消息处理器（消费者）
4. 定义事件DTO

### 发布事件

```typescript
await orderQueueService.handleOrderCreated({
  orderId: '123',
  userId: '456',
  // ... 其他字段
});
```

### 处理消息

```typescript
@Processor('order-queue')
export class OrderProcessor {
  @Process('order-created')
  async handleOrderCreated(job: Job<OrderCreatedEvent>) {
    const { orderId } = job.data;
    // 处理逻辑
  }
}
```

## 监控和告警

### 监控指标

- 队列长度（waiting, active, completed, failed）
- 处理延迟（P50, P95, P99）
- 失败率
- 吞吐量

### 告警规则

- 队列积压 > 1000
- 失败率 > 5%
- 处理延迟 P95 > 10秒
- 死信队列有新任务

## 故障排查

### Redis连接失败

检查Redis服务是否运行：
```bash
docker ps | grep redis
```

### 任务处理失败

查看死信队列：
```
访问 http://localhost:3010/admin/queues
点击对应队列 -> Failed标签
```

### 性能问题

调整并发配置：
```typescript
@Processor('order-queue', {
  concurrency: 10  // 增加并发数
})
```

## 部署

### Docker部署

```bash
docker build -t message-queue-service .
docker run -p 3010:3010 \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  message-queue-service
```

### Docker Compose部署

```bash
docker-compose up -d message-queue
```

## 许可证

UNLICENSED