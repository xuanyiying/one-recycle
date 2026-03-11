# OneRecycle Mini-Program Optimization Requirements

## Introduction

本需求文档定义了OneRecycle多平台旧物回收小程序的全面优化方案。该方案包括认证服务整合、功能完善、UI/UX优化和系统架构改进。通过本次优化，将消除服务重复、提升用户体验、完善业务流程，并确保跨平台一致性。

## Glossary

- **Mini-Program**: 运行在微信、支付宝、抖音、快手等平台上的轻量级应用程序
- **Account Service**: 负责用户账户管理、个人信息和地址管理的微服务
- **Auth Service**: 负责用户认证、登录、验证码发送的微服务
- **User Identity**: 用户在不同第三方平台（微信、支付宝等）的身份标识
- **Taro Framework**: 支持多端开发的React框架，用于构建跨平台小程序
- **API Gateway**: 统一的API网关服务，负责路由和请求转发
- **gRPC**: 高性能的RPC框架，用于微服务间通信

## Requirements

### Requirement 1: 认证服务整合

**User Story:** 作为系统架构师，我需要整合account-service和auth-service的重复功能，以便消除服务冗余并简化系统架构。

#### Acceptance Criteria

1. WHEN 分析现有服务时 THEN 系统应识别account-service和auth-service中的重复功能（用户查询、用户创建、身份验证）
2. WHEN 设计整合方案时 THEN 系统应将用户认证功能统一到auth-service，将用户资料管理保留在account-service
3. WHEN 整合服务时 THEN auth-service应负责：登录认证、验证码发送、Token生成、第三方平台登录、会话管理
4. WHEN 整合服务时 THEN account-service应负责：用户资料管理、地址管理、用户查询、用户状态管理
5. WHEN auth-service需要用户信息时 THEN 应通过gRPC调用account-service获取
6. WHEN account-service需要验证用户身份时 THEN 应通过JWT Token验证而非重复实现认证逻辑
7. WHEN 完成整合后 THEN 系统应删除重复的代码和数据库表

### Requirement 2: 统一登录流程优化

**User Story:** 作为小程序用户，我希望有流畅的登录体验，以便快速开始使用回收服务。

#### Acceptance Criteria

1. WHEN 用户首次打开小程序 THEN 系统应自动检测登录状态，已登录用户直接进入首页
2. WHEN 用户未登录时 THEN 系统应显示登录页面，包含平台授权按钮和昵称输入
3. WHEN 用户点击授权登录 THEN 系统应调用平台API获取用户基本信息（头像、昵称）
4. WHEN 用户完成授权 THEN 系统应自动创建或更新用户账户，并返回JWT Token
5. WHEN 用户输入昵称时 THEN 系统应实时验证昵称长度（2-20字符）和合法性
6. WHEN 登录成功后 THEN 系统应将Token存储到本地，并跳转到首页或原访问页面
7. WHEN Token过期时 THEN 系统应自动刷新Token或引导用户重新登录

### Requirement 3: 多平台身份统一管理

**User Story:** 作为产品经理，我需要支持用户在不同平台使用同一账户，以便提供一致的用户体验。

#### Acceptance Criteria

1. WHEN 用户通过微信登录 THEN 系统应创建或关联微信身份标识（openid、unionid）
2. WHEN 用户通过支付宝登录 THEN 系统应创建或关联支付宝身份标识（user_id）
3. WHEN 用户通过抖音登录 THEN 系统应创建或关联抖音身份标识（openid）
4. WHEN 用户绑定手机号 THEN 系统应支持通过手机号关联多个平台身份
5. IF 用户在不同平台使用相同手机号 THEN 系统应识别为同一用户并合并账户数据
6. WHEN 用户查看个人信息 THEN 系统应显示已绑定的平台列表
7. WHEN 用户解绑平台身份 THEN 系统应验证至少保留一种登录方式

### Requirement 4: 回收流程完善

**User Story:** 作为回收用户，我希望有完整清晰的回收流程，以便顺利完成旧物回收。

#### Acceptance Criteria

1. WHEN 用户选择回收品类 THEN 系统应显示该品类的详细说明、价格范围和回收要求
2. WHEN 用户上传物品照片 THEN 系统应支持最多9张照片，并提供图片压缩和预览功能
3. WHEN 用户填写物品描述 THEN 系统应提供智能提示和常用描述模板
4. WHEN 用户选择上门时间 THEN 系统应显示可用时间段，并支持预约未来7天内的时间
5. WHEN 用户选择地址 THEN 系统应显示已保存地址列表，并支持新增和编辑地址
6. WHEN 用户提交订单 THEN 系统应显示订单预估价格和上门时间确认
7. WHEN 订单创建成功 THEN 系统应跳转到订单详情页，并发送通知给用户

