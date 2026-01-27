# 后端 API 接口文档

**文档说明**

*   **基础路径**: `/api`
*   **格式**: 所有接口默认返回 JSON 格式数据。
*   **认证**: 大部分接口需要 `Authorization` 请求头，值为 `Bearer <token>`。

---

## 目录

1.  [Auth (认证)](#auth-认证)
2.  [Account (账户)](#account-账户)
3.  [User (用户)](#user-用户)
4.  [Order (订单)](#order-订单)
5.  [Payment (支付)](#payment-支付)
6.  [Dispatch (调度)](#dispatch-调度)
7.  [Courier (回收员)](#courier-回收员)
8.  [Address (地址)](#address-地址)
9.  [Category (分类)](#category-分类)
10. [Inventory (库存)](#inventory-库存)
11. [Notification (通知)](#notification-通知)
12. [System (系统)](#system-系统)
13. [Queue (队列)](#queue-队列)
14. [Health (健康检查)](#health-健康检查)

---

## Auth (认证)

**Base Path**: `/api/auth`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | 用户登录 | Body: `LoginDto` <br> `{ mobile, verificationCode, ... }` | `{ access_token, refresh_token, user }` |
| POST | `/api/auth/send-sms-code` | 发送短信验证码 | Body: `SendCodeDto` <br> `{ mobile, type }` | `{ success: true, message: "..." }` |
| POST | `/api/auth/refresh` | 刷新访问令牌 | Body: `RefreshTokenDto` <br> `{ refreshToken }` | `{ access_token, refresh_token }` |
| POST | `/api/auth/logout` | 用户登出 | Body: `LogoutDto` | `{ success: true }` |
| POST | `/api/auth/third-party/:platform` | 第三方平台登录 | Path: `platform` (wechat/alipay) <br> Body: `ThirdPartyLoginDto` | `{ access_token, user }` |

---

## Account (账户)

**Base Path**: `/api/accounts`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/accounts/me` | 获取当前登录用户账户信息 | Header: `Authorization` | Account Object |
| GET | `/api/accounts/me/stats` | 获取当前用户统计信息 | Header: `Authorization` | `{ orderCount, balance, ... }` |

---

## User (用户)

**Base Path**: `/api/users`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/users` | 创建用户 | Body: `CreateUserDto` | User Object |
| GET | `/api/users` | 获取用户列表 | Query: `QueryUserDto` | `{ items: User[], total: number }` |
| GET | `/api/users/:id` | 获取用户详情 | Path: `id` | User Object |
| PUT | `/api/users/:id` | 更新用户信息 | Path: `id` <br> Body: `UpdateUserDto` | User Object |
| DELETE | `/api/users/:id` | 删除用户 | Path: `id` | - |
| GET | `/api/users/mobile/:mobile` | 根据手机号查找用户 | Path: `mobile` | User Object |
| GET | `/api/users/identity/:provider/:openid` | 根据第三方身份查找用户 | Path: `provider`, `openid` | User Object |
| POST | `/api/users/:id/identities` | 绑定第三方身份 | Path: `id` <br> Body: `{ provider, openid, appId, ... }` | - |

---

## Order (订单)

**Base Path**: `/api/orders` (TimeSlot: `/api/order`)

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/orders` | 创建订单 | Body: `CreateOrderDto` | Order Object |
| GET | `/api/orders` | 获取订单列表 | Query: `OrderFilters`, `page`, `limit` | `{ orders: Order[], total: number }` |
| GET | `/api/orders/:id` | 获取订单详情 | Path: `id` | Order Object |
| GET | `/api/orders/user/:userId` | 获取用户订单列表 | Path: `userId` <br> Query: `page`, `limit` | `{ orders: Order[], total: number }` |
| GET | `/api/orders/user/:userId/statistics` | 获取用户订单统计 | Path: `userId` | `{ total: number }` |
| PATCH | `/api/orders/:id` | 更新订单 | Path: `id` <br> Body: `UpdateOrderDto` | Order Object |
| PATCH | `/api/orders/:id/cancel` | 取消订单 | Path: `id` | Order Object |
| DELETE | `/api/orders/:id` | 删除订单 | Path: `id` | - |
| POST | `/api/orders/recycle` | 创建回收订单 (兼容旧版) | Body: `CreateOrderDto` | Order Object |
| POST | `/api/orders/sale` | 创建销售订单 (兼容旧版) | Body: `CreateOrderDto` | Order Object |
| GET | `/api/order/time-slots/batch` | 批量获取可用时间段 | Query: `startDate`, `daysCount`, `addressId` | `TimeSlot[]` |

---

## Payment (支付)

**Base Path**: `/api/payments`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/payments` | 创建支付 | Body: `CreatePaymentDto` | Payment Object |
| PUT | `/api/payments/:transactionId/status` | 更新支付状态 | Path: `transactionId` <br> Body: `{ status }` | Payment Object |
| GET | `/api/payments/:id` | 获取支付详情 | Path: `id` | Payment Object |
| GET | `/api/payments/order/:orderId` | 根据订单ID获取支付 | Path: `orderId` | Payment Object |
| POST | `/api/payments/:paymentId/refunds` | 创建退款 | Path: `paymentId` <br> Body: `{ refundAmount, reason }` | Refund Object |
| PUT | `/api/payments/refunds/:refundId/status` | 更新退款状态 | Path: `refundId` <br> Body: `{ status }` | Refund Object |

---

## Dispatch (调度)

**Base Path**: `/api/dispatch`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/dispatch/assign` | 指派订单 | Body: `{ orderId, courierId }` | Assignment Object |
| GET | `/api/dispatch/assignments` | 获取所有指派 | - | Assignment List |
| GET | `/api/dispatch/assignments/:id` | 获取指派详情 | Path: `id` | Assignment Object |
| PUT | `/api/dispatch/assignments/:id/status` | 更新指派状态 | Path: `id` <br> Body: `{ status }` | Assignment Object |
| POST | `/api/dispatch/assignments/:id/accept` | 接受指派 | Path: `id` | Assignment Object |
| POST | `/api/dispatch/assignments/:id/reject` | 拒绝指派 | Path: `id` | Assignment Object |

---

## Courier (回收员)

**Base Path**: `/api/couriers`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/couriers` | 创建回收员 | Body: `CreateCourierDto` | Courier Object |
| GET | `/api/couriers` | 获取回收员列表 | Query: `status`, `serviceArea`, `rating`... | Courier List |
| GET | `/api/couriers/available` | 获取可用回收员 | Query: `serviceArea`, `lat`, `lng`, `radius` | Courier List |
| GET | `/api/couriers/:id` | 获取回收员详情 | Path: `id` | Courier Object |
| PUT | `/api/couriers/:id` | 更新回收员信息 | Path: `id` <br> Body: `UpdateCourierDto` | Courier Object |
| DELETE | `/api/couriers/:id` | 删除回收员 | Path: `id` | - |
| PUT | `/api/couriers/:id/location` | 更新位置 | Path: `id` <br> Body: `{ latitude, longitude, address }` | Location Object |
| GET | `/api/couriers/:id/performance` | 获取绩效 | Path: `id` <br> Query: `period` (YYYY-MM) | Performance Object |
| GET | `/api/couriers/:id/assignments` | 获取任务列表 | Path: `id` <br> Query: `status`, `date`... | Assignment List |
| POST | `/api/couriers/notifications` | 发送取件通知 | Body: `CreatePickupNotificationDto` | Notification Object |
| GET | `/api/couriers/notifications` | 获取通知列表 | Query: `status`, `priority`... | Notification List |
| POST | `/api/couriers/notifications/:id/respond` | 响应通知 | Path: `id` <br> Body: `{ courierId, response }` | Response Object |
| PUT | `/api/couriers/tasks/:taskId/status` | 更新任务状态 | Path: `taskId` <br> Body: `{ courierId, status }` | Task Object |
| GET | `/api/couriers/utils/distance` | 计算距离 | Query: `fromLat`, `fromLng`, `toLat`, `toLng` | `{ distance: number }` |

---

## Address (地址)

**Base Path**: `/api/addresses`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/addresses` | 创建地址 | Body: `CreateAddressDto` | Address Object |
| GET | `/api/addresses/regions/:parentCode` | 获取地区列表 | Path: `parentCode` | Region List |
| GET | `/api/addresses/user/:userId` | 获取用户地址列表 | Path: `userId` | Address List |
| PUT | `/api/addresses/:id` | 更新地址 | Path: `id` <br> Body: `Partial<CreateAddressDto>` | Address Object |
| DELETE | `/api/addresses/:id` | 删除地址 | Path: `id` | - |
| PUT | `/api/addresses/:id/default` | 设置默认地址 | Path: `id` | Address Object |

---

## Category (分类)

**Base Path**: `/api/category/categories`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/category/categories` | 创建分类 | Body: `CreateCategoryDto` | Category Object |
| GET | `/api/category/categories` | 获取分类列表 | Query: `QueryCategoryDto` | Category List |
| GET | `/api/category/categories/active` | 获取启用分类 | - | Category List |
| GET | `/api/category/categories/featured` | 获取推荐分类 | - | Category List |
| GET | `/api/category/categories/tree` | 获取分类树 | - | Category Tree |
| GET | `/api/category/categories/type/:type` | 按类型获取分类 | Path: `type` | Category List |
| GET | `/api/category/categories/parent/:parentId` | 获取子分类 | Path: `parentId` | Category List |
| GET | `/api/category/categories/:id` | 获取分类详情 | Path: `id` | Category Object |
| PUT | `/api/category/categories/:id` | 更新分类 | Path: `id` <br> Body: `UpdateCategoryDto` | Category Object |
| DELETE | `/api/category/categories/:id` | 删除分类 | Path: `id` | - |

---

## Inventory (库存)

**Base Path**: `/api/inventory`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/inventory/items` | 创建库存项 | Body: `CreateInventoryItemDto` | Inventory Item |
| GET | `/api/inventory/items` | 获取库存列表 | Query: `status`, `type`, `location`... | Inventory List |
| GET | `/api/inventory/items/:id` | 获取库存详情 | Path: `id` | Inventory Item |
| PATCH | `/api/inventory/items/:id` | 更新库存项 | Path: `id` <br> Body: `UpdateInventoryItemDto` | Inventory Item |
| DELETE | `/api/inventory/items/:id` | 删除库存项 | Path: `id` | - |
| POST | `/api/inventory/transactions` | 创建库存交易 | Body: `CreateTransactionDto` | Transaction Object |
| POST | `/api/inventory/quality-checks` | 创建质检记录 | Body: `CreateQualityCheckDto` | QC Object |
| POST | `/api/inventory/reservations` | 创建预留 | Body: `CreateReservationDto` | Reservation Object |
| GET | `/api/inventory/stats` | 获取库存统计 | - | Stats Object |
| POST | `/api/inventory/warehouses` | 创建仓库 | Body: `CreateWarehouseDto` | Warehouse Object |

---

## Notification (通知)

**Base Path**: `/api/notifications`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/notifications` | 发送通知 | Body: `SendNotificationDto` | Notification Object |
| POST | `/api/notifications/batch` | 批量发送通知 | Body: `SendBatchNotificationDto` | Batch Object |
| GET | `/api/notifications` | 获取通知列表 | Query: `type`, `status`, `userId`... | Notification List |
| GET | `/api/notifications/:id` | 获取通知详情 | Path: `id` | Notification Object |
| POST | `/api/notifications/:id/retry` | 重试通知 | Path: `id` | Notification Object |
| POST | `/api/notifications/:id/cancel` | 取消通知 | Path: `id` | Notification Object |
| POST | `/api/notifications/templates` | 创建模板 | Body: `CreateTemplateDto` | Template Object |
| GET | `/api/notifications/templates` | 获取模板列表 | Query: `type`, `name` | Template List |
| GET | `/api/notifications/templates/:id` | 获取模板详情 | Path: `id` | Template Object |
| PUT | `/api/notifications/templates/:id` | 更新模板 | Path: `id` <br> Body: `UpdateTemplateDto` | Template Object |
| DELETE | `/api/notifications/templates/:id` | 删除模板 | Path: `id` | - |
| POST | `/api/notifications/templates/:id/validate` | 验证模板 | Path: `id` <br> Body: `data` | `{ isValid: boolean }` |
| POST | `/api/notifications/templates/:id/render` | 渲染模板 | Path: `id` <br> Body: `data` | `{ content: string }` |
| GET | `/api/notifications/batches` | 获取批次列表 | Query: `status`, `date` | Batch List |
| GET | `/api/notifications/batches/:id` | 获取批次详情 | Path: `id` | Batch Object |
| GET | `/api/notifications/batches/:id/notifications` | 获取批次通知 | Path: `id` | Notification List |
| GET | `/api/notifications/stats/:period` | 获取统计 | Path: `period` | Stats Object |
| GET | `/api/notifications/reports/delivery` | 获取投递报告 | Query: `startDate`, `endDate` | Report Object |
| GET | `/api/notifications/providers` | 获取供应商列表 | - | Provider List |
| PUT | `/api/notifications/providers/:name/config` | 更新供应商配置 | Path: `name` <br> Body: `config` | Provider Object |
| POST | `/api/notifications/sms` | 发送短信 (旧版兼容) | Body: `{ phone, message }` | `{ success: true }` |
| POST | `/api/notifications/email` | 发送邮件 (旧版兼容) | Body: `{ to, subject, message }` | `{ success: true }` |
| POST | `/api/notifications/push` | 发送推送 (旧版兼容) | Body: `{ deviceToken, title, message }` | `{ success: true }` |
| GET | `/api/notifications/health` | 健康检查 | - | `{ status: "healthy" }` |

---

## System (系统)

**Base Path**: `/api/system`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/system/banners` | 获取轮播图 | - | `BannerResponseDto[]` |
| GET | `/api/system/articles` | 获取文章列表 | - | `ArticleResponseDto[]` |

---

## Queue (队列)

**Base Path**: `/api/queue`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/queue/order/completed` | 订单完成事件 | Body: `OrderCompletedEventDto` | `{ success: true }` |
| POST | `/api/queue/order/cancelled` | 订单取消事件 | Body: `OrderCancelledEventDto` | `{ success: true }` |
| POST | `/api/queue/payment/withdrawal-created` | 提现创建事件 | Body: `WithdrawalCreatedEventDto` | `{ success: true }` |
| POST | `/api/queue/payment/withdrawal-completed` | 提现完成事件 | Body: `WithdrawalCompletedEventDto` | `{ success: true }` |

---

## Health (健康检查)

**Base Path**: `/api/health`

| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/health` | 健康检查 | - | `{ status: "ok" }` |
| GET | `/api/health/ready` | 就绪检查 | - | `{ status: "ok" }` |
| GET | `/api/health/live` | 存活检查 | - | `{ status: "ok" }` |
