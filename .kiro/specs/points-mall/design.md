# 积分商城技术设计文档

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                                │
├──────────────────────┬──────────────────────────────────────┤
│   管理端 (Next.js)    │      小程序端 (Taro)                  │
│   - 商品管理          │      - 商城首页                        │
│   - 订单管理          │      - 商品详情                        │
│   - 任务管理          │      - 订单中心                        │
│   - 数据概览          │      - 签到任务                        │
└──────────────────────┴──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      API 网关层                               │
│              (NestJS Controller + Guards)                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      业务逻辑层                               │
├────────────┬────────────┬─────────────┬────────────┬────────┤
│ 商品服务    │ 订单服务    │ 积分服务     │ 签到服务    │ 任务服务  │
│ Product    │ Order      │ Points      │ SignIn     │ Task   │
└────────────┴────────────┴─────────────┴────────────┴────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据访问层                               │
│                  (Prisma ORM + Redis)                       │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                               │
│            PostgreSQL (主库) + Redis (缓存)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 数据库设计

### 核心表结构

#### 1. 积分商品表 (points_products)

```prisma
model PointsProduct {
  id          BigInt            @id @default(autoincrement())
  name        String            @db.VarChar(100)
  description String?           @db.Text
  coverImage  String?           @db.VarChar(500)
  images      String[]          
  type        ProductType       @default(VIRTUAL)
  points      Int               // 兑换所需积分
  stock       Int               @default(0)
  soldCount   Int               @default(0)
  status      ProductStatus     @default(ACTIVE)
  sortOrder   Int               @default(0)
  categoryId  Int?              
  extraData   Json?             
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  orders      PointsOrder[]
  categories  PointsProductCategory[]

  @@index([status, sortOrder])
  @@map("points_products")
}
```

**字段说明**：
- `type`: 商品类型（VIRTUAL 虚拟商品 / PHYSICAL 实物商品）
- `status`: 商品状态（ACTIVE 上架 / INACTIVE 下架）
- `extraData`: 扩展数据（虚拟商品兑换码等）

#### 2. 积分商品分类表 (points_product_categories)

```prisma
model PointsProductCategory {
  id        Int       @id @default(autoincrement())
  name      String    @db.VarChar(50)
  icon      String?   @db.VarChar(200)
  sortOrder Int       @default(0)
  isActive  Boolean   @default(true)
  products  PointsProduct[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("points_product_categories")
}
```

#### 3. 积分订单表 (points_orders)

```prisma
model PointsOrder {
  id              BigInt            @id @default(autoincrement())
  orderNo         String            @unique @db.VarChar(64)
  userId          BigInt            @db.VarChar(64)
  productId       BigInt            @db.VarChar(64)
  productName     String            @db.VarChar(100)
  productImage    String?           @db.VarChar(500)
  productType     ProductType       
  points          Int               
  quantity        Int               @default(1)
  status          PointsOrderStatus @default(PENDING)
  addressId       BigInt?           
  addressSnapshot Json?             
  logisticsNo     String?           @db.VarChar(100)
  logisticsCompany String?          @db.VarChar(50)
  remark          String?           @db.VarChar(255)
  shippedAt       DateTime?         
  completedAt     DateTime?         
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  user    User          @relation(fields: [userId], references: [id])
  product PointsProduct @relation(fields: [productId], references: [id])
  address Address?      @relation(fields: [addressId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("points_orders")
}
```

**订单状态流转**：
```
PENDING (待处理) 
  ├─> SHIPPED (已发货) ─> COMPLETED (已完成)
  └─> CANCELLED (已取消)
```

#### 4. 积分记录表 (points_records)

```prisma
model PointsRecord {
  id           BigInt      @id @default(autoincrement())
  userId       BigInt      @db.VarChar(64)
  type         PointsType  
  points       Int         // 正数为获取，负数为消费
  balanceAfter Int         // 变更后余额
  sourceType   String?     @db.VarChar(20)
  sourceId     String?     @db.VarChar(64)
  description  String?     @db.VarChar(255)
  createdAt    DateTime    @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([type])
  @@map("points_records")
}
```

**积分类型**：
- `ORDER_REWARD`: 订单奖励
- `SIGN_IN`: 签到
- `INVITE`: 邀请好友
- `TASK`: 任务奖励
- `EXCHANGE`: 兑换消费
- `ADJUST`: 管理员调整
- `REFUND`: 退款返还

