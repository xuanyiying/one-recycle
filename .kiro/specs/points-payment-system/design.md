# Design Document

## Overview

本设计文档描述了OneRecycle平台积分支付系统的技术架构和实现方案。该系统将在现有的payment-service基础上扩展积分账户功能，并与order-service、message-queue和client-mini进行集成。

核心设计理念：
- **账户模型**：为每个用户创建独立的积分账户，记录可用余额和冻结余额
- **异步处理**：使用消息队列处理订单完成后的积分入账，确保系统解耦和高可用
- **事务保证**：使用数据库事务确保账户余额变动的原子性和一致性
- **真实支付**：仅在用户提现时调用真实支付接口（微信/支付宝）
- **审计追踪**：记录所有交易明细，支持完整的资金流水追溯

## Architecture

### System Components

```
┌─────────────────┐
│  Client Mini    │
│  (Taro App)     │
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐
│  API Gateway    │
│  (Port 3002)    │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────────────┐
│           Payment Service (Port 3003)           │
│  ┌──────────────┐  ┌─────────────────────────┐ │
│  │   Account    │  │   Withdrawal            │ │
│  │   Module     │  │   Module                │ │
│  │              │  │                         │ │
│  │ - Balance    │  │ - Create Withdrawal     │ │
│  │ - Transaction│  │ - Process Payment       │ │
│  │ - Query      │  │ - Handle Callback       │ │
│  └──────────────┘  └─────────────────────────┘ │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │         Payment Provider Module          │  │
│  │  - WeChat Pay Integration                │  │
│  │  - Alipay Integration                    │  │
│  └──────────────────────────────────────────┘  │
└────────┬─────────────────────────────┬─────────┘
         │                             │
         │ Publish Events              │ Query
         ↓                             ↓
┌─────────────────┐          ┌─────────────────┐
│  Message Queue  │          │  Order Service  │
│  (Port 3010)    │          │  (Port 3003)    │
│                 │          │                 │
│ - order-queue   │          │ - Order Status  │
│ - payment-queue │          │ - Order Info    │
└─────────────────┘          └─────────────────┘
         │
         │ Consume Events
         ↓
┌─────────────────┐
│  Notification   │
│  Service        │
│  (Port 3004)    │
└─────────────────┘
```

### Data Flow

#### 1. 订单完成 → 积分入账
```
Order Service (订单完成)
    ↓ Publish Event
Message Queue (order-completed)
    ↓ Consume Event
Payment Service (积分入账)
    ↓ Create Transaction
Database (更新余额 + 交易记录)
    ↓ Publish Event
Message Queue (balance-updated)
    ↓ Consume Event
Notification Service (发送通知)
```

#### 2. 用户提现 → 真实支付
```
Client Mini (提交提现申请)
    ↓ REST API
API Gateway
    ↓ Forward Request
Payment Service (创建提现记录 + 冻结余额)
    ↓ Create Withdrawal
Database (更新余额 + 提现记录)
    ↓ Admin Approval
Payment Service (调用支付接口)
    ↓ WeChat/Alipay API
Payment Provider (转账)
    ↓ Async Callback
Payment Service (更新提现状态 + 扣除余额)
    ↓ Publish Event
Message Queue (withdrawal-completed)
    ↓ Consume Event
Notification Service (发送通知)
```

## Components and Interfaces

### 1. Account Module (积分账户模块)

#### AccountService
```typescript
class AccountService {
  // 创建账户
  async createAccount(userId: number): Promise<Account>
  
  // 查询账户信息
  async getAccount(userId: number): Promise<Account>
  
  // 增加余额（订单收入）
  async increaseBalance(
    userId: number,
    amount: number,
    orderId: string,
    description: string
  ): Promise<Transaction>
  
  // 冻结余额（提现申请）
  async freezeBalance(
    userId: number,
    amount: number,
    withdrawalId: string
  ): Promise<Transaction>
  
  // 扣除冻结余额（提现成功）
  async deductFrozenBalance(
    userId: number,
    amount: number,
    withdrawalId: string
  ): Promise<Transaction>
  
  // 解冻余额（提现失败/拒绝）
  async unfreezeBalance(
    userId: number,
    amount: number,
    withdrawalId: string
  ): Promise<Transaction>
  
  // 查询交易记录
  async getTransactions(
    userId: number,
    filters: TransactionFilters,
    page: number,
    limit: number
  ): Promise<{ transactions: Transaction[]; total: number }>
  
  // 获取账户统计
  async getAccountStats(userId: number): Promise<AccountStats>
}
```

