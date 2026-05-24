# 修复派单取消效率与支付幂等性问题实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化派单取消接口的效率并修复单体模式下的支付幂等性检查。

**Architecture:** 通过修改 Proto 协议透传过滤参数实现数据库级过滤，并在单体模式适配器中注入核心业务服务进行状态检查。

**Tech Stack:** NestJS, gRPC, Prisma, TypeScript, Bull MQ.

---

### Task 1: 优化派单取消接口 (Issue 1)

**Files:**
- Modify: `server/src/proto/dispatch.proto`
- Modify: `server/src/modules/dispatch/dispatch.service.ts`
- Modify: `server/src/modules/dispatch/dispatch.grpc.controller.ts`
- Modify: `server/src/modules/queue/clients/dispatch-service.grpc-client.ts`

- [ ] **Step 1: 修改 Proto 定义**
  在 `ListAssignmentsRequest` 中增加 `orderId` 字段（使用 `int64` 以保持一致性）。
  *已手动执行：`optional int64 orderId = 3;`*

- [ ] **Step 2: 重新生成 Proto 代码**
  运行：`cd server && npm run proto:generate`
  预期：`server/src/proto/dispatch.pb.ts` 已更新包含 `orderId`。

- [ ] **Step 3: 更新 DispatchService**
  修改 `getAllAssignments` 支持可选的 `orderId`。
  ```typescript
  async getAllAssignments(orderId?: string) {
    return this.prisma.orderAssignment.findMany({
      where: orderId ? { orderId: BigInt(orderId) } : {},
      orderBy: { assignedAt: 'desc' },
    });
  }
  ```

- [ ] **Step 4: 更新 DispatchGrpcController**
  透传 `orderId`。
  ```typescript
  @GrpcMethod('DispatchService', 'ListAssignments')
  async listAssignments(
    data: ListAssignmentsRequest,
  ): Promise<ListAssignmentsResponse> {
    const items = await this.dispatchService.getAllAssignments(data.orderId);
    return {
      items: items.map((item: any) => this.mapToAssignmentResponse(item)),
      total: items.length,
    };
  }
  ```

- [ ] **Step 5: 更新 gRPC 客户端**
  修改 `cancelDispatch` 传参并移除过滤。
  ```typescript
  const assignments = await new Promise<any>((resolve, reject) => {
    this.dispatchService.listAssignments(
      { page: 1, limit: 100, orderId }, // 增加 orderId
      (err: Error | null, res: any) => { ... }
    );
  });
  // 移除 orderAssignments 的内存 filter 逻辑
  const orderAssignments = assignments.items || [];
  ```

- [ ] **Step 6: 验证 Task 1**
  运行：`cd server && npm run typecheck`
  运行现有测试：`npm run test server/src/modules/dispatch/dispatch.service.spec.ts` (如果存在)

- [ ] **Step 7: 提交**
  `git add . && git commit -m "feat: optimize cancelDispatch with database-level filtering"`

---

### Task 2: 修复单体模式支付幂等性 (Issue 2)

**Files:**
- Modify: `server/src/modules/queue/adapters/local-payment-service.adapter.ts`
- Modify: `server/src/modules/queue/queue.module.ts`

- [ ] **Step 1: 修改适配器构造函数和方法**
  注入 `PaymentService` 并实现检查。
  ```typescript
  // 在 LocalPaymentServiceAdapter 中
  constructor(
    private readonly accountService: AccountService,
    private readonly paymentService: PaymentService, // 增加注入
  ) {}

  async isTransactionProcessed(transactionId: string): Promise<boolean> {
    try {
      const payment = await this.paymentService.isTransactionProcessed(BigInt(transactionId));
      return !!payment;
    } catch (error) {
      this.logger.error(`Failed to check idempotency for transaction ${transactionId}:`, error);
      return false; // 降级处理
    }
  }
  ```

- [ ] **Step 2: 更新 QueueModule 注入**
  修改 `IPaymentService` 的工厂。
  ```typescript
  {
    provide: 'IPaymentService',
    useFactory: (
      accountService: AccountService,
      paymentService: PaymentService, // 增加参数
      configService: ConfigService,
    ) => {
      // ...
      return new LocalPaymentServiceAdapter(accountService, paymentService);
    },
    inject: [AccountService, PaymentService, ConfigService], // 增加 PaymentService
  }
  ```

- [ ] **Step 3: 验证 Task 2**
  运行：`cd server && npm run typecheck`
  运行支付回调测试：`npm run test server/src/modules/queue/processors/payment.processor.spec.ts`

- [ ] **Step 4: 提交**
  `git add . && git commit -m "fix: implement real idempotency check in LocalPaymentServiceAdapter"`