---

## API 设计

### 管理端 API

#### 1. 统计概览
```
GET /admin/points/stats

Response:
{
  "totalProducts": 100,
  "activeProducts": 85,
  "totalOrders": 1234,
  "pendingOrders": 23,
  "todayOrders": 15,
  "todayPointsIssued": 5000,
  "topProducts": [
    {
      "id": 1,
      "name": "商品名称",
      "soldCount": 100,
      "coverImage": "url"
    }
  ]
}
```

#### 2. 商品管理
```
GET /admin/points/products?page=1&limit=20&status=ACTIVE&categoryId=1&keyword=xxx
POST /admin/points/products
POST /admin/points/products/:id
POST /admin/points/products/:id/delete
```

#### 3. 订单管理
```
GET /admin/points/orders?page=1&limit=20&status=PENDING&keyword=xxx
GET /admin/points/orders/:id
POST /admin/points/orders/:id/ship
```

#### 4. 分类管理
```
GET /admin/points/categories
POST /admin/points/categories
POST /admin/points/categories/:id
POST /admin/points/categories/:id/delete
```

### 小程序端 API

#### 1. 商城首页
```
GET /points/overview
GET /points/products?categoryId=1&page=1&limit=20
GET /points/products/categories
```

#### 2. 商品详情
```
GET /points/products/:id
```

#### 3. 订单相关
```
POST /points/orders
GET /points/orders?status=ALL&page=1&limit=20
GET /points/orders/:id
POST /points/orders/:id/cancel
POST /points/orders/:id/confirm
```

#### 4. 签到相关
```
GET /points/sign-in/status
POST /points/sign-in
GET /points/signin/records?year=2026&month=3
```

#### 5. 任务相关
```
GET /points/tasks
POST /points/tasks/:id/complete
```

#### 6. 积分记录
```
GET /points/records?page=1&limit=20&type=EXCHANGE
GET /points/records/stats
```

#### 7. 邀请相关
```
GET /points/invite/stats
GET /points/invite/list?page=1&limit=20
```

---

## 前端组件设计

### 管理端组件

#### 1. 商品表单组件
```typescript
interface ProductFormProps {
  initialData?: PointsProduct;
  onSubmit: (data: CreateProductDto) => Promise<void>;
  onCancel: () => void;
}

// 表单字段
- name: 商品名称
- description: 商品描述
- coverImage: 封面图 (上传组件)
- images: 商品图片 (多图上传)
- type: 商品类型 (单选：实物/虚拟)
- points: 兑换积分 (数字输入)
- stock: 库存数量 (数字输入)
- status: 上架状态 (开关)
- categoryId: 所属分类 (下拉选择)
- extraData: 扩展数据 (JSON 编辑器，虚拟商品用)
```

#### 2. 订单列表组件
```typescript
interface OrderListProps {
  filters: {
    status?: PointsOrderStatus;
    keyword?: string;
    dateRange?: [Date, Date];
  };
}

// 表格列
- orderNo: 订单号
- productName: 商品名称
- userName: 用户
- points: 积分
- quantity: 数量
- status: 状态 (标签展示)
- createdAt: 创建时间
- actions: 操作 (查看/发货)
```

#### 3. 发货弹窗
```typescript
interface ShipOrderModalProps {
  orderId: bigint;
  visible: boolean;
  onSubmit: (data: { logisticsNo: string; logisticsCompany: string }) => void;
  onCancel: () => void;
}
```

### 小程序端组件

#### 1. 商品卡片组件
```typescript
interface ProductCardProps {
  product: PointsProduct;
  onClick: () => void;
}

// 展示内容
- coverImage: 商品图片
- name: 商品名称
- points: 兑换积分
- soldCount: 已兑换
- stock: 库存 (库存为 0 显示灰色)
```

#### 2. 订单卡片组件
```typescript
interface OrderCardProps {
  order: PointsOrder;
  onViewDetail: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
}

// 展示内容
- orderNo: 订单号
- productInfo: 商品信息
- status: 订单状态
- address: 收货地址
- actions: 取消/确认收货
```

#### 3. 签到日历组件
```typescript
interface SignInCalendarProps {
  year: number;
  month: number;
  signedInDays: number[];
  todaySigned: boolean;
  onSignIn: () => void;
}
```

