# 服务层 (Services)

本目录包含应用程序的所有业务逻辑和服务接口。

## 目录结构与命名规范

服务文件统一采用 `[domain].ts` 的命名方式（驼峰命名，名词），不再使用 `Service` 后缀（如 `authService.ts` -> `auth.ts`），以保持引用简洁。

内部实现推荐使用 `Class` 或对象单例模式，以支持依赖注入和状态管理。

### 主要服务

| 文件名 | 描述 | 主要功能 |
| :--- | :--- | :--- |
| `auth.ts` | 认证服务 | 登录、登出、用户信息管理、Token 管理、多平台适配 (微信/支付宝/抖音) |
| `order.ts` | 订单服务 | 订单创建 (submitOrder)、查询列表、详情、取消、确认 |
| `address.ts` | 地址服务 | 地址 CRUD、默认地址管理、区域验证 |
| `draftOrder.ts` | 草稿订单 | 本地草稿存储、恢复、自动保存 (基于 Taro Storage) |
| `pricing.ts` | 价格服务 | 物品估价、批量估价 |
| `timeSlot.ts` | 时间段服务 | 获取可用上门时间、预约时间段 |
| `validation.ts` | 验证服务 | 统一的表单验证逻辑 (手机号、订单数据等) |
| `user.ts` | 用户服务 | 用户基础信息、余额查询 (地址逻辑已移至 address.ts) |

## 使用示例

### 认证 (Auth)

```typescript
import { AuthService, login } from '@/services/auth'

// 使用静态方法
await AuthService.login({ ... })

// 或者使用快捷函数
await login({ ... })
```

### 订单 (Order)

```typescript
import { submitOrder, getUserOrders } from '@/services/order'

// 提交订单 (包含重试机制)
const result = await submitOrder(orderData)

// 获取列表
const orders = await getUserOrders(userId)
```

### 地址 (Address)

```typescript
import { AddressService } from '@/services/address'

// 获取地址列表
const result = await AddressService.getUserAddresses()
```

## 重构说明 (2024-01)

为了提高代码可维护性，进行了以下重构：
1.  **合并 Auth 服务**：将 `auth.ts` 和 `authService.ts` 合并为 `auth.ts`，统一使用 `AuthService` 类实现。
2.  **合并 Order 服务**：将 `orderSubmissionService.ts` 的逻辑并入 `order.ts`，统一订单相关操作。
3.  **独立 Address 服务**：从 `user.ts` 中剥离地址逻辑，重命名 `addressService.ts` 为 `address.ts`。
4.  **统一命名**：`priceEstimationService` -> `pricing.ts`, `timeSlotService` -> `timeSlot.ts`, `draftOrderService` -> `draftOrder.ts`。
5.  **存储适配**：`draftOrder.ts` 已适配 Taro Storage (移除 localStorage)。

## 测试

服务层包含对应的测试文件 `*.test.ts`，使用 Vitest 运行。

```bash
npm run test
```
