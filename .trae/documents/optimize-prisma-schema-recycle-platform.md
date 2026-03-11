## 现状审计结论（关键缺口）
- **订单状态枚举与代码不一致**：代码允许 `COMPLETED -> REFUNDED`，但 `OrderStatus` 缺少 `REFUNDED`，会导致类型/落库不一致风险。
- **物流数据缺少强约束与审计**：`LogisticsOrder.status` 为 `String`，缺少枚举约束；缺少“第三方请求/响应/回调原文”的持久化模型，排障与重试无法闭环。
- **金额类型普遍为 Float**：订单/支付/租户余额/平台钱包等使用 Float，存在精度与对账风险。
- **账户语义混用**：`User.points/balance`、`Account.availableBalance`、`Transaction.amount(Decimal)` 三套口径并存；`Account` 同时承担“钱包余额”和“提现账户信息”，且允许同一 user 多条导致 `findFirst` 不确定。
- **提现模型存在但核心链路未打通**：`Withdrawal` 表较完整，但代码侧缺少“创建提现→冻结→出款→回调→失败退回/拒绝退回”的落库与事务一致性实现。
- **库存预留链路不完整**：Reservation 只有创建，缺少 confirm/cancel/expire 与库存数量的事务联动，易导致 reserved/available 漂移。
- **审计链路未落库**：`OrderTimeline` 存在但状态变更路径未写入，缺少可观测性。

## 数据模型优化方案（schema.prisma 变更清单）
### 1) 订单域
- 扩展 `OrderStatus`：补齐 `REFUNDED`（并视需要补充如 `FAILED`/`CLOSED` 等终态）。
- 强化状态审计：
  - 保留 `OrderTimeline`，补充 `fromStatus/toStatus/operatorType/operatorId/reason/rawSnapshot` 等字段（或新建 `OrderStatusHistory`）。
  - 将其与所有状态推进写入绑定（后续代码层统一封装）。
- 金额字段类型统一：`estimatedAmount/settlementAmount/payAmount/discountAmount` 等从 `Float` 调整为 `Decimal`。

### 2) 物流/第三方快递域
- `LogisticsOrder.status` 改为枚举 `LogisticsStatus`；新增 `providerStatus`（第三方原始状态码）与 `providerData`（原始响应）。
- 明确关系：默认按“一单一运单/主运单”建模，将 `Order <-> LogisticsOrder` 调整为 **1:1**（`LogisticsOrder.orderId` 增加 `@unique`），如未来需要一单多包裹再扩展为 1:N。
- 新增第三方调用/回调日志：
  - `LogisticsApiCall`：记录 endpoint、request/response、耗时、结果、重试次数、idempotencyKey、traceId 等；关联 `orderId/logisticsOrderId/provider`。
  - `LogisticsCallbackLog`：记录 headers、rawBody、parsedBody、签名校验结果、处理结果、错误信息；可关联 `orderId/logisticsOrderId`。

### 3) 仓库收货/验货/入库
- 新增 `InboundReceipt`（或 `WarehouseReceipt`）作为“仓库侧业务主表”：
  - 关联 `orderId (unique)`、`warehouseId`、`staffId`，记录 `receivedAt/inspectedAt/inboundedAt`。
  - 验货结果枚举 `InspectionResult`（PASS/FAIL/EXCEPTION），异常原因、图片、备注等。
- `InventoryItem.sourceOrderId` 保留，用于追溯入库来源；必要时增加 `inboundReceiptId` 以便更强关联。

### 4) 积分/钱包（用户侧）
- 目标：用**单一账本**承载积分/回收款（避免 `User.points/balance`、`Account`、`Transaction` 多口径）。
- 方案：
  - 引入 `Wallet`（一人一钱包，`@@unique([userId])`）：`available/frozen/totalIncome/totalWithdrawal` 全部 `Decimal`，带 `version`（乐观锁）。
  - 引入 `WalletTransaction`（或复用现有 `Transaction` 但改造字段）：增加 `referenceType/referenceId`（如 ORDER / WITHDRAWAL / ADJUSTMENT），并建立幂等唯一索引（例如 `@@unique([type, orderId])` 用于订单入账）。
  - 将 `Account` 重命名/拆分为 `PayoutAccount`（提现账户信息），仅存渠道、实名、账号、校验状态、默认账户等；与 Wallet 解耦。
  - `User.points/balance`：短期保留列但设为“派生/只读”，代码层停止作为权威口径（迁移期做一次性回填/对齐）。

### 5) 提现（用户侧出款）
- 强化 `Withdrawal`：
  - 增加 `walletId`（或替换 accountId）、`idempotencyKey`（幂等令牌，唯一）、`providerTxnNo`（渠道流水号）、`failCode/failMessage`、`version`。
  - 状态枚举统一（DTO/队列/DB 一致，含 TIMEOUT）。
- 幂等与一致性：
  - “冻结”交易与“最终扣减/退回”交易分别落账，且对 `withdrawalId` 建唯一约束，防重复处理。

### 6) 租户/平台账户（提现扣款来源）
- 将 `Tenant.balance/frozenBalance` 从 Float 改为 Decimal，并增加 `version`（乐观锁）。
- 强化 `TenantTransaction`：补充 `referenceType/referenceId` 与唯一幂等约束（例如同一 withdrawal 只扣一次）。
- 评估 `PlatformWallet/PlatformTransaction`：如平台资金以租户为主，优先以 `Tenant` 钱包为权威；`PlatformWallet` 保留为“平台总账/清结算汇总”。

