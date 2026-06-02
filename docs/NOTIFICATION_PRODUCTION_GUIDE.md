# 🚀 通知系统生产环境部署指南

## 📋 变更摘要

已将通知服务从**模拟逻辑**升级为**生产可用的完整实现**，支持以下渠道：

| 渠道 | 状态 | 支持的服务商 |
|------|------|-------------|
| **SMS (短信)** | ✅ 生产就绪 | 阿里云 SMS、腾讯云 SMS、通用 HTTP |
| **Email (邮件)** | ✅ 生产就绪 | SMTP (Gmail/企业邮箱/SendGrid) |
| **Push (推送)** | ✅ 生产就绪 | FCM、JPush、个推、通用 HTTP |
| **Webhook** | ✅ 生产就绪 | 任意 Webhook 端点 |
| **In-App (站内信)** | ✅ 生产就绪 | Redis 存储 |

---

## 🔧 配置说明

### 1️⃣ 环境变量配置

在 `server/.env` 中添加以下配置：

```bash
# ===== SMS 配置（二选一）=====
# 阿里云 SMS（推荐）
ALIYUN_SMS_ACCESS_KEY_ID=your_access_key_id
ALIYUN_SMS_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_SMS_SIGN_NAME=OneRecycle

# 腾讯云 SMS
TENCENT_SMS_SECRET_ID=your_secret_id
TENCENT_SMS_SECRET_KEY=your_secret_key
TENCENT_SMS_SDK_APP_ID=your_sdk_app_id
TENCENT_SMS_SIGN_NAME=OneRecycle

# ===== Email 配置 =====
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=OneRecycle
EMAIL_FROM_ADDRESS=noreply@onerecycle.com

# ===== Push 推送配置（可选多个）=====
# Firebase Cloud Messaging
FCM_SERVER_KEY=your_fcm_server_key
FCM_PROJECT_ID=your_project_id

# JPush（极光推送）
JPUSH_APP_KEY=your_app_key
JPUSH_MASTER_SECRET=your_master_secret

# 个推
GETUI_APP_ID=your_app_id
GETUI_APP_KEY=your_app_key
GETUI_MASTER_SECRET=your_master_secret
```

### 2️⃣ 数据库配置（推荐方式）

通过 Admin Web 后台或 API 配置 Provider：

```bash
# 示例：创建阿里云 SMS Provider 配置
curl -X POST http://localhost:3000/api/notification-provider-configs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "阿里云短信",
    "type": "SMS",
    "provider": "aliyun-sms",
    "isActive": true,
    "apiKey": "${ALIYUN_SMS_ACCESS_KEY_ID}",
    "apiSecret": "${ALIYUN_SMS_ACCESS_KEY_SECRET}",
    "config": {
      "signName": "OneRecycle"
    },
    "endpoint": "https://dysmsapi.aliyuncs.com"
  }'
```

---

## 📦 安装依赖

根据你使用的服务商，安装相应的 SDK：

```bash
cd server

# 基础依赖（必须）
npm install nodemailer @types/nodemailer

# 可选依赖（按需安装）

# 腾讯云 SMS
npm install tencentcloud-sdk-nodejs

# 极光推送
npm install jpush-sdk @types/jpush-sdk

# 个推
npm install gt-sdk-nodejs @types/gt-sdk-nodejs
```

> ⚠️ **注意**：阿里云 SDK (`@alicloud/pop-core`) 已预装，无需额外安装。

---

## 🎯 使用示例

### 发送短信通知

```typescript
// 在业务代码中调用
await notificationService.sendSms({
  phone: '+8613800138000',
  template: 'SMS_123456789',  // 阿里云/腾讯云模板ID
  params: {
    code: '123456',           // 模板变量
    product: 'One Recycle'
  }
});
```

### 发送邮件通知

```typescript
await notificationService.sendEmail({
  to: 'user@example.com',
  subject: '订单确认',
  content: '<h1>您的订单已提交</h1><p>订单号：ORD20240101001</p>',
});

// 或使用模板
await notificationService.sendEmail({
  to: 'user@example.com',
  subject: '密码重置',
  template: 'reset-password',
  params: { resetLink: 'https://...' }
});
```

### 发送推送通知

```typescript
await notificationService.sendPush({
  userId: 'device_token_or_user_id',
  title: '新订单通知',
  content: '您有一个新的回收订单待处理',
  data: {
    orderId: 'ORD001',
    action: 'VIEW_ORDER',
    deepLink: '/orders/ORD001'
  }
});
```

### 通过模板发送（多渠道同时）

```typescript
// 自动根据模板配置的渠道发送（SMS + Email + Push）
await notificationService.sendByTemplateType(
  TemplateType.ORDER_CONFIRMATION,
  { 
    orderNo: 'ORD001', 
    pickupTime: '2024-01-01 10:00' 
  },
  {
    sms: { phone: '+8613800138000' },
    email: { to: 'user@example.com' },
    push: { userId: 'user_123' }
  }
);
```

---

## 🔐 安全建议

### 1. 凭证管理

