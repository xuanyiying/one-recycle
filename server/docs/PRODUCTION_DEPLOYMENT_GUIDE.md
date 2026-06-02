# 🚀 生产环境执行指南

## 📋 目录结构总览

```
one-recycle/
├── .ci/                          # CI 流水线配置（CNB 平台）
│   ├── ci.yml                    # CI 构建/测试流程
│   └── deploy.yml                # 部署流水线（单体/微服务）
│
├── .github/workflows/             # GitHub Actions
│   ├── ci.yml                    # GitHub CI（lint/test/typecheck）
│   └── deploy.yml                # GitHub Actions 部署触发器
│
├── server/
│   ├── scripts/                  # ⭐ 种子数据脚本（核心）
│   │   ├── main.ts               # 主入口，按顺序执行所有种子脚本
│   │   ├── seed-regions.ts       # 行政区划数据
│   │   ├── seed-tenant-staff.ts  # 租户和员工数据
│   │   ├── seed-categories.ts    # 分类数据
│   │   ├── seed-content-config.ts # FAQ 和回收规则
│   │   ├── seed-banners-articles.ts  # ⭐ 新增：Banner + Article
│   │   └── seed-logistics-providers.ts # ⭐ 新增：物流服务商费率
│   │
│   ├── init-database.sh          # ⭐ 本地开发一键初始化脚本
│   ├── Dockerfile                # 生产 Docker 镜像构建
│   └── prisma/
│       └── schema.prisma         # 数据库模型定义
│
└── deploy/                       # 生产部署配置
    ├── docker/
    │   └── docker-compose.production.yml  # Docker Compose 编排
    ├── scripts/
    │   ├── init-db.sh            # ⭐ 生产数据库初始化脚本
    │   └── seed.sql              # 基础种子数据 SQL
    └── k8s/                      # Kubernetes 配置（可选）
```

---

## 🔥 三种生产环境场景

### 场景 1：首次部署（全新环境）

#### ✅ 推荐方式：通过 CI/CD 自动部署

**触发条件：**
- 推送到 `prod` 分支（单体模式）
- 推送到 `withoutai` 分支（微服务模式）
- 打 Tag：`v1.0.0` 或 `v1.0.0-micro`
- 手动触发：GitHub Actions → Deploy → Run workflow

**自动执行流程：**
```yaml
1. Lint & Test (CI)
   ↓ 通过后
2. Build Docker Image
   ↓
3. Push to Registry (docker.cnb.cool)
   ↓
4. SSH 到服务器 → docker compose pull & up
   ↓
5. Health Check（等待服务健康）
   ↓
6. End-to-end Verification
```

**关键配置（GitHub Secrets）：**
| 变量名 | 用途 | 示例 |
|--------|------|------|
| `DEPLOY_HOST` | 服务器 IP | `101.42.31.216` |
| `DEPLOY_USER` | SSH 用户名 | `ubuntu` |
| `DEPLOY_KEY` | SSH 私钥 | `-----BEGIN RSA...` |
| `DOMAIN` | 域名 | `backbuy.cn` |
| `CNB_REGISTRY_TOKEN` | 镜像仓库令牌 | `cnb_xxxx` |
| `JWT_SECRET` | JWT 签名密钥 | 自动生成 |

---

### 场景 2：手动初始化数据库（首次或重置）

#### 方式 A：在服务器上直接执行（推荐⭐）

```bash
# 1. SSH 登录到服务器
ssh ubuntu@101.42.31.216

# 2. 进入项目目录
cd ~/one-recycle/deploy

# 3. 使用现有的 init-db.sh 脚本（已包含基础数据）
./scripts/init-db.sh one-recycle-api-gateway

# 4. 执行新增的 Banner/Article/物流服务商初始化
docker exec one-recycle-api-gateway sh -c '
  npx ts-node --esm scripts/seed-banners-articles.ts && \
  npx ts-node --esm scripts/seed-logistics-providers.ts
'

# 5. 验证数据
docker exec one-recycle-api-gateway sh -c "
  PGPASSWORD=\$DB_PASSWORD psql -h postgres -U postgres -d one_recycle -c \"
    SELECT 'Banners: ' || COUNT(*) FROM banners;
    SELECT 'Articles: ' || COUNT(*) FROM articles;
    SELECT 'Logistics Providers: ' || COUNT(*) FROM logistics_providers;
  \"
"
```

