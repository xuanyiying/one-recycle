#!/bin/bash

# 微服务状态检查脚本
# 用于检查所有微服务的运行状态、健康状况和诊断问题

set -o pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# 全局变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
PID_DIR="$SCRIPT_DIR/pids"
REPORT_FILE="$SCRIPT_DIR/service-status-report.txt"
DEBUG=false
DETAILED=false
HEALTH_CHECK_TIMEOUT=5
MAX_LOG_LINES=20

# 微服务列表
SERVICES=(
    "auth-service"
    "order-service"
    "payment-service"
    "inventory-service"
    "notification-service"
    "courier-service"
    "dispatch-service"
    "category-service"
    "account-service"
    "api-gateway"
)

# 服务端口映射
SERVICE_PORTS_auth_service="3001"
SERVICE_PORTS_order_service="3002"
SERVICE_PORTS_payment_service="3003"
SERVICE_PORTS_inventory_service="3004"
SERVICE_PORTS_notification_service="3005"
SERVICE_PORTS_courier_service="3006"
SERVICE_PORTS_dispatch_service="3007"
SERVICE_PORTS_category_service="3008"
SERVICE_PORTS_account_service="3009"
SERVICE_PORTS_api_gateway="3000"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_debug() {
    if [[ "$DEBUG" == true ]]; then
        echo -e "${GRAY}[DEBUG]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
    fi
}

log_header() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

log_detail() {
    if [[ "$DETAILED" == true ]]; then
        echo -e "${GRAY}  $1${NC}"
    fi
}

# 获取服务端口
get_service_port() {
    local service=$1
    local service_var="SERVICE_PORTS_$(echo "$service" | tr '-' '_')"
    eval "echo \$$service_var"
}

# 检查端口是否被占用
check_port() {
    local port=$1
    lsof -i ":$port" >/dev/null 2>&1
}

# 检查端口占用情况
check_port_status() {
    local service=$1
    local port=$2
    
    log_debug "检查 $service 端口 $port 占用情况"
    
    local port_info
    port_info=$(lsof -i ":$port" 2>/dev/null)
    
    if [[ -n "$port_info" ]]; then
        local pid=$(echo "$port_info" | awk 'NR==2 {print $2}')
        local process_name=$(echo "$port_info" | awk 'NR==2 {print $1}')
        echo -e "${GREEN}✓${NC} $service Port $port: Running PID: $pid Process: $process_name"
        log_detail "端口详情: $port_info"
        return 0
    else
        echo -e "${RED}✗${NC} $service Port $port: Not running"
        return 1
    fi
}

# 增强的服务健康检查
check_service_health() {
    local service=$1
    local port=$2
    
    log_debug "检查 $service 健康状态"
    
    # 检查端口是否可达
    if ! check_port "$port"; then
        echo -e "${RED}✗${NC} $service: Port $port not accessible"
        return 1
    fi
    
    # 检查健康端点
    local health_url="http://localhost:$port/health"
    local response_time
    local http_status
    
    if command -v curl >/dev/null 2>&1; then
        response_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time "$HEALTH_CHECK_TIMEOUT" "$health_url" 2>/dev/null || echo "timeout")
        http_status=$(curl -o /dev/null -s -w "%{http_code}" --max-time "$HEALTH_CHECK_TIMEOUT" "$health_url" 2>/dev/null || echo "000")
        
        if [[ "$http_status" == "200" ]]; then
            echo -e "${GREEN}✓${NC} $service: Health check passed ${response_time}s"
            return 0
        elif [[ "$http_status" != "000" ]]; then
            echo -e "${YELLOW}⚠${NC} $service: Health endpoint returned $http_status ${response_time}s"
        fi
    fi
    
    # 尝试根路径
    local root_url="http://localhost:$port/"
    if command -v curl >/dev/null 2>&1; then
        response_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time "$HEALTH_CHECK_TIMEOUT" "$root_url" 2>/dev/null || echo "timeout")
        http_status=$(curl -o /dev/null -s -w "%{http_code}" --max-time "$HEALTH_CHECK_TIMEOUT" "$root_url" 2>/dev/null || echo "000")
        
        if [[ "$http_status" =~ ^[23] ]]; then
            echo -e "${GREEN}✓${NC} $service: Root endpoint accessible $http_status ${response_time}s"
            return 0
        else
            echo -e "${RED}✗${NC} $service: Root endpoint returned $http_status ${response_time}s"
        fi
    fi
    
    return 1
}

