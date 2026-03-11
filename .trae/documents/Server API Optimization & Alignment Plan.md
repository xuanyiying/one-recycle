# 服务端接口优化与对齐计划

本计划旨在根据前端需求和最佳实践，全面优化服务端接口设计，确保类型安全、性能高效且文档完善。

## 1. 接口规范化与版本控制

* **目标**: 实现 `/api/v1` 版本控制，统一 RESTful 风格。
* **行动**:
    * 修改 `server/src/main.ts`:
        * 启用接口版本控制 (`VersioningType.URI`)。
        * 将全局前缀设置为 `api`，并默认版本为 `1`。

## 2. 数据结构对齐 (DTO 修正)

* **目标**: 消除后端 DTO 与前端类型定义及数据库 Schema 之间的不一致。
* **行动**:
    * **Category 模块**:
        * 修改 `CategoryResponseDto`: 将 `id` 类型从 `string` 改为 `number` (匹配 DB `Int` 和前端 `number`)。
        * 完善 `priceInfo` 和 `seo` 字段的类型定义，替代 `any`。
    * **Order 模块**:
        * 修改 `CreateOrderDto`: 将 `userId` 和 `addressId` 类型从 `number` 改为 `string` (匹配 DB `BigInt` 和前端 `string`)。
        * 确保 `OrderItemDto` 与前端提交结构一致。
    * **User 模块**:
        * 确保用户相关 DTO 返回的 ID 为 `string` 类型 (BigInt 序列化)。

## 3. 性能优化 (缓存策略)

* **目标**: 提高高频读取接口的响应速度。
* **行动**:
    * 在 `CategoryController` 中引入 `CacheInterceptor`，对分类树和列表接口启用缓存。
    * 确保 Redis 模块配置正确支持缓存功能。

## 4. Swagger 文档完善

* **目标**: 提供准确的接口文档供前端联调。
* **行动**:
    * 更新所有修改过的 DTO (`CreateOrderDto`, `CategoryResponseDto`)，确保 `@ApiProperty` 装饰器准确描述字段类型和示例值。
    * 在 Controller 方法上补充 `@ApiOperation` 和 `@ApiResponse` 描述。

## 5. 验证与测试

* **目标**: 验证修改后的接口是否符合预期。
* **行动**:
    * 编写/更新 `CategoryController` 的测试用例，验证 ID 类型和缓存行为。
    * 启动服务进行冒烟测试，确保 Swagger 文档可访问且结构正确。

## 实施顺序

1. 配置版本控制。
2. 修正 Category 模块 DTO 与 Controller。
3. 修正 Order 模块 DTO。
4. 添加缓存策略。
5. 验证 Swagger 文档。
