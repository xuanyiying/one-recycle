# OneRecycle 上线问题修复 Spec

## Why

根据上线前全面 Review 报告，发现了多个阻塞上线的 Critical 和 High 级别问题。本 Spec 旨在制定并执行系统性的修复方案，确保项目达到可上线标准。

## What Changes

### P0 阻塞问题（必须修复）
- **管理后台 Next.js 安全漏洞**: 升级 Next.js 14.0.4 到 >= 15.5.14，修复 3 个 Critical 漏洞
- **小程序 TypeScript 类型错误**: 修复 15 个类型错误
- **小程序 AI 功能禁用不彻底**: 彻底禁用积分商城"赚积分"入口和删除相关代码

### P1 重要问题（建议修复）
- **小程序 console 调试代码清理**: 添加环境判断或删除 100+ 处 console 语句
- **服务端 ESLint 错误清理**: 清理 voice-order 模块的 1042 个错误

## Impact

- 受影响模块: 管理后台 (Next.js)、小程序 (Taro)、服务端 (NestJS)
- 受影响文件: 
  - `apps/admin-web/package.json` (Next.js 升级)
  - `apps/mini-client/src/pages/points-mall/index.tsx` (禁用入口)
  - 多个小程序 TypeScript 文件 (类型错误)
  - 小程序 hooks/utils 文件 (console 清理)

## ADDED Requirements

### Requirement: 管理后台安全漏洞修复

系统 SHALL 升级 Next.js 到安全版本以消除 Critical 安全漏洞。

#### Scenario: Next.js 升级成功
- **WHEN** 执行 `npm install next@15.5.14`
- **THEN** Next.js 版本 >= 15.5.14
- **AND** `npm audit` 无 Critical/High 漏洞
- **AND** 项目构建成功无错误

#### Scenario: 兼容性验证
- **WHEN** 执行 `npm run build` 和 `npm run typecheck`
- **THEN** 构建成功且无类型错误
- **AND** 所有页面功能正常

### Requirement: 小程序 TypeScript 类型错误修复

系统 SHALL 修复所有 TypeScript 类型错误以确保构建通过。

#### Scenario: 类型检查通过
- **WHEN** 执行 `npm run typecheck`
- **THEN** 无类型错误输出
- **AND** 生产构建成功

#### Scenario: 具体错误修复
- **WHEN** 修复以下文件的类型错误:
  - ChatMessageList.tsx:41 - Object is possibly 'undefined'
  - VoiceOrderFlow/ChatMessageList.tsx:25 - Object is possibly 'undefined'
  - VoiceOrderFlow/index.tsx:123 - 'lastMessage' is possibly 'undefined'
  - useMessages.ts:38 - Type 'string | undefined' is not assignable to type 'string'
  - useVoiceDialog.ts:322 - Argument of type 'DialogStep | undefined' is not assignable
  - customer/index.tsx:167 - Type 'string | undefined' is not assignable to type 'string'
  - referral/index.tsx - 未使用变量（ScrollView, loading, onShareAppMessage, onShareTimeline）
  - voice-order/index.tsx:17 - 'user' is declared but its value is never read
  - referral.ts:39,43,47,51 - Expected 0-1 type arguments, but got 2
- **THEN** 所有错误已修复

### Requirement: 小程序 AI 功能彻底禁用

系统 SHALL 彻底禁用所有 AI 相关功能以确保通过微信审核。

#### Scenario: 积分商城"赚积分"入口禁用
- **WHEN** 查看 `pages/points-mall/index.tsx`
- **THEN** 第 253-259 行的"赚积分"按钮已被注释或删除
- **AND** 无法从 UI 导航到签到或任务页面

#### Scenario: AI 功能文件清理（可选）
- **WHEN** 删除以下未使用的 AI 功能文件:
  - pages/voice-order/
  - components/VoiceOrderFlow/
  - hooks/useVoiceDialog.ts
  - hooks/useVoiceRecognition.ts
  - pages/points-mall/signin/
  - pages/points-mall/tasks/
- **THEN** 文件已删除且不影响核心功能

### Requirement: 小程序调试代码清理

系统 SHALL 清理生产环境的调试代码以符合发布规范。

#### Scenario: Console 语句添加环境判断
- **WHEN** 检查所有包含 console.log/error/warn 的文件
- **THEN** 所有 console 语句都添加了环境判断:
  ```typescript
  if (process.env.NODE_ENV === 'development') {
    console.log(...);
  }
  ```
- **OR** console 语句已被删除

#### Scenario: 涉及文件清理完成
- **WHEN** 检查以下文件:
  - src/utils/request.ts (2 处)
  - src/hooks/useAuth.ts (9 处)
  - src/hooks/useWebSocket.ts (8 处)
  - src/utils/storage.ts / src/store/useStore.ts (12 处)
  - 各页面文件 (60+ 处)
- **THEN** 所有调试代码已处理

## MODIFIED Requirements

### Requirement: 管理后台依赖版本

**修改前**: next@14.0.4
**修改后**: next@>=15.5.14

影响范围:
- 可能需要调整部分 API 变更的代码
- 需要验证 Image 组件使用方式
- 需要确认 middleware 配置兼容性

## REMOVED Requirements

### Requirement: AI 功能模块（小程序）

**Reason**: 上线初期暂不需要 AI 功能，且审核可能因未开放功能被拒
**Migration**: 
- 从 app.config.ts 的 pages 和 tabBar 中移除
- 删除或注释功能入口
- 保留代码但不可访问（可选完全删除）

### Requirement: 开发调试输出（小程序）

**Reason**: 生产环境不应输出调试信息，可能泄露敏感数据
**Migration**:
- 添加 NODE_ENV 环境判断
- 或直接删除 console 语句
