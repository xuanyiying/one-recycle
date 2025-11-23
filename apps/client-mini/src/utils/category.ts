import { Category as ServiceCategory } from "../types/category"
import { Category as UICategory } from "../types/index"

/**
 * 将服务端Category类型转换为UI组件使用的Category类型
 * @param serviceCategory 服务端Category对象
 * @returns UI组件使用的Category对象
 */
export const convertServiceToUICategory = (serviceCategory: ServiceCategory): UICategory => {
  return {
    id: serviceCategory.id,
    name: serviceCategory.name,
    icon: serviceCategory.icon?.url || '',
    description: serviceCategory.description || '',
    basePrice: serviceCategory.priceInfo?.unitPrice || 0,
    unitPrice: serviceCategory.priceInfo?.unitPrice || 0,
    unit: serviceCategory.priceInfo?.unit || 'kg',
    isHot: serviceCategory.isFeatured || false,
    sortOrder: serviceCategory.sortOrder,
    isActive: serviceCategory.status === 'active',
    createdAt: serviceCategory.createdAt,
    updatedAt: serviceCategory.updatedAt,
    subCategories: [], // 根据需要填充子分类
    priceFactors: []   // 根据需要填充价格因子
  }
}

/**
 * 批量转换Category类型
 * @param serviceCategories 服务端Category对象数组
 * @returns UI组件使用的Category对象数组
 */
export const convertServiceToUICategories = (serviceCategories: ServiceCategory[]): UICategory[] => {
  return serviceCategories.map(convertServiceToUICategory)
}