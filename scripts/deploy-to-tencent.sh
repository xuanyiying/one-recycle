#!/bin/bash
# ============================================================================
# OneRecycle 一键部署脚本 - 本地到腾讯云服务器
# 使用方法: ./deploy-to-tencent.sh [options]
# ============================================================================

set -e

# 默认配置
SERVER_IP=""
SERVER_USER="ubuntu"
SERVER_PORT="22"
SSH_KEY=""
DEPLOY_DIR="/opt/one-recycle"
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_BUILD=false
SKIP_BACKUP=false

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 显示帮助
show_help() {
    cat << EOF
OneRecycle 一键部署脚本

使用方法:
    ./deploy-to-tencent.sh [选项]

选项:
    -h, --help              显示帮助信息
    -i, --ip <IP>           服务器 IP 地址 (必填)
    -u, --user <USER>       SSH 用户名 (默认: ubuntu)
    -p, --port <PORT>       SSH 端口 (默认: 22)
    -k, --key <KEY_PATH>    SSH 私钥路径
    -e, --env <ENV>         部署环境 (默认: production)
    --skip-tests            跳过测试
    --skip-build            跳过构建
    --skip-backup           跳过备份

示例:
    # 基本部署
    ./deploy-to-tencent.sh -i 123.456.789.0

    # 使用密钥部署
    ./deploy-to-tencent.sh -i 123.456.789.0 -k ~/.ssh/id_rsa

    # 快速部署 (跳过测试和备份)
    ./deploy-to-tencent.sh -i 123.456.789.0 --skip-tests --skip-backup

EOF
}

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -i|--ip)
            SERVER_IP="$2"
            shift 2
            ;;
        -u|--user)
            SERVER_USER="$2"
            shift 2
            ;;
        -p|--port)
            SERVER_PORT="$2"
            shift 2
            ;;
        -k|--key)
            SSH_KEY="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# 验证必填参数
if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}错误: 请指定服务器 IP 地址${NC}"
    show_help
    exit 1
fi

# 构建 SSH 选项
SSH_OPTS="-p $SERVER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=10"
if [ -n "$SSH_KEY" ]; then
    SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
fi

SCP_OPTS="-P $SERVER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=10"
if [ -n "$SSH_KEY" ]; then
    SCP_OPTS="$SCP_OPTS -i $SSH_KEY"
fi

# 检查服务器连接
check_connection() {
    echo -e "${YELLOW}[1/8] 检查服务器连接...${NC}"
    if ! ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "echo '连接成功'" > /dev/null 2>&1; then
        echo -e "${RED}错误: 无法连接到服务器 $SERVER_IP${NC}"
        echo -e "${RED}请检查:${NC}"
        echo -e "  - IP 地址是否正确"
        echo -e "  - SSH 密钥/密码是否正确"
        echo -e "  - 服务器是否开启 SSH 服务"
        exit 1
    fi
    echo -e "${GREEN}✓ 服务器连接正常${NC}"
}

# 运行测试
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        echo -e "${YELLOW}[2/8] 跳过测试${NC}"
        return
    fi

    echo -e "${YELLOW}[2/8] 运行测试...${NC}"
    
    cd server
    
    echo -e "${BLUE}运行 lint...${NC}"
    npm run lint || { echo -e "${RED}Lint 检查失败${NC}"; exit 1; }
    
    echo -e "${BLUE}运行类型检查...${NC}"
    npm run typecheck || { echo -e "${RED}类型检查失败${NC}"; exit 1; }
    
    echo -e "${BLUE}运行单元测试...${NC}"
    npm run test:cov:unit || { echo -e "${RED}单元测试失败${NC}"; exit 1; }
    
    cd ..
    echo -e "${GREEN}✓ 所有测试通过${NC}"
}

# 构建项目
build_project() {
    if [ "$SKIP_BUILD" = true ]; then
        echo -e "${YELLOW}[3/8] 跳过构建${NC}"
        return
    fi

    echo -e "${YELLOW}[3/8] 构建项目...${NC}"
    
    cd server
    echo -e "${BLUE}构建后端服务...${NC}"
    npm run build || { echo -e "${RED}后端构建失败${NC}"; exit 1; }
    cd ..
    
    echo -e "${GREEN}✓ 构建完成${NC}"
}

# 备份服务器数据
backup_server() {
    if [ "$SKIP_BACKUP" = true ]; then
        echo -e "${YELLOW}[4/8] 跳过备份${NC}"
        return
    fi

    echo -e "${YELLOW}[4/8] 备份服务器数据...${NC}"
    
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    
    ssh $SSH_OPTS $SERVER_USER@$SERVER_IP << EOF
        set -e
        if [ -d "$DEPLOY_DIR" ]; then
            echo "创建备份: backup_$BACKUP_DATE"
            sudo mkdir -p /opt/backups
            sudo tar czf /opt/backups/one-recycle_backup_$BACKUP_DATE.tar.gz -C /opt one-recycle --exclude='node_modules' --exclude='dist' --exclude='.git' 2>/dev/null || true
            
            # 备份数据库
            if docker ps | grep -q one-recycle-postgres; then
                echo "备份数据库..."
                docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > /tmp/db_backup_$BACKUP_DATE.sql 2>/dev/null || true
                sudo mv /tmp/db_backup_$BACKUP_DATE.sql /opt/backups/ 2>/dev/null || true
            fi
            
            # 清理旧备份 (保留最近10个)
            sudo ls -t /opt/backups/one-recycle_backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r sudo rm -f
            sudo ls -t /opt/backups/db_backup_*.sql 2>/dev/null | tail -n +11 | xargs -r sudo rm -f
        fi
EOF
    
    echo -e "${GREEN}✓ 备份完成${NC}"
}

