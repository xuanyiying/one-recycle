#!/bin/bash

# 一键启动所有微服务脚本 (自动模式)
# 使用方法: ./start-all-services-auto.sh

# 移除 set -e 以便更好地处理错误

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
            if npm ci --silent; then
                log_success "$service npm ci 完成"
            else
                log_warning "$service npm ci 失败，尝试 npm install"
                npm install --silent || log_error "$service npm install 失败"
            fi
        else
            if npm install --silent; then
                log_success "$service npm install 完成"
            else
                log_error "$service npm install 失败"
            fi
        fi
        
        # 如果是使用 Prisma 的服务，生成客户端
        if [ -f "prisma/schema.prisma" ]; then
            log_info "生成 $service 的 Prisma 客户端..."
            if npx prisma generate > /dev/null 2>&1; then
                log_success "$service Prisma 客户端生成完成"
            else
                log_error "$service Prisma 客户端生成失败"
            fi
        fi
        
        cd ..
        log_success "$service 依赖处理完成"
    done
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
        
        # 等待一秒让服务启动
        sleep 1
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
    log_info "开始启动所有微服务 (自动模式)..."
    
    # 检查当前目录
    if [ ! -f "package.json" ] || [ ! -d "api-gateway" ]; then
        log_error "请在 services 目录下运行此脚本"
        exit 1
    fi
    
   # check_dependencies
    #check_service_directories
    
    # 自动安装依赖
    #install_dependencies
    
    # 启动服务
    start_with_background
    
    show_status
    
    log_success "所有微服务启动完成！"
    log_info "使用 './check-services-status.sh' 检查服务状态"
}

# 运行主函数
main "$@"