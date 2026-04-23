#!/bin/bash
# ============================================================================
# SSL 证书修复脚本 - 用于修复自签名证书问题
# ============================================================================
set -e

DOMAIN="${DOMAIN:-backbuy.cn}"
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SSL_DIR="$DEPLOY_DIR/ssl"
LIVE_DIR="$SSL_DIR/live/$DOMAIN"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[ssl-fix]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
error() { echo -e "${RED}[error]${NC} $1"; }

echo "==========================================="
echo "  OneRecycle SSL 证书修复工具"
echo "  域名: $DOMAIN"
echo "==========================================="

if ! command -v docker &> /dev/null; then
    error "Docker 未安装，此脚本需要在服务器上运行"
    exit 1
fi

echo ""
echo "--- 步骤 1: 检查当前证书状态 ---"

if [ -d "$LIVE_DIR" ] && [ -f "$LIVE_DIR/fullchain.pem" ]; then
    ISSUER=$(openssl x509 -in "$LIVE_DIR/fullchain.pem" -noout -issuer 2>/dev/null || echo "")
    SUBJECT=$(openssl x509 -in "$LIVE_DIR/fullchain.pem" -noout -subject 2>/dev/null || echo "")
    
    if echo "$ISSUER" | grep -q "Let's Encrypt\|TrustAsia\|DigiCert"; then
        log "✓ 已有有效的 CA 签名证书: $ISSUER"
    elif [ "$ISSUER" = "$SUBJECT" ]; then
        warn "⚠ 当前使用的是自签名证书 (Issuer == Subject)"
        echo "   需要替换为有效的 CA 签名证书"
    else
        warn "⚠ 未知签发者: $ISSUER"
    fi
    
    openssl x509 -in "$LIVE_DIR/fullchain.pem" -noout -dates 2>/dev/null || true
else
    error "✗ 证书目录不存在: $LIVE_DIR"
fi

echo ""
echo "--- 步骤 2: 检查 Certbot 容器状态 ---"

CERTBOT_CONTAINER=$(docker ps -a --filter name=certbot --format "{{.Names}}" 2>/dev/null | head -1)
if [ -n "$CERTBOT_CONTAINER" ]; then
    CERTBOT_STATUS=$(docker inspect --format='{{.State.Status}}' "$CERTBOT_CONTAINER" 2>/dev/null || echo "unknown")
    log "Certbot 容器: $CERTBOT_CONTAINER ($CERTBOT_STATUS)"
    
    echo ""
    echo "--- 最近 30 行 Certbot 日志 ---"
    docker logs --tail 30 "$CERTBOT_CONTAINER" 2>&1 || true
else
    error "未找到 Certbot 容器"
fi

echo ""
echo "--- 步骤 3: 检查环境变量 ---"

if [ -f "$DEPLOY_DIR/.env" ] && grep -q "TENCENT_CLOUD_SECRET_ID" "$DEPLOY_DIR/.env"; then
    SECRET_ID=$(grep "TENCENT_CLOUD_SECRET_ID" "$DEPLOY_DIR/.env" | cut -d= -f2)
    if [ -n "$SECRET_ID" ] && [ "$SECRET_ID" != "" ]; then
        log "TENCENT_CLOUD_SECRET_ID: 已设置 (${SECRET_ID:0:8}...)"
    else
        error "TENCENT_CLOUD_SECRET_ID 为空!"
    fi
else
    error "TENCENT_CLOUD_SECRET_ID 未在 .env 中配置"
fi

echo ""
echo "==========================================="
echo "  可用的修复选项"
echo "==========================================="

echo ""
echo "【选项 A】重新触发 Certbot 申请证书（推荐）"
echo "  前提：已正确配置 TENCENT_CLOUD_SECRET_ID 和 TENCENT_CLOUD_SECRET_KEY"
echo ""
echo "  执行命令:"
echo "    $0 fix-certbot"
echo ""

echo "【选项 B】使用腾讯云免费 SSL 证书（快速）"
echo "  前提：从腾讯云控制台下载 Nginx 格式证书"
echo ""
echo "  执行命令:"
echo "    $0 install-tencent <证书文件路径>"
echo ""

echo "【选项 C】手动申请 Let's Encrypt 证书（调试）"
echo "  在服务器上交互式操作"
echo ""
echo "  执行命令:"
echo "    $0 manual-le"
echo ""

if [ "$1" = "fix-certbot" ]; then
    echo "==========================================="
    echo "  正在执行: 重新触发 Certbot"
    echo "==========================================="
    
    if [ -z "$CERTBOT_CONTAINER" ]; then
        error "Certbot 容器不存在，无法修复"
        exit 1
    fi
    
    log "重启 Certbot 容器以触发证书申请..."
    docker restart "$CERTBOT_CONTAINER"
    
    log "等待 60 秒让 DNS-01 验证完成..."
    sleep 60
    
    log "检查最新日志..."
    docker logs --tail 20 "$CERTBOT_CONTAINER" 2>&1 || true
    
    if [ -f "$LIVE_DIR/fullchain.pem" ]; then
        NEW_ISSUER=$(openssl x509 -in "$LIVE_DIR/fullchain.pem" -noout -issuer 2>/dev/null || echo "")
        if echo "$NEW_ISSUER" | grep -q "Let's Encrypt"; then
            log "✓ 成功！Let's Encrypt 证书已获取"
            log "正在重启 Nginx 以应用新证书..."
            docker restart one-recycle-nginx 2>/dev/null || true
            sleep 5
            log "完成！请访问 https://$DOMAIN 验证"
        else
            warn "证书可能仍未更新，请查看上方日志"
        fi
    fi

