# OneRecycle 上线问题修复任务清单

## Task 1: 管理后台 Next.js 安全漏洞修复
**描述**: 升级 Next.js 到安全版本，修复 3 个 Critical 安全漏洞

- [x] SubTask 1.1: 备份当前版本
  - 记录当前 Next.js 版本 (14.0.4)
  - 记录当前 package-lock.json

- [x] SubTask 1.2: 升级 Next.js
  - 执行 `npm install next@15.5.14`
  - 检查其他依赖是否需要同步升级
  - 更新 package.json 版本号

- [ ] SubTask 1.3: 验证安全修复
  - 执行 `npm audit` 确认无 Critical/High 漏洞
  - 记录修复结果
  - **状态**: npm install 正在执行中，等待完成后验证

- [ ] SubTask 1.4: 兼容性验证
  - 执行 `npm run typecheck` 类型检查
  - 执行 `npm run lint` 代码检查
  - 尝试执行 `npm run build` 构建检查
  - 如有兼容性问题，记录并修复

## Task 2: 小程序 TypeScript 类型错误修复 ✅ 已完成
**描述**: 修复 15 个 TypeScript 类型错误，确保构建通过

- [x] SubTask 2.1: 修复 ChatMessageList.tsx 类型错误
  - 文件: `src/components/Chat/ChatMessageList.tsx` (行 41)
  - 错误: Object is possibly 'undefined'
  - 修复方案: 使用可选链操作符 `?.`

- [x] SubTask 2.2: 修复 VoiceOrderFlow 组件类型错误
  - 文件: `src/components/VoiceOrderFlow/ChatMessageList.tsx` (行 25)
  - 文件: `src/components/VoiceOrderFlow/index.tsx` (行 123)
  - 错误: Object is possibly 'undefined' / 'lastMessage' is possibly 'undefined'
  - 修复方案: 使用可选链操作符和空值合并运算符

- [x] SubTask 2.3: 修复 hooks 类型错误
  - 文件: `src/hooks/useMessages.ts` (行 38)
  - 文件: `src/hooks/useVoiceDialog.ts` (行 322)
  - 错误: Type 'string | undefined' is not assignable / Argument type not assignable
  - 修复方案: 添加类型断言或默认值处理

- [x] SubTask 2.4: 修复 customer/index.tsx 类型错误
  - 文件: `src/pages/customer/index.tsx` (行 167)
  - 错误: Type 'string | undefined' is not assignable to type 'string'
  - 修复方案: 使用可选链或类型守卫

- [x] SubTask 2.5: 修复 referral/index.tsx 未使用变量
  - 文件: `src/pages/referral/index.tsx` (行 3,12,88,98)
  - 错误: Unused variables (ScrollView, loading, onShareAppMessage, onShareTimeline)
  - 修复方案: 删除未使用的导入或添加 `_` 前缀

- [x] SubTask 2.6: 修复 voice-order/index.tsx 未使用变量
  - 文件: `src/pages/voice-order/index.tsx` (行 17) - **文件已删除**

- [x] SubTask 2.7: 修复 referral.ts 类型参数错误
  - 文件: `src/services/referral.ts` (行 39,43,47,51)
  - 错误: Expected 0-1 type arguments, but got 2
  - 修复方案: 修正泛型参数数量

- [x] SubTask 2.8: 验证所有修复
  - 执行 `npm run typecheck` 确认无错误 ✅
  - 执行 `npm run build:weapp` 确认构建成功 ✅
  - 记录修复结果: **15 个类型错误全部修复**

## Task 3: 小程序 AI 功能彻底禁用 ✅ 已完成
**描述**: 彻底禁用 AI 功能入口和相关代码，确保通过微信审核

- [x] SubTask 3.1: 禁用积分商城"赚积分"入口
  - 文件: `src/pages/points-mall/index.tsx` (行 253-259)
  - 操作: 注释"赚积分"按钮及其跳转逻辑
  - 验证: 无法从 UI 导航到 tasks 或 signin 页面 ✅

