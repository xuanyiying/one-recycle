# 腾讯云SSL证书管理指南

## 概述

腾讯云免费DV SSL证书有效期为 **3个月**，需要定期续期。本文档提供了完整的证书监控、更新和自动续期方案。

---

## 📋 目录

1. [证书监控](#证书监控)
2. [证书更新](#证书更新)
3. [自动续期方案](#自动续期方案)
4. [故障排查](#故障排查)

---

## 🔍 证书监控

### 手动检查证书状态

```bash
# SSH到服务器
ssh ubuntu@your-server-ip

# 进入项目目录
cd /opt/one-recycle/deploy/scripts

# 运行监控脚本
chmod +x ssl-monitor.sh
./ssl-monitor.sh
```

**输出示例**：
```
[2026-04-19 02:00:00] Certificate for backbuy.cn expires in 85 days (on Jul 14 23:59:59 2026 GMT)
[2026-04-19 02:00:00] Certificate issuer: C=CN, O=TrustAsia Technologies, Inc., CN=TrustAsia DV TLS RSA CA 2025
[SUCCESS] Certificate is valid for 85 more days
```

### 设置自动监控（推荐）

```bash
# 安装cron任务
sudo cp ssl-monitor.cron /etc/cron.d/ssl-monitor
sudo chmod 644 /etc/cron.d/ssl-monitor

# 或手动添加到crontab
sudo crontab -e

# 添加以下行（每天凌晨2点检查）
0 2 * * * /opt/one-recycle/deploy/scripts/ssl-monitor.sh >> /var/log/ssl-monitor.log 2>&1
```

**监控逻辑**：
- ✅ 每天自动检查证书到期时间
- ⚠️ 剩余30天时发送邮件提醒
- 📧 需要配置邮件服务（如postfix）

---

## 🔄 证书更新

### 步骤1: 从腾讯云下载新证书

1. 登录 [腾讯云SSL证书控制台](https://console.cloud.tencent.com/ssl)
2. 找到 `backbuy.cn` 证书
3. 点击「申请续期」或「重新申请」
4. 完成域名验证（DNS验证或文件验证）
5. 证书签发后，点击「下载」
6. 选择 **Nginx** 格式下载

### 步骤2: 上传证书到服务器

```bash
# 本地执行：上传证书文件到服务器
scp backbuy.cn_bundle.crt ubuntu@your-server-ip:/tmp/
scp backbuy.cn.key ubuntu@your-server-ip:/tmp/

# SSH到服务器
ssh ubuntu@your-server-ip

# 移动到正确位置
cd /tmp
sudo mv backbuy.cn_bundle.crt /opt/one-recycle/deploy/ssl/
sudo mv backbuy.cn.key /opt/one-recycle/deploy/ssl/
```

### 步骤3: 更新证书

**方法A: 使用自动更新脚本（推荐）**

```bash
cd /opt/one-recycle/deploy/ssl
sudo ../scripts/ssl-update.sh
```

**方法B: 手动更新**

```bash
# 创建目录结构
sudo mkdir -p /opt/one-recycle/deploy/ssl/live/backbuy.cn

# 复制证书文件
sudo cp /opt/one-recycle/deploy/ssl/backbuy.cn_bundle.crt \
       /opt/one-recycle/deploy/ssl/live/backbuy.cn/fullchain.pem

sudo cp /opt/one-recycle/deploy/ssl/backbuy.cn.key \
       /opt/one-recycle/deploy/ssl/live/backbuy.cn/privkey.pem

# 设置权限
sudo chmod 644 /opt/one-recycle/deploy/ssl/live/backbuy.cn/fullchain.pem
sudo chmod 600 /opt/one-recycle/deploy/ssl/live/backbuy.cn/privkey.pem

# 重启nginx
docker restart one-recycle-nginx
```

### 步骤4: 验证证书更新

```bash
# 检查证书信息
openssl x509 -in /opt/one-recycle/deploy/ssl/live/backbuy.cn/fullchain.pem -noout -dates

# 测试HTTPS连接
curl -vI https://api.backbuy.cn/health

# 或使用浏览器访问
# https://api.backbuy.cn/health
# 查看证书详情，确认有效期已更新
```

---

## ⚙️ 自动续期方案

### 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **腾讯云自动续期** | 完全自动化 | 需要付费证书 | ⭐⭐⭐⭐⭐ |
| **脚本监控+邮件提醒** | 免费、可靠 | 需要手动更新 | ⭐⭐⭐⭐ |
| **Let's Encrypt** | 免费、自动续期 | 需要配置certbot | ⭐⭐⭐ |

### 推荐方案：腾讯云付费证书（可选）

如果预算允许，建议升级到腾讯云付费证书：
- **OV证书**：1年有效期，¥1500/年
- **EV证书**：1年有效期，¥3000/年
- **自动续期**：无需手动操作

购买链接：https://buy.cloud.tencent.com/ssl

---

## 🔧 故障排查

### 问题1: 证书验证失败

**症状**：
```
curl: (60) SSL certificate problem: unable to get local issuer certificate
```

**解决方案**：
```bash
# 检查证书链是否完整
openssl s_client -connect api.backbuy.cn:443 -showcerts

# 如果证书链不完整，需要添加中间证书
cat backbuy.cn_bundle.crt intermediate.crt > fullchain.pem
```

### 问题2: Nginx重启失败

**症状**：
```
nginx: [emerg] cannot load certificate
```

**解决方案**：
```bash
# 检查证书文件权限
ls -la /opt/one-recycle/deploy/ssl/live/backbuy.cn/

# 修复权限
chmod 644 fullchain.pem
chmod 600 privkey.pem

# 测试nginx配置
docker exec one-recycle-nginx nginx -t
```

### 问题3: 邮件提醒未发送

**解决方案**：
```bash
# 检查邮件服务是否安装
which mail

# 如果未安装，安装mailutils
sudo apt-get install mailutils

# 测试邮件发送
echo "Test email" | mail -s "Test" admin@backbuy.cn
```

---

## 📅 维护日历

建议将以下日期添加到日历提醒：

| 日期 | 操作 |
|------|------|
| **证书签发后60天** | 开始准备续期 |
| **证书签发后75天** | 申请续期（剩余15天） |
| **证书签发后80天** | 完成续期并更新证书 |
| **每月1号** | 检查证书状态 |

---

## 📞 技术支持

如有问题，请检查：
1. 腾讯云SSL证书控制台状态
2. 服务器日志：`/var/log/ssl-monitor.log`
3. Nginx日志：`docker logs one-recycle-nginx`
4. 域名DNS解析是否正确

---

## 🔗 相关链接

- [腾讯云SSL证书控制台](https://console.cloud.tencent.com/ssl)
- [腾讯云SSL证书文档](https://cloud.tencent.com/document/product/400)
- [Nginx SSL配置文档](https://nginx.org/en/docs/http/configuring_https_servers.html)
