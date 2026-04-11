# OneRecycle Server 代码审查报告

## 摘要

OneRecycle Server 是一个基于 NestJS + Prisma 的旧物回收平台后端，覆盖订单、支付、派单、库存、通知、积分、财务、AI 分类等核心业务模块。项目整体架构合理、模块化程度高，核心业务链路（下单-派单-取件-质检-入库-结算）已完整实现。但存在若干影响上线的 Bug 和安全隐患需要修复，通知和支付模块仍依赖 Mock 实现，距离生产部署还需完成真实服务商对接和关键安全加固。

---

## 一、功能完整性评估

### 已完成的核心模块

| 模块 | 完整度 | 说明 |
|------|--------|------|
| 订单 (Order) | 90% | 完整的状态机流转（PENDING -> COMPLETED），支持创建/查询/取消/状态变更，时间槽管理，AI 评分接口存在但为 Mock 实现 |
| 支付 (Payment) | 75% | 支持微信/支付宝转账，退款流程完整，但 `handlePaymentNotify` 未验证回调签名 |
| 派单 (Dispatch) | 80% | 手动指派+自动派单逻辑，但自动派单的调度策略较简单 |
| 账户 (Account) | 95% | 钱包余额管理、充值、事务安全（乐观锁+重试），设计完善 |
| 物流 (Logistics) | 70% | 物流商管理 CRUD 完成，运费计算为硬编码公式，未对接真实物流 API |
| 用户 (User) | 90% | CRUD + 第三方身份绑定，手机号/用户名查重 |
| 认证 (Auth) | 85% | 手机验证码登录 + 微信/支付宝/抖音/快手第三方登录，验证码限频 |
| 库存 (Inventory) | 85% | 库存项 CRUD、预订/确认/取消/过期释放，事务安全 |
| 通知 (Notification) | 50% | 接口完整但 `processNotification` 完全为 Mock，所有通知均自动标记为 DELIVERED |
| 积分 (Points) | 80% | 签到、积分记录、兑换商品、管理端统计 |
| 财务 (Finance) | 75% | 平台/租户充值、交易记录、支出统计，但支付密码用 SHA256 无盐 |
| AI (AI) | 80% | 多提供商路由（OpenAI/百度/阿里/腾讯/Ollama/SiliconCloud/OpenRouter），故障转移，健康检查 |
| 存储 (Storage) | 90% | OSS 对接（腾讯 COS/阿里 OSS/MinIO/AWS S3），文件去重、批量上传、过期清理 |
| 租户 (Tenant) | 75% | 订单分配策略（最小负载）、余额检查、收货地址 |

### 未完成 / Mock 实现

1. **AI 评分**（`OrderService.performAiGrading`）：返回硬编码的 `category: 'Recyclable', condition: 'Good', confidence: 0.88`，未调用真实 AI 服务。
2. **通知发送**（`NotificationService.processNotification`）：`const success = true;` 硬编码，所有通知直接标记为 DELIVERED。
3. **物流运费计算**（`LogisticsService.calculateFreight`）：公式 `10 + weight * 2 + distance * 0.5`，未对接真实物流商 API。
4. **短信发送**（`AuthRedisService.sendSMS`）：依赖 `NotificationService`，实际为空操作，开发环境仅打印到控制台。
5. **支付回调验证**：`handlePaymentNotify` 直接信任传入数据，未验证微信/支付宝回调签名。

---

## 二、Bug 和问题清单

### 严重级别 (P0) - 必须修复才能上线

**1. 订单控制器缺少认证保护**
`order.controller.ts` 所有端点均未使用 `@UseGuards(JwtAuthGuard)` 或 `@Public()` 装饰器，意味着任何人无需登录即可创建订单、修改状态、删除订单。同样的问题可能存在于其他控制器（dispatch、courier、finance 等）。

```34:46:server/src/modules/order/order.controller.ts
  @Post()
  @ApiOperation({ summary: '创建订单' })
  async create(@Body() createOrderData: CreateOrderDto): Promise<Order> {
```

