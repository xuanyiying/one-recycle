# 小程序UI设计分析与改进方案 Spec

## Why

当前小程序UI存在视觉语言不统一、设计系统混乱、交互体验不一致等问题，导致整体质感欠佳，影响用户信任度和使用体验。需要对现有UI进行全面审计，建立统一的设计规范，并系统性改进关键页面。

## What Changes

- **建立统一设计规范**：统一色彩、字体、间距、圆角、阴影等设计令牌
- **首页视觉重构**：优化信息层级，改进卡片设计，提升首屏转化率
- **订单页面优化**：统一状态色彩体系，改进卡片可读性
- **个人中心优化**：统一图标风格，优化菜单层级
- **全局交互优化**：统一按钮、加载、空状态等交互组件
- **移除冗余样式**：清理重复定义和冲突的CSS变量

## Impact

- Affected specs: 小程序全局UI、首页、订单页、个人中心页、分类页
- Affected code:
  - `apps/mini-client/src/styles/variables.scss` - 设计令牌统一
  - `apps/mini-client/src/styles/global.scss` - 全局样式规范
  - `apps/mini-client/src/pages/index/index.tsx` - 首页结构优化
  - `apps/mini-client/src/pages/index/index.scss` - 首页样式重构
  - `apps/mini-client/src/pages/order/index.scss` - 订单样式优化
  - `apps/mini-client/src/pages/profile/index.scss` - 个人中心优化
  - `apps/mini-client/src/components/CategoryCard/` - 分类卡片改进
  - `apps/mini-client/src/components/RecycleCard/` - 回收卡片改进

## ADDED Requirements

### Requirement: 统一设计令牌系统

系统 SHALL 使用统一的设计令牌（Design Tokens）确保全平台视觉一致性。

#### Scenario: 色彩规范
- **GIVEN** 设计令牌定义
- **THEN** 主色使用 `#22C55E`（明亮绿），辅助色使用 `#F97316`（活力橙）
- **AND** 状态色统一：成功 `#22C55E`、警告 `#FBBF24`、错误 `#EF4444`、信息 `#3B82F6`
- **AND** 文字色使用灰度阶梯：`#1F2937`（主文字）、`#4B5563`（次要）、`#9CA3AF`（辅助）
- **AND** 背景色使用：`#F9FAFB`（页面背景）、`#FFFFFF`（卡片背景）

#### Scenario: 字体规范
- **GIVEN** 字体系统定义
- **THEN** 全站使用 `-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', sans-serif`
- **AND** 数字使用 `'DIN Alternate', 'SF Mono', monospace`
- **AND** 字体大小阶梯：12px(24rpx)、14px(28rpx)、16px(32rpx)、18px(36rpx)、20px(40rpx)、24px(48rpx)

#### Scenario: 间距与圆角规范
- **GIVEN** 间距系统定义
- **THEN** 基础间距单位为 8rpx(4px)，阶梯：8/16/24/32/40/48rpx
- **AND** 卡片圆角统一为 24rpx(12px)，按钮圆角统一为 32rpx(16px)
- **AND** 卡片阴影统一：`0 4rpx 20rpx rgba(0,0,0,0.06)`

### Requirement: 首页视觉重构

首页 SHALL 具备清晰的信息层级和统一的视觉语言。

#### Scenario: 顶部区域
- **WHEN** 用户进入首页
- **THEN** 顶部导航栏使用渐变绿色背景 `#22C55E` → `#16A34A`
- **AND** 定位药丸使用白色背景 + 绿色文字，与导航栏形成对比
- **AND** 问候语使用 48rpx 粗体标题 + 30rpx 次要文字

#### Scenario: 核心操作区
- **WHEN** 展示主推分类
- **THEN** 分类卡片使用统一尺寸（48% 宽度，380rpx 高度）
- **AND** 卡片圆角 40rpx，带渐变背景和图标
- **AND** 悬停效果使用 `transform: scale(0.96)` 而非复杂动画
- **AND** 空状态使用统一的 empty-state 组件

#### Scenario: 分类Tab栏
- **WHEN** 展示分类导航
- **THEN** Tab项使用 140rpx 最小宽度，24rpx 圆角
- **AND** 图标尺寸统一为 64rpx
- **AND** 热门标签使用红色渐变背景

#### Scenario: 功能栏
- **WHEN** 展示功能入口
- **THEN** 使用统一的图标容器（96rpx 圆角方形）
- **AND** 图标背景色使用低透明度品牌色
- **AND** 文字使用 26rpx 中等字重

### Requirement: 订单页面视觉优化

订单列表 SHALL 具备清晰的卡片层次和状态识别度。

