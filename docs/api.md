# API 接口文档

## 1. 概述

本文档描述了一键回收平台的API接口设计，采用微服务架构，通过API网关统一对外提供RESTful API服务。

### 1.1 架构说明

- **API网关**: 统一入口，负责请求路由、身份认证、速率限制
- **微服务**: 各服务独立部署，通过gRPC进行内部通信
- **协议**: 对外RESTful API，内部gRPC通信

### 1.2 基础信息

- **Base URL**: `https://api.one-recycle.com`
- **API版本**: v1
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

## 2. 认证与授权

### 2.1 登录认证

#### 微信小程序登录
```http
POST /auth/login/wechat
Content-Type: application/json

{
  "code": "wx_login_code",
  "appId": "wx_app_id"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": {
      "id": 1,
      "nickname": "用户昵称",
      "avatar": "头像URL"
    }
  }
}
```

#### 支付宝小程序登录
```http
POST /auth/login/alipay
Content-Type: application/json

{
  "code": "alipay_auth_code",
  "appId": "alipay_app_id"
}
```

### 2.2 Token使用

所有需要认证的接口都需要在请求头中携带Token：

```http
Authorization: Bearer <jwt_token>
```

## 3. 用户管理 API

### 3.1 用户信息

#### 获取用户信息
```http
GET /users/{id}
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nickname": "用户昵称",
    "avatar": "头像URL",
    "mobile": "13800138000",
    "createdAt": "2023-12-01T10:00:00Z"
  }
}
```

#### 更新用户信息
```http
PUT /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "新昵称",
  "mobile": "13800138001"
}
```

### 3.2 地址管理

#### 获取用户地址列表
```http
GET /addresses/user/{userId}
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "consignee": "张三",
      "mobile": "13800138000",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "detail": "某某街道123号",
      "isDefault": true
    }
  ]
}
```

#### 创建地址
```http
POST /addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "consignee": "张三",
  "mobile": "13800138000",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "detail": "某某街道123号",
  "isDefault": false
}
```

#### 更新地址
```http
PUT /addresses/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "consignee": "李四",
  "mobile": "13800138001"
}
```

#### 删除地址
```http
DELETE /addresses/{id}
Authorization: Bearer <token>
```

## 4. 订单管理 API

### 4.1 订单操作

#### 创建订单
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "addressId": 1,
  "expectPickupTime": "2023-12-01T14:00:00Z",
  "items": [
    {
      "categoryId": 1,
      "estimatedWeight": 5.0,
      "unitPrice": 4.50
    }
  ],
  "remark": "备注信息"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNo": "ORD202312010001",
    "status": "PENDING",
    "estimatedAmount": 22.50,
    "expectPickupTime": "2023-12-01T14:00:00Z"
  }
}
```

#### 获取订单详情
```http
GET /orders/{id}
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNo": "ORD202312010001",
    "status": "PENDING",
    "estimatedAmount": 22.50,
    "settlementAmount": 0,
    "expectPickupTime": "2023-12-01T14:00:00Z",
    "actualPickupTime": null,
    "address": {
      "consignee": "张三",
      "mobile": "13800138000",
      "fullAddress": "北京市朝阳区某某街道123号"
    },
    "items": [
      {
        "categoryId": 1,
        "categoryName": "废纸",
        "estimatedWeight": 5.0,
        "actualWeight": null,
        "unitPrice": 4.50,
        "amount": 22.50
      }
    ]
  }
}
```

#### 获取用户订单列表
```http
GET /orders/user/{userId}?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

**查询参数**:
- `status`: 订单状态 (可选)
- `page`: 页码，默认1
- `limit`: 每页数量，默认10

#### 取消订单
```http
PUT /orders/{id}/cancel
Authorization: Bearer <token>
```

#### 更新订单状态
```http
PUT /orders/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

### 4.2 订单统计

#### 获取用户统计信息
```http
GET /orders/statistics/user/{userId}
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 15,
    "completedOrders": 12,
    "totalAmount": 1250.50,
    "totalWeight": 125.5
  }
}
```

## 5. 支付管理 API

### 5.1 支付操作

#### 创建支付
```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": 1,
  "provider": "WECHAT",
  "total": 22.50
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "outTradeNo": "PAY202312010001",
    "paymentParams": {
      "appId": "wx_app_id",
      "timeStamp": "1701423600",
      "nonceStr": "random_string",
      "package": "prepay_id=wx_prepay_id",
      "signType": "RSA",
      "paySign": "signature"
    }
  }
}
```

#### 更新支付状态
```http
PUT /payments/{transactionId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "SUCCESS"
}
```

#### 获取支付信息
```http
GET /payments/{id}
Authorization: Bearer <token>
```

#### 根据订单ID获取支付信息
```http
GET /payments/order/{orderId}
Authorization: Bearer <token>
```

### 5.2 退款操作

#### 创建退款
```http
POST /payments/{paymentId}/refunds
Authorization: Bearer <token>
Content-Type: application/json

