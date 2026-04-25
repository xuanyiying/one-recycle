# Tasks

- [x] Task 1: 设计并落地 Caddy 反向代理配置
  - [x] SubTask 1.1: 新建 Caddy 配置，覆盖 `backbuy.cn`、`www.backbuy.cn`、`admin.backbuy.cn`、`api.backbuy.cn`
  - [x] SubTask 1.2: 配置 `backbuy.cn/api/*` 转发到 API Gateway
  - [x] SubTask 1.3: 配置 `admin.backbuy.cn` 与官网静态页面转发
  - [x] SubTask 1.4: 添加必要安全响应头与基础日志

- [x] Task 2: 调整部署编排并移除 Nginx/Certbot 主链路
  - [x] SubTask 2.1: 在 monolith 与 microservices compose 中引入 Caddy 服务
  - [x] SubTask 2.2: 移除或停用 Nginx 与 certbot 的核心入口职责
  - [x] SubTask 2.3: 迁移证书与配置持久化卷（Caddy data/config）

- [x] Task 3: 迁移 API 基础地址并保留兼容访问
  - [x] SubTask 3.1: 将默认 API 地址切换为 `https://backbuy.cn/api`
  - [x] SubTask 3.2: 保留 `api.backbuy.cn` 兼容路由，验证旧地址可用
  - [x] SubTask 3.3: 更新部署环境变量模板与说明

- [x] Task 4: 增强 CI/CD 验证与可观测性
  - [x] SubTask 4.1: 部署后增加外部 HTTPS 校验（issuer/SAN/有效期）
  - [x] SubTask 4.2: 区分应用健康与证书健康输出，保留平滑兼容策略
  - [x] SubTask 4.3: 证书异常时输出明确 warning 和排障提示

- [x] Task 5: 回归验证与发布验收
  - [x] SubTask 5.1: 验证 `backbuy.cn/api/health` 与 `api.backbuy.cn/api/health`
  - [x] SubTask 5.2: 验证 `https://api.backbuy.cn/tenant/auth/login` 无自签名告警
  - [x] SubTask 5.3: 验证管理端与官网路由正常
  - [x] SubTask 5.4: 记录回滚方案（可临时切回 Nginx）

# Task Dependencies

- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 2
- Task 5 depends on Task 2, Task 3, Task 4

## 追加修复任务（核验失败项）

- [ ] Task 6: 修复 Caddy 证书信任链，消除自签名证书告警
  - [x] SubTask 6.1: 审核 `deploy/caddy/Caddyfile` 的证书策略，确保启用 ACME 自动签发并移除本地自签证书兜底逻辑
  - [ ] SubTask 6.2: 核对 DNS A/AAAA 记录与 80/443 入站策略，确保 `backbuy.cn`、`api.backbuy.cn`、`admin.backbuy.cn`、`www.backbuy.cn` 均满足签发前提
  - [ ] SubTask 6.3: 在目标环境重建 Caddy 证书缓存并触发重新签发，确认证书 `issuer != subject` 且受信任
  - [ ] SubTask 6.4: 回填发布日志与校验产物（issuer/SAN/有效期/TLS 校验码）到验收文档

- [ ] Task 7: 修复 `https://backbuy.cn/api/*` 到 API Gateway 的转发
  - [x] SubTask 7.1: 排查 Caddy `@api` 匹配与 `handle` 顺序，确认 `/api/health` 不被静态站点路由吞掉
  - [ ] SubTask 7.2: 在服务器侧通过容器内外双路径验证（`api-gateway:3002/api/health` 与 `https://backbuy.cn/api/health`）定位 404 来源
  - [ ] SubTask 7.3: 修复后验证 `backbuy.cn/api/*` 与 `api.backbuy.cn/api/*` 在严格 TLS 下均返回预期状态码

- [ ] Task 8: 完成失败项回归验收并关闭阻塞
  - [ ] SubTask 8.1: 验证 `https://api.backbuy.cn/tenant/auth/login` 不再出现 `ERR_CERT_AUTHORITY_INVALID`
  - [ ] SubTask 8.2: 验证管理端与官网在严格 TLS 下可正常打开（`https://admin.backbuy.cn`、`https://backbuy.cn`）
  - [ ] SubTask 8.3: 更新 `checklist.md` 与 `task5-release-acceptance.md`，附完整命令与结果证据
