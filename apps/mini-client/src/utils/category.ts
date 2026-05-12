import { Category as ServiceCategory } from "../types/category"

export interface UICategoryExtra {
  icon?: string
  basePrice: number
  unitPrice: number
  unit: string
  isHot: boolean
  subCategories?: Array<{ id: number; name: string; basePrice: number }>
  priceFactors: Array<{ name: string; weight: number }>
}

export type UICategory = ServiceCategory & UICategoryExtra

export const convertServiceToUICategory = (serviceCategory: ServiceCategory): UICategory => {
  return {
    ...serviceCategory,
    icon: serviceCategory.icon?.url || '' as any,
    description: serviceCategory.description || '',
    basePrice: serviceCategory.priceInfo?.unitPrice || 0,
    unitPrice: serviceCategory.priceInfo?.unitPrice || 0,
    unit: serviceCategory.priceInfo?.unit || 'kg',
    isHot: serviceCategory.isFeatured || false,
    sortOrder: serviceCategory.sortOrder,
    createdAt: serviceCategory.createdAt,
    updatedAt: serviceCategory.updatedAt,
    subCategories: serviceCategory.children ? serviceCategory.children.map(child => ({
      id: child.id,
      name: child.name,
      basePrice: child.priceInfo?.unitPrice || 0
    })) : [],
    priceFactors: []
  }
}

export const convertServiceToUICategories = (serviceCategories: ServiceCategory[]): UICategory[] => {
  return serviceCategories.map(convertServiceToUICategory)
}
