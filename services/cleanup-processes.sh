#!/bin/bash

# 清理系统进程脚本
echo "🧹 开始清理系统进程..."

# 检查当前Node.js进程数量
node_count=$(pgrep -f node | wc -l)
echo "当前Node.js进程数量: $node_count"

# 如果进程数量过多，提示用户
if [ "$node_count" -gt 20 ]; then
    echo "⚠️  检测到过多Node.js进程 ($node_count 个)"
    echo "这可能导致系统资源不足"
    
    # 显示一些进程信息
    echo "前5个Node.js进程:"
    ps aux | grep node | grep -v grep | head -5 | awk '{print $2, $11}' || true
    
    echo ""
    echo "建议手动检查并清理不必要的进程"
    echo "可以使用: kill -9 <PID> 来终止特定进程"
fi

# 检查系统内存使用情况
echo ""
echo "📊 系统资源使用情况:"
top -l 1 | head -10 | grep -E "(CPU|PhysMem)" || true

echo ""
echo "✅ 清理检查完成"