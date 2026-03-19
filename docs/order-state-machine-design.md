# 订单状态机架构设计文档

## 1. 设计目标

订单状态机的设计旨在解决以下核心问题：

1. **业务规则约束**：确保订单状态按照预定义的业务流程流转
2. **数据一致性**：防止非法状态转换导致的数据不一致
3. **权限控制**：基于用户角色控制状态转换操作的权限
4. **审计追踪**：完整记录订单状态变更历史
5. **可维护性**：集中管理状态转换规则，便于维护和扩展

## 2. 状态定义

### 2.1 订单状态枚举

```typescript
enum OrderStatus {
  PENDING = 'PENDING',                    // 待接单
  PENDING_PICKUP = 'PENDING_PICKUP',      // 待取件
  PICKED_UP = 'PICKED_UP',                // 已取件
  IN_TRANSIT = 'IN_TRANSIT',              // 运输中
  PENDING_RECEIPT = 'PENDING_RECEIPT',    // 待收货
  INSPECTING = 'INSPECTING',              // 验货中
  INSPECTED = 'INSPECTED',                // 已验货
  INSPECTION_EXCEPTION = 'INSPECTION_EXCEPTION',  // 验货异常
  MANUAL_PROCESSING = 'MANUAL_PROCESSING',        // 人工处理
  PENDING_INBOUND = 'PENDING_INBOUND',    // 待入库
  INBOUNDED = 'INBOUNDED',                // 已入库
  PENDING_SETTLEMENT = 'PENDING_SETTLEMENT',      // 待结算
  COMPLETED = 'COMPLETED',                // 已完成
  CANCELLED = 'CANCELLED',                // 已取消
  REFUNDED = 'REFUNDED',                  // 已退款
}
```

### 2.2 状态分类

| 类型 | 状态 | 说明 |
|------|------|------|
| 初始状态 | PENDING | 订单创建后的初始状态 |
| 正常流转 | PENDING_PICKUP → PICKED_UP → IN_TRANSIT → PENDING_RECEIPT → INSPECTING → INSPECTED → PENDING_INBOUND → INBOUNDED → PENDING_SETTLEMENT → COMPLETED | 标准回收流程 |
| 异常分支 | INSPECTING → INSPECTION_EXCEPTION → MANUAL_PROCESSING → INSPECTED | 验货异常处理流程 |
| 可取消 | PENDING, PENDING_PICKUP, IN_TRANSIT | 这些状态允许取消 |
| 终态 | COMPLETED, CANCELLED, REFUNDED | 订单生命周期结束 |

## 3. 状态流转图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              订单状态流转图                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────┐
                                    │  PENDING │◄──────────────────────┐
                                    │  待接单   │                       │
                                    └────┬─────┘                       │
                                         │                             │
                    ┌────────────────────┼────────────────────┐        │
                    │                    │                    │        │
                    ▼                    │                    ▼        │
           ┌─────────────────┐           │            ┌──────────────┐ │
           │  PENDING_PICKUP │           │            │   CANCELLED  │ │
           │    待取件        │───────────┘            │    已取消     │─┘
           └────────┬────────┘    取消                  └──────────────┘
                    │
                    │ 取件
                    ▼
           ┌─────────────────┐
           │    PICKED_UP    │
           │    已取件        │
           └────────┬────────┘
                    │
                    │ 开始运输
                    ▼
           ┌─────────────────┐
           │   IN_TRANSIT    │◄──────────────────────────┐
           │    运输中        │                           │
           └────────┬────────┘                           │
                    │                                    │
        ┌───────────┴───────────┐                        │
        │                       │                        │
        ▼                       │                        │
┌─────────────────┐             │                        │
│ PENDING_RECEIPT │             │                        │
│    待收货        │─────────────┘                        │
└────────┬────────┘          取消                         │
         │                                               │
         │ 确认收货                                        │
         ▼                                               │
┌─────────────────┐                                      │
│   INSPECTING    │                                      │
│    验货中        │                                      │
└────────┬────────┘                                      │
         │                                               │
    ┌────┴────┐                                          │
    │         │                                          │
    ▼         │                                          │