elif [ "$1" = "install-tencent" ] && [ -n "$2" ]; then
    CERT_PATH="$2"
    
    if [ ! -f "$CERT_PATH" ]; then
        error "证书文件不存在: $CERT_PATH"
        exit 1
    fi
    
    echo "==========================================="
    echo "  正在安装腾讯云 SSL 证书"
    echo "==========================================="
    
    mkdir -p "$LIVE_DIR"
    
    BACKUP_DIR="$SSL_DIR/backup/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    if [ -f "$LIVE_DIR/fullchain.pem" ]; then
        cp "$LIVE_DIR/fullchain.pem" "$BACKUP_DIR/" 2>/dev/null || true
        cp "$LIVE_DIR/privkey.pem" "$BACKUP_DIR/" 2>/dev/null || true
        log "旧证书已备份到: $BACKUP_DIR"
    fi
    
    cp "$CERT_PATH" "$LIVE_DIR/fullchain.pem"
    chmod 644 "$LIVE_DIR/fullchain.pem"
    
    KEY_FILE="${CERT_PATH%.crt}.key"
    if [ ! -f "$KEY_FILE" ]; then
        KEY_FILE="${CERT_PATH%_bundle.crt}.key"
    fi
    if [ ! -f "$KEY_FILE" ]; then
        KEY_FILE="${CERT_PATH%_bundle.pem}.key"
    fi
    
    if [ -f "$KEY_FILE" ]; then
        cp "$KEY_FILE" "$LIVE_DIR/privkey.pem"
        chmod 600 "$LIVE_DIR/privkey.pem"
        
        log "验证证书..."
        openssl x509 -in "$LIVE_DIR/fullchain.pem" -noout -subject -issuer -dates 2>/dev/null
        
        log "重启 Nginx..."
        docker restart one-recycle-nginx 2>/dev/null || true
        sleep 5
        
        log "✓ 证书安装完成！请访问 https://$DOMAIN 验证"
    else
        error "找不到对应的私钥文件，请确保同时提供 .crt 和 .key 文件"
        exit 1
    fi

elif [ "$1" = "manual-le" ]; then
    echo "==========================================="
    echo "  手动 Let's Encrypt 证书申请模式"
    echo "==========================================="
    
    log "检查 certbot 是否可用..."
    if command -v certbot &> /dev/null; then
        log "系统已安装 certbot"
    else
        warn "系统未安装 certbot，将尝试使用 Docker"
    fi
    
    log ""
    log "请确认以下条件已满足："
    log "  1. 域名 $DOMAIN 的 DNS 已解析到本服务器 IP"
    log "  2. 服务器防火墙已开放 80 和 443 端口"
    log "  3. 腾讯云 API 密钥已配置且有 DNSPod 权限"
    log ""
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "取消操作"
        exit 0
    fi
    
    log "启动临时 certbot 容器进行证书申请..."
    docker run --rm \
        -v "$SSL_DIR:/etc/letsencrypt" \
        -e DOMAIN="$DOMAIN" \
        -e EMAIL="${EMAIL:-admin@$DOMAIN}" \
        -e TENCENT_CLOUD_SECRET_ID="${TENCENT_CLOUD_SECRET_ID}" \
        -e TENCENT_CLOUD_SECRET_KEY="${TENCENT_CLOUD_SECRET_KEY}" \
        -v "$DEPLOY_DIR/certbot:/certbot:ro" \
        certbot/certbot:latest \
        sh /certbot/certbot-entrypoint.sh || {
            error "证书申请失败，请查看上方错误信息"
            exit 1
        }
    
    if [ -f "$LIVE_DIR/fullchain.pem" ]; then
        ISSUER=$(openssl x509 -in "$LIVE_DIR/fullchain.pem" -noout -issuer 2>/dev/null || echo "")
        if echo "$ISSUER" | grep -q "Let's Encrypt"; then
            log "✓ Let's Encrypt 证书申请成功！"
            log "重启 Nginx..."
            docker restart one-recycle-nginx 2>/dev/null || true
        else
            warn "证书文件存在但可能不是 Let's Encrypt 证书"
        fi
    else
        error "证书文件未生成"
    fi

elif [ "$1" = "" ]; then
    log "使用方法: $0 <command> [args]"
    log ""
    log "Commands:"
    log "  (无参数)     运行诊断"
    log "  fix-certbot  重启 Certbot 触发证书申请"
    log "  install-tencent <crt_path>  安装腾讯云证书"
    log "  manual-le     手动申请 Let's Encrypt 证书"
fi
