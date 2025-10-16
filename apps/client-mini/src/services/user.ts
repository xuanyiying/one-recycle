import { post, get, put } from '../utils/request'

// 用户相关 API 服务

// 创建用户
export const createUser = (userData: any) => {
    return post('/account/users', userData)
}

// 获取用户信息
export const getUserInfo = (id: number) => {
    return get(`/account/users/${id}`)
}

// 更新用户信息
export const updateUserInfo = (id: number, userData: any) => {
    return put(`/account/users/${id}`, userData)
}

// // 用户登录（示例）
export const login = (loginData: any) => {
    return post('/account/auth/login', loginData)
}

// 获取用户余额
export const getUserBalance = (userId: number) => {
    return get(`/account/users/${userId}/balance`)
}

// 地址相关 API 服务

// 创建地址
export const createAddress = (addressData: any) => {
    return post('/account/addresses', addressData)
}

// 获取用户地址列表
export const getUserAddresses = (userId: number) => {
    return get(`/account/addresses/user/${userId}`)
}

// 更新地址
export const updateAddress = (id: number, addressData: any) => {
    return put(`/account/addresses/${id}`, addressData)
}

// 删除地址
export const deleteAddress = (id: number) => {
    return put(`/account/addresses/${id}/delete`)
}