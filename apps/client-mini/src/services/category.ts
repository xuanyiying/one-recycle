import { get } from '../utils/request'
import { 
  Category, 
  transformCategories, 
  transformCategory,
  CategoryType
} from '../types/category'

// 分类相关 API 服务

// 获取所有启用的分类
export const getActiveCategories = async (): Promise<Category[]> => {
    try {
        const resp = await get('/category/categories/active')
        return transformCategories(resp.data)
    } catch (error) {
        console.error('获取活跃分类失败:', error)
        throw error
    }
}

// 获取所有分类
export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const resp = await get('/category/categories')
        return transformCategories(resp.data)
    } catch (error) {
        console.error('获取所有分类失败:', error)
        throw error
    }
}

// 获取分类详情
export const getCategoryDetail = async (id: string): Promise<Category> => {
    try {
        const rawCategory = await get(`/category/categories/${id}`)
        return transformCategory(rawCategory.data)
    } catch (error) {
        console.error('获取分类详情失败:', error)
        throw error
    }
}

// 根据分类类型获取分类
export const getCategoriesByType = async (type: CategoryType): Promise<Category[]> => {
    try {
        const resp = await get(`/category/categories/type/${type}`)
        return transformCategories(resp.data)
    } catch (error) {
        console.error('根据类型获取分类失败:', error)
        throw error
    }
}

// 获取推荐分类
export const getFeaturedCategories = async (): Promise<Category[]> => {
    try {
        const resp = await get('/category/categories/featured')
        return transformCategories(resp.data)
    } catch (error) {
        console.error('获取推荐分类失败:', error)
        throw error
    }
}