# 生产代码验证指南

## 🎯 验证目标

确认所有模拟代码已被移除，所有功能使用真实的服务调用。

## ✅ 快速验证清单

### 1. 代码检查

运行以下命令检查是否还有模拟代码：

```bash
# 检查是否还有setTimeout模拟延迟
grep -r "setTimeout.*resolve" src/queue/processors/*.ts

# 应该返回：无结果（或只在注释中）

# 检查是否还有"模拟"注释
grep -r "模拟" src/queue/processors/*.ts

# 应该返回：无结果（或只在文档中）
```

### 2. TypeScript编译检查

```bash
# 编译检查
npm run build

# 应该成功编译，无错误
```

### 3. 依赖注入检查

验证所有处理器都正确注入了服务客户端：

#### PaymentProcessor
```typescript
✅ OrderServiceClient
✅ PaymentServiceClient  
✅ PaymentLogRepository
✅ NotificationQueueService
```

#### NotificationProcessor
```typescript
✅ NotificationServiceClient
```

#### OrderProcessor
```typescript
✅ OrderServiceClient
✅ InventoryServiceClient
✅ DispatchServiceClient
✅ PaymentServiceClient
✅ NotificationQueueService
```

### 4. 环境变量检查

确保 `.env` 文件包含所有必需的服务URL：

```bash
# 检查环境变量
cat .env | grep SERVICE_URL

# 应该包含：
# ORDER_SERVICE_URL=...
# PAYMENT_SERVICE_URL=...
# NOTIFICATION_SERVICE_URL=...
# DISPATCH_SERVICE_URL=...
# INVENTORY_SERVICE_URL=...
```

## 🧪 功能测试

### 测试1: 支付回调处理

```bash
# 启动服务
npm run start:dev

# 发送测试支付回调
curl -X POST http://localhost:3010/queue/test/payment-callback \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "test_txn_001",
    "orderId": "test_order_001",
    "amount": 100.00,
    "status": "success",
    "provider": "wechat",
    "rawData": {}
  }'
```

**预期结果**:
- ✅ 调用 OrderServiceClient.getOrder()
- ✅ 调用 OrderServiceClient.updateOrderStatus()
- ✅ 调用 PaymentLogRepository.createPaymentLog()
- ✅ 发送通知到NotificationQueue
- ✅ 无setTimeout延迟
- ✅ 返回真实的处理结果

**检查日志**:
```bash
tail -f logs/message-queue.log | grep "Payment"

# 应该看到：
# [PaymentProcessor] Processing payment callback: Transaction test_txn_001
# [PaymentProcessor] Fetching order details for: test_order_001
# [OrderServiceClient] Request: GET /orders/test_order_001
# [PaymentProcessor] Payment callback processed successfully
```

### 测试2: 通知发送

```bash
# 发送测试短信通知
curl -X POST http://localhost:3010/queue/test/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "template": "ORDER_CREATED",
    "params": {
      "orderNo": "ORD123456"
    }
  }'
```

**预期结果**:
- ✅ 调用 NotificationServiceClient.sendSms()
- ✅ 真实的HTTP请求到通知服务
- ✅ 返回真实的messageId
- ✅ 无模拟延迟

**检查日志**:
```bash
tail -f logs/message-queue.log | grep "Notification"

# 应该看到：
# [NotificationProcessor] Processing SMS notification: 13800138000
# [NotificationServiceClient] Sending SMS to 13800138000
# [NotificationServiceClient] Request: POST /notifications/sms
# [NotificationProcessor] SMS sent successfully
```

### 测试3: 订单完成流程

```bash
# 发送订单完成事件
curl -X POST http://localhost:3010/queue/test/order-completed \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test_order_001",
    "userId": "user_001",
    "settlementAmount": 50.00,
    "completedAt": "2025-10-16T10:00:00Z"
  }'
```

**预期结果**:
- ✅ 调用 PaymentServiceClient.increaseBalance()
- ✅ 真实的积分入账
- ✅ 发送通知
- ✅ 返回真实的交易ID和余额

## 🔍 详细验证步骤

### 步骤1: 启动所有依赖服务

