# OneRecycle 腾讯云部署指南

## 域名: backbuy.cn

---

## 目录
1. [部署方式总览](#部署方式总览)
2. [快速开始](#快速开始)
3. [详细部署步骤](#详细部署步骤)
4. [GitHub Actions CI/CD](#github-actions-cicd)
5. [运维管理](#运维管理)
6. [故障排查](#故障排查)

---

## 部署方式总览

本项目提供 **三种部署方式**，根据你的需求选择最适合的方式：

| 部署方式 | 适用场景 | 复杂度 | 推荐度 |
|----------|----------|--------|--------|
| **方式一: 本地一键部署脚本** | 快速部署、开发测试 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **方式二: GitHub Actions 自动部署** | 团队协作、生产环境 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **方式三: 手动部署** | 学习调试、问题排查 | ⭐⭐⭐⭐ | ⭐⭐⭐ |

### 方式对比

```
┌─────────────────────────────────────────────────────────────────┐
│                     部署方式选择流程图                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                                               │
│  │ 需要快速部署? │                                               │
│  └──────┬───────┘                                               │
│         │                                                       │
│    是 ──┼──> ┌────────────────────┐                            │
│         │    │ 方式一: 一键部署脚本 │                            │
│         │    │ ./scripts/deploy   │                            │
│         │    └────────────────────┘                            │
│         │ 否                                                    │
│         ▼                                                       │
│  ┌──────────────┐                                               │
│  │ 团队协作开发? │                                               │
│  └──────┬───────┘                                               │
│         │                                                       │
│    是 ──┼──> ┌────────────────────┐                            │
│         │    │ 方式二: GitHub Actions│                            │
│         │    │ 自动 CI/CD 部署    │                            │
│         │    └────────────────────┘                            │
│         │ 否                                                    │
│         ▼                                                       │
│  ┌────────────────────┐                                        │
│  │ 方式三: 手动部署    │                                        │
│  │ 适合学习调试        │                                        │
│  └────────────────────┘                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 前置条件

1. **腾讯云服务器**（推荐 4核8G，Ubuntu 22.04 LTS）
2. **域名**（backbuy.cn）
3. **本地开发环境**（Node.js 22+）
4. **SSH 访问权限**（服务器 root 或 ubuntu 用户）

### 最快部署方式（一键脚本）

```bash
# 1. 克隆代码
git clone <your-repo-url>
cd one-recycle

# 2. 安装依赖
cd server && npm install && cd ..

# 3. 执行一键部署（替换为你的服务器IP）
./scripts/deploy-to-tencent.sh -i 123.456.789.0

# 4. 根据提示完成配置
```

部署完成后访问：
- 主站: https://backbuy.cn
- API: https://api.backbuy.cn
- 管理后台: https://admin.backbuy.cn

---

## 详细部署步骤

### 方式一: 本地一键部署脚本（推荐）

#### 1.1 脚本功能

一键部署脚本会自动完成以下步骤：

```
┌──────────────────────────────────────────┐
│           一键部署流程                    │
├──────────────────────────────────────────┤
│ 1. 检查服务器连接                         │
│ 2. 运行本地测试 (lint/typecheck/unit)    │
│ 3. 构建项目                              │
│ 4. 备份服务器数据                         │
│ 5. 准备部署包                             │
│ 6. 上传到服务器                           │
│ 7. 在服务器执行部署                       │
│ 8. 验证部署结果                           │
└──────────────────────────────────────────┘
```

#### 1.2 使用方法

```bash
# 基本部署（交互式）
./scripts/deploy-to-tencent.sh -i <服务器IP>

# 使用 SSH 密钥
./scripts/deploy-to-tencent.sh -i <服务器IP> -k ~/.ssh/id_rsa

# 指定用户和端口
./scripts/deploy-to-tencent.sh -i <服务器IP> -u ubuntu -p 22

# 快速部署（跳过测试和备份）
./scripts/deploy-to-tencent.sh -i <服务器IP> --skip-tests --skip-backup

# 部署到测试环境
./scripts/deploy-to-tencent.sh -i <服务器IP> -e staging
```

#### 1.3 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-i, --ip` | 服务器 IP 地址 | 必填 |
| `-u, --user` | SSH 用户名 | ubuntu |
| `-p, --port` | SSH 端口 | 22 |
| `-k, --key` | SSH 私钥路径 | 无（使用密码） |
| `-e, --env` | 部署环境 | production |
| `--skip-tests` | 跳过测试 | false |
| `--skip-build` | 跳过构建 | false |
| `--skip-backup` | 跳过备份 | false |
| `-h, --help` | 显示帮助 | - |

#### 1.4 首次部署流程

```bash
# 步骤 1: 确保本地可以 SSH 到服务器
ssh ubuntu@<服务器IP>
# 如果无法连接，请先配置 SSH 密钥

# 步骤 2: 执行一键部署
./scripts/deploy-to-tencent.sh -i <服务器IP>

# 步骤 3: 脚本会提示配置环境变量
# 请根据提示编辑 deploy/config/.env.production

# 步骤 4: 配置 SSL 证书
# 脚本会自动调用 setup-ssl.sh 申请 Let's Encrypt 证书

# 步骤 5: 等待部署完成
# 脚本会自动验证部署结果
```

#### 1.5 更新部署

```bash
# 修改代码后，再次执行一键部署
./scripts/deploy-to-tencent.sh -i <服务器IP>

# 或快速更新（跳过测试）
./scripts/deploy-to-tencent.sh -i <服务器IP> --skip-tests
```

---

### 方式二: GitHub Actions 自动部署

#### 2.1 工作流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Push to   │ -> │  Run Tests  │ -> │ Build Image │ -> │   Deploy    │
│   main      │    │  (CI)       │    │  (Build)    │    │   (CD)      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
  代码推送到主分支    Lint/Typecheck    Docker 镜像构建    SSH 部署到
                      Unit Tests        Push to GHCR      腾讯云服务器
```

#### 2.2 配置步骤

**步骤 1: 生成 SSH 密钥对**

```bash
# 本地生成密钥对（专门用于 GitHub Actions）
ssh-keygen -t ed25519 -C "github-actions@one-recycle" -f ~/.ssh/github_actions

# 查看公钥
cat ~/.ssh/github_actions.pub

# 查看私钥（稍后添加到 GitHub Secrets）
cat ~/.ssh/github_actions
```

**步骤 2: 配置服务器 SSH**

```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 添加公钥到 authorized_keys
echo "<粘贴 github_actions.pub 的内容>" >> ~/.ssh/authorized_keys

# 确保权限正确
chmod 600 ~/.ssh/authorized_keys
```

**步骤 3: 添加 GitHub Secrets**

进入 GitHub 仓库页面：Settings > Secrets and variables > Actions

点击 "New repository secret" 添加以下 secrets：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `TENCENT_SERVER_IP` | 123.456.789.0 | 服务器公网 IP |
| `TENCENT_SSH_KEY` | ~/.ssh/github_actions 的内容 | SSH 私钥 |
| `TENCENT_SSH_USER` | ubuntu | SSH 用户名 |
| `TENCENT_SSH_PORT` | 22 | SSH 端口 |
| `SLACK_WEBHOOK_URL` | https://hooks.slack.com/... | 部署通知（可选） |

**步骤 4: 触发自动部署**

```bash
# 本地修改代码
git add .
git commit -m "feat: add new feature"
git push origin main

# GitHub Actions 会自动触发部署
# 在 GitHub 仓库页面查看 Actions 标签
```

#### 2.3 查看部署状态

1. 打开 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择最新的工作流运行
4. 查看详细的部署日志

#### 2.4 手动触发部署

```bash
# 1. 打开 GitHub 仓库页面
# 2. 点击 Actions 标签
# 3. 选择 "CI/CD Pipeline"
# 4. 点击 "Run workflow"
# 5. 选择分支和环境
# 6. 点击 "Run workflow"
```

---

### 方式三: 手动部署

适合学习调试或问题排查。

#### 3.1 服务器初始化

```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 方式 A: 使用初始化脚本（推荐）
curl -fsSL https://raw.githubusercontent.com/your-repo/main/deploy/scripts/init-server.sh | sudo bash

# 方式 B: 手动初始化
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

#### 3.2 上传部署文件

```bash
# 本地执行 - 打包项目
tar czvf one-recycle-deploy.tar.gz \
  server/ \
  deploy/ \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist'

# 上传到服务器
scp one-recycle-deploy.tar.gz ubuntu@<服务器IP>:/tmp/

# 服务器上解压
ssh ubuntu@<服务器IP> "sudo mkdir -p /opt/one-recycle && sudo tar xzf /tmp/one-recycle-deploy.tar.gz -C /opt/one-recycle"
```

#### 3.3 配置环境变量

```bash
ssh ubuntu@<服务器IP>
cd /opt/one-recycle/deploy/config

# 复制并编辑环境变量
sudo cp .env.production .env.production.local
sudo nano .env.production.local
```

必须配置的关键环境变量：
```bash
# 数据库密码
DB_PASSWORD=your_secure_password_here

# Redis 密码
REDIS_PASSWORD=your_redis_password_here

# JWT 密钥（至少32位随机字符串）
JWT_SECRET=your_random_jwt_secret_min_32_chars

# 微信小程序配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# 支付宝配置
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_APP_SECRET=your_alipay_app_secret

# 腾讯云 COS 配置
COS_SECRET_ID=your_cos_secret_id
COS_SECRET_KEY=your_cos_secret_key
COS_BUCKET=your_bucket_name
COS_REGION=ap-guangzhou
```

#### 3.4 配置 SSL 证书

**方式 A: 使用 Let's Encrypt（推荐）**

```bash
ssh ubuntu@<服务器IP>
sudo bash /opt/one-recycle/deploy/scripts/setup-ssl.sh

# 选择选项 1: Let's Encrypt Standalone 模式
```

**方式 B: 手动上传证书**

```bash
# 本地执行
scp your_domain.crt ubuntu@<服务器IP>:/opt/one-recycle/deploy/nginx/ssl/fullchain.pem
scp your_domain.key ubuntu@<服务器IP>:/opt/one-recycle/deploy/nginx/ssl/privkey.pem

# 服务器上设置权限
ssh ubuntu@<服务器IP> "sudo chmod 644 /opt/one-recycle/deploy/nginx/ssl/fullchain.pem && sudo chmod 600 /opt/one-recycle/deploy/nginx/ssl/privkey.pem"
```

#### 3.5 启动服务

```bash
ssh ubuntu@<服务器IP>
cd /opt/one-recycle

# 执行部署脚本
sudo bash deploy/scripts/deploy.sh production

# 或手动执行：
cd deploy/docker
sudo docker-compose -f docker-compose.production.yml up -d

# 执行数据库迁移
sleep 10
sudo docker exec one-recycle-api-gateway npx prisma migrate deploy
```

#### 3.6 验证部署

```bash
# 健康检查
curl https://api.backbuy.cn/health

# 查看服务状态
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml ps

# 查看日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f
```

---

## GitHub Actions CI/CD

### 工作流文件

- **主部署工作流**: `.github/workflows/deploy.yml`
- **PR 检查工作流**: `.github/workflows/pr-check.yml`

### 工作流说明

#### deploy.yml - 主部署工作流

触发条件：
- Push 到 main/master 分支
- 手动触发 (workflow_dispatch)

包含 Job：
1. **代码质量检查** - ESLint、TypeScript 类型检查
2. **单元测试** - 带 PostgreSQL 和 Redis 服务的测试
3. **构建 Docker 镜像** - 构建并推送到 GitHub Container Registry
4. **部署到腾讯云** - 通过 SSH 自动部署
5. **健康检查** - 验证部署结果
6. **E2E 测试** - 端到端测试（可选）
7. **构建前端** - Admin Web 构建

#### pr-check.yml - PR 检查工作流

触发条件：
- Pull Request 到 main/master 分支

包含 Job：
1. **代码变更检测** - 智能检测变更模块
2. **Server 代码检查** - Lint、类型检查、单元测试
3. **Admin Web 代码检查** - Lint、类型检查、构建
4. **安全扫描** - npm audit、Snyk 扫描
5. **代码质量分析** - SonarCloud 分析
6. **PR 总结** - 自动评论检查结果

### 配置 Environment

为了更安全地管理部署，建议配置 GitHub Environment：

1. 打开 Settings > Environments
2. 点击 "New environment"
3. 名称填写 `production`
4. 配置保护规则：
   - 需要审查（可以指定审查者）
   - 等待时间
   - 部署分支限制

---

## 运维管理

### 常用命令速查表

| 操作 | 命令 |
|------|------|
| 查看所有服务状态 | `sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml ps` |
| 查看服务日志 | `sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f <service>` |
| 重启所有服务 | `sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml restart` |
| 重启单个服务 | `sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml restart <service>` |
| 进入容器 | `sudo docker exec -it <container> sh` |
| 备份数据库 | `sudo docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > backup_$(date +%Y%m%d).sql` |
| 查看资源使用 | `sudo docker stats --no-stream` |

### 服务列表

| 服务名 | 端口 | 说明 |
|--------|------|------|
| nginx | 80, 443 | 反向代理 |
| api-gateway | 3002 | API 网关 |
| account-service | 3001 | 账户服务 |
| order-service | 3003 | 订单服务 |
| notification-service | 3004 | 通知服务 |
| inventory-service | 3009 | 库存服务 |
| category-service | 3008 | 分类服务 |
| message-queue | 3010 | 消息队列 |
| postgres | 5432 | PostgreSQL 数据库 |
| redis | 6379 | Redis 缓存 |
| ollama | 11434 | AI 模型服务 |

### 自动备份

```bash
# 编辑 crontab
sudo crontab -e

# 添加每日备份任务（每天凌晨 2 点）
0 2 * * * /opt/one-recycle/deploy/scripts/backup.sh

# 查看备份文件
ls -la /opt/backups/
```

---

## 故障排查

### 常见问题

#### 1. 部署脚本连接服务器失败

```bash
# 检查 SSH 连接
ssh ubuntu@<服务器IP>

# 检查服务器 IP 是否正确
# 检查安全组是否开放 22 端口
# 检查 SSH 密钥是否正确配置
```

#### 2. 服务无法启动

```bash
# 查看详细日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs

# 检查端口占用
sudo netstat -tlnp | grep 300

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

#### 3. 502 Bad Gateway

```bash
# 检查 Nginx 配置
sudo docker exec one-recycle-nginx nginx -t

# 检查后端服务是否健康
curl http://localhost:3002/health

# 查看 Nginx 错误日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs nginx
```

#### 4. 数据库连接失败

```bash
# 检查数据库容器状态
sudo docker ps | grep postgres

# 检查数据库日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs postgres

# 测试数据库连接
sudo docker exec -it one-recycle-postgres pg_isready -U one_recycle
```

#### 5. SSL 证书问题

```bash
# 检查证书有效期
openssl x509 -in /opt/one-recycle/deploy/nginx/ssl/fullchain.pem -noout -dates

# 测试 HTTPS 连接
curl -v https://api.backbuy.cn/health

# 重新申请证书
sudo certbot renew --force-renewal
```

### 日志位置

| 日志类型 | 位置 |
|----------|------|
| Docker 容器日志 | `docker-compose logs` |
| Nginx 访问日志 | `/opt/one-recycle/logs/nginx/access.log` |
| Nginx 错误日志 | `/opt/one-recycle/logs/nginx/error.log` |

---

## 相关文档

- [详细部署文档](deploy/docs/DEPLOY.md)
- [GitHub Actions CI/CD 配置](.github/workflows/README.md)
- [服务器初始化脚本](deploy/scripts/init-server.sh)
- [SSL 证书配置脚本](deploy/scripts/setup-ssl.sh)
- [一键部署脚本](scripts/deploy-to-tencent.sh)
- [服务器部署脚本](deploy/scripts/deploy.sh)

---

## 技术支持

如有问题，请检查：
1. 服务器安全组是否开放必要端口（22, 80, 443）
2. 域名 DNS 解析是否正确指向服务器 IP
3. SSL 证书是否正确配置
4. 环境变量是否正确设置（特别是数据库密码、JWT 密钥）
5. Docker 服务是否正常运行
6. 服务器磁盘空间是否充足

---

## 更新记录

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2024-03-21 | v1.0 | 初始版本，支持三种部署方式 |
