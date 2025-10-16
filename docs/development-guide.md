# 开发指南

## 1. 概述

本文档为一键回收平台的开发指南，包含代码规范、开发流程、最佳实践等内容，帮助开发者快速上手项目开发。

## 2. 开发环境搭建

### 2.1 系统要求

- **操作系统**: macOS 10.15+ / Ubuntu 18.04+ / Windows 10+
- **Node.js**: 18.x LTS
- **npm**: 8.x+
- **Docker**: 20.10+
- **Git**: 2.30+

### 2.2 IDE推荐

- **主要IDE**: Visual Studio Code
- **必装插件**:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Prisma
  - Docker
  - GitLens

### 2.3 环境配置

#### 2.3.1 克隆项目

```bash
git clone https://github.com/your-org/one-recycle.git
cd one-recycle
```

#### 2.3.2 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有子项目依赖
npm run install:all
```

#### 2.3.3 环境变量配置

```bash
# 复制环境变量模板
cp .env.example .env.development

# 编辑环境变量
code .env.development
```

#### 2.3.4 启动开发环境

```bash
# 启动基础设施服务
docker-compose -f docker-compose.dev.yml up -d

# 初始化数据库
npm run db:setup

# 启动开发服务器
npm run dev
```

## 3. 项目结构

### 3.1 目录结构

```
one-recycle/
├── apps/                          # 应用程序
│   ├── api-gateway/               # API网关
│   ├── account-service/           # 账户服务
│   ├── order-service/             # 订单服务
│   ├── payment-service/           # 支付服务
│   ├── courier-service/           # 快递员服务
│   ├── category-service/          # 分类服务
│   ├── inventory-service/         # 库存服务
│   ├── notification-service/      # 通知服务
│   ├── dispatch-service/          # 派单服务
│   ├── admin-web/                 # 管理后台
│   └── client-mini/               # 小程序客户端
├── libs/                          # 共享库
│   ├── common/                    # 通用工具
│   ├── database/                  # 数据库相关
│   ├── auth/                      # 认证相关
│   └── types/                     # 类型定义
├── docs/                          # 文档
├── scripts/                       # 脚本文件
├── k8s/                          # Kubernetes配置
├── docker-compose.*.yml          # Docker Compose配置
├── package.json                  # 根package.json
├── tsconfig.json                 # TypeScript配置
├── .eslintrc.js                  # ESLint配置
├── .prettierrc                   # Prettier配置
└── README.md                     # 项目说明
```

### 3.2 微服务结构

每个微服务遵循统一的目录结构：

```
service-name/
├── src/
│   ├── main.ts                   # 应用入口
│   ├── app.module.ts             # 根模块
│   ├── modules/                  # 业务模块
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.module.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   └── ...
│   ├── common/                   # 通用代码
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/                   # 配置文件
│   └── database/                 # 数据库相关
│       ├── migrations/
│       └── seeds/
├── test/                         # 测试文件
├── prisma/                       # Prisma配置
│   ├── schema.prisma
│   └── migrations/
├── Dockerfile                    # Docker配置
├── package.json
└── tsconfig.json
```

## 4. 代码规范

### 4.1 TypeScript规范

#### 4.1.1 基本规则

```typescript
// ✅ 好的示例
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

class UserService {
  async findById(id: number): Promise<User | null> {
    // 实现逻辑
  }
}

// ❌ 不好的示例
interface user {
  ID: number;
  Name: string;
  email_address: string;
}

class userService {
  findById(id: any): any {
    // 实现逻辑
  }
}
```

#### 4.1.2 命名规范

- **类名**: PascalCase (UserService, OrderController)
- **接口名**: PascalCase (User, CreateOrderDto)
- **变量名**: camelCase (userId, orderList)
- **常量名**: UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
- **文件名**: kebab-case (user.service.ts, order.controller.ts)

#### 4.1.3 类型定义

```typescript
// 使用接口定义对象类型
interface CreateUserDto {
  name: string;
  email: string;
  mobile?: string;
}

