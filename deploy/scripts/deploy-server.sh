#!/bin/bash
# ============================================================================
# OneRecycle 一键部署脚本（OrcaTerm 版本）
# 在服务器上直接运行: bash deploy.sh
# ============================================================================

set -e

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/opt/one-recycle"
DEPLOY_DIR="$APP_DIR/deploy"

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════╗"
echo "║     OneRecycle 一键部署脚本                   ║"
echo "║     腾讯云轻量应用服务器                      ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================================
# 步骤 1: 环境检查
# ============================================================================
echo -e "${YELLOW}[1/8] 环境检查...${NC}"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker 未安装，正在安装...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}Docker 安装完成${NC}"
else
    echo -e "${GREEN}Docker 已安装: $(docker --version)${NC}"
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose 未安装，正在安装...${NC}"
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    echo -e "${GREEN}Docker Compose 安装完成${NC}"
else
    echo -e "${GREEN}Docker Compose 已安装${NC}"
fi

# 磁盘空间检查
DISK_AVAIL=$(df -BG / | awk 'NR==2 {print $4}' | tr -d 'G')
if [ "$DISK_AVAIL" -lt 10 ]; then
    echo -e "${RED}磁盘空间不足 ${DISK_AVAIL}G，建议至少 10G${NC}"
fi

# ============================================================================
# 步骤 2: 创建项目目录
# ============================================================================
echo -e "${YELLOW}[2/8] 创建项目目录...${NC}"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs/nginx
mkdir -p $DEPLOY_DIR/config
mkdir -p $DEPLOY_DIR/nginx/ssl
mkdir -p $DEPLOY_DIR/docker
mkdir -p /opt/backups
echo -e "${GREEN}目录创建完成${NC}"

# ============================================================================
# 步骤 3: 检查 .gitignore 确保 config 不被忽略
# ============================================================================
echo -e "${YELLOW}[3/8] 准备配置文件...${NC}"

# 如果 .env.production 不存在，创建默认配置
if [ ! -f "$DEPLOY_DIR/config/.env.production" ]; then
    cat > "$DEPLOY_DIR/config/.env.production" << 'ENVEOF'
# OneRecycle 生产环境默认配置
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=one_recycle
DB_PASSWORD=OneRecycle2025Secure
DB_NAME=one_recycle
DATABASE_URL=postgresql://one_recycle:OneRecycle2025Secure@postgres:5432/one_recycle?schema=public
DATABASE_POOL_SIZE=10
DATABASE_CONNECTION_TIMEOUT=10000
DATABASE_IDLE_TIMEOUT=30000

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=OneRecycleRedis2025
REDIS_DB=0
REDIS_SSL=false
REDIS_POOL_SIZE=10
REDIS_RETRY_DELAY=1000
REDIS_MAX_RETRIES=3

JWT_SECRET=one-recycle-jwt-secret-key-2025-production-change-me
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_DAYS=30
CODE_EXPIRES_MINUTES=5
MAX_CODE_ATTEMPTS=3

CORS_ORIGINS=https://admin.backbuy.cn,https://backbuy.cn

WECHAT_APP_ID=your_app_id_here
WECHAT_APP_SECRET=your_app_secret_here

AI_DEFAULT_PROVIDER=aliyun
AI_SELECTION_STRATEGY=health_check

LOG_LEVEL=info
ENVEOF
    echo -e "${GREEN}创建默认 .env.production${NC}"
fi

echo -e "${GREEN}配置文件准备完成${NC}"

# ============================================================================
# 步骤 4: SSL 证书检查
# ============================================================================
echo -e "${YELLOW}[4/8] 检查 SSL 证书...${NC}"

if [ ! -f "$DEPLOY_DIR/nginx/ssl/fullchain.pem" ] || [ ! -f "$DEPLOY_DIR/nginx/ssl/privkey.pem" ]; then
    echo -e "${YELLOW}SSL 证书不存在！${NC}"
    echo -e "${YELLOW}请将证书文件上传到服务器：${NC}"
    echo -e "  证书文件: $DEPLOY_DIR/nginx/ssl/fullchain.pem"
    echo -e "  私钥文件: $DEPLOY_DIR/nginx/ssl/privkey.pem"
    echo ""
    echo -e "${YELLOW}例如使用 scp 上传：${NC}"
    echo -e "  ${BLUE}scp your_cert.pem root@<服务器IP>:$DEPLOY_DIR/nginx/ssl/fullchain.pem${NC}"
    echo -e "  ${BLUE}scp your_key.pem  root@<服务器IP>:$DEPLOY_DIR/nginx/ssl/privkey.pem${NC}"
    echo ""

    # 创建自签名证书作为临时方案
    echo -e "${YELLOW}创建临时自签名证书（仅用于测试）...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$DEPLOY_DIR/nginx/ssl/privkey.pem" \
        -out "$DEPLOY_DIR/nginx/ssl/fullchain.pem" \
        -subj "/CN=backbuy.cn/O=OneRecycle/C=CN" 2>/dev/null
    echo -e "${RED}已创建临时自签名证书，浏览器会显示不安全警告${NC}"
    echo -e "${RED}请尽快替换为正式 SSL 证书！${NC}"
