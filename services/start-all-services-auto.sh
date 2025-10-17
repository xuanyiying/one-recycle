#!/bin/bash

# 一键启动所有微服务脚本 (自动模式)
# 使用方法: ./start-all-services-auto.sh
# 版本: 2.0 - 增强错误处理和日志记录

# 严格模式，但允许继续处理错误
set -o pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 全局变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
PID_DIR="$SCRIPT_DIR/pids"
STARTUP_LOG="$LOG_DIR/startup.log"
MAX_RETRIES=3
STARTUP_TIMEOUT=30

# 创建必要的目录
mkdir -p "$LOG_DIR" "$PID_DIR"

# 增强的日志函数
log_with_timestamp() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] $level $message" | tee -a "$STARTUP_LOG"
}

log_info() {
    log_with_timestamp "${BLUE}[INFO]${NC}" "$1"
}

log_success() {
    log_with_timestamp "${GREEN}[SUCCESS]${NC}" "$1"
}

log_warning() {
    log_with_timestamp "${YELLOW}[WARNING]${NC}" "$1"
}

log_error() {
    log_with_timestamp "${RED}[ERROR]${NC}" "$1"
}

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        log_with_timestamp "${PURPLE}[DEBUG]${NC}" "$1"
    fi
}

# 错误处理函数
handle_error() {
    local exit_code=$1
    local line_number=$2
    local command="$3"
    log_error "脚本在第 $line_number 行失败，退出码: $exit_code"
    log_error "失败的命令: $command"
    cleanup_on_exit
    exit $exit_code
}

# 清理函数
cleanup_on_exit() {
    log_info "执行清理操作..."
    # 这里可以添加清理逻辑
}

# 设置错误陷阱
trap 'handle_error $? $LINENO "$BASH_COMMAND"' ERR
trap cleanup_on_exit EXIT

# 微服务列表
SERVICES="api-gateway auth-service account-service category-service order-service payment-service inventory-service courier-service dispatch-service notification-service message-queue"

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
    log_info "检查系统依赖..."
    
    local missing_deps=()
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
        log_error "Node.js 未安装"
    else
        local node_version=$(node --version)
        log_info "Node.js 版本: $node_version"
        
        # 检查 Node.js 版本是否满足要求 (>= 16)
        local major_version=$(echo "$node_version" | sed 's/v\([0-9]*\).*/\1/')
        if [[ $major_version -lt 16 ]]; then
            log_warning "Node.js 版本过低 ($node_version)，建议使用 16+ 版本"
        fi
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
        log_error "npm 未安装"
    else
        local npm_version=$(npm --version)
        log_info "npm 版本: $npm_version"
    fi
    
    # 检查 tmux (可选)
    if ! command -v tmux &> /dev/null; then
        log_warning "tmux 未安装，将使用后台进程启动服务"
        USE_TMUX=false
    else
        USE_TMUX=true
        log_info "tmux 可用"
    fi
    
    # 如果有缺失的依赖，退出
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "缺少必要依赖: ${missing_deps[*]}"
        log_error "请安装缺失的依赖后重试"
        exit 1
    fi
    
    log_success "系统依赖检查完成"
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

# 重试执行命令
retry_command() {
    local max_attempts=$1
    local delay=$2
    shift 2
    local command=("$@")
    
    for ((i=1; i<=max_attempts; i++)); do
        log_debug "尝试执行命令 (第 $i/$max_attempts 次): ${command[*]}"
        if "${command[@]}"; then
            return 0
        else
            if [[ $i -lt $max_attempts ]]; then
                log_warning "命令执行失败，${delay}秒后重试..."
                sleep "$delay"
            fi
        fi
    done
    return 1
}

