# 积分商城开发规范

## 代码规范

### 命名规范

#### 文件和目录
```
# 管理端 (Next.js)
page.tsx              # 页面组件
components/           # 组件目录
services/            # API 服务目录
types/               # 类型定义目录

# 小程序端 (Taro)
index.tsx            # 页面组件
index.scss           # 样式文件
index.config.ts      # 页面配置
components/          # 组件目录
services/            # API 服务目录

# 服务端 (NestJS)
xxx.controller.ts    # Controller 层
xxx.service.ts       # Service 层
xxx.module.ts        # Module 层
dto/                 # DTO 目录
interfaces/          # 接口定义目录
```

#### 组件命名
```typescript
// 使用 PascalCase
ProductCard.tsx
OrderList.tsx
SignInCalendar.tsx

// 组件导出
export const ProductCard: React.FC<Props> = () => {}
```

#### 变量和函数命名
```typescript
// 使用 camelCase
const productList = [];
const handleOrderSubmit = () => {};
const fetchProductData = async () => {};

// 常量使用 UPPER_SNAKE_CASE
const MAX_POINTS = 10000;
const DEFAULT_PAGE_SIZE = 20;
```

#### 类型定义
```typescript
// 接口使用 PascalCase
interface Product {
  id: bigint;
  name: string;
}

// 枚举使用 PascalCase
enum OrderStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
}
```

---

### TypeScript 规范

#### 类型定义优先
```typescript
// ✅ 推荐：明确定义类型
interface CreateOrderDto {
  productId: bigint;
  quantity: number;
  addressId?: bigint;
  remark?: string;
}

// ❌ 避免：使用 any
const createOrder = (data: any) => {}
```

#### 可选链和空值合并
```typescript
// ✅ 推荐：使用可选链
const userName = user?.profile?.name;

// ✅ 推荐：使用空值合并
const pageSize = options?.pageSize ?? 20;
```

#### 类型守卫
```typescript
// ✅ 推荐：使用类型守卫
function isPointsProduct(product: any): product is PointsProduct {
  return product && typeof product.id === 'bigint';
}
```

---

### React 规范

#### 组件结构
```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

interface ProductCardProps {
  product: PointsProduct;
  onExchange: (id: bigint) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onExchange 
}) => {
  // Hooks 放在最前面
  const [loading, setLoading] = useState(false);

  // 事件处理函数
  const handleExchange = async () => {
    setLoading(true);
    try {
      await onExchange(product.id);
    } finally {
      setLoading(false);
    }
  };

  // 渲染
  return (
    <div className="product-card">
      <img src={product.coverImage} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.points} 积分</p>
      <Button 
        onClick={handleExchange}
        disabled={loading || product.stock === 0}
      >
        {product.stock === 0 ? '已兑完' : '立即兑换'}
      </Button>
    </div>
  );
};
```

#### Props 解构
```typescript
// ✅ 推荐：在参数列表中解构
const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onExchange,
  className 
}) => {}

// ❌ 避免：在组件内部解构
const ProductCard: React.FC<ProductCardProps> = (props) => {
  const { product, onExchange } = props;
}
```

#### 条件渲染
```typescript
// ✅ 推荐：三元运算符用于简单条件
{isLoading ? <Spinner /> : <Content />}

// ✅ 推荐：逻辑与用于显示/隐藏
{hasPermission && <DeleteButton />}

// ❌ 避免：数字 0 导致的渲染问题
{count && <Badge />}  // count 为 0 时会渲染 0
```

---

### NestJS 规范

#### Controller 规范
```typescript
@Controller('points/products')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class PointsProductAdminController {
  constructor(
    private readonly productService: PointsProductService,
  ) {}

  @Get()
  async findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }
}
```

#### Service 规范
```typescript
@Injectable()
export class PointsProductService {
  private readonly logger = new Logger(PointsProductService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 20, status, keyword } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PointsProductWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.name = { contains: keyword };
    }

    const [data, total] = await Promise.all([
      this.prisma.pointsProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'desc' },
      }),
      this.prisma.pointsProduct.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
```

#### DTO 验证
```typescript
import { IsString, IsInt, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  points: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
```

---

### 样式规范

