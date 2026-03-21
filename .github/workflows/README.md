# GitHub Actions CI/CD 配置指南

## 工作流说明

本项目包含两个主要的工作流：

1. **PR Check** (`pr-check.yml`) - Pull Request 时触发
2. **Deploy** (`deploy.yml`) - 推送到 main 分支时触发

---

## 工作流详情

### 1. PR Check 工作流

在创建 Pull Request 时自动运行，包含以下任务：

- **代码变更检测**: 检测哪些模块的代码发生了变化
- **Server 代码检查**: ESLint、TypeScript 类型检查、单元测试
- **Admin Web 代码检查**: ESLint、TypeScript 类型检查、构建测试
- **安全扫描**: npm audit、Snyk 安全扫描
- **代码质量分析**: SonarCloud 代码质量分析
- **PR 总结**: 在 PR 中发布检查结果汇总

### 2. Deploy 工作流

在代码推送到 main/master 分支时自动运行，包含以下任务：

- **代码质量检查**: ESLint、TypeScript 类型检查
- **单元测试**: 运行单元测试并生成覆盖率报告
- **构建 Docker 镜像**: 构建并推送镜像到 GitHub Container Registry
- **部署到腾讯云**: 通过 SSH 部署到腾讯云服务器
- **健康检查**: 验证部署是否成功
- **E2E 测试**: 运行端到端测试（可选）
- **构建前端**: 构建 Admin Web 前端

---

## 配置 Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：

### 必需 Secrets

| Secret 名称 | 说明 | 获取方式 |
|------------|------|---------|
| `TENCENT_SERVER_IP` | 腾讯云服务器公网 IP | 腾讯云控制台 |
| `TENCENT_SSH_KEY` | SSH 私钥 | 生成 SSH 密钥对 |
| `TENCENT_SSH_USER` | SSH 用户名 (默认: ubuntu) | 服务器配置 |
| `TENCENT_SSH_PORT` | SSH 端口 (默认: 22) | 服务器配置 |

### 可选 Secrets

| Secret 名称 | 说明 | 用途 |
|------------|------|------|
| `SLACK_WEBHOOK_URL` | Slack Webhook URL | 部署通知 |
| `SNYK_TOKEN` | Snyk API Token | 安全扫描 |
| `SONAR_TOKEN` | SonarCloud Token | 代码质量分析 |

---

## 设置步骤

### 1. 生成 SSH 密钥对

在本地生成 SSH 密钥对（用于 GitHub Actions 连接服务器）：

```bash
ssh-keygen -t ed25519 -C "github-actions@one-recycle" -f ~/.ssh/github_actions
```

这将生成两个文件：
- `~/.ssh/github_actions` - 私钥（添加到 GitHub Secrets）
- `~/.ssh/github_actions.pub` - 公钥（添加到服务器）

### 2. 配置服务器 SSH

将公钥添加到服务器的 authorized_keys：

```bash
# 在服务器上执行
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
<粘贴 github_actions.pub 的内容>
EOF
chmod 600 ~/.ssh/authorized_keys
```

### 3. 添加 GitHub Secrets

1. 打开 GitHub 仓库页面
2. 点击 Settings > Secrets and variables > Actions
3. 点击 "New repository secret"
4. 添加以下 secrets：

```
Name: TENCENT_SERVER_IP
Value: 你的服务器公网IP

Name: TENCENT_SSH_KEY
Value: <粘贴 ~/.ssh/github_actions 的内容>

Name: TENCENT_SSH_USER
Value: ubuntu

Name: TENCENT_SSH_PORT
Value: 22
```

### 4. 配置 GitHub Environment（可选）

为了更安全地管理部署，可以创建 GitHub Environment：

1. 打开 Settings > Environments
2. 点击 "New environment"
3. 名称填写 `production`
4. 配置保护规则：
   - 需要审查（可以指定审查者）
   - 等待时间
   - 部署分支限制

---

## 手动触发部署

除了自动触发外，也可以手动触发部署：

1. 打开 GitHub 仓库页面
2. 点击 Actions 标签
3. 选择 "CI/CD Pipeline" 工作流
4. 点击 "Run workflow"
5. 选择分支和环境
6. 点击 "Run workflow"

---

## 故障排查

### 部署失败

1. 检查 Secrets 是否正确配置
2. 检查服务器 SSH 是否允许 GitHub Actions IP
3. 查看 Actions 日志获取详细错误信息

### SSH 连接失败

```bash
# 在服务器上检查 SSH 服务
sudo systemctl status ssh

# 检查防火墙
sudo ufw status

# 检查 SELinux (如果启用)
sudo getenforce
```

### 健康检查失败

```bash
# 在服务器上检查服务状态
docker-compose -f deploy/docker/docker-compose.production.yml ps

# 查看日志
docker-compose -f deploy/docker/docker-compose.production.yml logs
```

---

## 自定义配置

### 修改触发条件

编辑 `.github/workflows/deploy.yml`：

```yaml
on:
  push:
    branches: [main, master, develop]  # 添加更多分支
  pull_request:
    branches: [main]
```

### 添加更多测试

在 `deploy.yml` 中添加新的 job：

```yaml
  integration-tests:
    name: 集成测试
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      # 测试步骤
```

### 配置多环境部署

```yaml
  deploy-staging:
    name: 部署到测试环境
    runs-on: ubuntu-latest
    needs: build-images
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      # 部署到测试服务器的步骤

  deploy-production:
    name: 部署到生产环境
    runs-on: ubuntu-latest
    needs: build-images
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      # 部署到生产服务器的步骤
```

---

## 最佳实践

1. **保护主分支**: 在 Settings > Branches 中设置分支保护规则
2. **代码审查**: 要求 PR 必须经过审查才能合并
3. **状态检查**: 要求 PR 必须通过所有检查才能合并
4. **Secrets 轮换**: 定期更换 SSH 密钥和其他敏感信息
5. **监控告警**: 配置部署失败通知（Slack/邮件）
