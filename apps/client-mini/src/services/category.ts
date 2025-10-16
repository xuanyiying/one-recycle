import { get } from '../utils/request'
import { Category, CategoryRaw, transformCategories, transformCategory } from '../types/category'

// 分类相关 API 服务

// 获取所有启用的分类
export const getActiveCategories = async (): Promise<Category[]> => {
    try {
        const rawCategories: CategoryRaw[] = await get('/category/categories/active')
        return transformCategories(rawCategories)
    } catch (error) {
        console.error('获取活跃分类失败:', error)
        throw error
    }
}

// 获取所有分类
export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const rawCategories: CategoryRaw[] = await get('/category/categories')
        return transformCategories(rawCategories)
    } catch (error) {
        console.error('获取所有分类失败:', error)
        throw error
    }
}

// 获取分类详情
export const getCategoryDetail = async (id: string): Promise<Category> => {
    try {
        const rawCategory: CategoryRaw = await get(`/category/categories/${id}`)
        return transformCategory(rawCategory)
    } catch (error) {
        console.error('获取分类详情失败:', error)
        throw error
    }
}