**2. 支付回调未验证签名**
`PaymentService.handlePaymentNotify` 接受任意 `notifyData`，无签名校验。攻击者可伪造支付成功通知，导致未付款订单被标记为已支付。

```210:240:server/src/modules/payment/payment.service.ts
  async handlePaymentNotify(notifyData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { outTradeNo: notifyData.outTradeNo },
    });
    // ... 直接更新状态，无签名验证
```

**3. 财务模块支付密码使用无盐 SHA256**
`FinanceService.setPaymentPassword` 使用 `crypto.createHash('sha256').update(password)` 计算密码哈希，无盐值，容易被彩虹表攻击。应使用 bcrypt 或 argon2。

```253:264:server/src/modules/finance/finance.service.ts
  async setPaymentPassword(password: string) {
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
```

**4. 财务模块充值接口缺少防重入保护**
`mockPaySuccess` 方法检查了 `order.status !== 'PENDING'`，但在高并发场景下，两个请求可能同时通过此检查，导致余额被重复增加。虽然后续的 `$transaction` 有 version 字段，但 `rechargeOrder.update` 并未利用 version 做乐观锁。

```90:112:server/src/modules/finance/finance.service.ts
  async mockPaySuccess(orderNo: string, tenantId?: string) {
    const order = await this.prisma.rechargeOrder.findUnique({
      where: { orderNo },
    });
    if (!order || order.status !== 'PENDING') {
```

### 高级别 (P1) - 建议上线前修复

**5. 开发环境万能验证码未做环境变量控制**
`AuthRedisService.verifyCode` 中，当 `NODE_ENV === 'development' || 'test'` 时，验证码 `123456` 可直接通过。如果生产环境误设为 development 模式，将导致严重安全问题。建议改为通过独立的环境变量 `ALLOW_MOCK_CODE` 控制。

```453:486:server/src/modules/auth/auth-redis.service.ts
  private async verifyCode(phone: string, code: string): Promise<boolean> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const isDevOrTest = nodeEnv === 'development' || nodeEnv === 'test';
    if (isDevOrTest && code === '123456') {
      return true;
    }
```

**6. 订单删除接口缺少权限校验**
`OrderController.remove` 允许任何已认证用户删除任意订单，无资源所有权检查。

```288:294:server/src/modules/order/order.controller.ts
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.orderService.remove(id);
  }
```

**7. 退款金额类型不匹配**
`PaymentService.createRefund` 中 `refundAmount` 参数类型为 `number`，但与 `payment.total`（Prisma Decimal）比较时使用 `toNumber` 转换，存在浮点精度问题。应使用 Decimal 类型比较。

```123:154:server/src/modules/payment/payment.service.ts
  async createRefund(paymentId: bigint, refundAmount: number, reason?: string) {
    if (refundAmount > toNumber(payment.total)) {
```

**8. 时间槽管理使用 Redis 无过期机制**
`OrderService.create` 中时间槽使用 Redis INCR 计数，但未设置 TTL。过期的日期计数器将永远占用 Redis 内存。

```108:116:server/src/modules/order/services/order.service.ts
    const key = `timeslot:usage:${dateStr}:${index}`;
    const count = await this.redisService.getClient().incr(key);
    // 无 TTL 设置
```

**9. DispatchService.assignOrder 使用 Number() 转换 BigInt**
`Number(orderId)` 在 BigInt 值超过 `Number.MAX_SAFE_INTEGER` 时会丢失精度。应使用 `BigInt(orderId)` 代替。

```47:48:server/src/modules/dispatch/dispatch.service.ts
    const order = await this.orderService.findById(Number(orderId));
```

**10. CourierService.createPickupNotification 使用 Date.now() 生成 ID**
`notification-${Date.now()}` 作为主键，在高并发下可能产生冲突。

```129:129:server/src/modules/courier/courier.service.ts
    id: `notification-${Date.now()}`,
```

### 中级别 (P2) - 建议尽快修复

