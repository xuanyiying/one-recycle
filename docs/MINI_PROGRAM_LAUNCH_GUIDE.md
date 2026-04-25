# OneRecycle 微信小程序上线指南

**版本**: v1.0.0  
**日期**: 2026-04-11  
**小程序名称**: 易书回收 (yishu-recycle)  
**AppID**: wx03352163af5392f7

---

## 目录

1. [上线前准备](#一上线前准备)
2. [代码准备](#二代码准备)
3. [微信开发者工具操作](#三微信开发者工具操作)
4. [提交审核](#四提交审核)
5. [审核后发布](#五审核后发布)
6. [版本管理](#六版本管理)
7. [常见问题](#七常见问题)

---

## 一、上线前准备

### 1.1 检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 类型错误修复 | ❌ | 15 个错误待修复 |
| 调试代码清理 | ⚠️ | 100+ 处 console 语句 |
| AI 功能禁用 | ⚠️ | 配置已禁用，代码需清理 |
| 生产环境 API | ⏳ | 需配置为 https://backbuy.cn/api（兼容入口：https://api.backbuy.cn） |
| 隐私政策 | ⏳ | 需准备隐私政策页面 |
| 用户协议 | ⏳ | 需准备用户协议页面 |

### 1.2 必须修复的问题

#### 问题 1: TypeScript 类型错误（阻塞）

**文件列表**:
- `ChatMessageList.tsx:41` - Object is possibly 'undefined'
- `VoiceOrderFlow/ChatMessageList.tsx:25` - Object is possibly 'undefined'
- `VoiceOrderFlow/index.tsx:123` - 'lastMessage' is possibly 'undefined'
- `useMessages.ts:38` - Type 'string \| undefined' is not assignable to type 'string'
- `useVoiceDialog.ts:322` - Argument of type 'DialogStep \| undefined' is not assignable
- `customer/index.tsx:167` - Type 'string \| undefined' is not assignable to type 'string'
- `referral/index.tsx` - 未使用变量（ScrollView, loading, onShareAppMessage, onShareTimeline）
- `voice-order/index.tsx:17` - 'user' is declared but its value is never read
- `referral.ts:39,43,47,51` - Expected 0-1 type arguments, but got 2

**修复示例**:
```typescript
// 修复前
const message = messages[0].content;

// 修复后
const message = messages[0]?.content;
```

#### 问题 2: 调试代码清理

**快速修复方案** - 添加环境判断：

```typescript
// src/utils/request.ts
const isDev = process.env.NODE_ENV === 'development';

// 修改所有 console 语句
if (isDev) {
  console.log(`[API Request] ${options.method} ${fullUrl}`);
}
```

**涉及文件**:
- `src/utils/request.ts` (2 处)
- `src/hooks/useAuth.ts` (9 处)
- `src/hooks/useWebSocket.ts` (8 处)
- `src/utils/storage.ts` / `src/store/useStore.ts` (12 处)
- 各页面文件 (60+ 处)

#### 问题 3: AI 功能彻底禁用

**需要删除或注释的入口**:

```typescript
// src/pages/points-mall/index.tsx 第 253-259 行
// 注释掉"赚积分"入口

// 修改前
<Button onClick={() => navigateTo('/pages/points-mall/tasks/index')}>
  赚积分
</Button>

// 修改后
// <Button onClick={() => navigateTo('/pages/points-mall/tasks/index')}>
//   赚积分
// </Button>
```

**可选：删除 AI 功能文件**（如确定不再使用）:
```bash
cd apps/mini-client/src

# 删除语音下单相关
rm -rf pages/voice-order
rm -rf components/VoiceOrderFlow
rm -rf hooks/useVoiceDialog.ts
rm -rf hooks/useVoiceRecognition.ts

# 删除积分任务相关
rm -rf pages/points-mall/signin
rm -rf pages/points-mall/tasks
```

---

## 二、代码准备

### 2.1 配置生产环境

#### 修改 API 配置

```typescript
// config/prod.ts
export default {
  API_BASE_URL: 'https://backbuy.cn/api',
  ENV: 'production',
  // 其他配置...
};
```

#### 检查 app.config.ts

```typescript
// src/app.config.ts
export default {
  // 确保 pages 中不包含已禁用的页面
  pages: [
    'pages/index/index',
    'pages/login/index',
    // ... 其他页面
    // 'pages/voice-order/index',  // 确保已注释
  ],
  
  // 确保 tabBar 中不包含已禁用的页面
  tabBar: {
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      // { pagePath: 'pages/voice-order/index', text: '语音下单' },  // 确保已注释
      { pagePath: 'pages/order/index', text: '订单' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ]
  },
  
  // 权限声明
  permission: {
    'scope.userLocation': {
      desc: '用于获取位置信息，展示附近回收点并提供上门服务范围'
    },
    'scope.camera': {
      desc: '用于拍摄物品照片，便于估价与下单'
    },
    'scope.writePhotosAlbum': {
      desc: '用于从相册选择物品或头像照片'
    }
  },
  requiredPrivateInfos: [
    'getLocation',
    'chooseLocation'
  ]
};
```

### 2.2 生产构建

```bash
cd apps/mini-client

# 1. 安装依赖
npm install

# 2. 类型检查（确保无错误）
npm run typecheck

# 3. 生产构建
npm run build:weapp

# 4. 检查构建产物
du -sh dist/
# 输出应小于 2MB
```

**构建成功标志**:
```
✅ 构建完成
📦 包大小: 2.0M
📁 输出目录: dist/
```

---

## 三、微信开发者工具操作

### 3.1 安装与登录

1. **下载微信开发者工具**
   - 地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - 选择稳定版下载安装

2. **登录开发者工具**
   - 使用微信扫码登录
   - 确保账号有小程序开发权限

### 3.2 导入项目

1. **点击"导入项目"**

2. **填写项目信息**:
   - 目录: `/Users/yiying/dev-app/one-recycle/apps/mini-client/dist`
   - AppID: `wx03352163af5392f7`
   - 项目名称: `易书回收`
   - 点击"确定"

3. **检查项目配置**:
   - 详情 → 本地设置
   - 确保"不校验合法域名"未勾选（生产环境）
   - 确保"上传代码时样式自动补全"已勾选

### 3.3 代码上传

1. **预览测试**
   - 点击"预览"按钮
   - 扫码在真机上测试
   - 验证核心功能：
     - [ ] 首页加载正常
     - [ ] 登录流程正常
     - [ ] 回收下单流程正常
     - [ ] 订单列表正常
     - [ ] 个人中心正常

2. **上传代码**
   - 点击右上角"上传"按钮
   - 版本号: `1.0.0`
   - 项目备注:
     ```
     OneRecycle 旧物回收平台首次上线
     - 一键预约上门回收
     - 订单状态跟踪
     - 积分兑换与提现
     - 地址管理
     ```
   - 点击"上传"

3. **上传成功确认**
   - 提示"上传成功"
   - 记录版本号 `1.0.0`

---

## 四、提交审核

### 4.1 登录微信公众平台

1. 访问 https://mp.weixin.qq.com
2. 使用小程序管理员微信扫码登录
3. 进入"易书回收"小程序管理后台

### 4.2 进入版本管理

1. 左侧菜单 → 管理 → 版本管理
2. 在"开发版本"中找到刚上传的版本 `1.0.0`
3. 点击"提交审核"

### 4.3 填写审核信息

#### 功能页面配置

| 功能页面 | 页面路径 | 备注 |
|----------|----------|------|
| 首页 | pages/index/index | 主要功能入口 |
| 回收下单 | pages/recycle/index | 核心功能 |
| 订单列表 | pages/order/index | 订单管理 |
| 个人中心 | pages/profile/index | 用户信息 |

#### 测试账号（如需要）

- 测试账号: （如需要测试特定功能）
- 测试密码: 

#### 功能描述

```
OneRecycle 旧物回收平台，提供便捷的上门回收服务：

1. 一键预约：用户选择回收物品类型（旧书、旧衣等），填写地址和预约时间，提交订单
2. 上门回收：回收员按预约时间上门取件
3. 订单跟踪：实时查看订单状态和物流信息
4. 积分系统：回收完成后获得积分，可用于兑换商品或提现
5. 地址管理：管理多个收货地址
6. 个人中心：查看账户余额、交易记录、个人信息

核心业务流程：
用户下单 → 系统派单 → 回收员取件 → 仓库验货 → 积分结算 → 用户提现
```

#### 备注

```
1. 本小程序为旧物回收平台，服务类目为"生活服务-回收/废品回收"
2. 已按照要求禁用所有 AI 功能（语音下单、AI 客服、签到任务等）
3. 用户隐私数据仅用于订单处理和物流配送，严格遵守隐私保护规范
4. 支付功能仅用于用户提现，不涉及商品销售
```

### 4.4 准备审核材料

#### 必需材料

1. **小程序截图**（5张以上）
   - 首页截图
   - 回收下单页面
   - 订单列表页面
   - 订单详情页面
   - 个人中心页面
   - 积分商城页面（如启用）

2. **服务类目资质**
   - 类目: 生活服务 > 回收/废品回收
   - 所需资质: 营业执照（经营范围包含回收业务）

3. **隐私政策**
   - 链接: https://backbuy.cn/privacy.html
   - 内容要求:
     - 信息收集范围（手机号、地址、位置等）
     - 信息使用目的（订单处理、物流配送）
     - 信息存储期限
     - 用户权利（查看、修改、删除）
     - 联系方式

4. **用户协议**
   - 链接: https://backbuy.cn/terms.html
   - 内容要求:
     - 服务条款
     - 用户责任
     - 平台责任
     - 争议解决

### 4.5 提交审核

1. 确认所有信息填写完整
2. 勾选"已阅读并同意《微信小程序平台审核规范》"
3. 点击"提交审核"
4. 记录审核单号

**审核时间**: 通常 1-7 个工作日

---

## 五、审核后发布

### 5.1 审核通过

1. 收到审核通过通知（微信推送 + 邮件）
2. 登录微信公众平台
3. 版本管理 → 审核版本
4. 点击"发布"
5. 确认发布

**发布后生效时间**: 通常 5-30 分钟

### 5.2 审核被拒处理

#### 常见拒绝原因

| 拒绝原因 | 解决方案 |
|----------|----------|
| 服务类目不正确 | 修改为"生活服务-回收/废品回收" |
| 隐私政策不完整 | 补充信息收集范围、使用目的、存储期限等 |
| 包含未开放功能 | 彻底删除或禁用 AI 功能代码 |
| 功能描述不清晰 | 详细描述用户操作流程 |
| 截图不完整 | 补充核心功能页面截图 |

#### 重新提交

1. 根据拒绝原因修改代码或材料
2. 重新构建并上传代码
3. 更新版本号（如 1.0.1）
4. 重新提交审核

---

## 六、版本管理

### 6.1 版本号规范

采用语义化版本号: `主版本.次版本.修订号`

- **主版本**: 重大功能更新，不兼容的 API 修改
- **次版本**: 功能新增，向下兼容
- **修订号**: 问题修复，向下兼容

**示例**:
- `1.0.0` - 首次上线
- `1.1.0` - 新增功能（如新增回收品类）
- `1.1.1` - 修复 Bug
- `2.0.0` - 重大改版

### 6.2 版本发布流程

```
开发 → 测试 → 上传 → 提交审核 → 审核通过 → 发布
```

### 6.3 灰度发布

支持灰度发布，逐步放量：

1. 版本管理 → 线上版本
2. 点击"灰度发布"
3. 设置灰度比例（如 10%）
4. 观察监控数据
5. 逐步扩大比例至 100%

---

## 七、常见问题

### Q1: 上传代码失败

**可能原因**:
- 代码包超过 2MB
- 包含违规内容
- 文件路径过长

**解决**:
```bash
# 检查包大小
du -sh dist/

# 如超过 2MB，检查：
# 1. 图片资源是否过大
# 2. 是否包含不必要的文件
# 3. 是否启用分包
```

### Q2: 审核被驳回"包含未开放功能"

**检查清单**:
- [ ] voice-order 页面已从 pages 中移除
- [ ] signin 页面已从 subpackages 中移除
- [ ] tasks 页面已从 subpackages 中移除
- [ ] tabBar 中不包含语音下单
- [ ] 积分商城中没有跳转到签到/任务的入口

### Q3: 真机调试正常，审核不通过

**可能原因**:
- 审核人员测试账号无数据
- 特定场景未处理

**解决**:
- 提供测试账号
- 在备注中详细说明测试步骤
- 确保空数据状态有友好提示

### Q4: 如何更新已上线版本

```bash
# 1. 修改代码
# ...

# 2. 更新版本号（package.json）
# "version": "1.0.1"

# 3. 重新构建
npm run build:weapp

# 4. 微信开发者工具上传新版本

# 5. 微信公众平台提交审核
```

### Q5: 如何回滚版本

1. 登录微信公众平台
2. 版本管理 → 线上版本
3. 点击"回退"
4. 选择要回退到的版本
5. 确认回退

**注意**: 回退后用户需重新打开小程序才能生效

---

## 附录

### A. 审核状态说明

| 状态 | 说明 |
|------|------|
| 审核中 | 已提交审核，等待审核结果 |
| 审核通过 | 审核通过，可发布上线 |
| 审核不通过 | 审核未通过，需修改后重新提交 |
| 已发布 | 已上线，用户可访问 |
| 已撤回 | 已下架，用户无法访问 |

### B. 联系方式

- 微信开放平台客服: https://kf.qq.com
- 小程序社区: https://developers.weixin.qq.com/community/develop

---

**文档维护**: 技术团队  
**最后更新**: 2026-04-11
