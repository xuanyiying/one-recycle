# Account Module

This module implements the core account management functionality for the points payment system.

## Features

### Account Management
- **Auto-create accounts**: Accounts are automatically created when first accessed
- **Balance tracking**: Tracks available balance, frozen balance, total income, and total withdrawals
- **Optimistic locking**: Uses version field to prevent concurrent update conflicts with automatic retry mechanism

### Balance Operations
All balance operations use database transactions to ensure atomicity and consistency.

#### 1. Increase Balance (订单收入)
- Increases available balance when orders are completed
- Creates ORDER_INCOME transaction record
- Implements idempotency check to prevent duplicate credits
- Auto-creates account if it doesn't exist

#### 2. Freeze Balance (提现冻结)
- Freezes balance when withdrawal request is created
- Moves amount from available to frozen balance
- Creates WITHDRAWAL_FREEZE transaction record
- Validates sufficient available balance

#### 3. Deduct Frozen Balance (提现成功)
- Deducts frozen balance when withdrawal succeeds
- Creates WITHDRAWAL_SUCCESS transaction record
- Updates total withdrawal amount

#### 4. Unfreeze Balance (提现失败/拒绝)
- Returns frozen balance to available balance
- Creates WITHDRAWAL_REJECTED transaction record
- Used when withdrawal fails or is rejected

## API Endpoints

### Internal APIs (for service-to-service communication)

- `POST /accounts` - Create account
- `GET /accounts/:userId` - Get account info
- `POST /accounts/increase` - Increase balance (order income)
- `POST /accounts/freeze` - Freeze balance (withdrawal request)
- `POST /accounts/deduct-frozen` - Deduct frozen balance (withdrawal success)
- `POST /accounts/unfreeze` - Unfreeze balance (withdrawal failed/rejected)

## Error Handling

The module includes custom exceptions:
- `AccountNotFoundException` - Account not found for user
- `InsufficientBalanceException` - Insufficient available balance
- `InsufficientFrozenBalanceException` - Insufficient frozen balance
- `OptimisticLockException` - Concurrent update detected
- `DuplicateOrderIncomeException` - Order already credited

## Concurrency Control

### Optimistic Locking
- Uses `version` field in Account model
- Automatically retries up to 3 times on conflict
- Exponential backoff between retries (50ms * attempt)

### Transaction Isolation
- All balance operations wrapped in database transactions
- Ensures atomicity of balance updates and transaction record creation

## Usage Example

```typescript
// Increase balance after order completion
const transaction = await accountService.increaseBalance(
  userId: 123,
  amount: 50.00,
  orderId: 'ORD-2025-001',
  description: '订单收入 - ORD-2025-001'
);

// Freeze balance for withdrawal
const freezeTransaction = await accountService.freezeBalance(
  userId: 123,
  amount: 30.00,
  withdrawalId: 'WD-2025-001'
);

// Deduct frozen balance after successful withdrawal
const deductTransaction = await accountService.deductFrozenBalance(
  userId: 123,
  amount: 30.00,
  withdrawalId: 'WD-2025-001'
);
```

## Database Schema

See `prisma/schema.prisma` for the complete schema definition.

### Account Model
- `availableBalance` - Available balance for withdrawal
- `frozenBalance` - Balance frozen for pending withdrawals
- `totalIncome` - Total income from orders
- `totalWithdrawal` - Total successful withdrawals
- `version` - Optimistic lock version number

### Transaction Model
- Records all balance changes
- Includes balance before/after for audit trail
- Links to orders and withdrawals
