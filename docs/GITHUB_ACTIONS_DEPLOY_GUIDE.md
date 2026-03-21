# GitHub Actions 自动部署配置指南

本文档详细说明如何配置 OneRecycle 项目的 GitHub Actions 自动部署到腾讯云服务器。

---

## 目录
1. [前置条件](#前置条件)
2. [配置步骤](#配置步骤)
3. [GitHub Secrets 配置](#github-secrets-配置)
4. [触发部署](#触发部署)
5. [查看部署状态](#查看部署状态)
6. [故障排查](#故障排查)

---

## 前置条件

### 必需条件
- ✅ 已有腾讯云服务器（4核8G推荐，Ubuntu 22.04 LTS）
- ✅ 已有 GitHub 仓库
- ✅ 域名已解析到服务器 IP（backbuy.cn）
- ✅ 本地有 SSH 访问服务器的权限

### 服务器要求
- Docker 已安装
- Docker Compose 已安装
- 防火墙已开放端口：22, 80, 443
- 至少 20GB 可用磁盘空间

---

## 配置步骤

### 步骤 1: 生成 SSH 密钥对

在本地终端执行以下命令生成专门用于 GitHub Actions 的 SSH 密钥对：

```bash
# 生成密钥对
ssh-keygen -t ed25519 -C "github-actions@one-recycle" -f ~/.ssh/github_actions_2025

# 查看公钥（稍后需要添加到服务器）
cat ~/.ssh/github_actions_2025.pub

# 查看私钥（稍后需要添加到 GitHub Secrets）
cat ~/.ssh/github_actions_2025
```

**输出示例：**

```bash
# 公钥示例
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICeK5F7x9F9zK5F7x9F9zK5F7x9F9zK5F7x9F9z github-actions@one-recycle

# 私钥示例（完整内容）
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
...
（完整的私钥内容）
...
-----END OPENSSH PRIVATE KEY-----
```

### 步骤 2: 配置服务器 SSH

登录到腾讯云服务器并配置 SSH 授权：

```bash
# SSH 登录服务器
ssh ubuntu@<您的服务器IP>

# 确保 authorized_keys 文件存在且权限正确
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 添加公钥到 authorized_keys
echo "<粘贴上面的公钥内容>" >> ~/.ssh/authorized_keys

# 验证公钥已添加
cat ~/.ssh/authorized_keys
```

**验证 SSH 连接：**

```bash
# 在本地终端使用新密钥测试连接
ssh -i ~/.ssh/github_actions_2025 ubuntu@<您的服务器IP>

# 如果成功登录，说明配置正确
# 如果失败，检查：
# 1. 公钥是否正确粘贴
# 2. authorized_keys 权限是否为 600
# 3. 服务器防火墙是否开放 22 端口
```

### 步骤 3: 初始化服务器环境

首次部署需要初始化服务器环境：

```bash
# SSH 登录服务器
ssh ubuntu@<您的服务器IP>

# 创建项目目录
sudo mkdir -p /opt/one-recycle
sudo chown ubuntu:ubuntu /opt/one-recycle
cd /opt/one-recycle

# 创建备份目录
sudo mkdir -p /opt/backups

# 创建日志目录
sudo mkdir -p /opt/one-recycle/logs/nginx

# 验证 Docker 已安装
docker --version
docker-compose --version

# 如果未安装，执行以下命令安装：
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 步骤 4: 配置服务器环境变量

在服务器上创建环境变量文件：

```bash
# SSH 登录服务器
ssh ubuntu@<您的服务器IP>

# 创建配置目录
cd /opt/one-recycle
mkdir -p deploy/config

# 复制环境变量示例文件
nano deploy/config/.env.production
```

**环境变量配置示例：**

```bash
# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=one_recycle
DB_PASSWORD=your_secure_password_here_请修改为强密码
DB_NAME=one_recycle

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here_请修改为强密码

# JWT 密钥（至少32位随机字符串）
JWT_SECRET=your_random_jwt_secret_min_32_characters_long

# 微信小程序配置
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=your_wechat_secret_here

# 腾讯云配置
TENCENT_SECRET_ID=AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TENCENT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 阿里云 AI 配置
ALIYUN_API_KEY=your_aliyun_api_key_here
```

**生成强密码的命令：**

```bash
# 生成随机密码
openssl rand -base64 32
```

### 步骤 5: 配置 SSL 证书

**选项 A: 使用 Let's Encrypt 免费证书（推荐）**

```bash
# SSH 登录服务器
ssh ubuntu@<您的服务器IP>

# 安装 certbot
sudo apt update
sudo apt install -y certbot

# 申请证书（确保域名已解析到服务器IP）
sudo certbot certonly --standalone -d backbuy.cn -d www.backbuy.cn -d api.backbuy.cn -d admin.backbuy.cn

# 创建证书目录
sudo mkdir -p /opt/one-recycle/deploy/nginx/ssl

# 复制证书
sudo cp /etc/letsencrypt/live/backbuy.cn/fullchain.pem /opt/one-recycle/deploy/nginx/ssl/
sudo cp /etc/letsencrypt/live/backbuy.cn/privkey.pem /opt/one-recycle/deploy/nginx/ssl/

# 设置权限
sudo chmod 644 /opt/one-recycle/deploy/nginx/ssl/fullchain.pem
sudo chmod 600 /opt/one-recycle/deploy/nginx/ssl/privkey.pem

# 配置自动续期
echo "0 0 * * * certbot renew --quiet --deploy-hook 'cp /etc/letsencrypt/live/backbuy.cn/fullchain.pem /opt/one-recycle/deploy/nginx/ssl/ && cp /etc/letsencrypt/live/backbuy.cn/privkey.pem /opt/one-recycle/deploy/nginx/ssl/ && docker restart one-recycle-nginx'" | sudo crontab -
```

**选项 B: 使用已有证书**

```bash
# SSH 登录服务器
ssh ubuntu@<您的服务器IP>

# 创建证书目录
sudo mkdir -p /opt/one-recycle/deploy/nginx/ssl

# 上传证书文件（在本地执行）
scp your_fullchain.pem ubuntu@<服务器IP>:/tmp/
scp your_privkey.pem ubuntu@<服务器IP>:/tmp/

# 在服务器上设置证书
ssh ubuntu@<服务器IP>
sudo mv /tmp/your_fullchain.pem /opt/one-recycle/deploy/nginx/ssl/fullchain.pem
sudo mv /tmp/your_privkey.pem /opt/one-recycle/deploy/nginx/ssl/privkey.pem
sudo chmod 644 /opt/one-recycle/deploy/nginx/ssl/fullchain.pem
sudo chmod 600 /opt/one-recycle/deploy/nginx/ssl/privkey.pem
```

---

## GitHub Secrets 配置

### 添加 Secrets

1. 打开 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 左侧菜单选择 **Secrets and variables** > **Actions**
4. 点击 **New repository secret** 按钮

**必需的 Secrets：**

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `TENCENT_SERVER_IP` | 服务器公网 IP | `123.456.789.0` |
| `TENCENT_SSH_KEY` | SSH 私钥完整内容 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `TENCENT_SSH_USER` | SSH 用户名 | `ubuntu` |
| `TENCENT_SSH_PORT` | SSH 端口 | `22` |

**可选的 Secrets：**

| Secret 名称 | 说明 |
|------------|------|
| `SLACK_WEBHOOK_URL` | Slack 通知 Webhook URL |
| `SNYK_TOKEN` | Snyk 安全扫描 Token |
| `SONAR_TOKEN` | SonarCloud 代码分析 Token |

### 配置 SSH Secret 的详细步骤

1. 在本地执行以下命令获取私钥完整内容：

```bash
cat ~/.ssh/github_actions_2025
```

2. 复制完整的私钥内容（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`）

3. 在 GitHub 添加 Secret：
   - Name: `TENCENT_SSH_KEY`
   - Value: 粘贴完整的私钥内容

**⚠️ 注意事项：**
- 确保复制了完整的私钥内容，不要有遗漏
- 保持原始格式，不要添加额外的空格或换行
- 不要添加引号或转义字符

---

## 触发部署

### 自动部署

当您推送代码到 `main` 或 `master` 分支时，GitHub Actions 会自动触发部署：

```bash
# 本地修改代码
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

### 手动触发部署

如果需要手动触发部署（例如回滚或重新部署）：

1. 打开 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 在左侧选择 "CI/CD Pipeline"
4. 点击右侧的 "Run workflow" 按钮
5. 选择分支（main/master）
6. 选择环境（production）
7. 点击 "Run workflow" 按钮

---

## 查看部署状态

### 实时查看部署进度

1. 打开 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择最新的工作流运行
4. 查看各个 Job 的执行状态和日志

**部署流程说明：**

```
Job 1: 代码质量检查 (lint-and-typecheck)
  ├─ ESLint 检查
  └─ TypeScript 类型检查

Job 2: 单元测试 (unit-tests)
  ├─ PostgreSQL 测试数据库
  ├─ Redis 测试缓存
  └─ 单元测试执行

Job 3: 构建 Docker 镜像 (build-images)
  ├─ API Gateway 镜像
  ├─ Account Service 镜像
  ├─ Order Service 镜像
  └─ 其他服务镜像

Job 4: 部署到腾讯云 (deploy-to-tencent)
  ├─ 备份当前版本
  ├─ 上传部署包
  ├─ 更新 Docker 镜像
  ├─ 重启服务
  ├─ 执行数据库迁移
  └─ 健康检查

Job 5: E2E 测试 (e2e-tests) [可选]
  └─ 端到端测试

Job 6: 构建管理后台 (build-admin-web)
  └─ Next.js 应用构建
```

### 部署成功后访问

部署成功后，您可以通过以下地址访问服务：

- **主站**: https://backbuy.cn
- **API**: https://api.backbuy.cn
- **管理后台**: https://admin.backbuy.cn

### 服务器端查看服务状态

SSH 登录服务器后执行：

```bash
# 查看所有容器状态
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml ps

# 查看特定服务日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f api-gateway

# 查看所有服务日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f

# 查看资源使用情况
sudo docker stats --no-stream
```

---

## 故障排查

### 常见问题及解决方案

#### 1. SSH 连接失败

**错误信息：**
```
Permission denied (publickey)
```

**解决方案：**

```bash
# 检查本地私钥权限
chmod 600 ~/.ssh/github_actions_2025

# 手动测试 SSH 连接
ssh -i ~/.ssh/github_actions_2025 -v ubuntu@<服务器IP>

# 检查服务器端 authorized_keys
ssh ubuntu@<服务器IP>
cat ~/.ssh/authorized_keys
# 应该看到您添加的公钥内容

# 检查 authorized_keys 权限
ls -la ~/.ssh/authorized_keys
# 应该显示 -rw------- (600)
```

#### 2. Docker 构建失败

**错误信息：**
```
Error: buildx failed with: error building
```

**解决方案：**

```bash
# 检查 server/Dockerfile 是否存在
ls -la server/Dockerfile

# 检查 Dockerfile 内容
cat server/Dockerfile

# 在本地测试构建
cd server
docker build -t test-build .
```

#### 3. 环境变量缺失

**错误信息：**
```
Error: Required environment variable DB_PASSWORD is not set
```

**解决方案：**

```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 检查环境变量文件
cat /opt/one-recycle/deploy/config/.env.production

# 确保所有必需的变量都已设置
# 特别是：
# - DB_PASSWORD
# - REDIS_PASSWORD
# - JWT_SECRET
# - WECHAT_APP_ID
# - WECHAT_APP_SECRET
```

#### 4. SSL 证书问题

**错误信息：**
```
SSL certificate problem: unable to get local issuer certificate
```

**解决方案：**

```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 检查证书文件
ls -la /opt/one-recycle/deploy/nginx/ssl/

# 验证证书
openssl x509 -in /opt/one-recycle/deploy/nginx/ssl/fullchain.pem -noout -dates

# 如果证书过期，重新申请
sudo certbot renew --force-renewal

# 复制新证书到部署目录
sudo cp /etc/letsencrypt/live/backbuy.cn/fullchain.pem /opt/one-recycle/deploy/nginx/ssl/
sudo cp /etc/letsencrypt/live/backbuy.cn/privkey.pem /opt/one-recycle/deploy/nginx/ssl/

# 重启 Nginx
sudo docker restart one-recycle-nginx
```

#### 5. 服务无法启动

**错误信息：**
```
Container exited with code 1
```

**解决方案：**

```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 查看容器日志
sudo docker logs one-recycle-api-gateway

# 查看服务详细状态
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml ps

# 重启特定服务
sudo docker restart one-recycle-api-gateway

# 查看资源使用
sudo docker stats --no-stream

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

#### 6. 健康检查失败

**错误信息：**
```
Health check failed: HTTP status code 502
```

**解决方案：**

```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 手动测试 API
curl http://localhost:3002/health

# 检查 Nginx 配置
sudo docker exec one-recycle-nginx nginx -t

# 查看 Nginx 日志
sudo docker logs one-recycle-nginx

# 检查后端服务状态
sudo docker ps | grep one-recycle
```

---

## 高级配置

### 配置 GitHub Environment（可选）

为了更安全地管理部署，可以配置 GitHub Environment：

1. 打开 GitHub 仓库页面
2. 点击 **Settings** > **Environments**
3. 点击 **New environment**
4. 名称填写 `production`
5. 配置保护规则：
   - ✅ Required reviewers（指定审查者）
   - ✅ Wait timer（等待时间，例如 30 分钟）
   - ✅ Deployment branches（限制部署分支）

### 配置 Slack 通知（可选）

如果需要 Slack 通知：

1. 创建 Slack Incoming Webhook
2. 在 GitHub Secrets 中添加 `SLACK_WEBHOOK_URL`
3. 部署成功或失败时会自动发送通知

### 配置自动备份（可选）

在服务器上配置定时备份：

```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 编辑 crontab
sudo crontab -e

# 添加每日备份任务（每天凌晨 2 点）
0 2 * * * cd /opt/one-recycle && sudo bash deploy/scripts/backup.sh

# 查看备份文件
ls -la /opt/backups/
```

---

## 安全最佳实践

### 1. 定期更新密码

```bash
# 每季度更新数据库密码
# 每季度更新 Redis 密码
# 每季度更新 JWT_SECRET
```

### 2. 使用强密码

```bash
# 生成强密码
openssl rand -base64 32

# 密码要求：
# - 至少 32 个字符
# - 包含大小写字母、数字和特殊字符
# - 不使用常用字典词汇
```

### 3. 限制 SSH 访问

```bash
# 在服务器上配置 SSH
sudo nano /etc/ssh/sshd_config

# 添加以下配置：
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 4. 定期检查日志

```bash
# 查看部署日志
sudo tail -f /opt/one-recycle/logs/nginx/error.log

# 查看异常访问
sudo grep "error" /opt/one-recycle/logs/nginx/error.log | tail -50
```

---

## 总结

完成以上配置后，您将拥有一个完整的自动化 CI/CD 流程：

✅ 代码推送到 GitHub 自动触发部署
✅ 自动运行测试和代码检查
✅ 自动构建 Docker 镜像
✅ 自动部署到腾讯云服务器
✅ 自动健康检查
✅ 可选的 Slack 通知

---

## 相关文档

- [部署总览](../deploy/README.md)
- [详细部署指南](../deploy/docs/DEPLOY.md)
- [GitHub Actions 工作流](../../.github/workflows/README.md)
- [服务器部署脚本](../deploy/scripts/deploy.sh)

---

## 技术支持

如遇到问题，请检查：

1. GitHub Secrets 是否正确配置
2. 服务器 SSH 密钥是否正确添加
3. 环境变量是否完整设置
4. 服务器防火墙是否开放必要端口
5. 域名 DNS 解析是否正确
6. SSL 证书是否有效

如有其他问题，请参考 [故障排查](#故障排查) 部分。
