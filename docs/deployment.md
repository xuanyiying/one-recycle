# 部署文档

## 1. 概述

OneRecycle 使用 Docker Compose 在腾讯云 CVM 服务器上部署，通过 GitHub Actions 实现 CI/CD 自动化。

## 2. 技术栈

| 组件 | 技术 |
|------|------|
| 容器化 | Docker + Docker Compose |
| 编排 (可选) | Kubernetes |
| 数据库 | PostgreSQL 15 |
| 缓存/队列 | Redis 7 + Bull |
| 反向代理 | Nginx |
| CI/CD | GitHub Actions |
| 监控 | Winston 日志 + Sentry |

## 3. 环境配置

### 3.1 开发环境

```bash
# 克隆项目
git clone https://github.com/xuanyiying/one-recycle.git
cd one-recycle

# 启动基础设施 (PostgreSQL + Redis)
docker compose up -d

# 后端
cd server && npm install && cp .env.example .env
npx prisma migrate dev && npm run start:dev
```

### 3.2 生产环境

详见 [DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md)。

## 4. CI/CD

### 4.1 GitHub Actions

工作流文件: `.github/workflows/deploy.yml`

- **触发条件**: 推送到 `prod` 分支
- **流程**: Checkout -> rsync 上传 -> Docker Compose build -> 健康检查
- **部署目标**: 腾讯云 CVM (101.42.31.216)
- **所需 Secrets**: SERVER_HOST, SERVER_USER, SERVER_PORT, SERVER_SSH_KEY

### 4.2 Docker Compose (生产)

配置文件: `deploy/docker/docker-compose.production.yml`

包含服务: PostgreSQL, Redis, Nginx, API Gateway, 7 个微服务, Ollama AI

```bash
cd deploy/docker
docker compose -f docker-compose.production.yml up -d
```

## 5. 备份

```bash
# 数据库备份
docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > backup_$(date +%Y%m%d).sql

# 定时备份 (crontab)
0 2 * * * docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > /opt/backups/backup_$(date +\%Y\%m\%d).sql
```

## 6. 安全

- 环境变量通过 `.env.production` 管理，不硬编码
- SSH 密钥认证，禁用密码登录
- Nginx 配置 HTTPS + 安全头
- 数据库密码使用强随机值

## 7. 故障排查

参考 [DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md) 的故障排查章节。