#### AccountController
```typescript
@Controller('accounts')
class AccountController {
  @Get('me')
  getMyAccount(@User() user): Promise<Account>
  
  @Get('me/transactions')
  getMyTransactions(
    @User() user,
    @Query() filters: TransactionFilters
  ): Promise<{ transactions: Transaction[]; total: number }>
  
  @Get('me/stats')
  getMyStats(@User() user): Promise<AccountStats>
  
  // Admin endpoints
  @Get(':userId')
  @UseGuards(AdminGuard)
  getAccount(@Param('userId') userId: number): Promise<Account>
  
  @Get(':userId/transactions')
  @UseGuards(AdminGuard)
  getTransactions(
    @Param('userId') userId: number,
    @Query() filters: TransactionFilters
  ): Promise<{ transactions: Transaction[]; total: number }>
}
```

### 2. Withdrawal Module (提现模块)

#### WithdrawalService
```typescript
class WithdrawalService {
  // 创建提现申请
  async createWithdrawal(
    userId: number,
    amount: number,
    provider: PaymentProvider,
    accountInfo: WithdrawalAccountInfo
  ): Promise<Withdrawal>
  
  // 处理提现（调用真实支付接口）
  async processWithdrawal(
    withdrawalId: string,
    adminId: number
  ): Promise<Withdrawal>
  
  // 拒绝提现
  async rejectWithdrawal(
    withdrawalId: string,
    adminId: number,
    reason: string
  ): Promise<Withdrawal>
  
  // 处理支付回调
  async handlePaymentCallback(
    outTradeNo: string,
    callbackData: any
  ): Promise<void>
  
  // 查询提现记录
  async getWithdrawals(
    userId: number,
    filters: WithdrawalFilters,
    page: number,
    limit: number
  ): Promise<{ withdrawals: Withdrawal[]; total: number }>
  
  // 查询单个提现记录
  async getWithdrawal(withdrawalId: string): Promise<Withdrawal>
  
  // 获取待处理提现列表（管理员）
  async getPendingWithdrawals(
    page: number,
    limit: number
  ): Promise<{ withdrawals: Withdrawal[]; total: number }>
}
```

#### WithdrawalController
```typescript
@Controller('withdrawals')
class WithdrawalController {
  @Post()
  createWithdrawal(
    @User() user,
    @Body() dto: CreateWithdrawalDto
  ): Promise<Withdrawal>
  
  @Get('me')
  getMyWithdrawals(
    @User() user,
    @Query() filters: WithdrawalFilters
  ): Promise<{ withdrawals: Withdrawal[]; total: number }>
  
  @Get(':id')
  getWithdrawal(
    @User() user,
    @Param('id') id: string
  ): Promise<Withdrawal>
  
  // Admin endpoints
  @Get('pending')
  @UseGuards(AdminGuard)
  getPendingWithdrawals(
    @Query('page') page: number,
    @Query('limit') limit: number
  ): Promise<{ withdrawals: Withdrawal[]; total: number }>
  
  @Post(':id/approve')
  @UseGuards(AdminGuard)
  approveWithdrawal(
    @Param('id') id: string,
    @User() admin
  ): Promise<Withdrawal>
  
  @Post(':id/reject')
  @UseGuards(AdminGuard)
  rejectWithdrawal(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @User() admin
  ): Promise<Withdrawal>
  
  @Post('callback/:provider')
  handleCallback(
    @Param('provider') provider: string,
    @Body() callbackData: any
  ): Promise<void>
}
```

### 3. Payment Provider Module (支付提供商模块)

#### PaymentProviderService
```typescript
interface IPaymentProvider {
  // 发起转账
  transfer(
    amount: number,
    accountInfo: WithdrawalAccountInfo,
    outTradeNo: string
  ): Promise<PaymentResult>
  
  // 查询转账状态
  queryTransfer(outTradeNo: string): Promise<TransferStatus>
  
  // 验证回调签名
  verifyCallback(callbackData: any): boolean
}

class WeChatPayProvider implements IPaymentProvider {
  // 微信企业付款到零钱
  async transfer(...): Promise<PaymentResult>
  async queryTransfer(...): Promise<TransferStatus>
  verifyCallback(...): boolean
}

class AlipayProvider implements IPaymentProvider {
  // 支付宝转账到账户
  async transfer(...): Promise<PaymentResult>
  async queryTransfer(...): Promise<TransferStatus>
  verifyCallback(...): boolean
}

class PaymentProviderFactory {
  static getProvider(provider: PaymentProvider): IPaymentProvider
}
```

### 4. Message Queue Integration

