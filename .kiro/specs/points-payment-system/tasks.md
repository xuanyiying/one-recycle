# Implementation Plan

## Backend Core Implementation (Completed)

- [x] 1. 设置数据库模型和迁移
  - 在payment-service的Prisma schema中添加Account、Transaction、Withdrawal模型
  - 添加TransactionType和WithdrawalStatus枚举
  - 创建数据库迁移文件
  - 生成Prisma客户端
  - _Requirements: 1.1, 1.2, 2.2, 3.4, 5.1_

- [x] 2. 实现Account Module核心功能
  - 创建account目录结构（service, controller, dto, entities）
  - 实现AccountService的createAccount方法（自动创建账户）
  - 实现AccountService的getAccount方法（查询账户信息）
  - 实现AccountService的increaseBalance方法（增加余额，使用事务）
  - 实现AccountService的freezeBalance方法（冻结余额，使用事务）
  - 实现AccountService的deductFrozenBalance方法（扣除冻结余额）
  - 实现AccountService的unfreezeBalance方法（解冻余额）
  - 实现乐观锁机制（使用version字段）
  - _Requirements: 1.1, 1.2, 1.3, 7.2_

- [x] 3. 实现Transaction查询功能
  - 实现AccountService的getTransactions方法（支持分页和筛选）
  - 实现AccountService的getAccountStats方法（统计数据）
  - 创建TransactionFilters DTO
  - 添加数据库索引优化查询性能
  - _Requirements: 1.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. 实现Account REST API
  - 创建AccountController
  - 实现GET /accounts/me（获取当前用户账户）
  - 实现GET /accounts/me/transactions（获取交易记录）
  - 实现GET /accounts/me/stats（获取统计数据）
  - 实现GET /accounts/:userId（管理员查询用户账户）
  - 实现GET /accounts/:userId/transactions（管理员查询交易记录）
  - 添加JWT认证和权限守卫
  - _Requirements: 1.2, 1.3, 5.2, 5.3_

- [x] 5. 实现Withdrawal Module核心功能
  - 创建withdrawal目录结构（service, controller, dto, entities）
  - 实现WithdrawalService的createWithdrawal方法（创建提现申请，冻结余额）
  - 实现提现金额验证（最低10元，不超过可用余额）
  - 实现WithdrawalService的getWithdrawals方法（查询提现记录）
  - 实现WithdrawalService的getWithdrawal方法（查询单个提现）
  - 实现WithdrawalService的getPendingWithdrawals方法（管理员查询待处理）
  - 生成唯一outTradeNo（防止重复提交）
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

- [x] 6. 实现Withdrawal处理和支付集成
  - 创建payment-provider目录结构
  - 定义IPaymentProvider接口
  - 实现WeChatPayProvider（微信企业付款到零钱）
  - 实现AlipayProvider（支付宝转账到账户）
  - 实现PaymentProviderFactory
  - 实现WithdrawalService的processWithdrawal方法（调用支付接口）
  - 实现WithdrawalService的rejectWithdrawal方法（拒绝提现，解冻余额）
  - 实现WithdrawalService的handlePaymentCallback方法（处理支付回调）
  - 实现回调签名验证
  - 实现幂等性检查（防止重复处理）
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 7.4_

- [x] 7. 实现Withdrawal REST API
  - 创建WithdrawalController
  - 实现POST /withdrawals（创建提现申请）
  - 实现GET /withdrawals/me（获取我的提现记录）
  - 实现GET /withdrawals/:id（获取单个提现详情）
  - 实现GET /withdrawals/admin/pending（管理员查询待处理）
  - 实现POST /withdrawals/:id/approve（管理员审核通过）
  - 实现POST /withdrawals/:id/reject（管理员拒绝）
  - 实现POST /withdrawals/callback/:provider（支付回调）
  - 添加JWT认证和管理员权限守卫
  - _Requirements: 3.1, 3.7, 4.1, 4.4_

## Message Queue Integration

- [x] 8. 集成消息队列 - Order Completed事件
  - 在message-queue服务的dto/order-events.dto.ts中添加OrderCompletedEventDto（包含orderId, userId, settlementAmount字段）
  - 在message-queue的OrderProcessor中实现handleOrderCompleted方法（处理订单完成事件）
  - 在message-queue的PaymentServiceClient中实现increaseBalance方法（调用payment-service的内部API）
  - 在payment-service的AccountController中添加POST /accounts/internal/increase端点（仅供内部服务调用）
  - 在order-service中集成消息队列客户端，当订单状态变为COMPLETED时发布order-completed事件
  - 验证幂等性机制（AccountService已实现，通过orderId防止重复入账）
  - 测试完整流程：订单完成 → 消息队列 → 积分入账
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.1, 8.4, 8.5_

