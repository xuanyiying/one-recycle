# 服务端代码完善与优化计划

本计划旨在全面提升 `/server` 目录下的代码质量，修复 TypeScript 类型错误，完善接口定义与文档，并增强系统的稳健性。

## 1. TypeScript 配置与类型修复

* **目标**: 启用更严格的类型检查，消除隐式 `any`。

* **行动**:

  * [ ] 更新 `server/tsconfig.json`: 启用 `strict: true` (包括 `noImplicitAny`, `strictNullChecks`)。

  * [ ] 创建 `server/src/common/types/global.d.ts`: 规范化全局类型定义。

  * [ ] 修复 `main.ts` 中的 `BigInt` 序列化类型问题，移除 `as any` 断言。

## 2. 核心模块重构 (Order & User)

* **目标**: 移除业务逻辑中的 `any` 强转，使用 Prisma 生成的强类型。

* **行动**:

  * [ ] **Order 模块**:

    * 重构 `OrderService`: 使用 `Prisma.OrderCreateInput` 等生成类型替代 `any`。

    * 优化 `mapToOrder` 方法: 确保输入输出类型安全。

    * 完善 `OrderController`: 添加 Swagger 装饰器 (`@ApiOperation`, `@ApiResponse`)。

    * 更新 DTO: 为 `CreateOrderDto` 等添加 `@ApiProperty` 描述和 `class-validator` 校验。

  * [ ] **User 模块**:

    * 重构 `UserService`: 修复 `create` 和 `update` 方法中的类型隐患。

    * 统一错误处理: 确保所有异常（如用户不存在）抛出标准的 NestJS HTTP 异常。

## 3. 接口文档与规范

* **目标**: 生成清晰的 API 文档，规范化响应格式。

* **行动**:

  * [ ] 检查 `ResponseInterceptor`: 确保所有接口返回统一的 `ApiResponse<T>` 结构。

  * [ ] 完善 Swagger 配置: 确保所有核心接口在 `/api/docs` 中有清晰的参数和响应说明。

## 4. 测试与质量保证

* **目标**: 提升核心业务的测试覆盖率。

* **行动**:

  * [ ] 编写/更新 `OrderService` 的单元测试 (`order.service.spec.ts`)，覆盖创建、查询、状态更新等场景。

  * [ ] 运行全量编译检查 (`npm run build`) 确保无报错。

## 实施顺序

1. 调整 TypeScript 配置并修复全局类型问题。
2. 重构 User 模块（作为基础模块）。
3. 重构 Order 模块（核心业务模块）。
4. 补充单元测试并验证构建。