**11. 用户角色硬编码为 USER**
`UserService.mapToUserResponse` 中 `role: UserRole.USER` 硬编码，因为数据库中没有 role 字段。这意味着 Admin 权限体系无法正常工作。

```331:331:server/src/modules/user/services/user.service.ts
    role: UserRole.USER, // 默认角色，因为数据库中没有role字段
```

**12. NotificationService.generateNotificationId 使用时间戳+随机数**
`BigInt(Date.now()) * 1000000n + BigInt(random)` 的 ID 生成方式在高并发下仍有冲突风险，且与其他模块的 Snowflake ID 生成不一致。

```821:826:server/src/modules/notification/services/notification.service.ts
  private generateNotificationId(): string {
    const timestamp = BigInt(Date.now());
    const random = BigInt(Math.floor(Math.random() * 1000000));
    return (timestamp * 1000000n + random).toString();
```

**13. AccountService.deposit 中事务重复包裹**
当外部已提供 `tx` 参数时，`deposit` 方法直接在该事务上执行 `run(tx)`，但 `run` 内部包含重试逻辑（3 次乐观锁重试），这在传入事务中可能导致外部事务持有的锁超时。

**14. InventoryService.createReservation 错误处理不足**
预订创建时抛出 `new Error('Insufficient available quantity')` 而非 NestJS 的 `BadRequestException`，导致全局异常过滤器返回 500 而非 400。

```350:352:server/src/modules/inventory/services/inventory.service.ts
      if (Number(item.availableQty) < data.quantity) {
        throw new Error('Insufficient available quantity');
      }
```

**15. OrderService 中多处 `as any` 类型断言**
代码中存在大量 `as any` 类型断言，降低了类型安全性。例如 `dispatch.service.ts:60` 中 `(order as any).address`，`order.service.ts:529` 中 `data.priority as unknown as number` 等。

**16. 物流回调日志中存储请求 Headers**
`OrderController.logisticsNotify` 将 `req.headers` 直接存入数据库，可能包含 Authorization token、Cookie 等敏感信息。

```226:239:server/src/modules/order/order.controller.ts
    const callbackLog = await this.prisma.logisticsCallbackLog.create({
      data: {
        headers: req.headers as any,
```

**17. Swagger 文档在生产环境暴露**
`main.ts` 中未根据 `NODE_ENV` 条件化 Swagger 文档，生产环境仍可通过 `/api/docs` 访问完整 API 文档。

---

## 三、安全评估

### 认证与授权

- JWT 认证体系完整，支持 `@Public()`、`@Roles()`、`@Permissions()` 装饰器。
- `JwtAuthGuard` 实现了角色检查、用户状态检查，设计合理。
- **关键问题**：大量控制器端点缺少 `@UseGuards(JwtAuthGuard)`，认证形同虚设。建议在全局级别启用 Guard，通过 `@Public()` 逐个豁免公开接口。

### 数据验证

- 全局 `ValidationPipe` 配置了 `whitelist: true` 和 `forbidNonWhitelisted: true`，能有效防止属性注入。
- DTO 使用 `class-validator` 进行验证。
- **问题**：部分服务方法参数类型为 `any`（如 `PaymentService.handlePaymentNotify(notifyData: any)`），绕过了验证。

### 敏感数据

- `.env.example` 中 JWT_SECRET 为 `your-secret-key`，需确保生产环境使用强随机密钥。
- 日志中输出用户手机号（`AuthRedisService.login` 的 `mobile=${mobile}`），建议脱敏处理。
- 物流回调日志存储完整 HTTP Headers，存在泄露敏感信息的风险。

### 并发安全

- `AccountService.deposit` 使用乐观锁（version 字段）+ 3 次重试，并发安全设计良好。
- `FinanceService.mockPaySuccess` 的充值流程缺少同样的乐观锁保护。
- 订单状态变更使用状态机验证 `validateTransition`，能有效防止非法状态跳转。

---

## 四、生产部署就绪度评估

### 已具备的条件