#### SCSS 命名
```scss
// 使用 BEM 命名
.product-card {
  &__image {
    // ...
  }

  &__title {
    // ...
  }

  &--active {
    // ...
  }
}

// ✅ 推荐：语义化命名
.order-list {
  .order-item {
    .order-status {
      // ...
    }
  }
}

// ❌ 避免：样式耦合
.page {
  .content {
    .box {
      .text {
        // ...
      }
    }
  }
}
```

#### 响应式设计
```scss
// 使用变量断点
@include respond-to('mobile') {
  // 移动端样式
}

@include respond-to('tablet') {
  // 平板端样式
}

@include respond-to('desktop') {
  // 桌面端样式
}
```

#### 小程序样式
```scss
// 使用 Taro 提供的 mixin
@mixin hairline($color: #ddd) {
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: $color;
    transform: scaleY(0.5);
  }
}

.product-card {
  @include hairline();
}
```

---

## API 设计规范

### RESTful 规范

#### 路径命名
```
# ✅ 推荐：使用复数名词
GET /points/products
POST /points/orders
GET /points/users/:id

# ❌ 避免：使用动词
GET /getProducts
POST /createOrder
```

#### HTTP 方法
```
GET     - 获取资源
POST    - 创建资源
PUT     - 更新资源（全量）
PATCH   - 更新资源（部分）
DELETE  - 删除资源
```

#### 响应格式
```typescript
// 成功响应
{
  "code": 200,
  "data": { ... },
  "message": "success"
}

// 分页响应
{
  "code": 200,
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "limit": 20
  },
  "message": "success"
}

// 错误响应
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    {
      "field": "name",
      "message": "名称不能为空"
    }
  ]
}
```

---

## 数据库规范

### 命名规范
```prisma
// 表名使用复数，snake_case
model PointsProduct { }
model PointsOrder { }

// 字段使用 camelCase
model User {
  id          BigInt   @id
  nickname    String   @map("nickname")
  avatarUrl   String?  @map("avatar_url")
  createdAt   DateTime @default(now()) @map("created_at")
}

// 索引命名
@@index([userId])
@@index([status, createdAt])
```

### 事务使用
```typescript
// ✅ 推荐：使用事务保证一致性
async createOrder(userId: bigint, dto: CreateOrderDto) {
  return this.prisma.$transaction(async (tx) => {
    // 1. 扣减库存
    await tx.pointsProduct.update(...);
    
    // 2. 扣减积分
    const user = await tx.user.update(...);
    
    // 3. 创建订单
    const order = await tx.pointsOrder.create(...);
    
    // 4. 记录积分变动
    await tx.pointsRecord.create(...);
    
    return order;
  });
}
```

---

## 测试规范

### 单元测试
```typescript
describe('PointsProductService', () => {
  let service: PointsProductService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PointsProductService,
        {
          provide: PrismaService,
          useValue: {
            pointsProduct: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PointsProductService>(PointsProductService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return paginated products', async () => {
    const mockProducts = [{ id: 1n, name: 'Test' }];
    
    jest.spyOn(prisma.pointsProduct, 'findMany').mockResolvedValue(mockProducts);
    jest.spyOn(prisma.pointsProduct, 'count').mockResolvedValue(10);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(10);
  });
});
```

### E2E 测试
```typescript
describe('Points Products (e2e)', () => {
  const adminToken = 'xxx';
  
  it('should create a product', async () => {
    const response = await request(app)
      .post('/admin/points/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        points: 100,
        stock: 100,
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe('Test Product');
  });
});
```

---

## Git 规范

### Commit Message
```
feat: 新增商品管理页面
fix: 修复订单创建时的库存扣减问题
docs: 更新 API 文档
style: 代码格式化
refactor: 重构积分计算逻辑
test: 添加商品服务单元测试
chore: 更新依赖版本
```

### 分支管理
```
main              # 主分支
├── develop       # 开发分支
│   ├── feature/points-mall-admin      # 管理端功能
│   ├── feature/points-mall-mini       # 小程序端功能
│   └── feature/points-api-enhance     # API 增强
└── hotfix/xxx    # 紧急修复
```

---

## 安全规范

