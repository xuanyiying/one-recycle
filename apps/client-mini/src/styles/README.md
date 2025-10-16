# 移动端样式规范

本文档定义了项目中统一的移动端样式规范，确保所有页面在字体、圆角、边距等方面保持一致性。

## 📱 字体规范

### 字体家族
- **主字体**: `$font-family-primary` - 适用于所有文本内容
- **数字字体**: `$font-family-number` - 适用于价格、数量等数字显示

### 字体大小
| 变量名 | 大小 | 用途 | CSS类 |
|--------|------|------|-------|
| `$font-size-xs` | 20rpx | 辅助信息、标签 | `.text-xs` |
| `$font-size-sm` | 24rpx | 次要文本、说明文字 | `.text-sm` |
| `$font-size-base` | 28rpx | 正文、基础文本 | `.text-base` |
| `$font-size-md` | 30rpx | 重要文本 | `.text-md` |
| `$font-size-lg` | 32rpx | 小标题、按钮文字 | `.text-lg` |
| `$font-size-xl` | 36rpx | 标题、重要信息 | `.text-xl` |
| `$font-size-xxl` | 40rpx | 大标题 | `.text-xxl` |
| `$font-size-title` | 48rpx | 页面主标题 | `.text-title` |
| `$font-size-display` | 56rpx | 展示型大字 | `.text-display` |

### 字体权重
| 变量名 | 权重 | 用途 | CSS类 |
|--------|------|------|-------|
| `$font-weight-light` | 300 | 轻量文本 | `.font-light` |
| `$font-weight-normal` | 400 | 正常文本 | `.font-normal` |
| `$font-weight-medium` | 500 | 中等强调 | `.font-medium` |
| `$font-weight-semibold` | 600 | 半粗体 | `.font-semibold` |
| `$font-weight-bold` | 700 | 粗体强调 | `.font-bold` |

### 行高
| 变量名 | 值 | 用途 | CSS类 |
|--------|------|------|-------|
| `$line-height-tight` | 1.2 | 紧凑布局 | `.leading-tight` |
| `$line-height-normal` | 1.4 | 标准行高 | `.leading-normal` |
| `$line-height-relaxed` | 1.6 | 舒适阅读 | `.leading-relaxed` |
| `$line-height-loose` | 1.8 | 宽松布局 | `.leading-loose` |

## 🔄 圆角规范

### 基础圆角（4rpx为基准单位）
| 变量名 | 大小 | 用途 | CSS类 |
|--------|------|------|-------|
| `$border-radius-none` | 0 | 无圆角 | `.rounded-none` |
| `$border-radius-xs` | 4rpx | 小按钮、标签 | `.rounded-xs` |
| `$border-radius-sm` | 8rpx | 输入框、小卡片 | `.rounded-sm` |
| `$border-radius-base` | 12rpx | 按钮、卡片 | `.rounded` |
| `$border-radius-md` | 16rpx | 大卡片 | `.rounded-md` |
| `$border-radius-lg` | 20rpx | 弹窗、面板 | `.rounded-lg` |
| `$border-radius-xl` | 24rpx | 特殊组件 | `.rounded-xl` |
| `$border-radius-xxl` | 32rpx | 装饰性元素 | `.rounded-xxl` |
| `$border-radius-round` | 50% | 头像、图标 | `.rounded-full` |
| `$border-radius-pill` | 999rpx | 标签、徽章 | `.rounded-pill` |

## 📏 间距规范

### 基础间距（8rpx为基准单位）
| 变量名 | 大小 | 用途 |
|--------|------|------|
| `$spacing-xs` | 8rpx | 最小间距 |
| `$spacing-sm` | 16rpx | 小间距 |
| `$spacing-base` | 24rpx | 标准间距 |
| `$spacing-md` | 32rpx | 中等间距 |
| `$spacing-lg` | 40rpx | 大间距 |
| `$spacing-xl` | 48rpx | 超大间距 |
| `$spacing-xxl` | 56rpx | 最大间距 |

