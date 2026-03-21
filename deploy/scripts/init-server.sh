#!/bin/bash
# ============================================================================
# OneRecycle 服务器初始化脚本
# 用于新购腾讯云服务器的首次环境配置
# ============================================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo -e "  OneRecycle 服务器初始化脚本"
echo -e "==========================================${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# ----------------------------------------------------------------------------
# 1. 系统更新
# ----------------------------------------------------------------------------
echo -e "${YELLOW}[1/8] 正在更新系统...${NC}"
apt-get update && apt-get upgrade -y

# ----------------------------------------------------------------------------
# 2. 安装基础工具
# ----------------------------------------------------------------------------
echo -e "${YELLOW}[2/8] 正在安装基础工具...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    net-tools \
    unzip \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban

# ----------------------------------------------------------------------------
# 3. 安装 Docker
# ----------------------------------------------------------------------------
echo -e "${YELLOW}[3/8] 正在安装 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker ubuntu
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Docker 安装完成${NC}"
else
    echo -e "${GREEN}Docker 已安装，跳过${NC}"
fi

# ----------------------------------------------------------------------------
# 4. 安装 Docker Compose
# ----------------------------------------------------------------------------
echo -e "${YELLOW}[4/8] 正在安装 Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    echo -e "${GREEN}Docker Compose 安装完成${NC}"
else
    echo -e "${GREEN}Docker Compose 已安装，跳过${NC}"
fi

# ----------------------------------------------------------------------------
# 5. 配置防火墙
# ----------------------------------------------------------------------------
echo -e "${YELLOW}[5/8] 正在配置防火墙...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

echo -e "${GREEN}防火墙规则已配置:${NC}"
ufw status

# ----------------------------------------------------------------------------
# 6. 配置 Fail2Ban (防止暴力破解)
# ----------------------------------------------------------------------------
echo -e "${YELLOW}[6/8] 正在配置 Fail2Ban...${NC}"
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl restart fail2ban
echo -e "${GREEN}Fail2Ban 配置完成${NC}"

# ----------------------------------------------------------------------------
# 7. 创建项目目录
# ----------------------------------------------------------------------------
echo -e "${YELLOW}[7/8] 正在创建项目目录...${NC}"
mkdir -p /opt/one-recycle
cd /opt/one-recycle

# 创建必要的子目录
mkdir -p deploy/nginx/ssl
mkdir -p deploy/config
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p data/ollama
mkdir -p logs/nginx
mkdir -p /var/www/certbot
mkdir -p /var/www/backbuy

chown -R ubuntu:ubuntu /opt/one-recycle

echo -e "${GREEN}项目目录结构已创建${NC}"

# ----------------------------------------------------------------------------
# 8. 系统优化配置
# ----------------------------------------------------------------------------
echo -e "${YELLOW}[8/8] 正在优化系统配置...${NC}"

# 增加文件描述符限制
cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65536
* hard nofile 65536
EOF

# 优化内核参数
cat >> /etc/sysctl.conf << 'EOF'
# 网络优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30

# 内存优化
vm.swappiness = 10
vm.dirty_ratio = 40
vm.dirty_background_ratio = 10
EOF

sysctl -p

echo -e "${GREEN}系统优化完成${NC}"

# ----------------------------------------------------------------------------
# 完成
# ----------------------------------------------------------------------------
echo -e "${GREEN}=========================================="
echo -e "  服务器初始化完成！"
echo -e "==========================================${NC}"
echo ""
echo -e "${BLUE}接下来请执行:${NC}"
echo -e "  1. 将部署文件上传到 /opt/one-recycle/"
echo -e "  2. 配置环境变量: ${YELLOW}cp deploy/config/.env.production deploy/config/.env.production${NC}"
echo -e "  3. 申请 SSL 证书: ${YELLOW}./deploy/scripts/setup-ssl.sh${NC}"
echo -e "  4. 启动服务: ${YELLOW}./deploy/scripts/deploy.sh${NC}"
echo ""
echo -e "${BLUE}建议操作:${NC}"
echo -e "  - 修改 SSH 默认端口 (可选)"
echo -e "  - 配置自动备份脚本"
echo -e "  - 设置监控告警"
