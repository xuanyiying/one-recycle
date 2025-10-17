# OneRecycle - 数据库设计文档

## 1. ER 图 (Entity-Relationship Diagram)

使用 Mermaid 语法绘制核心实体关系图。

```mermaid
erDiagram
    USER ||--o{ USER_IDENTITY : "has"
    USER ||--o{ ADDRESS : "has"
    USER ||--o{ "ORDER" : "places"
    USER ||--o{ INVOICE_REQUEST : "requests"

    "ORDER" ||--|{ ORDER_ITEM : "contains"
    "ORDER" ||--o{ PAYMENT : "has"
    "ORDER" ||--o{ ASSIGNMENT : "has"
    "ORDER" }|--|| ADDRESS : "ships to"

    ITEM_CATEGORY ||--o{ ORDER_ITEM : "classifies"
    ITEM_CATEGORY ||--o{ PRICING_RULE : "governs"
    ITEM_CATEGORY }o--|| ITEM_CATEGORY : "is child of"

    COURIER ||--o{ ASSIGNMENT : "accepts"

    PAYMENT ||--o{ REFUND : "can be"

    ADMIN_USER ||--|{ ADMIN_USER_ROLE : "has"
    ROLE ||--|{ ADMIN_USER_ROLE : "has"
    ROLE ||--|{ ROLE_PERMISSION : "has"
    PERMISSION ||--|{ ROLE_PERMISSION : "has"

    USER {
        bigint id PK
        varchar mobile
        varchar nickname
        varchar avatar_url
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    USER_IDENTITY {
        bigint id PK
        bigint user_id FK
        varchar provider
        varchar app_id
        varchar openid
        varchar unionid
        jsonb extra_data
    }

    ADDRESS {
        bigint id PK
        bigint user_id FK
        varchar consignee
        varchar mobile
        varchar province
        varchar city
        varchar district
        varchar detail
        point location
        boolean is_default
    }

    "ORDER" {
        bigint id PK
        bigint user_id FK
        bigint address_id FK
        varchar status
        timestamp expect_pickup_time
        decimal pay_amount
        decimal settlement_amount
        varchar channel
    }

    ORDER_ITEM {
        bigint id PK
        bigint order_id FK
        bigint category_id FK
        decimal estimated_weight
        decimal actual_weight
        decimal unit_price
        decimal amount
    }

    ITEM_CATEGORY {
        bigint id PK
        varchar name
        bigint parent_id FK
        boolean enabled
        varchar icon_url
    }

    PRICING_RULE {
        bigint id PK
        bigint category_id FK
        varchar region_code
        decimal base_price_per_kg
        jsonb weight_tiers
    }

    COURIER {
        bigint id PK
        varchar name
        varchar mobile
        varchar status
    }

    ASSIGNMENT {
        bigint id PK
        bigint order_id FK
        bigint courier_id FK
        varchar status
        timestamp accepted_at
        timestamp finished_at
    }

    PAYMENT {
        bigint id PK
        bigint order_id FK
        varchar provider
        varchar out_trade_no
        varchar transaction_id
        decimal total
        varchar status
    }

    REFUND {
        bigint id PK
        bigint payment_id FK
        varchar out_refund_no
        decimal refund_amount
        varchar status
    }

    INVOICE_REQUEST {
        bigint id PK
        bigint user_id FK
        varchar title
        varchar tax_no
        varchar email
        varchar status
    }

    ADMIN_USER {
        bigint id PK
        varchar username
        varchar password_hash
    }

    ROLE {
        bigint id PK
        varchar name
    }

    PERMISSION {
        bigint id PK
        varchar code
        varchar description
    }
```

## 2. 实际表结构定义

项目采用微服务架构，每个服务有独立的数据库schema。以下是各服务的实际Prisma schema定义：

### 2.1 账户服务 (account-service)

```prisma
// services/account-service/prisma/schema.prisma

/// 用户主表
model User {
  id         BigInt        @id @default(autoincrement())
  mobile     String?       @db.VarChar(20)
  nickname   String?       @db.VarChar(50)
  avatarUrl  String?       @map("avatar_url") @db.VarChar(255)
  status     UserStatus    @default(ACTIVE)
  createdAt  DateTime      @default(now()) @map("created_at")
  updatedAt  DateTime      @updatedAt @map("updated_at")
  identities UserIdentity[]
  addresses  Address[]

  @@map("users")
}

/// 用户多平台身份
model UserIdentity {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @map("user_id")
  provider  String   @db.VarChar(20) // 'wechat', 'alipay', 'douyin'
  appId     String   @map("app_id") @db.VarChar(100)
  openid    String   @db.VarChar(100)
  unionid   String?  @db.VarChar(100)
  extraData Json?    @map("extra_data")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id])

  @@unique([provider, openid])
  @@index([userId])
  @@map("user_identities")
}

/// 用户地址
model Address {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @map("user_id")
  consignee String   @db.VarChar(50)
  mobile    String   @db.VarChar(20)
  province  String   @db.VarChar(50)
  city      String   @db.VarChar(50)
  district  String   @db.VarChar(50)
  detail    String   @db.VarChar(255)
  isDefault Boolean  @default(false) @map("is_default")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("addresses")
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
}
```

