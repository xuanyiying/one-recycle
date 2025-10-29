/**
 * Category Configuration
 * Centralized category icon and color management
 */

export interface CategoryConfig {
  icon: string
  gradient: string
  color: string
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  '手机数码': {
    icon: 'phone',
    gradient: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
    color: '#007AFF'
  },
  '电脑办公': {
    icon: 'laptop',
    gradient: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
    color: '#007AFF'
  },
  '服装鞋帽': {
    icon: 'shopping-bag',
    gradient: 'linear-gradient(135deg, #FF9500 0%, #FFCC02 100%)',
    color: '#FF9500'
  },
  '美妆护肤': {
    icon: 'star',
    gradient: 'linear-gradient(135deg, #FF9500 0%, #FFCC02 100%)',
    color: '#FF9500'
  },
  '图书音像': {
    icon: 'book',
    gradient: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    color: '#34C759'
  },
  '食品饮料': {
    icon: 'coffee',
    gradient: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    color: '#34C759'
  },
  '家用电器': {
    icon: 'home',
    gradient: 'linear-gradient(135deg, #8E8E93 0%, #AEAEB2 100%)',
    color: '#8E8E93'
  },
  '家居建材': {
    icon: 'settings',
    gradient: 'linear-gradient(135deg, #8E8E93 0%, #AEAEB2 100%)',
    color: '#8E8E93'
  },
  '运动户外': {
    icon: 'heart',
    gradient: 'linear-gradient(135deg, #FF3B30 0%, #FF6961 100%)',
    color: '#FF3B30'
  },
  '汽车用品': {
    icon: 'car',
    gradient: 'linear-gradient(135deg, #FF3B30 0%, #FF6961 100%)',
    color: '#FF3B30'
  },
  '母婴用品': {
    icon: 'gift',
    gradient: 'linear-gradient(135deg, #AF52DE 0%, #BF5AF2 100%)',
    color: '#AF52DE'
  },
  '其他物品': {
    icon: 'folder',
    gradient: 'linear-gradient(135deg, #5AC8FA 0%, #007AFF 100%)',
    color: '#5AC8FA'
  }
}

// Default configuration
export const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  icon: 'folder',
  gradient: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
  color: '#007AFF'
}

/**
 * Get category icon name
 */
export function getCategoryIcon(categoryName: string): string {
  return CATEGORY_CONFIGS[categoryName]?.icon || DEFAULT_CATEGORY_CONFIG.icon
}

/**
 * Get category gradient background
 */
export function getCategoryGradient(categoryName: string): string {
  return CATEGORY_CONFIGS[categoryName]?.gradient || DEFAULT_CATEGORY_CONFIG.gradient
}

/**
 * Get category primary color
 */
export function getCategoryColor(categoryName: string): string {
  return CATEGORY_CONFIGS[categoryName]?.color || DEFAULT_CATEGORY_CONFIG.color
}
