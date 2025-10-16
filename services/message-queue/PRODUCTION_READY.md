# 生产环境就绪指南

## 概述

本文档说明如何将消息队列服务从开发环境的模拟逻辑升级为生产环境的真实业务逻辑。

## ✅ 已完成的生产化改造

### 1. 服务客户端实现

已创建真实的HTTP客户端，用于与其他微服务通信：

#### OrderServiceClient (`src/clients/order-service.client.ts`)
- ✅ 获取订单详情
- ✅ 更新订单状态
- ✅ 更新订单总价
- ✅ 分配快递员
- ✅ 取消订单
- ✅ 检查支付状态

#### DispatchServiceClient (`src/clients/dispatch-service.client.ts`)
- ✅ 自动派单（调用京东快递API）
- ✅ 手动派单
- ✅ 取消派单
- ✅ 查询运单状态
- ✅ 重新分配快递员

#### InventoryServiceClient (`src/clients/inventory-service.client.ts`)
- ✅ 检查库存
- ✅ 锁定库存
- ✅ 释放库存
- ✅ 扣减库存

#### PaymentServiceClient (`src/clients/payment-service.client.ts`)
- ✅ 发起退款
- ✅ 查询退款状态
- ✅ 获取订单支付信息

### 2. 订单处理器生产化

#### 订单创建处理 (`handleOrderCreated`)
**之前（模拟）**:
```typescript
// 模拟库存检查
await this.simulateInventoryCheck(items);
// 模拟价格计算
const totalAmount = await this.calculateTotalPrice(items);
```

**现在（生产）**:
```typescript
// 1. 真实库存检查
const inventoryCheck = await this.inventoryServiceClient.checkInventory({...});

// 2. 锁定库存
await this.inventoryServiceClient.lockInventory({...});

// 3. 计算并更新订单总价
await this.orderServiceClient.updateOrderAmount(orderId, totalAmount);

// 4. 更新订单状态
await this.orderServiceClient.updateOrderStatus(orderId, 'CONFIRMED');
```

#### 派单处理 (`handleDispatchOrder`)
**之前（模拟）**:
```typescript
// 仅打印日志
this.logger.log(`Finding available courier for order: ${orderId}`);
this.logger.log(`Assigning courier to order: ${orderId}`);
```

**现在（生产）**:
```typescript
// 1. 获取订单详情
const order = await this.orderServiceClient.getOrder(orderId);

// 2. 调用派单服务（集成京东快递API）
const dispatchResult = await this.dispatchServiceClient.autoDispatch({
  orderId: order.id,
  address: {...},
  items: [...],
  scheduledTime: order.scheduledTime,
  serviceType: 'STANDARD',
});

// 3. 更新订单信息（快递员和运单号）
await this.orderServiceClient.assignCourier(
  orderId,
  dispatchResult.courierId,
  dispatchResult.waybillNo,
);

// 4. 更新订单状态为已派单
await this.orderServiceClient.updateOrderStatus(orderId, 'DISPATCHED', {
  waybillNo: dispatchResult.waybillNo,
  jdOrderNo: dispatchResult.jdOrderNo,
});
```

#### 订单取消处理 (`handleOrderCancelled`)
**之前（模拟）**:
```typescript
// 仅打印日志
this.logger.log(`Releasing inventory for order: ${orderId}`);
this.logger.log(`Checking if refund is needed for order: ${orderId}`);
```

**现在（生产）**:
```typescript
// 1. 释放库存
await this.inventoryServiceClient.releaseInventory(orderId);

// 2. 取消京东快递订单
if (order.waybillNo) {
  await this.dispatchServiceClient.cancelDispatch(orderId, reason);
}

// 3. 发起退款
if (isPaid) {
  await this.paymentServiceClient.initiateRefund({
    orderId,
    transactionId: paymentInfo.transactionId,
    amount: order.totalAmount,
    reason,
    requestedBy: cancelledBy,
  });
}

// 4. 更新订单状态
await this.orderServiceClient.updateOrderStatus(orderId, 'CANCELLED', {...});
```

## 🔄 完整业务流程

### 用户下单流程

```
1. 用户提交订单
   ↓
2. Order Service 创建订单
   ↓
3. 发布 order-created 事件到消息队列
   ↓
4. OrderProcessor 处理订单创建
   ├─ 检查库存（Inventory Service）
   ├─ 锁定库存
   ├─ 计算总价
   ├─ 更新订单状态为 CONFIRMED
   └─ 发送确认通知
   ↓
5. 延迟5分钟后，发布 dispatch-order 事件
   ↓
6. OrderProcessor 处理派单
   ├─ 获取订单详情（Order Service）
   ├─ 调用派单服务（Dispatch Service）
   │  └─ 调用京东快递API创建取件订单
   ├─ 更新订单信息（快递员、运单号）
   ├─ 更新订单状态为 DISPATCHED
   └─ 发送派单通知
   ↓
7. 快递员上门取件
   ↓
8. 订单完成，触发支付
   ↓
9. 发送完成通知
```

