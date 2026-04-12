# OneRecycle 生产部署指南

## 快速开始

```bash
cd deploy

# 1. 配置（必须修改密码）
vim deploy.conf

# 2. 部署
./scripts/deploy.sh
```

## 配置说明

### deploy.conf

```bash
DOMAIN=backbuy.cn              # 你的域名
EMAIL=admin@backbuy.cn         # SSL 证书通知邮箱

DB_PASSWORD=xxx                # 数据库密码（必须修改）
REDIS_PASSWORD=xxx             # Redis 密码（必须修改）

DEPLOY_DATA_DIR=./data         # 数据目录
```

### .env.production

创建 `deploy/.env.production`：

```bash
# JWT
JWT_SECRET=OneRecycle2025Secure

# 微信支付
WECHAT_APP_ID=xxx
WECHAT_APP_SECRET=xxx

# 其他密钥...
```

## 命令

```bash
./scripts/deploy.sh         # 首次部署
./scripts/deploy.sh start   # 启动
./scripts/deploy.sh stop    # 停止
./scripts/deploy.sh restart # 重启
./scripts/deploy.sh update  # 更新
./scripts/deploy.sh logs    # 查看日志
./scripts/deploy.sh migrate # 数据库迁移
./scripts/deploy.sh status  # 查看状态
```

## 服务架构

```
┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│   Certbot   │  SSL 自动续期
│  (80/443)   │     └─────────────┘
└──────┬──────┘
       │
       ├────▶ backend:3000    API 服务
       ├────▶ admin-web:3000  管理后台
       │
       │     ┌─────────────┐
       └────▶│  PostgreSQL │  数据库
             │   (5432)    │
             └─────────────┘
             ┌─────────────┐
             │    Redis    │  缓存
             │   (6379)    │
             └─────────────┘
```

## 域名配置

确保 DNS 解析：
- `backbuy.cn` → 服务器 IP（官网/小程序端）
- `api.backbuy.cn` → 服务器 IP（API 服务）
- `admin.backbuy.cn` → 服务器 IP（管理后台）

## SSL 证书

Let's Encrypt 自动申请，每 12 小时检查续期。

证书位置：`deploy/ssl/live/backbuy.cn/`

## 生产检查清单

- [ ] 修改 DB_PASSWORD（强密码）
- [ ] 修改 REDIS_PASSWORD（强密码）
- [ ] 配置 JWT_SECRET
- [ ] 配置微信支付密钥
- [ ] 配置阿里云/腾讯云密钥
- [ ] DNS 解析已配置
- [ ] 服务器防火墙开放 80/443
- [ ] 数据目录已备份配置
