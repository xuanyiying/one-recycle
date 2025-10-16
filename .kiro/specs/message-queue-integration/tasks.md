# 消息中间件集成实施任务列表

## 任务概述

本任务列表将消息中间件集成分解为可执行的开发任务，按照依赖关系组织，确保循序渐进地完成整个系统改造。

---

## 阶段1: 基础设施搭建

- [x] 1. 配置Redis服务和消息队列基础设施
  - 更新docker-compose.yml添加Redis服务配置，启用AOF持久化
  - 配置Redis连接参数和环境变量
  - 验证Redis服务可正常启动和连接
  - _Requirements: 7.1, 7.2_

- [x] 2. 创建消息队列服务项目结构
  - 创建services/message-queue目录和基础文件结构
  - 配置package.json，添加@nestjs/bull、bull、ioredis等依赖
  - 创建tsconfig.json和基础配置文件
  - 创建Dockerfile用于容器化部署
  - _Requirements: 2.1, 2.2_

- [x] 3. 实现消息队列服务核心模块
  - 创建AppModule并配置BullModule.forRoot连接Redis
  - 实现配置模块读取环境变量（Redis连接、队列配置）
  - 创建HealthModule实现健康检查端点
  - 实现main.ts启动文件，配置端口3010
  - _Requirements: 2.2, 2.3_

- [x] 4. 定义队列和事件类型
  - 创建queue.module.ts注册所有队列（order、notification、payment、dispatch）
  - 定义事件DTO类（OrderCreatedEvent、OrderStatusChangedEvent等）
  - 定义通知事件DTO（SmsNotificationEvent、PushNotificationEvent）
  - 定义支付事件DTO（PaymentCallbackEvent）
  - 使用class-validator添加数据验证
  - _Requirements: 2.3, 2.4_

---

## 阶段2: 队列服务实现

- [x] 5. 实现订单队列服务（生产者）
  - 创建OrderQueueService实现订单事件发布
  - 实现handleOrderCreated方法，配置优先级10、重试3次、指数退避
  - 实现handleOrderStatusChanged方法处理状态变更
  - 实现handleOrderCancelled方法处理订单取消
  - 添加派单延迟任务（延迟5分钟）
  - 实现getQueueStats方法获取队列统计信息
  - _Requirements: 2.4, 3.2, 3.3_

- [x] 6. 实现通知队列服务（生产者）
  - 创建NotificationQueueService实现通知事件发布
  - 实现sendSms方法，配置速率限制（100条/分钟）
  - 实现sendPush方法发送推送通知
  - 实现sendEmail方法发送邮件通知
  - 实现sendBatchNotifications方法支持批量通知
  - 支持优先级队列（高、中、低优先级）
  - _Requirements: 2.4, 4.1, 4.6_

- [x] 7. 实现支付队列服务（生产者）
  - 创建PaymentQueueService实现支付事件发布
  - 实现handlePaymentCallback方法，配置优先级10、重试5次
  - 实现handlePaymentSuccess方法处理支付成功
  - 实现handlePaymentFailed方法处理支付失败
  - 实现handleRefund方法处理退款
  - _Requirements: 2.4, 5.2, 5.3_

- [x] 8. 实现派单队列服务（生产者）
  - 创建DispatchQueueService实现派单事件发布
  - 实现autoDispatch方法自动派单
  - 实现manualDispatch方法手动派单
  - 实现reassignCourier方法重新分配快递员
  - 配置默认延迟5分钟执行
  - _Requirements: 2.4, 3.5_

---

## 阶段3: 消息处理器实现

- [x] 9. 实现订单消息处理器（消费者）
  - 创建OrderProcessor使用@Processor装饰器
  - 实现processOrderCreated处理器，触发库存检查、价格计算
  - 实现processOrderStatusChanged处理器，发送状态变更通知
  - 实现processOrderCancelled处理器，触发退款和通知
  - 实现processDispatchOrder处理器，调用派单服务
  - 配置并发数为5
  - _Requirements: 2.5, 3.3, 3.4, 3.5_

- [x] 10. 实现通知消息处理器（消费者）
  - 创建NotificationProcessor使用@Processor装饰器
  - 实现processSms处理器，调用短信服务API
  - 实现processPush处理器，调用推送服务API
  - 实现processEmail处理器，调用邮件服务API
  - 实现processBatchNotifications处理器，批量处理通知（每批100条）
  - 实现失败重试逻辑（最多3次）
  - _Requirements: 2.5, 4.2, 4.3, 4.5_

