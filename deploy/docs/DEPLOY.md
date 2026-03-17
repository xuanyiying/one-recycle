# OneRecycle 生产环境部署指南

## 目录
1. [🎯 最终购买方案（推荐）](#最终购买方案推荐)
2. [云服务厂商对比](#云服务厂商对比)
3. [动态扩容方案](#动态扩容方案)
4. [部署步骤](#部署步骤)
5. [运维命令](#运维命令)
6. [监控和告警](#监控和告警)
7. [故障排查](#故障排查)

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
| **域名** | 腾讯云 | .com 1年 | **¥55** |
| **SSL证书** | 腾讯云 | 免费 DV SSL | **¥0** |
| **短信服务** | 腾讯云 | 1万条 | **¥375** |
| **总计** | - | - | **~¥746** |

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
时长: 1年
价格: ¥166（新用户专享）
```

#### Step 3: 开通对象存储 COS
```
产品页面: https://console.cloud.tencent.com/cos
创建存储桶，地域与服务器相同
```

#### Step 4: 购买域名
```
产品页面: https://dnspod.cloud.tencent.com
价格: ~¥55/年
```

#### Step 5: 申请SSL证书
```
产品页面: https://console.cloud.tencent.com/ssl
选择免费DV证书
```

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

## 部署步骤

### 1. 服务器初始化

```bash
# 登录服务器
ssh ubuntu@your-server-ip

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 开放端口
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. 上传部署文件

```bash
# 上传到服务器
scp -r deploy/ ubuntu@your-server-ip:/opt/one-recycle/

# 或使用 Git
git clone your-repo.git /opt/one-recycle
```

### 3. 配置环境变量

```bash
cd /opt/one-recycle/deploy/config

# 复制并编辑环境变量
cp .env.production.example .env.production
nano .env.production
```

### 4. 启动服务

```bash
cd /opt/one-recycle/deploy

# 启动所有服务
docker-compose -f docker-compose.production.yml up -d

# 查看日志
docker-compose -f docker-compose.production.yml logs -f
```

### 5. 数据库初始化

```bash
# 进入 API Gateway 容器
docker exec -it one-recycle-api-gateway sh

# 执行迁移
npx prisma migrate deploy
npx prisma generate

exit
```

### 6. 配置 SSL 证书

```bash
# 创建 SSL 目录
mkdir -p deploy/nginx/ssl

# 上传证书
scp your-domain.crt your-domain.key ubuntu@your-server-ip:/opt/one-recycle/deploy/nginx/ssl/

# 重启 Nginx
docker-compose -f docker-compose.production.yml restart nginx
```

### 7. 验证部署

```bash
# 健康检查
curl https://api.your-domain.com/health

# 查看服务状态
docker-compose -f docker-compose.production.yml ps
```

---

## 运维命令

### 查看日志
```bash
# 所有服务
docker-compose -f docker-compose.production.yml logs -f

# 特定服务
docker-compose -f docker-compose.production.yml logs -f api-gateway

# 数据库
docker-compose -f docker-compose.production.yml logs -f postgres
```

### 重启服务
```bash
docker-compose -f docker-compose.production.yml restart
docker-compose -f docker-compose.production.yml restart api-gateway
```

### 备份数据
```bash
# 备份数据库
docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > backup_$(date +%Y%m%d).sql

# 备份到 COS
coscmd upload backup_$(date +%Y%m%d).sql /backups/
```

### 更新部署
```bash
git pull origin main
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

---

## 监控和告警

### 健康检查端点
- API Gateway: `https://api.your-domain.com/health`

---

## 故障排查

### 服务无法启动
```bash
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs
```

### 数据库连接失败
```bash
docker exec -it one-recycle-postgres psql -U one_recycle
```

### 502 错误
```bash
docker-compose -f docker-compose.production.yml logs nginx
docker-compose -f docker-compose.production.yml logs api-gateway
```

---

## 安全建议

1. **定期更新密码** - 每 3 个月更换一次数据库和 Redis 密码
2. **启用防火墙** - 只开放必要的端口（22, 80, 443）
3. **定期备份** - 每天自动备份数据库到 COS
4. **HTTPS 强制** - 所有 HTTP 请求重定向到 HTTPS

---

## 联系支持

如有问题，请联系技术支持团队。
