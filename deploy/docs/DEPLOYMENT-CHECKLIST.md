# 部署检查清单

## ✅ 部署前检查

### 1. 环境配置

- [ ] 复制配置文件
  ```bash
  cp deploy/config/.env.production.example deploy/config/.env.production
  ```

- [ ] 修改数据库密码
  ```bash
  # 编辑 .env.production
  DB_PASSWORD=<your-strong-password>
  REDIS_PASSWORD=<your-strong-redis-password>
  ```

- [ ] 修改JWT密钥
  ```bash
  JWT_SECRET=<your-strong-jwt-secret-with-special-characters>
  ```

- [ ] 配置CORS域名
  ```bash
  CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
  ```

### 3. 域名配置

- [ ] DNS解析配置
  ```
  backbuy.cn        A    <your-server-ip>
  www.backbuy.cn    A    <your-server-ip>
  api.backbuy.cn    A    <your-server-ip>
  admin.backbuy.cn  A    <your-server-ip>
  ```

- [ ] 验证DNS解析
  ```bash
  dig backbuy.cn
  dig api.backbuy.cn
  dig admin.backbuy.cn
  ```

### 4. 服务器配置

- [ ] 开放端口
  ```
  80   - HTTP
  443  - HTTPS
  22   - SSH
  ```

- [ ] 安装Docker和Docker Compose
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  ```

---

## 🚀 部署步骤

### 1. 上传代码到服务器

```bash
# 方法A: 使用rsync
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ ubuntu@your-server-ip:/opt/one-recycle/

# 方法B: 使用git
ssh ubuntu@your-server-ip
cd /opt
git clone <your-repo-url> one-recycle
```

### 2. 配置环境变量

```bash
ssh ubuntu@your-server-ip
cd /opt/one-recycle/deploy/config
cp .env.production.example .env.production
nano .env.production  # 编辑配置
```

### 3. 启动服务

```bash
cd /opt/one-recycle/deploy
docker compose -f docker/docker-compose.production.yml up -d
```

### 4. 检查服务状态

```bash
# 查看所有服务状态
docker compose -f docker/docker-compose.production.yml ps

# 查看日志
docker compose -f docker/docker-compose.production.yml logs -f api-gateway
docker compose -f docker/docker-compose.production.yml logs -f caddy
```

---

## ✅ 部署后验证

### 1. 服务健康检查

```bash
# 检查API健康状态
curl http://localhost:3002/api/health

# 检查Caddy健康状态
curl http://localhost:2019/config/

# 检查HTTPS
curl https://api.backbuy.cn/health
curl https://admin.backbuy.cn
```

### 2. SSL证书验证

```bash
# 检查证书信息
openssl s_client -connect api.backbuy.cn:443 -servername api.backbuy.cn

# 检查证书有效期
openssl x509 -in /opt/one-recycle/deploy/ssl/live/backbuy.cn/fullchain.pem -noout -dates
```

### 3. CORS配置验证

```bash
# 测试CORS
curl -I -H "Origin: https://backbuy.cn" \
     -H "Access-Control-Request-Method: POST" \
     https://api.backbuy.cn/api/health

# 应该看到：
# Access-Control-Allow-Origin: https://backbuy.cn
```

### 4. 数据库连接验证

```bash
# 进入api-gateway容器
docker exec -it one-recycle-api-gateway sh

# 测试数据库连接
npx prisma db push --skip-generate
```

---

## 🔧 常见问题排查

### 问题1: 服务无法启动

```bash
# 查看详细日志
docker compose -f docker/docker-compose.production.yml logs api-gateway

# 检查容器状态
docker ps -a

# 重启特定服务
docker compose -f docker/docker-compose.production.yml restart api-gateway
```

### 问题2: 数据库连接失败

```bash
# 检查postgres状态
docker logs one-recycle-postgres

# 测试数据库连接
docker exec -it one-recycle-postgres psql -U one_recycle -d one_recycle

# 检查网络
docker network inspect one-recycle-network
```

---

## 📊 监控设置

### 1. 设置日志轮转

```bash
# 创建日志轮转配置
sudo cat > /etc/logrotate.d/one-recycle << EOF
/var/log/one-recycle.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
EOF
```

---

## 📝 维护任务

### 每日检查
- [ ] 查看服务状态
- [ ] 检查错误日志

### 每周检查
- [ ] 查看资源使用情况
- [ ] 备份数据库

### 每月检查
- [ ] 更新依赖包
- [ ] 检查安全更新
- [ ] 审查访问日志

---

## 🎯 性能优化建议

1. **启用HTTP/2**: 已在Caddy配置中启用
2. **启用Gzip压缩**: 已在Caddy配置中启用
3. **配置CDN**: 建议使用腾讯云CDN
4. **数据库优化**: 定期执行VACUUM和ANALYZE
5. **Redis优化**: 配置合适的maxmemory策略

---

## 📞 技术支持

遇到问题时，请收集以下信息：
1. 错误日志：`docker logs <container-name>`
2. 服务状态：`docker compose ps`
3. 系统资源：`htop` 或 `docker stats`
4. 网络连接：`docker network inspect one-recycle-network`
