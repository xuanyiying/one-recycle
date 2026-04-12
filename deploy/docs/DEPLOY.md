# OneRecycle 生产环境部署指南

## 域名: backbuy.cn（官网 / admin / api）

---

## 目录
1. [🎯 最终购买方案（推荐）](#最终购买方案推荐)
2. [云服务厂商对比](#云服务厂商对比)
3. [动态扩容方案](#动态扩容方案)
4. [部署方式选择](#部署方式选择)
5. [部署步骤](#部署步骤)
6. [运维命令](#运维命令)
7. [监控和告警](#监控和告警)
8. [故障排查](#故障排查)

---

## 🎯 最终购买方案（推荐）

### 方案概述
**适用场景**：初创项目，日活用户 < 1000，订单量 < 500/天  
**购买周期**：1年（享受最大折扣）  
**架构特点**：数据库和Redis自建在服务器上，成本更低  
**总预算**：**约 ¥746/年**（月均 ¥62）

### 推荐配置清单

| 组件 | 厂商 | 配置 | 年费用 |
|------|------|------|--------|
| **云服务器** | 腾讯云 | 4核8G 6M带宽 100GB SSD | **¥166** |
| **对象存储** | 腾讯云 | COS 50GB | **~¥150** |
| **域名** | 腾讯云 | .cn 1年 | **¥35** |
| **SSL证书** | Let's Encrypt | 免费 DV SSL | **¥0** |
| **短信服务** | 腾讯云 | 1万条 | **¥375** |
| **总计** | - | - | **~¥726** |

### 服务器自建服务规划

服务器配置：4核8G 100GB SSD + 6M带宽

```
┌─────────────────────────────────────────┐
│              服务器 (4核8G)              │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Nginx     │  │   Docker    │      │
│  │  反向代理   │  │   容器引擎   │      │
│  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  PostgreSQL │  │    Redis   │      │
│  │   数据库    │  │    缓存     │      │
│  └─────────────┘  └─────────────┘      │
│  ┌─────────────────────────────────┐   │
│  │      微服务容器 (8个)            │   │
│  │  API Gateway / Account / Order  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 购买步骤

#### Step 1: 注册腾讯云账号
```
1. 访问 https://cloud.tencent.com
2. 使用微信扫码注册
3. 完成实名认证
```

#### Step 2: 购买轻量应用服务器
```
产品页面: https://buy.cloud.tencent.com/lighthouse
配置: 4核8G 6M带宽 100GB SSD
系统: Ubuntu 22.04 LTS
时长: 1年
价格: ¥166（新用户专享）
```

#### Step 3: 开通对象存储 COS
```
产品页面: https://console.cloud.tencent.com/cos
创建存储桶，地域与服务器相同（如广州）
```

#### Step 4: 购买域名
```
产品页面: https://dnspod.cloud.tencent.com
域名: backbuy.cn
价格: ~¥35/年
```

#### Step 5: 配置 DNS 解析
在 DNSPod 中添加以下解析记录：

| 主机记录 | 记录类型 | 记录值 | 说明 |
|----------|----------|--------|------|
| @ | A | 服务器公网IP | 官网/小程序端 |
| www | A | 服务器公网IP | 重定向到根域名 |
| api | A | 服务器公网IP | API服务 |
| admin | A | 服务器公网IP | 管理后台 |

---

## 云服务厂商对比

### 综合对比表

| 对比项 | 阿里云 | 腾讯云 | 华为云 | 推荐 |
|--------|--------|--------|--------|------|
| **轻量服务器(4核8G)** | ¥632/年 | ¥166/年 | ¥398/年 | 腾讯云 |
| **对象存储** | ¥0.12/GB/月 | ¥0.118/GB/月 | ¥0.115/GB/月 | 华为云 |
| **生态集成** | 微信弱 | 微信强 | 中立 | 腾讯云 |

### 分阶段推荐

| 阶段 | 配置 | 月成本 |
|------|------|--------|
| 初创期 | 4核8G 自建DB/Redis | ~¥62 |
| 成长期 | 8核16G | ~¥200 |
| 规模化 | 2台服务器 + 负载均衡 | ~¥400 |

---

## 动态扩容方案

### 扩容路径

```
阶段一: 1台服务器 (4核8G)
  - 自建 PostgreSQL + Redis
  - 日活 < 5000

阶段二: 2台服务器 (4核8G × 2)
  - 服务器1: PostgreSQL主库 + 部分服务
  - 服务器2: Redis + 部分服务
  - 日活 5000-10000

阶段三: 3+台服务器
  - Docker Swarm 或 Kubernetes
  - 数据库独立部署
```

---

## 部署方式选择

本项目提供三种部署方式：

| 部署方式 | 适用场景 | 复杂度 | 自动化程度 |
|----------|----------|--------|------------|
| **方式一: 本地一键部署脚本** | 开发测试、快速部署 | ⭐⭐ | 高 |
| **方式二: GitHub Actions 自动部署** | 生产环境、团队协作 | ⭐⭐⭐ | 最高 |
| **方式三: 手动部署** | 学习调试、问题排查 | ⭐⭐⭐⭐ | 低 |

### 方式一: 本地一键部署脚本（推荐）

适合快速部署到测试环境或生产环境。

**优点**:
- 一键完成测试、构建、备份、部署
- 支持命令行参数自定义
- 自动健康检查

**使用方法**:
```bash
# 基本部署
./scripts/deploy-to-tencent.sh -i <服务器IP>

# 使用 SSH 密钥
./scripts/deploy-to-tencent.sh -i <服务器IP> -k ~/.ssh/id_rsa

# 快速部署（跳过测试和备份）
./scripts/deploy-to-tencent.sh -i <服务器IP> --skip-tests --skip-backup
```

### 方式二: GitHub Actions 自动部署

适合团队协作的生产环境部署。

**优点**:
- 代码推送自动触发部署
- PR 合并前自动测试
- 完整的 CI/CD 流程

**配置步骤**:
1. 在 GitHub Secrets 中配置服务器信息
2. 推送代码到 main 分支自动触发部署
3. 查看 Actions 日志监控部署状态

详见: [.github/workflows/README.md](../.github/workflows/README.md)

### 方式三: 手动部署

适合学习调试或问题排查。

**步骤**:
1. 服务器初始化
2. 上传部署文件
3. 配置环境变量
4. 配置 SSL 证书
5. 启动服务

详见下文"部署步骤"章节。

---

## 部署步骤

### 前置准备

1. **购买服务器**（参考上文推荐配置）
2. **配置安全组**：开放 22(SSH)、80(HTTP)、443(HTTPS) 端口
3. **配置 DNS 解析**：将域名指向服务器 IP

### 方式一: 一键部署脚本

```bash
# 1. 确保本地可以 SSH 连接到服务器
ssh ubuntu@<服务器IP>

# 2. 执行一键部署
./scripts/deploy-to-tencent.sh -i <服务器IP>

# 3. 根据提示完成部署
```

### 方式二: GitHub Actions 自动部署

```bash
# 1. 配置 GitHub Secrets（只需一次）
# - TENCENT_SERVER_IP: 服务器 IP
# - TENCENT_SSH_KEY: SSH 私钥
# - TENCENT_SSH_USER: ubuntu
# - TENCENT_SSH_PORT: 22

# 2. 推送代码到 main 分支
git add .
git commit -m "deploy: update production"
git push origin main

# 3. 在 GitHub Actions 页面查看部署进度
```

### 方式三: 手动部署

#### 1. 服务器初始化

```bash
# SSH 登录服务器
ssh ubuntu@<服务器IP>

# 执行初始化脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/main/deploy/scripts/init-server.sh | sudo bash

# 或手动执行以下步骤：

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

#### 2. 上传部署文件

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

#### 3. 配置环境变量

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

#### 4. 配置 SSL 证书

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

#### 5. 启动服务

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

#### 6. 验证部署

```bash
# 健康检查
curl https://api.backbuy.cn/health

# 查看服务状态
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml ps

# 查看日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f
```

---

## 运维命令

### 查看日志
```bash
# 所有服务
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f

# 特定服务
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f api-gateway
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f postgres
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f nginx
```

### 重启服务
```bash
# 重启所有服务
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml restart

# 重启特定服务
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml restart api-gateway
```

### 备份数据
```bash
# 备份数据库
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
sudo docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > backup_$BACKUP_DATE.sql

# 备份到 COS（需要配置 coscmd）
coscmd upload backup_$BACKUP_DATE.sql /backups/

# 自动备份脚本（添加到 crontab）
# 每天凌晨 2 点自动备份
0 2 * * * /opt/one-recycle/deploy/scripts/backup.sh
```

### 更新部署
```bash
# 方式一: 使用一键部署脚本（推荐）
./scripts/deploy-to-tencent.sh -i <服务器IP>

# 方式二: 手动更新
cd /opt/one-recycle
git pull origin main
sudo docker-compose -f deploy/docker/docker-compose.production.yml up -d --build
```

### 进入容器
```bash
# 进入 API Gateway 容器
sudo docker exec -it one-recycle-api-gateway sh

# 进入数据库容器
sudo docker exec -it one-recycle-postgres psql -U one_recycle -d one_recycle

# 进入 Redis 容器
sudo docker exec -it one-recycle-redis redis-cli -a your_redis_password
```

---

## 监控和告警

### 健康检查端点
- API Gateway: `https://api.backbuy.cn/health`

### 服务状态检查
```bash
# 检查所有服务
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml ps

# 检查资源使用
sudo docker stats --no-stream
```

### 日志监控
```bash
# 实时监控错误日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs -f | grep ERROR

# 查看 Nginx 访问日志
sudo tail -f /opt/one-recycle/logs/nginx/access.log
```

---

## 故障排查

### 服务无法启动
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

### 502 Bad Gateway
```bash
# 检查 Nginx 配置
sudo docker exec one-recycle-nginx nginx -t

# 检查后端服务是否健康
curl http://localhost:3002/health

# 查看 Nginx 错误日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs nginx
```

### 数据库连接失败
```bash
# 检查数据库容器状态
sudo docker ps | grep postgres

# 检查数据库日志
sudo docker-compose -f /opt/one-recycle/deploy/docker/docker-compose.production.yml logs postgres

# 测试数据库连接
sudo docker exec -it one-recycle-postgres pg_isready -U one_recycle

# 进入数据库检查
sudo docker exec -it one-recycle-postgres psql -U one_recycle -d one_recycle -c "\l"
```

### SSL 证书问题
```bash
# 检查证书有效期
openssl x509 -in /opt/one-recycle/deploy/nginx/ssl/fullchain.pem -noout -dates

# 测试 HTTPS 连接
curl -v https://api.backbuy.cn/health

# 重新申请证书
sudo certbot renew --force-renewal
```

---

## 安全建议

1. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **定期更换密码**
   - 每 3 个月更换一次数据库和 Redis 密码
   - 定期轮换 SSH 密钥

3. **配置自动备份**
   ```bash
   # 编辑 crontab
   sudo crontab -e
   
   # 添加每日备份任务
   0 2 * * * /opt/one-recycle/deploy/scripts/backup.sh
   ```

4. **启用防火墙**
   - 只开放必要的端口（22, 80, 443）
   - 配置 fail2ban 防止暴力破解

5. **HTTPS 强制**
   - 所有 HTTP 请求重定向到 HTTPS
   - 配置 HSTS 响应头

6. **日志审计**
   - 定期检查 Nginx 访问日志
   - 监控异常请求模式

---

## 相关文档

- [GitHub Actions CI/CD 配置](../.github/workflows/README.md)
- [服务器初始化脚本](../deploy/scripts/init-server.sh)
- [SSL 证书配置脚本](../deploy/scripts/setup-ssl.sh)
- [一键部署脚本](../scripts/deploy-to-tencent.sh)

---

## 技术支持

如有问题，请检查：
1. 服务器安全组是否开放必要端口
2. 域名 DNS 解析是否正确
3. SSL 证书是否正确配置
4. 环境变量是否正确设置
5. Docker 服务是否正常运行
