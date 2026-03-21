# 部署文档索引

本文档提供所有部署相关文档的快速导航。

---

## 📚 文档目录

### GitHub Actions 自动部署

适合生产环境和团队协作使用。

| 文档 | 说明 | 适合人群 |
|------|------|----------|
| [GitHub Actions 部署指南](./GITHUB_ACTIONS_DEPLOY_GUIDE.md) | 完整的配置步骤和故障排查 | 首次配置、运维人员 |
| [部署检查清单](./GITHUB_ACTIONS_CHECKLIST.md) | 详细的配置检查项清单 | 首次部署、问题排查 |
| [快速参考卡片](./DEPLOYMENT_QUICK_REFERENCE.md) | 常用命令和快速操作指南 | 日常运维、问题处理 |

### Docker 部署

适合快速部署和开发测试。

| 文档 | 说明 | 适合人群 |
|------|------|----------|
| [部署总览](../deploy/README.md) | 部署目录结构和快速开始 | 所有用户 |
| [详细部署指南](../deploy/docs/DEPLOY.md) | 完整的部署步骤和配置说明 | 详细部署、问题排查 |

### 服务器脚本

| 脚本 | 说明 | 使用方式 |
|------|------|----------|
| [verify-deploy-setup.sh](../scripts/verify-deploy-setup.sh) | 部署前配置验证 | `bash scripts/verify-deploy-setup.sh` |
| [deploy-to-tencent.sh](../scripts/deploy-to-tencent.sh) | 一键部署到腾讯云 | `bash scripts/deploy-to-tencent.sh -i <IP>` |
| [deploy.sh](../deploy/scripts/deploy.sh) | 服务器端部署脚本 | 在服务器上执行 |
| [init-server.sh](../deploy/scripts/init-server.sh) | 服务器初始化脚本 | 在服务器上执行 |

---

## 🚀 推荐部署流程

### 首次部署（GitHub Actions）

```
1. 阅读 [GitHub Actions 部署指南](./GITHUB_ACTIONS_DEPLOY_GUIDE.md)
   ↓
2. 使用 [部署检查清单](./GITHUB_ACTIONS_CHECKLIST.md) 逐项检查
   ↓
3. 运行验证脚本: bash scripts/verify-deploy-setup.sh
   ↓
4. 配置 GitHub Secrets
   ↓
5. 推送代码触发首次部署
   ↓
6. 查看 GitHub Actions 部署进度
   ↓
7. 部署成功后保存 [快速参考卡片](./DEPLOYMENT_QUICK_REFERENCE.md)
```

### 日常更新

```bash
# 修改代码
git add .
git commit -m "feat: 新功能"
git push origin main

# 自动触发部署，无需手动操作
```

### 问题排查

```
1. 查看部署日志（GitHub Actions）
   ↓
2. 使用 [快速参考卡片](./DEPLOYMENT_QUICK_REFERENCE.md) 查找解决方案
   ↓
3. SSH 登录服务器检查
   ↓
4. 参考 [故障排查](./GITHUB_ACTIONS_DEPLOY_GUIDE.md#故障排查)
```

---

## 📋 文档使用建议

### 新用户

1. 先阅读 [GitHub Actions 部署指南](./GITHUB_ACTIONS_DEPLOY_GUIDE.md) 了解整体流程
2. 按照 [部署检查清单](./GITHUB_ACTIONS_CHECKLIST.md) 逐项配置
3. 运行验证脚本确保配置正确
4. 触发首次部署

### 运维人员

1. 保存 [快速参考卡片](./DEPLOYMENT_QUICK_REFERENCE.md) 供日常使用
2. 熟悉常用运维命令
3. 定期检查服务器状态和日志

### 问题排查

1. 查看 [故障排查](./GITHUB_ACTIONS_DEPLOY_GUIDE.md#故障排查) 部分
2. 使用快速参考卡片的诊断流程
3. 查看服务器日志分析问题

---

## 🔍 快速查找

### 我想...

- **了解部署方式** → [部署总览](../deploy/README.md)
- **使用 GitHub Actions 部署** → [GitHub Actions 部署指南](./GITHUB_ACTIONS_DEPLOY_GUIDE.md)
- **检查配置是否正确** → [部署检查清单](./GITHUB_ACTIONS_CHECKLIST.md)
- **查看常用命令** → [快速参考卡片](./DEPLOYMENT_QUICK_REFERENCE.md)
- **解决部署问题** → [故障排查](./GITHUB_ACTIONS_DEPLOY_GUIDE.md#故障排查)
- **使用一键部署脚本** → [deploy-to-tencent.sh](../scripts/deploy-to-tencent.sh)
- **手动部署** → [详细部署指南](../deploy/docs/DEPLOY.md)
- **初始化服务器** → [init-server.sh](../deploy/scripts/init-server.sh)

### 遇到...

- **SSH 连接失败** → [故障排查 - SSH 连接](./GITHUB_ACTIONS_DEPLOY_GUIDE.md#1-ssh-连接失败)
- **服务无法启动** → [故障排查 - 服务无法启动](./GITHUB_ACTIONS_DEPLOY_GUIDE.md#5-服务无法启动)
- **SSL 证书问题** → [故障排查 - SSL 证书问题](./GITHUB_ACTIONS_DEPLOY_GUIDE.md#4-ssl-证书问题)
- **健康检查失败** → [故障排查 - 健康检查失败](./GITHUB_ACTIONS_DEPLOY_GUIDE.md#6-健康检查失败)
- **Docker 构建失败** → [故障排查 - Docker 构建](./GITHUB_ACTIONS_DEPLOY_GUIDE.md#2-docker-构建失败)

---

## 📞 获取帮助

### 文档资源

- [项目 README](../README.md)
- [GitHub Actions 部署指南](./GITHUB_ACTIONS_DEPLOY_GUIDE.md)
- [部署检查清单](./GITHUB_ACTIONS_CHECKLIST.md)
- [快速参考卡片](./DEPLOYMENT_QUICK_REFERENCE.md)
- [部署总览](../deploy/README.md)
- [详细部署指南](../deploy/docs/DEPLOY.md)

### 验证工具

```bash
# 验证部署配置
bash scripts/verify-deploy-setup.sh

# 查看部署脚本帮助
bash scripts/deploy-to-tencent.sh --help
```

### 常用命令

```bash
# 查看服务器状态
ssh ubuntu@<服务器IP> "sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml ps"

# 查看服务日志
ssh ubuntu@<服务器IP> "sudo docker logs one-recycle-api-gateway -f"

# 重启服务
ssh ubuntu@<服务器IP> "sudo docker restart one-recycle-api-gateway"
```

---

## 📝 文档更新记录

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-03-21 | v1.0 | 创建 GitHub Actions 自动部署文档 |

---

## 💡 提示

1. **首次部署前**：务必运行验证脚本确保配置正确
2. **日常运维**：保存快速参考卡片供快速查询
3. **遇到问题**：先查看故障排查部分，常见问题都有解决方案
4. **定期备份**：建议配置自动备份策略
5. **安全注意**：定期更新密码和证书

---

**祝您部署顺利！** 🎉
