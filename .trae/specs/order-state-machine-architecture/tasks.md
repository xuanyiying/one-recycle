# Tasks

## Phase 1: 状态机定义重构

- [ ] Task 1: 创建统一的状态机定义模块
  - [ ] SubTask 1.1: 在 `server/src/common/constants/` 创建 `order-state-machine.ts`
  - [ ] SubTask 1.2: 定义 `OrderStatus` 枚举（保持与现有兼容）
  - [ ] SubTask 1.3: 定义 `orderStatusTransitions` 状态转换规则
  - [ ] SubTask 1.4: 定义 `canTransition`, `getNextStatuses` 工具函数
  - [ ] SubTask 1.5: 导出状态机配置供其他模块使用

- [ ] Task 2: 修复 `update` 方法绕过验证问题
  - [ ] SubTask 2.1: 修改 `order.service.ts` 的 `update` 方法
  - [ ] SubTask 2.2: 在 `update` 方法中增加状态机验证逻辑
  - [ ] SubTask 2.3: 确保状态变更时记录时间线
  - [ ] SubTask 2.4: 更新相关单元测试

- [ ] Task 3: 优化状态转换方法
  - [ ] SubTask 3.1: 审查所有状态转换方法（confirmOrder, cancel, finishInspection 等）
  - [ ] SubTask 3.2: 统一使用新的状态机验证函数
  - [ ] SubTask 3.3: 确保所有方法都记录时间线
  - [ ] SubTask 3.4: 移除重复的状态验证逻辑

## Phase 2: 状态机路由守卫 (StateMachineGuard)

- [ ] Task 4: 创建 StateMachineGuard
  - [ ] SubTask 4.1: 创建 `server/src/common/guards/state-machine.guard.ts`
  - [ ] SubTask 4.2: 实现状态转换权限检查逻辑
  - [ ] SubTask 4.3: 创建 `@AllowedTransitions()` 装饰器
  - [ ] SubTask 4.4: 创建 `@RequiredRole()` 装饰器
  - [ ] SubTask 4.5: 在 guards index 中导出

- [ ] Task 5: 在 OrderController 应用守卫
  - [ ] SubTask 5.1: 为状态转换接口添加 StateMachineGuard
  - [ ] SubTask 5.2: 配置各接口允许的状态转换
  - [ ] SubTask 5.3: 配置各接口需要的角色权限
  - [ ] SubTask 5.4: 测试守卫功能

## Phase 3: 状态机 Action 抽象

- [ ] Task 6: 创建 Action 接口和基础类
  - [ ] SubTask 6.1: 定义 `StateMachineAction` 接口
  - [ ] SubTask 6.2: 定义 `ActionContext` 类型
  - [ ] SubTask 6.3: 创建抽象基类 `BaseOrderAction`
  - [ ] SubTask 6.4: 实现 Action 执行模板方法

- [ ] Task 7: 实现具体 Action 类
  - [ ] SubTask 7.1: 创建 `ConfirmOrderAction`
  - [ ] SubTask 7.2: 创建 `CancelOrderAction`
  - [ ] SubTask 7.3: 创建 `PickupOrderAction`
  - [ ] SubTask 7.4: 创建 `CompleteInspectionAction`
  - [ ] SubTask 7.5: 创建 `ConfirmInboundAction`
  - [ ] SubTask 7.6: 创建 `CompleteSettlementAction`

## Phase 4: 状态机日志增强

- [ ] Task 8: 增强日志记录
  - [ ] SubTask 8.1: 修改 OrderTimeline 创建逻辑，获取真实操作人
  - [ ] SubTask 8.2: 从 Request 上下文获取 IP 地址和 UserAgent
  - [ ] SubTask 8.3: 记录触发类型（MANUAL/SCHEDULED/CALLBACK/SYSTEM）
  - [ ] SubTask 8.4: 记录业务上下文元数据
  - [ ] SubTask 8.5: 确保所有状态转换都记录完整日志

- [ ] Task 9: 创建日志查询服务
  - [ ] SubTask 9.1: 创建 `OrderTimelineService`
  - [ ] SubTask 9.2: 实现按订单查询日志
  - [ ] SubTask 9.3: 实现按操作人查询日志
  - [ ] SubTask 9.4: 实现按时间范围查询日志

## Phase 5: 并发安全优化

- [ ] Task 10: 实现乐观锁机制
  - [ ] SubTask 10.1: 检查 Prisma schema 是否支持版本号字段
  - [ ] SubTask 10.2: 如需要，添加 `version` 字段到 Order 模型
  - [ ] SubTask 10.3: 在状态更新时使用乐观锁
  - [ ] SubTask 10.4: 处理并发冲突异常

- [ ] Task 11: 优化事务处理
  - [ ] SubTask 11.1: 审查现有事务边界
  - [ ] SubTask 11.2: 确保状态验证和更新在同一事务中
  - [ ] SubTask 11.3: 添加事务重试机制（针对并发冲突）

## Phase 6: 前端同步

- [ ] Task 12: 同步前端状态机定义
  - [ ] SubTask 12.1: 更新 `apps/admin-web/src/lib/orderStateMachine.ts`
  - [ ] SubTask 12.2: 确保前端状态转换规则与后端一致
  - [ ] SubTask 12.3: 更新状态标签和显示逻辑
  - [ ] SubTask 12.4: 测试前端状态流转显示

## Phase 7: 测试与验证

- [ ] Task 13: 更新单元测试
  - [ ] SubTask 13.1: 更新 `order.service.spec.ts` 中的状态机测试
  - [ ] SubTask 13.2: 添加 StateMachineGuard 测试
  - [ ] SubTask 13.3: 添加 Action 类测试
  - [ ] SubTask 13.4: 添加并发场景测试
  - [ ] SubTask 13.5: 添加绕过验证的防御测试
  - [ ] SubTask 13.6: 确保所有状态转换路径都被覆盖

- [ ] Task 14: 集成测试
  - [ ] SubTask 14.1: 测试完整的订单生命周期
  - [ ] SubTask 14.2: 测试异常状态流转（非法转换应被拒绝）
  - [ ] SubTask 14.3: 测试并发场景
  - [ ] SubTask 14.4: 验证时间线记录完整性
  - [ ] SubTask 14.5: 测试守卫权限控制

## Phase 8: 代码质量

- [ ] Task 15: 运行代码检查
  - [ ] SubTask 15.1: 运行 `npm run lint` 修复代码风格问题
  - [ ] SubTask 15.2: 运行 `npm run typecheck` 确保类型安全
  - [ ] SubTask 15.3: 运行测试确保全部通过

## Task Dependencies

- Task 2,3 依赖于 Task 1
- Task 5 依赖于 Task 4
- Task 7 依赖于 Task 6
- Task 9 依赖于 Task 8
- Task 11 依赖于 Task 10
- Task 12 依赖于 Task 1
- Task 13 依赖于 Task 2,3,4,5,6,7,10,11
- Task 14 依赖于 Task 5,7,8,12,13
- Task 15 依赖于所有前置任务
