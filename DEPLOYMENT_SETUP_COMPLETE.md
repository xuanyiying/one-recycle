# ✅ GitHub Actions 自动部署配置完成

恭喜！您的 OneRecycle 项目已完成 GitHub Actions 自动部署配置。

---

## 📦 已创建的文档

### 1. 核心部署指南
- **docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md** - 完整的 GitHub Actions 自动部署配置指南
  - 详细的配置步骤
  - GitHub Secrets 配置说明
  - 触发和查看部署的方法
  - 完整的故障排查指南
  - 高级配置和安全最佳实践

### 2. 检查清单
- **docs/GITHUB_ACTIONS_CHECKLIST.md** - 部署前配置检查清单
  - 10 个阶段的详细检查项
  - 配置信息汇总表
  - 常见错误预检
  - 快速问题诊断

### 3. 快速参考
- **docs/DEPLOYMENT_QUICK_REFERENCE.md** - 部署后快速参考卡片
  - 常用运维命令
  - 服务管理操作
  - 日志查看方法
  - 故障排查流程
  - 性能监控命令

### 4. 文档索引
- **docs/DEPLOYMENT_INDEX.md** - 所有部署文档的导航索引
  - 文档快速查找
  - 推荐部署流程
  - 按场景分类的文档使用建议

### 5. 验证脚本
- **scripts/verify-deploy-setup.sh** - 自动化配置验证脚本
  - 本地环境检查
  - 服务器环境检查
  - SSH 连接测试
  - SSL 证书验证
  - GitHub 配置检查

### 6. README 更新
- **README.md** - 添加了部署方式的快速入口

---

## 🚀 快速开始

### 步骤 1: 准备服务器

确保您的服务器满足以下要求：
- ✅ 腾讯云服务器（推荐 4核8G，Ubuntu 22.04 LTS）
- ✅ Docker 已安装
- ✅ Docker Compose 已安装
- ✅ 防火墙开放端口：22, 80, 443
- ✅ 域名已解析到服务器 IP（backbuy.cn）

### 步骤 2: 生成 SSH 密钥

```bash
# 生成 SSH 密钥对
ssh-keygen -t ed25519 -C "github-actions@one-recycle" -f ~/.ssh/github_actions_2025

# 查看公钥（添加到服务器）
cat ~/.ssh/github_actions_2025.pub

# 查看私钥（添加到 GitHub Secrets）
cat ~/.ssh/github_actions_2025
```

### 步骤 3: 配置服务器

```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 添加公钥到 authorized_keys
echo "<粘贴公钥内容>" >> ~/.ssh/authorized_keys

# 创建项目目录
sudo mkdir -p /opt/one-recycle
sudo mkdir -p /opt/backups

# 配置环境变量
nano /opt/one-recycle/deploy/config/.env.production
# 根据示例配置所有必需的环境变量
```

### 步骤 4: 配置 SSL 证书

```bash
# 使用 Let's Encrypt 免费证书
sudo apt install certbot
sudo certbot certonly --standalone -d backbuy.cn -d api.backbuy.cn -d admin.backbuy.cn

# 复制证书到部署目录
sudo mkdir -p /opt/one-recycle/deploy/nginx/ssl
sudo cp /etc/letsencrypt/live/backbuy.cn/fullchain.pem /opt/one-recycle/deploy/nginx/ssl/
sudo cp /etc/letsencrypt/live/backbuy.cn/privkey.pem /opt/one-recycle/deploy/nginx/ssl/

# 设置权限
sudo chmod 644 /opt/one-recycle/deploy/nginx/ssl/fullchain.pem
sudo chmod 600 /opt/one-recycle/deploy/nginx/ssl/privkey.pem
```

### 步骤 5: 配置 GitHub Secrets

在 GitHub 仓库中添加以下 Secrets：

1. 打开仓库 > Settings > Secrets and variables > Actions
2. 点击 New repository secret

**必需的 Secrets：**
- `TENCENT_SERVER_IP` - 您的服务器 IP 地址
- `TENCENT_SSH_KEY` - 完整的 SSH 私钥内容
- `TENCENT_SSH_USER` - ubuntu
- `TENCENT_SSH_PORT` - 22