#### 方式 B：通过 Docker Compose 启动时自动初始化

编辑 [deploy/docker/docker-compose.production.yml](file:///Users/yiying/dev-app/one-recycle/deploy/docker/docker-compose.production.yml)：

```yaml
services:
  api-gateway:
    image: ${REGISTRY}/server:${IMAGE_TAG}
    environment:
      - RUN_SEED=1  # ← 添加这行，启动时自动执行种子脚本
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/one_recycle
    depends_on:
      postgres:
        condition: service_healthy
```

**然后重启服务：**
```bash
cd ~/one-recycle/deploy
docker compose --env-file .env.production up -d --force-recreate api-gateway

# 查看日志确认种子数据执行成功
docker logs -f one-recycle-api-gateway | grep -E "(seed|Banner|Article|Logistics)"
```

#### 方式 C：本地开发环境使用 init-database.sh

```bash
# 仅用于本地开发！不要在生产服务器上运行此脚本
cd /Users/yiying/dev-app/one-recycle/server

# 确保本地 PostgreSQL 运行中
brew services start postgresql

# 执行一键初始化
./init-database.sh
```

**⚠️ 注意：** 此脚本会：
- ✅ 生成 Prisma Client
- ✅ 创建数据库表（prisma migrate）
- ✅ 插入所有种子数据（包括新增的 Banner/Article/物流）

---

### 场景 3：更新种子数据（增量更新）

#### 更新 Banner 轮播图

```bash
# 方法1：SSH 到服务器直接执行
ssh ubuntu@101.42.31.216
docker exec one-recycle-api-gateway npx ts-node --esm scripts/seed-banners-articles.ts

# 方法2：通过 API 管理（如果有后台管理功能）
curl -X POST https://backbuy.cn/api/admin/banners \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"新活动","imageUrl":"https://...","sortOrder":1}'
```

#### 更新物流费率

```bash
# 编辑种子脚本中的费率参数
vim server/scripts/seed-logistics-providers.ts

# 提交代码并推送
git add .
git commit -m "chore: update logistics provider rates"
git push origin prod

# CI/CD 会自动重新构建并部署
```

**或手动更新（不重新部署）：**
```bash
ssh ubuntu@101.42.31.216
docker exec one-recycle-api-gateway npx ts-node --esm scripts/seed-logistics-providers.ts
```

---

## 📊 文件执行时机对照表

| 文件路径 | 执行环境 | 执行时机 | 触发方式 |
|---------|----------|----------|----------|
| **`.ci/ci.yml`** | CNB CI 平台 | 每次 Push/PR | 自动 |
| **`.ci/deploy.yml`** | CNB CD 平台 | prod 分支/TAG | 自动 |
| **`.github/workflows/deploy.yml`** | GitHub Actions | prod 分支/TAG/手动 | 自动/手动 |
| **`server/scripts/*.ts`** | Docker 容器内 | 首次启动/RUN_SEED=1 | Docker CMD |
| **`server/init-database.sh`** | 本地开发机 | 开发环境初始化 | 手动执行 |
| **`deploy/scripts/init-db.sh`** | 生产服务器 | 首次部署/数据重置 | SSH 手动 |

---

## 🎯 完整生产部署流程（Step-by-Step）

### 第一次部署全新环境

#### 前置准备（一次性）

```bash
# 1. 在服务器上克隆代码
ssh ubuntu@101.42.31.216
git clone https://github.com/YOUR_ORG/one-recycle.git ~/one-recycle
cd ~/one-recycle

# 2. 创建配置目录和文件
mkdir -p deploy/config deploy/data/{postgres,redis}
cat > deploy/config/.env.production << 'EOF'
# 数据库配置
DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@postgres:5432/one_recycle
DB_PASSWORD=YOUR_STRONG_PASSWORD

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# JWT 密钥（必须生成强密钥）
JWT_SECRET=$(openssl rand -base64 32)

# 域名配置
DOMAIN=backbuy.cn

# 其他必要配置...
EOF

chmod 600 deploy/config/.env.production
```

#### 部署方式选择

##### 选择 A：全自动部署（推荐）✅

```bash
# 在本地推送代码到 prod 分支
git checkout prod
git merge develop  # 合并最新更改
git push origin prod

# GitHub Actions 会自动：
# ✅ 运行测试
# ✅ 构建镜像
# ✅ 推送到 registry
# ✅ SSH 部署到服务器
# ✅ 健康检查
```

**监控部署进度：**
- 访问：`https://github.com/YOUR_ORG/one-recycle/actions`
- 查看 "Deploy" workflow 运行状态

##### 选择 B：半自动部署（需要手动初始化数据库）

```bash
# 1. 先推送代码（同上）
git push origin prod

# 2. 等 CI 通过后，SSH 到服务器
ssh ubuntu@101.42.31.216

# 3. 拉取最新代码并部署
cd ~/one-recycle
git fetch origin
git reset --hard origin/prod

cd deploy
docker compose --env-file .env.production pull
docker compose --env-file .env.production up -d

# 4. 初始化数据库（包含新增的 Banner/Article/物流数据）
./scripts/init-db.sh one-recycle-api-gateway

# 5. 补充执行新种子脚本
docker exec one-recycle-api-gateway sh -c '
  npx ts-node --esm scripts/seed-banners-articles.ts && \
  echo "✅ Banner & Article 数据完成" && \
  npx ts-node --esm scripts/seed-logistics-providers.ts && \
  echo "✅ Logistics Provider 数据完成"
'

# 6. 验证
docker ps | grep one-recycle
curl -f http://localhost:3000/api/health
```

---

## 🔧 故障排查

### 问题 1：种子数据未执行

**症状：** API 返回空数组 `/system/banners`

**诊断步骤：**
```bash
# 检查容器日志
docker logs one-recycle-api-gateway 2>&1 | grep -i "seed\|banner\|article"

# 手动执行种子脚本
docker exec -it one-recycle-api-gateway bash
npx ts-node --esm scripts/seed-banners-articles.ts
exit

# 验证数据库
docker exec one-recycle-api-gateway psql $DATABASE_URL -c "SELECT count(*) FROM banners;"
```

### 问题 2：迁移失败（新表未创建）

**症状：** 错误 `table "banners" does not exist`

**解决方案：**
```bash
# 方式1：让容器自动同步 schema（Dockerfile 中已有此逻辑）
docker restart one-recycle-api-gateway

# 方式2：手动执行 db push
docker exec one-recycle-api-gateway npx prisma db push --accept-data-loss

# 方式3：创建正式 migration（推荐生产环境）
# 在本地生成 migration 文件
cd server
npx prisma migrate dev --name add_banner_article_tables

# 提交到仓库并重新部署
git add prisma/migrations/
git commit -m "add banner and article tables"
git push origin prod
```

### 问题 3：物流价格计算返回错误

**症状：** 价格为 0 或报错

**诊断：**
```bash
# 检查物流服务商数据是否存在
docker exec one-recycle-api-gateway psql $DATABASE_URL -c "
  SELECT name, config->>'basePrice' as base_price, is_active 
  FROM logistics_providers;
"

# 如果没有数据，执行种子脚本
docker exec one-recycle-api-gateway npx ts-node --esm scripts/seed-logistics-providers.ts
```

---

## 📝 最佳实践清单

### ✅ 部署前检查

- [ ] 所有测试通过（`npm run test:cov:unit` ≥90%）
- [ ] 类型检查通过（`npm run typecheck` 无错误）
- [ ] Lint 通过（`npm run lint` 仅 warnings）
- [ ] 新增的种子脚本已在 `main.ts` 中注册
- [ ] Prisma Schema 已更新并生成 Client
- [ ] `.env.production` 已配置所有必要变量

### ✅ 部署后验证

```bash
# 基础健康检查
curl -f https://backbuy.cn/api/health

# 新增功能验证
curl https://backbuy.cn/api/system/banners | jq '.length'     # 应返回 5
curl https://backbuy.cn/api/system/articles | jq '.length'     # 应返回 5
curl https://backbuy.cn/api/system/rankings                   # 应返回用户排名

# 物流价格计算（需要认证）
curl -X POST https://backbuy.cn/api/logistics/freight \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"weight":10,"volume":0.05,"distance":20}' | jq '.'
# 应返回最优报价，cost > 0
```

### ✅ 监控建议

```bash
# 实时查看日志
docker logs -f one-recycle-api-gateway --tail 100

# 监控资源使用
docker stats one-recycle-api-gateway

# 数据库连接数监控
docker exec postgres psql -U postgres -c "
  SELECT count(*), state FROM pg_stat_activity GROUP BY state;
"
```

---

## 🔄 版本更新流程

### 日常更新（仅代码，无 Schema 变更）

```bash
# 1. 合并到 prod 分支
git checkout prod
git merge develop
git push origin prod

# 2. 等待 CI/CD 完成（约 5-10 分钟）

# 3. 验证
curl -f https://backbuy.cn/api/health
```

### Schema 变更更新（新增表/字段）

```bash
# 1. 本地生成 migration
cd server
npx prisma migrate dev --name descriptive_name

# 2. 测试迁移
npm run test:e2e

# 3. 提交
git add prisma/migrations/ prisma/schema.prisma
git commit -m "feat: add new table/field"
git push origin prod

# 4. CI/CD 会自动执行迁移并部署
```

### 种子数据更新

```bash
# 1. 修改对应的 seed-*.ts 文件
vim server/scripts/seed-banners-articles.ts

# 2. 本地测试
npm run seed

# 3. 提交并部署
git add server/scripts/
git commit -m "chore: update seed data"
git push origin prod

# 4. 如果需要立即生效（不等待重新部署），SSH 到服务器手动执行
ssh ubuntu@101.42.31.216
docker exec one-recycle-api-gateway npx ts-node --esm scripts/seed-banners-articles.ts
```

---

## 📞 快速参考卡片

### 常用命令速查

```bash
# ===== 本地开发 =====
cd server
./init-database.sh              # 一键初始化
npm run dev                     # 启动开发服务器
npx prisma studio               # 查看数据库

# ===== 生产部署 =====
git push origin prod            # 触发自动部署
# 或
ssh ubuntu@SERVER              # 手动部署
cd ~/one-recycle/deploy
docker compose --env-file .env.production up -d

# ===== 数据库操作 =====
./deploy/scripts/init-db.sh     # 初始化基础数据
docker exec api-gateway npx ts-node --esm scripts/seed-banners-articles.ts  # 新增数据
docker exec api-gateway npx prisma db push  # 同步表结构

# ===== 故障排查 =====
docker logs -f one-recycle-api-gateway  # 查看日志
docker ps -a | grep one-recycle        # 查看容器状态
curl -f https://DOMAIN/api/health     # 健康检查
```

---

## ✨ 总结

| 环境 | 推荐工具 | 执行方式 |
|------|---------|----------|
| **本地开发** | `init-database.sh` | 手动执行 |
| **CI/CD 自动部署** | `.ci/deploy.yml` 或 GitHub Actions | Push 到 `prod` 分支 |
| **首次手动部署** | `deploy/scripts/init-db.sh` + 种子脚本 | SSH 到服务器 |
| **增量数据更新** | 单独的 `seed-*.ts` 脚本 | Docker exec 执行 |

**核心原则：**
1. ✅ **自动化优先**：尽量通过 CI/CD 部署，减少人工干预
2. ✅ **幂等性设计**：所有种子脚本可安全重复执行（upsert）
3. ✅ **渐进式迁移**：先建表，再插数据，最后验证
4. ✅ **版本化控制**：Schema 变更必须通过 migration 文件管理

现在你可以根据实际场景选择合适的执行方式了！🚀