┌──────────┐  │                                          │
│ INSPECTED│  │ 异常                                      │
│  已验货   │  │                                          │
└────┬─────┘  │                                          │
     │        ▼                                          │
     │   ┌──────────────────────┐                        │
     │   │ INSPECTION_EXCEPTION │                        │
     │   │      验货异常         │                        │
     │   └──────────┬───────────┘                        │
     │              │                                    │
     │         ┌────┴────┐                               │
     │         │         │                               │
     │         ▼         │                               │
     │   ┌──────────────┐│                               │
     └──►│MANUAL_PROCESSING│                              │
         │   人工处理     ││                               │
         └───────┬───────┘│                               │
                 │        │                               │
                 │ 重试   │ 取消                           │
                 └────┬───┘                               │
                      │                                   │
                      ▼                                   │
              ┌──────────────┐                            │
              │  INSPECTING  │────────────────────────────┘
              └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              正常流程后续                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────────────┐     ┌──────────┐
│ INSPECTED│────►│PENDING_INBOUND│────►│ INBOUNDED│────►│PENDING_SETTLEMENT│────►│ COMPLETED│
│  已验货   │     │   待入库       │     │  已入库   │     │    待结算         │     │  已完成   │
└──────────┘     └──────────────┘     └──────────┘     └──────────────────┘     └────┬─────┘
                                                                                     │
                                                                                     │ 退款
                                                                                     ▼
                                                                              ┌──────────┐
                                                                              │ REFUNDED │
                                                                              │  已退款   │
                                                                              └──────────┘
