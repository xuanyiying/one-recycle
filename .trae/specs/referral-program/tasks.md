# 推广功能 - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 扩展数据库模型 - 添加返佣相关字段
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 在 InviteRecord 模型中添加字段以记录返佣状态和关联订单
  - 在 SystemConfig 中添加返佣规则配置（固定金额或比例）
  - 添加索引优化查询性能
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-1.1: Prisma schema 可以正常生成和 migrate
  - `programmatic` TR-1.2: 数据库字段和索引正确创建
- **Notes**: 确保向后兼容，不影响现有数据

## [ ] Task 2: 创建返佣服务 (ReferralRewardService)
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 创建新的 ReferralRewardService 服务
  - 实现返佣规则读取（从 SystemConfig）
  - 实现返佣金额计算（支持固定金额和比例）
  - 实现返佣发放逻辑（幂等性保证）
  - 实现返佣状态查询
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 返佣金额计算正确
  - `programmatic` TR-2.2: 重复调用不会重复发放佣金（幂等性）
  - `programmatic` TR-2.3: 正确创建 PointsRecord 记录
- **Notes**: 使用事务确保数据一致性

## [ ] Task 3: 扩展 InviteService - 添加推广统计功能
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 扩展 getInviteStats 方法，增加总旧物数量统计
  - 新增 getInviteStatsWithOrders 方法，返回包含订单详情的统计
  - 新增 getInviteListWithDetails 方法，返回包含下单情况的邀请列表
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-3.1: 统计数据准确（邀请人数、佣金、旧物数量）
  - `programmatic` TR-3.2: 查询性能满足要求（< 500ms）
- **Notes**: 优化数据库查询，使用适当的 include 和聚合

## [ ] Task 4: 在订单完成流程中集成返佣逻辑
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 找到订单完成的处理逻辑（order.service.ts 或 order.processor.ts）
  - 在订单状态变为 COMPLETED 时调用 ReferralRewardService
  - 确保返佣逻辑异步执行，不阻塞主流程
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 订单完成时自动触发返佣
  - `programmatic` TR-4.2: 没有邀请关系的订单不触发返佣
  - `programmatic` TR-4.3: 返佣逻辑不影响订单完成流程
- **Notes**: 考虑使用队列处理返佣，提高系统可靠性

## [ ] Task 5: 创建推广功能 API 接口
- **Priority**: P1
- **Depends On**: Task 3
- **Description**:
  - 在 PointsController 中添加新的推广相关接口
  - GET /points/referral/stats - 获取推广统计
  - GET /points/referral/list - 获取邀请列表（分页）
  - 确保接口有适当的认证和权限控制
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: API 接口返回正确的数据格式
  - `programmatic` TR-5.2: 未登录用户无法访问接口
  - `programmatic` TR-5.3: 分页功能正常工作
- **Notes**: 复用现有的认证守卫

## [ ] Task 6: 验证积分提现功能兼容性
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 检查现有的积分提现功能
  - 确保佣金积分可以正常提现
  - 如有需要，调整提现逻辑
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 佣金积分可以正常申请提现
  - `programmatic` TR-6.2: 提现金额正确扣除
- **Notes**: 佣金积分与普通积分无需区分，统一处理

## [ ] Task 7: 添加后台管理返佣规则功能
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 创建返佣规则管理服务
  - 添加后台管理 API 接口
  - 包括：返佣类型（固定/比例）、返佣金额/比例、返佣时机（首单/每单）
  - 添加配置验证逻辑（如比例不能超过 100%）
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-7.1: 管理员可以正常配置返佣规则
  - `programmatic` TR-7.2: 配置更改后立即生效
  - `programmatic` TR-7.3: 配置验证逻辑正常工作
- **Notes**: 如已有系统配置管理模块，应复用

## [ ] Task 8: 创建小程序推广页面
- **Priority**: P1
- **Depends On**: Task 5
- **Description**:
  - 创建推广主页（pages/referral/index.tsx）
  - 显示推广统计（邀请人数、获得佣金、旧物数量）
  - 显示邀请列表（分页）
  - 提供邀请码复制功能
  - 提供小程序卡片分享功能
  - 提供邀请海报生成功能（可选，后续迭代）
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-8.1: 页面 UI 符合设计规范
  - `programmatic` TR-8.2: 推广统计数据正确显示
  - `programmatic` TR-8.3: 邀请列表分页正常
  - `programmatic` TR-8.4: 邀请码复制功能正常
  - `programmatic` TR-8.5: 小程序分享功能正常
- **Notes**: 需要在 app.config.ts 中添加新页面路由

## [ ] Task 9: 在现有页面添加推广入口
- **Priority**: P1
- **Depends On**: Task 8
- **Description**:
  - 在个人中心页面（pages/profile/index.tsx）添加"邀请好友"菜单项
  - 在积分商城-赚积分页面（pages/points-mall/tasks/index.tsx）添加"邀请好友"任务卡片
  - 在积分商城首页（pages/points-mall/index.tsx）添加"邀请好友"快捷入口
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `human-judgement` TR-9.1: 推广入口位置合理，UI 美观
  - `programmatic` TR-9.2: 点击入口可以正常跳转到推广页面
- **Notes**: 保持与现有菜单风格一致

## [ ] Task 10: 修改注册流程支持邀请码
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 在登录/注册页面（pages/login/index.tsx）添加邀请码输入框（可选）
  - 从分享链接/小程序卡片参数中自动读取邀请码
  - 注册成功后自动调用邀请绑定接口
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-10.1: 输入邀请码注册可以正常绑定邀请关系
  - `programmatic` TR-10.2: 从分享参数自动读取邀请码正常
  - `programmatic` TR-10.3: 不输入邀请码注册不受影响
- **Notes**: 邀请码输入框应为可选项
