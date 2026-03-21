# GitHub Actions 部署快速参考卡片

## 🚀 触发部署

### 自动部署（推荐）
```bash
git add .
git commit -m "feat: 描述您的更改"
git push origin main
```

### 手动触发
1. GitHub 仓库 > Actions > CI/CD Pipeline
2. 点击 "Run workflow"
3. 选择分支和环境
4. 点击 "Run workflow"

---

## 📊 查看部署状态

### GitHub Actions 页面
```
仓库地址 > Actions > 选择最新运行 > 查看各个 Job
```

### 服务器端检查
```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 查看容器状态
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml ps

# 查看服务日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f api-gateway

# 查看所有服务日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f
```

---

## 🔧 常用运维命令

### 服务管理
```bash
# 重启所有服务
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml restart

# 重启特定服务
sudo docker restart one-recycle-api-gateway

# 停止所有服务
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml down

# 启动所有服务
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml up -d

# 查看资源使用
sudo docker stats --no-stream
```

### 日志查看
```bash
# API Gateway 日志
sudo docker logs one-recycle-api-gateway -f --tail 100

# 数据库日志
sudo docker logs one-recycle-postgres -f --tail 100

# Nginx 日志
sudo docker logs one-recycle-nginx -f --tail 100

# 查看所有容器日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs
```

### 数据库操作
```bash
# 执行数据库迁移
sudo docker exec one-recycle-api-gateway npx prisma migrate deploy

# 进入数据库
sudo docker exec -it one-recycle-postgres psql -U one_recycle -d one_recycle

# 备份数据库
sudo docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > backup.sql

# 恢复数据库
cat backup.sql | sudo docker exec -i one-recycle-postgres psql -U one_recycle one_recycle
```

### Redis 操作
```bash
# 进入 Redis CLI
sudo docker exec -it one-recycle-redis redis-cli -a <REDIS_PASSWORD>

# 清空 Redis 缓存
sudo docker exec -it one-recycle-redis redis-cli -a <REDIS_PASSWORD> FLUSHALL
```

---

## 📝 环境变量配置

### 服务器端配置文件
```bash
ssh ubuntu@<服务器IP>
nano /opt/one-recycle/deploy/config/.env.production
```

### 重启服务使配置生效
```bash
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml restart
```

---

## 🔒 SSL 证书管理

### 查看证书有效期
```bash
openssl x509 -in /opt/one-recycle/deploy/nginx/ssl/fullchain.pem -noout -dates
```

### 续期 Let's Encrypt 证书
```bash
sudo certbot renew --quiet
sudo cp /etc/letsencrypt/live/backbuy.cn/fullchain.pem /opt/one-recycle/deploy/nginx/ssl/
sudo cp /etc/letsencrypt/live/backbuy.cn/privkey.pem /opt/one-recycle/deploy/nginx/ssl/
sudo docker restart one-recycle-nginx
```

---

## 🚨 故障排查

### 服务无法启动
```bash
# 查看容器状态
sudo docker ps -a

# 查看容器日志
sudo docker logs <container_name>

# 重启容器
sudo docker restart <container_name>
```

### 端口被占用
```bash
# 查看端口占用
sudo netstat -tlnp | grep <port>

# 停止占用端口的进程
sudo kill -9 <pid>
```

### 磁盘空间不足
```bash
# 查看磁盘使用
df -h

# 清理 Docker 资源
sudo docker system prune -a --volumes

# 清理旧镜像
sudo docker image prune -af --filter "until=168h"
```

### 内存不足
```bash
# 查看内存使用
free -h

# 查看进程内存占用
sudo ps aux --sort=-%mem | head -10

# 重启高内存消耗的容器
sudo docker restart <container_name>
```

---

## 📦 备份与恢复

### 数据库备份
```bash
# 创建备份
BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).sql"
sudo docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > $BACKUP_NAME

# 上传到云存储（可选）
# 使用您偏好的云存储工具上传备份文件
```

### 配置文件备份
```bash
# 备份环境变量
cp /opt/one-recycle/deploy/config/.env.production /opt/one-recycle/deploy/config/.env.production.backup

# 备份 Nginx 配置
cp /opt/one-recycle/deploy/nginx/nginx.conf /opt/one-recycle/deploy/nginx/nginx.conf.backup
```