```

## 4. 状态转换规则表

| 当前状态 | 允许转换到 | 操作角色 | 业务动作 |
|---------|-----------|---------|---------|
| PENDING | PENDING_PICKUP, CANCELLED | ADMIN, SYSTEM | 确认接单、取消订单 |
| PENDING_PICKUP | PICKED_UP, CANCELLED | COURIER, ADMIN | 取件、取消订单 |
| PICKED_UP | IN_TRANSIT | COURIER, SYSTEM | 开始运输 |
| IN_TRANSIT | PENDING_RECEIPT, CANCELLED | COURIER, SYSTEM | 到达站点、取消订单 |
| PENDING_RECEIPT | INSPECTING | SYSTEM, WAREHOUSE | 确认收货 |
| INSPECTING | INSPECTED, INSPECTION_EXCEPTION | WAREHOUSE | 验货通过、验货异常 |
| INSPECTION_EXCEPTION | MANUAL_PROCESSING, INSPECTING | ADMIN, WAREHOUSE | 人工处理、重新验货 |
| MANUAL_PROCESSING | INSPECTED, CANCELLED | ADMIN | 处理完成、取消订单 |
| INSPECTED | PENDING_INBOUND | SYSTEM | 准备入库 |
| PENDING_INBOUND | INBOUNDED | WAREHOUSE | 确认入库 |
| INBOUNDED | PENDING_SETTLEMENT | SYSTEM | 自动流转 |
| PENDING_SETTLEMENT | COMPLETED | SYSTEM | 完成结算 |
| COMPLETED | REFUNDED | ADMIN, SYSTEM | 退款处理 |
| CANCELLED | - | - | 终态 |
| REFUNDED | - | - | 终态 |

## 5. 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              订单状态机系统架构                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    前端层                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Admin Web     │  │   Mini Client   │  │   Courier App   │                  │
│  │   (管理端)       │  │   (C端小程序)    │  │   (快递员端)     │                  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                  │
│           │                    │                    │                            │
│           └────────────────────┼────────────────────┘                            │
│                                │                                                 │
│                      ┌─────────┴─────────┐                                       │
│                      │  OrderStateMachine │                                       │
│                      │  (前端状态机定义)   │                                       │
│                      └───────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          │ HTTP/HTTPS
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    API 层                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        OrderController                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │  @Get()     │  │  @Post()    │  │  @Put()     │  │  @Patch()   │    │   │
│  │  │  查询订单    │  │  创建订单    │  │  更新状态    │  │  部分更新    │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                      ┌───────────────┼───────────────┐                          │
│                      │               │               │                          │
│                      ▼               ▼               ▼                          │
│  ┌─────────────────────────┐ ┌──────────────┐ ┌─────────────────────────┐      │
│  │    JwtAuthGuard         │ │ StateMachineGuard │    RolesGuard        │      │
│  │    (JWT认证)            │ │ (状态机验证)      │    (角色权限)         │      │
│  └─────────────────────────┘ └──────────────┘ └─────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   服务层                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        OrderService                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │   create()  │  │   update()  │  │updateStatus()│  │   cancel()  │    │   │
│  │  │   创建订单   │  │   更新订单   │  │  更新状态    │  │   取消订单   │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │confirmOrder()│ │courierPickUp()│ │finishInspection()│ │confirmInbound()│ │   │
│  │  │   确认订单   │  │   快递员取件 │  │   完成验货   │  │   确认入库   │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    validateTransition()                          │   │   │
│  │  │              (统一的状态机验证方法)                               │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   状态机层                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Order State Machine                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    order-state-machine.ts                        │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │   │
│  │  │  │ OrderStatus │  │orderStatusTransitions│  │canTransition()│    │   │   │
│  │  │  │   状态枚举   │  │   状态转换规则       │  │  验证函数      │    │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │   │
│  │  │  │getNextStatuses│ │validateTransition│ │StateMachineError│    │   │   │
│  │  │  │  获取下一状态  │  │   验证转换        │  │   错误类        │    │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   数据层                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  PrismaService  │  │   Order (Model) │  │ OrderTimeline   │                  │
│  │   (数据库访问)   │  │   订单模型       │  │   订单时间线     │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         PostgreSQL Database                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │   orders    │  │ order_items │  │order_timelines│  │  warehouses │    │   │
│  │  │   订单表     │  │  订单商品表  │  │   时间线表    │  │   仓库表     │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 6. 核心组件说明

### 6.1 状态机定义模块

**文件**: `server/src/common/constants/order-state-machine.ts`

**职责**:
- 定义订单状态枚举
- 定义状态转换规则
- 提供状态验证工具函数
- 定义触发类型和操作人类型

**核心函数**:
- `canTransition(from, to)`: 检查状态转换是否合法
- `validateTransition(from, to)`: 验证状态转换，非法时抛出异常
- `getNextStatuses(from)`: 获取当前状态可转换的目标状态列表
- `getStatusLabel(status)`: 获取状态的中文标签
- `isTerminalStatus(status)`: 检查是否为终态
- `canCancel(status)`: 检查状态是否允许取消

### 6.2 状态机守卫

**文件**: `server/src/common/guards/state-machine.guard.ts`

**职责**:
- 验证当前订单状态是否允许执行操作
- 验证用户是否有权限执行操作
- 提供装饰器 `@AllowedTransitions()` 和 `@RequiredRole()`

**使用示例**:
```typescript
@UseGuards(JwtAuthGuard, StateMachineGuard)
@AllowedTransitions(OrderStatus.PENDING_PICKUP, OrderStatus.CANCELLED)
@RequiredRole(UserRole.COURIER)
async pickupOrder(@Param('id') id: string) {
  // 只有快递员可以执行，且订单状态必须是 PENDING_PICKUP
}
```

### 6.3 订单服务

**文件**: `server/src/modules/order/services/order.service.ts`

**职责**:
- 实现订单业务逻辑
- 调用状态机验证
- 记录订单时间线
- 处理并发安全

**核心方法**:
- `update()`: 更新订单，包含状态机验证
- `updateStatus()`: 更新订单状态，记录时间线
- `validateTransition()`: 内部状态验证方法

## 7. 状态转换时序图

### 7.1 正常订单流转

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │  Admin  │     │ Courier │     │  System │     │ Database│
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ 创建订单       │               │               │               │
     │──────────────►│               │               │               │
     │               │               │               │               │
     │               │ 确认接单       │               │               │
     │               │──────────────►│               │               │
     │               │               │               │ validateTransition()
     │               │               │               │──────────────►│
     │               │               │               │               │
     │               │               │               │ 更新状态       │
     │               │               │               │──────────────►│
     │               │               │               │               │
     │               │               │               │ 记录时间线     │
     │               │               │               │──────────────►│
     │               │               │               │               │
     │               │               │ 取件          │               │
     │               │               │──────────────►│               │
     │               │               │               │ validateTransition()
     │               │               │               │──────────────►│
     │               │               │               │ 更新状态       │
     │               │               │               │──────────────►│
     │               │               │               │               │
     │               │               │               │ 记录时间线     │
     │               │               │               │──────────────►│
     │               │               │               │               │
     │               │               │ ... (后续状态流转)            │
     │               │               │               │               │
     │               │               │               │ 完成订单       │
     │               │               │               │──────────────►│
     │               │               │               │               │
     │  订单完成通知  │               │               │               │
     │◄──────────────│               │               │               │
     │               │               │               │               │
```

