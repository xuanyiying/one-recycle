# Tasks

- [x] Task 1: 统一设计令牌系统
  - [x] SubTask 1.1: 清理 `variables.scss`，移除冗余变量，统一命名规范
  - [x] SubTask 1.2: 统一色彩系统，确保所有页面使用相同的颜色变量
  - [x] SubTask 1.3: 统一字体系统，规范字体大小和字重使用
  - [x] SubTask 1.4: 统一间距和圆角系统，建立 8rpx 基数的阶梯
  - [x] SubTask 1.5: 统一阴影系统，定义三级阴影规范

- [x] Task 2: 清理全局样式冗余
  - [x] SubTask 2.1: 清理 `global.scss` 中未使用的 `.ios-*` 工具类
  - [x] SubTask 2.2: 移除深色模式媒体查询 `@media (prefers-color-scheme: dark)`
  - [x] SubTask 2.3: 整合 iOS 颜色变量到统一变量系统
  - [x] SubTask 2.4: 确保 mixins 不重复定义

- [x] Task 3: 首页视觉重构
  - [x] SubTask 3.1: 优化顶部导航栏背景渐变和定位药丸样式
  - [x] SubTask 3.2: 重构核心操作区分类卡片布局和悬停效果
  - [x] SubTask 3.3: 优化分类 Tab 栏图标尺寸和热门标签样式
  - [x] SubTask 3.4: 统一功能栏图标容器和文字样式
  - [x] SubTask 3.5: 优化问答区域和简讯区域的卡片样式

- [x] Task 4: 订单页面视觉优化
  - [x] SubTask 4.1: 统一订单卡片圆角、阴影和状态标签样式
  - [x] SubTask 4.2: 优化 Tab 导航为分段控制器风格
  - [x] SubTask 4.3: 统一订单号字体和颜色
  - [x] SubTask 4.4: 优化空状态和加载状态样式

- [x] Task 5: 个人中心视觉优化
  - [x] SubTask 5.1: 优化用户头部背景渐变和装饰光晕
  - [x] SubTask 5.2: 统计区数字字体和布局
  - [x] SubTask 5.3: 优化菜单图标尺寸和背景渐变
  - [x] SubTask 5.4: 统一菜单分组卡片样式

- [x] Task 6: 组件统一与优化
  - [x] SubTask 6.1: 统一 `CategoryCard` 和 `RecycleCard` 样式
  - [x] SubTask 6.2: 统一按钮组件样式规范
  - [x] SubTask 6.3: 统一空状态组件样式
  - [x] SubTask 6.4: 统一加载和骨架屏样式

- [x] Task 7: 验证与测试
  - [x] SubTask 7.1: 运行 TypeScript 类型检查 ✅ 通过
  - [x] SubTask 7.2: 运行 ESLint 检查 ✅ 通过（已自动修复）
  - [x] SubTask 7.3: 在开发者工具中预览各页面效果 ⚠️ 需手动验证
  - [x] SubTask 7.4: 检查各页面是否存在样式回归 ⚠️ 需手动验证

# Task Dependencies

- Task 2 依赖 Task 1（先统一变量再清理冗余）✅
- Task 3、4、5 依赖 Task 1 和 Task 2（基于统一的设计令牌进行页面优化）✅
- Task 6 依赖 Task 1 和 Task 2（组件样式基于统一变量）✅
- Task 7 依赖所有前置任务完成后进行验证 ✅
