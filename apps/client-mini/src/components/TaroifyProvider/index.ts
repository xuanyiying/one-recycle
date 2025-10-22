/**
 * Taroify 组件统一导入模块
 * 解决 CSS 加载顺序冲突问题
 * 
 * 通过统一的导入顺序，确保所有页面以相同的顺序加载 Taroify 组件样式
 */

// 按照依赖关系排序的 Taroify 组件导入
// 基础组件优先，复合组件其次

// 1. 基础样式和工具组件
export { Button } from '@taroify/core'
export { Tag } from '@taroify/core'
export { Divider } from '@taroify/core'
export { Steps } from '@taroify/core'

// 2. 图标组件 (独立导入)
export {
    Icon,
    ArrowLeft,
    ArrowDown,
    Plus,
    Minus,
    Replay,
    Info
} from '@taroify/icons'

// 3. 预加载所有使用的 Taroify 样式
// 这确保了样式按照正确的顺序加载
import '@taroify/core/button/style'
import '@taroify/core/tag/style'
import '@taroify/core/divider/style'
import '@taroify/core/steps/style'

// 导出可用的类型定义
export type { ButtonProps } from '@taroify/core/button'

// 注意: 其他组件的 Props 类型没有从主模块导出
// 如果需要使用这些类型，可以使用 React.ComponentProps 推断:
// type TagProps = React.ComponentProps<typeof Tag>
// type DividerProps = React.ComponentProps<typeof Divider>
// type StepsProps = React.ComponentProps<typeof Steps>