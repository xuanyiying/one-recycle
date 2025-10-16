# 故障排查指南

## TypeScript 模块找不到错误

如果您看到类似以下的错误：
```
Cannot find module '../prisma.service' or its corresponding type declarations.
Cannot find module '../queue/queue.module' or its corresponding type declarations.
```

### 解决方案

#### 1. 重启 TypeScript 服务器（最简单）

**在 VSCode 中：**
1. 按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
2. 输入 "TypeScript: Restart TS Server"
3. 选择并执行

**在其他 IDE 中：**
- 关闭并重新打开项目
- 或重启 IDE

#### 2. 安装依赖

确保所有依赖都已安装：

```bash
cd services/message-queue
npm install
```

#### 3. 生成 Prisma Client

运行以下命令生成 Prisma Client：

```bash
npm run prisma:generate
```

这将生成 `@prisma/client` 包，解决 `PrismaClient` 导入错误。

#### 4. 清理并重新构建

```bash
# 删除 node_modules 和 dist
rm -rf node_modules dist

# 重新安装
npm install

# 生成 Prisma Client
npm run prisma:generate

# 构建项目
npm run build
```

#### 5. 检查 tsconfig.json

确保 `tsconfig.json` 配置正确：

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

## 常见问题

### Q: Prisma Client 类型错误

**错误信息：**
```
Property 'jobStatus' does not exist on type 'PrismaService'
```

**解决方案：**
1. 确保已运行 `npm run prisma:generate`
2. 重启 TypeScript 服务器
3. 如果还有问题，运行 `npm run prisma:migrate` 创建数据库表

### Q: 模块解析错误

**错误信息：**
```
Cannot find module '../queue/queue.constants'
```

**解决方案：**
1. 检查文件是否存在
2. 检查导入路径是否正确
3. 重启 TypeScript 服务器

### Q: Bull Queue 类型错误

**错误信息：**
```
Cannot find module '@nestjs/bull'
```

**解决方案：**
```bash
npm install @nestjs/bull bull @types/bull
```

## 开发环境设置检查清单

在开始开发之前，确保完成以下步骤：

- [ ] Node.js 18+ 已安装
- [ ] Docker 和 Docker Compose 已安装
- [ ] 已运行 `npm install`
- [ ] 已配置 `.env` 文件
- [ ] 已启动 Redis: `docker-compose up -d redis`
- [ ] 已启动 PostgreSQL: `docker-compose up -d postgres`
- [ ] 已运行 `npm run prisma:generate`
- [ ] 已运行 `npm run prisma:migrate`
- [ ] TypeScript 服务器已重启

## 验证安装

运行以下命令验证一切正常：

```bash
# 检查 TypeScript 编译
npm run build

# 如果构建成功，启动服务
npm run start:dev
```

如果服务成功启动，您应该看到：
```
🚀 Message Queue Service is running on port 3010
🌍 Environment: development
📊 Bull Board: http://localhost:3010/admin/queues
```

## 获取更多帮助

如果以上方法都无法解决问题：

1. 查看 [QUICKSTART.md](./QUICKSTART.md)
2. 查看 [README.md](./README.md)
3. 检查 GitHub Issues
4. 联系开发团队

---

**提示**: 大多数 TypeScript 模块解析问题都可以通过重启 TypeScript 服务器解决。