- [x] 11. 实现支付消息处理器（消费者）
  - 创建PaymentProcessor使用@Processor装饰器
  - 实现processPaymentCallback处理器，验证签名和幂等性
  - 实现processPaymentSuccess处理器，更新订单状态并发布事件
  - 实现processPaymentFailed处理器，更新订单状态并通知用户
  - 实现processRefund处理器，调用退款API
  - 记录所有支付操作日志
  - _Requirements: 2.5, 5.3, 5.4, 5.5, 5.6_

---

## 阶段4: 错误处理和幂等性

- [x] 12. 实现任务状态追踪
  - 创建Prisma schema定义job_status表
  - 创建Prisma schema定义dead_letter_queue表
  - 运行prisma migrate创建数据库表
  - 创建JobStatusRepository实现任务状态CRUD操作
  - 创建DeadLetterQueueRepository实现DLQ操作
  - _Requirements: 2.6, 8.2_

- [x] 13. 实现幂等性处理机制
  - 创建IdempotencyService实现幂等性检查
  - 实现processWithIdempotency包装器函数
  - 在所有处理器中集成幂等性检查
  - 使用jobId作为唯一标识符
  - 记录任务执行状态（pending、processing、completed、failed）
  - _Requirements: 8.2_

- [ ] 14. 实现死信队列处理
  - 实现任务失败自动移入DLQ逻辑
  - 创建DLQService管理死信队列
  - 实现DLQ告警通知功能
  - 实现手动重试DLQ任务的API
  - 实现定期清理已解决任务（30天）
  - _Requirements: 2.7_

- [ ] 15. 实现错误处理和重试策略
  - 配置指数退避重试策略（2s、4s、8s）
  - 配置固定延迟重试策略（5s）
  - 实现全局错误处理器捕获未处理异常
  - 记录详细错误日志和堆栈信息
  - 实现任务超时处理机制
  - _Requirements: 2.6_

---

## 阶段5: 监控和管理

- [ ] 16. 集成Bull Board监控界面
  - 安装@bull-board/api和@bull-board/express依赖
  - 创建BullBoardModule配置所有队列
  - 配置访问路径为/admin/queues
  - 实现基础认证保护管理界面
  - 测试UI功能（查看队列、重试任务、清理任务）
  - _Requirements: 6.1, 6.2, 6.6_

- [ ] 17. 实现队列管理API
  - 创建QueueController提供REST API
  - 实现GET /queues获取所有队列状态
  - 实现GET /queues/:name/stats获取队列统计
  - 实现POST /queues/:name/jobs/:id/retry手动重试任务
  - 实现DELETE /queues/:name/clean清理已完成任务
  - 实现POST /queues/:name/pause暂停队列
  - 实现POST /queues/:name/resume恢复队列
  - _Requirements: 6.3, 6.5_

- [ ] 18. 实现监控指标收集
  - 创建MetricsService收集队列指标
  - 实现实时统计（waiting、active、completed、failed、delayed）
  - 实现性能指标（处理延迟P50、P95、P99）
  - 实现失败率计算
  - 创建GET /metrics端点暴露Prometheus格式指标
  - _Requirements: 6.1_

- [ ] 19. 实现告警规则
  - 创建AlertService实现告警逻辑
  - 实现队列积压告警（waiting > 1000）
  - 实现失败率告警（失败率 > 5%）
  - 实现处理延迟告警（P95 > 10秒）
  - 实现DLQ告警（有新任务）
  - 集成通知服务发送告警消息
  - _Requirements: 6.4_

---

## 阶段6: 业务服务集成

- [ ] 20. 改造订单服务集成消息队列
  - 在order-service中安装消息队列客户端依赖
  - 创建QueueClientModule连接消息队列服务
  - 修改订单创建逻辑，发布order-created事件到队列
  - 修改订单状态更新逻辑，发布order-status-changed事件
  - 修改订单取消逻辑，发布order-cancelled事件
  - 保留同步调用作为降级方案（通过配置开关控制）
  - _Requirements: 3.1, 3.2, 3.6_

