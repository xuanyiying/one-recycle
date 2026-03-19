# 订单状态机架构设计方案 - Spec

## Why

当前系统订单状态机实现存在多处问题：
1. `update` 方法绕过状态机验证，可直接修改订单状态
2. 前后端状态机定义不一致
3. 状态转换时间线记录不完整
4. 并发场景下存在竞态条件
5. 状态机定义分散在三处，维护困难
6. 缺少基于角色和状态的路由守卫
7. 状态机日志记录不完善（缺少操作人、原因等信息）

这些问题可能导致数据不一致、业务规则被绕过、审计追踪不完整。

## What Changes

* **Server**: 重构订单状态机实现，统一状态机定义，修复绕过验证的漏洞
* **Server**: 新增状态机路由守卫（StateMachineGuard）
* **Server**: 完善状态机日志记录（操作人、原因、上下文）
* **Admin Web**: 同步前端状态机定义，与后端保持一致
* **Common**: 创建共享的状态机定义模块

## Impact

* Affected specs: 无

* Affected code:
  * `server/src/common/constants/` - 新增状态机常量定义
  * `server/src/common/guards/` - 新增 StateMachineGuard
  * `server/src/modules/order/services/order.service.ts` - 修复状态机验证、完善日志
  * `server/src/modules/order/order.controller.ts` - 应用状态机守卫
  * `apps/admin-web/src/lib/orderStateMachine.ts` - 同步状态机定义
  * `server/src/modules/order/services/order.service.spec.ts` - 更新测试

## Current System Analysis

### 路由守卫设计

当前系统使用 NestJS 标准守卫机制：

**1. JwtAuthGuard** (`server/src/modules/auth/guards/jwt-auth.guard.ts`)
- 继承 `AuthGuard('jwt')`
- 验证 JWT Token 有效性
- 检查用户权限（requireAdmin, roles）
- 检查用户状态（ACTIVE）
- 支持 `@Public()` 装饰器跳过认证

**2. RolesGuard** (`server/src/common/guards/roles.guard.ts`)
- 检查用户角色是否匹配 `@Roles()` 装饰器定义的角色
- 使用 Reflector 读取元数据