# 检查进程状态
check_process_status() {
    local service=$1
    local pid_file="$PID_DIR/$service.pid"
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $service: Process running PID: $pid"
            log_detail "进程详情: $(ps -p $pid -o pid,ppid,user,comm,args --no-headers 2>/dev/null || echo 'N/A')"
            return 0
        else
            echo -e "${RED}✗${NC} $service: PID file exists but process not running PID: $pid"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠${NC} $service: No PID file found"
        return 1
    fi
}

# 显示系统资源使用情况
show_system_resources() {
    log_header "系统资源使用情况"
    
    # CPU 使用率
    if command -v top >/dev/null 2>&1; then
        echo "CPU 使用率:"
        top -l 1 -n 0 | grep "CPU usage" | sed 's/^/  /'
    fi
    
    # 内存使用率
    if command -v vm_stat &> /dev/null; then
        echo "内存使用情况:"
        vm_stat | head -5 | sed 's/^/  /'
    fi
    
    # Node.js 进程
    echo "Node.js 进程:"
    local node_processes
    node_processes=$(ps aux | grep -E "(node|npm)" | grep -v grep | head -10)
    if [[ -n "$node_processes" ]]; then
        echo "$node_processes" | awk '{print "  " $1, $2, $3, $4, $11}'
    else
        echo "  无 Node.js 进程"
    fi
    
    echo ""
}

# 显示日志文件信息
show_log_files() {
    log_header "日志文件信息"
    
    if [[ ! -d "$LOG_DIR" ]]; then
        log_warning "日志目录不存在: $LOG_DIR"
        return
    fi
    
    echo "日志目录: $LOG_DIR"
    echo "总日志文件数: $(find "$LOG_DIR" -name "*.log" | wc -l)"
    echo ""
    
    for service in "${SERVICES[@]}"; do
        analyze_log_file "$service"
    done
}

# 分析日志文件
analyze_log_file() {
    local service=$1
    local log_file="$LOG_DIR/$service.log"
    
    echo "----------------------------------------"
    echo "服务: $service"
    
    if [[ ! -f "$log_file" ]]; then
        echo -e "${YELLOW}⚠${NC} 日志文件不存在: $log_file"
        return
    fi
    
    # 文件基本信息
    local file_size=$(du -h "$log_file" | cut -f1)
    local mod_time=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$log_file" 2>/dev/null || echo "N/A")
    local line_count=$(wc -l < "$log_file" 2>/dev/null || echo "0")
    
    echo "  文件大小: $file_size"
    echo "  修改时间: $mod_time"
    echo "  行数: $line_count"
    
    # 错误统计
    local error_count=$(grep -i "error\|exception\|failed" "$log_file" 2>/dev/null | wc -l)
    if [[ $error_count -gt 0 ]]; then
        echo -e "  ${RED}错误数量: $error_count${NC}"
        if [[ "$DETAILED" == true ]]; then
            echo "  最近错误:"
            grep -i "error\|exception\|failed" "$log_file" | tail -3 | sed 's/^/    /'
        fi
    fi
    
    # 警告统计
    local warning_count=$(grep -i "warn\|warning" "$log_file" 2>/dev/null | wc -l)
    
    if [[ $warning_count -gt 0 ]]; then
        echo -e "  ${YELLOW}警告数量: $warning_count${NC}"
    fi
    
    # 显示最近的日志条目
    if [[ "$DETAILED" == true && $line_count -gt 0 ]]; then
        echo "  最近日志 最后 $MAX_LOG_LINES 行:"
        tail -n "$MAX_LOG_LINES" "$log_file" | while read -r line; do
            if [[ "$line" =~ [Ee]rror|[Ee]xception|[Ff]ailed ]]; then
                echo "    ${RED}→${NC} $line"
            elif [[ "$line" =~ [Ww]arn ]]; then
                echo "    ${YELLOW}→${NC} $line"
            else
                echo "    ${GRAY}→${NC} $line"
            fi
        done
    fi
    
    echo ""
}