#### 4. 任务卡片组件
```typescript
interface TaskCardProps {
  task: PointsTask;
  userTask?: UserTask;
  onComplete: () => void;
}

// 展示内容
- icon: 任务图标
- name: 任务名称
- description: 任务描述
- points: 奖励积分
- progress: 进度 (如需要)
- status: 未完成/已完成/已领取
```

---

## 关键业务逻辑

### 1. 订单创建流程

```typescript
async createOrder(userId: bigint, dto: CreateOrderDto) {
  return this.prisma.$transaction(async (tx) => {
    // 1. 检查商品是否存在和状态
    const product = await tx.pointsProduct.findUnique({
      where: { id: dto.productId },
    });
    
    if (!product || product.status !== 'ACTIVE') {
      throw new BadRequestException('商品不可兑换');
    }

    // 2. 检查库存
    if (product.stock < dto.quantity) {
      throw new BadRequestException('库存不足');
    }

    // 3. 检查用户积分
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    const totalPoints = product.points * dto.quantity;
    if (user.points < totalPoints) {
      throw new BadRequestException('积分不足');
    }

    // 4. 扣减库存
    await tx.pointsProduct.update({
      where: { id: product.id },
      data: {
        stock: { decrement: dto.quantity },
        soldCount: { increment: dto.quantity },
      },
    });

    // 5. 扣减用户积分
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { points: { decrement: totalPoints } },
      select: { points: true },
    });

    // 6. 创建订单
    const order = await tx.pointsOrder.create({
      data: {
        orderNo: this.generateOrderNo(),
        userId,
        productId: product.id,
        productName: product.name,
        productImage: product.coverImage,
        productType: product.type,
        points: totalPoints,
        quantity: dto.quantity,
        status: product.type === 'VIRTUAL' ? 'COMPLETED' : 'PENDING',
        addressId: dto.addressId,
        addressSnapshot: addressSnapshot,
        completedAt: product.type === 'VIRTUAL' ? new Date() : null,
      },
    });

    // 7. 记录积分变动
    await tx.pointsRecord.create({
      data: {
        userId,
        type: PointsType.EXCHANGE,
        points: -totalPoints,
        balanceAfter: updatedUser.points,
        sourceType: 'POINTS_ORDER',
        sourceId: order.id.toString(),
        description: `兑换商品：${product.name}`,
      },
    });

    return order;
  });
}
```

### 2. 签到逻辑

```typescript
async signIn(userId: bigint) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 检查今天是否已签到
  const existing = await this.prisma.signInRecord.findFirst({
    where: {
      userId,
      signedInAt: {
        gte: today,
      },
    },
  });

  if (existing) {
    throw new BadRequestException('今日已签到');
  }

  // 获取连续签到天数
  const consecutiveDays = await this.getConsecutiveDays(userId);
  
  // 计算奖励积分（基础 + 连续奖励）
  const basePoints = 10;
  const bonusPoints = Math.min(consecutiveDays, 7) * 2; // 最多奖励 7 天
  const totalPoints = basePoints + bonusPoints;

  return this.prisma.$transaction(async (tx) => {
    // 增加积分
    const user = await tx.user.update({
      where: { id: userId },
      data: { points: { increment: totalPoints } },
      select: { points: true },
    });

    // 创建签到记录
    await tx.signInRecord.create({
      data: {
        userId,
        points: totalPoints,
        balanceAfter: user.points,
        consecutiveDays: consecutiveDays + 1,
      },
    });

    // 记录积分变动
    await tx.pointsRecord.create({
      data: {
        userId,
        type: PointsType.SIGN_IN,
        points: totalPoints,
        balanceAfter: user.points,
        sourceType: 'SIGN_IN',
        description: `签到奖励：连续${consecutiveDays + 1}天`,
      },
    });

    return {
      points: totalPoints,
      consecutiveDays: consecutiveDays + 1,
      balance: user.points,
    };
  });
}
```

### 3. 库存并发控制

使用乐观锁防止超卖：

```typescript
async decreaseStock(productId: bigint, quantity: number, tx: any) {
  const result = await tx.pointsProduct.updateMany({
    where: {
      id: productId,
      stock: { gte: quantity }, // 确保库存充足
    },
    data: {
      stock: { decrement: quantity },
      soldCount: { increment: quantity },
    },
  });

  return result.count > 0; // 返回是否扣减成功
}
```

