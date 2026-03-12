# 积分商城开发任务清单

## 任务分解

### 阶段一：服务端补充开发 (1-2 天)

#### 任务 1.1：管理端统计接口
- [ ] 创建 `GET /admin/points/stats` 接口
- [ ] 实现统计逻辑（商品总数、订单总数、待发货订单等）
- [ ] 实现热门商品查询（TOP 5）
- [ ] 添加单元测试
- [ ] 接口文档更新

**文件位置**: `/server/src/modules/points/points-admin.controller.ts`
**依赖服务**: PointsProductService, PointsOrderService

#### 任务 1.2：分类管理接口（可选）
- [ ] 创建 `GET /admin/points/categories` 接口
- [ ] 创建 `POST /admin/points/categories` 接口
- [ ] 创建 `POST /admin/points/categories/:id` 接口
- [ ] 创建 `POST /admin/points/categories/:id/delete` 接口
- [ ] 添加 DTO 验证
- [ ] 添加单元测试

**文件位置**: `/server/src/modules/points/points-admin.controller.ts`
**新增文件**: `/server/src/modules/points/dto/create-category.dto.ts`

#### 任务 1.3：缓存层实现
- [ ] 实现商品列表缓存
- [ ] 实现商品详情缓存
- [ ] 实现用户积分缓存
- [ ] 实现签到状态缓存
- [ ] 缓存失效策略
- [ ] 添加缓存监控

**文件位置**: `/server/src/modules/points/services/`
**依赖**: Redis 服务

---

### 阶段二：管理端开发 (5-7 天)

#### 任务 2.1：管理端 - 积分概览页 (1 天)
**页面路径**: `/apps/admin-web/src/app/(dashboard)/points/overview/page.tsx`

**功能清单**:
- [ ] 创建页面布局
- [ ] 统计卡片组件（总商品数、总订单数、待发货、今日订单）
- [ ] 最近订单列表（表格展示，最新 10 条）
- [ ] 热门商品 TOP 5 展示
- [ ] 积分发放趋势图表（近 7 天）
- [ ] 页面加载状态
- [ ] 错误处理

**API 对接**:
- `GET /admin/points/stats`
- `GET /admin/points/orders?limit=10`

**UI 组件**:
- Statistic 组件（已有）
- Table 组件（已有）
- Card 组件（已有）
- Chart 组件（需引入 Recharts）

#### 任务 2.2：管理端 - 商品管理页 (2 天)
**页面路径**: `/apps/admin-web/src/app/(dashboard)/points/products/page.tsx`

**功能清单**:
- [ ] 商品列表表格
- [ ] 搜索功能（按名称）
- [ ] 筛选功能（分类、状态）
- [ ] 分页功能
- [ ] 新增商品按钮
- [ ] 编辑商品功能
- [ ] 上下架切换
- [ ] 删除商品确认
- [ ] 商品图片预览
- [ ] 库存显示

**商品表单弹窗**:
- [ ] 商品名称输入
- [ ] 商品描述输入
- [ ] 封面图上传
- [ ] 商品图片上传（多图）
- [ ] 商品类型选择（实物/虚拟）
- [ ] 兑换积分设置
- [ ] 库存数量设置
- [ ] 分类选择
- [ ] 上架状态开关
- [ ] 表单验证

**API 对接**:
- `GET /admin/points/products`
- `POST /admin/points/products`
- `POST /admin/points/products/:id`
- `POST /admin/points/products/:id/delete`

**文件清单**:
- [ ] `/apps/admin-web/src/app/(dashboard)/points/products/page.tsx`
- [ ] `/apps/admin-web/src/app/(dashboard)/points/products/components/ProductModal.tsx`
- [ ] `/apps/admin-web/src/app/(dashboard)/points/products/components/ProductFilters.tsx`
- [ ] `/apps/admin-web/src/services/pointsProductService.ts`

#### 任务 2.3：管理端 - 订单管理页 (2 天)
**页面路径**: `/apps/admin-web/src/app/(dashboard)/points/orders/page.tsx`

**功能清单**:
- [ ] 订单列表表格
- [ ] 订单状态筛选（全部、待处理、已发货、已完成、已取消）
- [ ] 用户搜索（手机号/订单号）
- [ ] 分页功能
- [ ] 订单详情查看
- [ ] 发货操作弹窗
- [ ] 订单导出功能（CSV）

