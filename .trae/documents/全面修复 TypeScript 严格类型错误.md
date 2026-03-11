## 目标与范围
- 目标：全仓（server、admin-web、mini-client）在严格类型检查下零报错；修复仅限“类型相关改动”，不改变业务行为。
- 严格标准：以各包的 tsconfig 为基线执行 `tsc --noEmit`；对未开启 strict 的包（如 mini-client）补充一个“只用于 CI 的 strict typecheck 配置”，避免影响现有构建链路。

## 1) 全量扫描与报错清单
- 分别在以下目录执行类型检查并保存原始输出：
  - server：`tsc --noEmit -p server/tsconfig.json`
  - admin-web：`tsc --noEmit -p apps/admin-web/tsconfig.json`
  - mini-client：
    - 现有基线：`tsc --noEmit -p apps/mini-client/tsconfig.json`
    - 额外 strict：新增 `apps/mini-client/tsconfig.strict.json`（extends 原 tsconfig，开启 `strict: true`、`noImplicitAny: true`、`noUncheckedIndexedAccess: true` 等），执行 `tsc --noEmit -p .../tsconfig.strict.json`
- 将所有报错逐条整理为一份报告（markdown），包含：文件、行号、TS 错误码、错误信息、根因分类、修复策略。

## 2) 逐条修复（不改业务逻辑）
- 采用“一个错误一提交块”的节奏：每修复一处 → 立刻 `tsc --noEmit` 验证该错误消失且不引入新错误。
- 常见根因与对应策略（按优先级）：
  1. **模型/DTO 与实际字段不一致**：同步接口字段名/可选性/类型（尤其是 Prisma BigInt/Decimal/Json 的映射）。
  2. **隐式 any**：为函数参数、回调（如 `map/forEach/queue processor`）、Promise 返回值补全类型；必要时引入局部泛型。
  3. **null/undefined 风险**：添加守卫（if 判断、早返回）、可选链、或在确认不可能为空处使用非空断言（最小化使用）。
  4. **第三方库类型缺失/不准确**：优先升级依赖与 @types；仍缺失则在包内新增 `types/*.d.ts` 进行补齐（仅声明，不改运行）。
  5. **复杂联合/泛型推导失败**：用类型谓词、`satisfies`、条件/映射类型收敛类型范围。

## 3) 统一的类型检查入口与 CI 对齐
- 为每个包补充 `typecheck` script（只跑 tsc，不做 lint/format），并在根目录加一个聚合脚本（如 `npm run typecheck:all` 或用 workspace runner）。
- 更新 `.github/workflows/ci.yml`：在 server-tests job 中增加 typecheck 步骤（至少 server；如需要全仓 CI，再新增独立 job 跑 admin-web/mini-client typecheck）。

## 4) 变更自查与“只保留类型改动”
- 修复完成后：检查 `git diff`，确保只包含类型注解、类型定义、守卫语句、声明文件、typecheck 脚本与 CI 步骤，不引入无关重构/格式化。

## 5) 最终验证
- 全量 `tsc --noEmit`（含 mini-client strict 配置）。
- server：执行完整编译与测试（`npm run build`、`npm run test:cov:unit`、`npm run test:cov:e2e`）。
- admin-web / mini-client：按各自项目的既有测试/构建流程补充验证（若已有 test 命令则执行）。

## 6) 交付物
- 零类型报错的代码改动。
- 一份“类型修复概要清单”（markdown）：按错误列出文件、行号、根因、采用策略。

如果你确认该计划，我将开始先跑全仓 typecheck 收集错误清单，然后按清单逐条修复并在每次修复后立即验证。