---

## 缓存策略

### Redis 缓存设计

#### 1. 商品缓存
```
Key: points:product:{id}
TTL: 1 小时
Data: PointsProduct JSON

Key: points:products:list:{categoryId}:{page}:{limit}
TTL: 10 分钟
Data: { data: [], total: 0 }
```

#### 2. 用户积分缓存
```
Key: points:user:{userId}
TTL: 30 分钟
Data: { currentPoints: 0, totalEarned: 0, totalSpent: 0 }
```

#### 3. 签到状态缓存
```
Key: points:signin:{userId}:{yyyy-MM-dd}
TTL: 24 小时
Data: { signed: true, points: 10 }
```

#### 4. 库存缓存预热
```
Key: points:product:{id}:stock
TTL: 实时
Data: number

// 使用 Redis DECR 原子操作扣减库存，然后异步同步到数据库
```

---

## 性能优化

### 1. 数据库优化
- 为常用查询字段添加索引（userId, status, createdAt）
- 使用分页查询避免全表扫描
- 热点数据使用缓存

### 2. 前端优化
- 图片懒加载
- 列表虚拟滚动（长列表）
- 接口请求防抖
- 使用 SWR 或 React Query 进行数据预取和缓存

### 3. 接口优化
- 合并接口请求（如概览数据）
- 使用 GraphQL 或 BFF 层按需返回数据
- 异步处理非关键逻辑（如发送通知）

---

## 安全设计

### 1. 接口安全
- 所有接口需要 JWT 认证
- 管理端接口需要 ADMIN 角色权限
- 用户只能操作自己的订单和积分
- 防重放攻击（nonce + timestamp）

### 2. 数据安全
- 积分变动必须记录日志
- 敏感操作需要二次确认
- 地址信息脱敏展示

### 3. 风控策略
- 限制单用户单日兑换次数
- 异常行为监控（频繁下单、批量注册）
- IP 限流

---

## 监控与日志

### 1. 业务指标监控
- 每日订单量
- 积分发放总量
- 活跃兑换用户数
- 商品库存预警

### 2. 异常监控
- 库存扣减失败
- 积分扣减异常
- 订单状态异常流转

### 3. 日志记录
```typescript
// 关键操作日志
this.logger.log(`Order created: userId=${userId}, productId=${productId}, points=${points}`);
this.logger.warn(`Stock low: productId=${productId}, stock=${stock}`);
this.logger.error(`Order creation failed: ${error.message}`, error.stack);
```

---

## 测试策略

### 1. 单元测试
- Service 层业务逻辑测试
- 工具函数测试
- 管道验证测试

### 2. 集成测试
- API 接口测试
- 数据库事务测试
- 缓存一致性测试

### 3. E2E 测试
- 完整兑换流程
- 签到流程
- 订单状态流转

### 4. 压力测试
- 并发下单测试
- 库存扣减测试
- 积分扣减测试

---

## 部署方案

### 1. 服务端部署
```yaml
# docker-compose.yml
services:
  api:
    image: one-recycle-server:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data
```

### 2. 管理端部署
```bash
# Vercel 自动部署
npm run build
# Output: .next/
```

### 3. 小程序部署
```bash
# 编译上传
npm run build:weapp
# 上传到微信小程序后台
```

---

## 数据迁移

### 初始化数据
```sql
-- 插入测试商品
INSERT INTO points_products (name, description, points, stock, type, status)
VALUES 
  ('10 元话费券', '满 100 元可用', 1000, 100, 'VIRTUAL', 'ACTIVE'),
  ('环保购物袋', '可重复使用', 500, 200, 'PHYSICAL', 'ACTIVE');

-- 插入测试分类
INSERT INTO points_product_categories (name, icon, sort_order)
VALUES 
  ('优惠券', 'coupon-icon', 1),
  ('生活用品', 'daily-icon', 2);
```

---

## 后续扩展

### 1. 营销功能
- 限时秒杀
- 积分加价购
- 拼团兑换

### 2. 会员体系
- 积分等级制度
- 专属商品池
- 生日礼包

### 3. 数据分析
- 用户画像
- 兑换偏好分析
- ROI 统计

### 4. 自动化运营
- 自动上架规则
- 库存预警通知
- 滞销商品处理
