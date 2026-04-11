# OneRecycle 生产环境上线指南

**版本**: v1.0.0  
**日期**: 2026-04-11  
**适用项目**: OneRecycle 旧物回收平台

---

## 目录

1. [上线前检查清单](#一上线前检查清单)
2. [服务端部署](#二服务端部署)
3. [管理后台部署](#三管理后台部署)
4. [小程序上线](#四小程序上线)
5. [运维手册](#五运维手册)
6. [应急预案](#六应急预案)
7. [常见问题](#七常见问题)

---

## 一、上线前检查清单

### 1.1 服务端检查

| 检查项 | 状态 | 备注 |
|--------|------|------|
| ESLint 检查 | ⚠️ | 1042 个错误，主要集中在新一代 any 类型使用（语音订单模块） |
| TypeScript 类型检查 | ✅ | 通过 |
| 单元测试 | ✅ | 338/338 通过 |
| 安全扫描 | ✅ | 无硬编码敏感信息 |
| 数据库迁移 | ⏳ | 需在生产环境执行 |
| 环境配置 | ⏳ | 需配置生产环境变量 |

**已知问题**:
- ESLint 错误主要集中在 `voice-order` 模块（AI 功能已禁用），不影响生产运行
- 测试文件解析错误，需更新 `tsconfig.json` 配置

### 1.2 管理后台检查

| 检查项 | 状态 | 备注 |
|--------|------|------|
| TypeScript 类型检查 | ✅ | 通过 |
| ESLint 检查 | ⚠️ | 17 个警告（img 标签、hook 依赖） |
| 安全漏洞 | ❌ | 23 个漏洞，需升级 Next.js |
| 构建验证 | ⏳ | 待执行 |

**关键风险**:
- **Next.js 安全漏洞**: 当前版本 14.0.4 存在 3 个 Critical 漏洞，建议升级到 >=15.5.14
- 漏洞类型: 中间件授权绕过、缓存中毒、图像优化器 DoS

### 1.3 小程序检查

| 检查项 | 状态 | 备注 |
|--------|------|------|
| TypeScript 类型检查 | ❌ | 15 个类型错误 |
| 生产构建 | ✅ | 成功，产物 2.0M |
| 权限声明 | ✅ | 完整 |
| AI 功能禁用 | ⚠️ | 配置已禁用，但代码文件仍存在 |
| 调试代码清理 | ⚠️ | 100+ 处 console 语句 |

**需要修复**:
1. 修复 15 个 TypeScript 类型错误
2. 清理生产环境 console 语句
3. 删除或彻底禁用 AI 功能相关代码

---

## 二、服务端部署

### 2.1 环境要求

- **服务器**: 4核 8G 内存（推荐）
- **操作系统**: Ubuntu 22.04 LTS / CentOS 8
- **Docker**: >= 24.0
- **Docker Compose**: >= 2.20

### 2.2 环境变量配置

创建 `/opt/one-recycle/deploy/config/.env`:

```bash
# 基础配置
NODE_ENV=production
DOMAIN=backbuy.cn

# 数据库
DB_USERNAME=one_recycle
DB_PASSWORD=<强密码>
DB_NAME=one_recycle

# Redis
REDIS_PASSWORD=<强密码>

# JWT
JWT_SECRET=<32位以上随机字符串>

# 微信支付
WECHAT_APP_ID=your-app-id
WECHAT_APP_SECRET=your-app-secret
WECHAT_MCH_ID=your-mch-id
WECHAT_API_KEY=your-api-key

# 支付宝
ALIPAY_APP_ID=your-app-id
ALIPAY_PRIVATE_KEY=your-private-key
ALIPAY_PUBLIC_KEY=your-public-key

# 腾讯云 COS
OSS_TYPE=TENCENT_COS
OSS_ACCESS_KEY=your-secret-id
OSS_SECRET_KEY=your-secret-key
OSS_BUCKET=one-recycle
OSS_REGION=ap-guangzhou
```

### 2.3 部署步骤

```bash
# 1. 登录服务器
ssh root@101.42.31.216

# 2. 进入项目目录
cd /opt/one-recycle

# 3. 拉取最新代码
git pull origin prod

# 4. 执行部署脚本
./deploy/scripts/deploy.sh --update

# 5. 验证部署
curl http://localhost:3002/health
curl http://localhost:3000/api/docs
```

### 2.4 服务端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| nginx | 80, 443 | 反向代理 |
| api-gateway | 3002 | API 网关 |
| account-service | 3001 | 账户服务 |
| order-service | 3003 | 订单服务 |
| notification-service | 3004 | 通知服务 |
| inventory-service | 3009 | 库存服务 |
| category-service | 3008 | 分类服务 |
| admin-web | 3000 | 管理后台 |
| postgres | 5432 | 数据库 |
| redis | 6379 | 缓存 |

---

## 三、管理后台部署

### 3.1 构建步骤

```bash
cd apps/admin-web

# 1. 安装依赖
npm install

# 2. 类型检查
npm run typecheck

# 3. 代码检查
npm run lint

# 4. 生产构建
npm run build
```

### 3.2 环境变量

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.backbuy.cn
NODE_ENV=production
```

### 3.3 安全加固（重要）

**升级 Next.js 修复安全漏洞**:

```bash
# 升级 Next.js 到安全版本
npm install next@15.5.14

# 验证升级
npm audit
```

---

## 四、小程序上线

### 4.1 前置检查

#### 修复 TypeScript 错误

```bash
cd apps/mini-client

# 查看错误
npm run typecheck

# 修复以下文件中的类型错误：
# - ChatMessageList.tsx:41
# - VoiceOrderFlow/ChatMessageList.tsx:25
# - VoiceOrderFlow/index.tsx:123
# - useMessages.ts:38
# - useVoiceDialog.ts:322
# - customer/index.tsx:167
# - referral/index.tsx（未使用变量）
# - voice-order/index.tsx:17
# - referral.ts:39,43,47,51
```

#### 清理调试代码

在以下文件中添加环境判断或删除 console 语句：

```typescript
// 修改前
console.log('[API Request]', url);

// 修改后
if (process.env.NODE_ENV === 'development') {
  console.log('[API Request]', url);
}
```

主要涉及文件：
- `src/utils/request.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useWebSocket.ts`
- `src/utils/storage.ts`
- 各页面文件

#### 禁用 AI 功能代码

```bash
# 删除或注释以下入口
# src/pages/points-mall/index.tsx 第 253-259 行（赚积分入口）

# 可选：删除以下 AI 功能文件
# rm -rf src/pages/voice-order
# rm -rf src/pages/points-mall/signin
# rm -rf src/pages/points-mall/tasks
# rm -rf src/components/VoiceOrderFlow
# rm -rf src/hooks/useVoiceDialog.ts
# rm -rf src/hooks/useVoiceRecognition.ts
```

### 4.2 生产构建

```bash
cd apps/mini-client

# 1. 设置生产环境 API
# 修改 config/prod.ts
export default {
  API_BASE_URL: 'https://api.backbuy.cn',
  ENV: 'production'
}

# 2. 执行构建
npm run build:weapp

# 3. 检查构建产物大小
du -sh dist/
# 应小于 2MB
```

### 4.3 微信开发者工具上传

1. **打开微信开发者工具**
   - 下载地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

2. **导入项目**
   - 项目目录: `apps/mini-client/dist`
   - AppID: `wx03352163af5392f7`

3. **上传代码**
   - 点击右上角"上传"按钮
   - 版本号: `1.0.0`
   - 项目备注: `OneRecycle 旧物回收平台首次上线`

### 4.4 提交审核

1. **登录微信公众平台**
   - 地址: https://mp.weixin.qq.com

2. **进入版本管理**
   - 管理 → 版本管理 → 开发版本

3. **提交审核**
   - 点击"提交审核"
   - 填写功能描述:
     ```
     OneRecycle 旧物回收平台，提供以下功能：
     1. 一键预约上门回收旧书、旧衣等闲置物品
     2. 查看订单状态和物流信息
     3. 积分兑换和提现功能
     4. 地址管理和个人信息维护
     ```

4. **准备审核材料**
   - 小程序截图（5张以上）
   - 服务类目: 生活服务 > 回收/废品回收
   - 隐私政策链接: https://backbuy.cn/privacy
   - 用户协议链接: https://backbuy.cn/terms

---

## 五、运维手册

### 5.1 日常运维命令

```bash
# 查看服务状态
docker compose -f docker-compose.production.yml ps

# 查看日志
docker compose -f docker-compose.production.yml logs -f api-gateway
docker compose -f docker-compose.production.yml logs -f order-service

# 重启服务
docker compose -f docker-compose.production.yml restart api-gateway

# 重新构建
docker compose -f docker-compose.production.yml build --parallel

# 数据库备份
docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > backup_$(date +%Y%m%d).sql

# Redis 监控
docker exec one-recycle-redis redis-cli -a <password> info
```

### 5.2 健康检查

```bash
# API 健康检查
curl http://localhost:3002/health

# 数据库连接检查
curl http://localhost:3002/health/db

# Redis 连接检查
curl http://localhost:3002/health/redis

# 管理后台检查
curl http://localhost:3000
```

### 5.3 监控告警配置

**推荐监控项**:

| 监控项 | 阈值 | 告警方式 |
|--------|------|----------|
| API 响应时间 | > 1000ms | 钉钉/企业微信 |
| 数据库连接数 | > 80% | 钉钉/企业微信 |
| Redis 内存使用 | > 80% | 钉钉/企业微信 |
| 磁盘使用 | > 80% | 钉钉/企业微信 |
| 服务宕机 | - | 电话 + 短信 |

### 5.4 日志管理

```bash
# 查看实时日志
docker compose logs -f --tail=100

# 导出日志
docker compose logs api-gateway > api-gateway.log

# 清理旧日志
docker system prune -f
```

---

## 六、应急预案

### 6.1 服务故障处理

#### 场景 1: API 服务无响应

```bash
# 1. 检查服务状态
docker compose ps

# 2. 检查资源使用
docker stats

# 3. 重启服务
docker compose restart api-gateway

# 4. 检查日志
docker compose logs --tail=100 api-gateway
```

#### 场景 2: 数据库连接失败

```bash
# 1. 检查数据库状态
docker exec one-recycle-postgres pg_isready -U one_recycle

# 2. 检查连接数
docker exec one-recycle-postgres psql -U one_recycle -c "SELECT count(*) FROM pg_stat_activity;"

# 3. 重启数据库（谨慎操作）
docker compose restart postgres
```

#### 场景 3: 需要紧急回滚

```bash
# 1. 停止服务
docker compose down

# 2. 切换到上一个版本
git checkout <previous_commit>

# 3. 重新部署
./deploy/scripts/deploy.sh --update

# 4. 数据库回滚（如有必要）
pg_restore -h localhost -U one_recycle -d one_recycle backup_file.sql
```

### 6.2 联系清单

| 角色 | 姓名 | 联系方式 | 职责 |
|------|------|----------|------|
| 技术负责人 | - | - | 技术决策、架构调整 |
| 运维负责人 | - | - | 服务器、网络、部署 |
| 产品负责人 | - | - | 业务决策、用户沟通 |
| 客服负责人 | - | - | 用户反馈、问题收集 |

---

## 七、常见问题

### Q1: 部署后 API 返回 502

**原因**: Nginx 无法连接到后端服务

**解决**:
```bash
# 检查服务是否运行
docker compose ps

# 检查 Nginx 配置
docker exec one-recycle-nginx nginx -t

# 重启 Nginx
docker compose restart nginx
```

### Q2: 数据库迁移失败

**原因**: 数据库锁定或迁移文件冲突

**解决**:
```bash
# 1. 进入数据库容器
docker exec -it one-recycle-postgres psql -U one_recycle

# 2. 查看迁移状态
SELECT * FROM _prisma_migrations;

# 3. 如有失败的迁移，手动修复后标记为成功
UPDATE _prisma_migrations SET finished_at = NOW() WHERE id = 'xxx';
```

### Q3: 小程序审核被拒

**常见原因**:
1. 服务类目选择不正确
2. 隐私政策不完整
3. 功能描述不清晰
4. 包含未开放功能

**解决**:
- 确保选择"生活服务 > 回收/废品回收"类目
- 隐私政策需包含：信息收集范围、使用目的、存储期限、联系方式
- 功能描述需详细说明用户操作流程
- 确保 AI 功能已完全禁用

### Q4: 支付功能异常

**排查步骤**:
1. 检查微信支付/支付宝配置是否正确
2. 检查回调地址是否可访问
3. 检查 SSL 证书是否有效
4. 查看支付服务日志

---

## 附录

### A. 环境变量完整清单

```bash
# 基础配置
NODE_ENV=production
PORT=3001
DOMAIN=backbuy.cn

# 数据库
DATABASE_URL=postgresql://user:pass@localhost:5432/one_recycle

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=xxx

# JWT
JWT_SECRET=xxx
JWT_EXPIRES_IN=15m

# 微信支付
WECHAT_APP_ID=xxx
WECHAT_APP_SECRET=xxx
WECHAT_MCH_ID=xxx
WECHAT_API_KEY=xxx

# 支付宝
ALIPAY_APP_ID=xxx
ALIPAY_PRIVATE_KEY=xxx
ALIPAY_PUBLIC_KEY=xxx

# 腾讯云 COS
OSS_TYPE=TENCENT_COS
OSS_ACCESS_KEY=xxx
OSS_SECRET_KEY=xxx
OSS_BUCKET=one-recycle
OSS_REGION=ap-guangzhou
```

### B. 目录结构

```
/opt/one-recycle/
├── deploy/
│   ├── config/.env           # 环境变量
│   ├── docker/
│   │   └── docker-compose.production.yml
│   ├── nginx/
│   │   └── nginx.conf
│   └── ssl/                  # SSL 证书
├── server/                   # 后端代码
├── apps/admin-web/          # 管理后台
├── apps/mini-client/        # 小程序
└── docs/                    # 文档
```

---

**文档维护**: 技术团队  
**最后更新**: 2026-04-11
