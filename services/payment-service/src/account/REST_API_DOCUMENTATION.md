# Account REST API Documentation

This document describes the REST API endpoints for the Account module in the payment service.

## Authentication

All user-facing endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Admin endpoints additionally require the user to have `ADMIN` or `SUPER_ADMIN` role.

## User Endpoints

### Get My Account

Get the current authenticated user's account information.

**Endpoint:** `GET /accounts/me`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "id": "1",
  "userId": "123",
  "availableBalance": "100.50",
  "frozenBalance": "0.00",
  "totalIncome": "100.50",
  "totalWithdrawal": "0.00",
  "version": 0,
  "createdAt": "2025-10-15T10:00:00.000Z",
  "updatedAt": "2025-10-15T10:00:00.000Z"
}
```

**Example:**
```bash
curl -X GET http://localhost:3003/accounts/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get My Transactions

Get the current authenticated user's transaction history with optional filtering and pagination.

**Endpoint:** `GET /accounts/me/transactions`

**Authentication:** Required (JWT)

**Query Parameters:**
- `type` (optional): Filter by transaction type
  - `ORDER_INCOME` - Order income
  - `WITHDRAWAL_FREEZE` - Withdrawal freeze
  - `WITHDRAWAL_SUCCESS` - Withdrawal success
  - `WITHDRAWAL_FAILED` - Withdrawal failed
  - `WITHDRAWAL_REJECTED` - Withdrawal rejected
  - `REFUND` - Refund
  - `ADJUSTMENT` - Manual adjustment
- `startDate` (optional): Filter transactions from this date (ISO 8601 format)
- `endDate` (optional): Filter transactions until this date (ISO 8601 format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 50)

**Response:**
```json
{
  "transactions": [
    {
      "id": "1",
      "accountId": "1",
      "type": "ORDER_INCOME",
      "amount": "50.00",
      "balanceBefore": "0.00",
      "balanceAfter": "50.00",
      "orderId": "ORDER123",
      "withdrawalId": null,
      "description": "订单收入 - ORDER123",
      "createdAt": "2025-10-15T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Example:**
```bash
# Get all transactions
curl -X GET http://localhost:3003/accounts/me/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get transactions with filters
curl -X GET "http://localhost:3003/accounts/me/transactions?type=ORDER_INCOME&startDate=2025-01-01&endDate=2025-12-31&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get My Stats

Get statistics for the current authenticated user's account.

**Endpoint:** `GET /accounts/me/stats`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "totalIncome": 100.50,
  "totalWithdrawal": 0.00,
  "totalOrders": 2,
  "successfulWithdrawals": 0,
  "availableBalance": 100.50,
  "frozenBalance": 0.00
}
```

**Example:**
```bash
curl -X GET http://localhost:3003/accounts/me/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Admin Endpoints

### Get User Account (Admin)

Get any user's account information. Requires admin privileges.

**Endpoint:** `GET /accounts/:userId`

**Authentication:** Required (JWT + Admin role)

**Path Parameters:**
- `userId`: The user ID to query

**Response:**
```json
{
  "id": "1",
  "userId": "123",
  "availableBalance": "100.50",
  "frozenBalance": "0.00",
  "totalIncome": "100.50",
  "totalWithdrawal": "0.00",
  "version": 0,
  "createdAt": "2025-10-15T10:00:00.000Z",
  "updatedAt": "2025-10-15T10:00:00.000Z"
}
```

**Example:**
```bash
curl -X GET http://localhost:3003/accounts/123 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

### Get User Transactions (Admin)

Get any user's transaction history. Requires admin privileges.

**Endpoint:** `GET /accounts/:userId/transactions`

**Authentication:** Required (JWT + Admin role)

**Path Parameters:**
- `userId`: The user ID to query

**Query Parameters:**
Same as "Get My Transactions" endpoint

**Response:**
Same as "Get My Transactions" endpoint

**Example:**
```bash
curl -X GET "http://localhost:3003/accounts/123/transactions?page=1&limit=50" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## Internal Endpoints

These endpoints are for internal service-to-service communication and should not be exposed publicly.

### Create Account

**Endpoint:** `POST /accounts`

**Request Body:**
```json
{
  "userId": 123
}
```

### Increase Balance

**Endpoint:** `POST /accounts/increase`

**Request Body:**
```json
{
  "userId": 123,
  "amount": 50.00,
  "orderId": "ORDER123",
  "description": "订单收入 - ORDER123"
}
```

### Freeze Balance

**Endpoint:** `POST /accounts/freeze`

**Request Body:**
```json
{
  "userId": 123,
  "amount": 50.00,
  "withdrawalId": "456"
}
```

### Deduct Frozen Balance

**Endpoint:** `POST /accounts/deduct-frozen`

**Request Body:**
```json
{
  "userId": 123,
  "amount": 50.00,
  "withdrawalId": "456"
}
```

### Unfreeze Balance

**Endpoint:** `POST /accounts/unfreeze`

**Request Body:**
```json
{
  "userId": 123,
  "amount": 50.00,
  "withdrawalId": "456"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "需要管理员权限"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Account not found for user 123"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "page must be a positive number"
  ]
}
```

---

## Security Considerations

1. **JWT Authentication**: All user-facing endpoints require valid JWT tokens
2. **Role-Based Access Control**: Admin endpoints check for ADMIN or SUPER_ADMIN role
3. **User Isolation**: Users can only access their own data through `/me` endpoints
4. **Admin Oversight**: Admins can access any user's data for support and auditing

---

## Integration with API Gateway

These endpoints should be exposed through the API Gateway with the following routing:

```
API Gateway (Port 3002) -> Payment Service (Port 3003)

GET  /api/accounts/me                    -> GET  /accounts/me
GET  /api/accounts/me/transactions       -> GET  /accounts/me/transactions
GET  /api/accounts/me/stats              -> GET  /accounts/me/stats
GET  /api/admin/accounts/:userId         -> GET  /accounts/:userId
GET  /api/admin/accounts/:userId/transactions -> GET /accounts/:userId/transactions
```

Internal endpoints should NOT be exposed through the API Gateway.