### 2.2 订单服务 (order-service)

```prisma
// services/order-service/prisma/schema.prisma

model Order {
  id               BigInt        @id @default(autoincrement())
  orderNo          String        @unique @map("order_no") @db.VarChar(40)
  userId           BigInt        @map("user_id")
  addressId        BigInt        @map("address_id")
  status           OrderStatus   @default(PENDING)
  expectPickupTime DateTime      @map("expect_pickup_time")
  actualPickupTime DateTime?     @map("actual_pickup_time")
  estimatedAmount  Decimal       @default(0) @map("estimated_amount") @db.Decimal(10, 2)
  settlementAmount Decimal       @default(0) @map("settlement_amount") @db.Decimal(10, 2)
  payAmount        Decimal       @default(0) @map("pay_amount") @db.Decimal(10, 2)
  channel          String        @db.VarChar(30) // 'WECHAT_MP', 'ALIPAY_MP'
  remark           String?       @db.VarChar(500)
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime      @updatedAt @map("updated_at")
  items            OrderItem[]
  assignments      Assignment[]

  @@index([userId, status, createdAt])
  @@map("orders")
}

model OrderItem {
  id              BigInt   @id @default(autoincrement())
  orderId         BigInt   @map("order_id")
  estimatedWeight Decimal? @map("estimated_weight") @db.Decimal(10, 2)
  actualWeight    Decimal? @map("actual_weight") @db.Decimal(10, 2)
  unitPrice       Decimal  @map("unit_price") @db.Decimal(10, 2)
  amount          Decimal  @db.Decimal(10, 2)
  createdAt       DateTime @default(now()) @map("created_at")
  order           Order    @relation(fields: [orderId], references: [id])

  @@index([orderId])
  @@map("order_items")
}

model Assignment {
  id         BigInt           @id @default(autoincrement())
  orderId    BigInt           @map("order_id")
  courierId  BigInt           @map("courier_id")
  status     AssignmentStatus @default(ASSIGNED)
  acceptedAt DateTime?        @map("accepted_at")
  arrivedAt  DateTime?        @map("arrived_at")
  finishedAt DateTime?        @map("finished_at")
  createdAt  DateTime         @default(now()) @map("created_at")
  order      Order            @relation(fields: [orderId], references: [id])

  @@index([orderId])
  @@index([courierId, status])
  @@map("assignments")
}

enum OrderStatus {
  PENDING      // 待派单
  ASSIGNED     // 待接单
  ACCEPTED     // 待上门
  PROCESSING   // 回收中
  COMPLETED    // 已完成
  CANCELLED    // 已取消
}

enum AssignmentStatus {
  ASSIGNED
  ACCEPTED
  REJECTED
  ARRIVED
  FINISHED
  CANCELLED
}
```

### 2.3 分类服务 (category-service)

```prisma
// services/category-service/prisma/schema.prisma

model Category {
  id          BigInt   @id @default(autoincrement())
  name        String   @db.VarChar(50)
  description String?  @db.VarChar(255)
  unitPrice   Decimal  @map("unit_price") @db.Decimal(10, 2)
  icon        String?  @db.VarChar(255)
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("categories")
}
```

### 2.4 库存服务 (inventory-service)

