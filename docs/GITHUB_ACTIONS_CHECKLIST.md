# GitHub Actions 自动部署快速检查清单

使用本清单确保所有配置正确后再触发首次部署。

---

## ✅ 阶段 1: 本地环境检查

- [ ] 已安装 Node.js 22+
  ```bash
  node --version
  ```

- [ ] 已安装 Git
  ```bash
  git --version
  ```

- [ ] 已安装 SSH 客户端
  ```bash
  ssh -V
  ```

- [ ] 可以正常访问 GitHub
  ```bash
  curl -I https://github.com
  ```

---

## ✅ 阶段 2: 服务器环境检查

- [ ] 服务器 IP 地址已确认
  ```bash
  # 记录您的服务器 IP
  SERVER_IP="___________"
  ```

- [ ] 可以 SSH 登录服务器
  ```bash
  ssh ubuntu@<服务器IP>
  ```

- [ ] Docker 已安装
  ```bash
  ssh ubuntu@<服务器IP> "docker --version"
  ```

- [ ] Docker Compose 已安装
  ```bash
  ssh ubuntu@<服务器IP> "docker-compose --version"
  ```

- [ ] 防火墙已开放端口（22, 80, 443）
  ```bash
  ssh ubuntu@<服务器IP> "sudo ufw status"
  ```

- [ ] 磁盘空间充足（至少 20GB）
  ```bash
  ssh ubuntu@<服务器IP> "df -h"
  ```

---

## ✅ 阶段 3: SSH 密钥配置

- [ ] 已生成 SSH 密钥对
  ```bash
  ls -la ~/.ssh/github_actions_2025
  ```

- [ ] 公钥已添加到服务器
  ```bash
  ssh ubuntu@<服务器IP> "cat ~/.ssh/authorized_keys | grep github-actions"
  ```

- [ ] 可以使用新密钥登录服务器
  ```bash
  ssh -i ~/.ssh/github_actions_2025 ubuntu@<服务器IP>
  ```

- [ ] 私钥内容已复制（用于 GitHub Secrets）
  ```bash
  cat ~/.ssh/github_actions_2025
  # 复制完整内容，包括 BEGIN 和 END 行
  ```

---

## ✅ 阶段 4: 服务器目录配置

- [ ] 已创建项目目录
  ```bash
  ssh ubuntu@<服务器IP> "ls -la /opt/one-recycle"
  ```

- [ ] 已创建备份目录
  ```bash
  ssh ubuntu@<服务器IP> "ls -la /opt/backups"
  ```

- [ ] 目录权限正确
  ```bash
  ssh ubuntu@<服务器IP> "ls -la /opt | grep one-recycle"
  # 应显示: drwxr-xr-x
  ```

---

## ✅ 阶段 5: 环境变量配置

- [ ] 已创建环境变量文件
  ```bash
  ssh ubuntu@<服务器IP> "cat /opt/one-recycle/deploy/config/.env.production"
  ```

- [ ] 数据库密码已设置（强密码）
  ```bash
  DB_PASSWORD=_________________________
  ```

- [ ] Redis 密码已设置（强密码）
  ```bash
  REDIS_PASSWORD=_______________________
  ```

- [ ] JWT_SECRET 已设置（至少32位）
  ```bash
  JWT_SECRET=_________________________
  ```

- [ ] 微信小程序 AppID 已配置
  ```bash
  WECHAT_APP_ID=______________________
  ```

- [ ] 微信小程序 Secret 已配置
  ```bash
  WECHAT_APP_SECRET=__________________
  ```

- [ ] 腾讯云 SecretID 已配置
  ```bash
  TENCENT_SECRET_ID=___________________
  ```

- [ ] 腾讯云 SecretKey 已配置
  ```bash
  TENCENT_SECRET_KEY=_________________
  ```

---

## ✅ 阶段 6: SSL 证书配置

- [ ] 域名已解析到服务器 IP
  ```bash
  dig +short backbuy.cn
  # 应返回服务器 IP
  ```

- [ ] SSL 证书文件存在
  ```bash
  ssh ubuntu@<服务器IP> "ls -la /opt/one-recycle/deploy/nginx/ssl/"
  # 应显示: fullchain.pem, privkey.pem
  ```

- [ ] 证书有效期正确
  ```bash
  ssh ubuntu@<服务器IP> "openssl x509 -in /opt/one-recycle/deploy/nginx/ssl/fullchain.pem -noout -dates"
  # 检查 notAfter 日期是否在未来
  ```

- [ ] 证书权限正确
  ```bash
  ssh ubuntu@<服务器IP> "ls -la /opt/one-recycle/deploy/nginx/ssl/"
  # fullchain.pem: -rw-r--r-- (644)
  # privkey.pem: -rw------- (600)
  ```

---

## ✅ 阶段 7: GitHub 配置

- [ ] GitHub 仓库已创建
  ```
  https://github.com/<username>/<repo>
  ```