**订单详情弹窗**:
- [ ] 订单基本信息（订单号、创建时间）
- [ ] 商品信息（名称、图片、积分、数量）
- [ ] 用户信息（昵称、手机号）
- [ ] 收货地址展示
- [ ] 物流信息展示
- [ ] 订单状态时间线

**发货弹窗**:
- [ ] 物流公司名称输入
- [ ] 物流单号输入
- [ ] 发货确认

**API 对接**:
- `GET /admin/points/orders`
- `GET /admin/points/orders/:id`
- `POST /admin/points/orders/:id/ship`

**文件清单**:
- [ ] `/apps/admin-web/src/app/(dashboard)/points/orders/page.tsx`
- [ ] `/apps/admin-web/src/app/(dashboard)/points/orders/components/OrderDetailModal.tsx`
- [ ] `/apps/admin-web/src/app/(dashboard)/points/orders/components/ShipOrderModal.tsx`
- [ ] `/apps/admin-web/src/app/(dashboard)/points/orders/components/OrderFilters.tsx`
- [ ] `/apps/admin-web/src/services/pointsOrderService.ts`

#### 任务 2.4：管理端 - 任务管理页 (1 天)
**页面路径**: `/apps/admin-web/src/app/(dashboard)/points/tasks/page.tsx`

**功能清单**:
- [ ] 任务列表展示
- [ ] 新增任务按钮
- [ ] 编辑任务功能
- [ ] 任务上下架
- [ ] 任务排序调整
- [ ] 任务类型展示

**任务表单弹窗**:
- [ ] 任务名称输入
- [ ] 任务描述输入
- [ ] 任务类型选择（签到、订单、分享等）
- [ ] 奖励积分设置
- [ ] 任务图标上传
- [ ] 任务配置（JSON 编辑器）
- [ ] 启用状态开关

**API 对接**:
- `GET /admin/points/tasks`
- `POST /admin/points/tasks`
- `POST /admin/points/tasks/:id`

**文件清单**:
- [ ] `/apps/admin-web/src/app/(dashboard)/points/tasks/page.tsx`
- [ ] `/apps/admin-web/src/app/(dashboard)/points/tasks/components/TaskModal.tsx`
- [ ] `/apps/admin-web/src/services/pointsTaskService.ts`

#### 任务 2.5：管理端 - 分类管理页 (0.5 天，可选)
**页面路径**: `/apps/admin-web/src/app/(dashboard)/points/categories/page.tsx`

**功能清单**:
- [ ] 分类列表展示
- [ ] 新增分类
- [ ] 编辑分类
- [ ] 分类排序
- [ ] 分类启用/禁用

**API 对接**:
- `GET /admin/points/categories`
- `POST /admin/points/categories`
- `POST /admin/points/categories/:id`
- `POST /admin/points/categories/:id/delete`

**文件清单**:
- [ ] `/apps/admin-web/src/app/(dashboard)/points/categories/page.tsx`
- [ ] `/apps/admin-web/src/app/(dashboard)/points/categories/components/CategoryModal.tsx`
- [ ] `/apps/admin-web/src/services/pointsCategoryService.ts`

#### 任务 2.6：管理端 - 路由和导航配置 (0.5 天)
**文件路径**: `/apps/admin-web/src/app/(dashboard)/layout.tsx`

**功能清单**:
- [ ] 添加积分商城主菜单项
- [ ] 添加子菜单（概览、商品、订单、任务）
- [ ] 配置页面路由
- [ ] 权限验证

---

### 阶段三：小程序端开发 (7-10 天)

#### 任务 3.1：小程序 - 商城首页 (2 天)
**页面路径**: `/apps/mini-client/src/pages/mall/index`

**功能清单**:
- [ ] 页面基础布局
- [ ] 用户积分卡片展示（当前积分、累计获得、累计消费）
- [ ] 签到入口（显示今日是否已签到）
- [ ] 轮播图组件（广告位）
- [ ] 商品分类导航（横向滚动）
- [ ] 推荐商品列表（网格布局）
- [ ] 热门商品列表
- [ ] 下拉刷新
- [ ] 上拉加载更多
- [ ] 点击跳转商品详情

