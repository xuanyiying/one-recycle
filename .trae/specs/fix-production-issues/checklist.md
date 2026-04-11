# OneRecycle 上线问题修复验收检查清单

## 一、管理后台安全漏洞修复检查

### 1.1 Next.js 升级验证
- [ ] package.json 中 next 版本 >= 15.5.14
- [ ] package-lock.json 已更新
- [ ] `npm audit` 无 Critical 级别漏洞
- [ ] `npm audit` 无 High 级别漏洞（或仅有可接受的）

### 1.2 兼容性验证
- [ ] `npm run typecheck` 通过无错误
- [ ] `npm run lint` 通过（或仅有警告）
- [ ] 核心页面可正常访问:
  - [ ] 登录页正常
  - [ ] 仪表盘正常
  - [ ] 用户管理正常
  - [ ] 订单管理正常
  - [ ] 财务管理正常

## 二、小程序 TypeScript 类型错误修复检查

### 2.1 ChatMessageList.tsx 修复
- [ ] 行 41 的 Object is possibly 'undefined' 错误已修复
- [ ] 使用可选链操作符或空值合并运算符

### 2.2 VoiceOrderFlow 组件修复
- [ ] ChatMessageList.tsx:25 错误已修复
- [ ] index.tsx:123 lastMessage undefined 错误已修复
- [ ] 组件功能正常（如保留）

### 2.3 hooks 类型错误修复
- [ ] useMessages.ts:38 类型错误已修复
- [ ] useVoiceDialog.ts:322 类型错误已修复
- [ ] hooks 功能正常

### 2.4 customer/index.tsx 修复
- [ ] 行 167 类型错误已修复
- [ ] 客服页面功能正常

### 2.5 referral/index.tsx 未使用变量修复
- [ ] ScrollView 未使用变量已处理
- [ ] loading 未使用变量已处理
- [ ] onShareAppMessage 未使用变量已处理
- [ ] onShareTimeline 未使用变量已处理
- [ ] 邀请页面功能正常

### 2.6 voice-order/index.tsx 修复
- [ ] user 未使用变量已处理

### 2.7 referral.ts 类型参数修复
- [ ] 行 39,43,47,51 泛型参数错误已修复
- [ ] 推荐服务功能正常

### 2.8 整体验证
- [ ] `npm run typecheck` 输出 0 个错误
- [ ] `npm run build:weapp` 构建成功
- [ ] 构建产物大小 < 2MB

## 三、小程序 AI 功能禁用检查

### 3.1 积分商城入口禁用
- [ ] points-mall/index.tsx 第 253-259 行"赚积分"入口已注释/删除
- [ ] 无法从 UI 点击进入任务页面
- [ ] 无法从 UI 点击进入签到页面

### 3.2 app.config.ts 配置正确
- [ ] pages 数组中不包含 voice-order（如删除）
- [ ] tabBar 中不包含 voice-order（如删除）
- [ ] subpackages points-mall 中不包含 signin/tasks（如删除）

### 3.3 AI 文件清理（如执行）
- [ ] voice-order 目录已删除（或确认无影响）
- [ ] VoiceOrderFlow 组件目录已删除（或确认无影响）
- [ ] useVoiceDialog.ts 已删除（或确认无影响）
- [ ] useVoiceRecognition.ts 已删除（或确认无影响）
- [ ] signin 目录已删除（或确认无影响）
- [ ] tasks 目录已删除（或确认无影响）

### 3.4 功能验证
- [ ] 小程序构建成功
- [ ] 核心功能不受影响:
  - [ ] 首页正常
  - [ ] 回收下单正常
  - [ ] 订单列表正常
  - [ ] 积分商城主页面正常（不含 AI 入口）

## 四、小程序调试代码清理检查

### 4.1 日志工具函数创建
- [ ] logger 工具函数已创建（或使用其他方案）
- [ ] 包含 log/error/warn/info 方法
- [ ] 仅在 development 环境输出

### 4.2 核心 utils/hooks 文件清理
- [ ] request.ts 中 console 语句已替换（2 处）
- [ ] useAuth.ts 中 console 语句已替换（9 处）
- [ ] useWebSocket.ts 中 console 语句已替换（8 处）
- [ ] storage.ts / useStore.ts 中 console 语句已替换（12 处）

### 4.3 页面文件清理
- [ ] 登录页 console 语句已处理
- [ ] 订单相关页面 console 语句已处理
- [ ] 回收页面 console 语句已处理
- [ ] 个人中心 console 语句已处理
- [ ] 其他核心页面 console 语句已处理

### 4.4 清理验证
- [ ] 搜索 `console\.(log|error|warn)` 在 src/ 下结果为 0 或仅 logger 引用
- [ ] 生产环境构建成功
- [ ] 开发环境日志输出正常

## 五、服务端 voice-order 模块清理检查

### 5.1 模块依赖确认
- [ ] voice-order 模块未被其他生产模块引用
- [ ] app.module.ts 中已移除 VoiceOrderModule
- [ ] 已记录删除的文件列表

### 5.2 代码删除验证
- [ ] `server/src/modules/voice-order/` 目录已删除
- [ ] 包含 ai/, providers/, services/ 子目录
- [ ] 包含 *.controller.ts, *.module.ts 等文件
- [ ] 无残留文件

### 5.3 引用清理验证
- [ ] 其他模块无对 voice-order 的 import 引用
- [ ] 配置文件无相关引用
- [ ] 编译无错误

### 5.4 清理结果验证
- [ ] `npm run lint` 错误数大幅减少（目标: < 100）
- [ ] `npm run typecheck` 通过
- [ ] `npm run build` 成功
- [ ] 单元测试通过（338/338）

## 六、回归测试检查

### 6.1 管理后台回归
- [ ] 登录流程正常
- [ ] 用户 CRUD 操作正常
- [ ] 订单列表/详情正常
- [ ] 提现审核操作正常
- [ ] 数据统计展示正常

### 6.2 小程序回归
- [ ] 微信登录正常
- [ ] 首页加载正常（< 2s）
- [ ] 选择回收品类正常
- [ ] 填写地址和预约时间正常
- [ ] 提交订单正常
- [ ] 查看订单列表正常
- [ ] 查看订单详情正常
- [ ] 个人信息展示正常
- [ ] 地址管理正常
- [ ] 积分商城浏览正常（不含 AI 功能）

### 6.2 安全性验证
- [ ] 管理后台 npm audit 无 Critical 漏洞
- [ ] 小程序无裸 console 输出
- [ ] 小程序无未授权的 API 调用
- [ ] 无敏感信息泄露风险

## 七、最终验收

### 7.1 上线 Readiness 评估
- [ ] 所有 P0 问题已修复
- [ ] 所有 P1 问题已修复或计划修复
- [ ] 核心功能回归通过
- [ ] 安全性达标

### 7.2 文档更新
- [ ] Review 报告中的问题状态已更新
- [ ] 如有新的发现，已记录

### 7.3 最终结论
- [ ] 项目达到上线标准
- [ ] 或明确记录遗留问题和风险
