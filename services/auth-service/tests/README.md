# API 测试套件

本目录包含了 One Recycle API 服务的完整测试套件，包括单元测试和集成测试。

## 测试结构

```
tests/
├── README.md                    # 测试文档
├── setup.ts                     # 全局测试设置
├── test-utils.ts               # 测试工具函数
├── simple.test.ts              # 简单验证测试
├── auth/                       # 认证模块测试
│   ├── auth.service.spec.ts    # AuthService 单元测试
│   └── auth.controller.spec.ts # AuthController 单元测试
├── user/                       # 用户模块测试
│   ├── user.service.spec.ts    # UserService 单元测试
│   └── user.controller.spec.ts # UserController 单元测试
└── integration/                # 集成测试
    ├── auth.e2e-spec.ts        # 认证 API 集成测试
    └── user.e2e-spec.ts        # 用户 API 集成测试
```

## 测试配置

### 环境配置
- **开发环境**: `.env`
- **测试环境**: `.env.test`

测试环境使用 PostgreSQL 测试数据库：`postgresql://user:password@localhost:5432/account_db_test`

### Jest 配置
- **配置文件**: `jest.config.js`
- **测试超时**: 30秒
- **覆盖率收集**: 启用
- **模块映射**: 支持 `@/` 和 `@tests/` 路径别名

## 测试类型

### 1. 单元测试

#### AuthService 测试 (`auth/auth.service.spec.ts`)
- ✅ 用户登录功能
- ✅ 发送验证码功能
- ✅ 刷新令牌功能
- ✅ 用户登出功能
- ✅ 第三方登录功能
- ✅ 手机号验证
- ✅ 令牌生成

#### AuthController 测试 (`auth/auth.controller.spec.ts`)
- ✅ 登录端点
- ✅ 发送验证码端点
- ✅ 刷新令牌端点
- ✅ 登出端点
- ✅ 第三方登录端点（微信、支付宝、抖音、快手）

#### UserService 测试 (`user/user.service.spec.ts`)
- ✅ 根据ID查找用户
- ✅ 根据手机号查找用户
- ✅ 创建用户
- ✅ 更新用户信息
- ✅ 删除用户
- ✅ 更新用户状态
- ✅ 地址管理（添加、更新、删除）

#### UserController 测试 (`user/user.controller.spec.ts`)
- ✅ 获取用户资料
- ✅ 更新用户资料
- ✅ 删除账户
- ✅ 更新用户状态
- ✅ 地址管理端点

### 2. 集成测试

#### 认证 API 测试 (`integration/auth.e2e-spec.ts`)
- ✅ POST /auth/send-code - 发送验证码
- ✅ POST /auth/login - 用户登录
- ✅ POST /auth/refresh - 刷新令牌
- ✅ POST /auth/logout - 用户登出
- ✅ POST /auth/third-party/wechat - 微信登录
- ✅ POST /auth/third-party/alipay - 支付宝登录
- ✅ POST /auth/third-party/douyin - 抖音登录
- ✅ POST /auth/third-party/kuaishou - 快手登录
- ✅ 频率限制测试

#### 用户 API 测试 (`integration/user.e2e-spec.ts`)
- ✅ GET /user/profile - 获取用户资料
- ✅ PUT /user/profile - 更新用户资料
- ✅ PUT /user/status - 更新用户状态
- ✅ DELETE /user/account - 删除账户
- ✅ POST /user/addresses - 添加地址
- ✅ PUT /user/addresses/:id - 更新地址
- ✅ DELETE /user/addresses/:id - 删除地址
- ✅ 权限验证测试
- ✅ 安全性测试

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
npx jest tests/auth/auth.service.spec.ts
```

### 运行测试并生成覆盖率报告
```bash
npm run test:cov
```

### 运行集成测试
```bash
npx jest tests/integration
```

### 运行单元测试
```bash
npx jest tests/auth tests/user --testPathIgnorePatterns=integration
```

## 测试工具

### test-utils.ts
提供了以下测试工具函数：
- `createTestApp()` - 创建测试应用实例
- `mockPrismaService()` - 模拟 Prisma 服务
- `createTestUser()` - 创建测试用户数据
- `createTestJwtPayload()` - 创建测试 JWT 载荷
- `mockSmsService()` - 模拟短信服务
- `mockRedisService()` - 模拟 Redis 服务
- `cleanupTestDatabase()` - 清理测试数据库

## 测试数据

测试使用模拟数据，不会影响生产数据库。每个测试都会：
1. 在测试前设置必要的模拟数据
2. 在测试后清理所有数据
3. 使用独立的测试数据库

## 覆盖率目标

- **行覆盖率**: > 80%
- **函数覆盖率**: > 80%
- **分支覆盖率**: > 70%
- **语句覆盖率**: > 80%

## 注意事项

1. **数据库连接**: 确保 PostgreSQL 服务正在运行
2. **环境变量**: 确保 `.env.test` 文件配置正确
3. **依赖服务**: 测试使用模拟服务，不需要真实的外部服务
4. **并发测试**: 测试设计为可以并发运行
5. **资源清理**: 每个测试后都会自动清理资源

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 PostgreSQL 是否运行
   - 验证 `.env.test` 中的数据库配置

2. **测试超时**
   - 检查网络连接
   - 增加测试超时时间

3. **模块导入错误**
   - 检查路径别名配置
   - 验证 TypeScript 配置

### 调试测试
```bash
# 运行单个测试并显示详细输出
npx jest tests/auth/auth.service.spec.ts --verbose

# 运行测试并显示覆盖率
npx jest --coverage

# 运行测试并监听文件变化
npx jest --watch
```