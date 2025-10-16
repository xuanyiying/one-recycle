# 部署文档

## 1. 概述

本文档描述了一键回收平台的部署配置和流程，包括开发环境、测试环境和生产环境的部署方案。

## 2. 系统架构

### 2.1 技术栈

- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes
- **数据库**: PostgreSQL
- **缓存**: Redis
- **消息队列**: RabbitMQ
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack

### 2.2 服务组件

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Admin Web     │    │  Third Party    │
│                 │    │                 │    │   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (NestJS)      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Account Service │    │ Order Service   │    │Payment Service  │
│   (NestJS)      │    │   (NestJS)      │    │   (NestJS)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   PostgreSQL    │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 3. 环境配置

### 3.1 开发环境

#### 3.1.1 前置要求

- Node.js 18+
- Docker 20.10+
- Docker Compose 2.0+
- Git

#### 3.1.2 启动步骤

1. **克隆代码**
```bash
git clone https://github.com/your-org/one-recycle.git
cd one-recycle
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装各服务依赖
npm run install:all
```

3. **环境变量配置**
```bash
# 复制环境变量模板
cp .env.example .env.development

# 编辑环境变量
vim .env.development
```

4. **启动基础设施**
```bash
# 启动数据库、Redis、RabbitMQ等
docker-compose -f docker-compose.dev.yml up -d postgres redis rabbitmq
```

5. **数据库初始化**
```bash
# 运行数据库迁移
npm run db:migrate:dev

# 生成Prisma客户端
npm run db:generate
```

6. **启动服务**
```bash
# 启动所有微服务
npm run dev

# 或单独启动服务
npm run dev:api-gateway
npm run dev:account-service
npm run dev:order-service
```

#### 3.1.3 开发环境配置文件

**.env.development**
```env
# 数据库配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/one_recycle_dev"

# Redis配置
REDIS_URL="redis://localhost:6379"

# RabbitMQ配置
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# JWT配置
JWT_SECRET="dev-secret-key"
JWT_EXPIRES_IN="7d"

# 微信小程序配置
WECHAT_APP_ID="your-wechat-app-id"
WECHAT_APP_SECRET="your-wechat-app-secret"

# 支付宝小程序配置
ALIPAY_APP_ID="your-alipay-app-id"
ALIPAY_PRIVATE_KEY="your-alipay-private-key"

# 日志级别
LOG_LEVEL="debug"
```

### 3.2 测试环境

#### 3.2.1 Docker Compose配置

**docker-compose.test.yml**
```yaml
version: '3.8'

services:
  # API网关
  api-gateway:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/one_recycle_test
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - app-network

  # 账户服务
  account-service:
    build:
      context: .
      dockerfile: apps/account-service/Dockerfile
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/account_service_test
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - app-network

  # 订单服务
  order-service:
    build:
      context: .
      dockerfile: apps/order-service/Dockerfile
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/order_service_test
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - app-network

  # 支付服务
  payment-service:
    build:
      context: .
      dockerfile: apps/payment-service/Dockerfile
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/payment_service_test
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - app-network

  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: one_recycle_test
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-databases.sql:/docker-entrypoint-initdb.d/init-databases.sql
    ports:
      - "5432:5432"
    networks:
      - app-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

  # RabbitMQ消息队列
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    ports:
      - "5672:5672"
      - "15672:15672"
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

#### 3.2.2 测试环境部署

```bash
# 构建并启动测试环境
docker-compose -f docker-compose.test.yml up -d

# 运行数据库迁移
docker-compose -f docker-compose.test.yml exec api-gateway npm run db:migrate

# 运行测试
docker-compose -f docker-compose.test.yml exec api-gateway npm test

# 查看日志
docker-compose -f docker-compose.test.yml logs -f api-gateway
```

### 3.3 生产环境

#### 3.3.1 Kubernetes配置

**k8s/namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: one-recycle
```

