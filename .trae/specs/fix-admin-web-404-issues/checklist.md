# Checklist - 管理端接口完善

## Task 1: 订单模块接口完善

- [x] 1.1 `GET /orders/export` 端点已添加
- [x] 1.2 `exportOrders` 方法已实现
- [x] 1.3 `POST /orders/batch-delete` 端点已添加
- [x] 1.4 `batchDelete` 方法已实现
- [x] 1.5 订单导出接口测试通过

## Task 2: 用户模块接口完善

- [x] 2.1 `GET /users/export` 端点已添加
- [x] 2.2 `exportUsers` 方法已实现
- [x] 2.3 `GET /users/stats` 端点已添加
- [x] 2.4 `getStats` 方法已实现
- [x] 2.5 `GET /users/activities` 端点已添加
- [x] 2.6 `POST /users/batch-delete` 端点已添加
- [x] 2.7 `PUT /users/:id/status` 端点已添加
- [x] 2.8 `POST /users/reset-password` 端点已添加
- [x] 2.9 `PUT /users/:id/password` 端点已添加
- [x] 2.10 `GET /users/recent` 端点已添加
- [x] 2.11 用户接口测试通过

## Task 3: 库存模块接口完善

- [x] 3.1 `GET /inventory/export` 端点已添加
- [x] 3.2 `exportInventory` 方法已实现
- [x] 3.3 `POST /inventory/batch-delete` 端点已添加
- [x] 3.4 `POST /inventory/:id/adjust` 端点已添加
- [x] 3.5 库存调整逻辑已实现
- [x] 3.6 `GET /inventory/:id/adjustments` 端点已添加
- [x] 3.7 `PUT /inventory/alerts/:id/read` 端点已添加
- [x] 3.8 `POST /inventory/alerts/batch-read` 端点已添加
- [x] 3.9 `GET /inventory/value-trend` 端点已添加
- [x] 3.10 `GET /inventory/turnover` 端点已添加
- [x] 3.11 库存接口测试通过

## Task 4: 通知模块接口完善

- [x] 4.1 `GET /notifications/export` 端点已添加
- [x] 4.2 `GET /notifications/:id` 端点已添加
- [x] 4.3 `PUT /notifications/:id` 端点已添加
- [x] 4.4 `DELETE /notifications/:id` 端点已添加
- [x] 4.5 `POST /notifications/send` 端点已添加
- [x] 4.6 `POST /notifications/:id/cancel` 端点已添加
- [x] 4.7 `POST /notifications/:id/resend` 端点已添加
- [x] 4.8 `POST /notifications/batch-send` 端点已添加
- [x] 4.9 `DELETE /notifications/batch` 端点已添加
- [x] 4.10 `GET /notifications/:id/history` 端点已添加
- [x] 4.11 `POST /notifications/upload-image` 端点已添加
- [x] 4.12 `POST /notifications/preview` 端点已添加
- [x] 4.13 `POST /notifications/test-send` 端点已添加
- [x] 4.14 `GET /notifications/stats` 端点已添加
- [x] 4.15 通知接口测试通过

## Task 5: 财务模块接口完善

- [x] 5.1 `POST /finance/payment-password` 端点已添加
- [x] 5.2 `setPaymentPassword` 方法已实现
- [x] 5.3 `GET /finance/tenant/:tenantId/balance` 端点已添加
- [x] 5.4 `GET /finance/tenant/:tenantId/transactions` 端点已添加
- [x] 5.5 `GET /finance/expenses/stats` 端点已添加
- [x] 5.6 财务接口测试通过

## Task 6: 服务端验证

- [x] 6.1 `npm run typecheck` 通过
- [x] 6.2 `npm run lint` 通过（或仅有警告）
- [x] 6.3 `npm run build` 成功
- [x] 6.4 所有新增端点已注册到模块