- Docker 多阶段构建，非 root 用户运行，健康检查配置合理。
- CORS 配置支持白名单，开发环境自动允许 localhost。
- BigInt 序列化处理（`toJSON`）。
- 全局异常过滤器和响应拦截器，统一 API 响应格式。
- Swagger API 文档。
- Prisma ORM 使用参数化查询，天然防 SQL 注入。
- 测试文件覆盖 24 个 `.spec.ts`，覆盖了核心模块。
- Snowflake ID 生成器，支持分布式唯一 ID。
- Redis 支撑验证码/刷新令牌/时间槽/ID 生成器状态。

### 阻碍上线的关键问题

1. **认证 Guard 未全局启用**：大部分 API 端点可被未认证用户访问，这是最严重的上线阻碍。
2. **支付回调无签名验证**：可被伪造，造成资金损失。
3. **通知模块完全 Mock**：所有通知均被标记为已发送/已投递，用户收不到任何通知。
4. **支付密码无盐哈希**：SHA256 无盐存储，数据库泄露后密码可被快速破解。
5. **缺少速率限制配置**：虽然有 `ThrottlerGuard` 导入，但未在全局级别启用（仅在 AuthController 上使用），其他接口无速率保护。
6. **Swagger 生产环境暴露**：API 结构完全公开。
7. **迁移文件已删除**：`git status` 显示多个 migration SQL 文件被删除，需确认数据库迁移策略。

### 上线前建议补充

1. 全局启用 `JwtAuthGuard`，在 `app.module.ts` 中设置 `APP_GUARD`。
2. 实现微信/支付宝支付回调签名验证。
3. 对接真实短信服务商（如阿里云短信、腾讯云短信）。
4. 将支付密码改为 bcrypt/argon2 存储。
5. 生产环境关闭 Swagger（`if (process.env.NODE_ENV !== 'production')`）。
6. 为 Redis 时间槽键设置 TTL（如 7 天自动过期）。
7. 全局启用 `ThrottlerGuard`。
8. 日志中手机号脱敏（`mobile=${mobile.slice(0,3)}****${mobile.slice(-4)}`）。
9. 物流回调日志中过滤敏感 Headers。
10. 修复 `DispatchService.assignOrder` 中的 BigInt 精度丢失。

---

## 五、代码质量

### 优点

- 模块划分清晰，职责单一，符合 NestJS 最佳实践。
- 状态机模式保障订单状态流转合法性。
- 乐观锁机制保障账户余额并发安全。
- AI 模块的多提供商路由和故障转移设计精良。
- Snowflake ID 生成器统一管理，支持分布式场景。
- 文件存储模块支持多 OSS 后端、文件去重、批量操作。

### 待改进

- 大量 `as any` 类型断言削弱了 TypeScript 类型保护。
- 部分服务方法抛出原生 `Error` 而非 NestJS 异常类，导致 500 错误而非有意义的 HTTP 状态码。
- 测试文件虽然存在，但需要验证测试覆盖率和测试质量。
- 环境变量管理分散，部分使用 `ConfigService.get()`，部分直接使用 `process.env`（如 `main.ts` 的 `process.env.PORT`）。

---

## 六、结论

OneRecycle Server 的核心业务逻辑和架构设计质量较高，订单生命周期管理、账户并发安全、AI 多提供商路由等关键设计体现了较好的工程水平。但存在以下不可忽视的问题：

**不建议当前状态直接上线**，主要阻碍因素：认证 Guard 未全局启用导致大部分接口裸奔、支付回调无签名验证、通知模块完全 Mock、支付密码存储不安全。修复 P0 级别的 4 个问题后，再补齐通知和支付的真实服务商对接，项目可达到上线条件。预计修复时间 1-2 周。

---

## References

1. [NestJS Guards Documentation](https://docs.nestjs.com/guards)
2. [Prisma Optimistic Concurrency Control](https://www.prisma.io/docs/concepts/components/prisma-client/crud#optimistic-concurrency-control)
3. [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
4. [WeChat Pay Callback Verification](https://pay.weixin.qq.com/wiki/doc/apiv3/wxpay/pages/index.shtml)
