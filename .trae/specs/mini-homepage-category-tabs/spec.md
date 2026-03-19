# 小程序首页改造 - 可配置分类Tab Spec

## Why
当前小程序首页的回收入口是固定的两个卡片（旧书回收、旧衣回收），无法动态调整。业务需要：
1. 在管理端配置分类是否主推（isFeatured）
2. 主推分类展示在首页核心区域
3. 添加分类Tab导航，用户可点击分类直接预约
4. 支持分类排序调整

## What Changes
- **小程序首页**: 改造核心操作区，从固定双卡片改为动态分类展示
- **新增分类Tab栏**: 可横向滚动的分类导航，点击跳转预约页面
- **管理端分类管理**: 支持设置分类是否主推、排序
- **API支持**: 获取主推分类列表接口

## Impact
- Affected specs: 小程序首页UI、分类管理、预约流程
- Affected code:
  - `apps/mini-client/src/pages/index/index.tsx` - 首页改造
  - `apps/mini-client/src/pages/index/index.scss` - 样式调整
  - `apps/mini-client/src/services/category.ts` - 分类服务
  - `apps/mini-client/src/hooks/useRecycleNavigation.ts` - 导航逻辑
  - `server/src/modules/category/` - 后端分类接口

## ADDED Requirements

### Requirement: 首页主推分类展示
首页核心操作区 SHALL 展示管理端配置的主推分类（isFeatured=true）。

#### Scenario: 加载首页
- **WHEN** 用户进入首页
- **THEN** 调用 `/category/categories/featured` 获取主推分类列表
- **AND** 按 sortOrder 排序展示分类卡片

#### Scenario: 点击主推分类
- **WHEN** 用户点击主推分类卡片
- **THEN** 跳转预约页面 `/pages/recycle/index?categoryId={id}`

### Requirement: 分类Tab导航
首页 SHALL 展示可横向滚动的分类Tab栏。

#### Scenario: 展示分类Tab
- **WHEN** 首页加载完成
- **THEN** 展示所有启用的分类（isVisible=true）作为Tab
- **AND** Tab 支持横向滚动

#### Scenario: 点击分类Tab
- **WHEN** 用户点击某个分类Tab
- **THEN** 跳转预约页面 `/pages/recycle/index?categoryId={id}`

### Requirement: 空状态处理
当没有主推分类时 SHALL 展示默认状态。

#### Scenario: 无主推分类
- **WHEN** 主推分类列表为空
- **THEN** 展示默认的两个回收入口（旧书、旧衣）作为兜底

## MODIFIED Requirements

### Requirement: 分类数据模型
Category 模型已包含所需字段：
- `isFeatured: Boolean` - 是否主推（已存在）
- `sortOrder: Int` - 排序顺序（已存在）
- `isVisible: Boolean` - 是否可见（已存在）
- `icon: String` - 分类图标（已存在）

### Requirement: 后端API
`/category/categories/featured` 接口已存在，返回 isFeatured=true 且 isVisible=true 的分类。

## REMOVED Requirements
无移除功能。
