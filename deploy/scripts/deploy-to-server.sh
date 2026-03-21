#!/bin/bash
# ============================================================================
# OneRecycle 一键部署 - 从本地上传到服务器
# 使用方法: bash deploy-to-server.sh <服务器IP>
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}用法: bash deploy-to-server.sh <服务器IP> [SSH端口] [用户名] [密钥路径]${NC}"
    echo -e "${YELLOW}示例: bash deploy-to-server.sh 123.45.67.89${NC}"
    echo -e "${YELLOW}示例: bash deploy-to-server.sh 123.45.67.89 22 root ~/.ssh/id_rsa${NC}"
    exit 1
fi

SERVER_IP=$1
SSH_PORT=${2:-22}
SSH_USER=${3:-root}
SSH_KEY=${4:-""}

SSH_OPTS="-o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new"
if [ -n "$SSH_KEY" ]; then
    SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
fi

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════╗"
echo "║     OneRecycle 一键部署                        ║"
echo "║     目标: ${SSH_USER}@${SERVER_IP}:${SSH_PORT}"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================================
# 步骤 1: 测试 SSH 连接
# ============================================================================
echo -e "${YELLOW}[1/4] 测试 SSH 连接...${NC}"
if ssh $SSH_OPTS -p $SSH_PORT ${SSH_USER}@${SERVER_IP} "echo ok" &> /dev/null; then
    echo -e "${GREEN}SSH 连接成功${NC}"
else
    echo -e "${RED}SSH 连接失败！请检查：${NC}"
    echo -e "  1. 服务器 IP: $SERVER_IP"
    echo -e "  2. SSH 端口: $SSH_PORT"
    echo -e "  3. 用户名: $SSH_USER"
    [ -n "$SSH_KEY" ] && echo -e "  4. 密钥文件: $SSH_KEY"
    exit 1
fi

# ============================================================================
# 步骤 2: 打包部署文件
# ============================================================================
echo -e "${YELLOW}[2/4] 打包部署文件...${NC}"

cd "$PROJECT_ROOT"

# 创建部署包（只包含服务器运行必需的文件）
TMPDIR=$(mktemp -d)
mkdir -p "$TMPDIR/one-recycle"

# 复制服务端代码
cp -r server "$TMPDIR/one-recycle/"
cp -r deploy "$TMPDIR/one-recycle/"
cp -r prisma "$TMPDIR/one-recycle/server/" 2>/dev/null || true

# 排除不必要的文件
cd "$TMPDIR/one-recycle"
find . -name 'node_modules' -type d -exec rm -rf {} + 2>/dev/null || true
find . -name 'dist' -type d -exec rm -rf {} + 2>/dev/null || true
find . -name '.git' -type d -exec rm -rf {} + 2>/dev/null || true
find . -name 'coverage' -type d -exec rm -rf {} + 2>/dev/null || true
find . -name '*.log' -delete 2>/dev/null || true

# 打包
cd "$TMPDIR"
tar czf /tmp/one-recycle-deploy.tar.gz one-recycle/
PACKAGE_SIZE=$(du -h /tmp/one-recycle-deploy.tar.gz | cut -f1)
echo -e "${GREEN}打包完成: $PACKAGE_SIZE${NC}"

# 清理临时目录
rm -rf "$TMPDIR"

# ============================================================================
# 步骤 3: 上传到服务器
# ============================================================================
echo -e "${YELLOW}[3/4] 上传到服务器...${NC}"

# 创建目标目录
ssh $SSH_OPTS -p $SSH_PORT ${SSH_USER}@${SERVER_IP} "mkdir -p /opt/one-recycle /opt/backups"

# 上传部署包
scp $SSH_OPTS -P $SSH_PORT /tmp/one-recycle-deploy.tar.gz ${SSH_USER}@${SERVER_IP}:/tmp/

echo -e "${GREEN}上传完成${NC}"

# 清理本地临时文件
rm -f /tmp/one-recycle-deploy.tar.gz

# ============================================================================
# 步骤 4: 在服务器上执行部署
# ============================================================================
echo -e "${YELLOW}[4/4] 在服务器上执行部署...${NC}"

ssh $SSH_OPTS -p $SSH_PORT ${SSH_USER}@${SERVER_IP} << 'REMOTE_SCRIPT'
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/opt/one-recycle"

echo -e "${YELLOW}解压部署包...${NC}"
cd /opt
tar xzf /tmp/one-recycle-deploy.tar.gz --overwrite
rm -f /tmp/one-recycle-deploy.tar.gz

# 确保部署脚本可执行
chmod +x $APP_DIR/deploy/scripts/deploy-server.sh 2>/dev/null || true

echo -e "${GREEN}文件上传完成！${NC}"
echo ""
echo -e "${YELLOW}接下来在服务器上执行部署：${NC}"
echo -e "  ${BLUE}ssh root@<服务器IP>${NC}"
echo -e "  ${BLUE}bash /opt/one-recycle/deploy/scripts/deploy-server.sh${NC}"
echo ""
echo -e "${YELLOW}或者直接在 OrcaTerm 中运行：${NC}"
echo -e "  ${BLUE}bash /opt/one-recycle/deploy/scripts/deploy-server.sh${NC}"

REMOTE_SCRIPT

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  文件上传完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}下一步操作：${NC}"
echo ""
echo -e "${YELLOW}方式 1 - 在 OrcaTerm 中执行（推荐）：${NC}"
echo -e "  打开 OrcaTerm 终端，连接到您的服务器，然后执行："
echo -e "  ${GREEN}bash /opt/one-recycle/deploy/scripts/deploy-server.sh${NC}"
echo ""
echo -e "${YELLOW}方式 2 - 从本机远程执行：${NC}"
echo -e "  ${GREEN}ssh $SSH_OPTS -p $SSH_PORT ${SSH_USER}@${SERVER_IP} 'bash /opt/one-recycle/deploy/scripts/deploy-server.sh'${NC}"
echo ""