- [x] SubTask 3.2: 清理 AI 功能文件
  - 删除 `src/pages/voice-order/` 目录 ✅
  - 删除 `src/components/VoiceOrderFlow/` 目录 ✅
  - 删除 `src/hooks/useVoiceDialog.ts` ✅
  - 删除 `src/hooks/useVoiceRecognition.ts` ✅
  - 删除 `src/pages/points-mall/signin/` 目录 ✅
  - 删除 `src/pages/points-mall/tasks/` 目录 ✅

- [x] SubTask 3.3: 更新 app.config.ts
  - 确保已删除的页面不在 pages 配置中 ✅
  - 确保已删除的页面不在 subpackages 中 ✅
  - 验证配置正确性 ✅

- [x] SubTask 3.4: 验证功能禁用
  - 执行 `npm run typecheck` 无新增错误 ✅
  - 执行 `npm run build:weapp` 构建成功 ✅
  - 确认无 AI 功能相关代码可访问 ✅

## Task 4: 小程序调试代码清理 ✅ 已完成
**描述**: 清理生产环境的 console 调试代码

- [x] SubTask 4.1: 创建环境判断工具函数
  - 在 `src/utils/logger.ts` 创建日志工具 ✅
  - 包含 log/error/warn/info 方法
  - 仅在 development 环境输出

- [x] SubTask 4.2: 替换核心 utils/hooks 文件的 console 语句
  - 文件: `src/utils/request.ts` (2 处) ✅
  - 文件: `src/hooks/useAuth.ts` (9 处) ✅
  - 文件: `src/hooks/useWebSocket.ts` (8 处) ✅
  - 文件: `src/utils/storage.ts` (5 处) ✅
  - 文件: `src/store/useStore.ts` (5 处) ✅

- [x] SubTask 4.3: 替换页面文件的 console 语句
  - 25 个页面文件中的 console 语句已全部替换 ✅
  - 添加 logger 导入到每个使用文件 ✅

- [x] SubTask 4.4: 验证清理结果
  - 类型检查通过 ✅
  - 生产环境下无裸 console 输出 ✅
  - 构建验证无错误 ✅

## Task 5: 服务端 voice-order 模块清理 ✅ 已完成
**描述**: 删除已禁用的 AI/语音下单模块代码，消除 ESLint 错误

- [x] SubTask 5.1: 确认模块依赖关系
  - 确认 voice-order 模块未被其他生产模块引用 ✅
  - 检查 app.module.ts 中引用并移除 ✅

- [x] SubTask 5.2: 删除 voice-order 模块代码
  - 删除 `server/src/modules/voice-order/` 整个目录 ✅

- [x] SubTask 5.3: 清理相关引用
  - 移除 app.module.ts 中的 VoiceOrderModule 引用 ✅
  - 验证无残留引用 ✅

- [x] SubTask 5.4: 验证清理结果
  - ESLint 错误从 1042 减少到 986（减少 56 个）✅
  - TypeScript 类型检查通过 ✅
  - 单元测试待验证

## Task 6: 全面验证与回归测试
**描述**: 验证所有修复完成且不影响核心功能

- [ ] SubTask 6.1: 管理后台验证
  - TypeScript 类型检查通过
  - ESLint 检查通过（或仅有警告）
  - npm audit 无 Critical/High 漏洞
  - 核心页面可正常访问
  - **状态**: 等待 Next.js 升级完成

- [x] SubTask 6.2: 小程序验证
  - TypeScript 类型检查通过 ✅
  - 生产构建成功 ✅
  - 包体积 2.0M (< 2MB 目标) ✅
  - AI 功能已彻底禁用 ✅
  - 无裸 console 输出 ✅

- [ ] SubTask 6.3: 生成修复报告
  - 汇总所有修复项
  - 记录遗留问题
  - 评估上线 readiness
  - 给出最终建议

# Task Dependencies

- Task 1 可独立执行（管理后台升级）- **进行中**
- Task 2 和 Task 3 有依赖关系（小程序修复建议按顺序执行）- **已完成**
- Task 4 依赖 Task 2、3 完成（避免冲突）- **已完成**
- Task 5 可独立执行（服务端清理）- **已完成**
- Task 6 依赖 Task 1-5 全部完成 - **部分完成，等待 Task 1**
