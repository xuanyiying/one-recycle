import { post, get, put } from '../utils/request'

// 用户相关 API 服务

// 创建用户
export const createUser = (userData: any) => {
    return post('/account/users', userData)
}

// 获取用户信息 (通过ID)
export const getUserById = (id: number) => {
    return get(`/account/users/${id}`)
}

// 更新用户信息
export const updateUserInfo = (id: number, userData: any) => {
    return put(`/account/users/${id}`, userData)
}
// 获取用户余额
export const getUserBalance = (userId: number) => {
    return get(`/account/users/${userId}/balance`)
}
