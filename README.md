# One Recycle - 微服务架构平台

One Recycle 是一个基于微服务架构的回收平台，包含账户、订单、支付、调度等多个服务。项目采用混合架构模式，在开发/测试环境使用单体应用提高开发效率，在生产环境使用微服务架构确保系统的可扩展性和稳定性。

## 项目结构

```
.
├── apps/                  # 前端应用
│   ├── admin-web/         # 管理后台
│   └── client-mini/       # 小程序客户端
├── server/                # 开发/测试环境单体应用
│   ├── src/               # 源代码
│   │   ├── access-control/ # 权限控制模块
│   │   ├── common/        # 公共模块
│   │   ├── conditional/   # 条件加载模块
│   │   ├── database/      # 数据库模块
│   │   ├── modules/       # 业务模块
│   │   ├── user/          # 用户模块
│   │   └── utils/         # 工具模块
│   └── prisma/            # Prisma数据库客户端
├── services/              # 生产环境微服务
│   ├── account-service/   # 账户服务
│   ├── auth-service/      # 认证服务
│   ├── category-service/  # 分类服务
│   ├── courier-service/   # 快递员服务
│   ├── dispatch-service/  # 调度服务
│   ├── inventory-service/ # 库存服务
│   ├── message-queue/     # 消息队列
│   ├── notification-service/ # 通知服务
│   ├── order-service/     # 订单服务
│   ├── payment-service/   # 支付服务
│   ├── shared/            # 共享模块
│   └── monolith/          # 开发阶段单体应用
└── docs/                  # 文档
```

## 技术栈

### 后端技术栈
- **核心框架**: NestJS
- **数据库**: PostgreSQL (Prisma ORM), MongoDB (Mongoose), MySQL (TypeORM)
- **缓存**: Redis
- **消息队列**: Kafka, Bull (Redis-based)
- **认证授权**: JWT, Passport.js
- **权限控制**: CASL (Conditional Access System Language)
- **任务调度**: @nestjs/schedule (cron)
- **日志管理**: Winston
- **配置管理**: @nestjs/config (dotenv)
- **API文档**: Swagger
- **测试框架**: Jest
- **构建工具**: Rollup, SWC

### 前端技术栈
- **管理后台**: Next.js, Ant Design, TypeScript
- **小程序客户端**: Taro, React, TypeScript

## 架构设计

### 混合架构模式
本项目采用混合架构模式：
1. **开发/测试环境**: 使用单体应用架构，提高开发效率，简化调试流程
2. **生产环境**: 使用微服务架构，确保系统的可扩展性和稳定性

详细架构设计请参考：
- [单体应用与微服务架构设计文档](MONO-ARCH-DESIGN.md)
- [迁移指南](MIGRATION-GUIDE.md)

## 核心模块说明

### 1. 权限控制模块 (access-control)
负责系统的认证、授权和权限管理功能。

- **auth**: 用户认证，包括登录、注册、JWT令牌生成
- **role**: 角色管理，定义用户角色及其权限
- **permission**: 权限管理，定义系统权限点
- **policy**: 基于CASL的策略管理，实现细粒度权限控制
- **menu**: 菜单管理，根据用户权限动态生成菜单

```typescript
// 示例：使用策略守卫进行权限控制
@UseGuards(PolicyGuard)
@CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User))
@Put(':id')
update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  return this.userService.update(+id, updateUserDto);
}
```

### 2. 数据库模块 (database)
支持多种数据库的统一访问接口。

- **prisma**: PostgreSQL数据库访问
- **typeorm**: MySQL数据库访问
- **mongoose**: MongoDB数据库访问

```typescript
// 示例：在服务中使用Prisma客户端
@Injectable()
export class UserService {
  constructor(@Inject(PRISMA_DATABASE) private prismaClient: PrismaClient) {}

  async create(createUserDto: CreateUserDto) {
    return this.prismaClient.user.create({
      data: createUserDto,
    });
  }
}
```

### 3. 条件加载模块 (conditional)
根据环境变量动态加载可选功能模块。

- **mail**: 邮件发送功能
- **queue**: 消息队列处理
- **storage**: 文件存储服务
- **cron**: 定时任务调度

```typescript
// 示例：条件加载邮件模块
static register(): DynamicModule {
  const parsedConfig = getEnvs();
  if (toBoolean(parsedConfig['MAIL_ON'])) {
    imports.push(MailModule);
  }
  // ...
}
```

