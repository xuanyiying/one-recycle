# Testing Order Completed Event Integration

## Prerequisites

1. Ensure all services are running:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - payment-service (port 3007)
   - message-queue (port 3010)

2. Ensure the database has the required tables:
   - accounts
   - transactions
   - withdrawals

## Test Steps

### 1. Start Services

```bash
# Terminal 1: Start message-queue service
cd services/message-queue
npm run start:dev

# Terminal 2: Start payment-service
cd services/payment-service
npm run start:dev
```

### 2. Create a Test User Account

First, create an account for the test user (if not exists):

```bash
curl -X POST http://localhost:3007/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1
  }'
```

Expected response:
```json
{
  "id": "1",
  "userId": "1",
  "availableBalance": "0.00",
  "frozenBalance": "0.00",
  "totalIncome": "0.00",
  "totalWithdrawal": "0.00",
  "version": 0,
  "createdAt": "2025-10-16T...",
  "updatedAt": "2025-10-16T..."
}
```

### 3. Publish Order Completed Event

Simulate an order completion by sending an event to the message queue:

```bash
curl -X POST http://localhost:3010/queue/order/completed \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_TEST_001",
    "userId": "1",
    "settlementAmount": 150.50,
    "completedAt": "2025-10-16T10:00:00Z",
    "courierId": "COURIER_001"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Order completed event queued successfully: ORDER_TEST_001"
}
```

### 4. Check Message Queue Dashboard

Open http://localhost:3010/admin/queues in your browser to see:
- The job should appear in the "order-queue"
- Status should change from "waiting" → "active" → "completed"
- Check the job details to see the processing result

### 5. Verify Balance Increase

Check the user's account balance:

```bash
curl -X GET http://localhost:3007/accounts/1
```

Expected response:
```json
{
  "id": "1",
  "userId": "1",
  "availableBalance": "150.50",  // ← Should be increased
  "frozenBalance": "0.00",
  "totalIncome": "150.50",       // ← Should be increased
  "totalWithdrawal": "0.00",
  "version": 1,                   // ← Should be incremented
  "createdAt": "2025-10-16T...",
  "updatedAt": "2025-10-16T..."
}
```

### 6. Verify Transaction Record

Check the transaction records:

```bash
curl -X GET "http://localhost:3007/accounts/1/transactions?page=1&limit=10"
```

Expected response:
```json
{
  "transactions": [
    {
      "id": "1",
      "accountId": "1",
      "type": "ORDER_INCOME",
      "amount": "150.50",
      "balanceBefore": "0.00",
      "balanceAfter": "150.50",
      "orderId": "ORDER_TEST_001",
      "withdrawalId": null,
      "description": "订单收入 - ORDER_TEST_001",
      "createdAt": "2025-10-16T..."
    }
  ],
  "total": 1
}
```

### 7. Test Idempotency

Try to publish the same event again:

```bash
curl -X POST http://localhost:3010/queue/order/completed \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_TEST_001",
    "userId": "1",
    "settlementAmount": 150.50,
    "completedAt": "2025-10-16T10:00:00Z"
  }'
```

The job should complete successfully but the balance should NOT increase again.
Check the logs - you should see a message like "Order ORDER_TEST_001 already credited, skipping..."

Verify the balance is still 150.50:
```bash
curl -X GET http://localhost:3007/accounts/1
```

### 8. Test Multiple Orders

Create multiple order completed events:

```bash
# Order 2
curl -X POST http://localhost:3010/queue/order/completed \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_TEST_002",
    "userId": "1",
    "settlementAmount": 75.25,
    "completedAt": "2025-10-16T11:00:00Z"
  }'

# Order 3
curl -X POST http://localhost:3010/queue/order/completed \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_TEST_003",
    "userId": "1",
    "settlementAmount": 200.00,
    "completedAt": "2025-10-16T12:00:00Z"
  }'
```

Verify the final balance:
```bash
curl -X GET http://localhost:3007/accounts/1
```

Expected balance: 150.50 + 75.25 + 200.00 = 425.75

## Expected Logs

### Message Queue Service Logs

```
[QueueController] Received order completed event: ORDER_TEST_001, User: 1, Amount: 150.5
[OrderQueueService] Order completed event queued: ORDER_TEST_001, User: 1, Amount: 150.5, Job ID: 1
[OrderProcessor] Processing job 1 of type order-completed
[OrderProcessor] Processing order completed: ORDER_TEST_001, User: 1, Amount: 150.5
[OrderProcessor] Calling payment service to increase balance for user 1
[PaymentServiceClient] Increasing balance for user 1, order ORDER_TEST_001, amount: 150.5
[PaymentServiceClient] Balance increased successfully for user 1, new balance: 150.5
[OrderProcessor] Balance increased successfully for user 1. Transaction ID: 1, Balance before: 0, Balance after: 150.5
[OrderProcessor] Sending balance update notification to user 1
[OrderProcessor] Order ORDER_TEST_001 completed successfully. User 1 received 150.5 points. New balance: 150.5
[OrderProcessor] Job 1 completed successfully
```

### Payment Service Logs

```
[AccountController] Increasing balance for user 1, amount: 150.5
[AccountService] Increasing balance for user 1, amount: 150.5, orderId: ORDER_TEST_001
[AccountService] Account found for user 1, current balance: 0
[AccountService] Creating transaction: ORDER_INCOME, amount: 150.5
[AccountService] Balance increased successfully. New balance: 150.5
```

## Troubleshooting

### Issue: "Account not found"

**Solution**: Create the account first:
```bash
curl -X POST http://localhost:3007/accounts -H "Content-Type: application/json" -d '{"userId": 1}'
```

### Issue: "Connection refused" to payment-service

**Solution**: 
1. Check if payment-service is running on port 3007
2. Check the MESSAGE_QUEUE_URL environment variable in message-queue service
3. Update the PAYMENT_SERVICE_URL in message-queue/.env if needed

### Issue: Jobs stuck in "waiting" state

**Solution**:
1. Check if Redis is running: `redis-cli ping`
2. Restart the message-queue service
3. Check the Bull Board dashboard for error messages

### Issue: Balance not increasing

**Solution**:
1. Check the message-queue logs for errors
2. Check the payment-service logs for errors
3. Verify the database connection
4. Check if the transaction was created but failed to update the account

## Database Verification

You can also verify directly in the database:

```sql
-- Check account
SELECT * FROM accounts WHERE user_id = 1;

-- Check transactions
SELECT * FROM transactions WHERE order_id = 'ORDER_TEST_001';

-- Check all transactions for user
SELECT t.* 
FROM transactions t
JOIN accounts a ON t.account_id = a.id
WHERE a.user_id = 1
ORDER BY t.created_at DESC;
```

## Clean Up

To reset the test data:

```sql
-- Delete transactions
DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = 1);

-- Reset account balance
UPDATE accounts SET 
  available_balance = 0,
  frozen_balance = 0,
  total_income = 0,
  total_withdrawal = 0,
  version = 0
WHERE user_id = 1;
```

Or delete the account entirely:
```sql
DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = 1);
DELETE FROM accounts WHERE user_id = 1;
```