### Requirement 5: 订单管理优化

**User Story:** 作为回收用户，我需要方便地查看和管理我的回收订单，以便了解订单进度和历史记录。

#### Acceptance Criteria

1. WHEN 用户打开订单列表 THEN 系统应按状态分类显示订单（待接单、待上门、已完成、已取消）
2. WHEN 用户查看订单详情 THEN 系统应显示完整的订单信息（物品、地址、时间、状态、价格）
3. WHEN 用户查看订单详情 THEN 系统应显示订单时间轴，展示订单状态变更历史
4. WHEN 订单状态为"待上门" THEN 用户应能够查看快递员信息和联系方式
5. WHEN 订单状态为"待上门" THEN 用户应能够取消订单并填写取消原因
6. WHEN 订单完成后 THEN 系统应显示实际回收价格和积分入账信息
7. WHEN 用户对订单有疑问 THEN 系统应提供在线客服入口

### Requirement 6: 地址管理增强

**User Story:** 作为回收用户，我需要管理多个取货地址，以便在不同地点使用回收服务。

#### Acceptance Criteria

1. WHEN 用户添加地址 THEN 系统应支持通过地图选点或手动输入地址
2. WHEN 用户添加地址 THEN 系统应验证地址完整性（省市区、详细地址、联系人、电话）
3. WHEN 用户保存地址 THEN 系统应支持设置默认地址
4. WHEN 用户编辑地址 THEN 系统应保留原有信息并支持修改
5. WHEN 用户删除地址 THEN 系统应确认操作并检查该地址是否被订单使用
6. IF 用户只有一个地址 THEN 系统应自动设置为默认地址
7. WHEN 用户选择地址时 THEN 系统应优先显示默认地址

### Requirement 7: 个人中心完善

**User Story:** 作为回收用户，我需要完善的个人中心功能，以便管理我的账户和查看相关信息。

#### Acceptance Criteria

1. WHEN 用户打开个人中心 THEN 系统应显示用户头像、昵称、手机号和积分余额
2. WHEN 用户点击头像 THEN 系统应支持更换头像（拍照或从相册选择）
3. WHEN 用户点击昵称 THEN 系统应支持修改昵称
4. WHEN 用户查看积分余额 THEN 系统应显示可用余额、冻结余额和提现入口
5. WHEN 用户点击订单入口 THEN 系统应跳转到订单列表页
6. WHEN 用户点击地址管理 THEN 系统应跳转到地址列表页
7. WHEN 用户点击设置 THEN 系统应显示设置页面（关于我们、隐私政策、退出登录）

### Requirement 8: UI/UX一致性优化

**User Story:** 作为产品设计师，我需要确保小程序界面风格统一，以便提供专业的用户体验。

#### Acceptance Criteria

1. WHEN 设计页面时 THEN 系统应使用统一的字体规范（font-size-xs到font-size-display）
2. WHEN 设计页面时 THEN 系统应使用统一的圆角规范（border-radius-xs到border-radius-pill）
3. WHEN 设计页面时 THEN 系统应使用统一的间距规范（spacing-xs到spacing-xxl）
4. WHEN 设计页面时 THEN 系统应使用统一的颜色规范（primary、secondary、success、warning、error）
5. WHEN 设计按钮时 THEN 系统应使用预定义的按钮样式（btn-primary、btn-secondary、btn-lg等）
6. WHEN 设计卡片时 THEN 系统应使用统一的卡片样式（card、card-lg）
7. WHEN 设计表单时 THEN 系统应使用统一的输入框和验证提示样式

### Requirement 9: 性能优化

**User Story:** 作为小程序用户，我希望应用响应快速流畅，以便获得良好的使用体验。

#### Acceptance Criteria

1. WHEN 用户打开页面 THEN 系统应在1秒内完成首屏渲染
2. WHEN 用户上传图片 THEN 系统应自动压缩图片到合适大小（最大500KB）
3. WHEN 用户滚动列表 THEN 系统应使用虚拟列表技术优化长列表性能
4. WHEN 用户切换页面 THEN 系统应使用页面缓存减少重复请求
5. WHEN 系统请求API THEN 应使用请求防抖和节流避免重复请求
6. WHEN 系统加载数据 THEN 应显示骨架屏或加载动画提升感知性能
7. WHEN 系统遇到错误 THEN 应显示友好的错误提示并提供重试选项

