# One-Recycle 部署检查清单

**版本**: v1.0.0
**日期**: 2026-02-23

---

## 一、部署前检查

### 1.1 代码质量检查

| 检查项 | 命令 | 状态 |
|-------|------|------|
| 单元测试 | `npm run test:cov:unit` | ✅ 338/338 通过 |
| 代码规范 | `npm run lint` | 待执行 |
| 类型检查 | `npm run typecheck` | 待执行 |
| 构建检查 | `npm run build` | 待执行 |

### 1.2 环境变量检查

```bash
# 必需的环境变量
PORT=3008
NODE_ENV=production
DATABASE_URL="postgresql://..."
REDIS_HOST=...
REDIS_PORT=6379
JWT_SECRET=...
JWT_EXPIRES_IN=604800

# 支付配置
WECHAT_APP_ID=...
WECHAT_APP_SECRET=...
ALIPAY_APP_ID=...
ALIPAY_PRIVATE_KEY=...

# OSS配置
OSS_ACCESS_KEY=...
OSS_SECRET_KEY=...
OSS_BUCKET=...
OSS_REGION=...
```

### 1.3 数据库准备

```bash
# 执行数据库迁移
npx prisma migrate deploy

# 验证数据库连接
npx prisma db pull

# 检查数据库状态
npx prisma migrate status
```

---

## 二、服务部署顺序

### 2.1 基础服务

1. **PostgreSQL**
   ```bash
   docker compose up -d postgres
   # 等待健康检查通过
   ```

2. **Redis**
   ```bash
   docker compose up -d redis
   # 验证连接
   redis-cli ping
   ```

3. **MinIO (可选)**
   ```bash
   docker compose up -d minio
   ```

### 2.2 应用服务

1. **安装依赖**
   ```bash
   npm ci --production
   ```

2. **构建应用**
   ```bash
   npm run build
   ```

3. **启动服务**
   ```bash
   pm2 start ecosystem.config.js
   ```

---

## 三、功能验证清单

### 3.1 订单功能

| 功能点 | 测试方法 | 预期结果 | 状态 |
|-------|---------|---------|------|
| 创建订单 | POST /orders | 返回订单ID | [ ] |
| 查询订单 | GET /orders/:id | 返回订单详情 | [ ] |
| 更新状态 | PUT /orders/:id/status | 状态更新成功 | [ ] |
| 取消订单 | PATCH /orders/:id/cancel | 状态变为CANCELLED | [ ] |
| 订单列表 | GET /orders | 返回分页列表 | [ ] |

### 3.2 支付功能

| 功能点 | 测试方法 | 预期结果 | 状态 |
|-------|---------|---------|------|
| 创建支付 | POST /payments | 返回支付ID | [ ] |
| 支付回调 | POST /payments/notify | 处理成功 | [ ] |
| 查询支付 | GET /payments/:id | 返回支付详情 | [ ] |

### 3.3 提现功能

| 功能点 | 测试方法 | 预期结果 | 状态 |
|-------|---------|---------|------|
| 创建提现 | POST /withdrawals | 返回提现ID | [ ] |
| 提现列表 | GET /withdrawals/me | 返回用户提现记录 | [ ] |
| 处理提现 | POST /withdrawals/:id/process | 状态更新 | [ ] |

### 3.4 账户功能

| 功能点 | 测试方法 | 预期结果 | 状态 |
|-------|---------|---------|------|
| 查询余额 | GET /accounts/balance | 返回余额信息 | [ ] |
| 交易记录 | GET /accounts/transactions | 返回交易列表 | [ ] |

---

## 四、监控配置

### 4.1 日志配置

- [ ] 日志级别设置为 `info`
- [ ] 日志输出到文件
- [ ] 日志轮转配置

### 4.2 健康检查

```bash
# API健康检查
curl http://localhost:3008/health

# 数据库连接检查
curl http://localhost:3008/health/db

# Redis连接检查
curl http://localhost:3008/health/redis
```

### 4.3 告警配置

- [ ] 服务宕机告警
- [ ] 数据库连接失败告警
- [ ] Redis连接失败告警
- [ ] 支付失败告警

---

## 五、回滚方案

### 5.1 快速回滚

```bash
# 1. 停止服务
pm2 stop all

# 2. 切换版本
git checkout <previous_version>

# 3. 重新安装依赖
npm ci --production

# 4. 重新构建
npm run build

# 5. 重启服务
pm2 restart all
```

### 5.2 数据库回滚

```bash
# 恢复最近的备份
pg_restore -h localhost -U postgres -d one_recycle /backup/latest.dump
```

### 5.3 紧急停服

```bash
# 立即停止所有服务
pm2 stop all
# 或
pm2 delete all
```

---

## 六、上线后验证

### 6.1 冒烟测试

- [ ] 用户登录正常
- [ ] 订单创建正常
- [ ] 支付流程正常
- [ ] 提现流程正常
- [ ] 通知推送正常

### 6.2 性能验证

- [ ] API响应时间 < 500ms
- [ ] 数据库查询时间 < 100ms
- [ ] 无内存泄漏

### 6.3 安全验证

- [ ] 未授权访问被拒绝
- [ ] 敏感数据已加密
- [ ] SQL注入防护有效

---

## 七、联系方式

| 角色 | 姓名 | 联系方式 |
|-----|------|---------|
| 技术负责人 | - | - |
| 运维负责人 | - | - |
| 产品负责人 | - | - |

---

**检查清单版本**: 1.0
**最后更新**: 2026-02-23