**k8s/configmap.yaml**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: one-recycle
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  JWT_EXPIRES_IN: "7d"
```

**k8s/secret.yaml**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: one-recycle
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  WECHAT_APP_SECRET: <base64-encoded-wechat-secret>
  ALIPAY_PRIVATE_KEY: <base64-encoded-alipay-key>
```

**k8s/api-gateway-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: one-recycle
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: one-recycle/api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
  namespace: one-recycle
spec:
  selector:
    app: api-gateway
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

**k8s/ingress.yaml**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: one-recycle
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.one-recycle.com
    secretName: api-tls-secret
  rules:
  - host: api.one-recycle.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway-service
            port:
              number: 80
```

#### 3.3.2 数据库配置

**k8s/postgres-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: one-recycle
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: "one_recycle"
        - name: POSTGRES_USER
          value: "postgres"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: one-recycle
spec:
  selector:
    app: postgres
  ports:
  - protocol: TCP
    port: 5432
    targetPort: 5432
  type: ClusterIP
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: one-recycle
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

#### 3.3.3 生产环境部署流程

1. **创建命名空间**
```bash
kubectl apply -f k8s/namespace.yaml
```

2. **创建配置和密钥**
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

3. **部署数据库**
```bash
kubectl apply -f k8s/postgres-deployment.yaml
```

4. **部署应用服务**
```bash
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/account-service-deployment.yaml
kubectl apply -f k8s/order-service-deployment.yaml
kubectl apply -f k8s/payment-service-deployment.yaml
```

5. **配置Ingress**
```bash
kubectl apply -f k8s/ingress.yaml
```

6. **验证部署**
```bash
# 检查Pod状态
kubectl get pods -n one-recycle

# 检查服务状态
kubectl get services -n one-recycle

# 查看日志
kubectl logs -f deployment/api-gateway -n one-recycle
```

## 4. CI/CD流程

### 4.1 GitHub Actions配置

**.github/workflows/ci.yml**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push API Gateway
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./apps/api-gateway/Dockerfile
        push: true
        tags: ghcr.io/${{ github.repository }}/api-gateway:latest
    
    - name: Build and push Account Service
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./apps/account-service/Dockerfile
        push: true
        tags: ghcr.io/${{ github.repository }}/account-service:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/api-gateway api-gateway=ghcr.io/${{ github.repository }}/api-gateway:latest -n one-recycle
        kubectl set image deployment/account-service account-service=ghcr.io/${{ github.repository }}/account-service:latest -n one-recycle
        kubectl rollout status deployment/api-gateway -n one-recycle
        kubectl rollout status deployment/account-service -n one-recycle
```

### 4.2 部署脚本

**scripts/deploy.sh**
```bash
#!/bin/bash

set -e

# 配置变量
ENVIRONMENT=${1:-staging}
NAMESPACE="one-recycle-${ENVIRONMENT}"
IMAGE_TAG=${2:-latest}

echo "Deploying to ${ENVIRONMENT} environment..."

# 创建命名空间
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# 应用配置
envsubst < k8s/configmap.yaml | kubectl apply -f -
envsubst < k8s/secret.yaml | kubectl apply -f -

# 部署数据库
kubectl apply -f k8s/postgres-deployment.yaml -n ${NAMESPACE}

# 等待数据库就绪
kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s

# 运行数据库迁移
kubectl run migration-job --image=one-recycle/api-gateway:${IMAGE_TAG} \
  --restart=Never \
  --rm -i \
  --env="DATABASE_URL=${DATABASE_URL}" \
  --command -- npm run db:migrate

# 部署应用服务
kubectl apply -f k8s/api-gateway-deployment.yaml -n ${NAMESPACE}
kubectl apply -f k8s/account-service-deployment.yaml -n ${NAMESPACE}
kubectl apply -f k8s/order-service-deployment.yaml -n ${NAMESPACE}
kubectl apply -f k8s/payment-service-deployment.yaml -n ${NAMESPACE}

# 等待部署完成
kubectl rollout status deployment/api-gateway -n ${NAMESPACE}
kubectl rollout status deployment/account-service -n ${NAMESPACE}
kubectl rollout status deployment/order-service -n ${NAMESPACE}
kubectl rollout status deployment/payment-service -n ${NAMESPACE}

# 配置Ingress
kubectl apply -f k8s/ingress.yaml -n ${NAMESPACE}

echo "Deployment completed successfully!"
```