### 7.2 验货异常处理流程

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│Warehouse│     │  System │     │  Admin  │     │ Database│
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ 验货异常       │               │               │
     │──────────────►│               │               │
     │               │               │               │
     │               │ validateTransition()
     │               │──────────────►│               │
     │               │               │               │
     │               │ 更新状态       │               │
     │               │──────────────►│               │
     │               │               │               │
     │               │ 记录时间线     │               │
     │               │──────────────►│               │
     │               │               │               │
     │               │ 通知管理员     │               │
     │               │──────────────►│               │
     │               │               │               │
     │               │               │ 人工处理      │
     │               │◄──────────────│               │
     │               │               │               │
     │               │ validateTransition()
     │               │──────────────►│               │
     │               │               │               │
     │               │ 更新状态       │               │
     │               │──────────────►│               │
     │               │               │               │
     │               │ 记录时间线     │               │
     │               │──────────────►│               │
     │               │               │               │
```

## 8. 数据库设计

### 8.1 订单表 (orders)

```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL,
  address_id BIGINT NOT NULL,
  order_type VARCHAR(20) DEFAULT 'RECYCLE',
  status VARCHAR(30) DEFAULT 'PENDING',
  priority INT DEFAULT 0,
  expect_pickup_time TIMESTAMP,
  actual_pickup_time TIMESTAMP,
  expect_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  estimated_amount DECIMAL(12,2) NOT NULL,
  settlement_amount DECIMAL(12,2) NOT NULL,
  pay_amount DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  channel VARCHAR(50) NOT NULL,
  remark TEXT,
  source VARCHAR(50),
  cancel_reason VARCHAR(255),
  cancel_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.2 订单时间线表 (order_timelines)

```sql
CREATE TABLE order_timelines (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id),
  status VARCHAR(30) NOT NULL,
  from_status VARCHAR(30),
  to_status VARCHAR(30),
  message VARCHAR(255) NOT NULL,
  operator VARCHAR(20),
  operator_type VARCHAR(20),
  operator_id BIGINT,
  reason VARCHAR(255),
  raw_snapshot JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_timelines_order_id ON order_timelines(order_id);
CREATE INDEX idx_order_timelines_status ON order_timelines(status);
CREATE INDEX idx_order_timelines_to_status ON order_timelines(to_status);
```

## 9. 安全设计

### 9.1 状态机验证

所有状态变更必须通过 `validateTransition()` 验证：

```typescript
private validateTransition(current: string, target: string): void {
  try {
    validateStateTransition(current as OrderStatus, target as OrderStatus);
  } catch (error) {
    if (error instanceof StateMachineError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}
```

### 9.2 权限控制

使用守卫进行权限控制：

```typescript
@UseGuards(JwtAuthGuard, StateMachineGuard)
@AllowedTransitions(OrderStatus.PENDING_PICKUP)
@RequiredRole(UserRole.COURIER)
async pickupOrder(@Param('id') id: string) {
  // 只有快递员可以在 PENDING_PICKUP 状态执行取件
}
```

### 9.3 并发安全

使用数据库事务确保状态转换的原子性：

```typescript
return this.prisma.$transaction(async (tx) => {
  // 1. 验证状态转换
  this.validateTransition(order.status, data.status);
  
  // 2. 更新订单状态
  const updated = await tx.order.update({...});
  
  // 3. 记录时间线
  await tx.orderTimeline.create({...});
  
  return updated;
});
```

## 10. 扩展性设计

### 10.1 新增状态

1. 在 `OrderStatus` 枚举中添加新状态
2. 在 `orderStatusTransitions` 中定义转换规则
3. 在 `orderStatusLabels` 中添加状态标签
4. 更新前后端状态机定义

### 10.2 新增转换规则

1. 在 `orderStatusTransitions` 中添加新的转换
2. 无需修改核心业务逻辑

### 10.3 新增权限控制

使用 `@RequiredRole()` 装饰器即可：

```typescript
@RequiredRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)
async specialOperation(@Param('id') id: string) {
  // 只有管理员可以执行
}
```

## 11. 监控与日志

### 11.1 状态变更日志

所有状态变更记录到 `order_timelines` 表，包含：
- 操作人信息（ID、角色、类型）
- 状态变更前后
- 操作时间
- 操作原因
- 业务上下文（raw_snapshot）

### 11.2 异常监控

- 非法状态转换尝试
- 权限不足的操作尝试
- 并发冲突

## 12. 总结

本状态机设计具有以下特点：

1. **统一性**：前后端共享同一套状态机定义
2. **安全性**：状态验证不可绕过，权限控制完善
3. **可维护性**：状态规则集中管理，易于修改
4. **可扩展性**：新增状态和规则简单
5. **可追溯性**：完整的状态变更历史记录
6. **并发安全**：事务保证状态转换的原子性
