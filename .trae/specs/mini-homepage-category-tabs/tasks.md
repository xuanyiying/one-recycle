# Tasks

- [ ] Task 1: 小程序首页获取并展示主推分类
  - [ ] SubTask 1.1: 在 index.tsx 中添加获取主推分类的 API 调用
  - [ ] SubTask 1.2: 创建动态分类卡片组件或复用 RecycleCard
  - [ ] SubTask 1.3: 根据主推分类数据渲染卡片（支持横向滚动或网格布局）
  - [ ] SubTask 1.4: 处理无主推分类时的默认展示（旧书、旧衣兜底）
  - [ ] SubTask 1.5: 点击分类卡片跳转预约页面并传递 categoryId

- [ ] Task 2: 添加分类Tab导航栏
  - [ ] SubTask 2.1: 在首页添加分类Tab栏UI（横向滚动）
  - [ ] SubTask 2.2: 获取所有启用分类数据
  - [ ] SubTask 2.3: 渲染分类Tab项（图标+名称）
  - [ ] SubTask 2.4: 点击Tab跳转预约页面并传递 categoryId
  - [ ] SubTask 2.5: 添加Tab激活状态样式

- [ ] Task 3: 样式调整
  - [ ] SubTask 3.1: 调整核心操作区样式适应动态分类
  - [ ] SubTask 3.2: 添加分类Tab栏样式（横向滚动、圆角、阴影等）
  - [ ] SubTask 3.3: 确保整体UI协调美观

- [ ] Task 4: 类型定义和代码优化
  - [ ] SubTask 4.1: 确认 Category 类型定义完整
  - [ ] SubTask 4.2: 优化加载状态处理
  - [ ] SubTask 4.3: 添加错误处理

# Task Dependencies
- Task 2 依赖 Task 1 的部分逻辑（跳转预约页面）
- Task 3 依赖 Task 1 和 Task 2 的UI结构确定
- Task 4 在所有功能完成后进行优化