// 使用联合类型
type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

// 使用泛型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 4.2 NestJS规范

#### 4.2.1 控制器

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: '获取用户信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '成功', type: User })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}
```

#### 4.2.2 服务

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async findById(id: number): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user ${id}`, error.stack);
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      this.logger.error('Failed to create user', error.stack);
      throw new BadRequestException('Failed to create user');
    }
  }
}
```

#### 4.2.3 DTO定义

```typescript
import { IsString, IsEmail, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: '张三' })
  @IsString()
  @Length(2, 50)
  name: string;

  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  @Length(11, 11)
  mobile?: string;
}
```

### 4.3 数据库规范

#### 4.3.1 Prisma Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  email     String   @unique @db.VarChar(255)
  mobile    String?  @db.VarChar(20)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // 关联关系
  orders Order[]
  addresses Address[]

  @@map("users")
}

model Order {
  id               Int         @id @default(autoincrement())
  orderNo          String      @unique @map("order_no") @db.VarChar(50)
  userId           Int         @map("user_id")
  status           OrderStatus @default(PENDING)
  estimatedAmount  Decimal     @map("estimated_amount") @db.Decimal(10, 2)
  settlementAmount Decimal?    @map("settlement_amount") @db.Decimal(10, 2)
  createdAt        DateTime    @default(now()) @map("created_at")
  updatedAt        DateTime    @updatedAt @map("updated_at")

  // 关联关系
  user  User        @relation(fields: [userId], references: [id])
  items OrderItem[]

  @@map("orders")
}

enum OrderStatus {
  PENDING
  ASSIGNED
  ACCEPTED
  PROCESSING
  COMPLETED
  CANCELLED
}
```

#### 4.3.2 数据库迁移

```typescript
// 创建迁移
npm run db:migrate:dev --name add_user_table

// 应用迁移
npm run db:migrate:deploy

// 重置数据库
npm run db:reset
```

### 4.4 错误处理

#### 4.4.1 异常处理

```typescript
// 自定义异常
export class UserNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`User with ID ${id} not found`);
  }
}

// 全局异常过滤器
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    const errorResponse = {
      success: false,
      error: {
        code: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(errorResponse);
  }
}
```

#### 4.4.2 业务异常