### 页面级间距
| 变量名 | 大小 | 用途 |
|--------|------|------|
| `$page-padding` | 32rpx | 页面左右内边距 |
| `$section-margin` | 40rpx | 区块间距 |
| `$card-padding` | 32rpx | 卡片内边距 |

### Padding 工具类
```scss
// 全方向
.p-xs, .p-sm, .p-base, .p-md, .p-lg, .p-xl, .p-xxl

// 水平方向
.px-xs, .px-sm, .px-base, .px-md, .px-lg, .px-xl, .px-page

// 垂直方向
.py-xs, .py-sm, .py-base, .py-md, .py-lg, .py-xl

// 单方向
.pt-*, .pb-*, .pl-*, .pr-*
```

### Margin 工具类
```scss
// 全方向
.m-xs, .m-sm, .m-base, .m-md, .m-lg, .m-xl, .m-xxl

// 水平方向
.mx-xs, .mx-sm, .mx-base, .mx-md, .mx-lg, .mx-xl, .mx-auto

// 垂直方向
.my-xs, .my-sm, .my-base, .my-md, .my-lg, .my-xl, .my-section

// 单方向
.mt-*, .mb-*, .ml-*, .mr-*
```

## 🎨 使用示例

### 1. 页面容器
```tsx
<View className="page-container">
  <!-- 页面内容 -->
</View>
```

### 2. 卡片组件
```tsx
<View className="card">
  <Text className="text-lg font-medium">标题</Text>
  <Text className="text-sm text-secondary mt-xs">描述文本</Text>
</View>
```

### 3. 按钮组件
```tsx
<Button className="btn btn-primary btn-lg rounded-md">
  确认提交
</Button>
```

### 4. 文本样式
```tsx
<Text className="text-title font-bold text-primary">主标题</Text>
<Text className="text-base leading-relaxed">正文内容</Text>
<Text className="text-sm text-secondary">辅助信息</Text>
```

### 5. 间距控制
```tsx
<View className="px-page py-lg">
  <View className="mb-base">
    <Text className="text-lg font-medium">区块标题</Text>
  </View>
  <View className="card p-md rounded-lg">
    <!-- 卡片内容 -->
  </View>
</View>
```

## 🔧 最佳实践

### 1. 优先使用工具类
- 优先使用预定义的工具类，避免内联样式
- 保持样式的一致性和可维护性

### 2. 语义化命名
- 使用语义化的CSS类名
- 避免使用具体数值的类名

### 3. 响应式设计
- 考虑不同屏幕尺寸的适配
- 使用相对单位（rpx）而非绝对单位

### 4. 性能优化
- 合理使用样式变量，减少重复代码
- 避免过度嵌套的样式规则

## 📋 迁移指南

### 从旧样式迁移到新规范

1. **字体大小替换**
   ```scss
   // 旧写法
   font-size: 32rpx;
   
   // 新写法
   @extend .text-lg;
   // 或使用变量
   font-size: $font-size-lg;
   ```

2. **圆角替换**
   ```scss
   // 旧写法
   border-radius: 12rpx;
   
   // 新写法
   @extend .rounded;
   // 或使用变量
   border-radius: $border-radius-base;
   ```

3. **间距替换**
   ```scss
   // 旧写法
   padding: 24rpx;
   margin: 16rpx 0;
   
   // 新写法
   @extend .p-base;
   @extend .my-sm;
   ```

## 🚀 开发建议

1. **在新页面中**：直接使用新的样式规范和工具类
2. **在现有页面中**：逐步迁移，优先处理公共组件
3. **团队协作**：确保所有开发者都了解并遵循这套规范
4. **代码审查**：在代码审查中检查样式规范的遵循情况

通过遵循这套移动端样式规范，我们可以确保整个应用的视觉一致性和代码可维护性。