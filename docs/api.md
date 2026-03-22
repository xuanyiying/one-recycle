# API 接口文档

## 完整 API 参考

详细的接口列表、请求参数和响应格式请参考根目录的 [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)。

## 概要

### 基础信息

- **Base URL**: `http://localhost:3000/api` (开发环境)
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **文档**: Swagger - `http://localhost:3000/api/docs`

### 接口模块

| 模块 | Base Path | 说明 |
|------|-----------|------|
| Auth | `/api/auth` | 登录、第三方登录、Token 刷新 |
| Account | `/api/accounts` | 账户信息、统计 |
| User | `/api/users` | 用户 CRUD、第三方身份绑定 |
| Order | `/api/orders` | 订单全生命周期管理 |
| Payment | `/api/payments` | 支付、退款 |
| Dispatch | `/api/dispatch` | 派单、任务管理 |
| Courier | `/api/couriers` | 回收员管理、绩效 |
| Address | `/api/addresses` | 地址管理 |
| Category | `/api/category/categories` | 分类管理 |
| Inventory | `/api/inventory` | 库存管理 |
| Notification | `/api/notifications` | 通知发送、模板管理 |
| System | `/api/system` | 轮播图、文章 |
| Queue | `/api/queue` | 事件队列 |
| Health | `/api/health` | 健康检查 |

### 认证

需要认证的接口在请求头中携带 Token：

```
Authorization: Bearer <jwt_token>
```

### 错误响应

```json
{
  "statusCode": 400,
  "message": "错误描述",
  "error": "Bad Request"
}
```

### 限流规则

- 普通接口: 100 次/分钟
- 登录接口: 10 次/分钟
- 支付接口: 20 次/分钟
