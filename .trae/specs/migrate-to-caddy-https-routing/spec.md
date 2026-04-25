# Caddy 自动 HTTPS 与 API 路由收敛 Spec

## Why
当前生产环境在证书未就绪时可能对外暴露自签名证书，导致 `ERR_CERT_AUTHORITY_INVALID`。需要通过 Caddy 自动证书管理与路由收敛降低证书故障窗口并简化运维。

## What Changes
- 引入 Caddy 作为统一入口，替换 Nginx + Certbot 的证书与反向代理职责
- 启用 Caddy 自动 HTTPS（Let's Encrypt）
- 将 API 主入口收敛为 `https://backbuy.cn/api/*`
- 保留 `https://api.backbuy.cn/*` 兼容入口（过渡期转发到同一后端）
- 新增部署后证书与路由健康检查
- **BREAKING** 默认前端/API 配置将以 `https://backbuy.cn/api` 为主地址

## Impact
- Affected specs: 生产部署、反向代理、证书续期、健康检查
- Affected code: `deploy/docker-compose.yml`、`deploy/docker/docker-compose.production.yml`、`.github/workflows/deploy.yml`、`apps/admin-web` 环境变量配置、部署脚本与检查脚本

## ADDED Requirements
### Requirement: Caddy 自动证书托管
系统 SHALL 使用 Caddy 对 `backbuy.cn`、`www.backbuy.cn`、`admin.backbuy.cn`、`api.backbuy.cn` 提供自动 HTTPS 证书签发与续期能力。

#### Scenario: 首次部署证书签发成功
- **WHEN** 新环境首次部署并且 DNS/80/443 条件满足
- **THEN** Caddy 自动申请可信 CA 证书
- **THEN** 外部访问 `https://api.backbuy.cn/tenant/auth/login` 不再出现自签名证书告警

### Requirement: API 路由主入口收敛
系统 SHALL 将 API 主入口固定为 `https://backbuy.cn/api/*`，并保持与现有后端网关兼容。

#### Scenario: 主域名 API 可访问
- **WHEN** 客户端请求 `https://backbuy.cn/api/health`
- **THEN** 请求被转发到 API Gateway 正常返回 200

### Requirement: 子域名兼容入口
系统 SHALL 在迁移过渡期继续支持 `https://api.backbuy.cn/*` 访问，避免现有客户端立即失效。

#### Scenario: 旧客户端仍使用 api 子域名
- **WHEN** 客户端请求 `https://api.backbuy.cn/tenant/auth/login`
- **THEN** 请求被路由到同一后端服务并返回业务响应

### Requirement: 部署后证书健康验证
系统 SHALL 在部署流程中输出证书签发者、有效期、SAN 与外部 HTTPS 连通性检查结果。

#### Scenario: 证书异常时可观测
- **WHEN** 证书签发失败或 SAN 不包含目标域名
- **THEN** 部署日志输出明确告警并给出定位信息

## MODIFIED Requirements
### Requirement: 生产反向代理组件
生产环境反向代理从 Nginx 修改为 Caddy，静态站点、管理端、API 转发与安全头由 Caddy 配置承载。

### Requirement: 前端 API 基础地址
管理端与部署文档中的默认 API 地址修改为 `https://backbuy.cn/api`，并保留旧子域名兼容说明。

## REMOVED Requirements
### Requirement: Nginx 自签名兜底启动
**Reason**: 会在证书未就绪阶段暴露自签名证书，导致浏览器安全错误并影响外部调用。
**Migration**: 使用 Caddy 自动证书托管与统一入口路由，移除 Nginx 自签名 fallback 逻辑。

