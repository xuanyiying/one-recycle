# OneRecycle 部署指南

## 域名: backbuy.cn

## 目录

1. [部署方式](#部署方式)
2. [GitHub Actions 自动部署（推荐）](#github-actions-自动部署)
3. [Docker Compose 手动部署](#docker-compose-手动部署)
4. [运维管理](#运维管理)
5. [故障排查](#故障排查)

## 部署方式

| 方式 | 适用场景 | 文档 |
|------|----------|------|
| GitHub Actions | 推送 prod 分支自动部署 | [deploy-guide](docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md) |
| Docker Compose | 手动在服务器上部署 | [K8S-DEPLOY](deploy/docs/K8S-DEPLOY.md) |
| 一键脚本 | 快速本地部署 | [deploy/README.md](deploy/README.md) |

## GitHub Actions 自动部署

### 工作流

```
Push to prod -> rsync 上传代码 -> Docker Compose build -> 健康检查
```

### 配置步骤

#### 1. 服务器准备

确保腾讯云 CVM 服务器已安装 Docker 和 Docker Compose：

```bash
ssh root@101.42.31.216

# 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl start docker && systemctl enable docker

# 安装 Docker Compose 插件
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

#### 2. 配置 GitHub Secrets

在 GitHub 仓库 > Settings > Secrets and variables > Actions 中添加：

| Secret | 值 | 说明 |
|--------|-----|------|
| `SERVER_HOST` | `101.42.31.216` | 服务器公网 IP |
| `SERVER_USER` | `root` | SSH 用户名 |
| `SERVER_PORT` | `22` | SSH 端口 |
| `SERVER_SSH_KEY` | SSH 私钥完整内容 | GitHub Actions 用于连接服务器 |

#### 3. 生成 SSH 密钥

在服务器上执行：

```bash
ssh root@101.42.31.216

ssh-keygen -t ed25519 -C "github-actions" -f /tmp/deploy_key -N ""
cat /tmp/deploy_key          # 复制私钥到 SERVER_SSH_KEY
cat /tmp/deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
rm -f /tmp/deploy_key /tmp/deploy_key.pub
```

#### 4. 触发部署

```bash
git checkout prod
git push origin prod
```

在 https://github.com/xuanyiying/one-recycle/actions 查看部署进度。

## Docker Compose 手动部署

### 环境变量配置

```bash
ssh root@101.42.31.216
cd /opt/one-recycle/deploy/config
cp .env.production .env.production.local
nano .env.production.local
```

### 启动服务

```bash
cd /opt/one-recycle/deploy/docker
docker compose -f docker-compose.production.yml up -d
```

### 运维命令

| 操作 | 命令 |
|------|------|
| 查看服务状态 | `docker compose -f docker-compose.production.yml ps` |
| 查看日志 | `docker compose -f docker-compose.production.yml logs -f <service>` |
| 重启服务 | `docker compose -f docker-compose.production.yml restart` |
| 重新构建 | `docker compose -f docker-compose.production.yml build --parallel` |
| 健康检查 | `curl http://localhost:3002/health` |
| 备份数据库 | `docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > backup.sql` |

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| nginx | 80, 443 | 反向代理 |
| api-gateway | 3002 | API 网关 |
| account-service | 3001 | 账户服务 |
| order-service | 3003 | 订单服务 |
| notification-service | 3004 | 通知服务 |
| inventory-service | 3009 | 库存服务 |
| category-service | 3008 | 分类服务 |
| message-queue | 3010 | 队列处理 |
| postgres | 5432 | PostgreSQL |
| redis | 6379 | Redis |

## 故障排查

### 服务无法启动

```bash
docker compose -f docker-compose.production.yml logs
docker compose -f docker-compose.production.yml ps
df -h    # 检查磁盘
free -h  # 检查内存
```

### 502 Bad Gateway

```bash
docker exec one-recycle-nginx nginx -t
curl http://localhost:3002/health
```

### 数据库连接失败

```bash
docker exec one-recycle-postgres pg_isready -U one_recycle
docker compose -f docker-compose.production.yml logs postgres
```

## 相关文档

- [GitHub Actions 配置指南](docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md)
- [部署检查清单](docs/GITHUB_ACTIONS_CHECKLIST.md)
- [部署快速参考](docs/DEPLOYMENT_QUICK_REFERENCE.md)
- [部署详情](deploy/docs/DEPLOY.md)
- [K8S 部署](deploy/docs/K8S-DEPLOY.md)