#### Order Completed Event Handler
```typescript
// In message-queue service
@Processor('order-queue')
class OrderProcessor {
  @Process('order-completed')
  async handleOrderCompleted(job: Job<OrderCompletedEventDto>) {
    const { orderId, userId, settlementAmount } = job.data;
    
    // 调用 payment-service 增加用户余额
    await this.paymentServiceClient.increaseBalance({
      userId,
      amount: settlementAmount,
      orderId,
      description: `订单收入 - ${orderId}`
    });
    
    // 发送通知
    await this.notificationQueueService.sendBalanceUpdateNotification({
      userId,
      amount: settlementAmount,
      type: 'ORDER_INCOME'
    });
  }
}
```

#### Payment Service Client
```typescript
// In message-queue service
class PaymentServiceClient {
  async increaseBalance(data: IncreaseBalanceDto): Promise<void> {
    return this.httpService.post(
      `${this.paymentServiceUrl}/accounts/increase`,
      data
    ).toPromise();
  }
}
```

### 5. Client Mini Integration

#### 个人中心页面
```typescript
// apps/client-mini/src/pages/profile/index.tsx
const ProfilePage = () => {
  const [account, setAccount] = useState<Account>();
  
  useEffect(() => {
    loadAccount();
  }, []);
  
  const loadAccount = async () => {
    const data = await accountService.getMyAccount();
    setAccount(data);
  };
  
  return (
    <View>
      <View className="balance-card">
        <Text>可用余额</Text>
        <Text className="amount">¥{account?.availableBalance}</Text>
        <Button onClick={handleWithdraw}>提现</Button>
      </View>
      
      <View className="frozen-balance">
        <Text>冻结金额：¥{account?.frozenBalance}</Text>
      </View>
      
      <View className="transaction-list">
        <Text>交易明细</Text>
        {/* Transaction list */}
      </View>
    </View>
  );
};
```

#### 提现申请页面
```typescript
// apps/client-mini/src/pages/withdrawal/index.tsx
const WithdrawalPage = () => {
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<'WECHAT' | 'ALIPAY'>('WECHAT');
  
  const handleSubmit = async () => {
    try {
      await withdrawalService.createWithdrawal({
        amount: parseFloat(amount),
        provider,
        accountInfo: {
          // 微信或支付宝账户信息
        }
      });
      
      Taro.showToast({ title: '提现申请已提交' });
      Taro.navigateBack();
    } catch (error) {
      Taro.showToast({ title: error.message, icon: 'none' });
    }
  };
  
  return (
    <View>
      <Input
        type="digit"
        placeholder="请输入提现金额"
        value={amount}
        onInput={(e) => setAmount(e.detail.value)}
      />
      
      <RadioGroup onChange={(e) => setProvider(e.detail.value)}>
        <Radio value="WECHAT">微信</Radio>
        <Radio value="ALIPAY">支付宝</Radio>
      </RadioGroup>
      
      <Button onClick={handleSubmit}>提交申请</Button>
    </View>
  );
};
```

## Data Models

### Database Schema (Prisma)