**组件开发**:
- [ ] `/apps/mini-client/src/components/PointsCard/index.tsx` - 积分卡片
- [ ] `/apps/mini-client/src/components/ProductList/index.tsx` - 商品列表
- [ ] `/apps/mini-client/src/components/CategoryNav/index.tsx` - 分类导航

**API 对接**:
- `GET /points/overview`
- `GET /points/sign-in/status`
- `GET /points/products?limit=10`
- `GET /points/products/categories`

**文件清单**:
- [ ] `/apps/mini-client/src/pages/mall/index.tsx`
- [ ] `/apps/mini-client/src/pages/mall/index.scss`
- [ ] `/apps/mini-client/src/pages/mall/index.config.ts`

#### 任务 3.2：小程序 - 商品详情页 (1 天)
**页面路径**: `/apps/mini-client/src/pages/mall/detail`

**功能清单**:
- [ ] 商品图片轮播
- [ ] 商品基本信息（名称、描述）
- [ ] 兑换积分显示
- [ ] 库存数量显示
- [ ] 已兑换数量显示
- [ ] 兑换按钮（积分不足时禁用）
- [ ] 商品详情富文本展示
- [ ] 图片预览功能

**组件开发**:
- [ ] `/apps/mini-client/src/components/ProductDetail/index.tsx` - 商品详情展示

**API 对接**:
- `GET /points/products/:id`

**文件清单**:
- [ ] `/apps/mini-client/src/pages/mall/detail/index.tsx`
- [ ] `/apps/mini-client/src/pages/mall/detail/index.scss`
- [ ] `/apps/mini-client/src/pages/mall/detail/index.config.ts`

#### 任务 3.3：小程序 - 确认订单页 (1 天)
**页面路径**: `/apps/mini-client/src/pages/mall/confirm-order`

**功能清单**:
- [ ] 商品信息展示卡片
- [ ] 收货地址选择（实物商品）
- [ ] 备注输入框
- [ ] 兑换积分显示
- [ ] 提交订单按钮
- [ ] 订单提交成功跳转

**组件开发**:
- [ ] `/apps/mini-client/src/components/OrderConfirm/index.tsx` - 订单确认卡片

**API 对接**:
- `GET /address` - 获取地址列表
- `POST /points/orders` - 创建订单

**文件清单**:
- [ ] `/apps/mini-client/src/pages/mall/confirm-order/index.tsx`
- [ ] `/apps/mini-client/src/pages/mall/confirm-order/index.scss`
- [ ] `/apps/mini-client/src/pages/mall/confirm-order/index.config.ts`

#### 任务 3.4：小程序 - 我的订单页 (1.5 天)
**页面路径**: `/apps/mini-client/src/pages/mall/orders`

**功能清单**:
- [ ] 订单状态 Tab 切换（全部、待处理、已发货、已完成）
- [ ] 订单列表展示
- [ ] 订单卡片组件
- [ ] 取消订单功能
- [ ] 确认收货功能
- [ ] 查看订单详情
- [ ] 下拉刷新
- [ ] 上拉加载更多

**组件开发**:
- [ ] `/apps/mini-client/src/components/PointsOrderCard/index.tsx` - 订单卡片

**API 对接**:
- `GET /points/orders`
- `POST /points/orders/:id/cancel`
- `POST /points/orders/:id/confirm`

**文件清单**:
- [ ] `/apps/mini-client/src/pages/mall/orders/index.tsx`
- [ ] `/apps/mini-client/src/pages/mall/orders/index.scss`
- [ ] `/apps/mini-client/src/pages/mall/orders/index.config.ts`

#### 任务 3.5：小程序 - 订单详情页 (0.5 天)
**页面路径**: `/apps/mini-client/src/pages/mall/order-detail`

**功能清单**:
- [ ] 订单状态展示
- [ ] 商品信息展示
- [ ] 收货地址展示
- [ ] 物流信息展示（已发货订单）
- [ ] 订单编号和创建时间
- [ ] 操作按钮（取消/确认收货）
- [ ] 联系卖家按钮

**API 对接**:
- `GET /points/orders/:id`

**文件清单**:
- [ ] `/apps/mini-client/src/pages/mall/order-detail/index.tsx`
- [ ] `/apps/mini-client/src/pages/mall/order-detail/index.scss`
- [ ] `/apps/mini-client/src/pages/mall/order-detail/index.config.ts`