```typescript
// 业务异常基类
export abstract class BusinessException extends HttpException {
  constructor(message: string, code: string, status: HttpStatus) {
    super({ message, code }, status);
  }
}

// 具体业务异常
export class InsufficientBalanceException extends BusinessException {
  constructor() {
    super('余额不足', 'INSUFFICIENT_BALANCE', HttpStatus.BAD_REQUEST);
  }
}

export class OrderNotCancellableException extends BusinessException {
  constructor(status: string) {
    super(
      `订单状态为${status}，无法取消`,
      'ORDER_NOT_CANCELLABLE',
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

## 5. 测试规范

### 5.1 单元测试

#### 5.1.1 测试结构

```typescript
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 1;
      const expectedUser = {
        id: userId,
        name: '张三',
        email: 'zhangsan@example.com',
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(expectedUser);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 999;
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

#### 5.1.2 测试覆盖率

```bash
# 运行测试并生成覆盖率报告
npm run test:cov

# 覆盖率要求
# - 语句覆盖率: >= 80%
# - 分支覆盖率: >= 75%
# - 函数覆盖率: >= 80%
# - 行覆盖率: >= 80%
```

### 5.2 集成测试

```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  beforeEach(async () => {
    // 清理测试数据
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      const createUserDto = {
        name: '张三',
        email: 'zhangsan@example.com',
        mobile: '13800138000',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe(createUserDto.name);
          expect(res.body.email).toBe(createUserDto.email);
          expect(res.body.id).toBeDefined();
        });
    });
  });
});
```

## 6. Git工作流

### 6.1 分支策略

```
main (生产环境)
├── develop (开发环境)
│   ├── feature/user-management
│   ├── feature/order-system
│   └── feature/payment-integration
├── release/v1.0.0 (预发布)
└── hotfix/critical-bug-fix (紧急修复)
```

### 6.2 提交规范

#### 6.2.1 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type)**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例**:
```
feat(user): add user registration functionality

- Add user registration API endpoint
- Implement email verification
- Add input validation for user data

Closes #123
```

#### 6.2.2 提交前检查

```bash
# 安装husky和lint-staged
npm install --save-dev husky lint-staged

# 配置pre-commit钩子
npx husky add .husky/pre-commit "npx lint-staged"
```

**package.json配置**:
```json
{
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 6.3 代码审查

#### 6.3.1 Pull Request模板

```markdown
## 变更描述
简要描述本次变更的内容和目的。

## 变更类型
- [ ] Bug修复
- [ ] 新功能
- [ ] 代码重构
- [ ] 文档更新
- [ ] 其他

## 测试
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 手动测试已完成

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加必要的测试
- [ ] 文档已更新
- [ ] 无安全风险

## 相关Issue
Closes #123
```

#### 6.3.2 审查要点

1. **代码质量**
   - 代码可读性
   - 性能考虑
   - 安全性检查

2. **架构设计**
   - 设计模式使用
   - 模块划分
   - 接口设计

3. **测试覆盖**
   - 测试完整性
   - 边界条件
   - 异常处理

## 7. 性能优化

### 7.1 数据库优化

#### 7.1.1 查询优化

```typescript
// ✅ 好的示例 - 使用索引和选择性查询
async findUserOrders(userId: number, status?: OrderStatus) {
  return this.prisma.order.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    select: {
      id: true,
      orderNo: true,
      status: true,
      estimatedAmount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });
}

// ❌ 不好的示例 - 查询所有字段
async findUserOrders(userId: number) {
  const orders = await this.prisma.order.findMany({
    where: { userId },
    include: {
      user: true,
      items: {
        include: {
          category: true,
        },
      },
    },
  });
  return orders;
}
```

#### 7.1.2 连接池配置

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 连接池配置
DATABASE_URL="postgresql://user:password@localhost:5432/db?connection_limit=20&pool_timeout=20"
```

### 7.2 缓存策略

#### 7.2.1 Redis缓存

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: Redis,
  ) {}

  async findById(id: number): Promise<User | null> {
    // 尝试从缓存获取
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // 从数据库查询
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      // 缓存结果，过期时间1小时
      await this.redis.setex(cacheKey, 3600, JSON.stringify(user));
    }

    return user;
  }
}
```

#### 7.2.2 内存缓存

```typescript
import { LRUCache } from 'lru-cache';

@Injectable()
export class CategoryService {
  private cache = new LRUCache<string, Category[]>({
    max: 100,
    ttl: 1000 * 60 * 10, // 10分钟
  });

