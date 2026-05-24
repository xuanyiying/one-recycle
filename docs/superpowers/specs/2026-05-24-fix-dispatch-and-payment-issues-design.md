# 修复派单取消效率与支付幂等性问题设计文档

## 1. 背景

本项目目前在 `cancelDispatch` 的实现上存在效率问题（内存过滤且有分页限制），同时在单体模式下的支付幂等性检查 `isTransactionProcessed` 始终返回 `false`，导致重复回调可能被多次处理。

## 2. 设计方案

### 2.1 优化 `cancelDispatch` (Issue 1)

**目标**：将过滤逻辑下推到数据库层，并通过 gRPC 接口透传过滤参数。

#### 变更点：
1.  **Proto 定义** (`server/src/proto/dispatch.proto`):
    *   在 `ListAssignmentsRequest` 消息中增加 `string orderId = 3;` 字段。
2.  **派单服务** (`server/src/modules/dispatch/dispatch.service.ts`):
    *   修改 `getAllAssignments` 方法，接收可选的 `orderId` 参数。
    *   在 Prisma 查询中使用 `where: { orderId: BigInt(orderId) }` 进行过滤。
3.  **gRPC 控制器** (`server/src/modules/dispatch/dispatch.grpc.controller.ts`):
    *   在 `listAssignments` 方法中从 `data` 获取 `orderId` 并传递给 service。
4.  **gRPC 客户端** (`server/src/modules/queue/clients/dispatch-service.grpc-client.ts`):
    *   在调用 `this.dispatchService.listAssignments` 时传入 `{ orderId }`。
    *   移除 `assignments.items.filter(...)` 逻辑，直接处理返回结果。

### 2.2 修复 `isTransactionProcessed` (Issue 2)

**目标**：在单体模式（Monolithic）下，通过 `LocalPaymentServiceAdapter` 正确调用 `PaymentService` 进行幂等性检查。

#### 变更点：
1.  **支付适配器** (`server/src/modules/queue/adapters/local-payment-service.adapter.ts`):
    *   修改构造函数，注入 `PaymentService`。
    *   实现 `isTransactionProcessed(transactionId: string)`：调用 `this.paymentService.isTransactionProcessed(BigInt(transactionId))`。
2.  **队列模块配置** (`server/src/modules/queue/queue.module.ts`):
    *   更新 `IPaymentService` 的工厂函数。
    *   增加 `PaymentService` 到注入列表（`inject`）。
    *   在单体模式下将 `PaymentService` 传递给 `LocalPaymentServiceAdapter` 构造函数。

## 3. 验证方案

### 3.1 派单取消验证
*   单元测试：模拟多条 assignment，验证 `cancelDispatch` 是否只取消特定 `orderId` 的任务。
*   集成测试：启动 dispatch 微服务，调用 gRPC 接口验证过滤是否生效。

### 3.2 支付幂等性验证
*   单元测试：在单体模式下，手动向 `payment_logs` 插入一条记录，再次调用适配器的 `isTransactionProcessed` 验证是否返回 `true`。
*   集成测试：模拟重复的支付回调任务进入队列，验证 `PaymentProcessor` 是否正确识别并跳过已处理的交易。

## 4. 潜在风险
*   **BigInt 转换**：在 gRPC (string) 与 Prisma (BigInt) 之间转换时需确保不丢失精度。
*   **Proto 重新生成**：修改 `.proto` 后需要运行 `npm run proto:generate` 更新生成的代码。
