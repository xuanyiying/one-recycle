import { get } from '../utils/request'
import { ApiResponse, QAItem, NewsBrief } from '@/types'

// 系统相关 API 服务


// 获取问答列表
export const getQAList = (): Promise<ApiResponse<QAItem[]>> => {
    return get('/system/qa')
}

// 获取简讯
export const getNewsBriefs = (): Promise<ApiResponse<NewsBrief[]>> => {
    return get('/system/news-briefs')
}

export interface RankingItem {
    rank: number
    userId: string
    nickname: string
    avatar: string
    score: number
    trend: 'up' | 'down' | 'same'
}

export const getRankings = (type: 'total' | 'week' | 'month', page = 1) => {
    return get<RankingItem[]>('/eco-ranking', { type, page, pageSize: 20 })
}

export const getMyRank = (type: 'total' | 'week' | 'month') => {
    return get<RankingItem>('/eco-ranking/my', { type })
}

// 获取系统配置
export const getSystemConfig = () => {
    return get('/category/config')
}

// 获取城市列表
export const getCities = () => {
    return get('/category/cities')
}