- [ ] 21. 改造通知服务集成消息队列
  - 在notification-service中安装消息队列客户端依赖
  - 创建NotificationConsumer订阅通知队列
  - 实现短信发送逻辑（调用第三方短信API）
  - 实现推送通知逻辑（调用推送服务API）
  - 实现邮件发送逻辑（使用nodemailer）
  - 实现批量通知处理优化
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 22. 改造支付服务集成消息队列
  - 在payment-service中安装消息队列客户端依赖
  - 修改支付回调接口，立即返回200并发布事件到队列
  - 创建PaymentConsumer订阅支付队列
  - 实现支付回调验签逻辑
  - 实现支付成功处理逻辑（更新订单、发送通知）
  - 实现支付失败处理逻辑
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 23. 改造派单服务集成消息队列
  - 在dispatch-service中安装消息队列客户端依赖
  - 创建DispatchConsumer订阅派单队列
  - 实现自动派单算法（基于地理位置和快递员状态）
  - 实现手动派单逻辑
  - 实现重新分配快递员逻辑
  - 发布派单结果事件
  - _Requirements: 3.5_

---

## 阶段7: 测试和文档

- [ ] 24. 编写单元测试
  - 为OrderQueueService编写单元测试
  - 为NotificationQueueService编写单元测试
  - 为PaymentQueueService编写单元测试
  - 为所有Processor编写单元测试
  - 为IdempotencyService编写单元测试
  - 使用Jest mock模拟Redis和外部服务
  - 目标代码覆盖率 > 80%
  - _Requirements: 测试策略_

- [ ] 25. 编写集成测试
  - 编写订单创建端到端流程测试
  - 编写支付回调处理流程测试
  - 编写通知发送流程测试
  - 编写派单流程测试
  - 测试重试机制和死信队列
  - 测试幂等性保证
  - _Requirements: 测试策略_

- [ ] 26. 性能测试和优化
  - 使用k6或Artillery进行负载测试
  - 测试消息处理吞吐量（目标：1000条/秒）
  - 测试消息处理延迟（目标：P95 < 100ms）
  - 测试队列积压处理能力（10000条消息）
  - 根据测试结果优化并发配置和批处理大小
  - _Requirements: 非功能性需求_

- [ ] 27. 编写技术文档
  - 编写消息队列服务README.md
  - 编写API文档（使用Swagger）
  - 编写运维手册（部署、监控、故障排查）
  - 编写开发指南（如何添加新队列、如何发布事件）
  - 更新项目整体架构文档
  - _Requirements: 文档要求_

---

## 阶段8: 部署和上线

- [ ] 28. 准备生产环境配置
  - 创建生产环境.env配置文件
  - 配置生产Redis连接（使用云服务如AWS ElastiCache）
  - 配置监控告警（集成Prometheus、Grafana）
  - 配置日志收集（集成ELK或云日志服务）
  - 配置备份策略（Redis AOF + RDB）
  - _Requirements: 7.6_

- [ ] 29. 实施灰度发布
  - 在测试环境完整验证所有功能
  - 部署消息队列服务到生产环境
  - 配置10%流量使用消息队列（通过feature flag）
  - 监控关键指标（错误率、延迟、吞吐量）
  - 逐步提升流量比例（10% -> 50% -> 100%）
  - _Requirements: 迁移计划_

- [ ] 30. 完成全量切换和验证
  - 将所有流量切换到消息队列模式
  - 验证所有业务流程正常运行
  - 验证监控告警正常工作
  - 进行故障演练（模拟Redis故障、服务重启等）
  - 准备回滚方案和应急预案
  - 完成上线总结文档
  - _Requirements: 迁移计划_

---

## 任务依赖关系

```
1 -> 2 -> 3 -> 4
         |
         v
    5, 6, 7, 8 -> 9, 10, 11 -> 12 -> 13, 14, 15
                                |
                                v
                           16, 17, 18, 19
                                |
                                v
                           20, 21, 22, 23
                                |
                                v
                           24, 25, 26, 27
                                |
                                v
                           28 -> 29 -> 30
```

## 预估工作量

- **阶段1**: 2天
- **阶段2**: 3天
- **阶段3**: 3天
- **阶段4**: 3天
- **阶段5**: 3天
- **阶段6**: 4天
- **阶段7**: 4天
- **阶段8**: 3天

**总计**: 约25个工作日（5周）

## 风险和缓解措施

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Redis单点故障 | 高 | 使用Redis Sentinel或Cluster |
| 消息丢失 | 高 | 启用AOF持久化，实现消息确认机制 |
| 队列积压 | 中 | 实现告警，支持动态扩展处理器 |
| 数据不一致 | 高 | 实现幂等性，使用Outbox模式 |
| 性能不达标 | 中 | 提前性能测试，优化并发配置 |