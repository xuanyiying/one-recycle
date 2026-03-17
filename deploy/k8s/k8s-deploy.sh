#!/bin/bash
# ============================================================================
# OneRecycle K8s 部署脚本
# 使用方法: ./k8s-deploy.sh [command]
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$SCRIPT_DIR/.."
NAMESPACE="one-recycle"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_usage() {
    echo "OneRecycle K8s 部署脚本"
    echo ""
    echo "使用方法: $0 [command]"
    echo ""
    echo "命令:"
    echo "  apply         部署所有资源"
    echo "  apply:base   仅部署基础组件(数据库、Redis)"
    echo "  apply:services  仅部署微服务"
    echo "  delete       删除所有资源"
    echo "  status       查看部署状态"
    echo "  logs         查看日志"
    echo "  scale        扩缩容"
    echo "  hpa          查看HPA状态"
    echo "  restart      重启服务"
    echo ""
}

check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}错误: kubectl 未安装${NC}"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}错误: 无法连接到Kubernetes集群${NC}"
        exit 1
    fi
}

apply() {
    check_kubectl
    
    echo -e "${YELLOW}创建Namespace...${NC}"
    kubectl apply -f "$K8S_DIR/k8s/base/namespace.yaml"
    
    echo -e "${YELLOW}部署基础组件...${NC}"
    kubectl apply -f "$K8S_DIR/k8s/base/"
    
    echo -e "${YELLOW}等待数据库就绪...${NC}"
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
    
    echo -e "${YELLOW}部署微服务...${NC}"
    kubectl apply -f "$K8S_DIR/k8s/microservices/"
    
    echo -e "${YELLOW}部署Ingress...${NC}"
    kubectl apply -f "$K8S_DIR/k8s/ingress/ingress.yaml"
    
    echo -e "${YELLOW}部署HPA和PDB...${NC}"
    kubectl apply -f "$K8S_DIR/k8s/autoscaling/"
    
    echo -e "${GREEN}部署完成！${NC}"
    echo -e "${YELLOW}查看状态: kubectl get pods -n $NAMESPACE${NC}"
}

apply_base() {
    check_kubectl
    
    kubectl apply -f "$K8S_DIR/k8s/base/namespace.yaml"
    kubectl apply -f "$K8S_DIR/k8s/base/"
    
    echo -e "${YELLOW}等待数据库就绪...${NC}"
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
    
    echo -e "${GREEN}基础组件部署完成${NC}"
}

apply_services() {
    check_kubectl
    
    kubectl apply -f "$K8S_DIR/k8s/microservices/"
    kubectl apply -f "$K8S_DIR/k8s/ingress/ingress.yaml"
    kubectl apply -f "$K8S_DIR/k8s/autoscaling/"
    
    echo -e "${GREEN}微服务部署完成${NC}"
}

delete() {
    check_kubectl
    
    echo -e "${YELLOW}删除所有资源...${NC}"
    kubectl delete namespace $NAMESPACE
    
    echo -e "${GREEN}资源已删除${NC}"
}

status() {
    check_kubectl
    
    echo "========================================"
    echo "  Pod 状态"
    echo "========================================"
    kubectl get pods -n $NAMESPACE -o wide
    
    echo ""
    echo "========================================"
    echo "  Service 状态"
    echo "========================================"
    kubectl get svc -n $NAMESPACE
    
    echo ""
    echo "========================================"
    echo "  Ingress 状态"
    echo "========================================"
    kubectl get ingress -n $NAMESPACE
}

logs() {
    SERVICE=${1:-api-gateway}
    
    echo -e "${YELLOW}查看 $SERVICE 日志...${NC}"
    kubectl logs -n $NAMESPACE -l app=$SERVICE -f --tail=100
}

scale() {
    SERVICE=${1:-api-gateway}
    REPLICAS=${2:-3}
    
    echo -e "${YELLOW}扩缩容 $SERVICE 到 $REPLICAS 个副本...${NC}"
    kubectl scale deployment $SERVICE -n $NAMESPACE --replicas=$REPLICAS
}

hpa_status() {
    echo "========================================"
    echo "  HPA 状态"
    echo "========================================"
    kubectl get hpa -n $NAMESPACE
    
    echo ""
    echo "========================================"
    echo "  Pod 资源使用"
    echo "========================================"
    kubectl top pods -n $NAMESPACE 2>/dev/null || echo "指标服务器未安装"
}

restart() {
    SERVICE=${1:-api-gateway}
    
    echo -e "${YELLOW}重启 $SERVICE...${NC}"
    kubectl rollout restart deployment/$SERVICE -n $NAMESPACE
    kubectl rollout status deployment/$SERVICE -n $NAMESPACE
    
    echo -e "${GREEN}重启完成${NC}"
}

COMMAND=${1:-}
case "$COMMAND" in
    apply)
        apply
        ;;
    apply:base)
        apply_base
        ;;
    apply:services)
        apply_services
        ;;
    delete)
        delete
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    scale)
        scale "$2" "$3"
        ;;
    hpa)
        hpa_status
        ;;
    restart)
        restart "$2"
        ;;
    *)
        show_usage
        ;;
esac