- [ ] 代码已推送到 GitHub
  ```bash
  git remote -v
  git push origin main
  ```

- [ ] GitHub Actions 已启用
  ```
  Settings > Actions > General > Actions permissions
  ```

---

## ✅ 阶段 8: GitHub Secrets 配置

- [ ] TENCENT_SERVER_IP 已添加
  ```
  Settings > Secrets and variables > Actions
  值: 123.456.789.0
  ```

- [ ] TENCENT_SSH_KEY 已添加
  ```
  Settings > Secrets and variables > Actions
  值: 完整的私钥内容（包括 BEGIN 和 END 行）
  ```

- [ ] TENCENT_SSH_USER 已添加
  ```
  Settings > Secrets and variables > Actions
  值: ubuntu
  ```

- [ ] TENCENT_SSH_PORT 已添加
  ```
  Settings > Secrets and variables > Actions
  值: 22
  ```

---

## ✅ 阶段 9: GitHub Actions 工作流检查

- [ ] deploy.yml 文件存在
  ```
  .github/workflows/deploy.yml
  ```

- [ ] pr-check.yml 文件存在
  ```
  .github/workflows/pr-check.yml
  ```

- [ ] 工作流文件语法正确
  ```
  在 GitHub Actions 标签下检查是否有语法错误
  ```

---

## ✅ 阶段 10: 首次部署前测试

- [ ] 本地测试可以拉取代码
  ```bash
  git clone https://github.com/<username>/<repo>.git
  ```

- [ ] 本地可以构建项目
  ```bash
  cd server
  npm install
  npm run build
  ```

- [ ] 本地可以通过 SSH 连接服务器
  ```bash
  ssh -i ~/.ssh/github_actions_2025 ubuntu@<服务器IP> "echo 'Connection successful'"
  ```

---

## 🚀 准备就绪！

如果以上所有项目都已检查完成，现在可以触发首次部署了！

### 首次部署步骤

1. **推送代码触发部署**
   ```bash
   git add .
   git commit -m "feat: 初始化生产环境部署"
   git push origin main
   ```

2. **查看部署进度**
   - 打开 GitHub 仓库页面
   - 点击 **Actions** 标签
   - 查看最新的工作流运行

3. **等待部署完成**
   - 通常需要 10-15 分钟
   - 包括测试、构建、部署、健康检查

4. **验证部署结果**
   ```bash
   # 检查 API 服务
   curl https://api.backbuy.cn/health
   
   # 检查主站
   curl https://backbuy.cn
   
   # 检查管理后台
   curl https://admin.backbuy.cn
   ```

---

## 📝 配置信息汇总

请在首次部署前记录以下信息：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OneRecycle GitHub Actions 部署配置信息
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

服务器信息:
  服务器 IP: _________________
  SSH 用户: ubuntu
  SSH 端口: 22
  操作系统: Ubuntu 22.04 LTS

域名信息:
  主域名: backbuy.cn
  API 域名: api.backbuy.cn
  管理后台: admin.backbuy.cn

GitHub 仓库:
  仓库地址: https://github.com/_______/_______
  主要分支: main / master

SSH 密钥:
  密钥路径: ~/.ssh/github_actions_2025
  公钥指纹: _______________

数据库配置:
  数据库名: one_recycle
  用户名: one_recycle
  密码: _________________________
  主机: postgres
  端口: 5432

Redis 配置:
  主机: redis
  端口: 6379
  密码: _________________________

JWT 配置:
  Secret: _________________________
  过期时间: 7天

微信小程序:
  AppID: _________________________
  Secret: ________________________

腾讯云:
  SecretID: ______________________
  SecretKey: ____________________

访问地址:
  主站: https://backbuy.cn
  API: https://api.backbuy.cn
  管理后台: https://admin.backbuy.cn

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚠️ 常见错误预检

### 如果遇到以下错误，请提前解决：

1. **SSH 连接失败**
   - 检查: 公钥是否正确添加到服务器
   - 检查: 服务器防火墙是否开放 22 端口

2. **Docker 构建失败**
   - 检查: server/Dockerfile 文件是否存在
   - 检查: Dockerfile 语法是否正确

3. **环境变量缺失**
   - 检查: .env.production 文件是否完整
   - 检查: 所有必需的变量是否已设置

4. **SSL 证书无效**
   - 检查: 证书文件是否存在
   - 检查: 证书有效期是否未过期
   - 检查: 域名解析是否正确

5. **健康检查失败**
   - 检查: 服务是否正常启动
   - 检查: Nginx 配置是否正确
   - 检查: 端口是否正常监听

---

## 📞 需要帮助？

如果遇到问题，请参考：

1. [详细部署指南](./GITHUB_ACTIONS_DEPLOY_GUIDE.md)
2. [部署总览](../deploy/README.md)
3. [故障排查](./GITHUB_ACTIONS_DEPLOY_GUIDE.md#故障排查)

---

**祝您部署顺利！** 🎉