```prisma
// services/payment-service/prisma/schema.prisma

// 用户积分账户
model Account {
  id                BigInt      @id @default(autoincrement())
  userId            BigInt      @unique @map("user_id")
  availableBalance  Decimal     @default(0) @map("available_balance") @db.Decimal(10, 2)
  frozenBalance     Decimal     @default(0) @map("frozen_balance") @db.Decimal(10, 2)
  totalIncome       Decimal     @default(0) @map("total_income") @db.Decimal(10, 2)
  totalWithdrawal   Decimal     @default(0) @map("total_withdrawal") @db.Decimal(10, 2)
  version           Int         @default(0) // 乐观锁版本号
  createdAt         DateTime    @default(now()) @map("created_at")
  updatedAt         DateTime    @updatedAt @map("updated_at")
  transactions      Transaction[]
  withdrawals       Withdrawal[]

  @@index([userId])
  @@map("accounts")
}

// 交易记录
model Transaction {
  id              BigInt            @id @default(autoincrement())
  accountId       BigInt            @map("account_id")
  type            TransactionType
  amount          Decimal           @db.Decimal(10, 2)
  balanceBefore   Decimal           @map("balance_before") @db.Decimal(10, 2)
  balanceAfter    Decimal           @map("balance_after") @db.Decimal(10, 2)
  orderId         String?           @map("order_id") @db.VarChar(64)
  withdrawalId    BigInt?           @map("withdrawal_id")
  description     String            @db.VarChar(255)
  createdAt       DateTime          @default(now()) @map("created_at")
  account         Account           @relation(fields: [accountId], references: [id])
  withdrawal      Withdrawal?       @relation(fields: [withdrawalId], references: [id])

  @@index([accountId])
  @@index([orderId])
  @@index([withdrawalId])
  @@index([createdAt])
  @@map("transactions")
}

// 提现记录
model Withdrawal {
  id              BigInt            @id @default(autoincrement())
  accountId       BigInt            @map("account_id")
  userId          BigInt            @map("user_id")
  amount          Decimal           @db.Decimal(10, 2)
  provider        PaymentProvider
  outTradeNo      String            @unique @map("out_trade_no") @db.VarChar(128)
  transactionId   String?           @map("transaction_id") @db.VarChar(128)
  status          WithdrawalStatus  @default(PENDING)
  accountInfo     Json              @map("account_info") // 提现账户信息
  adminId         BigInt?           @map("admin_id")
  processedAt     DateTime?         @map("processed_at")
  rejectedReason  String?           @map("rejected_reason") @db.VarChar(255)
  callbackData    Json?             @map("callback_data")
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")
  account         Account           @relation(fields: [accountId], references: [id])
  transactions    Transaction[]

  @@index([accountId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("withdrawals")
}

enum TransactionType {
  ORDER_INCOME          // 订单收入
  WITHDRAWAL_FREEZE     // 提现冻结
  WITHDRAWAL_SUCCESS    // 提现成功
  WITHDRAWAL_FAILED     // 提现失败
  WITHDRAWAL_REJECTED   // 提现拒绝
  REFUND                // 退款
  ADJUSTMENT            // 人工调整
}

enum WithdrawalStatus {
  PENDING     // 待处理
  PROCESSING  // 处理中
  SUCCESS     // 成功
  FAILED      // 失败
  REJECTED    // 已拒绝
  TIMEOUT     // 超时
}
```

### DTOs

```typescript
// CreateWithdrawalDto
export class CreateWithdrawalDto {
  @IsNumber()
  @Min(10)
  amount: number;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsObject()
  accountInfo: WithdrawalAccountInfo;
}

// WithdrawalAccountInfo
export interface WithdrawalAccountInfo {
  // 微信
  openid?: string;
  realName?: string;
  
  // 支付宝
  alipayAccount?: string;
  alipayName?: string;
}

// TransactionFilters
export interface TransactionFilters {
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
}

// WithdrawalFilters
export interface WithdrawalFilters {
  status?: WithdrawalStatus;
  startDate?: Date;
  endDate?: Date;
}

// AccountStats
export interface AccountStats {
  totalIncome: number;
  totalWithdrawal: number;
  totalOrders: number;
  successfulWithdrawals: number;
}
```

## Error Handling

### Error Types

```typescript
// 账户相关错误
class AccountNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(`Account not found for user ${userId}`);
  }
}

class InsufficientBalanceException extends BadRequestException {
  constructor(available: number, required: number) {
    super(`Insufficient balance: available ${available}, required ${required}`);
  }
}

// 提现相关错误
class WithdrawalNotFoundException extends NotFoundException {
  constructor(withdrawalId: string) {
    super(`Withdrawal ${withdrawalId} not found`);
  }
}

class WithdrawalAlreadyProcessedException extends ConflictException {
  constructor(withdrawalId: string) {
    super(`Withdrawal ${withdrawalId} has already been processed`);
  }
}

class MinimumWithdrawalAmountException extends BadRequestException {
  constructor(minimum: number) {
    super(`Minimum withdrawal amount is ${minimum}`);
  }
}

// 支付相关错误
class PaymentProviderException extends InternalServerErrorException {
  constructor(provider: string, message: string) {
    super(`Payment provider ${provider} error: ${message}`);
  }
}

class PaymentCallbackVerificationException extends BadRequestException {
  constructor() {
    super('Payment callback verification failed');
  }
}
```

### Error Handling Strategy

1. **数据库事务失败**：自动回滚，记录错误日志，返回500错误
2. **余额不足**：返回400错误，提示用户余额不足
3. **支付接口调用失败**：记录错误日志，更新提现状态为FAILED，解冻余额
4. **重复操作**：使用幂等性检查，返回409冲突错误
5. **并发冲突**：使用乐观锁，重试机制（最多3次）

## Testing Strategy

### Unit Tests

