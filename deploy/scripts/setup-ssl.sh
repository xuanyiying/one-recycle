#!/bin/bash
# ============================================================================
# OneRecycle SSL 证书配置脚本
# 使用 Let's Encrypt 申请免费 SSL 证书
# ============================================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="backbuy.cn"
ADMIN_DOMAIN="admin.backbuy.cn"
API_DOMAIN="api.backbuy.cn"
WWW_DOMAIN="www.backbuy.cn"

SSL_DIR="/opt/one-recycle/deploy/nginx/ssl"
CERTBOT_DIR="/var/www/certbot"

echo -e "${BLUE}=========================================="
echo -e "  OneRecycle SSL 证书配置"
echo -e "  域名: ${DOMAIN}"
echo -e "==========================================${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 创建必要目录
mkdir -p ${SSL_DIR}
mkdir -p ${CERTBOT_DIR}

# ----------------------------------------------------------------------------
# 方法1: 使用 Certbot Standalone 模式 (推荐，如果端口80可用)
# ----------------------------------------------------------------------------
setup_certbot_standalone() {
    echo -e "${YELLOW}[方法1] 使用 Certbot Standalone 模式申请证书...${NC}"
    
    # 停止占用80端口的服务
    systemctl stop nginx 2>/dev/null || true
    
    # 申请证书
    certbot certonly --standalone \
        -d ${DOMAIN} \
        -d ${WWW_DOMAIN} \
        -d ${API_DOMAIN} \
        -d ${ADMIN_DOMAIN} \
        --agree-tos \
        --no-eff-email \
        --email admin@${DOMAIN} \
        --non-interactive
    
    # 复制证书到项目目录
    cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ${SSL_DIR}/
    cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ${SSL_DIR}/
    
    echo -e "${GREEN}证书申请成功！${NC}"
}

# ----------------------------------------------------------------------------
# 方法2: 使用 Certbot Webroot 模式 (如果 Nginx 已在运行)
# ----------------------------------------------------------------------------
setup_certbot_webroot() {
    echo -e "${YELLOW}[方法2] 使用 Certbot Webroot 模式申请证书...${NC}"
    
    # 确保 Nginx 配置中包含 certbot 验证路径
    certbot certonly --webroot \
        -w ${CERTBOT_DIR} \
        -d ${DOMAIN} \
        -d ${WWW_DOMAIN} \
        -d ${API_DOMAIN} \
        -d ${ADMIN_DOMAIN} \
        --agree-tos \
        --no-eff-email \
        --email admin@${DOMAIN} \
        --non-interactive
    
    # 复制证书到项目目录
    cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ${SSL_DIR}/
    cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ${SSL_DIR}/
    
    echo -e "${GREEN}证书申请成功！${NC}"
}

# ----------------------------------------------------------------------------
# 方法3: 手动上传证书
# ----------------------------------------------------------------------------
setup_manual_ssl() {
    echo -e "${YELLOW}[方法3] 手动配置 SSL 证书${NC}"
    echo -e "${BLUE}请将您的 SSL 证书文件上传到以下位置:${NC}"
    echo -e "  证书文件: ${YELLOW}${SSL_DIR}/fullchain.pem${NC}"
    echo -e "  私钥文件: ${YELLOW}${SSL_DIR}/privkey.pem${NC}"
    echo ""
    read -p "按 Enter 键继续 (确保证书文件已上传)..."
    
    if [ ! -f "${SSL_DIR}/fullchain.pem" ] || [ ! -f "${SSL_DIR}/privkey.pem" ]; then
        echo -e "${RED}错误: 找不到证书文件${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}证书文件已确认${NC}"
}

# ----------------------------------------------------------------------------
# 自动续期配置
# ----------------------------------------------------------------------------
setup_auto_renewal() {
    echo -e "${YELLOW}配置证书自动续期...${NC}"
    
    # 创建续期钩子脚本
    cat > /etc/letsencrypt/renewal-hooks/deploy/one-recycle.sh << EOF
#!/bin/bash
# 复制新证书到项目目录
cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ${SSL_DIR}/
cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ${SSL_DIR}/

# 重启 Nginx 容器
cd /opt/one-recycle
/usr/local/bin/docker-compose -f deploy/docker/docker-compose.production.yml restart nginx
EOF
    
    chmod +x /etc/letsencrypt/renewal-hooks/deploy/one-recycle.sh
    
    # 测试自动续期
    echo -e "${YELLOW}测试证书续期...${NC}"
    certbot renew --dry-run
    
    echo -e "${GREEN}自动续期配置完成${NC}"
}

# ----------------------------------------------------------------------------
# 主菜单
# ----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}请选择 SSL 证书配置方式:${NC}"
echo "  1) Let's Encrypt Standalone 模式 (推荐，需要80端口可用)"
echo "  2) Let's Encrypt Webroot 模式 (Nginx 已在运行时)"
echo "  3) 手动上传证书"
echo ""

read -p "请输入选项 [1-3]: " choice

case $choice in
    1)
        setup_certbot_standalone
        setup_auto_renewal
        ;;
    2)
        setup_certbot_webroot
        setup_auto_renewal
        ;;
    3)
        setup_manual_ssl
        ;;
    *)
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac

# 设置证书权限
chmod 644 ${SSL_DIR}/fullchain.pem
chmod 600 ${SSL_DIR}/privkey.pem

echo ""
echo -e "${GREEN}=========================================="
echo -e "  SSL 证书配置完成！"
echo -e "==========================================${NC}"
echo ""
echo -e "${BLUE}证书信息:${NC}"
openssl x509 -in ${SSL_DIR}/fullchain.pem -noout -subject -dates
echo ""
echo -e "${BLUE}接下来请执行:${NC}"
echo -e "  启动服务: ${YELLOW}./deploy/scripts/deploy.sh${NC}"
