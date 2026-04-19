import { ApiResponse, QAItem, NewsBrief } from '@/types'
import { get } from '@/utils/request'

// 系统相关 API 服务


// 获取问答列表
export const getQAList = (): Promise<ApiResponse<QAItem[]>> => {
    return get('/system/qa', undefined, { cache: true, cacheTTL: 10 * 60 * 1000 })
}

// 获取回收规则列表
export const getRecycleRules = (): Promise<ApiResponse<RecycleRuleItem[]>> => {
    return get('/content-config/recycle-rules', undefined, { cache: true, cacheTTL: 10 * 60 * 1000 })
}

// 回收规则项类型
export interface RecycleRuleItem {
    id: number
    category: RecycleRuleCategory
    title: string
    content: string
    icon?: string
    sortOrder: number
    extra?: {
        tags?: string[]
        tagType?: 'success' | 'error'
    }
}

// 回收规则分类枚举
export type RecycleRuleCategory = 
    | 'SERVICE_TYPE'    // 服务类型
    | 'SERVICE_SCOPE'   // 服务范围
    | 'PROCESS'         // 操作流程
    | 'STANDARD'        // 回收标准
    | 'POINTS_RULE'     // 积分规则
    | 'NOTICE'          // 注意事项

// 获取简讯
export const getNewsBriefs = (): Promise<ApiResponse<NewsBrief[]>> => {
    return get('/system/news-briefs', undefined, { cache: true, cacheTTL: 5 * 60 * 1000 })
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