### 订单取消流程

```
1. 用户/系统取消订单
   ↓
2. 发布 order-cancelled 事件
   ↓
3. OrderProcessor 处理订单取消
   ├─ 释放库存（Inventory Service）
   ├─ 取消京东快递订单（Dispatch Service）
   ├─ 发起退款（Payment Service）
   ├─ 更新订单状态为 CANCELLED
   └─ 发送取消通知
```

## 📋 环境变量配置

确保在 `.env` 文件中配置所有微服务URL：

```bash
# 微服务URL配置
ORDER_SERVICE_URL=http://localhost:3003
DISPATCH_SERVICE_URL=http://localhost:3006
INVENTORY_SERVICE_URL=http://localhost:3009
PAYMENT_SERVICE_URL=http://localhost:3007
NOTIFICATION_SERVICE_URL=http://localhost:3004
COURIER_SERVICE_URL=http://localhost:3005
```

**生产环境示例**:
```bash
ORDER_SERVICE_URL=http://order-service:3003
DISPATCH_SERVICE_URL=http://dispatch-service:3006
INVENTORY_SERVICE_URL=http://inventory-service:3009
PAYMENT_SERVICE_URL=http://payment-service:3007
```

## 🔌 服务依赖

消息队列服务现在依赖以下服务：

1. **Order Service** (端口 3003)
   - 订单CRUD操作
   - 订单状态管理

2. **Dispatch Service** (端口 3006)
   - 京东快递API集成
   - 派单逻辑
   - 运单管理

3. **Inventory Service** (端口 3009)
   - 库存检查
   - 库存锁定/释放

4. **Payment Service** (端口 3007)
   - 退款处理
   - 支付状态查询

5. **Notification Service** (端口 3004)
   - 短信/推送/邮件通知

## ⚠️ 注意事项

### 1. 错误处理

所有服务调用都包含完整的错误处理：

```typescript
try {
  await this.inventoryServiceClient.lockInventory({...});
} catch (error) {
  this.logger.error(`Failed to lock inventory: ${orderId}`, error);
  // 释放已锁定的资源
  await this.inventoryServiceClient.releaseInventory(orderId);
  throw error;
}
```

### 2. 幂等性

- 支付相关操作使用 `transactionId` 作为唯一标识
- 订单操作使用 `orderId` 作为唯一标识
- 所有操作都记录在 `job_status` 表中

### 3. 重试机制

- 库存操作：3次重试，指数退避
- 派单操作：5次重试，指数退避
- 支付操作：5次重试，指数退避

### 4. 超时配置

- Order Service: 10秒
- Dispatch Service: 30秒（京东API可能较慢）
- Inventory Service: 5秒
- Payment Service: 10秒

## 🚀 部署检查清单

### 开发环境
- [ ] 所有微服务都在运行
- [ ] Redis 正常运行
- [ ] PostgreSQL 正常运行
- [ ] 环境变量配置正确
- [ ] 服务间网络连通

### 生产环境
- [ ] 使用生产环境的服务URL
- [ ] 配置服务发现（如 Consul、Kubernetes Service）
- [ ] 配置负载均衡
- [ ] 启用健康检查
- [ ] 配置监控告警
- [ ] 配置日志收集
- [ ] 配置备份策略

## 🧪 测试

### 单元测试
```bash
npm run test
```

### 集成测试
```bash
# 确保所有服务都在运行
docker-compose up -d

# 运行集成测试
npm run test:e2e
```

### 手动测试

1. **测试订单创建**:
```bash
curl -X POST http://localhost:3010/test/order-created \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-001",
    "userId": "user-001",
    "items": [...],
    "address": {...}
  }'
```

2. **检查队列状态**:
```bash
curl http://localhost:3010/health
```

3. **查看Bull Board**:
```
http://localhost:3010/admin/queues
```

## 📊 监控指标

关键指标：
- 订单处理成功率
- 派单成功率
- 库存操作成功率
- 平均处理时间
- 队列积压数量
- 失败任务数量

## 🔧 故障排查

### 问题：派单失败

**可能原因**:
1. Dispatch Service 未运行
2. 京东快递API配置错误
3. 订单地址信息不完整

**解决方案**:
1. 检查 Dispatch Service 日志
2. 验证京东API密钥
3. 检查订单数据完整性

### 问题：库存操作失败

**可能原因**:
1. Inventory Service 未运行
2. 数据库连接问题
3. 库存不足

**解决方案**:
1. 检查 Inventory Service 状态
2. 验证数据库连接
3. 查看库存日志

## 📚 相关文档

- [QUICKSTART.md](./QUICKSTART.md) - 快速开始
- [README.md](./README.md) - 项目说明
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查
- [设计文档](../../.kiro/specs/message-queue-integration/design.md)

---

**状态**: ✅ 生产就绪  
**最后更新**: 2025-10-15  
**版本**: 1.0.0