```bash
# 启动数据库和Redis
docker-compose up -d postgres redis

# 启动所有微服务
cd services
./start-all-services.sh

# 等待所有服务启动完成
./check-services-status.sh
```

### 步骤2: 运行数据库迁移

```bash
cd services/message-queue
npm run prisma:migrate
npm run prisma:generate
```

### 步骤3: 启动消息队列服务

```bash
npm run start:dev
```

### 步骤4: 访问Bull Board

打开浏览器访问: http://localhost:3010/admin/queues

**检查项**:
- ✅ 所有队列都显示
- ✅ 无积压任务
- ✅ 无失败任务

### 步骤5: 检查健康状态

```bash
curl http://localhost:3010/health

# 应该返回：
# {
#   "status": "ok",
#   "info": {
#     "database": { "status": "up" },
#     "redis": { "status": "up" }
#   }
# }
```

## 📊 性能验证

### 响应时间检查

```bash
# 测试支付回调处理时间
time curl -X POST http://localhost:3010/queue/test/payment-callback \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"test","orderId":"test","amount":100,"status":"success","provider":"wechat","rawData":{}}'

# 预期：< 500ms（不包括网络延迟）
```

### 吞吐量检查

```bash
# 使用Apache Bench测试
ab -n 100 -c 10 -p payment-callback.json -T application/json \
  http://localhost:3010/queue/test/payment-callback

# 预期：> 100 req/s
```

## ❌ 常见问题排查

### 问题1: 服务连接失败

**症状**: `ECONNREFUSED` 错误

**检查**:
```bash
# 检查服务是否运行
./check-services-status.sh

# 检查环境变量
echo $ORDER_SERVICE_URL
echo $PAYMENT_SERVICE_URL
echo $NOTIFICATION_SERVICE_URL
```

**解决**:
```bash
# 启动缺失的服务
cd services/order-service && npm run start:dev
cd services/payment-service && npm run start:dev
cd services/notification-service && npm run start:dev
```

### 问题2: 数据库连接失败

**症状**: `Can't reach database server` 错误

**检查**:
```bash
# 检查PostgreSQL是否运行
docker ps | grep postgres

# 检查数据库连接
psql $DATABASE_URL -c "SELECT 1"
```

**解决**:
```bash
# 启动PostgreSQL
docker-compose up -d postgres

# 运行迁移
npm run prisma:migrate
```

### 问题3: Redis连接失败

**症状**: `ECONNREFUSED localhost:6379` 错误

**检查**:
```bash
# 检查Redis是否运行
docker ps | grep redis

# 测试Redis连接
redis-cli ping
```

**解决**:
```bash
# 启动Redis
docker-compose up -d redis
```

## ✅ 验证通过标准

所有以下条件都满足时，验证通过：

1. ✅ 代码中无 `setTimeout` 模拟延迟
2. ✅ 代码中无"模拟"相关注释
3. ✅ TypeScript编译无错误
4. ✅ 所有服务客户端正确注入
5. ✅ 环境变量配置完整
6. ✅ 健康检查返回正常
7. ✅ 支付回调测试通过
8. ✅ 通知发送测试通过
9. ✅ 订单完成测试通过
10. ✅ Bull Board显示正常
11. ✅ 日志显示真实的服务调用
12. ✅ 响应时间符合预期

## 📝 验证报告模板

```markdown
# 生产代码验证报告

**验证日期**: 2025-10-16
**验证人员**: [姓名]
**环境**: [开发/测试/生产]

## 验证结果

- [ ] 代码检查通过
- [ ] 编译检查通过
- [ ] 依赖注入检查通过
- [ ] 环境变量检查通过
- [ ] 功能测试通过
- [ ] 性能测试通过

## 测试结果

### 支付回调测试
- 状态: [通过/失败]
- 响应时间: [XXms]
- 备注: [...]

### 通知发送测试
- 状态: [通过/失败]
- 响应时间: [XXms]
- 备注: [...]

### 订单完成测试
- 状态: [通过/失败]
- 响应时间: [XXms]
- 备注: [...]

## 问题记录

[记录发现的问题]

## 结论

[通过/需要修复]

**签名**: ___________
**日期**: ___________
```

---

**验证完成后，系统即可部署到生产环境！** 🚀