```prisma
// services/inventory-service/prisma/schema.prisma

model InventoryItem {
  id           BigInt                 @id @default(autoincrement())
  categoryId   BigInt                 @map("category_id")
  name         String                 @db.VarChar(100)
  description  String?                @db.VarChar(500)
  unit         String                 @db.VarChar(20) // 单位，如 kg, 件, 个等
  quantity     Decimal                @db.Decimal(12, 2) // 库存数量
  unitPrice    Decimal                @map("unit_price") @db.Decimal(10, 2) // 单价
  totalPrice   Decimal                @map("total_price") @db.Decimal(12, 2) // 总价值
  location     String?                @db.VarChar(100) // 存放位置
  status       InventoryStatus        @default(IN_STOCK)
  createdAt    DateTime               @default(now()) @map("created_at")
  updatedAt    DateTime               @updatedAt @map("updated_at")
  transactions InventoryTransaction[]
  salesRecords SalesRecord[]

  @@map("inventory_items")
}

model InventoryTransaction {
  id          BigInt          @id @default(autoincrement())
  itemId      BigInt          @map("item_id")
  type        TransactionType
  quantity    Decimal         @db.Decimal(12, 2) // 变动数量
  unitPrice   Decimal         @map("unit_price") @db.Decimal(10, 2) // 单价
  totalPrice  Decimal         @map("total_price") @db.Decimal(12, 2) // 总价值
  referenceId String?         @map("reference_id") @db.VarChar(50) // 关联订单ID等
  notes       String?         @db.VarChar(500)
  createdAt   DateTime        @default(now()) @map("created_at")
  item        InventoryItem   @relation(fields: [itemId], references: [id])

  @@index([itemId])
  @@map("inventory_transactions")
}

model SalesRecord {
  id         BigInt        @id @default(autoincrement())
  itemId     BigInt        @map("item_id")
  quantity   Decimal       @db.Decimal(12, 2)
  unitPrice  Decimal       @map("unit_price") @db.Decimal(10, 2)
  totalPrice Decimal       @map("total_price") @db.Decimal(12, 2)
  orderId    String        @map("order_id") @db.VarChar(50)
  customerId BigInt        @map("customer_id")
  soldAt     DateTime      @map("sold_at")
  notes      String?       @db.VarChar(500)
  createdAt  DateTime      @default(now()) @map("created_at")
  item       InventoryItem @relation(fields: [itemId], references: [id])

  @@index([itemId])
  @@index([orderId])
  @@map("sales_records")
}

enum InventoryStatus {
  IN_STOCK     // 在库
  LOW_STOCK    // 库存不足
  OUT_OF_STOCK // 缺货
}

enum TransactionType {
  INBOUND      // 入库
  OUTBOUND     // 出库
  ADJUSTMENT   // 调整
}
```

### 2.5 支付服务 (payment-service)

```prisma
// services/payment-service/prisma/schema.prisma

model Payment {
  id            BigInt          @id @default(autoincrement())
  orderId       BigInt          @map("order_id")
  provider      PaymentProvider @map("provider")
  outTradeNo    String          @unique @map("out_trade_no") @db.VarChar(128)
  transactionId String?         @map("transaction_id") @db.VarChar(128)
  total         Decimal         @db.Decimal(10, 2)
  status        PaymentStatus   @default(PENDING)
  notifyRaw     Json?           @map("notify_raw")
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  refunds       Refund[]

  @@index([orderId])
  @@map("payments")
}

model Refund {
  id           BigInt       @id @default(autoincrement())
  paymentId    BigInt       @map("payment_id")
  outRefundNo  String       @unique @map("out_refund_no") @db.VarChar(128)
  refundAmount Decimal      @map("refund_amount") @db.Decimal(10, 2)
  status       RefundStatus @default(PROCESSING)
  reason       String?      @db.VarChar(255)
  notifyRaw    Json?        @map("notify_raw")
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")
  payment      Payment      @relation(fields: [paymentId], references: [id])

  @@index([paymentId])
  @@map("refunds")
}

enum PaymentProvider {
  WECHAT
  ALIPAY
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  CLOSED
}

enum RefundStatus {
  PROCESSING
  SUCCESS
  FAILED
}
```

## 3. 数据库设计特点

### 3.1 微服务数据库隔离

- **独立数据库**: 每个微服务拥有独立的数据库实例，确保服务间的数据隔离
- **数据一致性**: 通过事件驱动和Saga模式保证跨服务的数据一致性
- **服务通信**: 服务间通过gRPC进行数据交换，避免直接数据库访问

### 3.2 索引策略

#### 账户服务索引
- **`user_identities`**: `(provider, openid)` 联合唯一索引用于快速查找用户身份
- **`addresses`**: `user_id` 索引用于查询用户地址列表

#### 订单服务索引  
- **`orders`**: `(user_id, status, created_at)` 联合索引用于高效查询用户订单列表
- **`orders`**: `order_no` 唯一索引用于订单号查询
- **`assignments`**: `(courier_id, status)` 联合索引用于查询快递员任务列表
- **`order_items`**: `order_id` 索引用于查询订单明细

#### 支付服务索引
- **`payments`**: `out_trade_no` 唯一索引用于处理支付回调
- **`payments`**: `order_id` 索引用于关联订单查询
- **`refunds`**: `out_refund_no` 唯一索引用于退款查询

#### 库存服务索引
- **`inventory_items`**: `category_id` 索引用于分类查询
- **`inventory_transactions`**: `item_id` 索引用于库存变动历史
- **`sales_records`**: `(item_id, order_id)` 索引用于销售记录查询

### 3.3 数据类型设计

- **金额字段**: 统一使用 `Decimal(10, 2)` 确保精度
- **重量字段**: 使用 `Decimal(10, 2)` 或 `Decimal(12, 2)` 支持精确计量
- **时间字段**: 统一使用 `DateTime` 类型，包含 `created_at` 和 `updated_at`
- **状态字段**: 使用枚举类型确保数据一致性
- **JSON字段**: 用于存储灵活的扩展数据（如支付回调原始数据）