### 4. 业务模块 (modules)
包含系统的核心业务功能。

- **comment**: 评论管理，支持嵌套评论
- **course**: 课程管理
- **content**: 内容管理
- **attachment**: 附件管理
- **dict**: 字典管理
- **transaction**: 事务处理
- **study**: 学习记录管理

```typescript
// 示例：评论服务中的嵌套评论查询
async fetchAllNestedComments(commentId: number): Promise<any> {
  const comment = await this.prismaClient.comment.findUnique({
    where: { id: commentId },
    include: { children: true },
  });

  if (comment && comment.children) {
    // 递归查询所有子评论的嵌套子评论
    const childrenWithNested = await Promise.all(
      comment.children.map((child) => this.fetchAllNestedComments(child.id)),
    );
    comment.children = childrenWithNested;
  }
  return comment;
}
```

### 5. 公共模块 (common)
提供系统级的公共功能。

- **cache**: 缓存管理 (Redis)
- **config**: 配置管理
- **cron**: 定时任务
- **filters**: 异常过滤器
- **guards**: 守卫
- **interceptors**: 拦截器
- **kafka**: Kafka消息处理
- **logger**: 日志管理
- **pipes**: 管道

### 6. 用户模块 (user)
用户管理核心模块。

- 用户注册、登录、信息管理
- 多数据库支持 (Prisma, TypeORM, Mongoose)
- 用户权限关联

## 消息队列与异步处理

### Kafka 消息处理
系统使用 Kafka 作为主要的消息队列系统，用于服务间异步通信和事件驱动架构。

```typescript
// 示例：Kafka 生产者
export class KafkaProducer implements IProducer {
  async produce(message: Message) {
    await this.producer.send({ topic: this.topic, messages: [message] });
    this.logger.log(`Message Published Successfully ${message.value}`);
  }
}
```

### Bull 队列处理
使用 Bull 队列处理后台任务，如邮件发送、定时任务等。

```typescript
// 示例：注册 Bull 队列
BullModule.registerQueue(
  { name: 'scheduled-tasks' },
  // 其他队列...
),
```

## 微服务架构说明

### 服务间通信
生产环境中的微服务通过以下方式进行通信：
- **gRPC**: 用于高性能的内部服务间通信
- **REST API**: 用于外部系统集成
- **消息队列**: 用于异步处理和解耦服务

### 服务发现与负载均衡
- 使用API网关进行服务路由和负载均衡
- 通过环境变量配置服务地址

### 数据管理
- 每个服务拥有独立的数据库
- 通过事件驱动架构实现数据一致性
- 使用分布式事务处理跨服务操作

## 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker (可选，用于生产部署)

## 快速开始

### 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者单独安装各服务依赖
npm run install:services
```

### 开发模式

#### 微服务模式（生产环境架构）

```bash
# 启动所有服务
npm run start:dev

# 单独启动某个服务
npm run start:auth  # 启动认证服务
npm run start:order # 启动订单服务
```

#### 单体应用模式（开发/测试环境架构）

```bash
# 安装单体应用依赖
npm run monolith:install

# 启动单体应用
npm run monolith:start
```

### 构建

```bash
# 构建所有服务
npm run build:all

# 构建单体应用
npm run monolith:build
```

## 服务说明

### 核心服务

- **account-service**: 用户账户管理
- **auth-service**: 身份认证和授权
- **category-service**: 商品分类管理
- **courier-service**: 快递员管理
- **dispatch-service**: 订单调度
- **inventory-service**: 库存管理
- **message-queue**: 消息队列
- **notification-service**: 通知服务
- **order-service**: 订单管理
- **payment-service**: 支付处理

### 共享模块

- **shared**: 跨服务共享的工具类、类型定义等

### 前端应用

- **admin-web**: 管理后台，基于 Next.js
- **client-mini**: 小程序客户端，基于 Taro

## 配置管理

各服务通过环境变量进行配置，开发环境可以使用 `.env` 文件。

## 测试

```bash
# 运行所有服务的测试
npm run test:all

# 运行特定服务的测试
npm run test:auth
```

## 部署

### 开发/测试环境

使用单体应用模式部署，简化配置和管理。

### 生产环境

使用 Docker Compose 或 Kubernetes 部署微服务架构。

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT