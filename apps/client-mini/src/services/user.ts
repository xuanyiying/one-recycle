import { post, get, put } from '@/utils/request'
import { User } from '@/types'

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
