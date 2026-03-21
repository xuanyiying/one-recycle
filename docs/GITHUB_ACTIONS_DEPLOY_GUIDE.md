# OneRecycle GitHub Actions 自动部署配置指南

## 快速开始（3 步完成）

### 第 1 步：服务器首次初始化

在 OrcaTerm 终端中执行以下命令（仅需执行一次）：

```bash
# 1. 克隆项目
cd /opt
git clone <您的GitHub仓库地址> one-recycle

# 2. 如果仓库是私有的，需要配置 SSH 密钥或 Personal Access Token
# SSH 方式：
#   git clone git@github.com:<用户名>/<仓库名>.git one-recycle
# HTTPS + Token 方式：
#   git clone https://<TOKEN>@github.com/<用户名>/<仓库名>.git one-recycle

# 3. 确认文件就位
ls /opt/one-recycle/deploy/docker/docker-compose.production.yml
ls /opt/one-recycle/deploy/config/.env.production

# 4. （可选）编辑环境变量
vi /opt/one-recycle/deploy/config/.env.production

# 5. 确保 Docker 已安装
docker --version
docker compose version
```

### 第 2 步：配置 GitHub Secrets

进入 GitHub 仓库 -> Settings -> Secrets and variables -> Actions -> New repository secret

需要添加以下 4 个 Secrets：

| Secret 名称 | 说明 | 示例值 |
|-------------|------|--------|
| `SERVER_HOST` | 服务器公网 IP | `101.42.31.216` |
| `SERVER_USER` | SSH 登录用户名 | `root` |
| `SERVER_PORT` | SSH 端口（默认22可省略） | `22` |
| `SERVER_SSH_KEY` | SSH 私钥（完整内容） | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |

#### 获取 SSH 私钥

**方式 A：使用现有密钥**
```bash
# 在您的 Mac 上查看
cat ~/.ssh/id_rsa
# 或
cat ~/.ssh/id_ed25519
```
复制完整内容（包括 BEGIN 和 END 行）到 `SERVER_SSH_KEY`

**方式 B：生成新密钥对**
```bash
# 在 Mac 上生成
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# 查看私钥（复制到 SERVER_SSH_KEY）
cat ~/.ssh/deploy_key

# 将公钥添加到服务器（在 OrcaTerm 中执行）
echo "公钥内容" >> ~/.ssh/authorized_keys
```

**方式 C：在服务器上生成密钥对**
```bash
# 在 OrcaTerm 中执行
ssh-keygen -t ed25519 -C "github-actions" -f /tmp/deploy_key -N ""
cat /tmp/deploy_key          # 这是私钥，复制到 SERVER_SSH_KEY
cat /tmp/deploy_key.pub      # 这是公钥
cat /tmp/deploy_key.pub >> ~/.ssh/authorized_keys
rm -f /tmp/deploy_key /tmp/deploy_key.pub
```

### 第 3 步：配置 GitHub Environments

进入 GitHub 仓库 -> Settings -> Environments -> New environment

1. 创建名为 `production` 的环境
2. 添加 Protection rules（可选）：勾选 "Required reviewers"

### 完成！推送代码触发部署

```bash
git add .
git commit -m "feat: configure GitHub Actions auto-deploy"
git push origin main
```

在 GitHub 仓库 -> Actions 标签页查看部署进度。

## 部署流程说明

每次推送到 `main` 分支时，自动执行：

1. **代码上传** — 通过 rsync 将 `server/` 和 `deploy/` 上传到服务器 `/opt/one-recycle/`
2. **构建镜像** — 在服务器上执行 `docker compose build`
3. **启动服务** — `docker compose up -d`
4. **健康检查** — 等待 API Gateway 响应 HTTP 200

## 手动触发部署

在 GitHub 仓库 -> Actions -> "CI/CD Pipeline" -> "Run workflow" 按钮手动触发。

## 常用运维命令

在 OrcaTerm 中执行：

```bash
# 查看服务状态
cd /opt/one-recycle/deploy/docker && docker compose -f docker-compose.production.yml ps

# 查看日志
cd /opt/one-recycle/deploy/docker && docker compose -f docker-compose.production.yml logs -f api-gateway

# 重启所有服务
cd /opt/one-recycle/deploy/docker && docker compose -f docker-compose.production.yml restart

# 停止所有服务
cd /opt/one-recycle/deploy/docker && docker compose -f docker-compose.production.yml down

# 更新代码并重启（手动更新，不走 CI/CD）
cd /opt/one-recycle && git pull origin main
cd deploy/docker && docker compose -f docker-compose.production.yml up -d --build
```

## 访问地址

- API: `http://101.42.31.216:3002`
- 健康检查: `http://101.42.31.216:3002/health`
- Swagger 文档: `http://101.42.31.216:3002/api/docs`
