# Tasks

- [x] Task 1: 创建德邦快递提供商类
  - [x] SubTask 1.1: 创建 `deppon-provider.ts` 实现 ILogisticsProvider 接口
  - [x] SubTask 1.2: 创建德邦 API DTO 类型定义 (`deppon.dto.ts`)
  - [x] SubTask 1.3: 实现下单、取消、查询等核心方法

- [x] Task 2: 注册德邦快递提供商
  - [x] SubTask 2.1: 在 `logistics-provider.factory.ts` 中注册 DEPPON 提供商
  - [x] SubTask 2.2: 确保工厂能正确创建德邦提供商实例

- [x] Task 3: 更新前端快递公司列表
  - [x] SubTask 3.1: 在 `logisticsService.ts` 的 EXPRESS_COMPANIES 中添加德邦快递
  - [x] SubTask 3.2: 更新相关测试文件

- [x] Task 4: 更新调度服务支持多物流商
  - [x] SubTask 4.1: 修改 `dispatch.service.ts` 支持选择物流商
  - [x] SubTask 4.2: 添加物流商选择逻辑（可根据物品重量、类型等）

- [x] Task 5: 测试验证
  - [x] SubTask 5.1: 运行单元测试确保无回归
  - [x] SubTask 5.2: 验证德邦提供商能正确实例化和调用

# Task Dependencies
- Task 2 depends on Task 1
- Task 4 depends on Task 2
- Task 5 depends on Task 4