#### 任务 3.6：小程序 - 签到页 (1 天)
**页面路径**: `/apps/mini-client/src/pages/mall/signin`

**功能清单**:
- [ ] 日历组件展示
- [ ] 今日签到按钮
- [ ] 连续签到天数显示
- [ ] 已签到日期标记
- [ ] 签到规则说明
- [ ] 签到成功动画效果
- [ ] 签到记录列表

**组件开发**:
- [ ] `/apps/mini-client/src/components/SignInCalendar/index.tsx` - 签到日历

**API 对接**:
- `GET /points/sign-in/status`
- `POST /points/sign-in`
- `GET /points/sign-in/records`

**文件清单**:
- [ ] `/apps/mini-client/src/pages/mall/signin/index.tsx`
- [ ] `/apps/mini-client/src/pages/mall/signin/index.scss`
- [ ] `/apps/mini-client/src/pages/mall/signin/index.config.ts`

#### 任务 3.7：小程序 - 任务中心 (1 天)
**页面路径**: `/apps/mini-client/src/pages/mall/tasks`

**功能清单**:
- [ ] 任务列表展示
- [ ] 任务状态标记（未完成、已完成、已领取）
- [ ] 任务进度显示
- [ ] 完成任务操作
- [ ] 领取奖励按钮
- [ ] 任务类型图标

**组件开发**:
- [ ] `/apps/mini-client/src/components/TaskCard/index.tsx` - 任务卡片

**API 对接**:
- `GET /points/tasks`
- `POST /points/tasks/:id/complete`

**文件清单**:
- [ ] `/apps/mini-client/src/pages/mall/tasks/index.tsx`
- [ ] `/apps/mini-client/src/pages/mall/tasks/index.scss`
- [ ] `/apps/mini-client/src/pages/mall/tasks/index.config.ts`

#### 任务 3.8：小程序 - 积分记录页 (0.5 天)
**页面路径**: `/apps/mini-client/src/pages/mall/points-records`

**功能清单**:
- [ ] 积分记录列表
- [ ] 筛选功能（全部、收入、支出）
- [ ] 积分统计卡片
- [ ] 下拉刷新
- [ ] 上拉加载更多

**API 对接**:
- `GET /points/records`
- `GET /points/records/stats`

**文件清单**:
- [ ] `/apps/mini-client/src/pages/mall/points-records/index.tsx`
- [ ] `/apps/mini-client/src/pages/mall/points-records/index.scss`
- [ ] `/apps/mini-client/src/pages/mall/points-records/index.config.ts`

#### 任务 3.9：小程序 - 邀请好友页 (1 天，可选)
**页面路径**: `/apps/mini-client/src/pages/mall/invite`

**功能清单**:
- [ ] 我的邀请码展示
- [ ] 邀请海报生成
- [ ] 邀请记录列表
- [ ] 邀请奖励说明
- [ ] 分享小程序卡片
- [ ] 邀请统计信息

**组件开发**:
- [ ] `/apps/mini-client/src/components/InvitePoster/index.tsx` - 邀请海报

**API 对接**:
- `GET /points/invite/stats`
- `GET /points/invite/list`

**文件清单**:
- [ ] `/apps/mini-client/src/pages/mall/invite/index.tsx`
- [ ] `/apps/mini-client/src/pages/mall/invite/index.scss`
- [ ] `/apps/mini-client/src/pages/mall/invite/index.config.ts`

#### 任务 3.10：小程序 - 服务层开发 (1 天)
**文件路径**: `/apps/mini-client/src/services/points.ts`

**功能清单**:
- [ ] 积分概览 API 封装
- [ ] 商品 API 封装
- [ ] 订单 API 封装
- [ ] 签到 API 封装
- [ ] 任务 API 封装
- [ ] 积分记录 API 封装
- [ ] 邀请 API 封装
- [ ] 错误处理
- [ ] 请求拦截器配置

**文件清单**:
- [ ] `/apps/mini-client/src/services/points.ts`
- [ ] `/apps/mini-client/src/services/pointsProduct.ts`
- [ ] `/apps/mini-client/src/services/pointsOrder.ts`

---

### 阶段四：联调测试 (2-3 天)

#### 任务 4.1：接口联调 (1 天)
- [ ] 管理端所有接口联调
- [ ] 小程序端所有接口联调
- [ ] 接口性能测试
- [ ] 接口错误处理验证
- [ ] 边界条件测试

