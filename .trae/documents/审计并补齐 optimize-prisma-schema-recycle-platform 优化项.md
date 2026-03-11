## 结论（当前完成度）
- schema 层的大部分“金额 Decimal 化 / 枚举强约束 / 物流调用与回调日志 / 提现幂等字段 / 租户与平台钱包 Decimal 化”等已落地到 [schema.prisma](file:///Users/yiying/dev-app/one-recycle/server/prisma/schema.prisma) 与迁移 [20260213120000_optimize_finance_logistics](file:///Users/yiying/dev-app/one-recycle/server/prisma/migrations/20260213120000_optimize_finance_logistics/migration.sql)。
- 但文档中仍有若干项未完全落地（主要在“审计字段增强、库存预留闭环、入库主表链路、提现全链路、测试与文档产物”）。

## 我将补齐的缺口（按文档条目对齐）
### 1) 订单审计链路（OrderTimeline）
- 将 OrderTimeline 从“status/message/operator”增强为“fromStatus/toStatus/operatorType/operatorId/reason/rawSnapshot”等（或新增独立 History 表）。
- 统一所有订单状态推进入口：封装一个状态推进方法（校验 + 更新 + 写 timeline + 幂等），并替换散落的 updateStatus 调用。

### 2) 库存预留闭环（Reservation + InventoryItem 联动）
- schema：为 Reservation 增加 confirmedAt/cancelledAt/expiredAt，并补齐 `@@index([status, expiresAt])`；为 InventoryItem 增加 `@@index([sourceOrderId])`。
- service：实现 reserve/confirm/cancel/expire 四个操作，全部放在单个数据库事务里，同时更新 InventoryItem.reservedQty/availableQty，避免漂移。

### 3) 入库主表 InboundReceipt 落地到业务流程
- 在“收货/验货/入库/确认入库”流程中创建并推进 InboundReceipt（receivedAt/inspectedAt/inboundedAt），并把异常原因/图片等补齐到写入路径。

### 4) 提现全链路一致性（创建→冻结→出款→回调→失败退回/拒绝退回）
- 对齐 WithdrawalStatus（含 TIMEOUT）在 DTO/队列/DB 的一致性。
- 将提现处理拆为：创建幂等、冻结账本、出款、回调推进、失败/拒绝自动退回。
- 打通“租户/平台侧扣款来源”记账（TenantTransaction/PlatformTransaction）的幂等与回滚路径，并用 version 乐观锁 + 有限重试实现并发安全。

### 5) 迁移与回滚产物
- 在现有 rollback.sql 基础上补齐文档要求的 up/down（或统一成可重复执行的回滚脚本），特别是 enum/decimal 的安全回滚策略。

### 6) 测试与文档
- 更新并补齐单测/集成测：订单状态推进幂等、订单入账幂等、提现幂等、库存预留并发与过期、物流失败重试日志。
- 更新 Mermaid：补齐覆盖 Order/Logistics/Inbound/Inventory/Account(钱包)/Withdrawal/Tenant 的 ER 图与两条时序图。

## 验收方式
- `npm run build` 通过。
- 新增/更新的测试用例通过（包含提现失败退回、库存预留过期、重复回调幂等）。
- 数据库迁移可前进/回滚（至少覆盖核心 enum/decimal 变更）。