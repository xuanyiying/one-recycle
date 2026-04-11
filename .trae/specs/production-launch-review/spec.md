# OneRecycle 上线前全面 Review 规范

## Why

OneRecycle 旧物回收平台即将上线，需要对服务端、管理后台、微信小程序进行全面 review，确保系统稳定性、安全性、性能达标，并输出完整的上线文档和微信小程序上线所需材料。

## What Changes

- **服务端 Review**: 代码质量、测试覆盖率、安全漏洞、性能瓶颈
- **管理后台 Review**: UI/UX 优化、功能完整性、响应式适配
- **小程序 Review**: 代码审计、性能优化、合规检查、微信审核准备
- **上线文档**: 部署文档、运维手册、应急预案、操作手册
- **小程序上线**: 微信开发者工具上传、版本管理、审核材料准备

## Impact

- 受影响系统: 服务端 (NestJS)、管理后台 (Next.js)、微信小程序 (Taro)
- 受影响文档: 部署文档、运维手册、API 文档
- 关键交付物: 上线检查清单、小程序审核包、运维文档

## ADDED Requirements

### Requirement: 服务端上线 Review

系统 SHALL 完成以下服务端上线前检查：

#### Scenario: 代码质量检查
- **WHEN** 执行代码规范检查
- **THEN** ESLint 无错误，TypeScript 类型检查通过
- **AND** 代码风格符合项目规范

#### Scenario: 测试覆盖率验证
- **WHEN** 执行单元测试
- **THEN** 覆盖率 >= 90% (分支、函数、行、语句)
- **AND** 所有测试用例通过 (338/338)

#### Scenario: 安全漏洞扫描
- **WHEN** 执行依赖安全扫描
- **THEN** 无高危安全漏洞
- **AND** 敏感信息未硬编码在代码中

#### Scenario: 数据库迁移验证
- **WHEN** 执行数据库迁移
- **THEN** Prisma migrate deploy 成功
- **AND** 所有索引已创建

### Requirement: 管理后台上线 Review

系统 SHALL 完成以下管理后台上线前检查：

#### Scenario: 构建验证
- **WHEN** 执行生产构建
- **THEN** Next.js build 成功无错误
- **AND** 无类型错误

#### Scenario: 功能完整性检查
- **WHEN** 验证核心功能
- **THEN** 用户管理、订单管理、财务管理功能完整
- **AND** 数据展示正确

#### Scenario: 响应式适配检查
- **WHEN** 验证移动端适配
- **THEN** 侧边栏在移动端可正常折叠
- **AND** 表格支持横向滚动

### Requirement: 小程序上线 Review

系统 SHALL 完成以下小程序上线前检查：

#### Scenario: 代码合规检查
- **WHEN** 检查小程序代码
- **THEN** 符合微信小程序审核规范
- **AND** 无违规内容或功能

#### Scenario: 权限声明检查
- **WHEN** 检查权限配置
- **THEN** app.config.ts 中已声明所有使用权限
- **AND** 隐私协议已配置

#### Scenario: 性能优化检查
- **WHEN** 检查性能指标
- **THEN** 首屏加载时间 < 2s
- **AND** 包体积 < 2MB

### Requirement: 上线文档输出

系统 SHALL 输出以下上线文档：

#### Scenario: 部署文档
- **WHEN** 编写部署文档
- **THEN** 包含环境配置、部署步骤、验证方法
- **AND** 包含回滚方案

#### Scenario: 运维手册
- **WHEN** 编写运维手册
- **THEN** 包含日常运维、监控告警、故障处理
- **AND** 包含常用命令速查

#### Scenario: 小程序上线指南
- **WHEN** 编写小程序上线指南
- **THEN** 包含上传步骤、版本管理、审核注意事项
- **AND** 包含常见问题处理

### Requirement: 小程序微信上线

系统 SHALL 完成以下小程序上线操作：

#### Scenario: 代码上传
- **WHEN** 构建生产版本
- **THEN** 使用微信开发者工具上传代码
- **AND** 版本号符合规范 (如 1.0.0)

#### Scenario: 版本提交审核
- **WHEN** 提交微信审核
- **THEN** 填写完整的版本描述
- **AND** 上传必要的截图和说明

## MODIFIED Requirements

### Requirement: 服务端环境配置

**修改前**: 开发环境配置
**修改后**: 生产环境配置

- 数据库连接字符串使用生产环境
- Redis 配置使用生产环境
- JWT Secret 使用强随机密钥
- 微信支付、支付宝支付配置使用生产密钥
- OSS 配置使用腾讯云 COS 生产环境

## REMOVED Requirements

### Requirement: AI 功能模块
**Reason**: 小程序上线初期暂不开放 AI 功能（语音下单、AI 客服）
**Migration**: 
- 语音下单页面已注释
- AI 客服自动回复已移除
- 积分签到和任务功能已禁用

### Requirement: 开发调试功能
**Reason**: 生产环境禁用调试功能
**Migration**:
- 生产环境禁用 console.log
- 移除开发环境 Mock 数据
- 关闭调试接口