# 准备部署包
prepare_package() {
    echo -e "${YELLOW}[5/8] 准备部署包...${NC}"
    
    # 创建临时目录
    TEMP_DIR=$(mktemp -d)
    DEPLOY_PACKAGE="$TEMP_DIR/one-recycle-deploy-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    echo -e "${BLUE}打包部署文件...${NC}"
    
    # 复制必要文件
    mkdir -p "$TEMP_DIR/package"
    cp -r server "$TEMP_DIR/package/"
    cp -r deploy "$TEMP_DIR/package/"
    cp -r apps/admin-web "$TEMP_DIR/package/apps/" 2>/dev/null || true
    
    # 清理不需要的文件
    find "$TEMP_DIR/package" -name 'node_modules' -type d -exec rm -rf {} + 2>/dev/null || true
    find "$TEMP_DIR/package" -name '.git' -type d -exec rm -rf {} + 2>/dev/null || true
    find "$TEMP_DIR/package" -name 'dist' -type d -exec rm -rf {} + 2>/dev/null || true
    find "$TEMP_DIR/package" -name '.next' -type d -exec rm -rf {} + 2>/dev/null || true
    find "$TEMP_DIR/package" -name 'coverage' -type d -exec rm -rf {} + 2>/dev/null || true
    find "$TEMP_DIR/package" -name '*.log' -delete 2>/dev/null || true
    
    # 打包
    cd "$TEMP_DIR"
    tar czf "$DEPLOY_PACKAGE" -C package .
    cd - > /dev/null
    
    echo -e "${GREEN}✓ 部署包准备完成: $(du -h "$DEPLOY_PACKAGE" | cut -f1)${NC}"
}

# 上传部署包
upload_package() {
    echo -e "${YELLOW}[6/8] 上传部署包到服务器...${NC}"
    
    # 创建远程目录
    ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "sudo mkdir -p $DEPLOY_DIR && sudo chown $SERVER_USER:$SERVER_USER $DEPLOY_DIR"
    
    # 上传文件
    echo -e "${BLUE}上传中...${NC}"
    scp $SCP_OPTS "$DEPLOY_PACKAGE" $SERVER_USER@$SERVER_IP:/tmp/
    
    # 解压
    ssh $SSH_OPTS $SERVER_USER@$SERVER_IP << EOF
        cd $DEPLOY_DIR
        sudo tar xzf /tmp/$(basename "$DEPLOY_PACKAGE") --overwrite
        sudo rm -f /tmp/$(basename "$DEPLOY_PACKAGE")
        sudo chown -R 1000:1000 $DEPLOY_DIR
EOF
    
    # 清理本地临时文件
    rm -rf "$TEMP_DIR"
    
    echo -e "${GREEN}✓ 上传完成${NC}"
}

# 在服务器上执行部署
deploy_on_server() {
    echo -e "${YELLOW}[7/8] 在服务器上执行部署...${NC}"
    
    ssh $SSH_OPTS $SERVER_USER@$SERVER_IP << EOF
        set -e
        cd $DEPLOY_DIR
        
        # 确保脚本可执行
        chmod +x deploy/scripts/*.sh
        
        # 检查环境变量文件
        if [ ! -f "deploy/config/.env.$ENVIRONMENT" ]; then
            echo "创建环境变量文件..."
            sudo cp deploy/config/.env.production deploy/config/.env.$ENVIRONMENT
            echo "${YELLOW}警告: 请编辑 deploy/config/.env.$ENVIRONMENT 配置实际的环境变量${NC}"
        fi
        
        # 执行部署脚本
        echo "开始部署..."
        sudo bash deploy/scripts/deploy.sh $ENVIRONMENT
EOF
    
    echo -e "${GREEN}✓ 部署完成${NC}"
}

# 验证部署
verify_deployment() {
    echo -e "${YELLOW}[8/8] 验证部署...${NC}"
    
    sleep 5
    
    # 检查服务健康
    HEALTH_STATUS=$(ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "curl -s -o /dev/null -w '%{http_code}' http://localhost:3002/health" 2>/dev/null || echo "000")
    
    if [ "$HEALTH_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ 健康检查通过 (HTTP 200)${NC}"
    else
        echo -e "${RED}✗ 健康检查失败 (HTTP $HEALTH_STATUS)${NC}"
        echo -e "${YELLOW}请检查服务日志:${NC}"
        echo -e "  ssh $SSH_OPTS $SERVER_USER@$SERVER_IP 'docker-compose -f $DEPLOY_DIR/deploy/docker/docker-compose.$ENVIRONMENT.yml logs'"
    fi
    
    echo ""
    echo -e "${BLUE}部署验证:${NC}"
    echo -e "  主站:     ${GREEN}https://backbuy.cn${NC}"
    echo -e "  API:      ${GREEN}https://api.backbuy.cn${NC}"
    echo -e "  管理后台: ${GREEN}https://admin.backbuy.cn${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}=========================================="
    echo -e "  OneRecycle 一键部署"
    echo -e "  目标服务器: $SERVER_IP"
    echo -e "  环境: $ENVIRONMENT"
    echo -e "==========================================${NC}"
    echo ""
    
    # 获取项目根目录
    cd "$(dirname "$0")/.."
    
    check_connection
    run_tests
    build_project
    backup_server
    prepare_package
    upload_package
    deploy_on_server
    verify_deployment
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo -e "  部署成功完成!"
    echo -e "==========================================${NC}"
}

# 执行主函数
main