#### Scenario: 订单卡片
- **WHEN** 展示订单列表
- **THEN** 卡片使用白色背景 + 24rpx 圆角
- **AND** 状态标签使用胶囊形状（圆角 20rpx）
- **AND** 状态色彩统一：待接单(橙)、待上门(蓝)、已完成(绿)、已取消(红)
- **AND** 订单号使用等宽字体，颜色为 `#9CA3AF`

#### Scenario: Tab导航
- **WHEN** 展示订单分类Tab
- **THEN** 使用分段控制器风格（iOS Segmented Control）
- **AND** 激活态使用白色背景 + 绿色文字
- **AND** 非激活态使用透明背景 + 灰色文字

### Requirement: 个人中心视觉优化

个人中心 SHALL 具备统一的图标系统和清晰的菜单层级。

#### Scenario: 用户信息区
- **WHEN** 展示用户头部
- **THEN** 背景使用绿色渐变 + 装饰光晕
- **AND** 用户卡片使用白色背景 + 28rpx 圆角
- **AND** 头像使用 120rpx 圆形 + 绿色边框

#### Scenario: 统计区
- **WHEN** 展示统计数据
- **THEN** 使用三列等分布局
- **AND** 数字使用 44rpx 粗体 + DIN Alternate 字体
- **AND** 标签使用 24rpx 灰色文字

#### Scenario: 菜单列表
- **WHEN** 展示功能菜单
- **THEN** 菜单图标使用统一尺寸（76rpx 圆角方形）
- **AND** 图标背景使用分类渐变色彩
- **AND** 菜单项使用 30rpx 文字 + 右侧箭头
- **AND** 菜单分组使用 24rpx 圆角白色卡片

### Requirement: 全局组件统一

系统 SHALL 使用统一的交互组件。

#### Scenario: 按钮规范
- **GIVEN** 任何按钮
- **THEN** 主按钮使用绿色背景 + 白色文字 + 32rpx 圆角
- **AND** 次要按钮使用白色背景 + 绿色边框 + 绿色文字
- **AND** 危险按钮使用红色背景 + 白色文字
- **AND** 所有按钮最小高度 80rpx，支持点击反馈

#### Scenario: 加载状态
- **GIVEN** 任何加载场景
- **THEN** 使用统一的骨架屏样式
- **AND** 骨架屏使用 `#f0f0f0` 背景 + shimmer 动画
- **AND** 加载文字使用 28rpx 灰色

#### Scenario: 空状态
- **GIVEN** 任何空数据场景
- **THEN** 使用统一的空状态组件
- **AND** 包含图标（80rpx）+ 标题（32rpx）+ 描述（26rpx）
- **AND** 图标使用灰色，文字使用 `#9CA3AF`

## MODIFIED Requirements

### Requirement: 清理冗余样式

**Current**: 存在两套设计系统（iOS Design System 和自定义变量），导致样式冲突和维护困难。

**Modified**:
- 保留 `variables.scss` 中的自定义变量作为主要设计令牌
- 将 `global.scss` 中的 iOS 系统颜色变量整合到统一变量系统
- 移除重复定义的 mixins（如 flex-center、flex-between 等已在 mixins.scss 中定义）
- 统一使用 `variables.scss` 中定义的变量，避免硬编码颜色值

### Requirement: 统一卡片组件

**Current**: `CategoryCard` 和 `RecycleCard` 样式重复但实现分离。

**Modified**:
- 统一使用 `CategoryCard` 作为主推分类卡片
- `RecycleCard` 作为兜底组件保留，但样式与 `CategoryCard` 保持一致
- 提取卡片公共样式到 `variables.scss` 中的卡片变量

### Requirement: 统一阴影系统

**Current**: 阴影定义分散且不统一，有 `$box-shadow-sm`、`$box-shadow-md` 等但使用不一致。

**Modified**:
- 统一使用三级阴影：
  - 小阴影：`0 2rpx 8rpx rgba(0,0,0,0.04)`（用于小元素）
  - 中阴影：`0 4rpx 16rpx rgba(0,0,0,0.06)`（用于卡片）
  - 大阴影：`0 8rpx 32rpx rgba(0,0,0,0.12)`（用于浮层）

## REMOVED Requirements

### Requirement: 移除深色模式媒体查询

**Reason**: 当前小程序不支持完整的深色模式切换，且媒体查询中的深色模式样式与浅色模式差异过大，维护成本高。

**Migration**: 保留 `:root` 中的 CSS 变量定义，移除 `@media (prefers-color-scheme: dark)` 相关代码。未来如需深色模式，通过类名切换实现。

### Requirement: 移除冗余的 iOS 组件类

**Reason**: `global.scss` 中定义了大量 `.ios-*` 类（如 `.ios-button`、`.ios-card` 等），但实际组件中并未使用，造成代码冗余。

**Migration**: 移除未使用的 `.ios-*` 工具类，保留实际使用的 mixins 和变量。
