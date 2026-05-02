# Services 接口改动影响分析 Spec

## Why
用户修改了 `apps/admin-web/src/services` 目录下的接口服务代码，需要系统性地分析这些改动是否会影响到前端页面的渲染和功能正常运作，确保类型安全性和接口一致性。

## What Changes
- **分析范围**：`apps/admin-web/src/services/` 下所有 20 个 service 文件的改动
- **影响评估**：检查 25 个引用这些 services 的页面/组件文件
- **修复目标**：识别并修复可能导致页面渲染失败或功能异常的接口不兼容问题

## Impact
- Affected specs: 无（独立分析任务）
- Affected code:
  - Service 层：20 个 service 文件
  - 页面层：19 个页面/组件文件
  - 测试层：3 个测试文件
  - 工具库：1 个状态机文件

## ADDED Requirements
### Requirement: Services 接口兼容性分析
系统 SHALL 提供完整的 services 接口改动分析报告，包括：

#### Scenario: 接口定义完整性检查
- **WHEN** 分析每个 service 导出的接口、类型、方法签名
- **THEN** 输出完整的接口清单和使用情况映射

#### Scenario: 页面依赖关系分析
- **WHEN** 检查每个页面对 service 的导入和使用方式
- **THEN** 识别出所有潜在的接口不匹配问题（类型错误、方法缺失、参数变更等）

#### Scenario: 影响程度评估
- **WHEN** 发现接口不匹配问题
- **THEN** 评估其对页面渲染的影响级别（Critical/High/Medium/Low）

## MODIFIED Requirements
### Requirement: 页面渲染稳定性
确保所有使用 services 的页面在接口改动后仍能正常渲染，无 TypeScript 类型错误，无运行时异常。

### Requirement: 类型安全保证
所有 service 导出的类型定义与实际使用保持一致，通过 TypeScript 编译检查。

## REMOVED Requirements
无