**使用方式**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
```

### 状态机日志记录 (OrderTimeline)

当前 `OrderTimeline` 模型 (`prisma/schema.prisma`):
```prisma
model OrderTimeline {
  id           BigInt
  orderId      BigInt
  status       String
  fromStatus   OrderStatus?
  toStatus     OrderStatus?
  message      String
  operator     String?      // SYSTEM, USER, COURIER, ADMIN
  operatorType String?
  operatorId   BigInt?
  reason       String?
  rawSnapshot  Json?
  createdAt    DateTime
}
```

**当前问题**:
1. 部分状态转换未记录时间线（如 `resolveException` 调用 `update` 方法）
2. operator 信息不准确（很多地方硬编码为 'SYSTEM'）
3. 缺少状态机上下文信息（如触发条件、业务动作）
4. 没有统一的状态机 Action 抽象

## ADDED Requirements

### Requirement: 统一状态机定义

系统 SHALL 提供统一的状态机定义，前后端共享同一套状态转换规则。

#### Scenario: 状态机定义集中管理

* **WHEN** 需要修改状态转换规则

* **THEN** 只需修改一处定义

* **AND** 前后端自动同步

### Requirement: 状态机验证不可绕过

系统 SHALL 确保所有状态变更都必须经过状态机验证，不存在绕过路径。

#### Scenario: 通用更新接口状态变更

* **WHEN** 调用 `update` 方法修改订单状态

* **THEN** 必须执行状态机验证

* **AND** 非法状态转换被拒绝

#### Scenario: 专用状态转换方法

* **WHEN** 调用专用方法（如 `confirmOrder`, `cancel`）

* **THEN** 内部调用统一的状态机验证

* **AND** 保持一致的错误处理

### Requirement: 状态机路由守卫 (StateMachineGuard)

系统 SHALL 提供基于订单状态和用户角色的路由守卫，控制状态转换操作的权限。

#### Scenario: 快递员操作限制

* **GIVEN** 当前订单状态为 `PENDING_PICKUP`

* **WHEN** 快递员尝试调用取件接口

* **THEN** 允许操作

* **AND** 当订单状态为 `COMPLETED` 时，拒绝取件操作

#### Scenario: 管理员特殊权限

* **GIVEN** 管理员角色

* **WHEN** 尝试执行人工处理操作

* **THEN** 允许进入 `MANUAL_PROCESSING` 状态

* **AND** 普通用户无法执行此操作

### Requirement: 状态机 Action 抽象

系统 SHALL 提供统一的状态机 Action 接口，封装状态转换的业务逻辑。

#### Scenario: Action 执行

* **GIVEN** 定义了 `ConfirmOrderAction`

* **WHEN** 执行 Action

* **THEN** 验证前置条件（当前状态、权限）

* **AND** 执行业务逻辑（更新库存、通知用户等）

* **AND** 更新订单状态

* **AND** 记录操作日志

### Requirement: 完整的状态机日志记录

系统 SHALL 确保所有状态变更都记录到订单时间线，包含完整的上下文信息。

#### Scenario: 状态变更日志

* **WHEN** 订单状态发生变更

* **THEN** 自动创建时间线记录

* **AND** 包含：操作人、操作时间、变更原因、Action 类型、IP 地址、请求上下文

#### Scenario: 操作人追踪

* **GIVEN** 用户通过 API 修改订单状态

* **WHEN** 状态变更成功

* **THEN** 时间线记录准确的 operator（从 JWT 获取用户ID）

* **AND** 不是硬编码的 'SYSTEM'

#### Scenario: 状态机上下文记录

* **WHEN** 状态转换触发

* **THEN** 记录触发条件（手动操作、定时任务、回调通知）

* **AND** 记录业务上下文（如物流单号、验货结果）

### Requirement: 并发安全的状态转换

系统 SHALL 使用数据库乐观锁或事务确保状态转换的原子性。

#### Scenario: 并发状态变更请求

* **GIVEN** 两个请求同时尝试修改同一订单状态

* **WHEN** 第一个请求成功更新状态

* **THEN** 第二个请求检测到状态已变更

* **AND** 根据最新状态重新验证或拒绝

### Requirement: 状态机配置化

系统 SHALL 支持通过配置定义状态转换规则，便于扩展和维护。

#### Scenario: 新增状态或转换规则

* **WHEN** 业务需要新增订单状态

* **THEN** 只需修改配置，无需修改核心业务逻辑

## MODIFIED Requirements

### Requirement: 订单状态转换

**原实现**: 状态机验证分散在多个方法中，`update` 方法可绕过验证

**新实现**: 
- 所有状态变更统一通过 `validateTransition` 验证
- `update` 方法增加状态机验证
- 状态转换规则提取为配置
- 引入 StateMachineGuard 控制接口访问权限
- 引入 Action 抽象封装业务逻辑

## REMOVED Requirements

无移除功能。

## Technical Design

### StateMachineGuard 设计

```typescript
// 装饰器定义允许的状态转换
@UseGuards(JwtAuthGuard, StateMachineGuard)
@AllowedTransitions(['PENDING_PICKUP', 'CANCELLED'])  // 允许从哪些状态转换
@RequiredRole(UserRole.COURIER)  // 需要的角色
async pickupOrder(@Param('id') id: string) { }
```

### Action 接口设计

```typescript
interface StateMachineAction {
  name: string;
  fromStatuses: OrderStatus[];
  toStatus: OrderStatus;
  requiredRoles?: UserRole[];
  
  // 执行业务逻辑
  execute(context: ActionContext): Promise<void>;
  
  // 记录日志
  log(context: ActionContext): Promise<void>;
}

interface ActionContext {
  orderId: string;
  userId: string;
  userRole: UserRole;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
```

### 日志记录增强

```typescript
interface StateMachineLog {
  orderId: string;
  action: string;           // Action 名称
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  operatorId: string;       // 真实操作人ID
  operatorRole: string;     // 操作人角色
  operatorType: 'USER' | 'COURIER' | 'ADMIN' | 'SYSTEM';
  reason?: string;          // 操作原因
  trigger: 'MANUAL' | 'SCHEDULED' | 'CALLBACK' | 'SYSTEM';
  context: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    metadata?: Record<string, any>;
  };
  createdAt: Date;
}
```

## Technical Notes

* 使用 TypeScript 类型系统确保状态类型安全
* 状态机配置使用不可变对象，防止运行时修改
* 考虑使用状态机库（如 xstate）或保持轻量级实现
* 数据库层面使用版本号或状态字段进行乐观锁控制
* StateMachineGuard 在 JwtAuthGuard 之后执行，确保已获取用户信息
* Action 执行使用事务包裹，确保原子性
