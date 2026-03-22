# GitHub Actions 自动部署配置完成

OneRecycle 项目已完成 GitHub Actions CI/CD 配置。

## 快速开始

### 步骤 1: 配置服务器

SSH 登录服务器，安装 Docker：

```bash
ssh root@101.42.31.216
curl -fsSL https://get.docker.com | sh
systemctl start docker && systemctl enable docker

# 安装 Docker Compose 插件
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

### 步骤 2: 生成 SSH 密钥

在服务器上执行：

```bash
ssh-keygen -t ed25519 -C "github-actions" -f /tmp/deploy_key -N ""
cat /tmp/deploy_key          # 复制到 SERVER_SSH_KEY
cat /tmp/deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
rm -f /tmp/deploy_key /tmp/deploy_key.pub
```

### 步骤 3: 配置 GitHub Secrets

在 https://github.com/xuanyiying/one-recycle/settings/secrets/actions 添加：

| Secret | 值 |
|--------|-----|
| `SERVER_HOST` | `101.42.31.216` |
| `SERVER_USER` | `root` |
| `SERVER_PORT` | `22` |
| `SERVER_SSH_KEY` | 上一步生成的私钥 |

### 步骤 4: 触发部署

```bash
git checkout prod
git push origin prod
```

## 工作流说明

- **触发**: 推送到 `prod` 分支
- **流程**: rsync 上传 -> Docker Compose build -> 健康检查
- **查看**: https://github.com/xuanyiying/one-recycle/actions

## 相关文档

| 文档 | 说明 |
|------|------|
| [部署指南](DEPLOY_GUIDE.md) | 完整部署文档 |
| [配置指南](docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md) | 详细配置步骤 |
| [检查清单](docs/GITHUB_ACTIONS_CHECKLIST.md) | 部署前检查 |
| [快速参考](docs/DEPLOYMENT_QUICK_REFERENCE.md) | 运维命令 |
