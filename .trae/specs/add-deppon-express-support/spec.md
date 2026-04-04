# 添加德邦快递上门取件支持 Spec

## Why
当前系统仅支持京东物流（JDL）作为上门取件服务商。为了满足用户多样化的快递选择需求，需要接入德邦快递（DEPPON）作为额外的物流服务商。德邦在大件物品运输方面有优势，适合回收旧书、旧衣物、旧电器等较重物品。

## What Changes
- 新增德邦快递（DEPPON）物流提供商支持
- 创建德邦快递 API 提供商类，实现与德邦开放平台 API 的集成
- 支持德邦快递下单、取消订单、查询物流轨迹等核心功能
- 在管理后台添加德邦快递到快递公司列表
- 支持在订单分配时选择德邦快递作为取件服务商

## Impact
- Affected specs: 物流管理、订单分配、上门取件
- Affected code: 
  - `server/src/modules/logistics/providers/` - 新增德邦提供商
  - `server/src/modules/logistics/providers/logistics-provider.factory.ts` - 注册德邦提供商
  - `apps/admin-web/src/services/logisticsService.ts` - 添加德邦到快递公司列表
  - `server/src/modules/dispatch/` - 支持多物流商调度

## ADDED Requirements

### Requirement: 德邦快递提供商实现
The system SHALL provide a Deppon logistics provider that implements the ILogisticsProvider interface.

#### Scenario: 创建德邦快递订单
- **GIVEN** 用户已创建回收订单并选择德邦快递
- **WHEN** 系统调用德邦快递 API 创建取件订单
- **THEN** 应成功创建订单并返回运单号

#### Scenario: 取消德邦快递订单
- **GIVEN** 已创建的德邦快递取件订单
- **WHEN** 用户取消订单或系统需要取消
- **THEN** 应成功调用德邦 API 取消订单

#### Scenario: 查询德邦物流轨迹
- **GIVEN** 德邦快递运单号
- **WHEN** 系统查询物流轨迹
- **THEN** 应返回完整的物流轨迹信息

### Requirement: 德邦快递配置支持
The system SHALL support configuring Deppon API credentials in the logistics provider settings.

#### Scenario: 配置德邦快递
- **GIVEN** 管理员在物流设置页面
- **WHEN** 添加德邦快递配置（code: DEPPON, name: 德邦快递）
- **THEN** 应保存配置并可用于创建订单

### Requirement: 多物流商调度支持
The system SHALL support selecting logistics provider when dispatching pickup orders.

#### Scenario: 智能选择物流商
- **GIVEN** 多个物流商（京东、德邦）都已启用
- **WHEN** 系统分配取件订单
- **THEN** 应根据物品类型、重量、区域等因素智能选择最优物流商

## MODIFIED Requirements

### Requirement: 物流提供商工厂
**Current**: 仅支持 JD/JDL 提供商
**Modified**: 支持 JD/JDL 和 DEPPON 提供商

### Requirement: 快递公司列表
**Current**: EXPRESS_COMPANIES 仅包含顺丰、京东、圆通、中通、申通、韵达、EMS、百世
**Modified**: 添加德邦快递（DEPPON）到列表

## REMOVED Requirements
None
