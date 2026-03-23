# OneRecycle 一键部署指南

## 域名: backbuy.cn

本文档介绍如何快速部署 OneRecycle 应用到 backbuy.cn 域名。

## 快速开始

### 1. 环境准备

确保服务器满足以下要求：

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **内存**: 至少 2GB RAM（推荐 4GB）
- **磁盘**: 至少 20GB 可用空间
- **域名**: 已解析到服务器 IP 的 backbuy.cn 域名

安装必要软件：

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose nginx nodejs npm git curl

# CentOS/RHEL
sudo yum install -y docker docker-compose nginx nodejs npm git curl
```

### 2. 配置环境变量

```bash
# 复制环境配置模板
cp deploy/config/.env.production.example deploy/config/.env.production

# 编辑配置文件
vim deploy/config/.env.production
```

必须修改的配置项：

```env
# 数据库密码（必须修改）
DB_PASSWORD=your_secure_password_here

# Redis 密码（必须修改）
REDIS_PASSWORD=your_redis_password_here

# JWT 密钥（必须修改，至少32位）
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# 微信/支付宝配置（如果使用支付功能）
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
ALIPAY_APP_ID=your_alipay_app_id
```

### 3. 执行部署

#### 方式一：传统部署（推荐）

使用传统方式部署到服务器：

```bash
# 给脚本添加执行权限
chmod +x deploy/scripts/deploy.sh

# 执行部署
./deploy/scripts/deploy.sh
```

#### 方式二：Docker 部署

使用 Docker Compose 部署：

```bash
# 给脚本添加执行权限
chmod +x deploy/scripts/deploy-docker.sh

# 执行部署
./deploy/scripts/deploy-docker.sh
```

## 部署选项

### 仅部署后端

```bash
./deploy/scripts/deploy.sh --backend
```

### 仅部署前端

```bash
./deploy/scripts/deploy.sh --frontend
```

### 配置 SSL 证书

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 配置 SSL
./deploy/scripts/deploy.sh --ssl
```

## Docker 部署管理

### 常用命令

```bash
# 查看服务状态
cd /opt/one-recycle && docker-compose ps

# 查看日志
cd /opt/one-recycle && docker-compose logs -f

# 重启服务
cd /opt/one-recycle && docker-compose restart

# 停止服务
cd /opt/one-recycle && docker-compose down

# 更新部署
cd /opt/one-recycle && docker-compose up -d --build
```

## 访问地址

部署完成后，可以通过以下地址访问：

- **管理后台**: http://admin.backbuy.cn
- **API 接口**: http://api.backbuy.cn
- **MinIO 控制台** (Docker): http://backbuy.cn:9001

## 目录结构

```
/opt/one-recycle/
├── backend/          # 后端服务代码
├── frontend/         # 前端应用
│   └── admin/        # 管理后台
├── nginx/            # Nginx 配置
│   └── conf.d/       # 站点配置
├── ssl/              # SSL 证书
├── logs/             # 日志文件
├── data/             # 数据目录 (Docker)
│   ├── postgres/     # PostgreSQL 数据
│   ├── redis/        # Redis 数据
│   └── minio/        # MinIO 数据
└── docker-compose.yml
```

## 备份与恢复

### 自动备份

部署脚本会自动创建备份，保存在 `/opt/backups/one-recycle/` 目录，保留最近 10 个备份。

### 手动备份

```bash
# 数据库备份
docker-compose exec postgres pg_dump -U one_recycle one_recycle > backup.sql

# 完整备份
sudo tar -czvf backup.tar.gz /opt/one-recycle
```

### 恢复备份

```bash
# 停止服务
cd /opt/one-recycle && docker-compose down

# 恢复文件
sudo tar -xzvf backup.tar.gz -C /

# 恢复数据库
docker-compose exec -T postgres psql -U one_recycle < backup.sql

# 启动服务
cd /opt/one-recycle && docker-compose up -d
```

## 故障排查

### 服务无法启动

```bash
# 查看服务日志
sudo journalctl -u one-recycle -f

# 或 Docker 日志
cd /opt/one-recycle && docker-compose logs -f backend
```

### 数据库连接失败

1. 检查数据库服务状态：
```bash
docker-compose ps postgres
```

2. 检查数据库连接配置：
```bash
cat /opt/one-recycle/.env.production | grep DATABASE_URL
```

### Nginx 配置错误

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

## 更新部署

### 更新代码后重新部署

```bash
# 拉取最新代码
git pull origin main

# 重新部署
./deploy/scripts/deploy.sh
```

### 仅更新后端

```bash
./deploy/scripts/deploy.sh --backend
```

## 安全建议

1. **修改默认密码**: 务必修改所有默认密码
2. **配置防火墙**: 只开放必要的端口（80, 443, 9000）
3. **启用 SSL**: 使用 HTTPS 保护数据传输
4. **定期备份**: 设置定时任务自动备份数据
5. **更新系统**: 定期更新系统和依赖包

## 性能优化

### 启用 Gzip 压缩

Nginx 配置已默认启用 Gzip 压缩。

### 静态资源缓存

前端静态资源已配置 1 年缓存。

### 数据库优化

建议定期执行：

```bash
# 分析表
docker-compose exec postgres psql -U one_recycle -c "ANALYZE;"

# 清理日志
sudo find /var/log/one-recycle -name "*.log" -mtime +30 -delete
```

## 技术支持

如有问题，请检查：

1. 日志文件: `/var/log/one-recycle-deploy.log`
2. 服务状态: `sudo systemctl status one-recycle`
3. Docker 状态: `docker-compose ps`

## 许可证

MIT License