#### 任务 4.2：功能测试 (1 天)
**管理端测试**:
- [ ] 商品 CRUD 功能测试
- [ ] 订单管理流程测试
- [ ] 发货流程测试
- [ ] 任务管理测试

**小程序端测试**:
- [ ] 商品浏览和兑换流程
- [ ] 订单创建和状态流转
- [ ] 签到功能测试
- [ ] 任务完成流程
- [ ] 积分记录准确性

#### 任务 4.3：兼容性测试 (0.5 天)
- [ ] 管理端浏览器兼容性（Chrome、Firefox、Safari）
- [ ] 小程序端机型兼容性（iOS、Android）
- [ ] 屏幕适配测试

#### 任务 4.4：性能测试 (0.5 天)
- [ ] 页面加载速度测试
- [ ] 接口响应时间测试
- [ ] 并发下单测试
- [ ] 内存泄漏检测

---

### 阶段五：部署上线 (0.5 天)

#### 任务 5.1：服务端部署
- [ ] 数据库迁移执行
- [ ] 服务端代码部署
- [ ] Redis 缓存配置
- [ ] 环境变量配置
- [ ] 日志监控配置

#### 任务 5.2：管理端部署
- [ ] Next.js 构建
- [ ] Vercel 部署
- [ ] 域名配置
- [ ] HTTPS 证书配置

#### 任务 5.3：小程序端部署
- [ ] 小程序代码上传
- [ ] 提交审核
- [ ] 版本发布

---

## 任务优先级

### P0 - 核心功能（必须完成）
1. 任务 2.2：管理端 - 商品管理页
2. 任务 2.3：管理端 - 订单管理页
3. 任务 3.1：小程序 - 商城首页
4. 任务 3.2：小程序 - 商品详情页
5. 任务 3.3：小程序 - 确认订单页
6. 任务 3.4：小程序 - 我的订单页

### P1 - 重要功能
1. 任务 2.1：管理端 - 积分概览页
2. 任务 3.6：小程序 - 签到页
3. 任务 3.7：小程序 - 任务中心
4. 任务 3.8：小程序 - 积分记录页
5. 任务 2.4：管理端 - 任务管理页

### P2 - 优化功能
1. 任务 3.9：小程序 - 邀请好友页
2. 任务 2.5：管理端 - 分类管理页
3. 任务 1.3：缓存层实现

---

## 进度跟踪

| 阶段 | 预计工时 | 实际工时 | 完成度 | 状态 |
|------|---------|---------|--------|------|
| 阶段一：服务端补充 | 1-2 天 | - | 0% | 未开始 |
| 阶段二：管理端 | 5-7 天 | - | 0% | 未开始 |
| 阶段三：小程序端 | 7-10 天 | - | 0% | 未开始 |
| 阶段四：联调测试 | 2-3 天 | - | 0% | 未开始 |
| 阶段五：部署上线 | 0.5 天 | - | 0% | 未开始 |

---

## 风险清单

1. **技术风险**
   - [ ] 小程序虚拟支付合规性
   - [ ] 并发下单库存超卖
   - [ ] 积分扣减原子性

2. **进度风险**
   - [ ] 小程序审核周期不确定
   - [ ] 第三方服务对接延迟
   - [ ] 需求变更

3. **质量风险**
   - [ ] 测试覆盖率不足
   - [ ] 性能问题未发现
   - [ ] 安全漏洞

---

## 验收标准

### 管理端验收标准
- [ ] 所有页面功能正常
- [ ] 数据展示准确无误
- [ ] 操作流程顺畅
- [ ] 无明显 UI 问题
- [ ] 响应式布局正常

### 小程序端验收标准
- [ ] 所有页面功能正常
- [ ] 兑换流程完整
- [ ] 积分计算准确
- [ ] 适配主流机型
- [ ] 首屏加载 < 2s
- [ ] 通过微信审核

### 服务端验收标准
- [ ] 所有接口响应正常
- [ ] 单元测试覆盖率 > 80%
- [ ] 接口文档完整
- [ ] 并发场景数据一致
- [ ] 监控告警配置完成

---

## 备注

1. 所有任务完成后需要编写技术文档
2. 关键功能需要录制演示视频
3. 代码需要 Code Review 后才能合并
4. 每日站会同步进度和问题
