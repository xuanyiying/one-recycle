# Tasks - 管理端接口完善

## Task 1: 订单模块接口完善
**描述**: 添加订单导出 Excel 和批量删除接口

- [x] 1.1 在 `order.controller.ts` 添加 `GET /orders/export` 端点
- [x] 1.2 在 `order.service.ts` 实现 `exportOrders` 方法
- [x] 1.3 在 `order.controller.ts` 添加 `POST /orders/batch-delete` 端点
- [x] 1.4 在 `order.service.ts` 实现 `batchDelete` 方法
- [x] 1.5 验证接口正常工作

## Task 2: 用户模块接口完善
**描述**: 添加用户导出、统计、活动日志等接口

- [x] 2.1 在 `user.controller.ts` 添加 `GET /users/export` 端点
- [x] 2.2 在 `user.service.ts` 实现 `exportUsers` 方法
- [x] 2.3 在 `user.controller.ts` 添加 `GET /users/stats` 端点 (已存在)
- [x] 2.4 在 `user.service.ts` 实现 `getStats` 方法 (已存在)
- [x] 2.5 在 `user.controller.ts` 添加 `GET /users/activities` 端点
- [x] 2.6 在 `user.controller.ts` 添加 `POST /users/batch-delete` 端点
- [x] 2.7 在 `user.controller.ts` 添加 `PUT /users/:id/status` 端点
- [x] 2.8 在 `user.controller.ts` 添加 `POST /users/reset-password` 端点
- [x] 2.9 在 `user.controller.ts` 添加 `PUT /users/:id/password` 端点
- [x] 2.10 在 `user.controller.ts` 添加 `GET /users/recent` 端点
- [x] 2.11 验证接口正常工作

## Task 3: 库存模块接口完善
**描述**: 添加库存导出、调整记录、预警等接口

- [x] 3.1 在 `inventory.controller.ts` 添加 `GET /inventory/export` 端点
- [x] 3.2 在 `inventory.service.ts` 实现 `exportInventory` 方法
- [x] 3.3 在 `inventory.controller.ts` 添加 `POST /inventory/batch-delete` 端点
- [x] 3.4 在 `inventory.controller.ts` 添加 `POST /inventory/:id/adjust` 端点
- [x] 3.5 在 `inventory.service.ts` 实现库存调整逻辑
- [x] 3.6 在 `inventory.controller.ts` 添加 `GET /inventory/:id/adjustments` 端点
- [x] 3.7 在 `inventory.controller.ts` 添加 `PUT /inventory/alerts/:id/read` 端点
- [x] 3.8 在 `inventory.controller.ts` 添加 `POST /inventory/alerts/batch-read` 端点
- [x] 3.9 在 `inventory.controller.ts` 添加 `GET /inventory/value-trend` 端点
- [x] 3.10 在 `inventory.controller.ts` 添加 `GET /inventory/turnover` 端点
- [x] 3.11 验证接口正常工作

## Task 4: 通知模块接口完善
**描述**: 添加通知 CRUD、发送、模板管理等接口

- [x] 4.1 在 `notification.controller.ts` 添加 `GET /notifications/export` 端点
- [x] 4.2 在 `notification.controller.ts` 添加 `GET /notifications/:id` 端点 (已存在)
- [x] 4.3 在 `notification.controller.ts` 添加 `PUT /notifications/:id` 端点
- [x] 4.4 在 `notification.controller.ts` 添加 `DELETE /notifications/:id` 端点
- [x] 4.5 在 `notification.controller.ts` 添加 `POST /notifications/send` 端点 (已存在)
- [x] 4.6 在 `notification.controller.ts` 添加 `POST /notifications/:id/cancel` 端点 (已存在)
- [x] 4.7 在 `notification.controller.ts` 添加 `POST /notifications/:id/resend` 端点 (已存在)
- [x] 4.8 在 `notification.controller.ts` 添加 `POST /notifications/batch-send` 端点
- [x] 4.9 在 `notification.controller.ts` 添加 `DELETE /notifications/batch` 端点
- [x] 4.10 在 `notification.controller.ts` 添加 `GET /notifications/:id/history` 端点
- [x] 4.11 在 `notification.controller.ts` 添加 `POST /notifications/upload-image` 端点
- [x] 4.12 在 `notification.controller.ts` 添加 `POST /notifications/preview` 端点
- [x] 4.13 在 `notification.controller.ts` 添加 `POST /notifications/test-send` 端点
- [x] 4.14 在 `notification.controller.ts` 添加 `GET /notifications/stats` 端点
- [x] 4.15 验证接口正常工作

## Task 5: 财务模块接口完善
**描述**: 添加支付密码、租户财务等接口

- [x] 5.1 在 `finance.controller.ts` 添加 `POST /finance/payment-password` 端点 (已存在)
- [x] 5.2 在 `finance.service.ts` 实现 `setPaymentPassword` 方法 (已存在)
- [x] 5.3 在 `finance.controller.ts` 添加 `GET /finance/tenant/:tenantId/balance` 端点 (已存在)
- [x] 5.4 在 `finance.controller.ts` 添加 `GET /finance/tenant/:tenantId/transactions` 端点 (已存在)
- [x] 5.5 在 `finance.controller.ts` 添加 `GET /finance/expenses/stats` 端点 (已存在)
- [x] 5.6 验证接口正常工作

## Task 6: 服务端验证
**描述**: 验证所有接口正常工作

- [x] 6.1 运行 `npm run typecheck` 确认无类型错误
- [x] 6.2 运行 `npm run lint` 确认无 ESLint 错误
- [x] 6.3 运行 `npm run build` 确认构建成功
- [x] 6.4 确认所有新增端点已注册

## Task Dependencies

- Task 1, 2, 3, 4, 5 可并行执行 - **已完成**
- Task 6 依赖 Task 1-5 全部完成 - **已完成**