### 步骤 6: 验证配置

```bash
# 运行配置验证脚本
bash scripts/verify-deploy-setup.sh

# 按照提示输入配置信息，脚本会自动检查所有配置
```

### 步骤 7: 触发首次部署

```bash
# 推送代码触发自动部署
git add .
git commit -m "feat: 初始化生产环境部署"
git push origin main
```

然后在 GitHub 仓库页面查看 Actions 标签，观察部署进度。

---

## 📋 部署检查清单

在触发首次部署前，请确保：

- [ ] 服务器 IP 地址已确认
- [ ] 可以 SSH 登录服务器
- [ ] Docker 和 Docker Compose 已安装
- [ ] SSH 密钥已生成并添加到服务器
- [ ] 服务器目录已创建
- [ ] 环境变量已配置（.env.production）
- [ ] SSL 证书已配置
- [ ] GitHub Secrets 已添加
- [ ] GitHub Actions 工作流文件存在
- [ ] 域名已解析到服务器 IP

详细清单请查看：[docs/GITHUB_ACTIONS_CHECKLIST.md](docs/GITHUB_ACTIONS_CHECKLIST.md)

---

## 📚 文档使用指南

### 首次配置用户
1. 阅读：[docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md](docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md)
2. 按照：[docs/GITHUB_ACTIONS_CHECKLIST.md](docs/GITHUB_ACTIONS_CHECKLIST.md) 逐项检查
3. 运行：`bash scripts/verify-deploy-setup.sh` 验证配置

### 日常运维人员
1. 保存：[docs/DEPLOYMENT_QUICK_REFERENCE.md](docs/DEPLOYMENT_QUICK_REFERENCE.md) 供快速查询
2. 使用：常用运维命令管理服务
3. 定期：检查服务器状态和日志

### 问题排查
1. 查看：[docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md#故障排查](docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md#故障排查)
2. 使用：[docs/DEPLOYMENT_QUICK_REFERENCE.md](docs/DEPLOYMENT_QUICK_REFERENCE.md) 的诊断流程
3. SSH 登录服务器检查日志

---

## 🔗 快速链接

### 文档
- [GitHub Actions 部署指南](docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md)
- [部署检查清单](docs/GITHUB_ACTIONS_CHECKLIST.md)
- [快速参考卡片](docs/DEPLOYMENT_QUICK_REFERENCE.md)
- [部署文档索引](docs/DEPLOYMENT_INDEX.md)
- [部署总览](deploy/README.md)

### 工具
- [配置验证脚本](scripts/verify-deploy-setup.sh)
- [一键部署脚本](scripts/deploy-to-tencent.sh)
- [GitHub Actions 工作流](.github/workflows/deploy.yml)

---

## 📞 需要帮助？

### 常见问题

**Q: SSH 连接失败怎么办？**
A: 检查公钥是否正确添加到服务器，检查防火墙是否开放 22 端口

**Q: 部署卡在某个 Job？**
A: 查看 GitHub Actions 日志，检查错误信息，修复后重新推送代码

**Q: 服务无法启动？**
A: SSH 登录服务器，查看容器日志，检查环境变量配置

**Q: HTTPS 不工作？**
A: 检查 SSL 证书是否存在，检查证书有效期，重启 Nginx

详细问题排查请参考：[docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md#故障排查](docs/GITHUB_ACTIONS_DEPLOY_GUIDE.md#故障排查)

---

## 🎯 下一步

1. **验证配置**：运行 `bash scripts/verify-deploy-setup.sh`
2. **首次部署**：推送代码触发自动部署
3. **监控部署**：在 GitHub Actions 查看部署进度
4. **验证结果**：检查服务是否正常运行
5. **保存文档**：收藏快速参考卡片供日常使用

---

## 💡 提示

- 首次部署建议在测试环境先验证
- 定期备份重要数据和配置
- 关注 GitHub Actions 的部署日志
- 保存快速参考卡片供日常使用
- 定期更新 SSL 证书

---

**祝您部署顺利！** 🎉

如有问题，请查看相关文档或运行验证脚本进行诊断。
