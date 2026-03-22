# 开发指南

## 1. 概述

本文档为 OneRecycle 旧物回收平台的开发指南，包含环境搭建、代码规范、开发流程和最佳实践。

## 2. 开发环境搭建

### 2.1 系统要求

- **操作系统**: macOS / Ubuntu / Windows (WSL2)
- **Node.js**: 22.x LTS
- **npm**: 10.x+
- **Docker**: 20.10+
- **Git**: 2.30+
- **pnpm**: 9.x (推荐)

### 2.2 IDE 推荐

- **VS Code** (主推)
  - ESLint, Prettier, Prisma, Docker, GitLens 插件

### 2.3 环境配置

```bash
# 克隆项目
git clone https://github.com/xuanyiying/one-recycle.git
cd one-recycle

# 安装后端依赖
cd server && npm install

# 配置环境变量
cp .env.example .env

# 生成 Prisma 客户端并执行迁移
npx prisma migrate dev

# 导入种子数据
npm run seed
```

### 2.4 启动开发服务

```bash
# 后端 (server/)
npm run start:dev         # http://localhost:3000

# 管理后台 (apps/admin-web/)
npm run dev               # http://localhost:3000

# 小程序 (apps/mini-client/)
npm run dev:weapp         # 微信开发者工具
```

## 3. 项目结构

```
one-recycle/
├── server/                    # NestJS 后端 (单体开发模式)
│   ├── src/
│   │   ├── modules/           # 26 个业务模块
│   │   ├── common/            # 公共模块
│   │   │   ├── decorators/    # 自定义装饰器
│   │   │   ├── filters/       # 异常过滤器
│   │   │   ├── guards/        # 认证/角色守卫
│   │   │   ├── interceptors/  # 响应拦截器
│   │   │   ├── pipes/         # 数据管道
│   │   │   ├── constants/     # 常量定义 (QUEUE_NAMES 等)
│   │   │   └── utils/         # 工具函数
│   │   ├── config/            # 配置模块
│   │   └── prisma/            # Prisma 服务封装
│   ├── prisma/
│   │   ├── schema.prisma      # 55 个数据模型
│   │   ├── migrations/        # 数据库迁移
│   │   └── seed.ts            # 种子数据
│   ├── test/                  # E2E 测试
│   └── scripts/               # 种子脚本 (seed-categories.ts 等)
├── apps/
│   ├── admin-web/             # Next.js 14 管理后台
│   │   ├── src/
│   │   │   ├── app/           # App Router 页面
│   │   │   ├── components/    # React 组件
│   │   │   ├── lib/           # 工具库 (orderStateMachine.ts)
│   │   │   └── services/      # API 服务层
│   │   └── public/
│   └── mini-client/           # Taro 小程序客户端
│       └── src/
│           ├── pages/         # 页面
│           ├── components/    # 组件
│           ├── store/         # Zustand 状态管理
│           ├── services/      # API 服务层
│           └── utils/         # 工具函数
├── deploy/                    # 部署配置
│   ├── config/.env.production # 生产环境变量
│   ├── docker/                # Docker Compose 编排
│   ├── nginx/                 # Nginx 配置
│   ├── k8s/                   # Kubernetes 配置
│   └── scripts/               # 部署脚本
├── docs/                      # 项目文档
├── scripts/                   # 本地工具脚本
├── .github/workflows/         # CI/CD 配置
└── docker-compose.yml         # 本地开发 Docker
```

### 3.1 模块结构

每个业务模块遵循统一结构：

```
module-name/
├── dto/                  # 数据传输对象 (class-validator)
├── interfaces/           # TypeScript 接口定义
├── services/             # 业务逻辑实现
├── *.controller.ts       # REST 控制器
├── *.grpc.controller.ts  # gRPC 控制器 (可选)
└── *.module.ts           # NestJS 模块定义
```

## 4. 代码规范

### 4.1 命名规范

- **类名**: PascalCase (`UserService`, `OrderController`)
- **接口名**: PascalCase (`CreateUserDto`, `OrderStatus`)
- **变量名**: camelCase (`userId`, `orderList`)
- **常量名**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `QUEUE_NAMES`)
- **文件名**: kebab-case (`user.service.ts`, `order.controller.ts`)

### 4.2 NestJS 控制器规范

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }
}
```

所有控制器方法必须 `async` 且显式声明返回类型。

### 4.3 数据库规范

- **主键**: 使用 `BigInt` + `@default(autoincrement())`
- **外键**: 使用 `@map("snake_case")` 映射数据库列名
- **金额**: 统一 `Decimal(10, 2)` 或 `Decimal(12, 2)`
- **时间**: `createdAt` / `updatedAt` 自动管理
- **索引**: 按查询模式建立复合索引

### 4.4 错误处理

使用 NestJS 内置异常 + 全局异常过滤器：
- `NotFoundException` - 资源不存在
- `BadRequestException` - 参数错误
- `UnauthorizedException` - 未授权
- `ForbiddenException` - 无权限

## 5. 测试规范

### 5.1 单元测试

```bash
cd server

npm run test               # 运行所有单元测试
npm run test:cov:unit      # 覆盖率报告 (阈值 >= 90%)
```

### 5.2 E2E 测试

```bash
npm run test:e2e           # 运行 E2E 测试
npm run test:cov:e2e       # E2E 覆盖率报告 (阈值 >= 80%)
npm run test:report        # 生成 Allure 报告
```

## 6. Git 工作流

### 6.1 分支策略

```
prod          # 生产部署分支 (CI/CD 触发)
├── develop   # 开发集成分支
│   ├── feature/xxx
│   └── fix/xxx
└── hotfix/xxx  # 紧急修复
```

### 6.2 提交规范

格式: `type(scope): subject`

类型: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

示例: `feat(order): add batch status update endpoint`

### 6.3 CI/CD

- 推送到 `prod` 分支自动触发部署
- PR 到 `prod` 自动运行 lint + typecheck
- GitHub Actions 配置: `.github/workflows/deploy.yml`

## 7. 常用命令速查

```bash
cd server

# 开发
npm run dev                # 热重载开发
npm run build              # 构建
npm run lint               # ESLint 检查 + 自动修复
npm run typecheck          # TypeScript 类型检查

# 数据库
npx prisma migrate dev     # 创建并应用迁移
npx prisma migrate deploy  # 应用迁移 (生产)
npx prisma studio          # 可视化数据库管理

# 种子数据
npm run seed               # 全量种子
npm run seed:categories    # 分类数据
npm run seed:points-mall   # 积分商城

# 测试
npm run test               # 单元测试
npm run test:e2e           # E2E 测试
```

## 8. 性能优化要点

1. **数据库**: 合理使用 Prisma `select`/`include` 避免 N+1 查询
2. **缓存**: Redis 缓存热点数据，设置合理 TTL
3. **异步**: 耗时操作通过 Bull Queue 异步处理
4. **分页**: 列表查询使用 `skip/take` 分页，限制最大 pageSize
