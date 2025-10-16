#!/bin/bash

# 检查所有服务的模拟代码
# 使用方法: ./check-mock-code.sh

echo "========================================="
echo "  OneRecycle Services 模拟代码检查工具"
echo "========================================="
echo ""
echo "检查时间: $(date)"
echo ""

# 颜色定义
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 统计变量
total_services=0
clean_services=0
services_with_issues=0

# 遍历所有服务目录
for service_dir in */; do
    # 跳过非服务目录
    if [ ! -d "$service_dir/src" ] || [ "$service_dir" == "node_modules/" ] || [ "$service_dir" == "logs/" ] || [ "$service_dir" == "pids/" ] || [ "$service_dir" == "shared/" ]; then
        continue
    fi
    
    service_name=$(basename "$service_dir")
    total_services=$((total_services + 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 服务: $service_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 检查setTimeout（排除测试文件）
    echo -n "  🔍 检查 setTimeout 模拟延迟... "
    timeout_files=$(grep -r "setTimeout.*resolve" "$service_dir/src" \
        --exclude-dir=node_modules \
        --exclude-dir=dist \
        --exclude="*.spec.ts" \
        --exclude="*.test.ts" \
        --include="*.ts" \
        -l 2>/dev/null)
    
    timeout_count=$(echo "$timeout_files" | grep -c "." 2>/dev/null || echo "0")
    
    if [ "$timeout_count" -gt 0 ]; then
        echo -e "${RED}发现 $timeout_count 个文件${NC}"
        echo "$timeout_files" | while read -r file; do
            if [ -n "$file" ]; then
                echo "      ⚠️  $file"
                # 显示具体行
                grep -n "setTimeout.*resolve" "$file" | head -3 | while read -r line; do
                    echo "         $line"
                done
            fi
        done
    else
        echo -e "${GREEN}✅ 通过${NC}"
    fi
    
    # 检查模拟注释
    echo -n "  🔍 检查模拟相关注释... "
    mock_files=$(grep -r "模拟\|// mock\|// fake" "$service_dir/src" \
        --exclude-dir=node_modules \
        --exclude-dir=dist \
        --exclude="*.spec.ts" \
        --exclude="*.test.ts" \
        --include="*.ts" \
        -l 2>/dev/null)
    
    mock_count=$(echo "$mock_files" | grep -c "." 2>/dev/null || echo "0")
    
    if [ "$mock_count" -gt 0 ]; then
        echo -e "${YELLOW}发现 $mock_count 个文件${NC}"
        echo "$mock_files" | while read -r file; do
            if [ -n "$file" ]; then
                echo "      ⚠️  $file"
            fi
        done
    else
        echo -e "${GREEN}✅ 通过${NC}"
    fi
    
    # 检查硬编码的测试数据
    echo -n "  🔍 检查硬编码测试数据... "
    test_data_count=$(grep -r "test_\|mock_\|fake_" "$service_dir/src" \
        --exclude-dir=node_modules \
        --exclude-dir=dist \
        --exclude="*.spec.ts" \
        --exclude="*.test.ts" \
        --include="*.ts" \
        | grep -v "// " \
        | wc -l 2>/dev/null || echo "0")
    
    if [ "$test_data_count" -gt 0 ]; then
        echo -e "${YELLOW}发现 $test_data_count 处${NC}"
    else
        echo -e "${GREEN}✅ 通过${NC}"
    fi
    
    # 统计代码行数
    total_lines=$(find "$service_dir/src" -name "*.ts" \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" \
        -not -name "*.spec.ts" \
        -not -name "*.test.ts" \
        -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
    
    echo "  📊 代码行数: $total_lines"
    
    # 判断服务状态
    if [ "$timeout_count" -eq 0 ] && [ "$mock_count" -eq 0 ] && [ "$test_data_count" -eq 0 ]; then
        echo -e "  ${GREEN}✅ 状态: 生产就绪${NC}"
        clean_services=$((clean_services + 1))
    else
        echo -e "  ${RED}⚠️  状态: 需要改造${NC}"
        services_with_issues=$((services_with_issues + 1))
    fi
    
    echo ""
done

# 输出总结
echo "========================================="
echo "  检查总结"
echo "========================================="
echo "总服务数: $total_services"
echo -e "${GREEN}生产就绪: $clean_services${NC}"
echo -e "${RED}需要改造: $services_with_issues${NC}"
echo ""

if [ "$services_with_issues" -eq 0 ]; then
    echo -e "${GREEN}🎉 所有服务都已生产就绪！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  还有 $services_with_issues 个服务需要改造${NC}"
    echo ""
    echo "建议："
    echo "1. 查看上面标记为 ⚠️ 的文件"
    echo "2. 移除所有 setTimeout 模拟延迟"
    echo "3. 替换为真实的服务调用"
    echo "4. 移除模拟相关注释"
    echo "5. 移除硬编码的测试数据"
    echo ""
    echo "参考文档: ./message-queue/PRODUCTION_CODE_REFACTORING.md"
    exit 1
fi
