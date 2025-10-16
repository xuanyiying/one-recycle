# 数据库Schema优化建议

## 问题分析

当前User表的mobile字段定义为可选字段且没有唯一约束：

```prisma
model User {
  id        BigInt    @id @default(autoincrement())
  mobile    String?   @db.VarChar(20)  // 当前：可选，无唯一约束
  // ...
}
```

### 存在的问题

1. **性能问题**：使用`findFirst`查询mobile字段时无法利用索引优化
2. **数据一致性**：无法在数据库层面保证mobile的唯一性
3. **业务逻辑复杂**：需要在应用层手动检查重复

## 优化方案

### 方案1：添加唯一约束（推荐）

```prisma
model User {
  id        BigInt    @id @default(autoincrement())
  mobile    String?   @unique @db.VarChar(20)  // 添加唯一约束
  // ...
}
```

**优点**：
- 数据库层面保证唯一性
- 查询性能提升（自动创建唯一索引）
- 可以使用`findUnique`替代`findFirst`

**缺点**：
- 需要处理现有重复数据
- NULL值的处理需要特别注意

### 方案2：添加条件唯一索引

```prisma
model User {
  id        BigInt    @id @default(autoincrement())
  mobile    String?   @db.VarChar(20)
  // ...
  
  @@unique([mobile], name: "unique_mobile_when_not_null")
}
```

### 方案3：改为必填字段+唯一约束

```prisma
model User {
  id        BigInt    @id @default(autoincrement())
  mobile    String    @unique @db.VarChar(20)  // 必填+唯一
  // ...
}
```

## 迁移步骤

### 1. 数据清理
```sql
-- 检查重复的mobile
SELECT mobile, COUNT(*) 
FROM users 
WHERE mobile IS NOT NULL 
GROUP BY mobile 
HAVING COUNT(*) > 1;

-- 处理重复数据（根据业务需求决定保留策略）
```

### 2. 更新Schema
```prisma
model User {
  id        BigInt    @id @default(autoincrement())
  mobile    String?   @unique @db.VarChar(20)
  // ...
}
```

### 3. 更新应用代码
```typescript
// 替换 findFirst 为 findUnique
const user = await this.prisma.user.findUnique({
  where: { mobile: phone }
});
```

## 性能提升预期

- 查询性能：从O(n)提升到O(log n)
- 并发安全：数据库层面防止重复插入
- 代码简化：移除应用层重复检查逻辑

## 建议实施

1. **立即实施**：添加唯一约束（方案1）
2. **代码更新**：将所有`findFirst({ where: { mobile } })`替换为`findUnique({ where: { mobile } })`
3. **测试验证**：确保现有功能正常工作