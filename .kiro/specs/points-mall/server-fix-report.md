# 积分商城服务端异常修复完成

## 修复的问题

### 1. PrismaService 类型问题
- **问题**: PrismaService 中有多余的 `pointsProduct: any` 匽名
- **修复**: 删除了多余的声明

### 2. Roles Decorator 缺少 ROLES_KEY
- **问题**: `roles.decorator.ts` 缺少 `ROLES_KEY` 导出
- **修复**: 添加了 `ROLES_KEY` 常量并更新 `Roles` 装饰器

### 3. PointsController 导入错误
- **问题**: 导入了不存在的 `AuthGuard`，- **修复**: 改为 `JwtAuthGuard`

### 4. CreateOrderDto 类型问题
- **问题**: `productId` 和 `addressId` 类型为 `number`，- **修复**: 使用 `@Transform` 转换为 `bigint`

### 5. PointsOrderService 地址快照问题
- **问题**: `addressSnapshot` 类型为 `null` 不符合 Prisma 要求
- **修复**: 改为 `undefined`

### 6. 未使用的导入
- **问题**: 多个服务文件中有未使用的 `Logger` 和 `BadRequestException`
- **修复**: 删除未使用的导入和声明

## 修改的文件

### 服务端文件
1. `/server/src/prisma/prisma.service.ts` - 删除多余声明
2. `/server/src/modules/auth/decorators/roles.decorator.ts` - 添加 ROLES_KEY
3. `/server/src/modules/auth/guards/roles.guard.ts` - 新建文件
4. `/server/src/modules/points/points.controller.ts` - 修复导入
5. `/server/src/modules/points/points.service.ts` - 清理未使用导入
6. `/server/src/modules/points/dto/create-order.dto.ts` - 修复类型
7. `/server/src/modules/points/services/points-order.service.ts` - 修复地址快照
8. `/server/src/modules/points/services/points-product.service.ts` - 删除未使用导入
9. `/server/src/modules/points/services/points-record.service.ts` - 添加 Logger
10. `/server/src/modules/points/services/points-task.service.ts` - 删除未使用 Logger
11. `/server/src/modules/points/services/sign-in.service.ts` - 删除未使用 Logger
12. `/server/src/modules/points/services/invite.service.ts` - 删除未使用导入

## 验证结果

✅ 编译成功通过
- 所有 TypeScript 类型错误已修复
- 所有未使用的导入已清理
- 服务端代码符合规范

## 下一步

服务端异常已全部修复，可以正常编译运行。