```bash
# ❌ 不要在代码中硬编码凭证
const secretKey = 'xxx';  # 危险！

# ✅ 使用环境变量或密钥管理服务
const secretKey = process.env.TENCENT_SMS_SECRET_KEY;
```

### 2. 权限控制

为不同的环境（开发/测试/生产）使用不同的服务商账号：
- **开发环境**：使用测试签名和模板
- **生产环境**：使用已审核的正式签名和模板

### 3. 限流保护

```typescript
// 已内置基础限流，可在 config 中调整
deliveryOptions: {
  maxRetries: 3,        // 最大重试次数
  retryDelay: 1000,     // 初始重试延迟(ms)
}
```

---

## 📊 监控与日志

### 日志输出示例

```
✅ Notification 123456789 delivered successfully via aliyun-sms (234ms)
✅ Aliyun SMS sent successfully. BizId: 8901234567890
✅ Email sent successfully. MessageId: <aabbccdd@example.com>
✅ Push notification sent via fcm
❌ Failed to process notification 987654321: No enabled SMS provider found
```

### 性能指标

每次发送都会记录：
- `processingTime`: 处理耗时（毫秒）
- `messageId`: 消息唯一标识
- `externalId`: 第三方服务商返回的消息ID
- `cost`: 费用（基于配置的成本表）

---

## 🔄 重试机制

当发送失败时，系统会自动重试：

- **指数退避策略**: 1s → 2s → 4s → ... → 最大 30s
- **最大重试次数**: 默认 3 次（可配置）
- **状态跟踪**: 每次重试更新 `retryCount`
- **最终失败**: 超过最大重试次数后标记为 FAILED

---

## 🧪 测试验证

### 单元测试

```bash
cd server
npm run test -- --testPathPattern="notification"
```

### 手动测试脚本

```typescript
// scripts/test-notification.ts
import { NotificationService } from './src/modules/notification/services/notification.service';

async function test() {
  const service = new NotificationService(/* deps */);
  
  // 测试 SMS
  const smsResult = await service.sendSms({
    phone: '+8613800138000',
    template: 'TEST_TEMPLATE',
    params: { code: '123456' }
  });
  console.log('SMS Result:', smsResult);
  
  // 测试 Email
  const emailResult = await service.sendEmail({
    to: 'test@example.com',
    subject: 'Test Email',
    content: '<h1>Test</h1>'
  });
  console.log('Email Result:', emailResult);
}

test().catch(console.error);
```

---

## 🆘 故障排查

### 常见问题

#### 1. 阿里云 SMS 发送失败

```
Error: isv.SMS_SIGNATURE_ILLEGAL
```

**解决方案**:
- 检查签名是否通过审核
- 确认签名名称与配置一致

#### 2. 邮件发送超时

```
Error: connect ETIMEDOUT
```

**解决方案**:
- 检查 SMTP 服务器地址和端口
- 确认网络可访问（特别是 GFW 环境）
- 尝试使用 587 端口 + STARTTLS

#### 3. 推送送达率低

**可能原因**:
- 设备 Token 过期
- 用户关闭了通知权限
- 应用被系统杀后台

**解决方案**:
- 定期刷新设备 Token
- 使用厂商通道（小米、华为、OPPO 等）
- 结合 In-App 消息兜底

---

## 📈 扩展建议

### 1. 添加更多服务商

在 `sendSms()` 的 switch 语句中添加新的 case：

```typescript
case 'twilio':
  return await this.sendTwilioSms(data, config);
case 'aws-sns':
  return await this.sendAwssSms(data, config);
```

### 2. 消息队列集成

当前实现使用内存 `setTimeout` 进行重试。生产环境建议：

```typescript
// 使用 Bull Queue（项目已集成）
@Process()
async handleNotification(job: Job<Notification>) {
  await this.processNotification(job.data);
}
```

### 3. 多服务商容灾

```typescript
// 主服务商失败时自动切换到备用服务商
async sendWithFallback(data) {
  try {
    return await this.sendViaPrimary(data);
  } catch (error) {
    this.logger.warn('Primary provider failed, trying fallback');
    return await this.sendViaFallback(data);
  }
}
```

---

## ✅ 上线检查清单

- [ ] 所有环境变量已正确配置
- [ ] 第三方服务商账号已开通并审核通过
- [ ] 短信/邮件模板已审核
- [ ] 推送证书已上传（iOS）
- [ ] 测试环境验证通过
- [ ] 监控告警已配置
- [ ] 费用预算已设置（防止异常消耗）
- [ ] 应急预案已制定（服务商宕机时的降级方案）

---

## 📞 技术支持

如遇到问题，请检查：

1. **日志文件**: 查看 NestJS 应用日志
2. **数据库**: 检查 `notifications` 表的状态字段
3. **服务商控制台**: 
   - [阿里云短信控制台](https://dysms.console.aliyun.com)
   - [腾讯云短信控制台](https://console.cloud.tencent.com/sms)
   - [Firebase Console](https://console.firebase.google.com)

---

**最后更新时间**: 2024-01-01  
**适用版本**: One Recycle v1.0+
