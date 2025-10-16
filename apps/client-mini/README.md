# OneRecycle 旧物回收小程序

## 项目介绍

OneRecycle 是一个多平台旧物回收小程序，支持微信、支付宝、抖音、快手等主流平台。用户可以通过小程序提交旧物回收订单，预约上门回收服务。

## 技术栈

- **框架**: Taro 3 + React
- **语言**: TypeScript
- **样式**: CSS Modules
- **状态管理**: React Context API
- **网络请求**: Taro.request
- **构建工具**: Webpack 5

## 项目结构

```
src/
├── pages/           # 页面组件
│   ├── index/       # 首页
│   ├── recycle/     # 回收物品提交页
│   ├── orders/      # 订单列表页
│   ├── profile/     # 个人中心页
│   ├── settings/    # 设置页
│   └── address/     # 地址管理页
├── components/      # 公共组件
├── services/        # API 服务
├── utils/           # 工具函数
├── hooks/           # 自定义 Hook
├── store/           # 状态管理
└── app.config.ts    # 全局配置
```

## 开发环境搭建

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- 微信开发者工具

### 安装依赖

```bash
cd apps/client-mini
npm install
```

### 启动开发服务器

```bash
# 启动微信小程序开发服务器
npm run dev:weapp

# 启动支付宝小程序开发服务器
npm run dev:alipay

# 启动 H5 开发服务器
npm run dev:h5
```

### 构建生产版本

```bash
# 构建微信小程序
npm run build:weapp

# 构建支付宝小程序
npm run build:alipay

# 构建 H5
npm run build:h5
```

## 页面功能说明

### 首页 (/pages/index)
- 用户登录/注册入口
- 快速导航到核心功能

### 一键回收 (/pages/recycle)
- 提交回收物品信息
- 选择物品分类、重量、描述
- 预约上门时间

### 我的订单 (/pages/orders)
- 查看历史订单
- 订单状态跟踪

### 个人中心 (/pages/profile)
- 用户信息展示
- 订单统计
- 功能入口（地址管理、设置等）

### 设置 (/pages/settings)
- 消息通知设置
- 隐私设置
- 关于我们

### 地址管理 (/pages/address)
- 管理收货地址
- 设置默认地址

## 与后端服务交互

小程序通过 RESTful API 与后端微服务通信：

- **Account Service**: 用户认证、个人信息管理 (端口 3001)
- **Order Service**: 订单管理 (gRPC 服务，端口 50055)
- **Payment Service**: 支付服务 (gRPC 服务，端口 50054)

## 注意事项

1. 开发时需要确保后端服务已启动
2. 微信登录功能需要在微信开发者工具中调试
3. 真机调试时需要配置合法域名

## 项目规范

- 使用 TypeScript 进行类型检查
- 遵循 Taro 组件规范
- 使用 CSS Modules 进行样式隔离
- 统一的状态管理方案