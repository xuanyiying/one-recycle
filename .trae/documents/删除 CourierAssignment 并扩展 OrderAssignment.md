## 修改计划

### 1. 新增 OrderStatus 枚举
在 `UserStatus` 枚举后添加：
```prisma
enum OrderStatus {
  PENDING              // 待处理
  PENDING_PICKUP       // 待取件
  PICKED_UP            // 已取件
  IN_TRANSIT           // 运输中
  PENDING_RECEIPT      // 待收货
  INSPECTING           // 验货中
  INSPECTED            // 已验货
  INSPECTION_EXCEPTION // 验货异常
  MANUAL_PROCESSING    // 人工处理
  PENDING_INBOUND      // 待入库
  INBOUNDED            // 已入库
  PENDING_SETTLEMENT   // 待结算
  COMPLETED            // 已完成
  CANCELLED            // 已取消
}
```

### 2. 修改 Order.status 字段
```prisma
status OrderStatus @default(PENDING)  // 替换 String @default("PENDING")
```

### 3. 修复 Withdrawal.User 关系
当前错误：
```prisma
User           User[]  // 错误：数组关系
```
修复为：
```prisma
user           User    @relation(fields: [userId], references: [id])
```

同时在 User 模型中添加关联：
```prisma
withdrawals Withdrawal[]
```