import { get } from '../utils/request'
import { ApiResponse, Banner, Article } from '@/types'

// 系统相关 API 服务

// 获取轮播图
export const getBanners = (): Promise<ApiResponse<Banner[]>> => {
    return get('/system/banners')
}

// 获取文章列表
export const getArticles = (): Promise<ApiResponse<Article[]>> => {
    return get('/system/articles')
}

// 获取系统配置
export const getSystemConfig = () => {
    return get('/category/config')
}

// 获取城市列表
export const getCities = () => {
    return get('/category/cities')
}