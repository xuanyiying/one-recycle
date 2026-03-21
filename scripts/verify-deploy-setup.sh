#!/bin/bash

################################################################################
# OneRecycle GitHub Actions 部署配置验证脚本
# 使用方法: ./scripts/verify-deploy-setup.sh
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# 输出函数
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNING_CHECKS++))
    ((TOTAL_CHECKS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_section() {
    echo -e "\n${YELLOW}▶ $1${NC}\n"
}

# 检查命令是否存在
check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 已安装 (版本: $($1 --version 2>&1 | head -n1))"
        return 0
    else
        print_error "$1 未安装"
        return 1
    fi
}

# 检查文件是否存在
check_file() {
    if [ -f "$1" ]; then
        print_success "$1 存在"
        return 0
    else
        print_error "$1 不存在"
        return 1
    fi
}

# 检查目录是否存在
check_dir() {
    if [ -d "$1" ]; then
        print_success "$1 存在"
        return 0
    else
        print_error "$1 不存在"
        return 1
    fi
}

# 获取用户输入
get_input() {
    local prompt=$1
    local default=$2
    local var_name=$3

    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\"${input:-$default}\""
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

# 检查 SSH 连接
check_ssh_connection() {
    local server_ip=$1
    local ssh_key=$2
    local ssh_user=${3:-ubuntu}
    local ssh_port=${4:-22}

    print_info "测试 SSH 连接..."
    if ssh -i "$ssh_key" -p "$ssh_port" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$ssh_user@$server_ip" "echo 'Connection successful'" &> /dev/null; then
        print_success "可以 SSH 连接到服务器 $server_ip"
        return 0
    else
        print_error "无法 SSH 连接到服务器 $server_ip"
        print_info "请检查:"
        print_info "  1. 服务器 IP 是否正确"
        print_info "  2. SSH 密钥是否正确"
        print_info "  3. 公钥是否已添加到服务器的 authorized_keys"
        print_info "  4. 服务器防火墙是否开放 22 端口"
        return 1
    fi
}

# 检查服务器上的软件
check_server_software() {
    local server_ip=$1
    local ssh_key=$2
    local ssh_user=${3:-ubuntu}
    local ssh_port=${4:-22}

    print_section "检查服务器软件"

    # 检查 Docker
    if ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "command -v docker" &> /dev/null; then
        local docker_version=$(ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "docker --version")
        print_success "Docker 已安装 ($docker_version)"
    else
        print_error "Docker 未安装"
    fi

    # 检查 Docker Compose
    if ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "command -v docker-compose" &> /dev/null; then
        local compose_version=$(ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "docker-compose --version")
        print_success "Docker Compose 已安装 ($compose_version)"
    else
        print_error "Docker Compose 未安装"
    fi

    # 检查磁盘空间
    local disk_space=$(ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "df -h / | awk 'NR==2 {print \$4}'")
    print_info "可用磁盘空间: $disk_space"
    if [[ $disk_space =~ [0-9]+G ]] && [ ${disk_space%G} -lt 20 ]; then
        print_warning "磁盘空间不足 20GB，建议清理或扩容"
    else
        print_success "磁盘空间充足"
    fi
}

# 检查服务器目录
check_server_directories() {
    local server_ip=$1
    local ssh_key=$2
    local ssh_user=${3:-ubuntu}
    local ssh_port=${4:-22}

    print_section "检查服务器目录"

    # 检查项目目录
    if ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "test -d /opt/one-recycle"; then
        print_success "项目目录 /opt/one-recycle 存在"
    else
        print_warning "项目目录 /opt/one-recycle 不存在，将在首次部署时创建"
    fi

    # 检查备份目录
    if ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "test -d /opt/backups"; then
        print_success "备份目录 /opt/backups 存在"
    else
        print_warning "备份目录 /opt/backups 不存在，将在首次部署时创建"
    fi
}

# 检查 SSL 证书
check_ssl_cert() {
    local server_ip=$1
    local ssh_key=$2
    local ssh_user=${3:-ubuntu}
    local ssh_port=${4:-22}
    local domain=$5

    print_section "检查 SSL 证书"

    # 检查域名解析
    local resolved_ip=$(dig +short $domain 2>/dev/null || echo "")
    if [ -n "$resolved_ip" ]; then
        if [ "$resolved_ip" = "$server_ip" ]; then
            print_success "域名 $domain 解析正确 ($server_ip)"
        else
            print_warning "域名 $domain 解析到 $resolved_ip，但服务器 IP 是 $server_ip"
        fi
    else
        print_error "无法解析域名 $domain"
    fi

    # 检查证书文件
    if ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "test -f /opt/one-recycle/deploy/nginx/ssl/fullchain.pem"; then
        print_success "SSL 证书文件 fullchain.pem 存在"
    else
        print_error "SSL 证书文件 fullchain.pem 不存在"
        return 1
    fi

    if ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "test -f /opt/one-recycle/deploy/nginx/ssl/privkey.pem"; then
        print_success "SSL 私钥文件 privkey.pem 存在"
    else
        print_error "SSL 私钥文件 privkey.pem 不存在"
        return 1
    fi

    # 检查证书有效期
    local cert_dates=$(ssh -i "$ssh_key" -p "$ssh_port" "$ssh_user@$server_ip" "openssl x509 -in /opt/one-recycle/deploy/nginx/ssl/fullchain.pem -noout -dates 2>/dev/null" || echo "")
    if [ -n "$cert_dates" ]; then
        print_info "证书有效期:"
        echo "$cert_dates" | sed 's/^/    /'
    fi
}

# 检查 GitHub 配置
check_github_config() {
    print_section "检查 GitHub 配置"

    # 检查是否有 git 远程仓库
    if git remote -v | grep -q "origin"; then
        local remote_url=$(git remote get-url origin)
        print_success "Git 远程仓库已配置: $remote_url"
    else
        print_error "Git 远程仓库未配置"
    fi

    # 检查 GitHub Actions 工作流文件
    if [ -f ".github/workflows/deploy.yml" ]; then
        print_success "GitHub Actions 工作流文件 deploy.yml 存在"
    else
        print_error "GitHub Actions 工作流文件 deploy.yml 不存在"
    fi

    if [ -f ".github/workflows/pr-check.yml" ]; then
        print_success "GitHub Actions 工作流文件 pr-check.yml 存在"
    else
        print_error "GitHub Actions 工作流文件 pr-check.yml 不存在"
    fi
}

# 主函数
main() {
    print_header "OneRecycle GitHub Actions 部署配置验证"

    # 读取配置信息
    print_section "配置信息"

    get_input "服务器 IP 地址" "" SERVER_IP
    get_input "SSH 用户名" "ubuntu" SSH_USER
    get_input "SSH 端口" "22" SSH_PORT
    get_input "SSH 私钥路径" "$HOME/.ssh/github_actions_2025" SSH_KEY
    get_input "域名" "backbuy.cn" DOMAIN

    echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

    # 验证配置信息
    if [ -z "$SERVER_IP" ]; then
        print_error "服务器 IP 不能为空"
        exit 1
    fi

    if [ ! -f "$SSH_KEY" ]; then
        print_error "SSH 私钥文件不存在: $SSH_KEY"
        exit 1
    fi

    print_success "配置信息已收集"
    print_info "服务器: $SSH_USER@$SERVER_IP:$SSH_PORT"
    print_info "SSH 密钥: $SSH_KEY"
    print_info "域名: $DOMAIN"

    # 开始检查
    print_section "开始验证配置"

    # 1. 本地环境检查
    print_section "1. 本地环境检查"

    check_command "node"
    check_command "npm"
    check_command "git"
    check_command "ssh"
    check_command "curl"

    # 2. 检查项目文件
    print_section "2. 项目文件检查"

    check_file "server/package.json"
    check_file "server/Dockerfile"
    check_file "deploy/docker/docker-compose.production.yml"
    check_file "deploy/nginx/nginx.conf"

    # 3. 检查环境变量
    print_section "3. 环境变量检查"

    if [ -f "deploy/config/.env.production" ]; then
        print_success "环境变量文件存在"

        # 检查必需的环境变量
        check_required_vars=("DB_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "WECHAT_APP_ID" "WECHAT_APP_SECRET")

        for var in "${check_required_vars[@]}"; do
            if grep -q "^${var}=" deploy/config/.env.production; then
                local value=$(grep "^${var}=" deploy/config/.env.production | cut -d'=' -f2)
                if [ -n "$value" ] && [ "$value" != "your_secure_password" ]; then
                    print_success "$var 已设置"
                else
                    print_warning "$value 需要设置有效值"
                fi
            else
                print_error "$var 未设置"
            fi
        done
    else
        print_warning "环境变量文件不存在，将在服务器上配置"
    fi

    # 4. 检查 SSH 连接
    print_section "4. SSH 连接检查"

    if check_ssh_connection "$SERVER_IP" "$SSH_KEY" "$SSH_USER" "$SSH_PORT"; then
        SSH_CONNECTION_OK=true
    else
        SSH_CONNECTION_OK=false
        print_error "SSH 连接失败，无法继续检查服务器配置"
    fi

    # 5. 检查服务器配置（如果 SSH 连接成功）
    if [ "$SSH_CONNECTION_OK" = true ]; then
        check_server_software "$SERVER_IP" "$SSH_KEY" "$SSH_USER" "$SSH_PORT"
        check_server_directories "$SERVER_IP" "$SSH_KEY" "$SSH_USER" "$SSH_PORT"
        check_ssl_cert "$SERVER_IP" "$SSH_KEY" "$SSH_USER" "$SSH_PORT" "$DOMAIN"
    fi

    # 6. 检查 GitHub 配置
    check_github_config

    # 总结
    print_header "验证总结"

    echo -e "总检查项: $TOTAL_CHECKS"
    echo -e "${GREEN}通过: $PASSED_CHECKS${NC}"
    echo -e "${YELLOW}警告: $WARNING_CHECKS${NC}"
    echo -e "${RED}失败: $FAILED_CHECKS${NC}"

    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 所有必需检查通过！可以开始部署。${NC}\n"
        exit 0
    else
        echo -e "\n${RED}❌ 有 $FAILED_CHECKS 项检查失败，请修复后再部署。${NC}\n"
        echo -e "${YELLOW}提示: 运行 'bash scripts/verify-deploy-setup.sh' 重新检查${NC}\n"
        exit 1
    fi
}

# 运行主函数
main
