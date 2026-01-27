# 多平台登录模块文档

## 简介
本模块实现了微信小程序、支付宝小程序及其他环境的统一登录功能。根据运行环境自动适配登录方式，支持手机号验证码登录和平台一键登录。

## 功能特性
1. **环境自适应**：自动识别微信/支付宝环境，展示对应的一键登录按钮。
2. **多模式登录**：
   - **一键登录**：利用平台能力快速获取 OpenID/UserID 完成登录。
   - **手机号登录**：通用的短信验证码登录流程。
3. **统一状态管理**：通过 `useAuth` Hook 统一管理登录态（Token、用户信息）。
4. **安全合规**：包含用户协议勾选强制校验。

## 目录结构
- `index.tsx`: 登录页主逻辑与 UI。
- `index.scss`: 样式文件（遵循 iOS 设计规范）。
- `src/hooks/useAuth.ts`: 核心认证 Hook，封装了登录、注册、注销逻辑。
- `src/utils/platformDetector.ts`: 平台环境检测工具。

## 使用方法

### 1. 引入登录页
通常作为路由页面配置在 `app.config.ts` 中：
```typescript
pages: [
  'pages/login/index',
  // ...
]
```

### 2. 核心 Hook API (`useAuth`)
```typescript
const { 
  loginWithPhone,    // (phone, code) => Promise<Result>
  handleSocialLogin, // (platform) => Promise<Result>
  sendSmsCode,       // (phone) => Promise<Result>
  user,              // 当前用户信息
  isLoggedIn         // 是否已登录
} = useAuth()
```

### 3. 环境适配
登录页会自动调用 `PlatformDetector.getCurrentPlatform()`。
- **微信环境**：显示 "微信一键登录" + "手机号登录"。
- **支付宝环境**：显示 "支付宝一键登录" + "手机号登录"。
- **其他环境**：仅显示 "手机号登录"。

## 开发注意事项
- **一键登录配置**：需在 `src/config/index.ts` 或后端配置对应的 AppID。
- **样式定制**：主要样式变量定义在 `src/styles/global.scss`。
