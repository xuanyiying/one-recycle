import { User } from '@/types'
import { logger } from '@/utils/logger'
import { get, post, put, upload } from '@/utils/request'

// 用户相关 API 服务

// 创建用户
export const createUser = (userData: Partial<User>) => {
    return post('/users', userData)
}

// 获取用户信息 (通过ID)
export const getUserById = (id: number | string) => {
    return get(`/users/${id}`)
}

// 更新用户信息
export const updateUserInfo = (id: number | string, userData: Partial<User>) => {
    return put(`/users/${id}`, userData)
}

// 获取用户余额
export const getUserBalance = (userId: number | string) => {
    return get(`/users/${userId}/balance`)
}

// 上传头像
export const uploadAvatar = async (filePath: string, _userId: number | string) => {
    try {
        const result = await upload('/api/storage/upload', filePath, {
            fileType: 'IMAGE',
            category: 'AVATAR'
        })
        return result
    } catch (error) {
        logger.error('上传头像失败:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : '上传失败'
        }
    }
}
