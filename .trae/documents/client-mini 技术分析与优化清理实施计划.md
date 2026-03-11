# 一体化分析与实施计划

## 目标
- 完成 client-mini 小程序的技术体检：功能完整性、性能与可维护性评估、无用代码清理清单。
- 提出分层可执行的优化与重构方案，并在不影响业务的前提下落地。
- 优化后确保通过全部现有测试，并补齐关键链路测试。

## 工作分解
### A. 功能完整性核查
1. 逐页核对路由与页面注册（pages 与 tabBar）确保与业务流一致（首页→分类→下单→确认→成功→订单/钱包/提现）。
2. 复盘订单创建多步流组件与 Store 的状态迁移与草稿保存逻辑，确认边界与异常路径。
3. 认证与用户态：useAuth、authService 与存储交互核查，确认登录/刷新/登出完整性。
4. 服务层对齐：订单/支付/地址/时间段/提现等接口契约与错误码映射。

### B. 性能与结构优化
1. 渲染优化：拆分/细粒度 Context、减少双源状态更新、引入 React.memo/useMemo；页面级重复请求去重。
2. 网络层：默认关闭重试，仅对明确幂等 GET 开启；4xx 禁止重试；增加退避与并发限制；生产关闭 Mock 日志。
3. 资源优化：TabBar 切换为 SVG；首页与订单列表图片统一懒加载与 CDN 裁剪；关键图预加载。
4. 包体优化：NutUI 按需引入与 tree-shaking；剔除未用平台依赖；避免跨包重复。
5. ENV 管控：修复 env.ts 环境切换，生产默认禁用 Mock。

### C. 可维护性与规范
1. 统一服务命名与职责：合并/清理重复服务文件（如 auth.ts 与 authService.ts）。
2. DTO/文件命名一致性：修复“名不副实”的 DTO 与文件名。
3. 错误响应与码表：前后端一致的 ApiResponse 结构与错误码映射，集中维护。
4. 文档对齐：环境变量、Mock 使用、API 前缀规则补充到 README/架构文档。

### D. 无用代码清理（安全可回滚）
- 组件：AddressSelector、ErrorDisplay、ExpressOption、TimeSelector（未引用）。
- Hooks：useFormErrors、useNetworkError、useOrders（未引用）。
- Utils：imagePreloader、lazyLoad、optimisticUpdate、requestCache、searchHistory、debounce、throttle、offlineCapabilities.example（样例）。
- 资源：icons 下 SVG 同名资源与预览页、未用 PNG；品牌横版标识未用。
- Mock：src/mock 整体视为开发/调试；生产禁用但保留目录。
- 测试：useFormErrors.test.ts（关联钩子未用，评估保留或迁移）。

执行方式：
- 建立清理候选列表 → 交叉检查 import/JSX/路由使用 → 标记“确认删除/保留” → 分批删除并运行测试。

### E. 测试与验证
1. 现有测试运行：确保全部通过。
2. 新增/补强测试：utils/request、错误处理、订单创建流集成测试。
3. 性能监测接入：关键页面（首页/订单/创建流）接入 performanceMonitor 指标对比前后差异。

## 优先级
- P0（立刻）：ENV 切换与 Mock 关闭、网络层重试策略、订单页重复加载、TabBar 图标资源切换。
- P1：渲染与状态源合并、图片懒加载与 CDN、服务命名统一与重复清理。
- P2：包体与依赖瘦身、错误响应结构统一、文档与测试补齐。

## 风险控制
- 每一类改动单独分支与 PR；细粒度提交与可回滚。
- 引入页面级 Feature Flag（如切换资源采用配置开关）。
- 删除操作先软删除（注释/排除编译），通过测试后硬删除。

## 版本控制与记录
- 建分支：feature/client-mini-optimization。
- 提交信息模板：chore(client-mini): cleanup unused component X; feat(request): disable global retry by default; fix(env): correct environment detection。
- 生成清理报告：列出删除文件/原因/影响评估。

## 验证与交付
- CI：跑 lint、typecheck、vitest；关键页面手动验证。
- 输出：技术分析报告、变更说明与优先级列表、清理记录、测试结果摘要。