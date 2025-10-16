#!/bin/bash

# 单个微服务启动脚本
# 使用方法: ./start-single-service.sh <service-name>

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

# 检查系统资源
check_resources() {
    local node_processes=$(ps aux | grep -c "[n]ode")
    log_info "当前 Node.js 进程数: $node_processes"
    
    if [ $node_processes -gt 20 ]; then
        log_warning "系统中有较多 Node.js 进程，可能影响性能"
    fi
}

# 获取服务启动命令
get_start_command() {
    local service=$1
    case $service in
        "api-gateway") echo "start:dev" ;;
        *) echo "start" ;;
    esac
}

# 启动单个服务
start_service() {
    local service=$1
    local port=$(get_service_port $service)
    local start_cmd=$(get_start_command $service)
    
    if [ "$port" = "unknown" ]; then
        log_error "未知服务: $service"
        return 1
    fi
    
    if [ ! -d "$service" ]; then
        log_error "服务目录不存在: $service"
        return 1
    fi
    
    if [ ! -f "$service/package.json" ]; then
        log_error "package.json 不存在: $service"
        return 1
    fi
    
    # 检查端口是否被占用
    if lsof -i :$port > /dev/null 2>&1; then
        log_warning "端口 $port 已被占用，服务 $service 可能已在运行"
        return 0
    fi
    
    log_info "启动服务: $service (端口: $port)"
    
    cd "$service"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装依赖..."
        if [ -f "package-lock.json" ]; then
            npm ci --silent || npm install --silent
        else
            npm install --silent
        fi
    fi
    
    # 生成 Prisma 客户端
    if [ -f "prisma/schema.prisma" ]; then
        log_info "生成 Prisma 客户端..."
        npx prisma generate > /dev/null 2>&1 || log_warning "Prisma 客户端生成失败"
    fi
    
    # 创建必要的目录
    mkdir -p ../logs ../pids
    
    # 启动服务
    log_info "启动 $service (使用命令: npm run $start_cmd)..."
    nohup npm run $start_cmd > "../logs/$service.log" 2>&1 &
    local pid=$!
    echo $pid > "../pids/$service.pid"
    
    cd ..
    
    # 等待服务启动
    sleep 5
    
    # 检查服务是否启动成功
    if lsof -i :$port > /dev/null 2>&1; then
        log_success "$service 启动成功 (PID: $pid, 端口: $port)"
        return 0
    else
        log_error "$service 启动失败"
        return 1
    fi
}

# 主函数
main() {
    if [ $# -eq 0 ]; then
        echo "使用方法: $0 <service-name>"
        echo "可用服务:"
        echo "  api-gateway auth-service account-service category-service"
        echo "  order-service payment-service inventory-service courier-service"
        echo "  dispatch-service notification-service"
        exit 1
    fi
    
    local service=$1
    
    log_info "开始启动服务: $service"
    check_resources
    
    if start_service $service; then
        log_success "服务 $service 启动完成"
    else
        log_error "服务 $service 启动失败"
        exit 1
    fi
}

main "$@"