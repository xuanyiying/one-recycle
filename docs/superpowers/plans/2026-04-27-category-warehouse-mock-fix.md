# Category Warehouse 页面 Mock 数据修复计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 category-warehouse 页面使用模拟数据的问题，同时全面分析其他页面是否存在类似问题。

**Architecture:**
1. 扩展 `inventoryService` 添加 `getWarehouses` 方法调用后端 `/inventory/warehouses` 接口
2. 创建 `warehouseService` 作为独立的仓库服务模块
3. 更新 category-warehouse 页面使用真实 API
4. 分析 dashboard 页面的趋势数据 mock 问题

**Tech Stack:** Next.js, TypeScript, NestJS Backend, Prisma

---

## 发现的问题

### 1. category-warehouse/page.tsx (当前文件)
- **行 85-97**: `fetchWarehouses` 使用硬编码的 mock 数据而非真实 API
- **问题**: 仓库列表应从后端 `/inventory/warehouses` 接口获取，但后端该接口尚未实现

### 2. dashboard/page.tsx (发现类似问题)
- **行 75-88**: `generateMockTrendData` 生成假的趋势数据
- **行 99, 113**: 使用 `generateMockTrendData` 而非调用后端 `/inventory/value-trend` 接口
- **问题**: 趋势图数据应为真实数据，但前端使用了随机 mock 数据

---

## 修复任务

### Task 1: 扩展后端 InventoryController 添加仓库列表接口

**Files:**
- Modify: `server/src/modules/inventory/inventory.controller.ts`
- Modify: `server/src/modules/inventory/services/inventory.service.ts`

- [ ] **Step 1: 在 InventoryController 添加获取仓库列表接口**

```typescript
@Get('warehouses')
async findAllWarehouses(): Promise<any[]> {
  return this.inventoryService.getWarehouses();
}
```

- [ ] **Step 2: 在 InventoryService 添加 getWarehouses 方法**

在 `inventory.service.ts` 文件的 InventoryService 类中添加:

```typescript
async getWarehouses(): Promise<any[]> {
  const warehouses = await this.prisma.warehouse.findMany({
    where: { status: WarehouseStatus.ACTIVE },
    orderBy: { createdAt: 'desc' },
  });
  return warehouses.map(w => ({
    id: w.id.toString(),
    name: w.name,
    address: w.address,
  }));
}
```

- [ ] **Step 3: 验证后端接口**

Run: `cd server && npm run start:dev`
Expected: 启动成功，无编译错误

---

### Task 2: 创建 WarehouseService

**Files:**
- Create: `apps/admin-web/src/services/warehouseService.ts`

- [ ] **Step 1: 创建 warehouseService.ts**

```typescript
import { apiClient } from './apiClient';

export interface Warehouse {
  id: string;
  name: string;
  address: string;
}

export const warehouseService = {
  async getWarehouses(): Promise<Warehouse[]> {
    try {
      return await apiClient.get('/inventory/warehouses');
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      throw new Error('获取仓库列表失败');
    }
  },
};

export default warehouseService;
```

---

### Task 3: 修复 category-warehouse/page.tsx

**Files:**
- Modify: `apps/admin-web/src/app/(dashboard)/settings/category-warehouse/page.tsx`

- [ ] **Step 1: 导入 warehouseService**

添加导入语句 (行 14 附近):
```typescript
import { warehouseService, WarehouseItem } from '@/services/warehouseService';
```

- [ ] **Step 2: 替换 fetchWarehouses 实现**

将行 85-97 的 mock 实现替换为:
```typescript
const fetchWarehouses = useCallback(async () => {
  try {
    const response = await warehouseService.getWarehouses();
    setWarehouses(response);
  } catch (error) {
    console.error(error);
    toast.error('获取仓库列表失败');
  }
}, []);
```

- [ ] **Step 3: 删除 WarehouseItem 本地接口 (行 25-30)**

由于已从 warehouseService 导入 WarehouseItem，本地接口定义可删除。

---

### Task 4: 修复 dashboard/page.tsx 的趋势数据 mock 问题

**Files:**
- Modify: `apps/admin-web/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: 添加 inventoryService 导入**

在文件顶部添加 (约行 10):
```typescript
import { InventoryService } from '@/services/inventoryService';
```

- [ ] **Step 2: 添加获取趋势数据的函数**

在 `loadDashboardData` 函数之前添加:
```typescript
const fetchTrendData = async (days: number) => {
  try {
    const response = await InventoryService.getInventoryValueTrend(days);
    return response.map((item: any) => ({
      date: item.date,
      orders: item.orderCount || 0,
      revenue: item.totalValue || 0,
      users: 0,
    }));
  } catch (error) {
    console.error('Failed to fetch trend data:', error);
    return generateMockTrendData(days);
  }
};
```

- [ ] **Step 3: 修改 loadDashboardData 使用真实 API**

将行 99:
```typescript
setTrendData(generateMockTrendData(trendPeriod === '7d' ? 7 : 30));
```
替换为:
```typescript
const trend = await fetchTrendData(trendPeriod === '7d' ? 7 : 30);
setTrendData(trend);
```

- [ ] **Step 4: 修改 useEffect 中的趋势数据获取**

将行 113:
```typescript
setTrendData(generateMockTrendData(trendPeriod === '7d' ? 7 : 30));
```
替换为:
```typescript
const trend = await fetchTrendData(trendPeriod === '7d' ? 7 : 30);
setTrendData(trend);
```

---

### Task 5: 运行类型检查验证修复

- [ ] **Step 1: 运行 admin-web 类型检查**

Run: `cd apps/admin-web && npm run typecheck`
Expected: 无类型错误

- [ ] **Step 2: 运行 server 类型检查**

Run: `cd server && npm run typecheck`
Expected: 无类型错误

---

## 验证清单

- [ ] category-warehouse 页面能正确获取并显示仓库列表
- [ ] dashboard 页面的趋势图使用真实数据
- [ ] 所有 API 调用错误被正确处理
- [ ] 页面刷新后数据能正确重新加载
- [ ] 无 TypeScript 类型错误
