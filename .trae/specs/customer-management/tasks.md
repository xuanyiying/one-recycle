# Tasks

## Phase 1: Server 开发

- [x] Task 1: 创建 C 端用户管理 Module
  - [x] SubTask 1.1: 创建 customer-user.module.ts
  - [x] SubTask 1.2: 创建 customer-user.controller.ts
  - [x] SubTask 1.3: 创建 customer-user.service.ts

- [x] Task 2: 实现用户列表查询接口
  - [x] SubTask 2.1: 创建 CustomerUserListDto（分页、筛选参数）
  - [x] SubTask 2.2: 实现用户列表查询（支持手机号、昵称筛选，分页）
  - [x] SubTask 2.3: 添加用户统计信息（订单数、积分）

- [x] Task 3: 实现用户详情接口
  - [x] SubTask 3.1: 创建 CustomerUserDetailDto
  - [x] SubTask 3.2: 实现用户详情查询（基本信息、积分、订单统计、邀请关系）

- [x] Task 4: 实现积分记录查询接口
  - [x] SubTask 4.1: 创建 PointsRecordListDto
  - [x] SubTask 4.2: 实现用户积分记录查询

- [x] Task 5: 实现订单记录查询接口
  - [x] SubTask 5.1: 创建 CustomerOrderListDto
  - [x] SubTask 5.2: 实现用户订单记录查询

## Phase 2: Admin Web 开发

- [x] Task 6: 创建用户管理页面路由和布局
  - [x] SubTask 6.1: 创建客户管理页面目录结构
  - [x] SubTask 6.2: 创建用户列表页 (page.tsx)
  - [x] SubTask 6.3: 创建用户详情页 (detail/page.tsx)

- [x] Task 7: 实现用户列表组件
  - [x] SubTask 7.1: 创建用户列表 Table
  - [x] SubTask 7.2: 实现筛选表单（手机号、昵称、注册时间）
  - [x] SubTask 7.3: 实现分页组件

- [x] Task 8: 实现用户详情组件
  - [x] SubTask 8.1: 创建用户信息卡片
  - [x] SubTask 8.2: 创建积分信息卡片
  - [x] SubTask 8.3: 创建订单记录列表
  - [x] SubTask 8.4: 创建积分记录列表

- [x] Task 9: 创建 API 服务
  - [x] SubTask 9.1: 创建 customer-user.ts API 服务
  - [x] SubTask 9.2: 添加类型定义

## Task Dependencies
- Task 2-5 依赖于 Task 1
- Task 6-9 依赖于 Task 5 的 API 定义完成
- Task 7 依赖于 Task 6
- Task 8 依赖于 Task 6
