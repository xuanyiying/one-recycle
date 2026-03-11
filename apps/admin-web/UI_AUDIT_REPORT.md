# UI 设计审计报告 (UI Design Audit Report)

**项目名称**: One Recycle Admin Web
**审计日期**: 2026-02-01
**审计范围**: `/Users/yiying/dev-app/one-recycle/apps/admin-web/`

## 1. 总体评价
当前界面基于 Tailwind CSS 和 shadcn/ui 构建，具备现代 Web 应用的基础框架。整体风格偏向实用主义，但缺乏统一的设计语言和细腻的交互体验。主要问题集中在视觉一致性缺失、移动端适配不完善以及部分组件的硬编码样式。

## 2. 详细问题清单

### 2.1 视觉一致性 (Visual Consistency)
| 严重程度 | 问题描述 | 截图/代码引用 | 建议方案 |
| :--- | :--- | :--- | :--- |
| **High** | **颜色系统分裂**：Tailwind 配置定义了一套颜色 (`primary-500` 等)，但 `globals.css` 中保留了 Next.js 默认变量，且 shadcn/ui 组件未完全适配这套颜色系统，导致混用。 | `tailwind.config.js` vs `globals.css` | 统一使用 CSS Variables 定义语义化颜色 (如 `--primary`, `--muted`)，并在 Tailwind 中引用。 |
| **Medium** | **状态样式不统一**：`Badge` 组件在不同页面使用了不同的颜色类（如 `bg-info-500`），未通过 variant 统一管理。 | `src/app/(dashboard)/dashboard/page.tsx` | 扩展 `Badge` 组件的 variants，增加 `success`, `warning`, `info` 等状态，禁止直接使用 utility classes 修改颜色。 |
| **Low** | **阴影与圆角不一致**：部分卡片使用了 `shadow-lg`，部分使用了 `shadow-sm`，缺乏统一的层级规范。 | `src/app/(auth)/login/page.tsx` | 定义全局的 `card` 样式类或组件，统一阴影和圆角。 |

### 2.2 交互体验 (Interaction & UX)
| 严重程度 | 问题描述 | 截图/代码引用 | 建议方案 |
| :--- | :--- | :--- | :--- |
| **Medium** | **加载状态粗糙**：页面加载时经常出现全屏 Loading 或简单的骨架屏，缺乏局部加载反馈（如表格搜索时仅表格区域加载）。 | `DashboardPage`, `OrdersPage` | 引入 `React Suspense` 和更细粒度的 Skeleton 组件。 |
| **Low** | **表单反馈不足**：登录页验证码发送仅有 Toast 提示，倒计时逻辑在组件内部，刷新后会丢失。 | `src/app/(auth)/login/page.tsx` | 优化倒计时逻辑（即使刷新也能保持），增强输入框的验证状态样式。 |

### 2.3 信息架构 (Information Architecture)
| 严重程度 | 问题描述 | 截图/代码引用 | 建议方案 |
| :--- | :--- | :--- | :--- |
| **High** | **导航结构扁平**：侧边栏菜单项平铺，缺乏分组，随着功能增加会变得难以查找。 | `src/components/Sidebar.tsx` | 引入侧边栏分组（如“业务管理”、“系统设置”），并支持折叠。 |
| **Medium** | **缺乏面包屑导航**：深层页面（如“系统设置/物流配置”）缺乏明确的路径指引。 | `DashboardLayout` | 在 Header 下方添加自动生成的面包屑导航。 |

### 2.4 可访问性 (Accessibility)
| 严重程度 | 问题描述 | 截图/代码引用 | 建议方案 |
| :--- | :--- | :--- | :--- |
| **High** | **图标按钮缺失标签**：Header 中的通知铃声按钮没有 `aria-label`。 | `src/components/Header.tsx` | 为所有仅包含图标的按钮添加 `aria-label` 或 `sr-only` 文本。 |
| **Medium** | **颜色对比度风险**：部分 `text-secondary-400` 在浅色背景下的对比度可能不足。 | `Sidebar.tsx` | 检查并调整灰色文字的色值，确保符合 WCAG AA 标准。 |

### 2.5 响应式适配 (Responsive Design)
| 严重程度 | 问题描述 | 截图/代码引用 | 建议方案 |
| :--- | :--- | :--- | :--- |
| **Critical** | **移动端侧边栏缺失**：`Sidebar` 固定宽度且无隐藏逻辑，在移动端会挤压内容或导致布局错乱。 | `src/app/(dashboard)/layout.tsx` | 实现移动端抽屉式导航 (Sheet/Drawer)，在小屏幕下隐藏侧边栏。 |
| **High** | **表格未适配移动端**：表格组件缺乏横向滚动容器。 | `src/app/(dashboard)/orders/page.tsx` | 为表格添加 `overflow-x-auto` 容器，或设计移动端专用的卡片视图。 |

## 3. 优化路线图
1.  **Phase 1 (基础重构)**: 统一 Design Token，修复 Tailwind 配置，重构 Layout 以支持响应式。
2.  **Phase 2 (组件升级)**: 封装通用业务组件（StatusBadge, DataTable），统一交互规范。
3.  **Phase 3 (体验打磨)**: 添加动效，优化加载体验，完善可访问性。
