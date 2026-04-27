# 管理端登录状态与路由守卫修复 Spec

## Why
管理端左侧导航栏存在路由守卫问题，登录状态没有进行统一管理，导致部分导航栏点击时会跳转登录页面，影响用户体验。

## What Changes
- 统一管理登录状态，使用 Context 或 Zustand 进行全局状态管理
- 修复路由守卫逻辑，确保所有需要认证的页面都受到保护
- 清理重复或冲突的认证逻辑
- 确保 AuthGuard 组件正确应用于所有受保护的路由

## Impact
- Affected specs: 用户认证流程
- Affected code:
  - `apps/admin-web/src/components/AuthGuard.tsx`
  - `apps/admin-web/src/app/(dashboard)/layout.tsx`
  - `apps/admin-web/src/services/authService.ts`
  - `apps/admin-web/src/middleware.ts`

## ADDED Requirements
### Requirement: 统一登录状态管理
系统 SHALL 提供统一的登录状态管理机制，所有组件共享同一个认证状态。

#### Scenario: 用户已登录访问受保护页面
- **WHEN** 已登录用户访问受保护页面
- **THEN** 页面正常显示，不重定向到登录页

#### Scenario: 用户未登录访问受保护页面
- **WHEN** 未登录用户访问受保护页面
- **THEN** 自动重定向到登录页面

### Requirement: 路由守卫一致性
系统 SHALL 保证路由守卫逻辑在客户端和服务端保持一致。

#### Scenario: 导航栏点击跳转
- **WHEN** 用户点击左侧导航栏项目
- **THEN** 如果已登录，正确跳转；如果未登录，提示登录

## MODIFIED Requirements
### Requirement: AuthGuard 组件优化
移除 AuthGuard 中重复的认证检查逻辑，统一使用 authService 提供的状态。

### Requirement: 仪表盘布局认证处理
layout.tsx 中的认证逻辑应该与 AuthGuard 保持一致，避免双重检查导致的问题。

## REMOVED Requirements
### Requirement: 冲突的认证逻辑
移除 dashboard layout 中可能导致登录循环的认证逻辑。

## 分析要点
1. 检查 AuthGuard.tsx 的实现逻辑
2. 检查 (dashboard)/layout.tsx 的认证处理
3. 检查 middleware.ts 的路由守卫
4. 检查 authService.ts 的状态管理方式
5. 确认是否存在状态不一致问题