# 诊断服务问题
diagnose_service_issues() {
    local service=$1
    local port=$(get_service_port "$service")
    
    log_header "诊断服务: $service"
    
    # 检查服务目录
    if [[ ! -d "$service" ]]; then
        log_error "$service: 服务目录不存在"
        return
    fi
    
    # 检查 package.json
    if [[ ! -f "$service/package.json" ]]; then
        log_error "$service: package.json 不存在"
    else
        log_success "$service: package.json 存在"
    fi
    
    # 检查 node_modules
    if [[ ! -d "$service/node_modules" ]]; then
        log_error "$service: node_modules 目录不存在，需要安装依赖"
    else
        local modules_count
        modules_count=$(find "$service/node_modules" -maxdepth 1 -type d | wc -l)
        log_success "$service: node_modules 存在 $modules_count 个模块"
    fi
    
    # 检查 Prisma (如果适用)
    if [[ -f "$service/prisma/schema.prisma" ]]; then
        if [[ -d "$service/prisma/generated" ]]; then
            log_success "$service: Prisma 客户端已生成"
        else
            log_error "$service: Prisma 客户端未生成，需要运行 npx prisma generate"
        fi
    fi
    
    # 检查端口冲突
    local port_process
    port_process=$(lsof -i ":$port" 2>/dev/null | awk 'NR==2 {print $1, $2}')
    
    if [[ -n "$port_process" ]]; then
        local process_name=$(echo "$port_process" | cut -d' ' -f1)
        local process_pid=$(echo "$port_process" | cut -d' ' -f2)
        
        if [[ "$process_name" == "node" ]]; then
            log_info "$service: 端口 $port 被 Node.js 进程占用 PID: $process_pid"
        else
            log_warning "$service: 端口 $port 被其他进程占用: $process_name PID: $process_pid"
        fi
    fi
    
    # 分析日志文件
    analyze_log_file "$service"
}

# 快速健康检查
quick_health_check() {
    log_header "快速健康检查"
    
    local total_count=0
    local healthy_count=0
    
    for service in "${SERVICES[@]}"; do
        port=$(get_service_port "$service")
        ((total_count++))
        if check_port "$port"; then
            ((healthy_count++))
        fi
    done
    
    if [ $healthy_count -eq $total_count ]; then
        log_success "所有服务 $healthy_count/$total_count 都在运行"
    elif [ $healthy_count -gt 0 ]; then
        log_warning "部分服务 $healthy_count/$total_count 在运行"
    else
        log_error "没有服务在运行 $healthy_count/$total_count"
    fi
    
    echo ""
}

# 显示帮助信息
show_help() {
    echo "微服务状态检查脚本"
    echo ""
    echo "用法: $0 [选项] [服务名...]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示此帮助信息"
    echo "  -v, --verbose           详细输出模式"
    echo "  -d, --debug             调试模式"
    echo "  -q, --quiet             静默模式"
    echo "  -r, --report            生成状态报告"
    echo "  --fix                   尝试自动修复问题"
    echo "  --diagnose SERVICE      诊断特定服务"
    echo "  --health-only           只进行健康检查"
    echo "  --no-color              禁用颜色输出"
    echo ""
    echo "服务列表:"
    for service in "${SERVICES[@]}"; do
        echo "  - $service"
    done
    echo ""
    echo "示例:"
    echo "  $0                      检查所有服务"
    echo "  $0 -v                   详细模式检查所有服务"
    echo "  $0 --diagnose auth-service  诊断认证服务"
    echo "  $0 auth-service order-service  只检查指定服务"
}