```typescript
describe('AccountService', () => {
  describe('increaseBalance', () => {
    it('should increase balance and create transaction', async () => {
      // Test implementation
    });
    
    it('should create account if not exists', async () => {
      // Test implementation
    });
    
    it('should handle concurrent balance updates', async () => {
      // Test implementation
    });
  });
  
  describe('freezeBalance', () => {
    it('should freeze balance when sufficient', async () => {
      // Test implementation
    });
    
    it('should throw error when insufficient balance', async () => {
      // Test implementation
    });
  });
});

describe('WithdrawalService', () => {
  describe('createWithdrawal', () => {
    it('should create withdrawal and freeze balance', async () => {
      // Test implementation
    });
    
    it('should reject when amount below minimum', async () => {
      // Test implementation
    });
  });
  
  describe('processWithdrawal', () => {
    it('should call payment provider and update status', async () => {
      // Test implementation
    });
    
    it('should handle payment provider failure', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

```typescript
describe('Points Payment System Integration', () => {
  it('should complete full order-to-balance flow', async () => {
    // 1. Create order
    // 2. Complete order
    // 3. Verify balance increased
    // 4. Verify transaction created
  });
  
  it('should complete full withdrawal flow', async () => {
    // 1. Create withdrawal
    // 2. Verify balance frozen
    // 3. Process withdrawal
    // 4. Verify payment called
    // 5. Handle callback
    // 6. Verify balance deducted
  });
  
  it('should handle withdrawal rejection', async () => {
    // 1. Create withdrawal
    // 2. Reject withdrawal
    // 3. Verify balance unfrozen
  });
});
```

### E2E Tests

```typescript
describe('Client Mini E2E', () => {
  it('should display balance in profile page', async () => {
    // Test UI flow
  });
  
  it('should create withdrawal request', async () => {
    // Test UI flow
  });
  
  it('should display transaction history', async () => {
    // Test UI flow
  });
});
```

## Security Considerations

### 1. 账户安全
- 使用JWT验证用户身份
- 账户操作需要验证用户所有权
- 敏感操作记录审计日志

### 2. 并发控制
- 使用乐观锁（version字段）防止并发更新冲突
- 数据库事务确保余额变动的原子性
- 提现申请使用唯一outTradeNo防止重复提交

### 3. 支付安全
- 验证支付回调签名
- 使用HTTPS加密通信
- 支付接口调用使用幂等性机制
- 敏感信息（API密钥）使用环境变量存储

### 4. 风控策略
- 单次提现最低金额限制（10元）
- 单日提现次数限制（可配置）
- 异常交易模式检测（短时间大量提现）
- 提现需要管理员审核

### 5. 数据保护
- 用户账户信息加密存储
- 交易记录不可删除，仅可查询
- 定期备份数据库
- 敏感日志脱敏处理

## Performance Optimization

### 1. 数据库优化
- 为常用查询字段添加索引（userId, orderId, status, createdAt）
- 使用连接池管理数据库连接
- 大数据量查询使用分页
- 定期清理过期数据

### 2. 缓存策略
- 用户账户信息缓存（Redis，TTL 5分钟）
- 交易统计数据缓存（Redis，TTL 10分钟）
- 缓存失效策略：余额变动时主动清除缓存

### 3. 异步处理
- 订单完成后积分入账使用消息队列异步处理
- 通知发送使用消息队列异步处理
- 批量操作使用后台任务处理

### 4. 监控告警
- 监控账户余额异常变动
- 监控提现处理时长
- 监控支付接口调用成功率
- 监控消息队列积压情况

## Deployment Considerations

### 1. 环境变量
```env
# Payment Service
DATABASE_URL=postgresql://user:password@localhost:5432/payment_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret

# WeChat Pay
WECHAT_APP_ID=your-app-id
WECHAT_MCH_ID=your-mch-id
WECHAT_API_KEY=your-api-key
WECHAT_CERT_PATH=/path/to/cert.pem

# Alipay
ALIPAY_APP_ID=your-app-id
ALIPAY_PRIVATE_KEY=your-private-key
ALIPAY_PUBLIC_KEY=alipay-public-key

# Withdrawal Settings
MIN_WITHDRAWAL_AMOUNT=10
MAX_DAILY_WITHDRAWALS=5
WITHDRAWAL_TIMEOUT_HOURS=24
```

### 2. 数据库迁移
```bash
cd services/payment-service
npm run prisma:migrate dev --name add-points-system
npm run prisma:generate
```

### 3. 服务部署
- 确保payment-service、order-service、message-queue同时部署
- 配置API Gateway路由
- 配置消息队列连接
- 配置支付接口回调URL

### 4. 监控部署
- 配置日志收集（ELK/Loki）
- 配置性能监控（Prometheus + Grafana）
- 配置告警规则（AlertManager）
- 配置链路追踪（Jaeger）
