# Withdrawal Module

## Overview

提现模块负责处理用户的积分提现申请，包括创建提现、冻结余额、查询提现记录等核心功能。

## Features

### 1. 创建提现申请 (createWithdrawal)
- 验证最低提现金额（10元）
- 验证用户可用余额是否足够
- 生成唯一的提现订单号（outTradeNo）
- 冻结相应金额
- 创建提现记录（状态：PENDING）
- 创建交易记录（类型：WITHDRAWAL_FREEZE）

### 2. 查询提现记录 (getWithdrawals)
- 支持按用户ID查询
- 支持按状态筛选
- 支持按时间范围筛选
- 支持分页查询
- 按创建时间倒序排列

### 3. 查询单个提现 (getWithdrawal)
- 根据提现ID查询
- 验证用户权限（仅查询自己的提现）
- 管理员可查询所有提现

### 4. 查询待处理提现 (getPendingWithdrawals)
- 仅管理员可访问
- 仅返回状态为PENDING的提现
- 按创建时间升序排列（优先处理早期申请）
- 支持分页查询

### 5. 根据订单号查询 (getWithdrawalByOutTradeNo)
- 用于支付回调处理
- 根据唯一订单号查询提现记录

## Data Models

### WithdrawalEntity
```typescript
{
  id: string;                    // 提现ID
  accountId: string;             // 账户ID
  userId: string;                // 用户ID
  amount: number;                // 提现金额
  provider: PaymentProvider;     // 支付方式（WECHAT/ALIPAY）
  outTradeNo: string;            // 唯一订单号
  transactionId: string | null;  // 支付平台交易号
  status: WithdrawalStatus;      // 状态
  accountInfo: object;           // 提现账户信息
  adminId: string | null;        // 处理管理员ID
  processedAt: Date | null;      // 处理时间
  rejectedReason: string | null; // 拒绝原因
  callbackData: object | null;   // 支付回调数据
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}
```

### WithdrawalStatus
- `PENDING`: 待处理
- `PROCESSING`: 处理中
- `SUCCESS`: 成功
- `FAILED`: 失败
- `REJECTED`: 已拒绝
- `TIMEOUT`: 超时

### PaymentProvider
- `WECHAT`: 微信支付
- `ALIPAY`: 支付宝

## API Endpoints

### User Endpoints

#### POST /withdrawals
创建提现申请

**Request Body:**
```json
{
  "amount": 100,
  "provider": "WECHAT",
  "accountInfo": {
    "openid": "user-openid",
    "realName": "张三"
  }
}
```

**Response:**
```json
{
  "id": "1",
  "userId": "123",
  "amount": 100,
  "provider": "WECHAT",
  "status": "PENDING",
  "outTradeNo": "WD1697123456789abcdef",
  "createdAt": "2025-10-15T12:00:00Z"
}
```

#### GET /withdrawals/me
获取我的提现记录

**Query Parameters:**
- `status`: 状态筛选（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）

**Response:**
```json
{
  "withdrawals": [...],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

#### GET /withdrawals/:id
获取单个提现详情

**Response:**
```json
{
  "id": "1",
  "userId": "123",
  "amount": 100,
  "provider": "WECHAT",
  "status": "SUCCESS",
  "outTradeNo": "WD1697123456789abcdef",
  "transactionId": "wx123456789",
  "processedAt": "2025-10-15T13:00:00Z",
  "createdAt": "2025-10-15T12:00:00Z"
}
```

### Admin Endpoints

#### GET /withdrawals/admin/pending
获取待处理提现列表（管理员）

**Query Parameters:**
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）

**Response:**
```json
{
  "withdrawals": [...],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

## Business Logic

### 提现订单号生成规则
- 格式：`WD + 时间戳 + 16位随机字符串`
- 示例：`WD1697123456789abcdef0123456789`
- 保证全局唯一性

### 金额验证
- 最低提现金额：10元
- 不能超过可用余额
- 金额必须大于0

### 事务处理
创建提现时使用数据库事务确保：
1. 冻结余额成功
2. 创建提现记录成功
3. 创建交易记录成功

如果任何一步失败，整个操作回滚。

### 并发控制
- 使用乐观锁（version字段）防止并发冲突
- 账户余额更新时检查版本号
- 冲突时自动重试（最多3次）

## Error Handling

### WithdrawalNotFoundException
提现记录不存在

### MinimumWithdrawalAmountException
提现金额低于最低限额

### InsufficientBalanceException
可用余额不足

### DuplicateWithdrawalException
提现订单号重复（极端情况）

## Security Considerations

1. **用户权限验证**：用户只能查询自己的提现记录
2. **管理员权限**：待处理列表仅管理员可访问
3. **金额验证**：严格验证提现金额范围
4. **余额检查**：确保可用余额足够
5. **订单号唯一性**：防止重复提交
6. **事务保证**：确保数据一致性

## Testing

### Unit Tests
- 创建提现申请（正常流程）
- 创建提现申请（金额不足）
- 创建提现申请（低于最低金额）
- 查询提现记录（带筛选）
- 查询单个提现（权限验证）
- 查询待处理提现（管理员）

### Integration Tests
- 完整提现流程测试
- 并发提现测试
- 事务回滚测试

## Next Steps

Task 6 将实现：
- 支付提供商集成（微信/支付宝）
- 提现处理逻辑（processWithdrawal）
- 提现拒绝逻辑（rejectWithdrawal）
- 支付回调处理（handlePaymentCallback）
- 幂等性检查
- 签名验证