### 认证和授权
```typescript
// ✅ 推荐：所有接口都需要认证
@Controller('points')
@UseGuards(AuthGuard)
export class PointsController {}

// ✅ 推荐：管理接口需要角色验证
@Roles('ADMIN')
async deleteProduct(@Param('id') id: bigint) {}

// ❌ 避免：敏感接口无认证
@Public()
async transferPoints() {}
```

### 输入验证
```typescript
// ✅ 推荐：严格验证
@IsInt()
@Min(1)
points: number;

// ❌ 避免：无验证
points: any;
```

### SQL 注入防护
```typescript
// ✅ 推荐：使用 Prisma 参数化查询
await this.prisma.user.findMany({
  where: { name: { contains: keyword } }
});

// ❌ 避免：字符串拼接
await this.prisma.$queryRaw(
  `SELECT * FROM user WHERE name LIKE '%${keyword}%'`
);
```

---

## 性能规范

### 数据库优化
```typescript
// ✅ 推荐：使用索引
@@index([userId, status])
@@index([createdAt])

// ✅ 推荐：按需查询字段
await this.prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, points: true }
});

// ❌ 避免：N+1 查询
const orders = await this.prisma.pointsOrder.findMany();
for (const order of orders) {
  const user = await this.prisma.user.findUnique(...);
}
```

### 缓存策略
```typescript
// ✅ 推荐：使用缓存
async getProduct(id: bigint) {
  const cacheKey = `points:product:${id}`;
  
  const cached = await this.redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const product = await this.prisma.pointsProduct.findUnique(...);
  
  await this.redis.setex(cacheKey, 3600, JSON.stringify(product));
  return product;
}
```

### 前端优化
```typescript
// ✅ 推荐：防抖搜索
const debouncedSearch = useMemo(
  () => debounce((keyword: string) => {
    setSearchQuery(keyword);
  }, 300),
  []
);

// ✅ 推荐：虚拟滚动长列表
<VirtualList
  data={productList}
  height={600}
  itemHeight={100}
/>
```

---

## 日志规范

### 日志级别
```typescript
// DEBUG - 调试信息
this.logger.debug(`Processing product: ${product.id}`);

// LOG - 一般信息
this.logger.log(`Order created: ${order.id}`);

// WARN - 警告信息
this.logger.warn(`Stock low: product=${product.id}, stock=${stock}`);

// ERROR - 错误信息
this.logger.error(`Order creation failed`, error.stack);
```

### 日志内容
```typescript
// ✅ 推荐：包含关键信息
this.logger.log(
  `Order created: userId=${userId}, productId=${productId}, ` +
  `points=${points}, orderId=${order.id}`
);

// ❌ 避免：信息不完整
this.logger.log('Order created');
```

---

## 部署规范

### 环境变量
```bash
# 数据库
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# JWT
JWT_SECRET=your-secret-key

# 小程序
WECHAT_APP_ID=xxx
WECHAT_APP_SECRET=xxx
```

### Docker 部署
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install --production

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

---

## 文档规范

### API 文档
```markdown
## 创建订单

### 请求
POST /points/orders

### 参数
- productId (bigint, required) - 商品 ID
- quantity (number, required) - 数量
- addressId (bigint, optional) - 地址 ID
- remark (string, optional) - 备注

### 响应
{
  "code": 200,
  "data": {
    "id": "123",
    "orderNo": "ORD-20260311-001",
    "points": 1000
  }
}
```

### 代码注释
```typescript
/**
 * 创建兑换订单
 * @param userId - 用户 ID
 * @param dto - 订单创建数据
 * @returns 创建的订单
 * @throws BadRequestException 库存不足或积分不足
 */
async create(userId: bigint, dto: CreateOrderDto): Promise<PointsOrder> {
  // ...
}
```

---

## 审查清单

### Code Review 检查项
- [ ] 代码符合命名规范
- [ ] TypeScript 类型完整
- [ ] 错误处理完善
- [ ] 日志记录适当
- [ ] 性能考虑充分
- [ ] 安全措施到位
- [ ] 测试覆盖充分
- [ ] 文档完整清晰

---

## 持续改进

### 定期回顾
- 每周代码审查会议
- 每月技术分享
- 每季度规范更新

### 质量指标
- 单元测试覆盖率 > 80%
- Bug 率 < 1%
- 代码审查通过率 > 90%
