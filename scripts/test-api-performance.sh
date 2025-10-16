#!/bin/bash

# API性能测试脚本
# 测试登录和发送验证码接口的响应时间

API_BASE_URL="http://localhost:3000/api/v1"
TEST_MOBILE="13800138000"

echo "=== API性能测试开始 ==="
echo "测试时间: $(date)"
echo "API地址: $API_BASE_URL"
echo "测试手机号: $TEST_MOBILE"
echo ""

# 测试发送验证码接口
echo "1. 测试发送验证码接口..."
echo "请求: POST $API_BASE_URL/auth/send-code"

start_time=$(date +%s%N)
response=$(curl -s -w "%{http_code}|%{time_total}" -X POST \
  "$API_BASE_URL/auth/send-code" \
  -H "Content-Type: application/json" \
  -d "{\"mobile\":\"$TEST_MOBILE\",\"type\":\"login\"}")

end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))

http_code=$(echo $response | cut -d'|' -f2)
time_total=$(echo $response | cut -d'|' -f3)
response_body=$(echo $response | cut -d'|' -f1)

echo "HTTP状态码: $http_code"
echo "响应时间: ${time_total}s"
echo "总耗时: ${duration}ms"
echo "响应内容: $response_body"
echo ""

# 如果发送验证码成功，提取验证码并测试登录
if [[ $http_code == "200" ]]; then
    echo "2. 从日志中获取验证码..."
    # 这里需要手动输入验证码，因为我们无法直接从日志中提取
    echo "请查看API服务日志获取验证码，然后手动测试登录接口"
    echo ""
    echo "登录测试命令示例:"
    echo "curl -s -w \"\\n响应时间: %{time_total}s\\n\" -X POST \\"
    echo "  \"$API_BASE_URL/auth/login\" \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"mobile\":\"$TEST_MOBILE\",\"verificationCode\":\"YOUR_CODE\"}'"
else
    echo "发送验证码失败，无法继续测试登录接口"
fi

echo ""
echo "=== 性能基准测试 ==="

# 多次请求测试平均响应时间
echo "3. 进行10次发送验证码请求，计算平均响应时间..."

total_time=0
success_count=0

for i in {1..10}; do
    start_time=$(date +%s%N)
    response=$(curl -s -w "%{http_code}" -X POST \
      "$API_BASE_URL/auth/send-code" \
      -H "Content-Type: application/json" \
      -d "{\"mobile\":\"$TEST_MOBILE\",\"type\":\"login\"}")
    end_time=$(date +%s%N)
    
    duration=$((($end_time - $start_time) / 1000000))
    
    if [[ $response == *"200" ]]; then
        total_time=$(($total_time + $duration))
        success_count=$(($success_count + 1))
        echo "请求 $i: ${duration}ms ✓"
    else
        echo "请求 $i: 失败 ✗"
    fi
    
    # 避免请求过于频繁
    sleep 0.5
done

if [[ $success_count -gt 0 ]]; then
    average_time=$(($total_time / $success_count))
    echo ""
    echo "=== 测试结果汇总 ==="
    echo "成功请求数: $success_count/10"
    echo "平均响应时间: ${average_time}ms"
    echo "最佳性能目标: <100ms"
    
    if [[ $average_time -lt 100 ]]; then
        echo "性能状态: 优秀 ✓"
    elif [[ $average_time -lt 200 ]]; then
        echo "性能状态: 良好 ✓"
    elif [[ $average_time -lt 500 ]]; then
        echo "性能状态: 一般 ⚠"
    else
        echo "性能状态: 需要优化 ✗"
    fi
else
    echo "所有请求都失败了，请检查API服务状态"
fi

echo ""
echo "=== 测试完成 ==="