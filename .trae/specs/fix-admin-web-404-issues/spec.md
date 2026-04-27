# 管理端接口不完善修复 Spec

## Why

管理端 (admin-web) 的前端服务调用了后端不存在的接口，导致请求返回 404 错误。这影响了多个模块的核心功能，包括 Excel 导出、批量操作、用户管理等。

## What Changes

### 缺失接口汇总

#### 1. Order 模块缺少接口
- `GET /orders/export` - 订单导出 Excel
- `POST /orders/batch-delete` - 批量删除订单

#### 2. User 模块缺少接口
- `GET /users/export` - 用户导出 Excel
- `GET /users/stats` - 用户统计信息
- `GET /users/activities` - 用户活动日志
- `POST /users/batch-delete` - 批量删除用户
- `PUT /users/:id/status` - 更新用户状态
- `POST /users/reset-password` - 重置用户密码
- `PUT /users/:id/password` - 更新用户密码
- `POST /users/:id/send-email-verification` - 发送邮箱验证
- `POST /users/:id/send-sms-verification` - 发送短信验证
- `POST /users/verify-email` - 验证邮箱
- `POST /users/verify-phone` - 验证手机号
- `GET /users/recent` - 获取最近注册用户

#### 3. Inventory 模块缺少接口
- `GET /inventory/export` - 库存导出 Excel
- `POST /inventory/batch-delete` - 批量删除库存
- `GET /inventory/:id/adjustments` - 库存调整记录
- `POST /inventory/:id/adjust` - 库存调整
- `PUT /inventory/alerts/:id/read` - 标记预警已读
- `POST /inventory/alerts/batch-read` - 批量标记预警已读
- `GET /inventory/value-trend` - 库存价值趋势
- `GET /inventory/turnover` - 库存周转率

#### 4. Notification 模块缺少接口
- `GET /notifications/export` - 通知导出
- `GET /notifications/stats` - 通知统计
- `DELETE /notifications/:id` - 删除通知
- `PUT /notifications/:id` - 更新通知
- `POST /notifications/send` - 发送通知
- `POST /notifications/:id/cancel` - 取消发送
- `POST /notifications/templates` - 创建模板
- `GET /notifications/templates` - 获取模板列表
- `GET /notifications/templates/:id` - 获取模板详情
- `PUT /notifications/templates/:id` - 更新模板
- `DELETE /notifications/templates/:id` - 删除模板
- `POST /notifications/templates/:id/create` - 从模板创建
- `POST /notifications/batch-send` - 批量发送
- `DELETE /notifications/batch` - 批量删除
- `GET /notifications/:id/history` - 发送历史
- `POST /notifications/:id/resend` - 重新发送
- `POST /notifications/upload-image` - 上传图片
- `POST /notifications/preview` - 预览通知
- `POST /notifications/test-send` - 测试发送

#### 5. Finance 模块缺少接口
- `POST /finance/payment-password` - 设置支付密码
- `GET /finance/tenant/:tenantId/balance` - 租户余额
- `GET /finance/tenant/:tenantId/transactions` - 租户交易记录
- `GET /finance/expenses/stats` - 费用统计

## Impact

- 受影响模块: admin-web 前端、服务端 (NestJS)
- 受影响服务文件:
  - `apps/admin-web/src/services/orderService.ts`
  - `apps/admin-web/src/services/userService.ts`
  - `apps/admin-web/src/services/inventoryService.ts`
  - `apps/admin-web/src/services/notificationService.ts`
  - `apps/admin-web/src/services/financeService.ts`
- 服务端需修改:
  - `server/src/modules/order/order.controller.ts`
  - `server/src/modules/order/order.service.ts`
  - `server/src/modules/user/controllers/user.controller.ts`
  - `server/src/modules/user/services/user.service.ts`
  - `server/src/modules/inventory/inventory.controller.ts`
  - `server/src/modules/inventory/services/inventory.service.ts`
  - `server/src/modules/notification/controllers/notification.controller.ts`
  - `server/src/modules/notification/services/notification.service.ts`
  - `server/src/modules/finance/finance.controller.ts`
  - `server/src/modules/finance/finance.service.ts`

## ADDED Requirements

### Requirement: 订单模块导出和批量删除

系统 SHALL 提供订单导出 Excel 和批量删除功能。

#### Scenario: 订单导出
- **WHEN** 前端调用 `GET /orders/export`
- **THEN** 返回 Excel 文件的 Blob 数据
- **AND** 支持筛选条件 (status, startDate, endDate 等)

#### Scenario: 批量删除订单
- **WHEN** 前端调用 `POST /orders/batch-delete` with `{ ids: string[] }`
- **THEN** 删除指定 ID 的订单
- **AND** 仅管理员可操作

### Requirement: 用户模块完善

系统 SHALL 提供完整的用户管理接口。

#### Scenario: 用户导出
- **WHEN** 前端调用 `GET /users/export`
- **THEN** 返回用户 Excel 文件

#### Scenario: 用户状态更新
- **WHEN** 前端调用 `PUT /users/:id/status` with `{ status: 'ACTIVE' | 'BANNED' | 'INACTIVE' }`
- **THEN** 更新用户状态

### Requirement: 库存模块完善

系统 SHALL 提供库存导出、调整和预警接口。

#### Scenario: 库存调整
- **WHEN** 前端调用 `POST /inventory/:id/adjust`
- **THEN** 创建库存调整记录
- **AND** 更新库存数量

### Requirement: 通知模块完善

系统 SHALL 提供完整的通知管理接口。

#### Scenario: 发送通知
- **WHEN** 前端调用 `POST /notifications/send`
- **THEN** 发送通知到指定接收者

### Requirement: 财务模块完善

系统 SHALL 提供支付密码和租户财务接口。

#### Scenario: 设置支付密码
- **WHEN** 前端调用 `POST /finance/payment-password`
- **THEN** 设置用户支付密码

## MODIFIED Requirements

### Requirement: Finance 控制器
**修改**: 添加 `POST /finance/payment-password` 端点

### Requirement: User 控制器
**修改**: 添加缺失的用户管理端点

## REMOVED Requirements

无