- [x] 9. 集成消息队列 - Withdrawal事件
  - 在message-queue的dto/payment-events.dto.ts中添加WithdrawalCreatedEventDto和WithdrawalCompletedEventDto
  - 在payment-service的WithdrawalService中集成消息队列客户端
  - 在WithdrawalService的createWithdrawal方法中发布withdrawal-created事件
  - 在WithdrawalService的processWithdrawal和rejectWithdrawal方法中发布withdrawal-completed事件
  - 在message-queue的NotificationProcessor中实现handleWithdrawalCreated和handleWithdrawalCompleted方法
  - 配置payment-queue的消费者和生产者（在queue.module.ts中）
  - 测试提现通知流程
  - _Requirements: 2.5, 3.4, 4.7, 8.2, 8.3_

- [x] 10. 实现订单取消和退款逻辑
  - 在payment-service的AccountService中实现refundBalance方法
  - 实现退款验证逻辑：检查是否存在ORDER_INCOME类型的交易记录
  - 实现余额验证：确保用户availableBalance足够扣除
  - 创建REFUND类型交易记录并扣除相应金额
  - 在message-queue的dto/order-events.dto.ts中添加OrderCancelledEventDto (already exists)
  - 在message-queue的OrderProcessor中实现handleOrderCancelled方法 (already exists, updated)
  - 在handleOrderCancelled中调用PaymentServiceClient.refundBalance
  - 在payment-service的AccountController中添加POST /accounts/refund端点
  - 测试退款流程：订单取消 → 检查是否已入账 → 扣除积分
  - _Requirements: 2.6_

## Mini-Program Frontend Implementation

- [x] 11. 实现小程序API服务层
  - 在apps/client-mini/src/services中创建accountService.ts
  - 实现getMyAccount()方法（调用GET /api/accounts/me）
  - 实现getMyTransactions(filters, page, limit)方法（调用GET /api/accounts/me/transactions）
  - 实现getMyStats()方法（调用GET /api/accounts/me/stats）
  - 在apps/client-mini/src/services中创建withdrawalService.ts
  - 实现createWithdrawal(data)方法（调用POST /api/withdrawals）
  - 实现getMyWithdrawals(filters, page, limit)方法（调用GET /api/withdrawals/me）
  - 实现getWithdrawal(id)方法（调用GET /api/withdrawals/:id）
  - 在API Gateway中配置路由（将/api/accounts和/api/withdrawals路由到payment-service）
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 12. 实现小程序个人中心页面
  - 修改apps/client-mini/src/pages/profile/index.tsx
  - 更新余额显示逻辑（调用accountService.getMyAccount()）
  - 显示可用余额（availableBalance）和冻结余额（frozenBalance）
  - 添加"提现"按钮（跳转到/pages/withdrawal/index）
  - 添加"交易明细"入口（跳转到/pages/transaction/list）
  - 实现下拉刷新账户信息（使用Taro.usePullDownRefresh）
  - 添加加载状态（useState + useEffect）和错误处理（Taro.showToast）
  - _Requirements: 1.5, 6.1, 6.7_

- [x] 13. 实现小程序提现申请页面
  - 创建apps/client-mini/src/pages/withdrawal/index.tsx
  - 实现金额输入框（Input type="digit"，实时验证）
  - 实现支付方式选择（RadioGroup：微信/支付宝）
  - 实现金额验证逻辑（最低10元，不超过availableBalance）
  - 根据支付方式显示对应账户信息输入（微信：openid+realName，支付宝：account+name）
  - 实现提交按钮（调用withdrawalService.createWithdrawal）
  - 提交成功后跳转到提现记录页面（Taro.navigateTo('/pages/withdrawal/list')）
  - 添加加载状态和错误提示（Taro.showLoading/showToast）
  - 在app.config.ts的pages数组中添加'pages/withdrawal/index'
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 14. 实现小程序提现记录页面
  - 创建apps/client-mini/src/pages/withdrawal/list.tsx
  - 显示提现记录列表（调用withdrawalService.getMyWithdrawals）
  - 实现状态标签（PENDING/PROCESSING/SUCCESS/FAILED/REJECTED，使用@taroify/core的Tag组件）
  - 实现下拉刷新（Taro.usePullDownRefresh）和上拉加载更多（onScrollToLower + 分页）
  - 点击列表项跳转到详情页（Taro.navigateTo('/pages/withdrawal/detail?id=xxx')）
  - 添加空状态显示（无提现记录时显示Empty组件）
  - 在app.config.ts的pages数组中添加'pages/withdrawal/list'和'pages/withdrawal/detail'
  - _Requirements: 6.5_