else
    echo -e "${GREEN}SSL 证书已存在${NC}"
    CERT_EXPIRY=$(openssl x509 -in "$DEPLOY_DIR/nginx/ssl/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2)
    echo -e "${GREEN}证书有效期至: $CERT_EXPIRY${NC}"
fi

chmod 644 "$DEPLOY_DIR/nginx/ssl/fullchain.pem" 2>/dev/null || true
chmod 600 "$DEPLOY_DIR/nginx/ssl/privkey.pem" 2>/dev/null || true

# ============================================================================
# 步骤 5: 上传文件检查
# ============================================================================
echo -e "${YELLOW}[5/8] 检查部署文件...${NC}"

REQUIRED_FILES=(
    "$DEPLOY_DIR/docker/docker-compose.production.yml"
    "$DEPLOY_DIR/nginx/nginx.conf"
    "$APP_DIR/server/Dockerfile"
    "$APP_DIR/server/package.json"
    "$APP_DIR/server/prisma/schema.prisma"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}以下必需文件缺失：${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "  ${RED}✗ $file${NC}"
    done
    echo ""
    echo -e "${YELLOW}请先上传项目文件到服务器：${NC}"
    echo -e "  ${BLUE}scp -r deploy/ server/ root@<服务器IP>:$APP_DIR/${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}所有部署文件检查通过${NC}"
fi

# ============================================================================
# 步骤 6: 防火墙配置
# ============================================================================
echo -e "${YELLOW}[6/8] 检查防火墙...${NC}"

if command -v ufw &> /dev/null; then
    if ufw status | grep -q "active"; then
        ufw allow 80/tcp > /dev/null 2>&1
        ufw allow 443/tcp > /dev/null 2>&1
        ufw allow 3002/tcp > /dev/null 2>&1
        echo -e "${GREEN}防火墙已开放端口: 80, 443, 3002${NC}"
    else
        echo -e "${YELLOW}UFW 防火墙未启用${NC}"
    fi
elif command -v firewall-cmd &> /dev/null; then
    if systemctl is-active firewalld &> /dev/null; then
        firewall-cmd --permanent --add-port=80/tcp > /dev/null 2>&1
        firewall-cmd --permanent --add-port=443/tcp > /dev/null 2>&1
        firewall-cmd --permanent --add-port=3002/tcp > /dev/null 2>&1
        firewall-cmd --reload > /dev/null 2>&1
        echo -e "${GREEN}防火墙已开放端口: 80, 443, 3002${NC}"
    else
        echo -e "${YELLOW}Firewalld 未启用${NC}"
    fi
else
    echo -e "${YELLOW}未检测到防火墙，请确保腾讯云安全组已开放: 80, 443, 3002${NC}"
fi

# ============================================================================
# 步骤 7: 构建和启动服务
# ============================================================================
echo -e "${YELLOW}[7/8] 构建 Docker 镜像...${NC}"
echo -e "${YELLOW}（首次构建可能需要 5-15 分钟，请耐心等待）${NC}"

cd $DEPLOY_DIR/docker

# 使用 docker compose 或 docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD -f docker-compose.production.yml build --parallel 2>&1 | tail -20

echo -e "${YELLOW}[7/8] 启动服务...${NC}"
$COMPOSE_CMD -f docker-compose.production.yml up -d

# ============================================================================
# 步骤 8: 健康检查
# ============================================================================
echo -e "${YELLOW}[8/8] 健康检查（等待服务启动）...${NC}"

# 等待 PostgreSQL 和 Redis 就绪
echo -e "${YELLOW}等待数据库就绪...${NC}"
for i in $(seq 1 30); do
    if $COMPOSE_CMD -f docker-compose.production.yml exec -T postgres pg_isready -U one_recycle &> /dev/null; then
        echo -e "${GREEN}PostgreSQL 就绪${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}PostgreSQL 启动超时${NC}"
    fi
    sleep 2
done

# 等待 API Gateway 就绪
echo -e "${YELLOW}等待 API Gateway 就绪...${NC}"
for i in $(seq 1 30); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo -e "${GREEN}API Gateway 就绪 (HTTP $HTTP_CODE)${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}API Gateway 启动超时，请检查日志：${NC}"
        echo -e "  ${BLUE}$COMPOSE_CMD -f docker-compose.production.yml logs api-gateway${NC}"
    fi
    sleep 3
done

# 显示服务状态
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  服务状态：${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
$COMPOSE_CMD -f docker-compose.production.yml ps

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}访问地址：${NC}"
echo -e "  API (HTTP):  ${YELLOW}http://<服务器IP>:3002${NC}"
echo -e "  API (HTTPS): ${YELLOW}https://api.backbuy.cn${NC}"
echo -e "  健康检查:    ${YELLOW}http://<服务器IP>:3002/api/health${NC}"
echo -e "  Swagger 文档:${YELLOW}http://<服务器IP>:3002/api/docs${NC}"
echo ""
echo -e "${BLUE}常用命令：${NC}"
echo -e "  查看日志: ${YELLOW}cd $DEPLOY_DIR/docker && $COMPOSE_CMD -f docker-compose.production.yml logs -f${NC}"
echo -e "  查看状态: ${YELLOW}cd $DEPLOY_DIR/docker && $COMPOSE_CMD -f docker-compose.production.yml ps${NC}"
echo -e "  重启服务: ${YELLOW}cd $DEPLOY_DIR/docker && $COMPOSE_CMD -f docker-compose.production.yml restart${NC}"
echo -e "  停止服务: ${YELLOW}cd $DEPLOY_DIR/docker && $COMPOSE_CMD -f docker-compose.production.yml down${NC}"
echo -e "  更新代码: ${YELLOW}cd $APP_DIR && git pull && cd $DEPLOY_DIR/docker && $COMPOSE_CMD -f docker-compose.production.yml up -d --build${NC}"
echo ""
echo -e "${YELLOW}提示：${NC}"
echo -e "  1. 请修改 ${BLUE}$DEPLOY_DIR/config/.env.production${NC} 中的配置为实际值"
echo -e "  2. 替换 SSL 证书为正式证书"
echo -e "  3. 确保腾讯云安全组开放了 80、443、3002 端口"
echo ""