# 生成报告
generate_report() {
    log_info "生成状态报告: $REPORT_FILE"
    
    {
        echo "微服务状态报告"
        echo "生成时间: $(date)"
        echo "========================================"
        echo ""
        
        # 重新运行检查并输出到报告
        DETAILED=true
        for service in "${SERVICES[@]}"; do
            echo "服务: $service"
            echo "----------------------------------------"
            local port=$(get_service_port "$service")
            check_port_status "$service" "$port"
            check_process_status "$service"
            check_service_health "$service" "$port"
            echo ""
        done
        
        echo "系统资源:"
        show_system_resources
        
    } > "$REPORT_FILE"
    
    log_success "报告已生成: $REPORT_FILE"
}

# 检查所有服务或指定服务
check_all_services() {
    local services_to_check=("$@")
    local total_services=${#services_to_check[@]}
    local unhealthy_services=0
    
    log_header "服务状态概览"
    
    for service in "${services_to_check[@]}"; do
        local port=$(get_service_port "$service")
        
        echo "----------------------------------------"
        echo "检查服务: $service 端口: $port"
        echo "----------------------------------------"
        
        # 端口检查
        if check_port_status "$service" "$port"; then
            # 进程检查
            check_process_status "$service"
            
            # 健康检查
            if [[ "$DETAILED" == true ]]; then
                check_service_health "$service" "$port"
            fi
        else
            ((unhealthy_services++))
        fi
        
        echo ""
    done
    
    # 总结
    local healthy_services=$((total_services - unhealthy_services))
    if [ $unhealthy_services -eq 0 ]; then
        log_success "所有 $total_services 个服务都在正常运行"
    else
        log_warning "$unhealthy_services/$total_services 个服务存在问题"
    fi
}

# 主函数
main() {
    local services_to_check=()
    local generate_report_flag=false
    local diagnose_service=""
    local health_only=false
    local fix_issues=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                DETAILED=true
                shift
                ;;
            -d|--debug)
                DEBUG=true
                shift
                ;;
            -q|--quiet)
                exec > /dev/null 2>&1
                shift
                ;;
            -r|--report)
                generate_report_flag=true
                shift
                ;;
            --fix)
                fix_issues=true
                shift
                ;;
            --diagnose)
                diagnose_service="$2"
                shift 2
                ;;
            --health-only)
                health_only=true
                shift
                ;;
            --no-color)
                RED=''
                GREEN=''
                YELLOW=''
                BLUE=''
                PURPLE=''
                CYAN=''
                WHITE=''
                GRAY=''
                NC=''
                shift
                ;;
            -*)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
            *)
                services_to_check+=("$1")
                shift
                ;;
        esac
    done
    
    # 如果没有指定服务，检查所有服务
    if [[ ${#services_to_check[@]} -eq 0 ]]; then
        services_to_check=("${SERVICES[@]}")
    fi
    
    # 诊断特定服务
    if [[ -n "$diagnose_service" ]]; then
        diagnose_service_issues "$diagnose_service"
        exit 0
    fi
    
    # 只进行健康检查
    if [[ "$health_only" == true ]]; then
        quick_health_check
        exit 0
    fi
    
    # 检查所有服务或指定服务
    check_all_services "${services_to_check[@]}"
    
    echo ""
    
    # 显示系统资源使用情况
    show_system_resources
    
    echo ""
    
    # 显示日志文件信息
    show_log_files
    
    echo ""
    
    # 快速健康检查
    if [[ ${#services_to_check[@]} -eq 0 ]]; then
        quick_health_check
    fi
    
    echo "========================================"
    echo "检查完成"
    echo "========================================"
    
    # 生成报告
    if [[ "$generate_report_flag" == true ]]; then
        generate_report
    fi
}

# 运行主函数
main "$@"