{
  "refundAmount": 22.50,
  "reason": "用户取消订单"
}
```

#### 更新退款状态
```http
PUT /payments/refunds/{refundId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "SUCCESS"
}
```

## 6. 快递员管理 API

### 6.1 快递员操作

#### 获取快递员列表
```http
GET /couriers?status=ACTIVE&page=1&limit=10
Authorization: Bearer <token>
```

#### 获取快递员详情
```http
GET /couriers/{id}
Authorization: Bearer <token>
```

#### 创建快递员
```http
POST /couriers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "张师傅",
  "mobile": "13800138000",
  "status": "ACTIVE"
}
```

#### 更新快递员信息
```http
PUT /couriers/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "张师傅",
  "status": "INACTIVE"
}
```

#### 删除快递员
```http
DELETE /couriers/{id}
Authorization: Bearer <token>
```

#### 获取快递员任务列表
```http
GET /couriers/{id}/assignments
Authorization: Bearer <token>
```

## 7. 派单管理 API

### 7.1 派单操作

#### 分配订单
```http
POST /dispatch/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "1",
  "courierId": "1"
}
```

#### 获取所有派单记录
```http
GET /dispatch/assignments?status=ASSIGNED&page=1&limit=10
Authorization: Bearer <token>
```

#### 获取派单详情
```http
GET /dispatch/assignments/{id}
Authorization: Bearer <token>
```

#### 更新派单状态
```http
PUT /dispatch/assignments/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACCEPTED"
}
```

#### 接受派单
```http
POST /dispatch/assignments/{id}/accept
Authorization: Bearer <token>
```

#### 拒绝派单
```http
POST /dispatch/assignments/{id}/reject
Authorization: Bearer <token>
```

## 8. 分类管理 API

### 8.1 分类操作

#### 获取分类列表
```http
GET /categories?enabled=true
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "废纸",
      "parentId": null,
      "enabled": true,
      "iconUrl": "https://example.com/icon.png",
      "children": [
        {
          "id": 2,
          "name": "报纸",
          "parentId": 1,
          "enabled": true
        }
      ]
    }
  ]
}
```

#### 创建分类
```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "废纸",
  "parentId": null,
  "enabled": true,
  "iconUrl": "https://example.com/icon.png"
}
```

#### 更新分类
```http
PATCH /categories/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "废纸类",
  "enabled": false
}
```

#### 删除分类
```http
DELETE /categories/{id}
Authorization: Bearer <token>
```

## 9. 库存管理 API

### 9.1 库存操作

#### 获取库存列表
```http
GET /inventory?categoryId=1&status=IN_STOCK&page=1&limit=10
Authorization: Bearer <token>
```

#### 获取库存详情
```http
GET /inventory/{id}
Authorization: Bearer <token>
```

#### 创建库存记录
```http
POST /inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": 1,
  "quantity": 100.5,
  "unitPrice": 4.50,
  "location": "仓库A-01"
}
```

#### 更新库存
```http
PATCH /inventory/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 150.0,
  "unitPrice": 4.80
}
```

#### 删除库存记录
```http
DELETE /inventory/{id}
Authorization: Bearer <token>
```

## 10. 通知管理 API

### 10.1 通知操作

#### 发送通知
```http
POST /notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "type": "ORDER_STATUS",
  "title": "订单状态更新",
  "content": "您的订单已完成",
  "data": {
    "orderId": 1
  }
}
```

## 11. 错误码说明

### 11.1 HTTP状态码

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器内部错误

### 11.2 业务错误码

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "用户不存在"
  }
}
```

**常见错误码**:

- `USER_NOT_FOUND`: 用户不存在
- `ORDER_NOT_FOUND`: 订单不存在
- `INVALID_ORDER_STATUS`: 无效的订单状态
- `PAYMENT_FAILED`: 支付失败
- `INSUFFICIENT_BALANCE`: 余额不足
- `COURIER_NOT_AVAILABLE`: 快递员不可用
- `INVALID_TOKEN`: 无效的Token
- `TOKEN_EXPIRED`: Token已过期

## 12. 数据模型

### 12.1 订单状态枚举

```typescript
enum OrderStatus {
  PENDING = 'PENDING',      // 待派单
  ASSIGNED = 'ASSIGNED',    // 待接单
  ACCEPTED = 'ACCEPTED',    // 待上门
  PROCESSING = 'PROCESSING', // 回收中
  COMPLETED = 'COMPLETED',  // 已完成
  CANCELLED = 'CANCELLED'   // 已取消
}
```

### 12.2 支付状态枚举

```typescript
enum PaymentStatus {
  PENDING = 'PENDING',   // 待支付
  SUCCESS = 'SUCCESS',   // 支付成功
  FAILED = 'FAILED',     // 支付失败
  CLOSED = 'CLOSED'      // 已关闭
}
```

### 12.3 快递员状态枚举

```typescript
enum CourierStatus {
  ACTIVE = 'ACTIVE',     // 在线
  INACTIVE = 'INACTIVE', // 离线
  OFF_DUTY = 'OFF_DUTY'  // 下班
}
```

## 13. 接口限流

### 13.1 限流规则

- **普通接口**: 每分钟100次请求
- **登录接口**: 每分钟10次请求
- **支付接口**: 每分钟20次请求

### 13.2 限流响应

当触发限流时，返回HTTP 429状态码：

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求过于频繁，请稍后再试"
  }
}
```

## 14. 版本控制

API版本通过URL路径进行控制：

- `v1`: 当前版本
- `v2`: 未来版本（向后兼容）

示例：
- `GET /v1/users/{id}`
- `GET /v2/users/{id}`