### 恢复备份
```bash
# 恢复数据库
cat backup.sql | sudo docker exec -i one-recycle-postgres psql -U one_recycle one_recycle

# 恢复环境变量
cp /opt/one-recycle/deploy/config/.env.production.backup /opt/one-recycle/deploy/config/.env.production

# 重启服务
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml restart
```

---

## 🔍 健康检查

### API 健康检查
```bash
# 检查 API Gateway
curl http://localhost:3002/health

# 检查所有服务
for service in api-gateway account-service order-service; do
  echo "Checking $service..."
  curl -f http://localhost:$(docker port one-recycle-$service | grep -oP '0.0.0.0:\K\d+')/health || echo "Failed"
done
```

### HTTPS 检查
```bash
# 检查 HTTPS 连接
curl -I https://api.backbuy.cn/health

# 检查 SSL 证书
openssl s_client -connect api.backbuy.cn:443 -servername api.backbuy.cn </dev/null
```

---

## 📈 性能监控

### 查看资源使用
```bash
# 实时监控
sudo docker stats

# 快照查看
sudo docker stats --no-stream

# 查看特定容器
sudo docker stats one-recycle-api-gateway --no-stream
```

### 查看日志级别
```bash
# 查看错误日志
sudo docker logs one-recycle-api-gateway 2>&1 | grep -i error

# 查看警告日志
sudo docker logs one-recycle-api-gateway 2>&1 | grep -i warn

# 统计错误数量
sudo docker logs one-recycle-api-gateway 2>&1 | grep -i error | wc -l
```

---

## 🔐 安全检查

### 检查开放端口
```bash
sudo netstat -tlnp | grep LISTEN
```

### 检查失败的登录尝试
```bash
sudo grep "Failed password" /var/log/auth.log | tail -20
```

### 检查防火墙状态
```bash
sudo ufw status verbose
```

---

## 📞 获取帮助

### 查看文档
- [GitHub Actions 部署指南](./GITHUB_ACTIONS_DEPLOY_GUIDE.md)
- [部署检查清单](./GITHUB_ACTIONS_CHECKLIST.md)
- [部署总览](../deploy/README.md)

### 运行验证脚本
```bash
bash scripts/verify-deploy-setup.sh
```

---

## 🎯 快速问题诊断

### 问题：部署卡在某个 Job
**解决方案：**
1. 取消工作流运行
2. 检查 GitHub Actions 日志
3. 修复问题后重新推送代码

### 问题：服务启动失败
**解决方案：**
1. SSH 登录服务器
2. 查看容器日志：`sudo docker logs <container_name>`
3. 检查环境变量配置
4. 重启服务：`sudo docker restart <container_name>`

### 问题：HTTPS 不工作
**解决方案：**
1. 检查 SSL 证书是否存在
2. 检查证书有效期
3. 检查 Nginx 配置
4. 重启 Nginx：`sudo docker restart one-recycle-nginx`

### 问题：数据库连接失败
**解决方案：**
1. 检查数据库容器状态：`sudo docker ps | grep postgres`
2. 检查数据库日志：`sudo docker logs one-recycle-postgres`
3. 检查数据库连接字符串
4. 测试数据库连接：`sudo docker exec -it one-recycle-postgres psql -U one_recycle -d one_recycle`

---

## 📝 常用命令速查

| 操作 | 命令 |
|------|------|
| 查看所有容器 | `sudo docker ps -a` |
| 查看容器日志 | `sudo docker logs <name> -f` |
| 重启容器 | `sudo docker restart <name>` |
| 停止容器 | `sudo docker stop <name>` |
| 进入容器 | `sudo docker exec -it <name> sh` |
| 查看资源使用 | `sudo docker stats` |
| 清理 Docker | `sudo docker system prune -a` |
| 数据库备份 | `sudo docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > backup.sql` |

---

## 🔄 部署流程图

```
本地开发
    ↓
git push origin main
    ↓
GitHub Actions 触发
    ├─ 代码质量检查
    ├─ 单元测试
    ├─ 构建 Docker 镜像
    ├─ 部署到服务器
    │   ├─ 备份当前版本
    │   ├─ 上传新代码
    │   ├─ 更新镜像
    │   ├─ 重启服务
    │   └─ 执行迁移
    ├─ 健康检查
    └─ E2E 测试（可选）
    ↓
部署完成 ✅
```

---

**最后更新：2025-03-21**