  async findAll(): Promise<Category[]> {
    const cacheKey = 'categories:all';
    let categories = this.cache.get(cacheKey);

    if (!categories) {
      categories = await this.prisma.category.findMany({
        where: { enabled: true },
        orderBy: { sort: 'asc' },
      });
      this.cache.set(cacheKey, categories);
    }

    return categories;
  }
}
```

### 7.3 API优化

#### 7.3.1 分页查询

```typescript
interface PaginationDto {
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async findWithPagination(
  dto: PaginationDto,
): Promise<PaginatedResult<Order>> {
  const page = dto.page || 1;
  const limit = Math.min(dto.limit || 10, 100); // 最大100条
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.order.count(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

#### 7.3.2 批量操作

```typescript
// 批量创建
async createMany(orders: CreateOrderDto[]): Promise<void> {
  await this.prisma.order.createMany({
    data: orders,
    skipDuplicates: true,
  });
}

// 批量更新
async updateStatus(ids: number[], status: OrderStatus): Promise<void> {
  await this.prisma.order.updateMany({
    where: {
      id: { in: ids },
    },
    data: { status },
  });
}
```

## 8. 安全最佳实践

### 8.1 输入验证

```typescript
// 使用class-validator进行验证
export class CreateOrderDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

// 自定义验证器
@ValidatorConstraint({ name: 'isMobilePhone', async: false })
export class IsMobilePhoneConstraint implements ValidatorConstraintInterface {
  validate(mobile: string): boolean {
    return /^1[3-9]\d{9}$/.test(mobile);
  }

  defaultMessage(): string {
    return '手机号格式不正确';
  }
}

export function IsMobilePhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMobilePhoneConstraint,
    });
  };
}
```

### 8.2 认证授权

```typescript
// JWT策略
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

// 角色守卫
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### 8.3 数据脱敏

```typescript
// 响应拦截器
@Injectable()
export class SensitiveDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.maskSensitiveData(data)),
    );
  }

  private maskSensitiveData(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.maskSensitiveData(item));
    }

    if (data && typeof data === 'object') {
      const masked = { ...data };
      
      // 脱敏手机号
      if (masked.mobile) {
        masked.mobile = masked.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      }

      // 脱敏身份证号
      if (masked.idCard) {
        masked.idCard = masked.idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
      }

      return masked;
    }

    return data;
  }
}
```

## 9. 监控和日志

### 9.1 日志配置

```typescript
// 日志配置
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context}] ${level}: ${message}${
            trace ? `\n${trace}` : ''
          }`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

### 9.2 性能监控

```typescript
// 性能监控拦截器
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(`${method} ${url} - ${duration}ms`);

        // 记录慢查询
        if (duration > 1000) {
          this.logger.warn(`Slow request: ${method} ${url} - ${duration}ms`);
        }
      }),
    );
  }
}
```

## 10. 部署和运维

### 10.1 Docker配置

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# 复制依赖和代码
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs . .

# 生成Prisma客户端
RUN npx prisma generate

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
```

### 10.2 健康检查

```typescript
// 健康检查控制器
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: Redis,
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const status = checks.every(
      (check) => check.status === 'fulfilled' && check.value,
    ) ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0].status === 'fulfilled' ? checks[0].value : false,
        redis: checks[1].status === 'fulfilled' ? checks[1].value : false,
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}
```

## 11. 故障排查

### 11.1 常见问题

1. **数据库连接问题**
```bash
# 检查数据库连接
npx prisma db pull

# 重置数据库
npx prisma migrate reset
```

2. **依赖冲突**
```bash
# 清理依赖
rm -rf node_modules package-lock.json
npm install
```

3. **端口占用**
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 11.2 调试技巧

```typescript
// 使用调试器
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async findById(id: number): Promise<User | null> {
    this.logger.debug(`Finding user with ID: ${id}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    this.logger.debug(`Found user: ${JSON.stringify(user)}`);
    return user;
  }
}
```

## 12. 最佳实践总结

### 12.1 代码质量

1. **保持代码简洁**: 函数职责单一，避免过长的函数
2. **使用TypeScript**: 充分利用类型系统，避免any类型
3. **编写测试**: 保持高测试覆盖率，TDD开发
4. **代码审查**: 所有代码都需要经过审查

### 12.2 性能优化

1. **数据库优化**: 合理使用索引，避免N+1查询
2. **缓存策略**: 合理使用缓存，注意缓存一致性
3. **异步处理**: 使用队列处理耗时任务
4. **资源管理**: 及时释放资源，避免内存泄漏

### 12.3 安全考虑

1. **输入验证**: 严格验证所有输入数据
2. **权限控制**: 实现细粒度的权限控制
3. **数据脱敏**: 敏感数据不能明文传输和存储
4. **安全更新**: 及时更新依赖包，修复安全漏洞

### 12.4 运维监控

1. **日志记录**: 记录关键操作和错误信息
2. **性能监控**: 监控应用性能和资源使用
3. **告警机制**: 设置合理的告警阈值
4. **备份恢复**: 定期备份数据，测试恢复流程