- [x] 15. 实现小程序交易明细页面
  - 创建apps/client-mini/src/pages/transaction/list.tsx
  - 显示交易记录列表（调用accountService.getMyTransactions）
  - 实现交易类型图标和颜色（ORDER_INCOME绿色+，WITHDRAWAL红色-，REFUND橙色-）
  - 实现时间筛选（Picker：本月/近3个月/全部）
  - 实现下拉刷新和上拉加载更多
  - 显示订单号（可点击跳转到订单详情：Taro.navigateTo('/pages/order/detail?id=xxx')）
  - 添加空状态显示
  - 在app.config.ts的pages数组中添加'pages/transaction/list'
  - _Requirements: 6.6_

- [ ] 16. 更新订单详情页面显示入账状态
  - 找到并修改apps/client-mini/src/pages/order/detail目录下的index.tsx
  - 在订单状态为COMPLETED时显示"已入账"标签（使用Tag组件）
  - 显示入账金额（从order.settlementAmount获取）
  - 添加"查看交易明细"按钮（跳转到/pages/transaction/list?orderId=xxx）
  - 可选：显示入账时间（从交易记录中获取）
  - _Requirements: 6.7_

## Admin Dashboard Implementation

- [ ] 17. 实现管理后台账户管理页面
  - 在apps/admin-web/src/app中创建accounts目录和page.tsx
  - 在apps/admin-web/src/services中创建accountService.ts
  - 实现accountService.getAccounts(filters, page, limit)方法（调用GET /api/admin/accounts）
  - 实现accountService.getAccountDetails(userId)方法（调用GET /api/accounts/:userId）
  - 实现accountService.getAccountTransactions(userId, filters, page, limit)方法
  - 在page.tsx中使用Ant Design Table组件显示用户账户列表（用户ID、余额、冻结金额、总收入、总提现）
  - 实现搜索功能（按用户ID搜索，使用Input.Search）
  - 实现筛选功能（按余额范围筛选，使用InputNumber）
  - 点击行展开显示用户交易记录（使用Table的expandable属性）
  - 实现导出功能（导出为CSV，使用第三方库如xlsx）
  - _Requirements: 5.3, 5.6_

- [ ] 18. 实现管理后台提现审核页面
  - 在apps/admin-web/src/app中创建withdrawals目录和page.tsx
  - 在apps/admin-web/src/services中创建withdrawalService.ts
  - 实现withdrawalService.getPendingWithdrawals(page, limit)方法（调用GET /api/withdrawals/admin/pending）
  - 实现withdrawalService.getWithdrawals(filters, page, limit)方法（调用GET /api/withdrawals/admin/all）
  - 实现withdrawalService.approveWithdrawal(id)方法（调用POST /api/withdrawals/:id/approve）
  - 实现withdrawalService.rejectWithdrawal(id, reason)方法（调用POST /api/withdrawals/:id/reject）
  - 在page.tsx中使用Ant Design Table组件显示待处理提现列表
  - 实现"通过"按钮（使用Modal.confirm确认后调用approveWithdrawal）
  - 实现"拒绝"按钮（使用Modal显示输入框输入拒绝原因）
  - 实现提现详情查看（使用Drawer组件显示用户信息、金额、账户信息、提现时间）
  - 添加提现历史记录Tab（显示所有状态的提现记录）
  - 实现状态筛选（Select：全部/待处理/成功/失败/已拒绝）和时间范围筛选（DatePicker.RangePicker）
  - _Requirements: 4.1, 4.4_

## Security and Monitoring

- [ ] 19. 实现安全性和日志记录
  - 在payment-service中创建audit-log模块（记录敏感操作）
  - 在AccountService的所有余额变动方法中添加详细日志（使用NestJS Logger）
  - 在WithdrawalService的所有方法中添加详细日志（记录用户ID、操作类型、金额、时间）
  - 在Controller中使用@Ip()装饰器获取请求IP地址并记录
  - 在WithdrawalService中实现频率限制检查（使用Redis记录用户提现次数，限制每日最多5次）
  - 实现异常交易检测（短时间内大量提现，金额异常等，触发告警）
  - 实现风控告警机制（通过notification-queue发送告警通知给管理员）
  - 验证支付回调签名（已在PaymentProvider中实现，确保所有回调都经过验证）
  - 配置HTTPS通信（在生产环境的Nginx或API Gateway中配置SSL证书）
  - _Requirements: 7.1, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 20. 实现错误处理和异常管理
  - 验证自定义异常类（AccountNotFoundException、WithdrawalNotFoundException等已实现）
  - 在payment-service中创建HttpExceptionFilter（全局异常过滤器）
  - 在HttpExceptionFilter中统一处理异常并返回标准错误格式
  - 验证事务回滚机制（已在AccountService和WithdrawalService中使用Prisma事务）
  - 验证并发冲突重试机制（已在AccountService中实现retryOnOptimisticLock方法）
  - 在所有catch块中添加详细错误日志（logger.error with stack trace）
  - 在前端实现用户友好的错误提示（根据错误码显示中文错误消息）
  - 创建错误码映射表（在前端utils中）
  - _Requirements: 7.1, 7.2_

