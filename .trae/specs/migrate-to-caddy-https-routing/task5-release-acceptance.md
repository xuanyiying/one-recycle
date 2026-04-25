# Task 5 回归验证与发布验收产物

## 执行信息
- 执行时间：2026-04-25
- 执行环境：本地外网探测（macOS + curl/openssl）
- 目标：完成 `backbuy/api` 与 `api` 子域检查、自签告警验证、管理端官网验证、回滚方案沉淀

## 1. backbuy/api 与 api 子域名检查

### 检查命令
```bash
curl -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://backbuy.cn/api/health
curl -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://api.backbuy.cn/api/health
curl -k -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://backbuy.cn/api/health
curl -k -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://api.backbuy.cn/api/health
```

### 验证结果
- `https://backbuy.cn/api/health`（严格 TLS）：`HTTP 000 | TLS 18`（证书校验失败）
- `https://api.backbuy.cn/api/health`（严格 TLS）：`HTTP 000 | TLS 18`（证书校验失败）
- `https://backbuy.cn/api/health`（忽略证书）：`HTTP 404 | TLS 18`
- `https://api.backbuy.cn/api/health`（忽略证书）：`HTTP 200 | TLS 18`

### 结论
- `api.backbuy.cn/api/health` 到后端链路可用，但证书不可信。
- `backbuy.cn/api/health` 路由返回 404，未达到预期。

## 2. 自签告警验证（api 登录接口）

### 检查命令
```bash
curl -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://api.backbuy.cn/tenant/auth/login
curl -k -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://api.backbuy.cn/tenant/auth/login
echo | openssl s_client -connect api.backbuy.cn:443 -servername api.backbuy.cn 2>/dev/null | openssl x509 -noout -issuer -subject -dates -ext subjectAltName
```

### 验证结果
- 严格 TLS：`HTTP 000 | TLS 18`，出现自签名证书告警（`SSL certificate problem: self signed certificate`）。
- 忽略证书：`HTTP 404 | TLS 18`（路由可达但业务路径当前返回 404）。
- 证书信息：
  - `issuer=CN=backbuy.cn`
  - `subject=CN=backbuy.cn`
  - `SAN=backbuy.cn,www.backbuy.cn,api.backbuy.cn,admin.backbuy.cn`

### 结论
- “无自签名告警”验收条件 **未通过**。

## 3. 管理端与官网路由验证

### 检查命令
```bash
curl -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://admin.backbuy.cn
curl -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://backbuy.cn
curl -k -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://admin.backbuy.cn
curl -k -sS -o /dev/null -w "HTTP %{http_code} | TLS %{ssl_verify_result}\n" https://backbuy.cn
```

### 验证结果
- 严格 TLS：
  - `https://admin.backbuy.cn` -> `HTTP 000 | TLS 18`
  - `https://backbuy.cn` -> `HTTP 000 | TLS 18`
- 忽略证书：
  - `https://admin.backbuy.cn` -> `HTTP 200 | TLS 18`
  - `https://backbuy.cn` -> `HTTP 200 | TLS 18`

### 结论
- 管理端与官网应用路由可达，但证书可信链异常导致正式 HTTPS 访问告警。

## 4. 回滚方案（可临时切回 Nginx）

> 适用场景：Caddy 证书签发异常或主域名 `/api` 路由异常，需短时恢复对外可用性。

### 回滚前确认
```bash
cd /opt/one-recycle/deploy
docker compose -f docker-compose.yml ps
ls -la ./ssl/live/backbuy.cn/
```

### 回滚步骤（monolith）
```bash
cd /opt/one-recycle/deploy

# 1) 下线 Caddy（释放 80/443）
docker compose -f docker-compose.yml stop caddy

# 2) 启动 legacy Nginx + Certbot
docker compose -f docker-compose.yml --profile legacy up -d nginx certbot

# 3) 验证入口
curl -k -I https://backbuy.cn
curl -k -I https://admin.backbuy.cn
curl -k -I https://api.backbuy.cn/api/health
```

### 回滚步骤（microservices）
```bash
cd /opt/one-recycle/deploy/docker

# 1) 下线 Caddy（释放 80/443）
docker compose -f docker-compose.production.yml stop caddy

# 2) 启动 legacy Nginx + Certbot
docker compose -f docker-compose.production.yml --profile legacy up -d nginx certbot

# 3) 验证入口
curl -k -I https://backbuy.cn
curl -k -I https://admin.backbuy.cn
curl -k -I https://api.backbuy.cn/api/health
```

### 回滚后观察
- 检查 `nginx` / `certbot` 日志是否持续报错。
- 观察 5-10 分钟接口 4xx/5xx 比例是否恢复正常。
- 问题消除后，再按变更窗口切回 Caddy 并复测本文件中的所有检查项。

## 5. 当前发布验收结论
- 已完成 Task 5 要求的全部“检查与产物沉淀”动作。
- 当前阻塞项：
  - 证书为自签名，严格 TLS 访问失败。
  - `backbuy.cn/api/health` 返回 404。
- 建议先执行回滚或修复 Caddy 证书签发与 `/api` 转发，再进行二次发布验收。