## 5. 监控和日志

### 5.1 Prometheus监控配置

**k8s/prometheus-config.yaml**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
    - job_name: 'api-gateway'
      static_configs:
      - targets: ['api-gateway-service.one-recycle:3000']
      metrics_path: /metrics
    
    - job_name: 'account-service'
      static_configs:
      - targets: ['account-service.one-recycle:3001']
      metrics_path: /metrics
    
    - job_name: 'order-service'
      static_configs:
      - targets: ['order-service.one-recycle:3002']
      metrics_path: /metrics
```

### 5.2 Grafana仪表板

**监控指标**:
- 请求QPS和响应时间
- 错误率和成功率
- 数据库连接池状态
- 内存和CPU使用率
- 业务指标（订单量、用户数等）

### 5.3 日志收集

**Fluentd配置**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: logging
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*one-recycle*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
    </source>
    
    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name one-recycle
    </match>
```

## 6. 备份和恢复

### 6.1 数据库备份

**备份脚本**:
```bash
#!/bin/bash

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DATABASES=("one_recycle" "account_service" "order_service" "payment_service")

for db in "${DATABASES[@]}"; do
  echo "Backing up database: $db"
  kubectl exec -n one-recycle postgres-0 -- pg_dump -U postgres $db > ${BACKUP_DIR}/${db}_${DATE}.sql
done

# 上传到云存储
aws s3 cp ${BACKUP_DIR}/ s3://one-recycle-backups/$(date +%Y/%m/%d)/ --recursive
```

### 6.2 自动备份

**CronJob配置**:
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: one-recycle
spec:
  schedule: "0 2 * * *"  # 每天凌晨2点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h postgres-service -U postgres one_recycle > /backup/one_recycle_$(date +%Y%m%d_%H%M%S).sql
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

## 7. 安全配置

### 7.1 网络策略

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-netpol
  namespace: one-recycle
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: account-service
    ports:
    - protocol: TCP
      port: 3001
```

### 7.2 Pod安全策略

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: one-recycle-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## 8. 故障排查

### 8.1 常见问题

1. **Pod启动失败**
```bash
# 查看Pod状态
kubectl describe pod <pod-name> -n one-recycle

# 查看日志
kubectl logs <pod-name> -n one-recycle
```

2. **数据库连接失败**
```bash
# 检查数据库服务
kubectl get svc postgres-service -n one-recycle

# 测试连接
kubectl run -it --rm debug --image=postgres:15-alpine --restart=Never -- psql -h postgres-service -U postgres
```

3. **服务间通信问题**
```bash
# 检查服务发现
kubectl get endpoints -n one-recycle

# 测试网络连通性
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup account-service.one-recycle.svc.cluster.local
```

### 8.2 性能调优

1. **资源限制调整**
2. **数据库连接池优化**
3. **缓存策略优化**
4. **负载均衡配置**

## 9. 版本管理

### 9.1 版本策略

- **主版本**: 重大架构变更
- **次版本**: 新功能添加
- **修订版本**: Bug修复

### 9.2 发布流程

1. 开发分支合并到develop
2. 测试环境验证
3. 创建release分支
4. 生产环境部署
5. 打标签并合并到main

## 10. 运维手册

### 10.1 日常运维

- 监控告警处理
- 日志分析
- 性能优化
- 安全更新

### 10.2 应急响应

- 故障定位流程
- 回滚操作
- 数据恢复
- 通知机制