## Testing (Optional)

- [ ]* 21. 编写单元测试
  - 编写AccountService单元测试（测试createAccount, increaseBalance, freezeBalance等方法）
  - 编写WithdrawalService单元测试（测试createWithdrawal, processWithdrawal, rejectWithdrawal等方法）
  - 编写PaymentProvider单元测试（测试WeChatPayProvider和AlipayProvider的transfer和verifyCallback方法）
  - 编写AccountController单元测试（测试所有REST API端点）
  - 编写WithdrawalController单元测试（测试所有REST API端点）
  - 测试并发场景（测试乐观锁和重试机制，模拟多个并发请求）
  - 测试错误处理（测试余额不足、提现金额过低、重复入账等异常情况）
  - _Requirements: All_

- [ ]* 22. 编写集成测试
  - 测试订单完成到积分入账完整流程（创建订单 → 完成订单 → 验证积分入账 → 验证交易记录）
  - 测试提现申请到支付完成流程（创建提现 → 审核通过 → 模拟支付回调 → 验证余额扣除）
  - 测试提现拒绝流程（创建提现 → 审核拒绝 → 验证余额解冻）
  - 测试订单取消退款流程（创建订单 → 完成订单 → 取消订单 → 验证积分扣除）
  - 测试消息队列集成（发布事件 → 验证消费者处理 → 验证结果）
  - 测试支付回调处理（模拟微信/支付宝回调 → 验证签名 → 验证状态更新）
  - _Requirements: All_

## Deployment and Documentation

- [ ] 23. 配置环境变量和部署准备
  - 在payment-service中创建.env.example文件（包含所有必需配置项和说明）
  - 配置微信支付参数（WECHAT_APP_ID、WECHAT_MCH_ID、WECHAT_API_KEY、WECHAT_CERT_PATH）
  - 配置支付宝参数（ALIPAY_APP_ID、ALIPAY_PRIVATE_KEY、ALIPAY_PUBLIC_KEY）
  - 配置提现规则（MIN_WITHDRAWAL_AMOUNT=10、MAX_DAILY_WITHDRAWALS=5、WITHDRAWAL_TIMEOUT_HOURS=24）
  - 在API Gateway（services/api-gateway）中配置路由规则
  - 添加/api/accounts路由到payment-service（端口3003）
  - 添加/api/withdrawals路由到payment-service（端口3003）
  - 配置消息队列连接（MESSAGE_QUEUE_URL、REDIS_URL）
  - 更新docker-compose.yml（添加payment-service的环境变量配置）
  - 配置JWT密钥（JWT_SECRET，确保与auth-service保持一致）
  - _Requirements: All_

- [ ]* 24. 编写文档和使用说明
  - 在payment-service中添加Swagger/OpenAPI装饰器（@ApiTags、@ApiOperation、@ApiResponse等）
  - 编写API文档（自动生成Swagger文档，访问/api/docs）
  - 编写部署文档（docs/deployment/points-payment-system.md）
  - 包括数据库迁移步骤（npm run prisma:migrate deploy）
  - 包括环境变量配置说明
  - 包括服务启动顺序（PostgreSQL → Redis → message-queue → payment-service）
  - 编写运维手册（docs/operations/points-payment-system.md）
  - 包括监控指标（账户余额异常、提现处理时长、消息队列积压）
  - 包括告警规则（异常交易、支付失败、系统错误）
  - 包括常见问题和解决方案（余额不一致、提现失败、消息队列堵塞）
  - 编写用户使用指南（docs/user-guide/points-payment-system.md）
  - 包括小程序端使用说明（如何查看余额、如何提现、如何查看交易明细）
  - 包括管理后台使用说明（如何审核提现、如何查看账户信息）
  - 更新项目README.md（添加积分支付系统功能说明和架构图）
  - _Requirements: All_