### Requirement 10: 离线功能支持

**User Story:** 作为小程序用户，我希望在网络不佳时仍能使用部分功能，以便不影响基本操作。

#### Acceptance Criteria

1. WHEN 用户离线时 THEN 系统应缓存用户基本信息和最近订单数据
2. WHEN 用户离线时 THEN 系统应允许查看已缓存的订单详情
3. WHEN 用户离线时 THEN 系统应允许编辑草稿订单（本地保存）
4. WHEN 用户恢复网络 THEN 系统应自动同步本地草稿到服务器
5. WHEN 用户离线时 THEN 系统应显示离线提示并禁用需要网络的功能
6. WHEN 系统检测到网络恢复 THEN 应自动刷新数据并移除离线提示
7. WHEN 用户离线提交操作 THEN 系统应将操作加入队列，网络恢复后自动执行

### Requirement 11: 消息通知集成

**User Story:** 作为回收用户，我希望及时收到订单状态变更通知，以便了解回收进度。

#### Acceptance Criteria

1. WHEN 订单创建成功 THEN 系统应发送通知"您的回收订单已提交，等待快递员接单"
2. WHEN 快递员接单 THEN 系统应发送通知"快递员已接单，预计XX时间上门"
3. WHEN 快递员即将上门 THEN 系统应发送通知"快递员即将到达，请准备好回收物品"
4. WHEN 订单完成 THEN 系统应发送通知"回收完成，XX元已入账到您的账户"
5. WHEN 提现申请处理完成 THEN 系统应发送通知"提现成功，XX元已转入您的账户"
6. WHEN 用户打开通知 THEN 系统应跳转到对应的订单详情或提现详情页
7. WHEN 用户在设置中 THEN 应支持开启或关闭通知功能

### Requirement 12: 数据统计和分析

**User Story:** 作为产品经理，我需要收集用户行为数据，以便优化产品功能和用户体验。

#### Acceptance Criteria

1. WHEN 用户打开页面 THEN 系统应记录页面访问事件（页面路径、停留时间）
2. WHEN 用户点击按钮 THEN 系统应记录点击事件（按钮ID、页面位置）
3. WHEN 用户提交订单 THEN 系统应记录订单转化事件（品类、金额、来源）
4. WHEN 用户完成关键操作 THEN 系统应记录漏斗转化数据（注册、下单、完成）
5. WHEN 系统发生错误 THEN 应记录错误日志（错误类型、堆栈、用户ID）
6. WHEN 收集数据时 THEN 系统应遵守隐私政策，不收集敏感个人信息
7. WHEN 用户拒绝数据收集 THEN 系统应尊重用户选择并停止收集

## 非功能性需求

### 性能要求
- 页面首屏加载时间 < 1秒
- API响应时间 < 500ms (P95)
- 图片加载时间 < 2秒
- 支持1000+并发用户

### 兼容性要求
- 支持微信小程序（基础库2.0+）
- 支持支付宝小程序（基础库2.0+）
- 支持抖音小程序（基础库2.0+）
- 支持快手小程序（基础库2.0+）
- 支持H5浏览器（Chrome、Safari、微信浏览器）

### 可用性要求
- 系统可用性 ≥ 99.9%
- 错误率 < 0.1%
- 崩溃率 < 0.01%

### 安全性要求
- 所有API请求必须使用HTTPS
- 用户Token必须加密存储
- 敏感信息（手机号）必须脱敏显示
- 支持防刷机制（验证码、频率限制）

### 可维护性要求
- 代码覆盖率 ≥ 80%
- 关键业务逻辑必须有单元测试
- API文档必须完整准确
- 代码必须符合ESLint规范

## 约束条件

1. 必须使用Taro 4.x框架保持多端兼容性
2. 必须使用TypeScript确保类型安全
3. 必须遵循现有的样式规范（variables.scss）
4. 必须与现有后端微服务架构兼容
5. 必须支持现有的消息队列和支付系统
6. 开发周期不超过4周

## 成功标准

1. 成功整合认证服务，消除代码重复
2. 完成所有核心功能的开发和测试
3. UI/UX通过设计评审
4. 性能指标达到要求
5. 通过完整的端到端测试
6. 用户满意度 ≥ 4.5/5.0
7. 成功发布到所有目标平台
