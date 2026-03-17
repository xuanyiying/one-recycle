# Deploy 目录说明

本目录包含 OneRecycle 项目所有与部署相关的配置、脚本和文档。

## 目录结构

```
deploy/
├── config/                 # 环境配置文件
│   └── .env.production.example   # 生产环境配置示例
├── docker/                 # Docker 相关配置
│   ├── docker-compose.production.yml   # 生产环境 Compose 配置
│   └── docker-compose.development.yml  # 开发环境 Compose 配置
├── nginx/                  # Nginx 配置
│   └── nginx.conf         # 生产环境 Nginx 配置
├── scripts/                # 部署脚本
│   ├── deploy.sh          # 主部署脚本
│   └── service.sh         # 服务管理脚本
├── cicd/                  # CI/CD 配置
│   └── github-actions.yml # GitHub Actions 工作流
└── docs/                  # 部署文档
    └── DEPLOY.md          # 部署指南
```

## 快速开始

### 1. 环境准备

```bash
# 复制环境配置
cd deploy/config
cp .env.production.example .env.production
nano .env.production
```

### 2. 配置 SSL 证书

```bash
# 创建 SSL 证书目录
mkdir -p deploy/nginx/ssl

# 上传证书文件
# 将 your-domain.crt 和 your-domain.key 上传到 deploy/nginx/ssl/
```

### 3. 部署

```bash
# 使用部署脚本
cd deploy
./scripts/deploy.sh production

# 或手动部署
docker-compose -f docker/docker-compose.production.yml up -d
```

### 4. 服务管理

```bash
# 查看状态
./scripts/service.sh status

# 查看日志
./scripts/service.sh logs api-gateway

# 重启服务
./scripts/service.sh restart api-gateway

# 健康检查
./scripts/service.sh health
```

## 环境说明

### 开发环境
- 使用 `docker-compose.development.yml`
- 包含完整的基础服务（PostgreSQL、Redis、MinIO）
- 适合本地开发和调试

### 生产环境
- 使用 `docker-compose.production.yml`
- 自建数据库和 Redis（在服务器上以容器方式运行）
- 需要配置外部对象存储（COS/OSS）

## 依赖服务

### 生产环境服务拓扑

```
                    ┌─────────────┐
                    │    Nginx    │
                    │  反向代理   │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │  API    │      │ Account │      │  Order  │
    │Gateway  │      │ Service │      │ Service │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
              ┌────────────┴────────────┐
              │                        │
         ┌────▼─────┐            ┌────▼─────┐
         │PostgreSQL│            │   Redis   │
         │  数据库  │            │   缓存    │
         └──────────┘            └───────────┘
```

## 配置文件说明

### .env.production.example

| 变量 | 说明 | 示例 |
|------|------|------|
| DB_PASSWORD | 数据库密码 | your_secure_password |
| REDIS_PASSWORD | Redis密码 | your_redis_password |
| JWT_SECRET | JWT密钥 | random_string |
| WECHAT_APP_ID_PROD | 微信小程序AppID | wx1234567890 |
| WECHAT_APP_SECRET_PROD | 微信小程序Secret | abcdef123456 |
| TENCENT_SECRET_ID | 腾讯云SecretId | AKIDxxx |
| TENCENT_SECRET_KEY | 腾讯云SecretKey | xxx |

## 常用命令

### 部署
```bash
./scripts/deploy.sh production
```

### 查看日志
```bash
# 所有服务
docker-compose -f docker/docker-compose.production.yml logs -f

# 特定服务
docker-compose -f docker/docker-compose.production.yml logs -f api-gateway
docker-compose -f docker/docker-compose.production.yml logs -f postgres
docker-compose -f docker/docker-compose.production.yml logs -f redis
```

### 备份
```bash
./scripts/service.sh backup
```

### 更新
```bash
git pull origin main
./scripts/deploy.sh production
```

## Kubernetes 部署

项目支持 Kubernetes 部署，位于 `deploy/k8s/` 目录：

```
deploy/k8s/
├── base/              # 基础配置 (Namespace, 数据库, Redis, Ollama)
│   ├── namespace.yaml
│   ├── database.yaml
│   └── ollama.yaml
├── microservices/     # 微服务配置
│   ├── api-gateway.yaml
│   ├── account-service.yaml
│   ├── order-service.yaml
│   └── other-services.yaml
├── ingress/           # Ingress 配置
│   └── ingress.yaml
├── autoscaling/      # 自动扩缩容配置
│   └── pdb.yaml
├── k8s-deploy.sh     # K8s 部署脚本
└── docs/K8S-DEPLOY.md  # K8s 部署文档
```

### K8s 快速开始

```bash
# 部署到 K8s
cd deploy/k8s
chmod +x k8s-deploy.sh
./k8s-deploy.sh apply

# 查看状态
./k8s-deploy.sh status

# 查看 HPA
./k8s-deploy.sh hpa
```

详细文档请参考 [K8S-DEPLOY.md](./docs/K8S-DEPLOY.md)。

## 文档

- [部署指南](./docs/DEPLOY.md) - Docker 部署步骤和配置说明
- [K8s部署指南](./docs/K8S-DEPLOY.md) - Kubernetes 部署及自动扩缩容配置
- [购买方案](./docs/DEPLOY.md#最终购买方案推荐) - 云服务器购买建议
