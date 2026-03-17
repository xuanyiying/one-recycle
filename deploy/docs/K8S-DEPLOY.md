# OneRecycle Kubernetes 生产环境部署指南

## 目录
1. [架构概述](#架构概述)
2. [环境要求](#环境要求)
3. [快速开始](#快速开始)
4. [资源配置说明](#资源配置说明)
5. [自动扩缩容](#自动扩缩容)
6. [监控与告警](#监控与告警)
7. [运维命令](#运维命令)
8. [故障排查](#故障排查)

---

## 架构概述

### K8s 集群架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                           入口层 (Ingress)                          │
│   ┌─────────────────┐              ┌─────────────────┐              │
│   │ api.your-domain │              │admin.your-domain│              │
│   │   (Nginx)       │              │   (Nginx)       │              │
│   └────────┬────────┘              └────────┬────────┘              │
└────────────┼──────────────────────────────┼──────────────────────────┘
             │                              │
    ┌────────▼────────┐            ┌────────▼────────┐
    │   API Gateway   │            │    Admin Web    │
    │   (2-20 Pods)   │            │   (2-10 Pods)   │
    └────────┬────────┘            └────────┬────────┘
             │                              │
    ┌────────┼──────────────────────────────┼────────┐
    │        │                              │        │
┌───▼───┐ ┌──▼────┐ ┌────▼────┐ ┌────▼───┐ ┌────▼────┐
│Account│ │ Order │ │Notifica.│ │Inventory│ │ Category│
│Service│ │Service│ │ Service │ │ Service │ │ Service │
└───────┘ └───────┘ └─────────┘ └─────────┘ └─────────┘
    │        │         │          │          │
    └────────┼─────────┼──────────┼──────────┘
             │         │          │
    ┌────────▼─────────▼──────────▼──────────┐
    │              数据存储层                   │
    │  ┌─────────────┐  ┌─────────────┐       │
    │  │  PostgreSQL │  │    Redis    │       │
    │  │   (1 Pod)   │  │   (1 Pod)   │       │
    │  └─────────────┘  └─────────────┘       │
    └──────────────────────────────────────────┘
```

### 组件说明

| 组件 | 副本数 | 扩缩容范围 | 说明 |
|------|--------|-----------|------|
| API Gateway | 2 | 2-20 | 核心网关服务 |
| Account Service | 2 | 2-10 | 账户服务 |
| Order Service | 2 | 2-15 | 订单服务 |
| Notification Service | 1 | 1-5 | 通知服务 |
| Inventory Service | 1 | 1-5 | 库存服务 |
| Category Service | 1 | 1-3 | 分类服务 |
| Message Queue | 1 | 1-2 | 消息队列 |
| Ollama | 1 | 1 | 本地 AI 模型 (可选) |
| Admin Web | 2 | 2-10 | 管理后台 |
| PostgreSQL | 1 | - | 主数据库 |
| Redis | 1 | - | 缓存服务 |

---

## 环境要求

### Kubernetes 集群

```yaml
# 最低配置
Master节点: 2核4G × 3台
Worker节点: 4核8G × 3台
存储: 100GB SSD per node
网络: VPC 内网 + 公网负载均衡
```

### 推荐云厂商

| 厂商 | 产品 | 配置 | 说明 |
|------|------|------|------|
| 阿里云 | ACK (容器服务) | 3节点 4核8G | 企业级 K8s |
| 腾讯云 | TKE (容器服务) | 3节点 4核8G | 微信生态好 |
| 华为云 | CCE (云容器) | 3节点 4核8G | 性价比高 |

### 本地开发 (MiniKube)

```bash
# 安装 MiniKube
brew install minikube
minikube start --cpus 4 --memory 8192

# 安装 Ingress
minikube addons enable ingress

# 安装 Metrics Server (HPA需要)
minikube addons enable metrics-server
```

---

## 快速开始

### 1. 准备配置

```bash
# 进入 K8s 目录
cd deploy/k8s

# 复制并编辑配置
cp base/secret.example.yaml base/secret.yaml

# 编辑 Secrets
nano base/secret.yaml
# 修改以下值:
# - DB_PASSWORD: 数据库密码
# - REDIS_PASSWORD: Redis密码
# - JWT_SECRET: JWT密钥
# - WECHAT_APP_ID: 微信AppID
# - WECHAT_APP_SECRET: 微信Secret
```

### 2. 部署到 K8s

```bash
# 使用部署脚本
chmod +x k8s-deploy.sh
./k8s-deploy.sh apply

# 或手动部署
kubectl apply -f base/
kubectl apply -f microservices/
kubectl apply -f ingress/
kubectl apply -f autoscaling/
```

### 3. 验证部署

```bash
# 查看 Pod 状态
kubectl get pods -n one-recycle

# 查看服务
kubectl get svc -n one-recycle

# 查看 HPA
kubectl get hpa -n one-recycle

# 查看 Ingress
kubectl get ingress -n one-recycle
```

### 4. 配置 TLS 证书

```bash
# 创建 TLS Secret
kubectl create tls api-tls-secret \
  --cert=path/to/cert.crt \
  --key=path/to/cert.key \
  -n one-recycle

kubectl create tls admin-tls-secret \
  --cert=path/to/cert.crt \
  --key=path/to/cert.key \
  -n one-recycle
```

---

## 资源配置说明

### 资源请求与限制

```yaml
# 微服务 (CPU: 200m-500m, Memory: 256Mi-512Mi)
requests:
  memory: "256Mi"
  cpu: "200m"
limits:
  memory: "512Mi"
  cpu: "500m"

# 数据库 (CPU: 250m-1000m, Memory: 512Mi-2Gi)
requests:
  memory: "512Mi"
  cpu: "250m"
limits:
  memory: "2Gi"
  cpu: "1000m"

# 缓存 (CPU: 100m-500m, Memory: 256Mi-1Gi)
requests:
  memory: "256Mi"
  cpu: "100m"
limits:
  memory: "1Gi"
  cpu: "500m"
```

### 节点亲和性

```yaml
# 建议将数据库部署在高性能节点
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
            - key: node-type
              operator: In
              values:
                - high-performance
```

### 污点和容忍

```yaml
# 为专用数据库节点设置污点
kubectl taint nodes db-node dedicated=db:NoSchedule

# 在数据库 Deployment 中添加容忍
tolerations:
  - key: "dedicated"
    operator: "Equal"
    value: "db"
    effect: "NoSchedule"
```

---

## 自动扩缩容

### Horizontal Pod Autoscaler (HPA)

```yaml
# API Gateway HPA 配置
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: one-recycle
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 20
  
  # 扩容指标
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70  # CPU > 70% 扩容
    
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80  # Memory > 80% 扩容
  
  # 扩容行为
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60  # 扩容冷却时间
      policies:
        - type: Percent
          value: 100   # 每次最多增加 100%
          periodSeconds: 60
    
    scaleDown:
      stabilizationWindowSeconds: 300  # 缩容冷却时间 (5分钟)
      policies:
        - type: Percent
          value: 10    # 每次最多减少 10%
          periodSeconds: 60
```

### 扩容触发条件

| 指标 | 阈值 | 动作 |
|------|------|------|
| CPU | > 70% | 扩容 |
| Memory | > 80% | 扩容 |
| CPU | < 30% | 缩容 |
| Request QPS | > 1000 | 扩容 (需配置自定义指标) |
| Response Time | > 500ms | 扩容 (需配置自定义指标) |

### PodDisruptionBudget (PDB)

```yaml
# 确保更新或维护期间至少保持 1 个可用副本
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-gateway-pdb
  namespace: one-recycle
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: api-gateway
```

---

## 监控与告警

### Prometheus + Grafana

```bash
# 安装 Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# 查看 Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# 访问 http://localhost:3000 (admin/prom-operator)
```

### 关键指标

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| pod_cpu_usage | CPU使用率 | > 80% |
| pod_memory_usage | 内存使用率 | > 85% |
| pod_restart_count | Pod重启次数 | > 3 |
| http_request_duration | 请求延迟 | > 1s |
| http_request_errors | 请求错误率 | > 1% |

### 告警规则示例

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: one-recycle-alerts
  namespace: one-recycle
spec:
  groups:
    - name: one-recycle
      rules:
        - alert: HighCPUUsage
          expr: rate(container_cpu_usage_seconds_total{namespace="one-recycle"}[5m]) > 0.8
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "High CPU usage detected"
            
        - alert: PodNotReady
          expr: kube_pod_status_ready{namespace="one-recycle",condition="true"} == 0
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "Pod not ready"
```

---

## 运维命令

### 部署管理

```bash
# 部署所有
./k8s-deploy.sh apply

# 仅部署基础组件
./k8s-deploy.sh apply:base

# 仅部署微服务
./k8s-deploy.sh apply:services

# 删除所有
./k8s-deploy.sh delete

# 查看状态
./k8s-deploy.sh status
```

### 日志管理

```bash
# 查看所有 Pod 日志
kubectl logs -n one-recycle -l app=api-gateway -f

# 查看特定 Pod
kubectl logs -n one-recycle api-gateway-xxxxx -f

# 查看上一个容器的日志 (崩溃后)
kubectl logs -n one-recycle api-gateway-xxxxx -p
```

### 扩缩容

```bash
# 手动扩缩容
kubectl scale deployment api-gateway -n one-recycle --replicas=5

# 查看 HPA 状态
kubectl get hpa -n one-recycle
./k8s-deploy.sh hpa

# 查看资源使用
kubectl top pods -n one-recycle
kubectl top nodes
```

### 更新部署

```bash
# 滚动更新
kubectl rollout restart deployment/api-gateway -n one-recycle

# 查看更新状态
kubectl rollout status deployment/api-gateway -n one-recycle

# 回滚
kubectl rollout undo deployment/api-gateway -n one-recycle

# 回滚到指定版本
kubectl rollout undo deployment/api-gateway -n one-recycle --to-revision=2
```

### 调试

```bash
# 进入 Pod
kubectl exec -it api-gateway-xxxxx -n one-recycle -- /bin/sh

# 查看 Pod 详情
kubectl describe pod api-gateway-xxxxx -n one-recycle

# 查看 Events
kubectl get events -n one-recycle --sort-by='.lastTimestamp'

# 端口转发
kubectl port-forward svc/api-gateway 3002:3002 -n one-recycle
```

---

## 故障排查

### Pod 无法启动

```bash
# 查看 Pod 状态
kubectl get pods -n one-recycle

# 查看事件
kubectl describe pod <pod-name> -n one-recycle

# 查看日志
kubectl logs <pod-name> -n one-recycle

# 常见问题:
# 1. 镜像拉取失败 -> 检查镜像地址和仓库权限
# 2. 资源配置不足 -> 增加 resources.limits
# 3. 依赖服务未就绪 -> 检查 postgres/redis 状态
```

### 服务无法访问

```bash
# 检查 Service
kubectl get svc -n one-recycle
kubectl describe svc api-gateway -n one-recycle

# 检查 Endpoints
kubectl get endpoints -n one-recycle

# 检查 Ingress
kubectl describe ingress api-ingress -n one-recycle
kubectl logs -n ingress-nginx ingress-nginx-controller-xxx
```

### HPA 不工作

```bash
# 检查 Metrics Server
kubectl get apiservices | grep metrics
kubectl top nodes
kubectl top pods -n one-recycle

# 检查 HPA 状态
kubectl describe hpa api-gateway -n one-recycle
```

### 数据库连接失败

```bash
# 检查 PostgreSQL
kubectl exec -it postgres-0 -n one-recycle -- pg_isready

# 测试连接
kubectl run postgres-client --image=postgres:15-alpine --rm -it --restart=Never -- \
  psql -h postgres -U one_recycle -d one_recycle
```

---

## 成本优化

### 成本预估

| 阶段 | 节点配置 | 节点数 | 月费用 (阿里云) |
|------|---------|--------|----------------|
| 初创期 | 2核4G | 3 | ¥900 |
| 成长期 | 4核8G | 5 | ¥2,500 |
| 规模化 | 8核16G | 10 | ¥8,000 |

### 优化策略

1. **使用 Spot 实例**: 节省 60-70% 成本
2. **设置资源限制**: 避免资源浪费
3. **配置 HPA**: 按需自动扩缩容
4. **使用 Preemptible Pod**: 非关键任务使用抢占式实例

```yaml
# 使用 Spot 实例 (阿里云)
nodeSelector:
  workload.csi.aliyun.com/pod-type: spot

# 或使用成本优化策略
priorityClassName: system-cluster-critical  # 关键服务
priorityClassName: below-critical            # 非关键服务
```
