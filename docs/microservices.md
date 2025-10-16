# 微服务架构设计方案

## 1. 业务边界与服务拆分

根据“旧物回收”业务的核心领域，服务端拆分为以下几个独立的微服务：

- **`account-service` (用户服务)**
  - **职责**: 负责用户注册、登录、个人信息管理、多平台账号（微信、支付宝等）的绑定与统一。
  - **数据**: 用户主表、多平台身份映射表、用户地址簿。
- **`order-service` (订单服务)**
  - **职责**: 负责回收订单的创建、状态流转（待接单、待取件、已完成、已取消）、价格预估、物品明细管理。
  - **数据**: 订单主表、订单物品明细表、订单状态变更日志。
- **`payment-service` (支付服务)**
  - **职责**: 对接微信支付和支付宝支付，处理支付单的创建、支付回调、退款申请与状态查询。
  - **数据**: 支付记录表、退款记录表。
- **`courier-service` (骑手/物流服务)**
  - **职责**: 负责快递员的管理、认证、派单逻辑（自动或手动）、取件任务的分配与追踪。
  - **数据**: 快递员信息表、派单记录表、服务区域表。
- **`notification-service` (通知服务)**
  - **职责**: 统一处理系统内的所有通知发送，如短信（登录验证码）、App Push、微信模板消息等。它是一个无状态的通用服务。
  - **数据**: 通知发送日志表。
- **`api-gateway` (API网关)**
  - **职责**: 作为所有客户端（小程序、管理后台）的统一入口，负责请求路由、身份认证、速率限制、日志记录和协议转换。

## 2. 服务间通信协议

- **内部通信 (Inter-Service)**: **gRPC**
  - **优势**: 高性能（基于HTTP/2）、通过 Protocol Buffers (`.proto` 文件) 定义强类型接口、高效的二进制序列化、原生支持流式通信。非常适合内部服务间的高频调用。
- **外部通信 (Client -> API Gateway)**: **RESTful API**
  - **优势**: 技术成熟，生态完善，对前端和移动端友好，易于理解和调试。

## 3. 数据库拆分方案

采用 **每个服务一个数据库 (Database per Service)** 的模式，确保服务之间数据隔离，实现真正的松耦合。

- `account-service` -> `account_db` (PostgreSQL)
- `order-service` -> `order_db` (PostgreSQL)
- `payment-service` -> `payment_db` (PostgreSQL)
- `courier-service` -> `courier_db` (PostgreSQL)

## 4. 数据一致性

跨服务的事务采用**最终一致性**方案，通过**事件编排 (Saga 模式)** 实现。

- **实现方式**: 当一个服务完成其本地事务后，会发布一个事件到消息队列（如 RabbitMQ 或 Kafka）。其他相关服务订阅这些事件，并执行各自的本地事务。如果某个步骤失败，则发布一个补偿事件，触发相关服务执行回滚操作。

## 5. 服务发现、负载均衡与容错

- **服务发现**: **Consul** 或 **Kubernetes (K8s)** 的原生服务发现机制。
- **负载均衡**: K8s 内置的 `Service` 资源或 Ingress Controller。
- **容错机制**: **断路器模式 (Circuit Breaker)**。

## 6. 微服务部署架构图 (基于 Kubernetes)

```mermaid
graph TD
    subgraph "客户端"
        Client_Mini[小程序]
        Client_Admin[管理后台]
    end

    subgraph "网络入口"
        LB[云负载均衡器] --> Ingress[K8s Ingress <br> (Nginx/Traefik)]
    end

    subgraph "Kubernetes 集群"
        Ingress --> Gateway[API Gateway]

        subgraph "服务层"
            Gateway -- gRPC --> AccountSvc[account-service]
            Gateway -- gRPC --> OrderSvc[order-service]
            Gateway -- gRPC --> CourierSvc[courier-service]

            OrderSvc -- gRPC --> AccountSvc
            OrderSvc -- gRPC --> PaymentSvc[payment-service]
            CourierSvc -- gRPC --> OrderSvc
        end

        subgraph "数据与消息"
            AccountSvc --> DB_A[(account_db)]
            OrderSvc --> DB_O[(order_db)]
            PaymentSvc --> DB_P[(payment_db)]
            CourierSvc --> DB_C[(courier_db)]

            AccountSvc -- Pub --> MQ[消息队列 <br> (RabbitMQ/Kafka)]
            OrderSvc -- Pub --> MQ
            PaymentSvc -- Pub --> MQ

            MQ -- Sub --> OrderSvc
            MQ -- Sub --> NotificationSvc[notification-service]
        end
    end

    Client_Mini & Client_Admin --> LB
```

## 7. 技术选型建议

- **服务框架**: **Node.js + NestJS**
- **服务间通信**: **gRPC**
- **数据库**: **PostgreSQL**
- **消息队列**: **RabbitMQ**
- **部署**: **Docker + Kubernetes (K8s)**
- **API 网关**: **Traefik** 或 **Kong**
- **服务治理**: **OpenTelemetry** (分布式追踪) + **Prometheus** (监控) + **Jaeger** (追踪可视化)