### 7) 库存域
- `InventoryTransaction.type` 从 String 改为枚举 `InventoryTxnType`（IN/OUT/ADJUST/RESERVE/RELEASE）。
- `Reservation` 增加完整流转字段（confirmedAt/cancelledAt/expiredAt 等）；通过事务保证 `InventoryItem.reservedQty/availableQty` 与 Reservation 状态一致。
- 必要索引：
  - `Reservation` 增加 `@@index([status, expiresAt])` 便于过期扫描；
  - `InventoryItem` 增加 `@@index([sourceOrderId])` 便于按订单追溯。

## 高并发一致性设计（乐观锁 + 幂等约束）
- 乐观锁字段：`Wallet.version`、`Tenant.version`、`Withdrawal.version`、（保留/修正）`Account.version`。
- 幂等唯一索引（示例）：
  - 订单积分入账：`WalletTransaction` 上 `@@unique([type, orderId])`（或 `[referenceType, referenceId]`）。
  - 提现创建：`Withdrawal.idempotencyKey @unique`。
  - 提现扣款（租户侧）：`TenantTransaction` 上 `@@unique([type, relatedId])`。
  - 物流下单：`LogisticsApiCall` 上 `@@unique([provider, orderId, action])` 或 `idempotencyKey`。

## 数据库迁移策略（含回滚方案）
- 采用“**两阶段兼容迁移**”，降低线上风险：
  1) **新增字段/新表/新枚举**（不破坏旧逻辑）并建立索引；
  2) **数据回填**（例如从 Account/Transaction 对齐 Wallet；从订单金额 Float 转 Decimal）；
  3) **代码切换写入路径**（钱包/提现/物流日志/时间线）；
  4) **收尾**：删除/弃用旧字段与旧约束（可延后）。
- 提供两类脚本：
  - Prisma migration（prisma/migrations）
  - 额外的 `sql/up.sql` 与 `sql/down.sql`：
    - Enum 回滚：采用“新建 enum type → cast → drop old type”的安全方式（Postgres 无法直接删除 enum value）。
    - Decimal 回滚：提供反向 cast（Decimal → Numeric/Float）与校验提示。

## 代码层同步更新（Prisma Client + Service 事务化 + 幂等）
### 1) 统一事务边界
- 新增领域服务封装：
  - `OrderStatusService`：统一状态推进（校验 + update + 写 timeline + 幂等）。
  - `WalletService`：入账/冻结/解冻/扣减，全部走 `prisma.$transaction`。
  - `WithdrawalService`：创建提现（幂等）、冻结余额、推进状态、失败退回。
  - `TenantWalletService`：租户扣款与回滚、记账。
  - `LogisticsService`：对第三方下单/订阅/查询封装，并落 `LogisticsApiCall/CallbackLog`。
- 所有涉及：状态流转、积分变更、租户扣款、库存预留变更，统一使用 `prisma.$transaction`。

### 2) 并发控制实现方式
- 采用“版本号条件更新”模式（updateMany where id+version；成功条数=1 才算成功），在事务中重试有限次数。

### 3) 修复已知枚举/字段不一致
- 修复 `PaymentLog.status` 被写入 `'success'` 字符串的问题，统一为 `PaymentStatus.SUCCESS`。
- 补齐 DTO 枚举与 Prisma 枚举（特别是 `WithdrawalStatus.TIMEOUT`）。

## 测试计划（单测 + 集成测）
- 单元测试：
  - 订单状态推进幂等（重复回调/重复消息不重复写账）；
  - 积分发放幂等（同一订单只生成一条入账交易）；
  - 提现创建幂等（同一 idempotencyKey 只生成一条 Withdrawal）；
  - 余额不足/库存不足/版本冲突重试。
- 集成测试（含异常分支）：
  - 快递接口超时/失败 → 记录 ApiCall + 重试策略生效；
  - 仓库入库后自动积分入账；
  - 提现：冻结成功但出款失败 → 状态 FAILED + 自动退回冻结；
  - 租户余额不足 → 提现拒绝/失败路径。

## 文档产出（评审友好）
- Mermaid ER 图：覆盖 Order/Logistics/Inbound/Inventory/Wallet/Withdrawal/Tenant。
- Mermaid 时序图：
  1) 用户下单→派单→快递回调→仓库入库→积分入账；
  2) 用户提现→冻结→租户扣款→第三方出款→回调→成功/失败退回。

---

## 执行步骤（我将按此顺序落地代码与产物）
1) 先落 schema：新增/改造枚举、日志表、钱包/提现/入库主表、金额 Decimal 化、关键唯一约束与索引。
2) 生成并整理 migration：Prisma migration + 手写 up/down SQL（含 enum 回滚策略）。
3) 改造服务层：新增 LogisticsService/WalletService/WithdrawalService/TenantWalletService，并把现有状态推进与入账逻辑迁入事务化封装；修复已知字符串枚举写入。
4) 补齐测试：单测覆盖幂等与并发；集成测覆盖第三方失败与余额/库存不足。
5) 输出文档：ER 图 + 时序图（Mermaid），并在 README/设计文档中说明口径与约束。

如果确认该方案，我会在实现时采用默认假设：“一订单一个主运单（LogisticsOrder 1:1）”、“回收款以 Wallet 账本为权威口径、User.points/balance 逐步弃用”。如你们业务需要“一单多运单”或“积分与现金双钱包”，我会在落库前把模型改为 1:N/多钱包结构。