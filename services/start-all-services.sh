#!/bin/bash

# 一键启动所有微服务脚本
# 使用方法: ./start-all-services.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 微服务列表
SERVICES="api-gateway auth-service account-service category-service order-service payment-service inventory-service courier-service dispatch-service notification-service"

# 服务端口映射
get_service_port() {
    case $1 in
        "api-gateway") echo "3000" ;;
        "auth-service") echo "3001" ;;
        "account-service") echo "3002" ;;
        "order-service") echo "3003" ;;
        "payment-service") echo "3004" ;;
        "inventory-service") echo "3005" ;;
        "courier-service") echo "3006" ;;
        "dispatch-service") echo "3007" ;;
        "category-service") echo "3008" ;;
        "notification-service") echo "3009" ;;
        *) echo "unknown" ;;
    esac
}

# 检查是否安装了必要的工具
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    if ! command -v tmux &> /dev/null; then
        log_warning "tmux 未安装，将使用后台进程启动服务"
        USE_TMUX=false
    else
        USE_TMUX=true
    fi
    
    log_success "依赖检查完成"
}

# 检查服务目录是否存在
check_service_directories() {
    log_info "检查服务目录..."
    
    VALID_SERVICES=""
    for service in $SERVICES; do
        if [ -d "$service" ] && [ -f "$service/package.json" ]; then
            VALID_SERVICES="$VALID_SERVICES $service"
        else
            log_warning "跳过服务: $service (目录不存在或缺少package.json)"
        fi
    done
    
    SERVICES=$VALID_SERVICES
    log_success "服务目录检查完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装所有服务的依赖..."
    
    for service in $SERVICES; do
        log_info "安装 $service 的依赖..."
        cd "$service"
        
        if [ -f "package-lock.json" ]; then
            npm ci --silent
        else
            npm install --silent
        fi
        
        # 如果是使用 Prisma 的服务，生成客户端
        if [ -f "prisma/schema.prisma" ]; then
            log_info "生成 $service 的 Prisma 客户端..."
            npx prisma generate
        fi
        
        cd ..
        log_success "$service 依赖安装完成"
    done
}

# 构建所有服务
build_services() {
    log_info "构建所有服务..."
    
    for service in $SERVICES; do
        log_info "构建 $service..."
        cd "$service"
        npm run build
        cd ..
        log_success "$service 构建完成"
    done
}

# 使用 tmux 启动服务
start_with_tmux() {
    log_info "使用 tmux 启动所有服务..."
    
    # 创建新的 tmux 会话
    tmux new-session -d -s microservices
    
    local window_index=0
    for service in $SERVICES; do
        port=$(get_service_port "$service")
        
        if [ $window_index -eq 0 ]; then
            # 第一个窗口已经存在
            tmux rename-window -t microservices:$window_index "$service"
        else
            # 创建新窗口
            tmux new-window -t microservices -n "$service"
        fi
        
        # 在窗口中启动服务
        tmux send-keys -t microservices:$service "cd $service && npm run start:dev" Enter
        
        log_success "$service 已在 tmux 窗口中启动 (端口: $port)"
        ((window_index++))
    done
    
    log_success "所有服务已启动！使用 'tmux attach -t microservices' 查看服务状态"
    log_info "使用 'tmux list-windows -t microservices' 查看所有服务窗口"
    log_info "使用 'tmux kill-session -t microservices' 停止所有服务"
}

# 使用后台进程启动服务
start_with_background() {
    log_info "使用后台进程启动所有服务..."
    
    # 创建日志目录
    mkdir -p logs
    
    # 创建 PID 文件目录
    mkdir -p pids
    
    for service in $SERVICES; do
        port=$(get_service_port "$service")
        
        log_info "启动 $service (端口: $port)..."
        cd "$service"
        
        # 启动服务并记录 PID
        nohup npm run start:dev > "../logs/$service.log" 2>&1 &
        echo $! > "../pids/$service.pid"
        
        cd ..
        log_success "$service 已启动 (PID: $(cat pids/$service.pid))"
    done
    
    log_success "所有服务已启动！"
    log_info "日志文件位置: ./logs/"
    log_info "PID 文件位置: ./pids/"
    log_info "使用 './stop-all-services.sh' 停止所有服务"
}

# 显示服务状态
show_status() {
    echo ""
    log_info "服务状态概览:"
    echo "=================================="
    
    for service in $SERVICES; do
        port=$(get_service_port "$service")
        echo "  $service: http://localhost:$port"
    done
    
    echo "=================================="
    echo ""
}

# 主函数
main() {
    log_info "开始启动所有微服务..."
    
    # 检查当前目录
    if [ ! -f "package.json" ] || [ ! -d "api-gateway" ]; then
        log_error "请在 services 目录下运行此脚本"
        exit 1
    fi
    
    check_dependencies
    check_service_directories
    
    # 询问是否需要安装依赖
    read -p "是否需要安装/更新依赖? (y/N): " install_deps
    if [[ $install_deps =~ ^[Yy]$ ]]; then
        install_dependencies
    fi
    
    # 询问是否需要构建
    read -p "是否需要构建所有服务? (y/N): " build_all
    if [[ $build_all =~ ^[Yy]$ ]]; then
        build_services
    fi
    
    # 启动服务
    if [ "$USE_TMUX" = true ]; then
        start_with_tmux
    else
        start_with_background
    fi
    
    show_status
    
    log_success "所有微服务启动完成！"
}

# 运行主函数
main "$@"