# 清理 node_modules 和重新安装
clean_and_reinstall() {
    local service=$1
    log_warning "清理 $service 的 node_modules 并重新安装..."
    
    # 删除 node_modules 和 package-lock.json
    rm -rf node_modules package-lock.json
    
    # 清理 npm 缓存
    npm cache clean --force 2>/dev/null || true
    
    # 重新安装
    if retry_command 2 5 npm install; then
        log_success "$service 重新安装成功"
        return 0
    else
        log_error "$service 重新安装失败"
        return 1
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装所有服务的依赖..."
    
    local failed_services=()
    local total_services=0
    local successful_services=0
    
    for service in $SERVICES; do
        ((total_services++))
        log_info "处理 $service 的依赖..."
        
        if [[ ! -d "$service" ]]; then
            log_warning "跳过 $service: 目录不存在"
            continue
        fi
        
        cd "$service" || {
            log_error "无法进入 $service 目录"
            failed_services+=("$service")
            continue
        }
        
        # 检查 package.json 是否存在
        if [[ ! -f "package.json" ]]; then
            log_warning "跳过 $service: package.json 不存在"
            cd ..
            continue
        fi
        
        # 安装依赖
        local install_success=false
        
        if [[ -f "package-lock.json" ]]; then
            log_info "$service: 使用 npm ci 安装依赖..."
            if retry_command 2 3 npm ci --silent; then
                install_success=true
            else
                log_warning "$service: npm ci 失败，尝试清理重装..."
                if clean_and_reinstall "$service"; then
                    install_success=true
                fi
            fi
        else
            log_info "$service: 使用 npm install 安装依赖..."
            if retry_command 2 3 npm install --silent; then
                install_success=true
            else
                log_warning "$service: npm install 失败，尝试清理重装..."
                if clean_and_reinstall "$service"; then
                    install_success=true
                fi
            fi
        fi
        
        if [[ "$install_success" == "false" ]]; then
            log_error "$service: 依赖安装失败"
            failed_services+=("$service")
            cd ..
            continue
        fi
        
        # 检查并安装 @nestjs/cli (如果需要)
        if grep -q "@nestjs" package.json && ! npm list @nestjs/cli &>/dev/null; then
            log_info "$service: 安装 @nestjs/cli..."
            if retry_command 2 3 npm install @nestjs/cli --save-dev; then
                log_success "$service: @nestjs/cli 安装完成"
            else
                log_warning "$service: @nestjs/cli 安装失败"
            fi
        fi
        
        # 如果是使用 Prisma 的服务，生成客户端
        if [[ -f "prisma/schema.prisma" ]]; then
            log_info "$service: 生成 Prisma 客户端..."
            if retry_command 2 5 npx prisma generate; then
                log_success "$service: Prisma 客户端生成完成"
            else
                log_error "$service: Prisma 客户端生成失败"
                failed_services+=("$service")
                cd ..
                continue
            fi
        fi
        
        ((successful_services++))
        cd ..
        log_success "$service: 依赖处理完成"
    done
    
    # 总结安装结果
    log_info "依赖安装总结: $successful_services/$total_services 个服务成功"
    
    if [[ ${#failed_services[@]} -gt 0 ]]; then
        log_warning "以下服务依赖安装失败: ${failed_services[*]}"
        log_warning "这些服务可能无法正常启动"
    fi
}

# 检查端口是否被占用
is_port_in_use() {
    local port=$1
    lsof -i ":$port" &>/dev/null
}

# 等待服务启动
wait_for_service() {
    local service=$1
    local port=$2
    local timeout=$3
    local start_time=$(date +%s)
    
    log_info "$service: 等待服务启动 (端口: $port, 超时: ${timeout}s)..."
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [[ $elapsed -ge $timeout ]]; then
            log_error "$service: 启动超时 (${timeout}s)"
            return 1
        fi
        
        if is_port_in_use "$port"; then
            log_success "$service: 服务已启动并监听端口 $port"
            return 0
        fi
        
        sleep 2
    done
}

# 检查服务健康状态
check_service_health() {
    local service=$1
    local port=$2
    
    # 尝试访问健康检查端点
    if curl -s --max-time 5 "http://localhost:$port/health" &>/dev/null; then
        log_success "$service: 健康检查通过"
        return 0
    elif curl -s --max-time 5 "http://localhost:$port" &>/dev/null; then
        log_warning "$service: 服务响应但无健康检查端点"
        return 0
    else
        log_warning "$service: 服务无响应"
        return 1
    fi
}

# 使用后台进程启动服务
start_with_background() {
    log_info "使用后台进程启动所有服务..."
    
    local started_services=()
    local failed_services=()
    local total_services=0
    
    for service in $SERVICES; do
        ((total_services++))
        port=$(get_service_port "$service")
        
        # 检查服务目录是否存在
        if [[ ! -d "$service" ]]; then
            log_warning "跳过 $service: 目录不存在"
            failed_services+=("$service")
            continue
        fi
        
        # 检查端口是否已被占用
        if is_port_in_use "$port"; then
            log_warning "$service: 端口 $port 已被占用，跳过启动"
            continue
        fi
        
        log_info "启动 $service (端口: $port)..."
        cd "$service" || {
            log_error "无法进入 $service 目录"
            failed_services+=("$service")
            continue
        }
        
        # 检查 package.json 中是否有 start:dev 脚本
        if ! npm run --silent 2>/dev/null | grep -q "start:dev"; then
            log_warning "$service: 未找到 start:dev 脚本，尝试使用 start"
            if ! npm run --silent 2>/dev/null | grep -q "start"; then
                log_error "$service: 未找到启动脚本"
                failed_services+=("$service")
                cd ..
                continue
            fi
        fi
        
        # 启动服务并记录 PID
        local log_file="$LOG_DIR/$service.log"
        local pid_file="$PID_DIR/$service.pid"
        
        # 清空之前的日志
        > "$log_file"
        
        # 启动服务
        npm run start:dev > "$log_file" 2>&1 &
        local pid=$!
        if [ $? -eq 0 ]; then
            echo "$pid" > "$pid_file"
            log_info "$service: 进程已启动 (PID: $pid)"
            
            # 等待服务启动
            if wait_for_service "$service" "$port" "$STARTUP_TIMEOUT"; then
                # 进行健康检查
                sleep 2
                if check_service_health "$service" "$port"; then
                    started_services+=("$service")
                    log_success "$service: 启动成功"
                else
                    log_warning "$service: 启动但健康检查失败"
                    started_services+=("$service")
                fi
            else
                log_error "$service: 启动失败或超时"
                failed_services+=("$service")
                
                # 清理失败的进程
                if kill -0 "$pid" 2>/dev/null; then
                    kill "$pid" 2>/dev/null || true
                fi
                rm -f "$pid_file"
            fi
        else
            log_error "$service: 无法启动进程"
            failed_services+=("$service")
        fi
        
        cd ..
    done
    
    # 启动结果总结
    local successful_count=${#started_services[@]}
    local failed_count=${#failed_services[@]}
    
    log_info "服务启动总结: $successful_count/$total_services 个服务成功启动"
    
    if [[ $successful_count -gt 0 ]]; then
        log_success "成功启动的服务: ${started_services[*]}"
    fi
    
    if [[ $failed_count -gt 0 ]]; then
        log_warning "启动失败的服务: ${failed_services[*]}"
        log_info "请检查相应的日志文件: $LOG_DIR/"
    fi
    
    log_info "日志文件位置: $LOG_DIR/"
    log_info "PID 文件位置: $PID_DIR/"
    log_info "使用 './check-services-status.sh' 检查服务状态"
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

# 显示帮助信息
show_help() {
    cat << EOF
用法: $0 [选项]

选项:
  -h, --help              显示此帮助信息
  -v, --verbose           启用详细日志输出
  -f, --force-install     强制重新安装所有依赖
  -s, --skip-deps         跳过依赖检查和安装
  -t, --timeout SECONDS  设置服务启动超时时间 (默认: 60秒)
  --clean                 清理所有日志和PID文件后退出

示例:
  $0                      # 正常启动所有服务
  $0 -v                   # 启用详细日志
  $0 -f                   # 强制重新安装依赖
  $0 -s                   # 跳过依赖安装
  $0 --clean              # 清理文件
EOF
}

# 清理函数
clean_files() {
    log_info "清理日志和PID文件..."
    
    if [[ -d "$LOG_DIR" ]]; then
        rm -rf "$LOG_DIR"
        log_success "已清理日志目录: $LOG_DIR"
    fi
    
    if [[ -d "$PID_DIR" ]]; then
        rm -rf "$PID_DIR"
        log_success "已清理PID目录: $PID_DIR"
    fi
    
    if [[ -f "$STARTUP_LOG" ]]; then
        rm -f "$STARTUP_LOG"
        log_success "已清理启动日志: $STARTUP_LOG"
    fi
    
    log_success "清理完成！"
}

# 主函数
main() {
    local force_install=false
    local skip_deps=false
    local verbose=false
    local clean_only=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                verbose=true
                DEBUG=true
                shift
                ;;
            -f|--force-install)
                force_install=true
                shift
                ;;
            -s|--skip-deps)
                skip_deps=true
                shift
                ;;
            -t|--timeout)
                if [[ -n "$2" && "$2" =~ ^[0-9]+$ ]]; then
                    STARTUP_TIMEOUT="$2"
                    shift 2
                else
                    log_error "无效的超时时间: $2"
                    exit 1
                fi
                ;;
            --clean)
                clean_only=true
                shift
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果只是清理，执行清理后退出
    if [[ "$clean_only" == true ]]; then
        clean_files
        exit 0
    fi
    
    log_info "开始启动所有微服务 (自动模式)..."
    log_info "启动超时设置: ${STARTUP_TIMEOUT}s"
    
    # 检查当前目录
    if [ ! -f "package.json" ] || [ ! -d "api-gateway" ]; then
        log_error "请在 services 目录下运行此脚本"
        exit 1
    fi
    
    # 记录启动开始时间
    local start_time=$(date +%s)
    
    # 检查基本依赖
    if ! check_dependencies; then
        log_error "依赖检查失败，无法继续"
        exit 1
    fi
    
    # 检查服务目录
    check_service_directories
    
    # 安装服务依赖
    if [[ "$skip_deps" != true ]]; then
        if [[ "$force_install" == true ]]; then
            log_info "强制重新安装所有依赖..."
        fi
        
        if ! install_dependencies; then
            log_warning "部分服务依赖安装失败，但将继续尝试启动服务"
        fi
    else
        log_info "跳过依赖安装"
    fi
    
    # 启动服务
    start_with_background
    
    show_status
    
    # 计算总耗时
    local end_time=$(date +%s)
    local total_time=$((end_time - start_time))
    
    log_success "所有微服务启动完成！总耗时: ${total_time}s"
    log_info "使用 './check-services-status.sh' 检查服务状态"
}

# 运行主函数
main "$@"