# Checklist

## 状态机定义

- [x] 统一的状态机定义模块创建完成
- [x] `OrderStatus` 枚举定义正确
- [x] `orderStatusTransitions` 状态转换规则完整
- [x] `canTransition` 函数实现正确
- [x] `getNextStatuses` 函数实现正确
- [x] 状态机配置可被其他模块正确导入

## 后端修复

- [x] `update` 方法增加状态机验证
- [x] `update` 方法状态变更记录时间线
- [x] 所有状态转换方法统一使用状态机验证
- [x] 无重复的状态验证逻辑
- [x] 非法状态转换被正确拒绝

## 路由守卫 (StateMachineGuard)

- [x] StateMachineGuard 创建完成
- [x] `@AllowedTransitions()` 装饰器可用
- [x] `@RequiredRole()` 装饰器可用
- [x] 守卫能正确检查当前订单状态
- [x] 守卫能正确检查用户角色权限
- [x] 非法访问返回合适的错误信息
- [x] OrderController 状态转换接口应用守卫

## Action 抽象

- [x] `StateMachineAction` 接口定义完成
- [x] `ActionContext` 类型定义完成
- [x] `BaseOrderAction` 抽象类实现完成
- [x] 具体 Action 类实现（ConfirmOrderAction, CancelOrderAction 等）
- [x] Action 执行业务逻辑正确
- [x] Action 记录日志正确

## 状态机日志记录

- [x] 时间线记录包含真实操作人ID
- [x] 时间线记录包含操作人角色
- [x] 时间线记录包含触发类型（MANUAL/SCHEDULED/CALLBACK/SYSTEM）
- [x] 时间线记录包含 IP 地址和 UserAgent
- [x] 时间线记录包含业务上下文元数据
- [x] 所有状态转换都记录完整日志
- [x] `resolveException` 等方法也记录日志
- [x] OrderTimelineService 提供查询功能

## 并发安全

- [x] 乐观锁机制实现（如需要）
- [x] 状态验证和更新在同一事务中
- [x] 并发冲突被正确处理
- [x] 事务边界清晰
- [x] 事务重试机制（如需要）

## 前端同步

- [x] 前端状态机定义与后端一致
- [x] 状态标签显示正确
- [x] 前端状态流转逻辑正确

## 测试覆盖

- [x] 单元测试覆盖所有状态转换路径
- [x] StateMachineGuard 测试通过
- [x] Action 类测试通过
- [x] 并发场景测试通过
- [x] 绕过验证的防御测试通过
- [x] 集成测试通过
- [x] 所有测试用例通过

## 代码质量

- [x] ESLint 检查通过
- [x] TypeScript 类型检查通过
- [x] 无类型错误
- [x] 代码风格一致
